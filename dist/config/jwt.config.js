import { registerAs } from '@nestjs/config';
export default registerAs('jwt', () => ({
    accessSecret: process.env.JWT_ACCESS_KEY,
    refreshSecret: process.env.JWT_REFRESH_KEY,
    accessExpiresIn: process.env.ACCESS_TTL_DAYS ?? '15m',
    refreshExpiresIn: process.env.REFRESH_TTL_DAYS ?? '30d',
}));
//# sourceMappingURL=jwt.config.js.map