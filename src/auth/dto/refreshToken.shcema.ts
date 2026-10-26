import { z } from 'zod';

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().trim().nonempty(),
})

export type RefreshToken = z.infer<typeof RefreshTokenSchema>;