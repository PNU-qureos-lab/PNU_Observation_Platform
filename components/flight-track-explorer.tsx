'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { Clock3, Crosshair, Layers3, MapPinned, Plane, Route } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

type TrackPoint = { lat: number; lon: number; time?: string | null };
type FlightTrack = {
  id: string;
  label: string;
  pathLabel: string;
  kind: string;
  model?: string;
  start?: string | null;
  end?: string | null;
  timeBasis?: string;
  distanceM?: number;
  sourceImageCount?: number;
  sampledPointCount?: number;
  points: TrackPoint[];
};
type GroundPoint = { label: string; lat: number; lon: number; time?: string | null };
type Campaign = {
  id: string;
  uavTracks?: FlightTrack[];
  specim?: { label?: string; points?: GroundPoint[] } | null;
  ramses?: { recordCount?: number; sampledCount?: number; series?: unknown[] } | null;
  airborne?: { sets?: unknown[] } | null;
};
type Payload = { campaigns: Campaign[] };

const kindColors: Record<string, string> = {
  RGB: '#007f8a',
  다분광: '#6a9f2f',
  LiDAR: '#e07a2f',
};

function formatTime(value?: string | null) {
  if (!value) return '시각 미확인';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  if (date.getFullYear() < 2000) return '장비시각 오류';
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function FlightMap({ tracks, groundPoints }: { tracks: FlightTrack[]; groundPoints: GroundPoint[] }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let disposed = false;
    async function draw() {
      if (!nodeRef.current) return;
      const L = await import('leaflet');
      if (disposed || !nodeRef.current) return;
      mapRef.current?.remove();
      const map = L.map(nodeRef.current, { scrollWheelZoom: false, zoomControl: true });
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const allBounds: [number, number][] = [];
      tracks.forEach((track, index) => {
        const points = track.points.map((point) => [point.lat, point.lon] as [number, number]);
        if (!points.length) return;
        allBounds.push(...points);
        const color = kindColors[track.kind] ?? `hsl(${(index * 47) % 360} 58% 42%)`;
        if (points.length > 1) {
          L.polyline(points, { color, weight: tracks.length === 1 ? 4 : 2.4, opacity: tracks.length === 1 ? 0.95 : 0.72 })
            .addTo(map)
            .bindPopup(`<strong>${escapeHtml(track.label)}</strong><br/>${escapeHtml(track.kind)} · ${track.distanceM ? `${(track.distanceM / 1000).toFixed(2)} km` : '거리 미확인'}<br/>${formatTime(track.start)}–${formatTime(track.end)}`);
        }
        L.circleMarker(points[0], { radius: 4, color: '#fff', weight: 1.5, fillColor: color, fillOpacity: 1 })
          .addTo(map)
          .bindTooltip(`${track.kind} 시작 · ${formatTime(track.start)}`);
        if (points.length > 1) {
          L.circleMarker(points.at(-1)!, { radius: 4, color, weight: 2, fillColor: '#fff', fillOpacity: 1 })
            .addTo(map)
            .bindTooltip(`${track.kind} 종료 · ${formatTime(track.end)}`);
        }
      });

      groundPoints.forEach((point) => {
        const latLng: [number, number] = [point.lat, point.lon];
        allBounds.push(latLng);
        L.circleMarker(latLng, { radius: 5, color: '#fff', weight: 1.5, fillColor: '#6a42b8', fillOpacity: 0.9 })
          .addTo(map)
          .bindPopup(`<strong>${escapeHtml(point.label)}</strong><br/>Specim-IQ 관측점<br/>${formatTime(point.time)}`);
      });

      if (allBounds.length > 1) map.fitBounds(allBounds, { padding: [32, 32], maxZoom: 18 });
      else if (allBounds.length === 1) map.setView(allBounds[0], 17);
      else map.setView([35.55, 127.5], 7);
    }
    draw();
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [tracks, groundPoints]);

  return <div ref={nodeRef} className="h-[430px] w-full rounded-[24px] bg-[#dce7df] lg:h-[590px]" aria-label="세트별 비행경로와 현장 관측점 지도" />;
}

