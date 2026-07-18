"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, MapPin } from "lucide-react";

interface DistanceMapProps {
  workLocation: { lat: number; lng: number; address?: string };
  domicileLocation: { lat: number; lng: number; address?: string };
}

export function DistanceMap({ workLocation, domicileLocation }: DistanceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [apiError, setApiError] = useState(false);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (window.google?.maps) {
      setApiLoaded(true);
      return;
    }

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          setApiLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setApiLoaded(true);
    script.onerror = () => setApiError(true);

    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    if (!apiLoaded || !mapRef.current || typeof window === "undefined" || !window.google?.maps) return;

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(workLocation);
    bounds.extend(domicileLocation);

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstance.fitBounds(bounds);

    // Add Work/Office Marker
    const officeMarker = new window.google.maps.Marker({
      position: workLocation,
      map: mapInstance,
      title: "Lokasi Kerja / Kantor",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
      }
    });

    // Add Domicile Marker
    const domicileMarker = new window.google.maps.Marker({
      position: domicileLocation,
      map: mapInstance,
      title: "Domisili Kandidat",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      }
    });

    // Draw Line between them
    const path = new window.google.maps.Polyline({
      path: [workLocation, domicileLocation],
      geodesic: true,
      strokeColor: "#3b82f6",
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: mapInstance,
    });

    // Adjust zoom after fitting bounds
    const listener = window.google.maps.event.addListener(mapInstance, "bounds_changed", () => {
      if (mapInstance.getZoom()! > 15) {
        mapInstance.setZoom(15);
      }
      window.google.maps.event.removeListener(listener);
    });

    return () => {
      officeMarker.setMap(null);
      domicileMarker.setMap(null);
      path.setMap(null);
    };
  }, [apiLoaded, workLocation, domicileLocation]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>Peta Rute Domisili ke Kantor</span>
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Kantor
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Domisili
          </span>
        </div>
      </div>

      {apiKey && !apiError ? (
        <div
          ref={mapRef}
          className="w-full h-[200px] rounded-xl border border-border bg-muted/20"
        />
      ) : (
        <div className="rounded-xl border border-border bg-muted/10 p-3 text-xs text-muted-foreground flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Google Maps API Key belum di-set. Peta rute tidak dapat ditampilkan secara visual, namun data radius jarak tetap dihitung.</span>
        </div>
      )}
    </div>
  );
}
