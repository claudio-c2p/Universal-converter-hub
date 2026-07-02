'use client';
import { useMemo, useState } from 'react';
import ToolLayout from '@/components/ui/ToolLayout';

type Category = 'comprimento' | 'peso' | 'temperatura';

const LENGTH_TO_M: Record<string, number> = { mm: 0.001, cm: 0.01, m: 1, km: 1000, pol: 0.0254, pé: 0.3048, jarda: 0.9144, milha: 1609.344 };
const WEIGHT_TO_KG: Record<string, number> = { mg: 0.000001, g: 0.001, kg: 1, tonelada: 1000, oz: 0.0283495, lb: 0.453592 };

function celsiusTo(unit: string, c: number) {
  if (unit === 'C') return c;
  if (unit === 'F') return c * 9 / 5 + 32;
  return c + 273.15; // K
}
function toCelsius(unit: string, v: number) {
  if (unit === 'C') return v;
  if (unit === 'F') return (v - 32) * 5 / 9;
  return v - 273.15; // K
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>('comprimento');
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');

  const units = category === 'comprimento' ? Object.keys(LENGTH_TO_M)
    : category === 'peso' ? Object.keys(WEIGHT_TO_KG)
    : ['C', 'F', 'K'];

  const result = useMemo(() => {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    if (category === 'comprimento') {
      const meters = n * (LENGTH_TO_M[fromUnit] ?? 1);
      return meters / (LENGTH_TO_M[toUnit] ?? 1);
    }
    if (category === 'peso') {
      const kg = n * (WEIGHT_TO_KG[fromUnit] ?? 1);
      return kg / (WEIGHT_TO_KG[toUnit] ?? 1);
    }
    const c = toCelsius(fromUnit, n);
    return celsiusTo(toUnit, c);
  }, [category, value, fromUnit, toUnit]);

  function handleCategoryChange(c: Category) {
    setCategory(c);
    if (c === 'comprimento') { setFromUnit('m'); setToUnit('km'); }
    else if (c === 'peso') { setFromUnit('kg'); setToUnit('g'); }
    else { setFromUnit('C'); setToUnit('F'); }
  }

  return (
    <ToolLayout title="Conversor de Unidades" description="Converta entre unidades de comprimento, peso e temperatura." category="Texto">
      <div className="flex gap-2">
        {(['comprimento', 'peso', 'temperatura'] as Category[]).map((c) => (
          <button key={c} onClick={() => handleCategoryChange(c)}
            className={`rounded-md px-3 py-1.5 text-sm border capitalize ${category === c ? 'bg-brand-accent text-white border-brand-accent' : 'border-brand-border dark:border-gray-700'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <label className="text-sm">
          <span className="block mb-1 text-brand-muted dark:text-gray-400">Valor</span>
          <input value={value} onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-brand-muted dark:text-gray-400">De</span>
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}
            className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2">
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-brand-muted dark:text-gray-400">Para</span>
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}
            className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2">
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-6 rounded-md border border-brand-border dark:border-gray-700 p-4 text-center">
        <span className="text-2xl font-semibold font-mono">
          {result !== null ? result.toLocaleString('pt-BR', { maximumFractionDigits: 6 }) : '—'}
        </span>
        <span className="ml-2 text-brand-muted dark:text-gray-400">{toUnit}</span>
      </div>
    </ToolLayout>
  );
}
