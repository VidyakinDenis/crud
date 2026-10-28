import { z } from 'zod';
export declare const UserIdParamSchema: z.ZodObject<{
    id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const UsersListSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    pageSize: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    login: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UserListQuery = z.infer<typeof UsersListSchema>;
declare const UsersListDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    pageSize: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    login: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, false>;
export declare class UsersListDto extends UsersListDto_base {
}
declare const UserIdParamsDto_base: import("nestjs-zod").ZodDto<z.ZodObject<{
    id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, false>;
export declare class UserIdParamsDto extends UserIdParamsDto_base {
}
export {};
