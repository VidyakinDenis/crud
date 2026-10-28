import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        dev: "dev";
        prod: "prod";
    }>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    PG_HOST: z.ZodString;
    PG_PORT: z.ZodCoercedNumber<unknown>;
    PG_USER: z.ZodString;
    PG_USER_PASS: z.ZodString;
    PG_DB: z.ZodString;
    JWT_ACCESS_KEY: z.ZodString;
    JWT_REFRESH_KEY: z.ZodString;
    ACCESS_TTL_DAYS: z.ZodDefault<z.ZodString>;
    REFRESH_TTL_DAYS: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare function validateEnv(config: Record<string, unknown>): {
    NODE_ENV: "dev" | "prod";
    PORT: number;
    PG_HOST: string;
    PG_PORT: number;
    PG_USER: string;
    PG_USER_PASS: string;
    PG_DB: string;
    JWT_ACCESS_KEY: string;
    JWT_REFRESH_KEY: string;
    ACCESS_TTL_DAYS: string;
    REFRESH_TTL_DAYS: string;
};
export type EnvConfig = z.infer<typeof envSchema>;
