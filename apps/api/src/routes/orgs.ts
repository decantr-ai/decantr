import { Hono } from 'hono';
import type { Env } from '../types.js';
export const orgRoutes = new Hono<Env>();
