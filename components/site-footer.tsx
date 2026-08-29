export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-white/55">
      <div className="shell flex flex-col gap-3 py-8 text-sm text-[#65736e] sm:flex-row sm:items-center sm:justify-between">
        <p><strong className="text-[#00535b]">PNU Observation Hub</strong> · 공개 통합 관측자료 플랫폼</p>
        <p>Map data © OpenStreetMap contributors</p>
      </div>
    </footer>
  );
}
