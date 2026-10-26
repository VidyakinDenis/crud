import { z } from 'zod';

export const UserCreateSchema = z.object({
  name: z.string().trim().min(1).max(255),
  age: z.number().min(1),
  login: z.string().trim().min(1).max(255).nonempty(),
  password: z.string().trim().min(1).max(255).nonempty(),
  email: z.email().trim().min(1).max(255),
  description: z.string().trim().min(1).max(1000),

})

export type UserCreate = z.infer<typeof UserCreateSchema>;