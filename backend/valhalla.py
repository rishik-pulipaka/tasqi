
import os
import requests

VALHALLA_URL = os.getenv("VALHALLA_URL", "http://localhost:8002")


def _to_valhalla_point(lat: float, lon: float) -> dict:
    return {"lat": lat, "lon": lon}


def get_matrix(
    origin: tuple[float, float],
    destinations: list[tuple[float, float]],
    costing: str = "auto",
    timeout: float = 5.0,
) -> list[dict | None]:
    if not destinations:
        return []

    payload = {
        "sources": [_to_valhalla_point(*origin)],
        "targets": [_to_valhalla_point(lat, lng) for lat, lng in destinations],
        "costing": costing,
        "units": "miles",
    }

    try:
        resp = requests.post(f"{VALHALLA_URL}/sources_to_targets", json=payload, timeout=timeout)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        raise RuntimeError(f"Valhalla matrix request failed: {exc}") from exc

    row = data["sources_to_targets"][0]
    results = []
    for cell in row:
        if cell is None or cell.get("distance") is None:
            results.append(None)
            continue
        results.append({
            "distance_miles": cell["distance"],
            "time_minutes": cell["time"] / 60.0,
        })
    return results


def get_route(
    origin: tuple[float, float],
    destination: tuple[float, float],
    costing: str = "auto",
    timeout: float = 5.0,
) -> dict:
    """

    Returns:
        {
            "distance_miles": float,
            "time_minutes": float,
            "shape": str,  # encoded polyline, precision 6
        }
    """
    payload = {
        "locations": [
            _to_valhalla_point(*origin),
            _to_valhalla_point(*destination),
        ],
        "costing": costing,
        "units": "miles",
    }

    resp = requests.post(f"{VALHALLA_URL}/route", json=payload, timeout=timeout)
    resp.raise_for_status()
    data = resp.json()

    leg = data["trip"]["legs"][0]
    summary = data["trip"]["summary"]

    return {
        "distance_miles": summary["length"],
        "time_minutes": summary["time"] / 60.0,
        "shape": leg["shape"],
    }