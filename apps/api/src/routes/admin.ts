import { Hono } from 'hono';
import type { Env } from '../types.js';
export const adminRoutes = new Hono<Env>();
