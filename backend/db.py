import os
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor

load_dotenv(Path(__file__).resolve().parent / '.env')

PG_CONFIG = {
    'host': os.getenv('PG_HOST', '192.168.1.199'),
    'port': int(os.getenv('PG_PORT', '5432')),
    'user': os.getenv('PG_USER', 'ems'),
    'password': os.getenv('PG_PASSWORD', ''),
    'database': os.getenv('PG_DATABASE', 'vpp'),
}

VALUE_COLUMN = os.getenv('PG_VALUE_COLUMN', '')
TIME_COLUMN = os.getenv('PG_TIME_COLUMN', '')

VALUE_CANDIDATES = ['value', 'point_value', 'val', 'data_value', 'numeric_value']
TIME_CANDIDATES = [
    'updated_at',
    'sample_time',
    'ts',
    'recorded_at',
    'update_time',
    'timestamp',
    'time',
    'created_at',
]


@contextmanager
def get_connection():
    conn = psycopg2.connect(**PG_CONFIG, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()


def _load_column_map(cur):
    cur.execute(
        """
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'vpp_realtime'
        """
    )
    rows = cur.fetchall()
    column_map = {}
    type_map = {}
    for row in rows:
        name = str(row['column_name'])
        column_map[name.lower()] = name
        type_map[name.lower()] = str(row['data_type']).lower()
    return column_map, type_map


def _resolve_column(column_map, configured, candidates):
    if configured and configured.lower() in column_map:
        return column_map[configured.lower()]
    for name in candidates:
        if name.lower() in column_map:
            return column_map[name.lower()]
    return None


def _value_sql(value_col, value_type):
    """jsonb 欄位轉成可排序的數值文字，其餘欄位維持原樣。"""
    if value_type == 'jsonb':
        return f"({value_col} #>> '{{}}')"
    return value_col


def fetch_latest_point(site_id, device_id, point_id):
    """查詢 vpp_realtime 最新一筆點位資料。"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            column_map, type_map = _load_column_map(cur)
            if not column_map:
                raise RuntimeError('找不到資料表 vpp_realtime 或無法讀取欄位')

            value_col = _resolve_column(column_map, VALUE_COLUMN, VALUE_CANDIDATES)
            time_col = _resolve_column(column_map, TIME_COLUMN, TIME_CANDIDATES)
            decoded_status_col = column_map.get('decoded_status')

            if not value_col:
                raise RuntimeError(
                    f'找不到數值欄位，可用欄位：{", ".join(sorted(column_map.values()))}'
                )
            if not time_col:
                raise RuntimeError(
                    f'找不到時間欄位，可用欄位：{", ".join(sorted(column_map.values()))}'
                )

            value_expr = _value_sql(value_col, type_map.get(value_col.lower(), ''))

            query = f"""
                SELECT
                    site_id,
                    device_id,
                    point_id,
                    {value_expr} AS point_value,
                    {decoded_status_col if decoded_status_col else 'NULL'} AS decoded_status,
                    {time_col} AS recorded_at,
                    quality
                FROM vpp_realtime
                WHERE site_id = %s
                  AND device_id = %s
                  AND point_id = %s
                ORDER BY {time_col} DESC NULLS LAST
                LIMIT 1
            """
            cur.execute(query, (site_id, device_id, point_id))
            row = cur.fetchone()
            if not row:
                return None
            return dict(row)


ONLINE_WINDOW_SEC = 120


def fetch_site_statuses():
    """案場連線、資料延遲、最後上線與目前警報。"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    s.site_id,
                    s.site_name,
                    h.connector_status,
                    h.data_delay_sec,
                    h.received_at,
                    h.edge_time,
                    COALESCE(a.critical_count, 0)::int AS critical_count,
                    COALESCE(a.warning_count, 0)::int AS warning_count,
                    COALESCE(a.info_count, 0)::int AS info_count
                FROM vpp_site s
                LEFT JOIN LATERAL (
                    SELECT connector_status, data_delay_sec, received_at, edge_time
                    FROM vpp_site_heartbeat
                    WHERE site_id = s.site_id
                    ORDER BY received_at DESC NULLS LAST
                    LIMIT 1
                ) h ON TRUE
                LEFT JOIN LATERAL (
                    SELECT
                        COUNT(*) FILTER (WHERE severity = 'critical') AS critical_count,
                        COUNT(*) FILTER (WHERE severity = 'warning') AS warning_count,
                        COUNT(*) FILTER (WHERE severity = 'info') AS info_count
                    FROM vpp_alarm_active
                    WHERE site_id = s.site_id
                ) a ON TRUE
                WHERE s.deleted_at IS NULL
                ORDER BY s.site_id
                """
            )
            rows = [dict(row) for row in cur.fetchall()]

    now = datetime.now(timezone.utc)
    statuses = []
    for row in rows:
        last_seen = row.get('received_at') or row.get('edge_time')
        age_sec = None
        if last_seen is not None:
            if last_seen.tzinfo is None:
                last_seen = last_seen.replace(tzinfo=timezone.utc)
            age_sec = (now - last_seen).total_seconds()
        has_heartbeat = (
            row.get('connector_status') is not None
            or last_seen is not None
            or row.get('data_delay_sec') is not None
        )
        fresh = age_sec is not None and 0 <= age_sec <= ONLINE_WINDOW_SEC
        critical = int(row.get('critical_count') or 0)
        warning = int(row.get('warning_count') or 0)
        info = int(row.get('info_count') or 0)
        statuses.append({
            'site_id': row.get('site_id'),
            'site_name': row.get('site_name'),
            'online': fresh and row.get('connector_status') != 'offline',
            'data_delay_sec': row.get('data_delay_sec') if has_heartbeat else None,
            'last_seen_at': last_seen.isoformat() if last_seen is not None else None,
            'alarms': {
                'total': critical + warning + info,
                'critical': critical,
                'warning': warning,
                'info': info,
            },
        })
    return statuses


ROLLUP_NAME = 'mpm_1'
BUCKET_INTERVALS = {'1 minute', '15 minutes', '1 hour', '1 day'}
MAX_ROLLUP_HOURS = {
    '1 minute': 48,
    '15 minutes': 24 * 31,
    '1 hour': 24 * 90,
    '1 day': 24 * 400,
}


def _round_metric(value, digits=4):
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return round(number, digits)


def fetch_energy_rollup(site_id, bucket_interval='15 minutes', hours=24):
    """讀取 vpp_energy_rollup 的歷史功率與電量。"""
    if bucket_interval not in BUCKET_INTERVALS:
        raise ValueError('不支援的時間粒度')

    try:
        requested = int(hours)
    except (TypeError, ValueError):
        requested = 24
    span_hours = min(MAX_ROLLUP_HOURS[bucket_interval], max(1, requested))

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    bucket_time,
                    avg_power_kw,
                    import_energy_kwh,
                    export_energy_kwh,
                    import_energy_total_kwh,
                    export_energy_total_kwh,
                    soc,
                    soc_kwh,
                    sample_count
                FROM vpp_energy_rollup
                WHERE site_id = %s
                  AND rollup_name = %s
                  AND bucket_interval = %s
                  AND bucket_time >= NOW() - (%s * INTERVAL '1 hour')
                ORDER BY bucket_time ASC
                """,
                (site_id, ROLLUP_NAME, bucket_interval, span_hours),
            )
            rows = [dict(row) for row in cur.fetchall()]

    points = []
    for row in rows:
        bucket_time = row.get('bucket_time')
        if isinstance(bucket_time, datetime):
            bucket_time = bucket_time.isoformat()
        sample_count = row.get('sample_count')
        points.append({
            'bucket_time': bucket_time,
            'avg_power_kw': _round_metric(row.get('avg_power_kw')),
            'import_energy_kwh': _round_metric(row.get('import_energy_kwh')),
            'export_energy_kwh': _round_metric(row.get('export_energy_kwh')),
            'import_energy_total_kwh': _round_metric(row.get('import_energy_total_kwh'), 3),
            'export_energy_total_kwh': _round_metric(row.get('export_energy_total_kwh'), 3),
            'soc': _round_metric(row.get('soc'), 2),
            'soc_kwh': _round_metric(row.get('soc_kwh'), 3),
            'sample_count': None if sample_count is None else int(sample_count),
        })

    return {
        'site_id': site_id,
        'rollup_name': ROLLUP_NAME,
        'bucket_interval': bucket_interval,
        'hours': span_hours,
        'points': points,
    }
