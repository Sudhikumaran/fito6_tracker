export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-4 space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-secondary/40 animate-pulse" />
      ))}
    </div>
  );
}
