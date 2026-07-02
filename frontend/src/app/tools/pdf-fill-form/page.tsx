'use client';
import { useState } from 'react';
import FileDropzone from '@/components/ui/FileDropzone';
import ConversionStatus from '@/components/ui/ConversionStatus';
import ToolLayout from '@/components/ui/ToolLayout';
import ToolIcon from '@/components/ui/ToolIcon';
import { useConverter } from '@/hooks/useConverter';

export default function PdfFillFormPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fieldsJson, setFieldsJson] = useState('{\n  "nome": "Maria da Silva",\n  "aceito": true\n}');
  const [flatten, setFlatten] = useState(true);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const { status, errorMsg, convert } = useConverter({
    endpoint: '/api/pdf-advanced/fill-form',
    outputFilename: (name) => name.replace(/\.pdf$/i, '-preenchido.pdf'),
  });

  function handleSubmit() {
    if (!file) return;
    try {
      JSON.parse(fieldsJson);
      setJsonError(null);
    } catch {
      setJsonError('O JSON dos campos é inválido.');
      return;
    }
    convert(file, { fields: fieldsJson, flatten: String(flatten) });
  }

  return (
    <ToolLayout title="Preencher formulário PDF" description="Preencha campos de um formulário PDF (AcroForm) e achate o resultado." category="PDF"
      icon={<ToolIcon d="M9 12h6m-6 4h3m6-13H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-5-5z" />}>
      <FileDropzone accept=".pdf" maxSizeMB={40} onFileSelect={setFile} label="Arraste o formulário PDF aqui" />
      <label className="block mt-4 text-sm">
        <span className="block mb-1 text-brand-muted dark:text-gray-400">
          Campos a preencher (JSON: nome do campo → valor)
        </span>
        <textarea
          value={fieldsJson}
          onChange={(e) => setFieldsJson(e.target.value)}
          rows={8}
          className="w-full rounded-md border border-brand-border dark:border-gray-700 bg-transparent p-3 text-sm font-mono"
        />
      </label>
      {jsonError && <p className="mt-2 text-sm text-red-500">{jsonError}</p>}
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={flatten} onChange={(e) => setFlatten(e.target.checked)} />
        Achatar o resultado (impede edição posterior dos campos)
      </label>
      <button onClick={handleSubmit}
        disabled={!file || status === 'loading'}
        className="mt-6 w-full py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {status === 'loading' ? 'Preenchendo…' : 'Preencher'}
      </button>
      <ConversionStatus status={status} errorMessage={errorMsg} successMessage="Pronto! Download iniciado." />
    </ToolLayout>
  );
}
