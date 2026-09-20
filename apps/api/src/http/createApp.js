import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { getConfig } from '../config/runtime.js';
import { createDatabase } from '../infrastructure/sqlite/capsuleRepository.js';
import {
  beginGithubOAuth,
  clearTokenCookie,
  finishGithubOAuth,
  requireAuth
} from '../modules/auth/authService.js';
import { parseRecordId, validateCapsule, ValidationError } from '../modules/capsules/capsuleValidation.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export function createApp(options = {}) {
  const config = getConfig(options.config);
  if (!config.jwtSecret && config.isProduction) {
    throw new Error('JWT_SECRET is required. Add it to the environment before starting AI Capsule.');
  }

  const capsules = options.database ?? createDatabase(config.dbFile);
  const app = express();

  if (config.isProduction || config.trustProxy) app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        imgSrc: ["'self'", 'data:', 'https://avatars.githubusercontent.com']
      }
    },
    crossOriginResourcePolicy: { policy: 'same-origin' }
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  const authenticated = requireAuth(config);

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/auth/github', (request, response) => {
    return beginGithubOAuth(request, response, config);
  });

  app.get('/auth/github/callback', (request, response) => {
    return finishGithubOAuth(request, response, config);
  });

  app.get('/api/auth/me', authenticated, (request, response) => {
    response.json({
      id: request.user.sub,
      login: request.user.login,
      avatar_url: request.user.avatar_url || ''
    });
  });

  app.post('/api/auth/logout', (request, response) => {
    clearTokenCookie(response, config);
    response.status(204).end();
  });

  app.get('/api/capsules', authenticated, (request, response) => {
    response.json(capsules.list(request.user.sub));
  });

  app.post('/api/capsules', authenticated, (request, response, next) => {
    try {
      const capsule = capsules.create(request.user.sub, validateCapsule(request.body));
      response.status(201).json(capsule);
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/capsules/:id', authenticated, (request, response, next) => {
    try {
      const id = parseRecordId(request.params.id);
      const capsule = capsules.update(id, request.user.sub, validateCapsule(request.body));
      if (!capsule) return response.status(404).json({ error: 'Capsule not found.' });
      return response.json(capsule);
    } catch (error) {
      return next(error);
    }
  });

  app.delete('/api/capsules/:id', authenticated, (request, response, next) => {
    try {
      const id = parseRecordId(request.params.id);
      if (!capsules.remove(id, request.user.sub)) {
        return response.status(404).json({ error: 'Capsule not found.' });
      }
      return response.status(204).end();
    } catch (error) {
      return next(error);
    }
  });

  const clientDist = path.resolve(currentDirectory, '../../../web/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, { index: false, maxAge: config.isProduction ? '1h' : 0 }));
    app.get('*', (request, response, next) => {
      if (request.path.startsWith('/api/') || request.path.startsWith('/auth/')) return next();
      return response.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use((request, response) => {
    response.status(404).json({ error: 'Not found.' });
  });

  app.use((error, _request, response, _next) => {
    if (error instanceof ValidationError) {
      return response.status(400).json({ error: error.message });
    }
    console.error(error);
    return response.status(500).json({ error: 'Unexpected server error.' });
  });

  app.locals.capsules = capsules;
  return app;
}
