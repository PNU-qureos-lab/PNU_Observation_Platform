import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Clock3, Database, ExternalLink, FileArchive, Images, MapPin, Navigation, Plane, RadioTower } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { FlightTrackExplorer } from '@/components/flight-track-explorer';
import { ObservationTimeline } from '@/components/observation-timeline';
import { ObservationMap } from '@/components/observation-map';
import { RamsesChart } from '@/components/ramses-chart';
import { domains, getDomain, getObservation, observations } from '@/lib/catalog';

export function generateStaticParams() {
  return observations.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = getObservation(id);
  if (!item) return {};
  return {
    title: `${item.date} ${item.place}`,
    description: item.summary,
    openGraph: { title: `${item.date} ${item.title}`, description: item.summary, images: item.cover ? [item.cover] : [] },
    twitter: { card: item.cover ? 'summary_large_image' : 'summary', title: `${item.date} ${item.title}`, description: item.summary, images: item.cover ? [item.cover] : [] },
  };
}

function galleryFor(id: string, cover?: string) {
  if (!cover) return [];
  if (cover.includes('/agri/') && /-rgb-50\./.test(cover)) return [25, 50, 75].map((value) => ({ src: cover.replace('-rgb-50.', `-rgb-${value}.`), label: `비행 ${value}% 표본` }));
  if (cover.includes('/tidal/thumbs/') && /\/0[1-4]-/.test(cover)) return [1, 2, 3, 4].map((value) => ({ src: cover.replace(/\/0[1-4]-/, `/0${value}-`), label: `대표 미리보기 ${value}` }));
  return [{ src: cover, label: id.includes('sky') ? '하늘상태 대표사진' : '대표 미리보기' }];
}

const qualityCopy = { measured: '실측 GPS', centroid: 'GPS 중심좌표', reference: '참고좌표', unknown: '위치 미확인' };

