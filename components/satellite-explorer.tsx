'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { CalendarDays, CloudSun, Layers3, Satellite } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { satelliteAcquisitions } from '@/lib/catalog';

type Scene = {
  id: string;
  acquired: string;
  satelliteId: string;
  instrument: string;
  gsdM: number;
  cloudPercent: number;
  clearPercent: number;
  quality: string;
  footprint: [number, number][];
  preview: string;
};
type Acquisition = { date: string; start: string; end: string; scenes: Scene[] };
type Payload = { satellite: { acquisitions: Acquisition[] } };

function sceneImage(scene: Scene) {
  return `/tidal/${scene.preview.replace(/^assets\//, '')}`;
}

function SatelliteMap({ scenes }: { scenes: Scene[] }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  useEffect(() => {
    let disposed = false;
    async function draw() {
      if (!nodeRef.current) return;
      const L = await import('leaflet');
      if (disposed || !nodeRef.current) return;
      mapRef.current?.remove();
      const map = L.map(nodeRef.current, { scrollWheelZoom: false });
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      const allBounds: [number, number][] = [];
      scenes.forEach((scene) => {
        const polygon = scene.footprint.map(([lon, lat]) => [lat, lon] as [number, number]);
        allBounds.push(...polygon);
        L.polygon(polygon, { color: scene.cloudPercent > 20 ? '#d88c30' : '#5e35b1', fillOpacity: 0.12, weight: 2 }).addTo(map).bindPopup(`<strong>${scene.id}</strong><br/>운량 ${scene.cloudPercent}% · GSD ${scene.gsdM}m`);
      });
      if (allBounds.length) map.fitBounds(allBounds, { padding: [28, 28] }); else map.setView([35.55, 126.59], 11);
    }
    draw();
    return () => { disposed = true; mapRef.current?.remove(); mapRef.current = null; };
  }, [scenes]);
  return <div ref={nodeRef} className="h-[390px] w-full rounded-[26px] bg-[#dce7df] lg:h-[520px]" aria-label="위성 장면 촬영영역 지도" />;
}

export function SatelliteExplorer() {
  const [acquisitions, setAcquisitions] = useState<Acquisition[]>([]);
  const [selectedDate, setSelectedDate] = useState(satelliteAcquisitions[0].date);
  const [maxCloud, setMaxCloud] = useState(100);

  useEffect(() => {
    fetch('/data/tidal-observations.json')
      .then((response) => response.json() as Promise<Payload>)
      .then((payload) => setAcquisitions([...payload.satellite.acquisitions].sort((a, b) => b.date.localeCompare(a.date))));
  }, []);

  const current = acquisitions.find((entry) => entry.date === selectedDate);
  const scenes = useMemo(() => (current?.scenes ?? []).filter((scene) => scene.cloudPercent <= maxCloud), [current, maxCloud]);

  return (
    <div className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="h-fit rounded-[24px] border border-border bg-white p-5 xl:sticky xl:top-23">
        <div className="flex items-center gap-2"><Satellite className="size-4 text-[#5e35b1]" /><h2 className="font-black">PlanetScope</h2></div>
        <label htmlFor="cloud-limit" className="mt-6 flex items-center justify-between text-xs font-bold tracking-[0.1em] text-[#65736e] uppercase"><span>최대 운량</span><strong className="font-mono text-[#5e35b1]">{maxCloud}%</strong></label>
        <input id="cloud-limit" type="range" min="0" max="100" step="5" value={maxCloud} onChange={(event) => setMaxCloud(Number(event.target.value))} className="mt-3 w-full accent-[#5e35b1]" />
        <div className="mt-6 grid max-h-[420px] gap-2 overflow-y-auto pr-1">
          {satelliteAcquisitions.map((entry) => <button key={entry.date} type="button" onClick={() => setSelectedDate(entry.date)} className={`rounded-xl border px-3 py-3 text-left transition ${selectedDate === entry.date ? 'border-[#5e35b1] bg-[#f1efff]' : 'border-border bg-[#f8faf7] hover:bg-white'}`}><span className="block font-mono text-sm font-black">{entry.date}</span><span className="mt-1 block text-xs text-[#65736e]">{entry.sceneCount} scenes · GSD {entry.gsd}m</span></button>)}
        </div>
      </aside>

      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold tracking-[0.14em] text-[#5e35b1] uppercase">Selected acquisition</p><h2 className="mt-1 font-mono text-3xl font-black tracking-[-0.05em]">{selectedDate}</h2></div><Badge className="bg-[#ece9ff] text-[#4b2997]"><Layers3 /> {scenes.length}개 장면 표시</Badge></div>
        <SatelliteMap scenes={scenes} />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {scenes.map((scene) => <article key={scene.id} className="overflow-hidden rounded-[24px] border border-border bg-white">
            <div className="relative aspect-[16/8.5] overflow-hidden bg-[#e7ece8]"><img src={sceneImage(scene)} alt={`${selectedDate} PlanetScope ${scene.id} RGB 미리보기`} loading="lazy" className="h-full w-full object-cover" /><span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-[#4b2997]">{scene.instrument}</span></div>
            <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-mono font-black">{scene.id}</p><p className="mt-1 text-xs text-[#65736e]">위성 {scene.satelliteId} · {scene.quality}</p></div><Badge variant="outline">GSD {scene.gsdM}m</Badge></div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs"><span className="flex items-center gap-1.5 text-[#65736e]"><CloudSun className="size-4" />운량 <strong className="text-[#16231f]">{scene.cloudPercent}%</strong></span><span className="flex items-center gap-1.5 text-[#65736e]"><CalendarDays className="size-4" />Clear <strong className="text-[#16231f]">{scene.clearPercent}%</strong></span></div>
            </div>
          </article>)}
        </div>
        {!acquisitions.length && <div className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-[#65736e]">위성 장면 메타데이터를 불러오는 중입니다.</div>}
      </section>
    </div>
  );
}
