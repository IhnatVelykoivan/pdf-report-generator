// pdf-renderer/src/api/dslRoutes.ts

import express from 'express';
import { dslStorage } from '../services/dslStorage';

const dslRouter = express.Router();

/**
 * Получить последний сгенерированный DSL
 */
dslRouter.get('/last', (req, res) => {
    const lastDSL = dslStorage.getLastDSL();

    if (!lastDSL) {
        return res.status(404).json({
            success: false,
            error: 'No DSL found'
        });
    }

    res.json({
        success: true,
        ...lastDSL
    });
});

/**
 * Сохранить DSL (для тестирования)
 */
dslRouter.post('/save', (req, res) => {
    const { dsl, reportType, language } = req.body;

    if (!dsl) {
        return res.status(400).json({
            success: false,
            error: 'DSL is required'
        });
    }

    const id = dslStorage.saveDSL(dsl, reportType, language);

    res.json({
        success: true,
        id
    });
});

/**
 * Очистить сохраненный DSL
 */
dslRouter.delete('/clear', (req, res) => {
    dslStorage.clearDSL();

    res.json({
        success: true,
        message: 'DSL cleared'
    });
});

export { dslRouter };