export default async function ObservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getObservation(id);
  if (!item) notFound();
  const domain = getDomain(item.domainId)!;
  const gallery = galleryFor(item.id, item.cover);
  const hasRamses = item.sensors.includes('RAMSES');

  return (
    <main className="shell py-8 sm:py-12">
      <a href="/explore" className="inline-flex items-center gap-2 text-sm font-bold text-[#65736e] hover:text-[#006d77]"><ArrowLeft className="size-4" /> 관측자료로 돌아가기</a>
      <div className="mt-6 flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div><Badge className="mb-4" style={{ background: domain.light, color: domain.color }}>{domain.label} · {domain.labelEn}</Badge><p className="font-mono text-sm font-bold text-[#65736e]">OBS-{item.date.replaceAll('-', '')}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.055em] sm:text-5xl">{item.date} {item.title}</h1><p className="mt-4 flex items-center gap-2 text-[#65736e]"><MapPin className="size-4" />{item.region} · {item.place}</p></div>
        <a href={item.repository} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#006d77] px-5 text-sm font-bold text-white">GitHub 원본 보기 <ExternalLink className="size-4" /></a>
      </div>

      <section className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="overflow-hidden rounded-[28px] border border-border bg-white p-2"><ObservationMap items={[item]} className="h-[460px] lg:h-[560px]" /></div>
        <aside className="grid content-start gap-4">
          <div className="rounded-[24px] border border-border bg-white p-6"><p className="text-xs font-bold tracking-[0.13em] text-[#65736e] uppercase">Observation window · KST</p><p className="mt-2 font-mono text-3xl font-black text-[#00535b]">{item.timeWindow ?? '확인 중'}</p><p className="mt-3 text-sm leading-6 text-[#65736e]">Asia/Seoul · UTC+09 · 센서별 상세 구간은 아래 통합 타임라인에서 확인</p></div>
          <div className="rounded-[24px] border border-border bg-white p-6"><h2 className="font-black">위치 품질</h2><div className="mt-4 flex items-start gap-3"><Navigation className="mt-0.5 size-5 text-[#006d77]" /><div><p className="font-bold">{qualityCopy[item.positionQuality]}</p><p className="mt-1 text-sm leading-6 text-[#65736e]">{item.coordinateSource ?? 'GPS 메타데이터 없음'}</p>{item.latitude != null && <p className="mt-2 font-mono text-xs text-[#65736e]">{item.latitude.toFixed(6)}, {item.longitude?.toFixed(6)}</p>}</div></div></div>
          <div className="rounded-[24px] border border-border bg-white p-6"><h2 className="font-black">활성 센서·자료</h2><div className="mt-4 flex flex-wrap gap-2">{item.sensors.map((sensor) => <Badge key={sensor} variant="secondary" className="bg-[#edf0ec] text-[#465550]">{sensor}</Badge>)}</div></div>
          {item.note && <div className="rounded-[24px] border border-[#f0c58e] bg-[#fff6e9] p-6"><h2 className="flex items-center gap-2 font-black text-[#9a5b0b]"><AlertTriangle className="size-4" />자료 주의사항</h2><p className="mt-3 text-sm leading-6 text-[#7a5629]">{item.note}</p></div>}
        </aside>
      </section>

      <section className="grid gap-5 pb-8 md:grid-cols-4">
        <div className="rounded-[22px] border border-border bg-white p-5"><Clock3 className="size-5 text-[#006d77]" /><p className="mt-6 text-xs font-bold text-[#65736e]">관측시간 · KST</p><strong className="mt-1 block font-mono text-xl">{item.timeWindow ?? '미확인'}</strong></div>
        <div className="rounded-[22px] border border-border bg-white p-5"><Plane className="size-5 text-[#006d77]" /><p className="mt-6 text-xs font-bold text-[#65736e]">촬영 세트</p><strong className="mt-1 block font-mono text-xl">{item.trackSets ?? 0}</strong></div>
        <div className="rounded-[22px] border border-border bg-white p-5"><Images className="size-5 text-[#4f8f24]" /><p className="mt-6 text-xs font-bold text-[#65736e]">RGB 이미지</p><strong className="mt-1 block font-mono text-xl">{item.imageCount?.toLocaleString() ?? '—'}</strong></div>
        <div className="rounded-[22px] border border-border bg-white p-5"><RadioTower className="size-5 text-[#5e35b1]" /><p className="mt-6 text-xs font-bold text-[#65736e]">센서·자료유형</p><strong className="mt-1 block font-mono text-xl">{item.sensors.length}</strong></div>
      </section>

      <ObservationTimeline campaignId={item.id} campaignDate={item.date} domainId={item.domainId} timeWindow={item.timeWindow} sensors={item.sensors} />

      <FlightTrackExplorer campaignId={item.id} domainId={item.domainId} />

      <section className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]">
        <div className="rounded-[26px] border border-border bg-white p-6 sm:p-8"><p className="text-xs font-bold tracking-[0.13em] text-[#65736e] uppercase">Observation summary</p><h2 className="mt-2 text-2xl font-black">관측 개요</h2><p className="mt-5 text-base leading-8 text-[#465550]">{item.summary}</p>{hasRamses && <div className="mt-8 border-t border-border pt-8"><RamsesChart campaignId={item.id} domainId={item.domainId} /></div>}</div>
        <div className="rounded-[26px] border border-border bg-[#143f43] p-6 text-white sm:p-8"><FileArchive className="size-6 text-[#82d3de]" /><h2 className="mt-8 text-xl font-black">데이터 파이프라인</h2><div className="mt-6 grid gap-3 text-sm"><div className="flex items-center justify-between rounded-xl bg-white/8 px-4 py-3"><span>원자료 RAW</span><strong>공개</strong></div><div className="flex items-center justify-between rounded-xl bg-white/8 px-4 py-3"><span>처리자료 PROC</span><strong>{item.status === 'ready' ? '확인 중' : '공개'}</strong></div><div className="flex items-center justify-between rounded-xl bg-white/8 px-4 py-3"><span>결과자료 RESULT</span><strong>{item.status === 'processed' ? '공개' : '자료별 상이'}</strong></div></div><a href={item.repository} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-[#143f43]"><Database className="size-4" /> 저장소 열기</a></div>
      </section>

      {item.sessions?.length ? <section className="py-8"><div className="mb-5"><p className="text-xs font-bold tracking-[0.13em] text-[#65736e] uppercase">Sessions</p><h2 className="mt-2 text-2xl font-black">관측·촬영 세션</h2></div><div className="grid gap-3 md:grid-cols-2">{item.sessions.map((session, index) => <div key={`${session}-${index}`} className="flex items-center justify-between rounded-[20px] border border-border bg-white p-5"><div><p className="text-xs font-bold text-[#65736e]">SESSION {String(index + 1).padStart(2, '0')}</p><p className="mt-1 font-mono font-bold">{session}</p></div><Plane className="size-5 text-[#006d77]" /></div>)}</div></section> : null}

      {gallery.length ? <section className="py-8"><div className="mb-5"><p className="text-xs font-bold tracking-[0.13em] text-[#65736e] uppercase">Observation media</p><h2 className="mt-2 text-2xl font-black">예시자료</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{gallery.map((media) => <figure key={media.src} className="overflow-hidden rounded-[22px] border border-border bg-white"><img src={media.src} alt={`${item.place} ${media.label}`} loading="lazy" className="aspect-[4/3] w-full object-cover" /><figcaption className="p-4 text-sm font-bold">{media.label}</figcaption></figure>)}</div></section> : null}
    </main>
  );
}
