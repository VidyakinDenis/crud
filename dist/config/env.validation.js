import { z } from 'zod';
export const envSchema = z.object({
    NODE_ENV: z
        .enum(['dev', 'prod',])
        .default('dev'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    PG_HOST: z.string().min(1, 'DB_HOST is required'),
    PG_PORT: z.coerce.number().int().min(1).max(65535),
    PG_USER: z.string().min(1, 'DB_USER is required'),
    PG_USER_PASS: z.string().min(1, 'DB_PASSWORD is required'),
    PG_DB: z.string().min(1, 'DB_NAME is required'),
    JWT_ACCESS_KEY: z.string().min(1, 'Access secret must be at least 1 characters'),
    JWT_REFRESH_KEY: z.string().min(1, 'Refresh secret must be at least 1 characters'),
    ACCESS_TTL_DAYS: z.string().min(1).default('15m'),
    REFRESH_TTL_DAYS: z.string().min(1).default('30d'),
});
export function validateEnv(config) {
    const result = envSchema.safeParse(config);
    if (!result.success) {
        const errors = result.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join('\n');
        throw new Error(`Environment validation failed:\n${errors}`);
    }
    return result.data;
}
//# sourceMappingURL=env.validation.js.map