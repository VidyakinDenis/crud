import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
export const UserLoginSchema = z.object({
    login: z.string().trim().min(1).max(255).nonempty(),
    password: z.string().trim().min(1).max(255).nonempty(),
});
export class UserLoginDto extends createZodDto(UserLoginSchema) {
}
//# sourceMappingURL=userLogin.schema.js.map