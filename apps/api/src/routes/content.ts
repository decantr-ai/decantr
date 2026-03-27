import { Hono } from 'hono';
import type { Env } from '../types.js';
export const contentRoutes = new Hono<Env>();
