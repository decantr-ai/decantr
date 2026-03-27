import { Hono } from 'hono';
export const healthRoutes = new Hono();
healthRoutes.get('/health', (c) => c.json({ status: 'ok', version: '2.0.0' }));
