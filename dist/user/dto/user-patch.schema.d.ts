import { z } from 'zod';
export declare const UserPatchSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    age: z.ZodOptional<z.ZodNumber>;
    password: z.ZodOptional<z.ZodString>;
    login: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UserPatch = z.infer<typeof UserPatchSchema>;
declare const UserPatchDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    age: z.ZodOptional<z.ZodNumber>;
    password: z.ZodOptional<z.ZodString>;
    login: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, false>;
export declare class UserPatchDto extends UserPatchDto_base {
}
export {};
