import { z } from 'zod';
export declare const UserLoginSchema: z.ZodObject<{
    login: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
declare const UserLoginDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    login: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>, false>;
export declare class UserLoginDto extends UserLoginDto_base {
}
export {};
