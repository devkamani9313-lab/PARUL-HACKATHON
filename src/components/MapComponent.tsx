"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet
const createIcon = (color: string) => new L.DivIcon({
  className: "custom-div-icon",
  html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px ${color};"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const cyanIcon = createIcon("#00c9ff");

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MapComponent({ stops }: { stops: any[] }) {
  const [markers, setMarkers] = useState<{lat: number, lng: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const geocodeStops = async () => {
      const results = [];
      for (const stop of stops) {
        try {
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(stop.cityName)}&count=1&language=en&format=json`);
          const data = await res.json();
          if (data.results?.length) {
            results.push({
              lat: data.results[0].latitude,
              lng: data.results[0].longitude,
              name: stop.cityName
            });
          }
        } catch (err) {
          console.error("Geocoding error", err);
        }
      }
      setMarkers(results);
      setLoading(false);
    };

    if (stops.length > 0) {
      geocodeStops();
    } else {
      setLoading(false);
    }
  }, [stops]);

  if (loading) return (
    <div className="w-full h-full bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const center: [number, number] = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [20, 0];
  const zoom = markers.length > 0 ? 5 : 2;

  const polylinePoints = markers.map(m => [m.lat, m.lng] as [number, number]);

  return (
    <div className="w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", background: "#050505" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map((marker, idx) => (
          <Marker key={idx} position={[marker.lat, marker.lng]} icon={cyanIcon}>
            <Popup>
              <div className="text-black font-bold font-sans">
                Day {idx + 1}: {marker.name}
              </div>
            </Popup>
          </Marker>
        ))}
        {markers.length > 1 && (
          <Polyline 
            positions={polylinePoints} 
            pathOptions={{ color: "#00c9ff", weight: 3, opacity: 0.6, dashArray: "10, 10" }} 
          />
        )}
        <ChangeView center={center} zoom={zoom} />
      </MapContainer>
      
      {/* Decorative Overlay */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20 rounded-[2rem]"></div>
    </div>
  );
}
