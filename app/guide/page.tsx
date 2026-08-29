import type { Metadata } from 'next';
import { Boxes, CheckCircle2, Code2, Database, FileJson2, Layers3, MapPinned, Plus, Workflow } from 'lucide-react';

import { domains, observations, satelliteAcquisitions } from '@/lib/catalog';

export const metadata: Metadata = { title: '데이터 이용안내', description: '통합 관측자료의 공개정책, 공통 스키마와 새 관측 분야 추가 방법을 설명합니다.' };

const schema = [
  ['domainId', '관측 분야 레지스트리 연결키'], ['date / observedAt', '대표 관측일과 실제 장비시각'], ['site / region', '관측지와 행정구역'], ['geometry', 'GPS 점·비행경로·촬영영역'], ['positionQuality', '실측·중심·참고·미확인 좌표'], ['sensors', '센서 및 자료유형 배열'], ['status', '원자료·가공자료·검토 상태'], ['caveat', '날짜·위치·폴더 관련 주의사항'],
];

export default function GuidePage() {
  return (
    <main className="shell py-10 sm:py-14">
      <section className="max-w-4xl"><p className="text-xs font-bold tracking-[0.16em] text-[#006d77] uppercase">Open data & extensibility</p><h1 className="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-6xl">데이터 이용안내</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-[#65736e]">이 플랫폼은 갯벌과 농림에 한정된 사이트가 아니라, 새로운 관측 분야를 같은 규칙으로 계속 추가하는 공개 카탈로그입니다.</p></section>

      <section className="mt-12 grid gap-5 lg:grid-cols-3">
        <div className="rounded-[26px] border border-border bg-white p-7"><Database className="size-6 text-[#006d77]" /><p className="mt-8 text-xs font-bold tracking-[0.12em] text-[#65736e] uppercase">Field observations</p><strong className="mt-2 block font-mono text-4xl tracking-[-0.06em]">{observations.length}</strong><p className="mt-2 text-sm text-[#65736e]">현재 등록된 현장 관측일</p></div>
        <div className="rounded-[26px] border border-border bg-white p-7"><Layers3 className="size-6 text-[#5e35b1]" /><p className="mt-8 text-xs font-bold tracking-[0.12em] text-[#65736e] uppercase">Satellite dates</p><strong className="mt-2 block font-mono text-4xl tracking-[-0.06em]">{satelliteAcquisitions.length}</strong><p className="mt-2 text-sm text-[#65736e]">PlanetScope 촬영일</p></div>
        <div className="rounded-[26px] border border-border bg-[#143f43] p-7 text-white"><Boxes className="size-6 text-[#82d3de]" /><p className="mt-8 text-xs font-bold tracking-[0.12em] text-white/60 uppercase">Registered domains</p><strong className="mt-2 block font-mono text-4xl tracking-[-0.06em]">{domains.length}</strong><p className="mt-2 text-sm text-white/65">카탈로그 기반으로 무제한 확장 가능</p></div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <div className="rounded-[28px] border border-border bg-white p-7 sm:p-9"><p className="text-xs font-bold tracking-[0.13em] text-[#006d77] uppercase">Public data policy</p><h2 className="mt-2 text-2xl font-black">완전 공개 원칙</h2><div className="mt-7 grid gap-4 text-sm leading-6 text-[#465550]">{['사이트와 카탈로그는 로그인 없이 공개', '원자료·처리자료·결과자료의 공개 상태 표시', '대용량 원본은 저장소 또는 외부 다운로드로 연결', 'OSM과 원자료 출처를 페이지별로 표시', '원시시각과 보정시각을 함께 보존'].map((text) => <p key={text} className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#4f8f24]" />{text}</p>)}</div></div>
        <div className="rounded-[28px] border border-border bg-white p-7 sm:p-9"><p className="text-xs font-bold tracking-[0.13em] text-[#006d77] uppercase">Common schema</p><h2 className="mt-2 text-2xl font-black">모든 분야가 공유하는 필드</h2><div className="mt-7 divide-y divide-border">{schema.map(([field, meaning]) => <div key={field} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr]"><code className="font-mono text-sm font-bold text-[#00535b]">{field}</code><p className="text-sm text-[#65736e]">{meaning}</p></div>)}</div></div>
      </section>

      <section className="mt-14 rounded-[30px] border border-border bg-[#eaf3ec] p-7 sm:p-10"><div className="max-w-3xl"><p className="text-xs font-bold tracking-[0.13em] text-[#4f8f24] uppercase">Add a new domain</p><h2 className="mt-2 text-3xl font-black tracking-[-0.045em]">새 관측 분야 추가 절차</h2><p className="mt-4 leading-7 text-[#65736e]">해양수질, 하천, 산림, 대기, 도시열환경 등 어떤 분야든 아래 세 단계로 기존 검색·지도·상세화면에 연결됩니다.</p></div><div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[22px] bg-white p-6"><Plus className="size-5 text-[#006d77]" /><p className="mt-7 font-mono text-xs text-[#65736e]">STEP 01</p><h3 className="mt-1 font-black">분야 레지스트리 등록</h3><p className="mt-3 text-sm leading-6 text-[#65736e]">분야 ID, 이름, 설명, 대표색을 한 번 정의합니다.</p></div>
        <div className="rounded-[22px] bg-white p-6"><FileJson2 className="size-5 text-[#006d77]" /><p className="mt-7 font-mono text-xs text-[#65736e]">STEP 02</p><h3 className="mt-1 font-black">공통 스키마 변환</h3><p className="mt-3 text-sm leading-6 text-[#65736e]">날짜·장소·센서·위치·상태를 공통 필드로 매핑합니다.</p></div>
        <div className="rounded-[22px] bg-white p-6"><Workflow className="size-5 text-[#006d77]" /><p className="mt-7 font-mono text-xs text-[#65736e]">STEP 03</p><h3 className="mt-1 font-black">화면 자동 연결</h3><p className="mt-3 text-sm leading-6 text-[#65736e]">분야 탭, 필터, 지도, 상세 URL이 카탈로그에서 자동 생성됩니다.</p></div>
      </div></section>

      <section className="mt-14 grid gap-5 md:grid-cols-2"><a href="https://github.com/PNU-qureos-lab/PNU_Observation_Platform" target="_blank" rel="noreferrer" className="group rounded-[24px] border border-border bg-white p-7"><Code2 className="size-5 text-[#006d77]" /><h2 className="mt-7 text-xl font-black">통합 공개 저장소</h2><p className="mt-2 text-sm text-[#65736e]">사이트 코드, 공통 카탈로그, 축소 미리보기와 공개 메타데이터를 한곳에서 관리합니다.</p></a><div className="rounded-[24px] border border-border bg-white p-7"><MapPinned className="size-5 text-[#4f8f24]" /><h2 className="mt-7 text-xl font-black">원본 이력 보존</h2><p className="mt-2 text-sm text-[#65736e]">기존 갯벌·농림 저장소는 통합본 검증 뒤 읽기 전용 아카이브로 전환합니다.</p></div></section>
    </main>
  );
}
