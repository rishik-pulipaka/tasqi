from flask import Flask, jsonify, request
from valhalla import get_route

app = Flask(__name__)

@app.route('/api/ping')
def ping():
    return jsonify({'ok': True})

@app.route('/api/route-eta', methods=['POST'])
def route_eta():
    data = request.get_json(silent=True) or {}
    try:
        origin = (float(data['origin_lat']), float(data['origin_lng']))
        dest = (float(data['dest_lat']), float(data['dest_lng']))
    except (KeyError, TypeError, ValueError):
        return jsonify({'error': 'origin_lat, origin_lng, dest_lat, dest_lng required'}), 400
    try:
        route = get_route(origin, dest, costing=data.get('costing', 'auto'))
    except Exception as exc:
        return jsonify({'error': 'No route (outside map coverage?): ' + str(exc)}), 503
    return jsonify({
        'distance_miles': round(route['distance_miles'], 2),
        'eta_minutes': round(route['time_minutes'], 1),
        'shape': route['shape'],
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # 0.0.0.0 so local host can be reached by my phone.