import { Router } from 'express';
import { healthHandler } from './healthHandler.js';

export const createRouter = (): Router => {
  const router = Router();
  router.get('/health', healthHandler);
  return router;
};
