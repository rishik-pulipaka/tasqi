import polyline from "@mapbox/polyline";
import type { TaskLocation } from "./taskLocation";

const API = "http://localIP_replace:5000"

export type RouteEta = { miles: number; minutes: number; path: [number, number][] }

export async function getRouteEta(from: TaskLocation, to: TaskLocation): Promise<RouteEta> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  try {
    const res = await fetch(`${API}/api/route-eta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin_lat: from.lat,
        origin_lng: from.lng,
        dest_lat: to.lat,
        dest_lng: to.lng,
      }),
      signal: ctrl.signal,
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
    return {
      miles: json.distance_miles,
      minutes: json.eta_minutes,
      path: polyline.decode(json.shape, 6) as [number, number][],
    }
  } finally {
    clearTimeout(timer)
  }
}