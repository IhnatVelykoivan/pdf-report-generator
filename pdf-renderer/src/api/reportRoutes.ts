// pdf-renderer/src/api/reportRoutes.ts

import express from 'express';
import { generateReport, processFeedback } from './reportController';

const reportRouter = express.Router();

/**
 * Главный эндпоинт для генерации отчетов
 * Принимает минимальные данные и выполняет всю логику на сервере
 */
reportRouter.post('/generate', generateReport);

/**
 * Эндпоинт для обработки фидбека и изменений
 */
reportRouter.post('/feedback', processFeedback);

export { reportRouter };