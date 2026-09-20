import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDirectory, '../../../..');
const environmentFile = path.join(projectRoot, '.env');

if (fs.existsSync(environmentFile)) {
  process.loadEnvFile(environmentFile);
}

function cleanUrl(value) {
  return String(value || '').replace(/\/+$/, '');
}

export function getConfig(overrides = {}) {
  const nodeEnv = overrides.nodeEnv ?? process.env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';
  const appUrl = cleanUrl(overrides.appUrl ?? process.env.APP_URL ?? 'http://localhost:3000');
  const clientUrl = cleanUrl(
    overrides.clientUrl
      ?? process.env.CLIENT_URL
      ?? (isProduction ? appUrl : 'http://localhost:5173')
  );
  const githubCallbackUrl = cleanUrl(
    overrides.githubCallbackUrl
      ?? process.env.GITHUB_CALLBACK_URL
      ?? `${appUrl}/auth/github/callback`
  );

  return {
    nodeEnv,
    isProduction,
    port: Number(overrides.port ?? process.env.PORT ?? 3000),
    appUrl,
    clientUrl,
    githubCallbackUrl,
    jwtSecret: overrides.jwtSecret
      ?? process.env.JWT_SECRET
      ?? (isProduction ? '' : 'ai-capsule-local-development-secret'),
    githubClientId: overrides.githubClientId ?? process.env.GITHUB_CLIENT_ID ?? '',
    githubClientSecret: overrides.githubClientSecret ?? process.env.GITHUB_CLIENT_SECRET ?? '',
    dbFile: overrides.dbFile
      ?? process.env.SQLITE_PATH
      ?? process.env.DB_FILE
      ?? path.join(projectRoot, 'data/ai-capsule.sqlite'),
    trustProxy: String(overrides.trustProxy ?? process.env.TRUST_PROXY ?? '0') === '1'
  };
}
