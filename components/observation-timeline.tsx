'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock3, RadioTower, Rows3 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

type FlightTrack = {
  id: string;
  label: string;
  pathLabel?: string;
  kind: string;
  start?: string | null;
  end?: string | null;
  timeBasis?: string;
};

type TimedGroup = {
  label?: string;
  start?: string | null;
  end?: string | null;
  timeBasis?: string;
  points?: unknown[];
  series?: unknown[];
  sets?: unknown[];
  recordCount?: number;
  dateMatchesCampaign?: boolean;
};

type Campaign = {
  id: string;
  uavTracks?: FlightTrack[];
  specim?: TimedGroup | null;
  ramses?: TimedGroup | null;
  airborne?: TimedGroup | null;
};

type Payload = { campaigns: Campaign[] };

type TimelineEvent = {
  id: string;
  lane: string;
  label: string;
  start: number;
  end: number;
  detail: string;
  timeBasis?: string;
  inferred?: boolean;
};

type MismatchEvent = {
  id: string;
  lane: string;
  label: string;
  recordedDate: string;
  time: string;
};

const laneMeta: Record<string, { color: string; light: string; label: string }> = {
  RGB: { color: '#007f8a', light: '#dff5f5', label: 'RGB 드론' },
  다분광: { color: '#6a9f2f', light: '#edf7df', label: '다분광 드론' },
  LiDAR: { color: '#e07a2f', light: '#fff0df', label: 'LiDAR' },
  'Specim-IQ': { color: '#6a42b8', light: '#f0ebff', label: 'Specim-IQ' },
  RAMSES: { color: '#d1495b', light: '#fdebed', label: 'RAMSES' },
  FENIX: { color: '#2d6ca2', light: '#e9f2fb', label: 'FENIX 항공' },
};

const laneOrder = ['RGB', '다분광', 'LiDAR', 'Specim-IQ', 'RAMSES', 'FENIX'];

function isoParts(value?: string | null) {
  const match = value?.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  if (!match) return null;
  return { date: match[1], minute: Number(match[2]) * 60 + Number(match[3]) };
}

function pathTime(value: string, campaignDate: string) {
  const long = value.match(/(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)[T_ -]?([0-2]\d)[:_-]?([0-5]\d)/i);
  if (long) {
    const date = `${long[1]}-${long[2]}-${long[3]}`;
    if (date === campaignDate) return Number(long[4]) * 60 + Number(long[5]);
  }
  const short = value.match(/(?:^|[^\d])(\d{2})([01]\d)([0-3]\d)[T_ -]?([0-2]\d)[:_-]?([0-5]\d)/i);
  if (short) {
    const date = `20${short[1]}-${short[2]}-${short[3]}`;
    if (date === campaignDate) return Number(short[4]) * 60 + Number(short[5]);
  }
  return null;
}

