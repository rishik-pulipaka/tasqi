
import * as Location from "expo-location"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { useEffect, useMemo, useRef, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { WebView, type WebViewMessageEvent } from "react-native-webview"
import Button from "../components/Button"
import Text from "../components/Text"
import { useApp } from "../context/AppContext"
import { colors, fonts } from "../theme"
import { getRouteEta } from "../utils/routeETA"
import type { TaskLocation } from "../utils/taskLocation"
import { savePendingLocation } from "../utils/taskLocation"

const FALLBACK: TaskLocation = { lat: 33.9806, lng: -117.3755 }

const buildHtml = (me: TaskLocation | null, center: TaskLocation, pick: boolean, taskColor: string) => `<!DOCTYPE html>
<html><head>
<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'>
<link rel='stylesheet' href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'>
<style>html,body,#map{height:100%;margin:0}</style>
</head><body>
<div id='map'></div>
<script src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'></script>
<script>
var PICK = ${pick};
var ME = ${JSON.stringify(me)};
var map = L.map('map').setView([${center.lat}, ${center.lng}], 15);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function send(o) { window.ReactNativeWebView.postMessage(JSON.stringify(o)); }

// the player
if (ME) {
  L.circleMarker([ME.lat, ME.lng], { radius: 9, color: '#fff', weight: 3, fillColor: '#1a73e8', fillOpacity: 1 }).addTo(map);
}

// pins for active tasks (React Native calls setTaskPins whenever tasks change)
var taskLayer = L.layerGroup().addTo(map);
function setTaskPins(items) {
  taskLayer.clearLayers();
  items.forEach(function (t) {
    var m = L.circleMarker([t.lat, t.lng], { radius: 8, color: '#fff', weight: 2, fillColor: '${taskColor}', fillOpacity: 1 });
    var el = document.createElement('div');
    el.textContent = t.title; // textContent, not HTML: task titles are user input
    m.bindPopup(el);
    m.addTo(taskLayer);
  });
}
function fitAll(items) {
  var pts = items.map(function (t) { return [t.lat, t.lng]; });
  if (ME) { pts.push([ME.lat, ME.lng]); }
  if (pts.length > 1) { map.fitBounds(pts, { padding: [40, 40], maxZoom: 16 }); }
}

// the pin being dropped
var pin = null;
function placePin(ll) {
  if (!pin) {
    pin = L.marker(ll, { draggable: true }).addTo(map);
    pin.on('dragend', function () {
      var p = pin.getLatLng();
      send({ type: 'pin', lat: p.lat, lng: p.lng });
    });
  } else {
    pin.setLatLng(ll);
  }
    
  send({ type: 'pin', lat: ll.lat, lng: ll.lng });
}
var routeLine = null;
function drawRoute(coords) {
        var first = !routeLine;
        if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
        if (!coords || !coords.length) { return; }
        routeLine = L.polyline(coords, { weight: 5 }).addTo(map);
        if (first) { map.fitBounds(routeLine.getBounds(), { padding: [40, 40] }); }
}
if (PICK) { map.on('click', function (e) { placePin(e.latlng); }); }

send({ type: 'ready' });
</script>
</body></html>`

export default function MapUIScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { pick } = useLocalSearchParams<{ pick?: string }>()
  const pickMode = pick === "1"
  const { tasks } = useApp()

  const web = useRef<WebView>(null)
  const fitted = useRef(false)
  const [me, setMe] = useState<TaskLocation | null>(null)
  const [locating, setLocating] = useState(true)
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<TaskLocation | null>(null)
  const [eta, setEta] = useState<{ miles: number; minutes: number } | null>(null)  
  const [etaError, setEtaError] = useState<string | null>(null)                     
  const [etaLoading, setEtaLoading] = useState(false)

  // Active task pins: not done + has a saved location. Marking a task done removes its pin.
  const activePins = useMemo(
    () =>
      tasks
        .filter((t) => !t.done && t.location)
        .map((t) => ({ lat: t.location!.lat, lng: t.location!.lng, title: t.title })),
    [locating, me, pickMode],
  )

  // Get the player's position once. Permission was requested before navigating here,
  // but we ask again so the screen also works if it's opened some other way.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          if (!cancelled) setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        }
      } catch {
        // fall through to the default map area
      }
      if (!cancelled) setLocating(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Build the page once, after we know where to center it. Later changes are injected, not rebuilt.
  const html = useMemo(
    () => (locating ? "" : buildHtml(me, me ?? FALLBACK, pickMode, colors.lavender)),
    [locating],
  )

  // Push task pins into the map whenever they change (and once the page says it's ready).
  useEffect(() => {
    if (!ready) return
    web.current?.injectJavaScript(`setTaskPins(${JSON.stringify(activePins)}); true;`)
    if (!fitted.current) {
      fitted.current = true
      web.current?.injectJavaScript(`fitAll(${JSON.stringify(activePins)}); true;`)
    }
  }, [ready, activePins])
  useEffect(() => {
    if (!pickMode || !me || !selected || !ready) return
        let cancelled = false
        setEtaLoading(true)
        setEtaError(null)
        getRouteEta(me, selected)
            .then((r) => {
            if (cancelled) return
            setEta({ miles: r.miles, minutes: r.minutes })
            web.current?.injectJavaScript(`drawRoute(${JSON.stringify(r.path)}); true;`)
            })
            .catch((e) => {
            if (cancelled) return
            setEta(null)
            setEtaError(e.message)
            web.current?.injectJavaScript(`drawRoute([]); true;`)
            })
            .finally(() => {
            if (!cancelled) setEtaLoading(false)
            })
        return () => {
            cancelled = true
        }
  }, [selected, me, ready, pickMode])

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const m = JSON.parse(e.nativeEvent.data)
      if (m.type === "ready") setReady(true)
      if (m.type === "pin") setSelected({ lat: m.lat, lng: m.lng })
    } catch {
      // ignore malformed messages
    }
  }

  const confirm = async () => {
    if (!selected) return
    await savePendingLocation(selected) // stored asynchronously; Add Task picks it up on focus
    router.back()
  }

  return (
    <View style={styles.root}>
      <View style={styles.mapWrap}>
        {locating ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.lavender} />
          </View>
        ) : (
          <WebView
            ref={web}
            javaScriptEnabled
            onMessage={onMessage}
            originWhitelist={["*"]}
            source={{ html, baseUrl: "https://tasqi.example.com" }}
            style={styles.map}
          />
        )}

        <Pressable
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={[styles.back, { top: insets.top + 8 }]}
        >
          <ChevronLeft color={colors.ink} size={22} />
        </Pressable>
      </View>

      <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
        {pickMode ? (
          <>
            <Text style={styles.sheetTitle}>{selected ? "Pin dropped" : "Drop a pin"}</Text>
            <Text style={styles.sheetText}>
              {selected
                ? `${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)} · drag the pin to adjust`
                : "Tap the map where this task happens."}
            </Text>
            {pickMode && selected && me && (
                <Text style={[styles.sheetText, { marginTop: 4 }]}>
                    {etaLoading
                    ? "Calculating route…"
                    : eta
                        ? `${eta.miles} mi · ${Math.round(eta.minutes)} min drive`
                        : (etaError ?? "")}
                </Text>
            )}
            <Button disabled={!selected} label="Use this location" onPress={confirm} style={{ marginTop: 12 }} />
          </>
        ) : (
          <>
            <Text style={styles.sheetTitle}>Task locations</Text>
            <Text style={styles.sheetText}>
              {activePins.length
                ? `${activePins.length} active task${activePins.length === 1 ? "" : "s"} with a location`
                : "No active tasks have a location yet."}
            </Text>
          </>
        )}
        {!locating && !me && (
          <Text style={[styles.sheetText, { marginTop: 6 }]}>
            Couldn't get your location, so the map is showing a default area.
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  mapWrap: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  back: {
    position: "absolute",
    left: 14,
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
  },
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  sheetTitle: { fontFamily: fonts.bold, fontSize: 15 },
  sheetText: { marginTop: 3, fontSize: 12.5, color: colors.muted },
})