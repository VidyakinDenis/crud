import { z } from 'zod';
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strip>;
export declare const SuccessTokenSchema: z.ZodObject<{
    accessToken: z.ZodString;
}, z.core.$strip>;
export declare const TokensPairSchema: z.ZodObject<{
    refreshToken: z.ZodString;
    accessToken: z.ZodString;
}, z.core.$strip>;
export type RefreshTokenSchema = z.infer<typeof RefreshTokenSchema>;
declare const RefreshTokenDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strip>, false>;
export declare class RefreshTokenDto extends RefreshTokenDto_base {
}
export type SuccessTokenSchema = z.infer<typeof SuccessTokenSchema>;
declare const SuccessTokenDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    accessToken: z.ZodString;
}, z.core.$strip>, false>;
export declare class SuccessTokenDto extends SuccessTokenDto_base {
}
export type TokensPairSchema = z.infer<typeof TokensPairSchema>;
declare const TokensPairDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    refreshToken: z.ZodString;
    accessToken: z.ZodString;
}, z.core.$strip>, false>;
export declare class TokensPairDto extends TokensPairDto_base {
}
export {};
