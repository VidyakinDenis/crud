import { z } from 'zod';
export declare const UserCreateSchema: z.ZodObject<{
    name: z.ZodString;
    login: z.ZodString;
    password: z.ZodString;
    email: z.ZodString;
    age: z.ZodNumber;
    description: z.ZodString;
    deleted: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
declare const UserCreateDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    name: z.ZodString;
    login: z.ZodString;
    password: z.ZodString;
    email: z.ZodString;
    age: z.ZodNumber;
    description: z.ZodString;
    deleted: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>, false>;
export declare class UserCreateDto extends UserCreateDto_base {
}
export {};
