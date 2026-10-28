import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
export const UserCreateSchema = z.object({
    name: z.string().trim().min(1).max(100).describe('Имя'),
    login: z.string().trim().min(3).max(50).describe('Логин'),
    password: z.string().min(6).max(100).describe('Пароль'),
    email: z.string().email().describe('Email'),
    age: z.number().int().min(0).max(150).describe('Возраст'),
    description: z.string().max(300).describe('Описание'),
    deleted: z.boolean().default(false).describe('Удалён'),
});
export class UserCreateDto extends createZodDto(UserCreateSchema) {
}
//# sourceMappingURL=user-create.schema.js.map