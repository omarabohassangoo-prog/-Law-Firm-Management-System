import { z } from 'zod';

export const TemplateTypeSchema = z.enum(['print', 'report', 'notification']);
export const TemplateStatusSchema = z.enum(['draft', 'active', 'archived']);

export const TemplateSchema = z.object({
  id: z.string().uuid(),
  type: TemplateTypeSchema,
  subtype: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  locale: z.enum(['ar', 'en']),
  status: TemplateStatusSchema.default('draft'),
  category: z.string().optional(),
  content: z.string(),
  styles: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
  variables: z.array(z.any()), // Array of variable definitions
  metadata: z.record(z.string(), z.any()).optional(),
  version: z.number().int().default(1),
  isDefault: z.boolean().default(false),
  thumbnail: z.string().optional(),
  createdById: z.string().uuid(),
  updatedById: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
});

export type Template = z.infer<typeof TemplateSchema>;
