"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { MapPin, Search, AlertCircle } from "lucide-react";

interface MapPickerProps {
  value: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  onChange: (val: { lat: number; lng: number; address: string }) => void;
  label?: string;
  defaultCenter?: { lat: number; lng: number };
}

export function MapPicker({
  value,
  onChange,
  label = "Pilih Lokasi",
  defaultCenter = { lat: -6.200000, lng: 106.816666 }, // Jakarta default
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [apiError, setApiError] = useState(false);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  // Load Google Maps Script
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Check if script is already loaded
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

    // If no API Key is provided, we can still attempt loading, but warn the user.
    // However, Google Maps might fail completely without a key or display developer warning.
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setApiLoaded(true);
    };
    script.onerror = () => {
      setApiError(true);
    };

    document.head.appendChild(script);
  }, [apiKey]);

  // Initialize Map
  useEffect(() => {
    if (!apiLoaded || !mapRef.current || typeof window === "undefined" || !window.google?.maps) return;

    const center = value ? { lat: value.lat, lng: value.lng } : defaultCenter;
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const markerInstance = new window.google.maps.Marker({
      position: center,
      map: mapInstance,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });

    setMap(mapInstance);
    setMarker(markerInstance);

    // Map Click Listener
    mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
      const latLng = e.latLng;
      if (latLng) {
        const lat = latLng.lat();
        const lng = latLng.lng();
        markerInstance.setPosition({ lat, lng });
        geocodePosition(lat, lng);
      }
    });

    // Marker Drag Listener
    markerInstance.addListener("dragend", () => {
      const position = markerInstance.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        geocodePosition(lat, lng);
      }
    });

    // Initial Geocode if address is empty but lat/lng exists
    if (value && !value.address) {
      geocodePosition(value.lat, value.lng);
    }

    // Cleanup
    return () => {
      window.google.maps.event.clearInstanceListeners(mapInstance);
      window.google.maps.event.clearInstanceListeners(markerInstance);
    };
  }, [apiLoaded]);

  // Sync marker position when external value changes
  useEffect(() => {
    if (map && marker && value) {
      const pos = { lat: value.lat, lng: value.lng };
      // Avoid infinite loop if position is already very close
      const currentPos = marker.getPosition();
      if (!currentPos || Math.abs(currentPos.lat() - pos.lat) > 0.0001 || Math.abs(currentPos.lng() - pos.lng) > 0.0001) {
        marker.setPosition(pos);
        map.setCenter(pos);
      }
    }
  }, [value, map, marker]);

  // Geocode Latitude and Longitude to get address
  const geocodePosition = (lat: number, lng: number) => {
    if (!window.google?.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
      if (status === "OK" && results && results[0]) {
        onChange({
          lat,
          lng,
          address: results[0].formatted_address,
        });
      } else {
        onChange({
          lat,
          lng,
          address: `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      }
    });
  };

  // Search Address
  const handleSearch = () => {
    if (!searchQuery || !window.google?.maps || !map || !marker) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
      if (status === "OK" && results && results[0] && results[0].geometry.location) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();
        
        map.setCenter({ lat, lng });
        map.setZoom(15);
        marker.setPosition({ lat, lng });
        
        onChange({
          lat,
          lng,
          address: results[0].formatted_address,
        });
      } else {
        alert("Lokasi tidak ditemukan. Harap masukkan kata kunci lain.");
      }
    });
  };

  const handleManualCoords = (latStr: string, lngStr: string) => {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (!isNaN(lat) && !isNaN(lng)) {
      onChange({
        lat,
        lng,
        address: value?.address || "Manual input location",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">{label}</label>
        {!apiKey && (
          <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Mode Manual (API Key Maps belum di-set)
          </span>
        )}
      </div>

      {apiKey && !apiError ? (
        <div className="space-y-2">
          {/* Search bar */}
          <div className="flex gap-2">
            <Input
              placeholder="Cari lokasi/alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              className="text-xs"
            />
            <Button type="button" onClick={handleSearch} size="sm" className="h-9 px-3">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Map canvas */}
          <div
            ref={mapRef}
            className="w-full h-[250px] rounded-xl border border-border bg-muted/20"
            style={{ minHeight: "250px" }}
          />
          
          {value && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border text-xs">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Lokasi Terpilih:</p>
                <p className="text-muted-foreground mt-0.5">{value.address}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  Lat: {value.lat.toFixed(6)}, Lng: {value.lng.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Fallback Form when Google Maps is not available / API key not set
        <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Alamat / Domisili Lengkap</label>
            <Input
              placeholder="Contoh: Jl. Sudirman No. 12, Jakarta Selatan"
              value={value?.address || ""}
              onChange={(e) => onChange({
                lat: value?.lat || defaultCenter.lat,
                lng: value?.lng || defaultCenter.lng,
                address: e.target.value
              })}
              className="text-xs"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Latitude</label>
              <Input
                type="number"
                step="any"
                placeholder="-6.200000"
                value={value?.lat !== undefined ? value.lat : ""}
                onChange={(e) => handleManualCoords(e.target.value, String(value?.lng || defaultCenter.lng))}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Longitude</label>
              <Input
                type="number"
                step="any"
                placeholder="106.816666"
                value={value?.lng !== undefined ? value.lng : ""}
                onChange={(e) => handleManualCoords(String(value?.lat || defaultCenter.lat), e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>
          
          <p className="text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded-lg leading-normal">
            Input koordinat secara manual atau ketik alamat di atas. Untuk pengalaman peta visual, silakan konfigurasikan <strong>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</strong> di file <code>.env.local</code>.
          </p>
        </div>
      )}
    </div>
  );
}
