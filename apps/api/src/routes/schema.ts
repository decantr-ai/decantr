import { Hono } from 'hono';
import type { Env } from '../types.js';
import commonSchema from '../schemas/common.v1.json';
import patternSchema from '../schemas/pattern.v2.json';
import themeSchema from '../schemas/theme.v1.json';
import blueprintSchema from '../schemas/blueprint.v1.json';
import archetypeSchema from '../schemas/archetype.v2.json';
import shellSchema from '../schemas/shell.v1.json';
import essenceV2Schema from '../schemas/essence.v2.json';
import essenceV3Schema from '../schemas/essence.v3.json';

const SCHEMAS: Record<string, Record<string, unknown>> = {
  'common.v1.json': commonSchema as Record<string, unknown>,
  'pattern.v2.json': patternSchema as Record<string, unknown>,
  'theme.v1.json': themeSchema as Record<string, unknown>,
  'blueprint.v1.json': blueprintSchema as Record<string, unknown>,
  'archetype.v2.json': archetypeSchema as Record<string, unknown>,
  'shell.v1.json': shellSchema as Record<string, unknown>,
  'essence.v2.json': essenceV2Schema as Record<string, unknown>,
  'essence.v3.json': essenceV3Schema as Record<string, unknown>,
};

export const schemaRoutes = new Hono<Env>();

schemaRoutes.get('/schema/:name', (c) => {
  const name = c.req.param('name');
  const schema = SCHEMAS[name];

  if (!schema) {
    return c.json({
      error: 'Schema not found',
      available: Object.keys(SCHEMAS).sort(),
    }, 404);
  }

  return c.json(schema);
});
