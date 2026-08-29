import type { Metadata } from 'next';

import { CatalogExplorer } from '@/components/catalog-explorer';

export const metadata: Metadata = { title: '관측자료 탐색', description: '분야, 장소, 날짜와 센서로 공개 관측자료를 탐색합니다.' };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ domain?: string }> }) {
  const { domain } = await searchParams;
  return (
    <main className="shell py-9 sm:py-12">
      <div className="mb-8 max-w-3xl"><p className="text-xs font-bold tracking-[0.16em] text-[#006d77] uppercase">Unified catalog</p><h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">관측자료 탐색</h1><p className="mt-4 leading-7 text-[#65736e]">갯벌과 농림 관측을 같은 날짜·위치·센서 체계로 검색합니다. 지도와 목록은 선택한 필터에 맞춰 함께 갱신됩니다.</p></div>
      <CatalogExplorer initialDomain={domain ?? 'all'} />
    </main>
  );
}
