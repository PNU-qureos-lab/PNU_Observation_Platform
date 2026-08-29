'use client';

import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

type RamsesPoint = { time: string; intensity: number; wavelength: number };
type TidalPayload = { campaigns: { id: string; ramses?: { actualNm?: number; unit?: string; series?: RamsesPoint[] } }[] };

const chartConfig = { intensity: { label: '복사강도', color: '#007f8a' } } satisfies ChartConfig;

export function RamsesChart({ campaignId }: { campaignId: string }) {
  const [series, setSeries] = useState<RamsesPoint[]>([]);
  const [meta, setMeta] = useState({ wavelength: 554.353, unit: 'mW/(m²·nm)' });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/data/tidal-observations.json')
      .then((response) => response.json() as Promise<TidalPayload>)
      .then((payload) => {
        const ramses = payload.campaigns.find((entry) => entry.id === campaignId)?.ramses;
        const raw = ramses?.series ?? [];
        const stride = Math.max(1, Math.ceil(raw.length / 320));
        setSeries(raw.filter((_, index) => index % stride === 0));
        setMeta({ wavelength: ramses?.actualNm ?? 554.353, unit: ramses?.unit ?? 'mW/(m²·nm)' });
      })
      .finally(() => setLoaded(true));
  }, [campaignId]);

  const data = useMemo(() => series.map((point) => ({
    time: new Date(point.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    intensity: Number(point.intensity.toFixed(3)),
  })), [series]);

  if (!loaded) return <div className="grid h-[280px] place-items-center rounded-2xl bg-[#edf0ec] text-sm text-[#65736e]">RAMSES 시계열을 불러오는 중입니다.</div>;
  if (!data.length) return <div className="grid h-[220px] place-items-center rounded-2xl border border-dashed border-border bg-[#f8faf7] p-8 text-center text-sm text-[#65736e]">이 관측일에는 공개 가능한 RAMSES 555 nm 시계열이 없습니다.</div>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-bold tracking-[0.12em] text-[#65736e] uppercase">RAMSES time series</p><h3 className="mt-1 text-lg font-black">555 nm 근접밴드 시계열</h3></div><p className="font-mono text-xs text-[#65736e]">{meta.wavelength} nm · {meta.unit}</p></div>
      <ChartContainer config={chartConfig} className="h-[300px] w-full aspect-auto">
        <LineChart data={data} margin={{ left: 0, right: 16, top: 12, bottom: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="time" tickLine={false} axisLine={false} minTickGap={42} />
          <YAxis tickLine={false} axisLine={false} width={54} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Line type="monotone" dataKey="intensity" stroke="var(--color-intensity)" strokeWidth={2.1} dot={false} isAnimationActive={false} />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
