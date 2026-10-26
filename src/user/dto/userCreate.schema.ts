import { z } from 'zod';

export const UserCreateSchema = z.object({
  name: z.string().trim().min(1).max(255),
})

export type UserCreate = z.infer<typeof UserCreateSchema>;