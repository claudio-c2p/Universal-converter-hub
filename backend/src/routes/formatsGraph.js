import express from 'express';
import { buildFormatsGraph } from '../converters/registry.js';

const router = express.Router();

router.get('/', (_req, res) => {
  res.json(buildFormatsGraph());
});

export default router;
