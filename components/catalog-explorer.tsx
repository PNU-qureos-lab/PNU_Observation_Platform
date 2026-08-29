'use client';

import { useMemo, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ObservationCard } from '@/components/observation-card';
import { ObservationMap } from '@/components/observation-map';
import { domains, getSensorList, observations } from '@/lib/catalog';

export function CatalogExplorer({ initialDomain = 'all' }: { initialDomain?: string }) {
  const [domain, setDomain] = useState(initialDomain);
  const [sensor, setSensor] = useState('all');
  const [query, setQuery] = useState('');
  const sensors = getSensorList();
  const filtered = useMemo(() => observations.filter((item) => {
    const domainOk = domain === 'all' || item.domainId === domain;
    const sensorOk = sensor === 'all' || item.sensors.includes(sensor);
    const q = query.trim().toLowerCase();
    const queryOk = !q || [item.date, item.title, item.place, item.region, ...item.sensors].join(' ').toLowerCase().includes(q);
    return domainOk && sensorOk && queryOk;
  }), [domain, sensor, query]);

  return (
    <div className="grid gap-6 xl:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="h-fit rounded-[24px] border border-border bg-white p-5 xl:sticky xl:top-23">
        <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-black"><Filter className="size-4 text-[#006d77]" /> 탐색 필터</h2>{(domain !== 'all' || sensor !== 'all' || query) && <Button variant="ghost" size="xs" onClick={() => { setDomain('all'); setSensor('all'); setQuery(''); }}><X />초기화</Button>}</div>
        <label className="mt-5 block text-xs font-bold tracking-[0.12em] text-[#65736e] uppercase" htmlFor="catalog-search">검색</label>
        <div className="relative mt-2"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#65736e]" /><Input id="catalog-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="날짜, 장소, 센서" className="h-11 rounded-xl bg-[#f6f8f4] pl-9" /></div>

        <fieldset className="mt-6"><legend className="text-xs font-bold tracking-[0.12em] text-[#65736e] uppercase">관측 분야</legend><div className="mt-3 flex flex-wrap gap-2 xl:grid">
          <button type="button" onClick={() => setDomain('all')} className={`rounded-xl px-3 py-2 text-left text-sm font-bold ${domain === 'all' ? 'bg-[#006d77] text-white' : 'bg-[#edf0ec] text-[#465550]'}`}>전체 분야</button>
          {domains.map((entry) => <button key={entry.id} type="button" onClick={() => setDomain(entry.id)} className={`rounded-xl px-3 py-2 text-left text-sm font-bold ${domain === entry.id ? 'text-white' : 'bg-[#edf0ec] text-[#465550]'}`} style={domain === entry.id ? { background: entry.color } : undefined}>{entry.label} · {entry.labelEn}</button>)}
        </div></fieldset>

        <label className="mt-6 block text-xs font-bold tracking-[0.12em] text-[#65736e] uppercase" htmlFor="sensor-filter">센서·자료유형</label>
        <select id="sensor-filter" value={sensor} onChange={(event) => setSensor(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-input bg-[#f6f8f4] px-3 text-sm">
          <option value="all">전체 센서</option>{sensors.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
        </select>
      </aside>

      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[#65736e]"><strong className="font-mono text-xl text-[#16231f]">{filtered.length}</strong>건의 관측자료</p><div className="flex gap-2">{domain !== 'all' && <Badge variant="secondary">{domains.find((entry) => entry.id === domain)?.label}</Badge>}{sensor !== 'all' && <Badge variant="secondary">{sensor}</Badge>}</div></div>
        <ObservationMap items={filtered} className="h-[390px] border border-border shadow-sm sm:h-[470px]" />
        {filtered.length ? <div className="mt-6 grid gap-4 md:grid-cols-2">{filtered.map((item) => <ObservationCard key={item.id} item={item} compact />)}</div> : <div className="mt-6 rounded-[24px] border border-dashed border-border bg-white p-12 text-center"><p className="font-black">조건에 맞는 자료가 없습니다.</p><p className="mt-2 text-sm text-[#65736e]">분야나 센서 필터를 줄여 보세요.</p></div>}
      </section>
    </div>
  );
}
