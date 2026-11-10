export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" role="status" aria-label="Loading">
      <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-slate-300 animate-spin" />
    </div>
  );
}
