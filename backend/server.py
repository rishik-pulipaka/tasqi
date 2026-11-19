from flask import Flask, jsonify, request
from valhalla import get_route
import os
from datetime import datetime, timedelta, timezone
from canvasapi import Canvas
from canvasapi.exceptions import CanvasException

app = Flask(__name__)

@app.route('/api/ping')
def ping():
    return jsonify({'ok': True})

canvas = Canvas(os.environ['CANVAS_URL'], os.environ['CANVAS_TOKEN'])

@app.route('/api/canvas/assignments')
def canvas_assignments():
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=int(request.args.get('days_back', 7)))
    end = now + timedelta(days=int(request.args.get('days_ahead', 60)))

    try:
        courses = list(canvas.get_courses(enrollment_state='active'))
    except CanvasException as exc:
        return jsonify({'error': str(exc)}), 502

    out = []
    for course in courses:
        label = getattr(course, 'course_code', None) or getattr(course, 'name', 'Course')
        try:
            for a in course.get_assignments(include=['submission']):
                due = getattr(a, 'due_at', None)
                if not due:
                    continue
                due_dt = datetime.fromisoformat(due.replace('Z', '+00:00'))
                if not (start <= due_dt <= end):
                    continue
                sub = getattr(a, 'submission', None) or {}
                out.append({
                    'canvas_id': a.id,
                    'title': f'{label}: {a.name}',
                    'due_at': due,                     
                    'submitted': bool(sub.get('submitted_at')),
                    'url': getattr(a, 'html_url', None),
                })
        except CanvasException:
            continue  # this is because some courses dont allow API acsess according to the canvas API documentation.

    return jsonify({'assignments': out})

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