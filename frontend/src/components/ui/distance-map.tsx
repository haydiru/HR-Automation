"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface DistanceMapProps {
  workLocation: { lat: number; lng: number; address?: string };
  domicileLocation: { lat: number; lng: number; address?: string };
}

export function DistanceMap({ workLocation, domicileLocation }: DistanceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    let mapInstance: any = null;
    let workMarker: any = null;
    let domicileMarker: any = null;
    let polyline: any = null;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default marker icon issues in Leaflet + Next.js
      const workIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const domicileIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const workLatLng = [workLocation.lat, workLocation.lng];
      const domicileLatLng = [domicileLocation.lat, domicileLocation.lng];

      // Create map instance
      mapInstance = L.map(mapRef.current!).setView(workLatLng as any, 13);

      // Load OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);

      // Add Red marker for workplace
      workMarker = L.marker(workLatLng as any, { icon: workIcon })
        .addTo(mapInstance)
        .bindPopup(`<b>Lokasi Kantor</b><br>${workLocation.address || "Tempat Kerja"}`);

      // Add Blue marker for candidate's domicile
      domicileMarker = L.marker(domicileLatLng as any, { icon: domicileIcon })
        .addTo(mapInstance)
        .bindPopup(`<b>Domisili Kandidat</b><br>${domicileLocation.address || "Tempat Tinggal"}`);

      // Draw blue connecting line
      polyline = L.polyline([workLatLng, domicileLatLng] as any[], {
        color: "#3b82f6",
        weight: 3,
        opacity: 0.8,
        dashArray: "5, 5" // Dashed line
      }).addTo(mapInstance);

      // Fit map to contain both markers
      const group = new L.FeatureGroup([workMarker, domicileMarker]);
      mapInstance.fitBounds(group.getBounds().pad(0.15));
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [isClient, workLocation, domicileLocation]);

  if (!isClient) {
    return (
      <div className="w-full h-[200px] rounded-xl border border-border bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>Peta Rute Domisili ke Kantor (OpenStreetMap)</span>
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Kantor
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Domisili
          </span>
        </div>
      </div>

      <div
        ref={mapRef}
        className="w-full h-[200px] rounded-xl border border-border bg-muted/20 z-0"
        style={{ minHeight: "200px" }}
      />
    </div>
  );
}