function rangeFromWindow(value: string) {
  const match = value.match(/(\d{1,2}):(\d{2})\s*[–—~-]\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return {
    start: Number(match[1]) * 60 + Number(match[2]),
    end: Number(match[3]) * 60 + Number(match[4]),
  };
}

function formatMinute(minute: number) {
  const safe = Math.max(0, Math.min(1439, Math.round(minute)));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))}분`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest ? `${hours}시간 ${rest}분` : `${hours}시간`;
}

function buildTimeline(campaign: Campaign, campaignDate: string) {
  const events: TimelineEvent[] = [];
  const mismatches: MismatchEvent[] = [];

  for (const track of campaign.uavTracks ?? []) {
    const start = isoParts(track.start);
    const end = isoParts(track.end);
    const rawDuration = start && end && start.date === end.date && end.minute >= start.minute ? Math.min(240, Math.max(2, end.minute - start.minute)) : 8;
    let alignedStart: number | null = start?.date === campaignDate ? start.minute : null;
    let inferred = false;
    if (alignedStart == null) {
      alignedStart = pathTime(`${track.pathLabel ?? ''} ${track.label}`, campaignDate);
      inferred = alignedStart != null;
    }
    if (alignedStart == null) {
      if (start) mismatches.push({ id: track.id, lane: track.kind, label: track.label, recordedDate: start.date, time: formatMinute(start.minute) });
      continue;
    }
    const alignedEnd = start?.date === campaignDate && end?.date === campaignDate && end.minute >= alignedStart
      ? end.minute
      : Math.min(1439, alignedStart + rawDuration);
    events.push({
      id: track.id,
      lane: track.kind,
      label: track.label,
      start: alignedStart,
      end: Math.max(alignedStart + 2, alignedEnd),
      detail: `${formatMinute(alignedStart)}–${formatMinute(Math.max(alignedStart + 2, alignedEnd))}`,
      timeBasis: inferred ? '촬영폴더 시각으로 정렬' : track.timeBasis,
      inferred,
    });
  }

  const addGroup = (lane: string, group?: TimedGroup | null, count = 0) => {
    if (!group) return;
    const start = isoParts(group.start);
    const end = isoParts(group.end);
    if (!start) return;
    if (start.date !== campaignDate || group.dateMatchesCampaign === false) {
      mismatches.push({ id: lane, lane, label: group.label ?? laneMeta[lane]?.label ?? lane, recordedDate: start.date, time: `${formatMinute(start.minute)}${end ? `–${formatMinute(end.minute)}` : ''}` });
      return;
    }
    const endMinute = end?.date === campaignDate && end.minute >= start.minute ? end.minute : start.minute + 3;
    const unit = lane === 'RAMSES' ? '건' : lane === 'FENIX' ? '세트' : '지점';
    events.push({
      id: lane,
      lane,
      label: group.label ?? laneMeta[lane]?.label ?? lane,
      start: start.minute,
      end: Math.max(start.minute + 3, endMinute),
      detail: `${formatMinute(start.minute)}–${formatMinute(Math.max(start.minute + 3, endMinute))} · ${count.toLocaleString()}${unit}`,
      timeBasis: group.timeBasis,
    });
  };

  addGroup('Specim-IQ', campaign.specim, campaign.specim?.points?.length ?? 0);
  addGroup('RAMSES', campaign.ramses, campaign.ramses?.recordCount ?? campaign.ramses?.series?.length ?? 0);
  addGroup('FENIX', campaign.airborne, campaign.airborne?.sets?.length ?? 0);

  return { events, mismatches };
}

function TimelineDesktop({ lanes, start, end }: { lanes: [string, TimelineEvent[]][]; start: number; end: number }) {
  const span = Math.max(1, end - start);
  const ticks = Array.from({ length: 5 }, (_, index) => start + (span * index) / 4);
  return (
    <div className="hidden overflow-x-auto sm:block">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[126px_minmax(520px,1fr)] gap-4 pb-3">
          <span />
          <div className="relative h-6 font-mono text-[11px] text-[#65736e]">
            {ticks.map((tick, index) => <span key={tick} className="absolute -translate-x-1/2" style={{ left: `${index * 25}%` }}>{formatMinute(tick)}</span>)}
          </div>
        </div>
        <div className="grid gap-3">
          {lanes.map(([lane, events]) => {
            const meta = laneMeta[lane] ?? { color: '#65736e', light: '#edf0ec', label: lane };
            return (
              <div key={lane} className="grid grid-cols-[126px_minmax(520px,1fr)] items-center gap-4">
                <div><p className="text-sm font-black">{meta.label}</p><p className="mt-0.5 text-xs text-[#65736e]">{events.length === 1 && !['RGB', '다분광', 'LiDAR'].includes(lane) ? events[0].detail.split(' · ').at(-1) : `${events.length}개 구간`}</p></div>
                <div className="relative h-11 overflow-hidden rounded-xl border border-border" style={{ background: meta.light }}>
                  {ticks.map((_, index) => <span key={index} className="absolute inset-y-0 border-l border-white/80" style={{ left: `${index * 25}%` }} />)}
                  {events.map((event) => {
                    const left = Math.max(0, Math.min(100, ((event.start - start) / span) * 100));
                    const width = Math.max(0.8, Math.min(100 - left, ((event.end - event.start) / span) * 100));
                    return <span key={event.id} title={`${event.label}\n${event.detail}${event.timeBasis ? `\n${event.timeBasis}` : ''}`} className="absolute top-2 h-7 rounded-md border border-white/70 shadow-sm transition hover:z-10 hover:brightness-90" style={{ left: `${left}%`, width: `${width}%`, background: meta.color }} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TimelineMobile({ lanes }: { lanes: [string, TimelineEvent[]][] }) {
  return (
    <div className="grid gap-3 sm:hidden">
      {lanes.map(([lane, events]) => {
        const meta = laneMeta[lane] ?? { color: '#65736e', light: '#edf0ec', label: lane };
        const first = Math.min(...events.map((event) => event.start));
        const last = Math.max(...events.map((event) => event.end));
        return <div key={lane} className="rounded-2xl border border-border p-4" style={{ background: meta.light }}><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 font-black"><i className="size-2.5 rounded-full" style={{ background: meta.color }} />{meta.label}</span><Badge variant="outline" className="bg-white/70">{events.length === 1 && !['RGB', '다분광', 'LiDAR'].includes(lane) ? '연속측정' : `${events.length}개 구간`}</Badge></div><p className="mt-3 font-mono text-lg font-black">{formatMinute(first)}–{formatMinute(last)}</p></div>;
      })}
    </div>
  );
}

function sensorIsTimed(sensor: string, lanes: Set<string>) {
  const normalized = sensor.toLowerCase();
  if ((normalized.includes('rgb') || normalized.includes('uav')) && lanes.has('RGB')) return true;
  if ((normalized.includes('rededge') || normalized.includes('red-edge') || normalized.includes('다분광')) && lanes.has('다분광')) return true;
  if (normalized.includes('lidar') && lanes.has('LiDAR')) return true;
  if (normalized.includes('specim') && lanes.has('Specim-IQ')) return true;
  if (normalized.includes('ramses') && lanes.has('RAMSES')) return true;
  if (normalized.includes('fenix') && lanes.has('FENIX')) return true;
  return false;
}

export function ObservationTimeline({ campaignId, campaignDate, domainId, timeWindow, sensors }: { campaignId: string; campaignDate: string; domainId: string; timeWindow?: string; sensors: string[] }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const source = domainId === 'tidal-flat' ? '/data/tidal-observations.json' : '/data/agriculture-observations.json';
    fetch(source)
      .then((response) => response.json() as Promise<Payload>)
      .then((payload) => setCampaign(payload.campaigns.find((entry) => entry.id === campaignId) ?? null))
      .finally(() => setLoaded(true));
  }, [campaignId, domainId]);

  const timeline = useMemo(() => campaign ? buildTimeline(campaign, campaignDate) : { events: [], mismatches: [] }, [campaign, campaignDate]);
  const lanes = useMemo(() => laneOrder.map((lane) => [lane, timeline.events.filter((event) => event.lane === lane)] as [string, TimelineEvent[]]).filter(([, events]) => events.length), [timeline.events]);
  const mismatchGroups = useMemo(() => {
    const grouped = new Map<string, { lane: string; recordedDate: string; count: number; firstTime: string; lastTime: string }>();
    for (const event of timeline.mismatches) {
      const key = `${event.lane}-${event.recordedDate}`;
      const firstTime = event.time.split('–')[0];
      const lastTime = event.time.split('–').at(-1) ?? firstTime;
      const current = grouped.get(key);
      if (current) {
        current.count += 1;
        if (firstTime < current.firstTime) current.firstTime = firstTime;
        if (lastTime > current.lastTime) current.lastTime = lastTime;
      } else grouped.set(key, { lane: event.lane, recordedDate: event.recordedDate, count: 1, firstTime, lastTime });
    }
    return [...grouped.values()];
  }, [timeline.mismatches]);
  const represented = useMemo(() => new Set([...lanes.map(([lane]) => lane), ...timeline.mismatches.map((event) => event.lane)]), [lanes, timeline.mismatches]);
  const untimedSensors = sensors.filter((sensor) => !sensorIsTimed(sensor, represented));
  const explicitRange = timeWindow ? rangeFromWindow(timeWindow) : null;
  const eventStarts = timeline.events.map((event) => event.start);
  const eventEnds = timeline.events.map((event) => event.end);
  const rawStart = Math.min(...eventStarts, ...(explicitRange ? [explicitRange.start] : []));
  const rawEnd = Math.max(...eventEnds, ...(explicitRange ? [explicitRange.end] : []));
  const start = Number.isFinite(rawStart) ? Math.max(0, Math.floor(rawStart / 10) * 10) : 0;
  const end = Number.isFinite(rawEnd) ? Math.min(1439, Math.ceil(rawEnd / 10) * 10) : 0;

  if (!loaded) return <div className="grid h-[260px] place-items-center rounded-[26px] bg-white text-sm text-[#65736e]">관측 타임라인을 구성하는 중입니다.</div>;

  return (
    <section className="py-8">
      <div className="rounded-[28px] border border-border bg-white p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div><p className="text-xs font-bold tracking-[0.13em] text-[#65736e] uppercase">Observation timeline</p><h2 className="mt-2 text-2xl font-black">데이터 관측 타임라인</h2><p className="mt-2 text-sm leading-6 text-[#65736e]">장비 메타데이터와 촬영폴더 시각을 관측일의 KST 시간축에 정렬했습니다.</p></div>
          {end > start && <div className="rounded-2xl bg-[#e8f6f5] px-5 py-3 text-right"><p className="text-xs font-bold text-[#46716f]">통합 관측창</p><p className="mt-1 font-mono text-xl font-black text-[#00535b]">{formatMinute(start)}–{formatMinute(end)}</p></div>}
        </div>

        {lanes.length && end > start ? <>
          <div className="my-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#f6f8f5] p-4"><Clock3 className="size-4 text-[#006d77]" /><p className="mt-4 text-xs font-bold text-[#65736e]">관측 지속시간</p><strong className="mt-1 block font-mono text-xl">{formatDuration(end - start)}</strong></div>
            <div className="rounded-2xl bg-[#f6f8f5] p-4"><Rows3 className="size-4 text-[#6a42b8]" /><p className="mt-4 text-xs font-bold text-[#65736e]">시간축 자료유형</p><strong className="mt-1 block font-mono text-xl">{lanes.length}</strong></div>
            <div className="rounded-2xl bg-[#f6f8f5] p-4"><RadioTower className="size-4 text-[#6a9f2f]" /><p className="mt-4 text-xs font-bold text-[#65736e]">개별 관측구간</p><strong className="mt-1 block font-mono text-xl">{timeline.events.length}</strong></div>
          </div>
          <TimelineDesktop lanes={lanes} start={start} end={end} />
          <TimelineMobile lanes={lanes} />
        </> : <div className="my-6 rounded-2xl border border-dashed border-border bg-[#f8faf7] p-8 text-center text-sm leading-6 text-[#65736e]">이 관측일에는 시간축으로 정렬할 수 있는 장비시각이 없습니다.</div>}

        {(timeline.mismatches.length > 0 || untimedSensors.length > 0) && <div className="mt-6 grid gap-3 border-t border-border pt-6 lg:grid-cols-2">
          {timeline.mismatches.length > 0 && <div className="rounded-2xl border border-[#f0c58e] bg-[#fff6e9] p-5"><h3 className="flex items-center gap-2 text-sm font-black text-[#9a5b0b]"><AlertTriangle className="size-4" />관측일과 다른 장비시각</h3><div className="mt-3 flex flex-wrap gap-2">{mismatchGroups.map((group) => <Badge key={`${group.lane}-${group.recordedDate}`} variant="outline" className="border-[#e4ba82] bg-white/70 text-[#7a5629]">{laneMeta[group.lane]?.label ?? group.lane} · {group.recordedDate} {group.firstTime}–{group.lastTime}{group.count > 1 ? ` · ${group.count}개` : ''}</Badge>)}</div><p className="mt-3 text-xs leading-5 text-[#7a5629]">총 {timeline.mismatches.length}개 원시 기록은 보존하되 주 관측시간축에는 합치지 않았습니다.</p></div>}
          {untimedSensors.length > 0 && <div className="rounded-2xl border border-border bg-[#f6f8f5] p-5"><h3 className="text-sm font-black">시각 메타데이터가 없는 자료</h3><div className="mt-3 flex flex-wrap gap-2">{untimedSensors.map((sensor) => <Badge key={sensor} variant="secondary" className="bg-white text-[#56635f]">{sensor}</Badge>)}</div><p className="mt-3 text-xs leading-5 text-[#65736e]">자료는 존재하지만 시작·종료시각을 확인할 수 없어 시간축 밖에 표시했습니다.</p></div>}
        </div>}

        <p className="mt-5 text-xs leading-5 text-[#7a8581]">막대에 마우스를 올리면 세트명과 시간 기준을 볼 수 있습니다. 촬영폴더 시각으로 보정한 구간은 원본 EXIF 장비시각과 함께 보존됩니다.</p>
      </div>
    </section>
  );
}
