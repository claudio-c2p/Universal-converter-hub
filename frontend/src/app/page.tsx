'use client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import ConverterCard from '@/components/ui/ConverterCard';
import ThemeToggle from '@/components/ui/ThemeToggle';
import AmbientEffects from '@/components/ui/AmbientEffects';
import MoreMenu from '@/components/ui/MoreMenu';

interface Tool {
  title: string;
  description: string;
  href: string;
  category: string;
  icon: React.ReactNode;
  isNew?: boolean;
}

function Icon({ d }: { d: string }) {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={d} />
    </svg>
  );
}

const TOOLS: Tool[] = [
  {
    title: 'Conversor de Legendas',
    description: 'Converta entre SRT e WebVTT gratuitamente.',
    href: '/tools/subtitle',
    category: 'Mídia',
    icon: <Icon d="M7 8h10M7 12h6m-6 4h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  },
  {
    title: 'Conversor Geoespacial',
    description: 'KML ↔ GeoJSON · GPX → GeoJSON',
    href: '/tools/geo-converter',
    category: 'Geo',
    icon: <Icon d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
  },
  {
    title: 'Conversor de Fontes',
    description: 'TTF ↔ WOFF ↔ WOFF2 ↔ EOT ↔ SVG',
    href: '/tools/font-converter',
    category: 'Fonte',
    icon: <Icon d="M4 7V4h16v3M9 20h6M12 4v16" />,
  },
  {
    title: 'PDF → Imagem',
    description: 'Converta páginas de PDF em PNG (até 20 páginas, entregues em ZIP).',
    href: '/tools/pdf-to-image',
    category: 'PDF',
    icon: <Icon d="M9 17v-6h6v6M9 7h1M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />,
  },
  {
    title: 'Word → HTML / Markdown',
    description: 'Converta documentos .docx para HTML ou Markdown.',
    href: '/tools/docx-converter',
    category: 'Documento',
    icon: <Icon d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M9 9h6M9 13h6M9 17h3" />,
  },
  {
    title: 'Conversor XML',
    description: 'XML → YAML · Formatar · Minificar · XML → CSV',
    href: '/tools/xml-converter',
    category: 'Dados',
    icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" />,
  },
  {
    title: 'Conversor SQL',
    description: 'Dump SQL ↔ JSON ↔ CSV · Inferir CREATE TABLE',
    href: '/tools/sql-converter',
    category: 'Dados',
    icon: <Icon d="M4 7c0-1.66 3.58-3 8-3s8 1.34 8 3-3.58 3-8 3-8-1.34-8-3zm0 0v10c0 1.66 3.58 3 8 3s8-1.34 8-3V7M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />,
  },
  {
    title: 'Conversor de Config',
    description: 'Converta entre .env, JSON, TOML e INI instantaneamente.',
    href: '/tools/config-converter',
    category: 'Dev',
    icon: <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
  },
  {
    title: 'Comparador de Arquivos (Diff)',
    description: 'Veja exatamente o que mudou entre dois arquivos de texto.',
    href: '/tools/diff',
    category: 'Dev',
    icon: <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h.01M13 16h6m-6-4h6" />,
  },
  {
    title: 'Find & Replace',
    description: 'Encontre e substitua texto em qualquer arquivo. Com pré-visualização.',
    href: '/tools/find-replace',
    category: 'Dev',
    icon: <Icon d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />,
  },
  {
    title: 'Dividir / Mesclar',
    description: 'Divida arquivos grandes em partes ou mescle vários em um.',
    href: '/tools/split-merge',
    category: 'Dados',
    icon: <Icon d="M4 7h16M4 7l4-4M4 7l4 4M20 17H4M20 17l-4 4M20 17l-4-4" />,
  },
  {
    title: 'Leitor de EXIF',
    description: 'Veja câmera, data, GPS e outros metadados da sua imagem.',
    href: '/tools/exif',
    category: 'Utilitário',
    icon: <Icon d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M12 13a3 3 0 100 6 3 3 0 000-6z" />,
  },
  {
    title: 'Renomeador em Lote',
    description: 'Renomeie dezenas de arquivos de uma vez com um padrão.',
    href: '/tools/batch-rename',
    category: 'Dev',
    icon: <Icon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
  },
  // ── DOCUMENTO — Ferramentas PDF ──
  {
    title: 'Mesclar PDFs',
    description: 'Una vários PDFs em um único arquivo na ordem que desejar.',
    href: '/tools/pdf-merge',
    category: 'PDF',
    icon: <Icon d="M9 17v-2m3 2v-4m3 4v-6M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
  },
  {
    title: 'Dividir PDF',
    description: 'Separe cada página em um arquivo ou extraia um intervalo.',
    href: '/tools/pdf-split',
    category: 'PDF',
    icon: <Icon d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414A1 1 0 0120 8.414V19a2 2 0 01-2 2h-8a2 2 0 01-2-2" />,
  },
  {
    title: 'Remover Páginas',
    description: 'Apague páginas específicas do seu PDF.',
    href: '/tools/pdf-remove-pages',
    category: 'PDF',
    icon: <Icon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
  },
  {
    title: 'Extrair Páginas',
    description: 'Salve páginas específicas em um novo PDF.',
    href: '/tools/pdf-extract-pages',
    category: 'PDF',
    icon: <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
  },
  {
    title: 'Organizar PDF',
    description: 'Reordene as páginas do seu PDF arrastando.',
    href: '/tools/pdf-organize',
    category: 'PDF',
    icon: <Icon d="M4 6h16M4 10h16M4 14h16M4 18h16" />,
  },
  {
    title: 'Comprimir PDF',
    description: 'Reduza o tamanho do arquivo PDF sem perder qualidade.',
    href: '/tools/pdf-compress',
    category: 'PDF',
    icon: <Icon d="M19 14l-7 7m0 0l-7-7m7 7V3" />,
  },
  {
    title: 'Girar PDF',
    description: 'Rotacione todas as páginas 90°, 180° ou 270°.',
    href: '/tools/pdf-rotate',
    category: 'PDF',
    icon: <Icon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
  },
  {
    title: "Marca d'Água PDF",
    description: "Adicione texto de marca d'água diagonal em todas as páginas.",
    href: '/tools/pdf-watermark',
    category: 'PDF',
    icon: <Icon d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />,
  },
  {
    title: 'Numeração de Páginas',
    description: 'Insira números de página automáticos no rodapé ou cabeçalho.',
    href: '/tools/pdf-page-numbers',
    category: 'PDF',
    icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  },
  {
    title: 'Proteger PDF',
    description: 'Adicione senha de abertura ao seu PDF.',
    href: '/tools/pdf-protect',
    category: 'PDF',
    icon: <Icon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
  },
  {
    title: 'Desbloquear PDF',
    description: 'Remova a proteção por senha do seu PDF.',
    href: '/tools/pdf-unlock',
    category: 'PDF',
    icon: <Icon d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />,
  },
  {
    title: 'JPG/PNG → PDF',
    description: 'Converta uma ou várias imagens em um único arquivo PDF.',
    href: '/tools/jpg-to-pdf',
    category: 'PDF',
    icon: <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  },
  // ── OFFICE ──
  { title: 'Word → HTML', description: 'Converta .docx para HTML pronto para web.', href: '/tools/word-to-html', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { title: 'Word → Markdown', description: 'Converta .docx para Markdown limpo.', href: '/tools/word-to-md', category: 'Office', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'Word → TXT', description: 'Extraia o texto puro de um documento Word.', href: '/tools/word-to-txt', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { title: 'Excel → CSV', description: 'Converta planilha .xlsx para CSV.', href: '/tools/excel-to-csv', category: 'Office', icon: <Icon d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /> },
  { title: 'Excel → JSON', description: 'Exporte dados de planilha para JSON estruturado.', href: '/tools/excel-to-json', category: 'Office', icon: <Icon d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /> },
  { title: 'Excel → HTML', description: 'Converta planilha para tabela HTML.', href: '/tools/excel-to-html', category: 'Office', icon: <Icon d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /> },
  { title: 'CSV → Excel', description: 'Converta CSV para planilha .xlsx.', href: '/tools/csv-to-excel', category: 'Office', icon: <Icon d="M9 17v-2m3 2v-4m3 4v-6M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
  { title: 'CSV → JSON', description: 'Transforme CSV em array JSON formatado.', href: '/tools/csv-to-json', category: 'Office', icon: <Icon d="M9 17v-2m3 2v-4m3 4v-6M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
  { title: 'CSV → HTML', description: 'Converta CSV para tabela HTML.', href: '/tools/csv-to-html', category: 'Office', icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" /> },
  { title: 'Markdown → HTML', description: 'Converta .md para página HTML.', href: '/tools/md-to-html', category: 'Office', icon: <Icon d="M7 8h10M7 12h6m-6 4h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  { title: 'HTML → Markdown', description: 'Converta HTML para Markdown limpo.', href: '/tools/html-to-md', category: 'Office', icon: <Icon d="M7 8h10M7 12h6m-6 4h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  { title: 'HTML → TXT', description: 'Extraia texto puro de um arquivo HTML.', href: '/tools/html-to-txt', category: 'Office', icon: <Icon d="M7 8h10M7 12h6m-6 4h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
  { title: 'TXT → HTML', description: 'Envolva texto puro em estrutura HTML.', href: '/tools/txt-to-html', category: 'Office', icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" /> },
  { title: 'RTF → TXT', description: 'Extraia o texto de um arquivo RTF.', href: '/tools/rtf-to-txt', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  // ── DADOS (novos) ──
  { title: 'JSON → CSV', description: 'Exporte dados JSON para CSV tabulado.', href: '/tools/json-to-csv', category: 'Dados', isNew: true, icon: <Icon d="M9 17v-2m3 2v-4m3 4v-6M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
  { title: 'JSON → Excel', description: 'Exporte dados JSON para planilha .xlsx.', href: '/tools/json-to-excel', category: 'Dados', isNew: true, icon: <Icon d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /> },
  { title: 'JSON → YAML', description: 'Converta JSON para YAML legível.', href: '/tools/json-to-yaml', category: 'Dados', isNew: true, icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" /> },
  { title: 'JSON → XML', description: 'Converta JSON para XML estruturado.', href: '/tools/json-to-xml', category: 'Dados', isNew: true, icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" /> },
  { title: 'JSON → TOML', description: 'Converta JSON para formato TOML.', href: '/tools/json-to-toml', category: 'Dados', isNew: true, icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" /> },
  { title: 'YAML → JSON', description: 'Converta YAML para JSON formatado.', href: '/tools/yaml-to-json', category: 'Dados', isNew: true, icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" /> },
  { title: 'YAML → TOML', description: 'Converta YAML para TOML.', href: '/tools/yaml-to-toml', category: 'Dados', isNew: true, icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" /> },
  { title: 'YAML → XML', description: 'Converta YAML para XML.', href: '/tools/yaml-to-xml', category: 'Dados', isNew: true, icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" /> },
  { title: 'TOML → JSON', description: 'Converta TOML para JSON.', href: '/tools/toml-to-json', category: 'Dados', isNew: true, icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" /> },
  { title: 'TOML → YAML', description: 'Converta TOML para YAML.', href: '/tools/toml-to-yaml', category: 'Dados', isNew: true, icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" /> },
  { title: 'TOML → XML', description: 'Converta TOML para XML.', href: '/tools/toml-to-xml', category: 'Dados', isNew: true, icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" /> },
  { title: 'XML → YAML', description: 'Converta XML para YAML.', href: '/tools/xml-to-yaml', category: 'Dados', isNew: true, icon: <Icon d="M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4" /> },
  // ── PDF (novos) ──
  { title: 'Extrair Metadados', description: 'Veja título, autor, datas e outros metadados do PDF.', href: '/tools/pdf-to-metadata', category: 'PDF', isNew: true, icon: <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
  { title: 'Reparar PDF', description: 'Tente recuperar e reparar um PDF corrompido.', href: '/tools/pdf-repair', category: 'PDF', isNew: true, icon: <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
  { title: 'Inserir Páginas', description: 'Insira páginas de um PDF em outro em qualquer posição.', href: '/tools/pdf-insert-pages', category: 'PDF', isNew: true, icon: <Icon d="M12 4v16m8-8H4" /> },
  // --- Ferramentas adicionadas (Blocos A-F) ---
  { title: 'WORD → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/word-to-pdf', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { title: 'WORD → ODT', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/word-to-odt', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { title: 'WORD → EPUB', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/word-to-epub', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { title: 'WORD → RTF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/word-to-rtf', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { title: 'EXCEL → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/excel-to-pdf', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { title: 'EXCEL → ODS', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/excel-to-ods', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { title: 'PPT → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/ppt-to-pdf', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { title: 'PPT → JPG', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/ppt-to-jpg', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { title: 'PPT → PNG', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/ppt-to-png', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { title: 'PPT → HTML', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/ppt-to-html', category: 'Office', icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
  { title: 'ODT → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/odt-to-pdf', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'ODT → DOCX', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/odt-to-docx', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'ODT → HTML', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/odt-to-html', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'ODT → TXT', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/odt-to-txt', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'ODT → EPUB', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/odt-to-epub', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'ODS → XLSX', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/ods-to-xlsx', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'ODS → CSV', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/ods-to-csv', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'ODS → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/ods-to-pdf', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'ODP → PPTX', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/odp-to-pptx', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'ODP → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/odp-to-pdf', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'EPUB → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/epub-to-pdf', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'EPUB → DOCX', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/epub-to-docx', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'EPUB → HTML', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/epub-to-html', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'EPUB → TXT', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/epub-to-txt', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'EPUB → MOBI', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/epub-to-mobi', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'EPUB → AZW3', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/epub-to-azw3', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'MOBI → EPUB', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/mobi-to-epub', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'MOBI → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/mobi-to-pdf', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'MOBI → DOCX', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/mobi-to-docx', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'AZW3 → EPUB', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/azw3-to-epub', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'AZW3 → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/azw3-to-pdf', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'AZW3 → DOCX', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/azw3-to-docx', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'FB2 → EPUB', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/fb2-to-epub', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'FB2 → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/fb2-to-pdf', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'FB2 → MOBI', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/fb2-to-mobi', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'CBR → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/cbr-to-pdf', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'CBR → EPUB', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/cbr-to-epub', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'CBZ → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/cbz-to-pdf', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'CBZ → EPUB', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/cbz-to-epub', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'DJVU → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/djvu-to-pdf', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'DJVU → TXT', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/djvu-to-txt', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'CHM → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/chm-to-pdf', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'CHM → EPUB', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/chm-to-epub', category: 'eBook', icon: <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
  { title: 'SQLITE → JSON', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/sqlite-to-json', category: 'Banco de Dados', icon: <Icon d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3" /> },
  { title: 'SQLITE → CSV', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/sqlite-to-csv', category: 'Banco de Dados', icon: <Icon d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3" /> },
  { title: 'SQLITE → SQL', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/sqlite-to-sql', category: 'Banco de Dados', icon: <Icon d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3" /> },
  { title: 'DBF → JSON', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/dbf-to-json', category: 'Banco de Dados', icon: <Icon d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3" /> },
  { title: 'DBF → CSV', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/dbf-to-csv', category: 'Banco de Dados', icon: <Icon d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3" /> },
  { title: 'DBF → SQL', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/dbf-to-sql', category: 'Banco de Dados', icon: <Icon d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3" /> },
  { title: 'VCF → JSON', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/vcf-to-json', category: 'Utilitário', icon: <Icon d="M11 4a7 7 0 00-7 7c0 1.36.39 2.62 1.06 3.69L4 19l4.31-1.06A6.96 6.96 0 0011 18a7 7 0 100-14z" /> },
  { title: 'VCF → CSV', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/vcf-to-csv', category: 'Utilitário', icon: <Icon d="M11 4a7 7 0 00-7 7c0 1.36.39 2.62 1.06 3.69L4 19l4.31-1.06A6.96 6.96 0 0011 18a7 7 0 100-14z" /> },
  { title: 'ICS → JSON', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/ics-to-json', category: 'Utilitário', icon: <Icon d="M11 4a7 7 0 00-7 7c0 1.36.39 2.62 1.06 3.69L4 19l4.31-1.06A6.96 6.96 0 0011 18a7 7 0 100-14z" /> },
  { title: 'ICS → CSV', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/ics-to-csv', category: 'Utilitário', icon: <Icon d="M11 4a7 7 0 00-7 7c0 1.36.39 2.62 1.06 3.69L4 19l4.31-1.06A6.96 6.96 0 0011 18a7 7 0 100-14z" /> },
  { title: 'MDB → CSV', description: 'Converta uma tabela de um banco Access (.mdb/.accdb) para CSV.', href: '/tools/mdb-to-csv', category: 'Banco de Dados', icon: <Icon d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3" /> },
  { title: 'MDB → SQL', description: 'Converta uma tabela de um banco Access (.mdb/.accdb) para SQL.', href: '/tools/mdb-to-sql', category: 'Banco de Dados', icon: <Icon d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3" /> },
  { title: 'MDB → EXCEL', description: 'Converta uma tabela de um banco Access (.mdb/.accdb) para EXCEL.', href: '/tools/mdb-to-excel', category: 'Banco de Dados', icon: <Icon d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3" /> },
  { title: 'JSON → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/json-to-pdf', category: 'Dados', icon: <Icon d="M9 17v-6h6v6m-9-6V7a2 2 0 012-2h8a2 2 0 012 2v4M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293L13 3.293A1 1 0 0012.293 3H5a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
  { title: 'CSV → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/csv-to-pdf', category: 'Dados', icon: <Icon d="M9 17v-6h6v6m-9-6V7a2 2 0 012-2h8a2 2 0 012 2v4M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293L13 3.293A1 1 0 0012.293 3H5a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
  { title: 'XML → EXCEL', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/xml-to-excel', category: 'Dados', icon: <Icon d="M9 17v-6h6v6m-9-6V7a2 2 0 012-2h8a2 2 0 012 2v4M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293L13 3.293A1 1 0 0012.293 3H5a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
  { title: 'XML → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/xml-to-pdf', category: 'Dados', icon: <Icon d="M9 17v-6h6v6m-9-6V7a2 2 0 012-2h8a2 2 0 012 2v4M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293L13 3.293A1 1 0 0012.293 3H5a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
  { title: 'EPS → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/eps-to-pdf', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'EPS → PNG', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/eps-to-png', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'OCR → TEXT', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/ocr-to-text', category: 'PDF', icon: <Icon d="M9 12h6m-6 4h3m6-13H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-5-5z" /> },
  { title: 'OCR → SEARCHABLE-PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/ocr-to-searchable-pdf', category: 'PDF', icon: <Icon d="M9 12h6m-6 4h3m6-13H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-5-5z" /> },
  { title: 'Remover senha de PDF', description: 'Remova a senha de um PDF protegido, informando a senha atual.', href: '/tools/pdf-remove-password', category: 'PDF', icon: <Icon d="M9 12h6m-6 4h3m6-13H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-5-5z" /> },
  { title: 'TEX → PDF', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/tex-to-pdf', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'TEX → HTML', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/tex-to-html', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'TEX → MARKDOWN', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/tex-to-markdown', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
  { title: 'TEX → DOCX', description: 'Converta seu arquivo de forma rápida e gratuita.', href: '/tools/tex-to-docx', category: 'Documento', icon: <Icon d="M7 8h10M7 12h6m-6 4h4M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /> },
];

const CATEGORY_ORDER = ['PDF', 'Office', 'Dados', 'Documento', 'eBook', 'Banco de Dados', 'Geo', 'Mídia', 'Config', 'Dev', 'Fonte', 'Utilitário'];

const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  PDF:              { icon: 'M9 12h6m-6 4h3m6-13H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-5-5z', color: 'text-red-500' },
  Office:           { icon: 'M3 7a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z', color: 'text-blue-500' },
  Dados:            { icon: 'M4 7c0-1.66 3.58-3 8-3s8 1.34 8 3-3.58 3-8 3-8-1.34-8-3zm0 0v10c0 1.66 3.58 3 8 3s8-1.34 8-3V7M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3', color: 'text-purple-500' },
  Documento:        { icon: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z', color: 'text-blue-500' },
  eBook:            { icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25', color: 'text-teal-500' },
  'Banco de Dados': { icon: 'M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3-3.582 3-8 3-8-1.343-8-3zm0 0v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7m-16 5c0 1.657 3.582 3 8 3s8-1.343 8-3', color: 'text-indigo-500' },
  Geo:              { icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', color: 'text-green-500' },
  Mídia:            { icon: 'M7 8h10M7 12h6m-6 4h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-orange-500' },
  Config:           { icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', color: 'text-slate-500' },
  Dev:              { icon: 'M10 20l4-16M6 16l-4-4 4-4M18 8l4 4-4 4', color: 'text-gray-500' },
  Fonte:            { icon: 'M4 7V4h16v3M9 20h6M12 4v16', color: 'text-pink-500' },
  Utilitário:       { icon: 'M11 4a7 7 0 00-7 7c0 1.36.39 2.62 1.06 3.69L4 19l4.31-1.06A6.96 6.96 0 0011 18a7 7 0 100-14z', color: 'text-yellow-500' },
};
const ALL_META = { icon: 'M4 6h16M4 6a2 2 0 012-2h2a2 2 0 012 2m-6 0a2 2 0 002 2h2a2 2 0 002-2m6 0a2 2 0 00-2-2h-2a2 2 0 00-2 2m6 0a2 2 0 002 2h2a2 2 0 002-2M4 18h16M4 18a2 2 0 002 2h2a2 2 0 002-2m-6 0a2 2 0 012-2h2a2 2 0 012 2m6 0a2 2 0 01-2-2h-2a2 2 0 01-2 2m6 0a2 2 0 002-2h2a2 2 0 002 2' };

const STOP_WORDS = new Set(['para', 'pra', 'pro', 'to', 'de', 'do', 'da', 'em', 'no', 'na', 'o', 'a', 'e', '2']);

function normalizeSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[→\-_/]/g, ' ') // seta e separadores de slug contam como espaço
    .replace(/\s+/g, ' ')
    .trim();
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('category');
    if (fromUrl && CATEGORY_ORDER.includes(fromUrl)) setActiveCategory(fromUrl);
  }, []);

  const filtered = useMemo(() => {
    const tokens = normalizeSearch(query)
      .split(' ')
      .filter((w) => w && !STOP_WORDS.has(w));

    return TOOLS.filter((t) => {
      const corpus = normalizeSearch(`${t.title} ${t.description} ${t.category} ${t.href}`);
      const matchesSearch = tokens.length === 0 || tokens.every((tok) => corpus.includes(tok));
      const matchesCategory = !activeCategory || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [query, activeCategory]);

  const byCategory = useMemo(() =>
    CATEGORY_ORDER
      .map((cat) => ({ category: cat, tools: filtered.filter((t) => t.category === cat) }))
      .filter((g) => g.tools.length > 0),
    [filtered]
  );

  const categories = CATEGORY_ORDER.filter((c) => TOOLS.some((t) => t.category === c));

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-page)]">
      <AmbientEffects />
      <header className="relative z-50 h-20 bg-[var(--bg-header)]/90 backdrop-blur border-b border-[var(--border-color)]
                         flex items-center px-4 md:px-8 gap-4 sticky top-0">
        <Image src="/c2p_logo_light.webp" alt="C2P" width={148} height={58}
          className="block dark:hidden" style={{ objectFit: 'contain', height: '58px', width: 'auto' }} priority />
        <Image src="/c2p_logo_dark.webp" alt="C2P" width={148} height={58}
          className="hidden dark:block" style={{ objectFit: 'contain', height: '58px', width: 'auto' }} priority />
        <span className="hidden md:block w-px h-4 bg-[var(--border-color)]" />
        <span className="hidden md:block text-xs font-medium text-[var(--text-secondary)]">
          Universal converter hub
        </span>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-xl border border-[var(--border-color)]
                          bg-[var(--bg-input)] w-56 focus-within:border-brand-accent transition-colors">
            <svg className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              type="search"
              placeholder="Buscar ferramenta…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[var(--text-secondary)] hover:text-brand-accent transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <ThemeToggle />
          <MoreMenu />
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="hero-glow" aria-hidden="true" />
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium
                           text-brand-accent border border-brand-accent/40 bg-brand-accent/10">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L4.5 14h6l-1.5 8L19 10h-6l1.5-8z" />
            </svg>
            100% gratuito, sem anúncios, sem cadastro — só escolher e converter.
          </span>
        </div>

        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
            Conversões que você não encontra em <span className="text-brand-accent">outro lugar</span>
          </h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-2xl mx-auto">
            {TOOLS.length} ferramentas — PDF, Word, dados, geo, dev e muito mais.
          </p>
        </div>

        {/* Busca mobile */}
        <div className="sm:hidden mb-6 flex items-center gap-2 px-3 h-10 rounded-xl border border-[var(--border-color)]
                        bg-[var(--bg-input)] focus-within:border-brand-accent transition-colors">
          <svg className="w-4 h-4 text-[var(--text-secondary)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="search"
            placeholder="Buscar ferramenta…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
          />
        </div>

        {/* Filtros de categoria */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all
              ${!activeCategory
                ? 'bg-brand-accent text-white shadow-sm'
                : 'bg-[var(--bg-pill)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-brand-accent'
              }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={ALL_META.icon} />
            </svg>
            Todas {TOOLS.length}
          </button>
          {categories.map((cat) => {
            const count = TOOLS.filter((t) => t.category === cat).length;
            const meta = CATEGORY_META[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all
                  ${isActive
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'bg-[var(--bg-pill)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-brand-accent'
                  }`}
              >
                {meta && (
                  <svg className={`w-3.5 h-3.5 ${isActive ? 'text-white' : meta.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={meta.icon} />
                  </svg>
                )}
                {cat} {count}
              </button>
            );
          })}
        </div>

        {/* Resultados */}
        {byCategory.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-secondary)]">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <p className="text-sm">Nenhuma ferramenta encontrada para <strong>&quot;{query}&quot;</strong></p>
            <button onClick={() => { setQuery(''); setActiveCategory(null); }}
              className="mt-3 text-xs text-brand-accent hover:underline">
              Limpar filtros
            </button>
          </div>
        ) : (
          byCategory.map(({ category, tools }) => (
            <section key={category} className="mb-10">
              <h2 className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                <span className={`w-1 h-4 rounded-full ${CATEGORY_META[category]?.color.replace('text-', 'bg-') ?? 'bg-brand-accent'}`} />
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => (
                  <ConverterCard
                    key={tool.href}
                    title={tool.title}
                    description={tool.description}
                    href={tool.href}
                    category={tool.category}
                    icon={tool.icon}
                    isNew={tool.isNew}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="relative z-10 py-4 px-8 border-t border-[var(--border-color)] flex items-center justify-center gap-2">
        <Image src="/c2p_logo_light.webp" alt="C2P" width={75} height={30}
          className="block dark:hidden" style={{ objectFit: 'contain', height: '30px', width: 'auto', opacity: 0.7 }} />
        <Image src="/c2p_logo_dark.webp" alt="C2P" width={75} height={30}
          className="hidden dark:block" style={{ objectFit: 'contain', height: '30px', width: 'auto', opacity: 0.7 }} />
        <span className="text-xs text-[var(--text-secondary)]">Um produto C2P · {TOOLS.length} ferramentas disponíveis</span>
      </footer>
    </div>
  );
}
