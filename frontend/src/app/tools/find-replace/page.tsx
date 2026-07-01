'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

interface MatchPreview { line: number; context: string; match: string; }
type Status = 'idle' | 'loading' | 'success' | 'error';

/** Envolve o texto do match em destaque dentro do contexto da linha. */
function highlightMatch(context: string, match: string): React.ReactNode {
  if (!match) return <span>{context}</span>;
  try {
    const idx = context.indexOf(match);
    if (idx === -1) return <span>{context}</span>;
    return (
      <>
        {context.slice(0, idx)}
        <mark className="bg-yellow-200 dark:bg-yellow-700/60 rounded px-0.5">{match}</mark>
        {context.slice(idx + match.length)}
      </>
    );
  } catch {
    return <span>{context}</span>;
  }
}

export default function FindReplacePage() {
  const [file,          setFile]          = useState<File | null>(null);
  const [search,        setSearch]        = useState('');
  const [replace,       setReplace]       = useState('');
  const [useRegex,      setUseRegex]      = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [wholeWord,     setWholeWord]     = useState(false);
  const [previews,      setPreviews]      = useState<MatchPreview[]>([]);
  const [totalMatches,  setTotalMatches]  = useState<number | null>(null);
  const [status,        setStatus]        = useState<Status>('idle');
  const [errMsg,        setErrMsg]        = useState('');
  const [count,         setCount]         = useState<number | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  async function handlePreview() {
    if (!file || !search) return;
    setPreviews([]); setTotalMatches(null); setErrMsg('');
    const body = new FormData();
    body.append('file',          file);
    body.append('searchTerm',    search);
    body.append('useRegex',      String(useRegex));
    body.append('caseSensitive', String(caseSensitive));
    try {
      const res  = await fetch(`${baseUrl}/api/find-replace/preview`, { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
      setPreviews(data.matches ?? []);
      setTotalMatches(data.total ?? data.matches?.length ?? 0);
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : 'Erro ao pré-visualizar.');
    }
  }

  async function handleApply() {
    if (!file || !search) return;
    setStatus('loading'); setErrMsg(''); setCount(null);
    try {
      const body = new FormData();
      body.append('file',          file);
      body.append('search',        search);
      body.append('replace',       replace);
      body.append('useRegex',      String(useRegex));
      body.append('caseSensitive', String(caseSensitive));
      body.append('wholeWord',     String(wholeWord));

      const res = await fetch(`${baseUrl}/api/find-replace/apply`, { method: 'POST', body });

      // Sem ocorrências — backend retorna 200 com JSON
      if (res.headers.get('Content-Type')?.includes('application/json')) {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error ?? `Erro ${res.status}`);
        if (d.noMatches) {
          setErrMsg('Nenhuma ocorrência encontrada. Nada foi alterado.');
          setStatus('error');
          return;
        }
      }

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Erro ${res.status}`);
      }

      const n    = parseInt(res.headers.get('X-Replacements-Count') ?? '0', 10);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = file.name.replace(/(\.[^.]+)$/, '_modificado$1');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setCount(n);
      setStatus('success');
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : 'Erro desconhecido.');
      setStatus('error');
    }
  }

  const Toggle = ({
    label, value, onChange,
  }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors
        ${value
          ? 'bg-brand-accent text-white border-brand-accent'
          : 'bg-white text-gray-700 border-gray-300 hover:border-brand-accent dark:bg-gray-800 dark:text-gray-200'}`}
    >
      {label}
    </button>
  );

  return (
    <ToolLayout title="Find & Replace" description="Encontre e substitua texto em qualquer arquivo. Com pré-visualização." category="Dev" icon={<ToolIcon d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />}>
      <FileDropzone
        accept=".txt,.md,.json,.xml,.yaml,.csv,.html,.js,.ts,.py,.sql,.toml,.ini,.env"
        maxSizeMB={5}
        onFileSelect={setFile}
        label="Arraste o arquivo de texto aqui"
      />

      <div className="mt-4 space-y-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPreviews([]); setTotalMatches(null); }}
          placeholder={useRegex ? 'Ex: \\d{4}-\\d{2}-\\d{2}' : 'Buscar…'}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-mono
                     focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100"
        />
        <input
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
          placeholder="Substituir por… (deixe vazio para deletar)"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-mono
                     focus:border-brand-accent outline-none dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Toggle label="Regex"           value={useRegex}      onChange={setUseRegex} />
        <Toggle label="Maiúsc/min."     value={caseSensitive} onChange={setCaseSensitive} />
        <Toggle label="Palavra inteira" value={wholeWord}     onChange={setWholeWord} />
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={handlePreview}
          disabled={!file || !search}
          className="flex-1 py-2.5 rounded-xl border border-brand-accent text-brand-accent text-sm font-semibold
                     hover:bg-brand-accent/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Pré-visualizar {totalMatches !== null ? `(${totalMatches})` : ''}
        </button>
        <button
          onClick={handleApply}
          disabled={!file || !search || status === 'loading'}
          className="flex-1 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white text-sm font-semibold
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'loading' ? 'Aplicando…' : 'Aplicar e baixar'}
        </button>
      </div>

      {previews.length > 0 && (
        <div className="mt-4 rounded-xl border border-brand-border dark:border-gray-700 overflow-hidden">
          <div className="bg-brand-surface dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-500">
            {totalMatches ?? previews.length} ocorrência(s) encontrada(s)
            {totalMatches !== null && totalMatches > previews.length && ` (exibindo ${previews.length})`}
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-brand-border dark:divide-gray-700">
            {previews.map((m, i) => (
              <div key={i} className="px-3 py-2 text-xs font-mono">
                <span className="text-gray-400 mr-2">L{m.line}</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {highlightMatch(m.context, m.match)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConversionStatus
        status={status}
        errorMessage={errMsg}
        successMessage={count !== null ? `${count} substituição(ões) realizada(s). Download iniciado!` : 'Concluído!'}
      />
    </ToolLayout>
  );
}
