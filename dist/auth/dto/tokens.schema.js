import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
export const RefreshTokenSchema = z.object({
    refreshToken: z.string().trim().nonempty(),
});
export const SuccessTokenSchema = z.object({
    accessToken: z.string().trim().nonempty(),
});
export const TokensPairSchema = z.object({
    refreshToken: z.string().trim().nonempty(),
    accessToken: z.string().trim().nonempty(),
});
export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {
}
export class SuccessTokenDto extends createZodDto(SuccessTokenSchema) {
}
export class TokensPairDto extends createZodDto(TokensPairSchema) {
}
//# sourceMappingURL=tokens.schema.js.map