"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { MapPin, Search, Loader2 } from "lucide-react";

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
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    let mapInstance: any = null;
    let markerInstance: any = null;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix Leaflet default marker icon issue in Next.js
      const defaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const center = value ? [value.lat, value.lng] : [defaultCenter.lat, defaultCenter.lng];
      
      // Create map
      mapInstance = L.map(mapRef.current!).setView(center as any, 13);
      
      // Load OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);

      // Create draggable marker
      markerInstance = L.marker(center as any, {
        draggable: true,
        icon: defaultIcon,
      }).addTo(mapInstance);

      setMap(mapInstance);
      setMarker(markerInstance);

      // Map Click Event
      mapInstance.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        markerInstance.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      // Marker Drag End Event
      markerInstance.on("dragend", (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        reverseGeocode(lat, lng);
      });

      // Geocode initial coords if address is empty
      if (value && !value.address) {
        reverseGeocode(value.lat, value.lng);
      }
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [isClient]);

  // Sync marker position when external value changes
  useEffect(() => {
    if (map && marker && value) {
      const currentLatLng = marker.getLatLng();
      if (
        Math.abs(currentLatLng.lat - value.lat) > 0.0001 ||
        Math.abs(currentLatLng.lng - value.lng) > 0.0001
      ) {
        marker.setLatLng([value.lat, value.lng]);
        map.setView([value.lat, value.lng], map.getZoom());
      }
    }
  }, [value, map, marker]);

  // Reverse Geocoding with OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id,en`
      );
      if (res.ok) {
        const data = await res.json();
        onChange({
          lat,
          lng,
          address: data.display_name || `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      } else {
        onChange({
          lat,
          lng,
          address: `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      }
    } catch (err) {
      console.error(err);
      onChange({
        lat,
        lng,
        address: `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });
    }
  };

  // Search Address with OpenStreetMap Nominatim
  const handleSearch = async () => {
    if (!searchQuery || !map || !marker) return;
    setLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&accept-language=id,en&limit=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          
          map.setView([lat, lng], 15);
          marker.setLatLng([lat, lng]);
          
          onChange({
            lat,
            lng,
            address: data[0].display_name,
          });
        } else {
          alert("Lokasi tidak ditemukan. Harap masukkan kata kunci lain.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mencari lokasi.");
    } finally {
      setLoading(false);
    }
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

  if (!isClient) {
    return (
      <div className="w-full h-[250px] rounded-xl border border-border bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">{label}</label>
      </div>

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
          <Button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            size="sm"
            className="h-9 px-3"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Map canvas */}
        <div
          ref={mapRef}
          className="w-full h-[250px] rounded-xl border border-border bg-muted/20 z-0"
          style={{ minHeight: "250px" }}
        />
        
        {value && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border text-xs">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">Lokasi Terpilih:</p>
              <p className="text-muted-foreground mt-0.5 truncate-2-lines">{value.address}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground font-mono">Latitude</label>
                  <Input
                    type="number"
                    step="any"
                    value={value.lat}
                    onChange={(e) => handleManualCoords(e.target.value, String(value.lng))}
                    className="h-7 text-xs font-mono px-2 py-0"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground font-mono">Longitude</label>
                  <Input
                    type="number"
                    step="any"
                    value={value.lng}
                    onChange={(e) => handleManualCoords(String(value.lat), e.target.value)}
                    className="h-7 text-xs font-mono px-2 py-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
