import { registerAs } from '@nestjs/config';
export default registerAs('app', () => ({
    nodeEnv: process.env.NODE_ENV ?? 'dev',
    port: Number(process.env.PORT ?? 3000),
}));
//# sourceMappingURL=app.config.js.map