import json
import os
from datetime import datetime

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from db import PG_CONFIG, fetch_energy_rollup, fetch_latest_point, fetch_site_statuses

load_dotenv()

app = Flask(__name__)
CORS(app)

JIALI_SITE_ID = 'MG-TNN-002'
BMS1_DEVICE_ID = 'BMS1'
BMS1_VOLTAGE_POINT = 'BMS1_AVG_RACK_VOLTAGE'


def parse_point_value(raw):
    """解析 vpp_realtime.value（可能是 jsonb 純量、字串或物件）。"""
    if raw is None:
        return None, None

    if isinstance(raw, bool):
        return raw, float(raw)

    if isinstance(raw, (int, float)):
        return raw, float(raw)

    if isinstance(raw, str):
        text = raw.strip()
        if not text:
            return None, None
        try:
            parsed = json.loads(text)
            if parsed != raw:
                return parse_point_value(parsed)
        except json.JSONDecodeError:
            pass
        try:
            num = float(text)
            return text, num
        except ValueError:
            return text, None

    if isinstance(raw, dict):
        for key in ('value', 'val', 'v', 'data', 'numeric_value'):
            if key in raw:
                return parse_point_value(raw[key])
        return raw, None

    if isinstance(raw, (list, tuple)) and len(raw) == 1:
        return parse_point_value(raw[0])

    try:
        num = float(raw)
        return raw, num
    except (TypeError, ValueError):
        return raw, None


def serialize_row(row):
    if not row:
        return None
    recorded_at = row.get('recorded_at')
    if isinstance(recorded_at, datetime):
        recorded_at = recorded_at.isoformat()
    value, numeric_value = parse_point_value(row.get('point_value'))
    return {
        'site_id': row.get('site_id'),
        'device_id': row.get('device_id'),
        'point_id': row.get('point_id'),
        'value': value,
        'numeric_value': numeric_value,
        'decoded_status': row.get('decoded_status'),
        'quality': row.get('quality'),
        'unit': 'V',
        'label': '平均電壓',
        'recorded_at': recorded_at,
    }


@app.route('/time')
def get_time():
    return jsonify({'time': datetime.now().isoformat()})


@app.route('/api/vpp/realtime/latest')
def latest_realtime():
    site_id = request.args.get('site_id', JIALI_SITE_ID)
    device_id = request.args.get('device_id', BMS1_DEVICE_ID)
    point_id = request.args.get('point_id', BMS1_VOLTAGE_POINT)

    try:
        row = fetch_latest_point(site_id, device_id, point_id)
    except Exception as exc:
        return jsonify({
            'ok': False,
            'error': str(exc),
            'site_id': site_id,
            'device_id': device_id,
            'point_id': point_id,
        }), 500

    if not row:
        return jsonify({
            'ok': False,
            'error': '查無資料',
            'site_id': site_id,
            'device_id': device_id,
            'point_id': point_id,
        }), 404

    return jsonify({'ok': True, 'data': serialize_row(row)})


@app.route('/api/vpp/jiali/bms1/voltage')
def jiali_bms1_voltage():
    """佳里國中 BMS-1 平均電壓（快捷端點）。"""
    try:
        row = fetch_latest_point(JIALI_SITE_ID, BMS1_DEVICE_ID, BMS1_VOLTAGE_POINT)
    except Exception as exc:
        return jsonify({'ok': False, 'error': str(exc)}), 500

    if not row:
        return jsonify({'ok': False, 'error': '查無 BMS1 電壓資料'}), 404

    return jsonify({
        'ok': True,
        'site_id': JIALI_SITE_ID,
        'site_name': '臺南市佳里國中後港校區',
        'device_id': BMS1_DEVICE_ID,
        'bms_label': 'BMS-1',
        'point_id': BMS1_VOLTAGE_POINT,
        'data': serialize_row(row),
    })


@app.route('/api/vpp/energy/rollup')
def energy_rollup():
    site_id = request.args.get('site_id', JIALI_SITE_ID)
    bucket_interval = request.args.get('bucket_interval', '15 minutes')
    hours = request.args.get('hours', '24')

    if not site_id or not site_id.replace('-', '').replace('_', '').isalnum():
        return jsonify({'ok': False, 'error': 'site_id 格式不正確'}), 400

    try:
        data = fetch_energy_rollup(site_id, bucket_interval, hours)
    except ValueError as exc:
        return jsonify({'ok': False, 'error': str(exc), 'site_id': site_id}), 400
    except Exception as exc:
        return jsonify({'ok': False, 'error': str(exc), 'site_id': site_id}), 500

    return jsonify({'ok': True, **data})


@app.route('/api/vpp/sites/status')
def site_statuses():
    try:
        return jsonify({'ok': True, 'sites': fetch_site_statuses()})
    except Exception as exc:
        return jsonify({'ok': False, 'error': str(exc)}), 500


@app.route('/api/health/db')
def health_db():
    try:
        from db import get_connection
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute('SELECT 1 AS ok')
                cur.fetchone()
        return jsonify({
            'ok': True,
            'database': PG_CONFIG['database'],
            'host': PG_CONFIG['host'],
        })
    except Exception as exc:
        return jsonify({'ok': False, 'error': str(exc)}), 500


if __name__ == '__main__':
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', '5000'))
    debug = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'
    app.run(host=host, port=port, debug=debug)
