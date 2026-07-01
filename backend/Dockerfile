FROM node:22-slim

# Binários de sistema exigidos pelas ferramentas implementadas e TESTADAS DE PONTA A PONTA:
# - qpdf:        remover senha de PDF de verdade (pdf-remove-password)
# - ghostscript: EPS/PS -> PDF/PNG (eps-to-pdf, eps-to-png)
# - tesseract-ocr (+ idiomas): OCR (ocr-to-text, ocr-to-searchable-pdf)
# - libreoffice-writer/calc/impress: Word/Excel/PowerPoint/ODT/ODS/ODP <-> PDF e entre si
# - calibre (ebook-convert): EPUB/MOBI/AZW3/FB2/CBR/CBZ/DJVU/CHM <-> PDF/DOCX/TXT/HTML
# - texlive-latex-base + pandoc: TEX -> PDF/HTML/Markdown/DOCX
# - ffmpeg: áudio/vídeo (categoria extra, seção 13 do escopo)
# - mdbtools: Access/MDB -> CSV (binário testado isoladamente; não achamos um .mdb real
#   de exemplo para testar a extração de dados ponta a ponta — revisar antes do go-live)
#
# Nota sobre o calibre: em alguns ambientes Debian/Ubuntu o pip pode ter uma versão de lxml
# binária incompatível com o html5-parser do sistema, gerando erro "different versions of
# libxml2". Se isso ocorrer, rode:
#   apt-get install -y libxml2-dev libxslt1-dev && pip install --no-binary lxml lxml --break-system-packages --force-reinstall
# (foi exatamente isso que resolveu o problema no ambiente de testes deste projeto)
RUN apt-get update && apt-get install -y --no-install-recommends \
      qpdf \
      ghostscript \
      tesseract-ocr tesseract-ocr-por \
      libreoffice-writer libreoffice-calc libreoffice-impress \
      calibre \
      texlive-latex-base texlive-latex-extra texlive-latex-recommended texlive-fonts-recommended \
      pandoc \
      ffmpeg \
      mdbtools \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

EXPOSE 4000
CMD ["npm", "start"]


