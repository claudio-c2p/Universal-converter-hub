import express from 'express';
import multer from 'multer';
import path from 'path';
import { sanitizeFilename } from '../utils/fileUtils.js';
import {
  videoToGif,
  videoToAudio,
  convertAudio,
  convertVideo,
  createJob,
  getJob,
} from '../converters/audioVideoConverter.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

function startJob(req, res, runnerFactory, outName) {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  try {
    const runner = runnerFactory();
    const id = createJob(runner, sanitizeFilename(outName));
    res.status(202).json({ jobId: id });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
}

router.post('/video-to-gif', upload.single('file'), (req, res) => {
  const { startSeconds, durationSeconds, width, fps } = req.body;
  startJob(
    req, res,
    () => videoToGif(req.file.buffer, {
      startSeconds: Number(startSeconds) || 0,
      durationSeconds: Number(durationSeconds) || 5,
      width: Number(width) || 480,
      fps: Number(fps) || 12,
    }),
    'convertido.gif',
  );
});

router.post('/video-to-audio', upload.single('file'), (req, res) => {
  const toFormat = (req.body.to || 'mp3').toLowerCase();
  startJob(req, res, () => videoToAudio(req.file.buffer, toFormat), `convertido.${toFormat}`);
});

router.post('/audio-convert', upload.single('file'), (req, res) => {
  const toFormat = (req.body.to || 'mp3').toLowerCase();
  const ext = path.extname(req.file?.originalname || '').toLowerCase() || '.mp3';
  startJob(req, res, () => convertAudio(req.file.buffer, ext, toFormat), `convertido.${toFormat}`);
});

router.post('/video-convert', upload.single('file'), (req, res) => {
  const toFormat = (req.body.to || 'mp4').toLowerCase();
  const ext = path.extname(req.file?.originalname || '').toLowerCase() || '.mp4';
  startJob(req, res, () => convertVideo(req.file.buffer, ext, toFormat), `convertido.${toFormat}`);
});

router.get('/jobs/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job não encontrado ou expirado.' });
  if (job.status === 'error') return res.json({ status: 'error', error: job.error });
  res.json({ status: job.status });
});

router.get('/jobs/:id/download', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job não encontrado ou expirado.' });
  if (job.status !== 'done') return res.status(409).json({ error: 'Job ainda não concluído.' });
  res.setHeader('Content-Disposition', `attachment; filename="${job.filename}"`);
  res.send(job.resultBuffer);
});

export default router;
