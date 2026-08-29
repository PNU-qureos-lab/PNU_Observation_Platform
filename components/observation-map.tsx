'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';

import { domains, type Observation } from '@/lib/catalog';

export function ObservationMap({ items, className = '' }: { items: Observation[]; className?: string }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let disposed = false;
    async function draw() {
      if (!nodeRef.current) return;
      const L = await import('leaflet');
      if (disposed || !nodeRef.current) return;
      mapRef.current?.remove();
      const map = L.map(nodeRef.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true });
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const located = items.filter((item) => item.latitude != null && item.longitude != null);
      const bounds: [number, number][] = [];
      for (const item of located) {
        const domain = domains.find((entry) => entry.id === item.domainId);
        const point: [number, number] = [item.latitude!, item.longitude!];
        bounds.push(point);
        const marker = L.circleMarker(point, {
          radius: located.length === 1 ? 10 : 7,
          color: '#ffffff',
          weight: 2,
          fillColor: domain?.color ?? '#006d77',
          fillOpacity: 0.95,
        }).addTo(map);
        marker.bindPopup(`<div class="map-popup"><strong>${item.date}</strong><br/>${item.title}<br/><a href="/observations/${item.id}">상세보기 →</a></div>`);
      }
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [35, 35], maxZoom: 11 });
      else if (bounds.length === 1) map.setView(bounds[0], 14);
      else map.setView([35.55, 127.5], 7);
    }
    draw();
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [items]);

  return <div ref={nodeRef} className={`min-h-[360px] w-full rounded-[26px] bg-[#dce7df] ${className}`} aria-label="관측 위치 지도" />;
}
