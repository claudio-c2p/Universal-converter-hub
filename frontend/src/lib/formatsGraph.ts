export async function fetchFormatsGraph(): Promise<Record<string, string[]>> {
  const res = await fetch('/api/formats-graph');
  if (!res.ok) throw new Error('Não foi possível carregar os formatos disponíveis.');
  return res.json();
}
