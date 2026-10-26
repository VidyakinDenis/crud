import { z } from 'zod';

export const UserPatchSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  age: z.number().min(1).optional(),
  password: z.string().trim().min(1).max(255).optional(),
  login: z.string().trim().min(1).max(255).optional(),
  email: z.email().trim().min(1).max(255).optional(),
  description: z.string().trim().min(1).max(1000).optional(),

})

export type UserPatch = z.infer<typeof UserPatchSchema>;