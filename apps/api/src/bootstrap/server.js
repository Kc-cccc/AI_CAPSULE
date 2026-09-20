import { createApp } from '../http/createApp.js';
import { getConfig } from '../config/runtime.js';

const config = getConfig();
const app = createApp({ config });

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`AI Capsule is running on ${config.appUrl}`);
  if (!config.isProduction) {
    console.log('Development sign-in is active. Continue with GitHub opens the local dashboard directly.');
  } else if (!config.githubClientId || !config.githubClientSecret) {
    console.log('GitHub sign-in is not configured. Add the OAuth credentials to .env when sign-in is needed.');
  }
});

function shutdown(signal) {
  console.log(`${signal} received. Closing AI Capsule.`);
  server.close(() => {
    app.locals.capsules.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
