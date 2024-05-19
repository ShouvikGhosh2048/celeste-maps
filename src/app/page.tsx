import Link from "next/link";

export default async function HomePage() {
  return (
    <main className="space-y-5">
      <p className="text-center text-2xl">A website for statistics of various Celeste mod maps.</p>
      <p className="text-xl">Categories</p>
      <div className="py-3">
        <Link href="/bounding-box-dimensions" className="p-3 rounded bg-slate-900 text-white">Bounding box dimensions</Link>
      </div>
    </main>
  );
}
