import type { Metadata } from 'next';

import { SatelliteExplorer } from '@/components/satellite-explorer';

export const metadata: Metadata = { title: '위성자료', description: 'PlanetScope 관측일과 모든 장면의 미리보기, 운량, 공간해상도와 촬영영역을 확인합니다.' };

export default function SatellitePage() {
  return (
    <main className="shell py-9 sm:py-12">
      <div className="mb-8 max-w-3xl"><p className="text-xs font-bold tracking-[0.16em] text-[#5e35b1] uppercase">Orbital archive</p><h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">위성자료 탐색</h1><p className="mt-4 leading-7 text-[#65736e]">PlanetScope 8밴드 표면반사도 자료의 모든 촬영일과 장면 footprint, RGB 미리보기 및 품질 메타데이터를 공개합니다.</p></div>
      <SatelliteExplorer />
    </main>
  );
}
