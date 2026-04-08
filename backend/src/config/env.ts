import dotenv from 'dotenv';

dotenv.config();

const getEnvVar = (key: string): string => {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
};

export const env = {
  PORT: getEnvVar('PORT'),
  DB_HOST: getEnvVar('DB_HOST'),
  DB_USER: getEnvVar('DB_USER'),
  DB_PASS: getEnvVar('DB_PASS'),
  DB_NAME: getEnvVar('DB_NAME'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
};
