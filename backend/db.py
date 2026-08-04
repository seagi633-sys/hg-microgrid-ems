import os
from contextlib import contextmanager

import psycopg2
from psycopg2.extras import RealDictCursor

PG_CONFIG = {
    'host': os.getenv('PG_HOST', '192.168.1.17'),
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
