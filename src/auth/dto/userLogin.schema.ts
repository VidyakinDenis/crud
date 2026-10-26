import { z } from 'zod';

export const UserLoginSchema = z.object({
  login: z.string().trim().min(1).max(255).nonempty(),
  password: z.string().trim().min(1).max(255).nonempty(),

})

export type UserLogin = z.infer<typeof UserLoginSchema>;