export function FlightTrackExplorer({ campaignId, domainId }: { campaignId: string; domainId: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [kind, setKind] = useState('전체');
  const [selectedTrackId, setSelectedTrackId] = useState('전체');
  const [showGroundPoints, setShowGroundPoints] = useState(true);

  useEffect(() => {
    const source = domainId === 'tidal-flat' ? '/data/tidal-observations.json' : '/data/agriculture-observations.json';
    fetch(source)
      .then((response) => response.json() as Promise<Payload>)
      .then((payload) => setCampaign(payload.campaigns.find((entry) => entry.id === campaignId) ?? null))
      .finally(() => setLoaded(true));
  }, [campaignId, domainId]);

  const tracks = useMemo(() => campaign?.uavTracks ?? [], [campaign]);
  const kinds = useMemo(() => ['전체', ...new Set(tracks.map((track) => track.kind))], [tracks]);
  const filtered = useMemo(() => tracks.filter((track) => kind === '전체' || track.kind === kind), [tracks, kind]);
  const visibleTracks = useMemo(() => selectedTrackId === '전체' ? filtered : filtered.filter((track) => track.id === selectedTrackId), [filtered, selectedTrackId]);
  const groundPoints = showGroundPoints ? campaign?.specim?.points ?? [] : [];
  const gpsPointCount = tracks.reduce((sum, track) => sum + track.points.length, 0);
  const totalImages = tracks.reduce((sum, track) => sum + (track.sourceImageCount ?? track.points.length), 0);
  const ramsesCount = campaign?.ramses?.recordCount ?? campaign?.ramses?.series?.length ?? 0;
  const airborneCount = campaign?.airborne?.sets?.length ?? 0;

  if (!loaded) return <div className="grid h-[360px] place-items-center rounded-[26px] bg-white text-sm text-[#65736e]">GPS 비행경로를 불러오는 중입니다.</div>;
  if (!campaign || (!tracks.length && !groundPoints.length)) return <div className="rounded-[26px] border border-dashed border-border bg-white p-9 text-center"><MapPinned className="mx-auto size-6 text-[#65736e]" /><h2 className="mt-4 font-black">세트별 GPS 경로 없음</h2><p className="mt-2 text-sm leading-6 text-[#65736e]">이 관측일은 공개 가능한 촬영 GPS가 없거나 폴더만 존재합니다. 대표 위치와 자료 상태는 위쪽에서 확인할 수 있습니다.</p></div>;

  return (
    <section className="py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold tracking-[0.13em] text-[#65736e] uppercase">Flight & ground observations</p><h2 className="mt-2 text-2xl font-black">세트별 비행경로·측정지점</h2><p className="mt-2 text-sm text-[#65736e]">사진 EXIF GPS를 읽어 OSM 위에 촬영 순서대로 연결했습니다. 원하는 세트를 누르면 해당 경로만 확대해 볼 수 있습니다.</p></div>
        <div className="flex flex-wrap gap-2">
          {kinds.map((entry) => <button key={entry} type="button" onClick={() => { setKind(entry); setSelectedTrackId('전체'); }} className={`rounded-full border px-3 py-2 text-xs font-bold transition ${kind === entry ? 'border-[#006d77] bg-[#006d77] text-white' : 'border-border bg-white text-[#465550] hover:border-[#7eaaa7]'}`}>{entry}</button>)}
          {(campaign.specim?.points?.length ?? 0) > 0 && <button type="button" onClick={() => setShowGroundPoints((value) => !value)} className={`rounded-full border px-3 py-2 text-xs font-bold transition ${showGroundPoints ? 'border-[#6a42b8] bg-[#f0ebff] text-[#55329c]' : 'border-border bg-white text-[#65736e]'}`}>Specim 관측점</button>}
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[20px] border border-border bg-white p-4"><Plane className="size-4 text-[#007f8a]" /><span className="mt-4 block text-xs font-bold text-[#65736e]">GPS 비행세트</span><strong className="font-mono text-2xl">{tracks.length}</strong></div>
        <div className="rounded-[20px] border border-border bg-white p-4"><Crosshair className="size-4 text-[#6a42b8]" /><span className="mt-4 block text-xs font-bold text-[#65736e]">표시 GPS 지점</span><strong className="font-mono text-2xl">{gpsPointCount.toLocaleString()}</strong></div>
        <div className="rounded-[20px] border border-border bg-white p-4"><Layers3 className="size-4 text-[#6a9f2f]" /><span className="mt-4 block text-xs font-bold text-[#65736e]">경로 판독 이미지·점</span><strong className="font-mono text-2xl">{totalImages.toLocaleString()}</strong></div>
        <div className="rounded-[20px] border border-border bg-white p-4"><Route className="size-4 text-[#e07a2f]" /><span className="mt-4 block text-xs font-bold text-[#65736e]">연계 계측</span><strong className="font-mono text-2xl">RAMSES {ramsesCount.toLocaleString()}{airborneCount ? ` · 항공 ${airborneCount}` : ''}</strong></div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-[28px] border border-border bg-white p-2"><FlightMap tracks={visibleTracks} groundPoints={groundPoints} /></div>
        <aside className="rounded-[24px] border border-border bg-white p-4 xl:max-h-[606px]">
          <button type="button" onClick={() => setSelectedTrackId('전체')} className={`mb-2 w-full rounded-xl border px-4 py-3 text-left ${selectedTrackId === '전체' ? 'border-[#006d77] bg-[#e8f6f5]' : 'border-border bg-[#f8faf7]'}`}><strong className="text-sm">필터된 경로 전체</strong><span className="mt-1 block text-xs text-[#65736e]">{filtered.length}개 세트 중첩 표시</span></button>
          <div className="grid max-h-[500px] gap-2 overflow-y-auto pr-1">
            {filtered.map((track) => <button key={track.id} type="button" onClick={() => setSelectedTrackId(track.id)} className={`rounded-xl border px-4 py-3 text-left transition ${selectedTrackId === track.id ? 'border-[#006d77] bg-[#e8f6f5]' : 'border-border hover:bg-[#f8faf7]'}`}>
              <span className="flex items-center justify-between gap-3"><strong className="truncate text-sm">{track.label}</strong><Badge variant="outline" style={{ color: kindColors[track.kind] ?? '#006d77' }}>{track.kind}</Badge></span>
              <span className="mt-2 flex items-center gap-1.5 text-xs text-[#65736e]"><Clock3 className="size-3.5" />{formatTime(track.start)}–{formatTime(track.end)} · {track.distanceM ? `${(track.distanceM / 1000).toFixed(2)} km` : '거리 미확인'}</span>
              <span className="mt-1 block truncate font-mono text-[10px] text-[#88938f]">{track.pathLabel}</span>
            </button>)}
          </div>
        </aside>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#7a8581]">표시시각은 모두 KST(UTC+09)입니다. 경로는 원본 GPS EXIF를 균등 표본화한 탐색용 선이며 정밀 측량·항법용 궤적으로 사용하지 마세요. 장비시각의 근거는 세트별 시간 기준에 함께 표시합니다.</p>
    </section>
  );
}
