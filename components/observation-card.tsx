import { ArrowRight, Clock3, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { domains, type Observation } from '@/lib/catalog';

const statusCopy = {
  ready: '원자료 확인',
  processed: '가공자료 포함',
  review: '검토사항 있음',
};

export function ObservationCard({ item, compact = false }: { item: Observation; compact?: boolean }) {
  const domain = domains.find((entry) => entry.id === item.domainId)!;
  return (
    <a href={`/observations/${item.id}`} className="group block">
      <Card className="gap-0 overflow-hidden rounded-[24px] border-0 py-0 ring-1 ring-[#d7dfda] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_22px_50px_rgba(22,72,58,.10)]">
        <div className={`relative overflow-hidden bg-[#e7ece8] ${compact ? 'aspect-[16/7]' : 'aspect-[16/8.5]'}`}>
          {item.cover ? <img src={item.cover} alt={`${item.place} ${item.date} 대표사진`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="data-grid h-full" />}
          <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-black backdrop-blur" style={{ color: domain.color }}>{domain.label}</span>
          <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur ${item.status === 'review' ? 'bg-[#fff2df] text-[#a35d00]' : 'bg-white/90 text-[#465550]'}`}>{statusCopy[item.status]}</span>
        </div>
        <CardContent className="p-5">
          <p className="font-mono text-xl font-black tracking-[-0.05em]">{item.date}</p>
          <h3 className="mt-2 text-base font-black tracking-[-0.025em]">{item.title}</h3>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#65736e]">
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{item.place}</span>
            {item.timeWindow && <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" />{item.timeWindow}</span>}
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.sensors.slice(0, 4).map((sensor) => <Badge key={sensor} variant="secondary" className="bg-[#edf0ec] text-[10px] text-[#465550]">{sensor}</Badge>)}
            {item.sensors.length > 4 && <Badge variant="outline" className="text-[10px]">+{item.sensors.length - 4}</Badge>}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs font-bold text-[#006d77]"><span>관측 상세</span><ArrowRight className="size-4 transition group-hover:translate-x-1" /></div>
        </CardContent>
      </Card>
    </a>
  );
}
