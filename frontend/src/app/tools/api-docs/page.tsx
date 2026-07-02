'use client';
import Link from 'next/link';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  body?: string;
}

const SECTIONS: { title: string; base: string; endpoints: Endpoint[] }[] = [
  {
    title: 'Imagem',
    base: '/api/image',
    endpoints: [
      { method: 'POST', path: '/convert', description: 'Converte uma imagem entre PNG/JPG/WEBP/GIF/BMP/AVIF.', body: 'multipart/form-data: file, to' },
    ],
  },
  {
    title: 'Imagem extra',
    base: '/api/image-extra',
    endpoints: [
      { method: 'POST', path: '/psd-to-png', description: 'Extrai a imagem composta de um PSD e converte para PNG.', body: 'multipart/form-data: file' },
      { method: 'POST', path: '/ico-to-png', description: 'Extrai a maior imagem de um .ico e converte para PNG.', body: 'multipart/form-data: file' },
      { method: 'POST', path: '/png-to-ico', description: 'Gera um .ico multi-tamanho a partir de um PNG.', body: 'multipart/form-data: file' },
      { method: 'POST', path: '/heic-to-jpg', description: 'Converte uma foto HEIC (iPhone) para JPG.', body: 'multipart/form-data: file, quality?' },
      { method: 'POST', path: '/html-to-pdf', description: 'Renderiza um trecho de HTML e retorna um PDF em A4.', body: 'application/json: { html }' },
    ],
  },
  {
    title: 'PDF avançado',
    base: '/api/pdf-advanced',
    endpoints: [
      { method: 'POST', path: '/crop', description: 'Ajusta a crop box de todas as páginas do PDF.', body: 'multipart/form-data: file, top, right, bottom, left' },
      { method: 'POST', path: '/fill-form', description: 'Preenche campos de um AcroForm e achata o resultado.', body: 'multipart/form-data: file, fields (JSON), flatten?' },
      { method: 'POST', path: '/sign', description: 'Sobrepõe uma imagem de assinatura visual em uma página.', body: 'multipart/form-data: file, signature, pageIndex, x, y, width, height' },
      { method: 'POST', path: '/redact', description: 'Cobre e remove permanentemente uma área do PDF.', body: 'multipart/form-data: file, pageIndex, rects (JSON)' },
      { method: 'POST', path: '/compare', description: 'Compara o texto de dois PDFs (mesmo formato de /api/diff/compare).', body: 'multipart/form-data: fileA, fileB' },
    ],
  },
  {
    title: 'Áudio e Vídeo (assíncrono)',
    base: '/api/audio-video',
    endpoints: [
      { method: 'POST', path: '/video-to-gif', description: 'Inicia um job que corta e converte um trecho de vídeo em GIF. Retorna { jobId }.', body: 'multipart/form-data: file, startSeconds?, durationSeconds?, width?, fps?' },
      { method: 'POST', path: '/video-to-audio', description: 'Inicia um job que extrai a trilha de áudio de um vídeo. Retorna { jobId }.', body: 'multipart/form-data: file, to (mp3|wav)' },
      { method: 'POST', path: '/audio-convert', description: 'Inicia um job de conversão entre MP3/WAV/OGG. Retorna { jobId }.', body: 'multipart/form-data: file, to' },
      { method: 'POST', path: '/video-convert', description: 'Inicia um job de conversão entre MP4/WEBM/MOV. Retorna { jobId }.', body: 'multipart/form-data: file, to' },
      { method: 'GET', path: '/jobs/:id', description: 'Consulta o status de um job: { status: "pending"|"done"|"error" }.' },
      { method: 'GET', path: '/jobs/:id/download', description: 'Baixa o resultado de um job concluído.' },
    ],
  },
  {
    title: 'Dados e Dev',
    base: '/api/data-tools',
    endpoints: [
      { method: 'POST', path: '/csv-to-sql', description: 'Gera um dump SQL (CREATE TABLE + INSERTs) a partir de um CSV.', body: 'multipart/form-data: file, tableName?' },
      { method: 'POST', path: '/excel-to-sqlite', description: 'Converte a primeira aba de um Excel em um banco SQLite.', body: 'multipart/form-data: file, tableName?' },
      { method: 'POST', path: '/sqlite-to-excel', description: 'Converte cada tabela de um SQLite em uma aba de Excel.', body: 'multipart/form-data: file' },
      { method: 'POST', path: '/excel-to-xml', description: 'Converte uma planilha Excel em XML.', body: 'multipart/form-data: file' },
    ],
  },
  {
    title: 'API Keys',
    base: '/api/api-keys',
    endpoints: [
      { method: 'POST', path: '/', description: 'Cria uma nova API key. A chave completa só aparece nesta resposta.', body: 'application/json: { label? }' },
      { method: 'GET', path: '/', description: 'Lista as chaves criadas (sem expor o valor, apenas metadados).' },
      { method: 'DELETE', path: '/:id', description: 'Revoga uma API key pelo id.' },
    ],
  },
  {
    title: 'Saúde do sistema',
    base: '/api/health',
    endpoints: [
      { method: 'GET', path: '/binaries', description: 'Disponibilidade dos binários de sistema (LibreOffice, Calibre, ffmpeg, etc).' },
      { method: 'GET', path: '/auto-update', description: 'Status do último ciclo de auto-atualização do servidor.' },
    ],
  },
];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    POST: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    DELETE: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  };
  return (
    <span className={`inline-block w-16 shrink-0 rounded-md px-2 py-0.5 text-center text-[11px] font-semibold ${colors[method] ?? ''}`}>
      {method}
    </span>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-brand-surface dark:bg-gray-950 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-brand-muted hover:text-brand-accent dark:text-gray-400 transition-colors">
          ← Voltar
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Documentação da API</h1>
        <p className="mt-1 text-sm text-brand-muted dark:text-gray-400">
          Referência dos endpoints usados pelo frontend. Todos aceitam requisições diretas
          (sem autenticação, exceto onde indicado) — envie o arquivo via <code className="text-xs">multipart/form-data</code> no
          campo <code className="text-xs">file</code>, salvo indicação em contrário.
        </p>

        <div className="mt-6 rounded-md border border-brand-border dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-sm">
          <p className="text-brand-muted dark:text-gray-400">
            Autenticação opcional por API key: crie uma em <code>POST /api/api-keys</code> e envie no header
            <code className="mx-1">X-API-Key</code> em rotas que a exigirem. Chaves ficam em memória — são
            reiniciadas a cada deploy do servidor.
          </p>
        </div>

        <div className="mt-8 space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{section.title}</h2>
              <p className="mt-0.5 text-xs text-brand-muted dark:text-gray-500 font-mono">{section.base}</p>
              <ul className="mt-3 divide-y divide-brand-border dark:divide-gray-800 rounded-xl border border-brand-border dark:border-gray-800 overflow-hidden">
                {section.endpoints.map((ep) => (
                  <li key={ep.method + ep.path} className="bg-white dark:bg-gray-900 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <MethodBadge method={ep.method} />
                      <code className="text-sm text-gray-800 dark:text-gray-200">{section.base}{ep.path}</code>
                    </div>
                    <p className="mt-1.5 text-xs text-brand-muted dark:text-gray-400">{ep.description}</p>
                    {ep.body && (
                      <p className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-500">{ep.body}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
