'use client';
import { useState } from 'react';
import ConversionStatus from '@/components/ui/ConversionStatus';
import MultiFileDropzone from '@/components/ui/MultiFileDropzone';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface BatchError {
  file: string;
  error: string;
}

const TARGET_GROUPS: { label: string; options: { value: string; label: string }[] }[] = [
  { label: 'Documentos', options: [
    { value: 'pdf', label: 'PDF' },
    { value: 'docx', label: 'Word (.docx)' },
    { value: 'odt', label: 'ODT' },
    { value: 'rtf', label: 'RTF' },
    { value: 'txt', label: 'TXT' },
    { value: 'html', label: 'HTML' },
  ]},
  { label: 'Planilhas', options: [
    { value: 'xlsx', label: 'Excel (.xlsx)' },
    { value: 'ods', label: 'ODS' },
    { value: 'csv', label: 'CSV' },
  ]},
  { label: 'Apresentações', options: [
    { value: 'pptx', label: 'PowerPoint (.pptx)' },
    { value: 'odp', label: 'ODP' },
  ]},
  { label: 'Imagens', options: [
    { value: 'png', label: 'PNG' },
    { value: 'jpg', label: 'JPG' },
    { value: 'webp', label: 'WEBP' },
  ]},
];

export default function BatchConvertPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [to, setTo] = useState('pdf');
  const [merge, setMerge] = useState(true);
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [partialErrors, setPartialErrors] = useState<BatchError[]>([]);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  async function handleConvert() {
    if (files.length < 2) {
      setErrMsg('Selecione pelo menos 2 arquivos.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrMsg('');
    setPartialErrors([]);
    try {
      const body = new FormData();
      files.forEach((f) => body.append('files', f));
      body.append('to', to);
      body.append('merge', String(merge && to === 'pdf'));

      const res = await fetch(`${baseUrl}/api/batch/convert`, { method: 'POST', body });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Erro ${res.status}`);
      }

      const errorsHeader = res.headers.get('X-Batch-Errors');
      if (errorsHeader) {
        try {
          setPartialErrors(JSON.parse(decodeURIComponent(errorsHeader)));
        } catch {
          // header malformado — ignora, não é crítico pro resultado
        }
      }

      const isMerged = merge && to === 'pdf';
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isMerged ? 'convertido-mesclado.pdf' : 'convertidos.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('success');
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Erro desconhecido.');
      setStatus('error');
    }
  }

  return (
    <ToolLayout
      title="Conversor em Lote"
      description="Envie 2 ou mais arquivos diferentes (PDF, Word, Excel, PowerPoint, imagens...) e converta todos ao mesmo tempo para um único formato de destino."
      category="Utilitário"
      icon={<ToolIcon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
    >
      <MultiFileDropzone
        accept="*"
        maxSizeMB={40}
        onFilesSelect={(selected) => { setFiles(selected); setStatus('idle'); setErrMsg(''); setPartialErrors([]); }}
        label="Arraste os arquivos aqui (podem ser de tipos diferentes)"
        helperText="Ex: um .docx, um .xlsx e duas fotos .jpg juntos — cada um é convertido individualmente para o formato escolhido abaixo."
      />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="block mb-1 text-brand-muted dark:text-gray-400">Converter tudo para</span>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent px-3 py-2"
          >
            {TARGET_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        {to === 'pdf' && (
          <label className="flex items-center gap-2 text-sm self-end pb-2">
            <input type="checkbox" checked={merge} onChange={(e) => setMerge(e.target.checked)} />
            Mesclar tudo em um único PDF (em vez de um ZIP com um PDF por arquivo)
          </label>
        )}
      </div>

      <p className="mt-2 text-xs text-brand-muted dark:text-gray-500">
        Conversão PDF → outro formato não é suportada aqui (exigiria OCR/extração de layout) —
        use uma das ferramentas específicas de PDF para isso.
      </p>

      <button
        onClick={handleConvert}
        disabled={files.length < 2 || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white
                   font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? `Convertendo ${files.length} arquivos…` : `Converter ${files.length || ''} arquivos`.trim()}
      </button>

      <ConversionStatus
        status={status}
        errorMessage={errMsg}
        successMessage={
          partialErrors.length > 0
            ? `Concluído com ${partialErrors.length} arquivo(s) com falha — veja abaixo.`
            : 'Concluído! Download iniciado.'
        }
      />

      {partialErrors.length > 0 && (
        <div className="mt-4 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
            Alguns arquivos não puderam ser convertidos (os demais foram incluídos normalmente):
          </p>
          <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-400">
            {partialErrors.map((e, i) => (
              <li key={i}>
                <span className="font-medium">{e.file}:</span> {e.error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </ToolLayout>
  );
}
