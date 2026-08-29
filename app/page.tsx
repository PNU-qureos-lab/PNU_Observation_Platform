import { ArrowRight, CalendarDays, Database, Map, Satellite, Sprout, Waves } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { domains, observations, satelliteAcquisitions } from '@/lib/catalog';

const iconMap = { waves: Waves, sprout: Sprout, layers: Database };

function statusLabel(status: string) {
  if (status === 'processed') return '가공자료 포함';
  if (status === 'review') return '검토사항 있음';
  return '원자료 확인';
}

export default function Home() {
  const recent = observations.slice(0, 4);
  const sensors = new Set(observations.flatMap((item) => item.sensors));

  return (
    <main>
      <section className="shell grid gap-8 py-10 lg:grid-cols-[1.08fr_.92fr] lg:py-14">
        <div className="flex flex-col justify-center">
          <p className="mb-5 flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-[#006d77] uppercase"><span className="size-2 rounded-full bg-[#43a047]" />Empirical data archive</p>
          <h1 className="max-w-3xl text-4xl leading-[1.13] font-black tracking-[-0.055em] text-[#10201b] sm:text-5xl lg:text-[4rem]">
            분야가 늘어나도 함께 자라는<br /><span className="text-[#006d77]">통합 관측자료 플랫폼</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#65736e] sm:text-lg">
            갯벌과 농림을 시작으로 현장·드론·항공·위성 자료를 하나의 날짜, 위치, 센서 체계로 탐색합니다. 새로운 관측 분야는 카탈로그에 등록하는 즉시 같은 화면에 연결됩니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/explore" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#006d77] px-6 text-sm font-bold text-white transition hover:bg-[#00535b]">관측자료 탐색 <ArrowRight className="size-4" /></a>
            <a href="/satellite" className="inline-flex h-12 items-center gap-2 rounded-full border border-[#006d77] bg-white px-6 text-sm font-bold text-[#00535b] transition hover:bg-[#e8f6f5]"><Satellite className="size-4" /> 위성자료 보기</a>
          </div>
        </div>

        <div className="data-grid relative min-h-[390px] overflow-hidden rounded-[30px] border border-[#cddbd5] bg-[#eaf1ec] p-5 sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_62%,rgba(0,172,193,.18),transparent_18rem),radial-gradient(circle_at_78%_28%,rgba(124,179,66,.19),transparent_16rem)]" />
          <div className="relative grid h-full content-between gap-8">
            <div className="flex items-center justify-between">
              <Badge className="h-7 bg-white/85 text-[#00535b] shadow-sm">LIVE CATALOG</Badge>
              <span className="font-mono text-xs text-[#65736e]">UPDATED 2026.08</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/80 bg-white/78 p-5 backdrop-blur-xl">
                <CalendarDays className="mb-7 size-5 text-[#007f8a]" />
                <strong className="block font-mono text-4xl tracking-[-0.06em]">{observations.length}</strong>
                <span className="mt-1 block text-sm text-[#65736e]">현장 관측일</span>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/78 p-5 backdrop-blur-xl">
                <Satellite className="mb-7 size-5 text-[#5e35b1]" />
                <strong className="block font-mono text-4xl tracking-[-0.06em]">{satelliteAcquisitions.length}</strong>
                <span className="mt-1 block text-sm text-[#65736e]">위성 촬영일</span>
              </div>
              <div className="col-span-2 flex items-center justify-between rounded-3xl border border-white/80 bg-[#143f43] p-5 text-white">
                <div><span className="text-xs text-white/65">등록 센서·자료유형</span><strong className="mt-1 block font-mono text-2xl">{sensors.size}</strong></div>
                <Map className="size-9 text-[#82d3de]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell pb-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold tracking-[0.16em] text-[#65736e] uppercase">Observation domains</p><h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">현재 등록된 관측 분야</h2></div>
          <p className="hidden text-sm text-[#65736e] sm:block">새 분야는 데이터 레지스트리로 확장</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {domains.map((domain) => {
            const Icon = iconMap[domain.icon];
            const count = observations.filter((item) => item.domainId === domain.id).length;
            return (
              <a key={domain.id} href={`/explore?domain=${domain.id}`} className="group rounded-[26px] border border-border bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(22,72,58,.10)] sm:p-7">
                <div className="flex items-start justify-between gap-5">
                  <span className="grid size-12 place-items-center rounded-2xl" style={{ background: domain.light, color: domain.color }}><Icon className="size-6" /></span>
                  <span className="font-mono text-sm text-[#65736e]">{String(count).padStart(2, '0')} records</span>
                </div>
                <h3 className="mt-8 text-2xl font-black tracking-[-0.04em]">{domain.label} <span className="text-base font-medium text-[#65736e]">{domain.labelEn}</span></h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#65736e]">{domain.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold" style={{ color: domain.color }}>분야 자료 보기 <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-white/65 py-14">
        <div className="shell">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold tracking-[0.16em] text-[#65736e] uppercase">Recent observations</p><h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">최근 관측자료</h2></div>
            <a href="/explore" className="text-sm font-bold text-[#006d77]">전체 보기 →</a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((item) => {
              const domain = domains.find((entry) => entry.id === item.domainId)!;
              return (
                <a key={item.id} href={`/observations/${item.id}`} className="group block">
                <Card className="gap-0 overflow-hidden rounded-[24px] border-0 py-0 ring-1 ring-[#d7dfda] transition group-hover:-translate-y-1">
                  <div className="relative aspect-[4/2.35] overflow-hidden bg-[#e7ece8]">
                    {item.cover ? <img src={item.cover} alt={`${item.place} ${item.date} 대표사진`} className="h-full w-full object-cover transition duration-500 hover:scale-105" /> : <div className="data-grid h-full" />}
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold backdrop-blur" style={{ color: domain.color }}>{domain.label}</span>
                  </div>
                  <CardContent className="p-5">
                    <p className="font-mono text-xl font-bold tracking-[-0.05em]">{item.date}</p>
                    <h3 className="mt-2 font-bold">{item.title}</h3>
                    <div className="mt-4 flex flex-wrap gap-1.5">{item.sensors.slice(0, 3).map((sensor) => <Badge key={sensor} variant="secondary" className="bg-[#edf0ec] text-[10px] text-[#465550]">{sensor}</Badge>)}</div>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-[#65736e]"><span>{statusLabel(item.status)}</span><ArrowRight className="size-4" /></div>
                  </CardContent>
                </Card>
                </a>
              );
            })}
          </div>
        </div>
      </section>

    </main>
  );
}
