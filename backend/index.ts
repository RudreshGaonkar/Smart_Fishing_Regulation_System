import { app } from './src/app';
import { env } from './src/config/env';
import { testConnection } from './src/config/db';

const bootstrap = async () => {
  try {
    await testConnection();
    app.listen(env.PORT, () => {
      console.log(`Server is listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap();
