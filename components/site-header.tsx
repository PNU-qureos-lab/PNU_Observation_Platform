'use client';

import { Code2, Database, Menu, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { domains } from '@/lib/catalog';

const mainLinks = [
  { href: '/explore', label: '전체 관측' },
  { href: '/satellite', label: '위성자료' },
  { href: '/guide', label: '이용안내' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-[#f6f8f4]/90 backdrop-blur-xl">
      <div className="shell flex h-17 items-center justify-between gap-5">
        <a href="/" className="flex min-w-0 items-center gap-3 font-black tracking-[-0.04em] text-[#00535b]">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#006d77] text-white"><Database className="size-4" /></span>
          <span className="truncate">PNU Observation Hub</span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#465550] lg:flex" aria-label="주요 메뉴">
          {mainLinks.slice(0, 1).map((link) => <a key={link.href} href={link.href} className="hover:text-[#006d77]">{link.label}</a>)}
          {domains.map((domain) => <a key={domain.id} href={`/explore?domain=${domain.id}`} className="hover:text-[#006d77]">{domain.label}</a>)}
          {mainLinks.slice(1).map((link) => <a key={link.href} href={link.href} className="hover:text-[#006d77]">{link.label}</a>)}
          <a href="https://github.com/PNU-qureos-lab/PNU_Observation_Platform" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-[#006d77]"><Code2 className="size-4" /> GitHub</a>
        </nav>

        <div className="flex items-center gap-2">
          <Button nativeButton={false} render={<a href="/explore" aria-label="관측자료 검색" />} variant="outline" size="icon" className="rounded-full bg-white"><Search /></Button>
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="icon" className="rounded-full bg-white lg:hidden" aria-label="메뉴 열기" />}><Menu /></SheetTrigger>
            <SheetContent className="w-[min(88vw,380px)] bg-[#f6f8f4]">
              <SheetHeader className="border-b border-border px-6 py-6">
                <SheetTitle className="text-left text-lg font-black text-[#00535b]">PNU Observation Hub</SheetTitle>
                <SheetDescription className="text-left">통합 관측자료 탐색 메뉴</SheetDescription>
              </SheetHeader>
              <nav className="grid gap-1 px-4" aria-label="모바일 메뉴">
                {mainLinks.slice(0, 1).map((link) => <a key={link.href} href={link.href} className="rounded-xl px-4 py-3 font-bold hover:bg-white">{link.label}</a>)}
                {domains.map((domain) => <a key={domain.id} href={`/explore?domain=${domain.id}`} className="rounded-xl px-4 py-3 font-bold hover:bg-white">{domain.label} 관측</a>)}
                {mainLinks.slice(1).map((link) => <a key={link.href} href={link.href} className="rounded-xl px-4 py-3 font-bold hover:bg-white">{link.label}</a>)}
                <a href="https://github.com/PNU-qureos-lab/PNU_Observation_Platform" target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 font-bold"><Code2 className="size-4" /> 통합 GitHub</a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
