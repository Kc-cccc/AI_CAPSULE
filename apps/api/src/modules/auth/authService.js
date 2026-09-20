import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const TOKEN_COOKIE = 'token';
const STATE_COOKIE = 'oauth_state';
const TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000;

function cookieOptions(config, maxAge = TOKEN_MAX_AGE_MS) {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    maxAge,
    path: '/'
  };
}

export function issueAppToken(user, config) {
  return jwt.sign(
    {
      sub: String(user.id),
      login: user.login,
      avatar_url: user.avatar_url || ''
    },
    config.jwtSecret,
    {
      expiresIn: '8h',
      issuer: 'ai-capsule',
      audience: 'ai-capsule-web'
    }
  );
}

export function verifyAppToken(token, config) {
  return jwt.verify(token, config.jwtSecret, {
    issuer: 'ai-capsule',
    audience: 'ai-capsule-web'
  });
}

export function requireAuth(config) {
  return (request, response, next) => {
    const token = request.cookies[TOKEN_COOKIE];
    if (!token) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    try {
      request.user = verifyAppToken(token, config);
      return next();
    } catch {
      return response.status(401).json({ error: 'Unauthorized' });
    }
  };
}

export function setTokenCookie(response, token, config) {
  response.cookie(TOKEN_COOKIE, token, cookieOptions(config));
}

export function clearTokenCookie(response, config) {
  response.clearCookie(TOKEN_COOKIE, cookieOptions(config, 0));
}

export function beginGithubOAuth(request, response, config) {
  if (!config.isProduction) {
    const developmentUser = {
      id: 'local-development-user',
      login: 'local-preview',
      avatar_url: ''
    };
    setTokenCookie(response, issueAppToken(developmentUser, config), config);
    return response.redirect(`${config.clientUrl}/dashboard`);
  }

  if (!config.githubClientId || !config.githubClientSecret || !config.jwtSecret) {
    return response.redirect(`${config.clientUrl}/login?error=oauth_not_configured`);
  }

  const state = crypto.randomBytes(24).toString('hex');
  response.cookie(STATE_COOKIE, state, cookieOptions(config, 10 * 60 * 1000));

  const query = new URLSearchParams({
    client_id: config.githubClientId,
    redirect_uri: config.githubCallbackUrl,
    scope: 'read:user',
    state
  });

  return response.redirect(`https://github.com/login/oauth/authorize?${query}`);
}

export async function finishGithubOAuth(request, response, config) {
  const { code, state } = request.query;
  const expectedState = request.cookies[STATE_COOKIE];
  response.clearCookie(STATE_COOKIE, cookieOptions(config, 0));

  if (!code || !state || !expectedState || state !== expectedState) {
    return response.redirect(`${config.clientUrl}/login?error=oauth_failed`);
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
        redirect_uri: config.githubCallbackUrl
      })
    });

    const tokenPayload = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenPayload.access_token) {
      throw new Error('GitHub token exchange failed.');
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${tokenPayload.access_token}`,
        'User-Agent': 'AI-Capsule'
      }
    });

    const githubUser = await userResponse.json();
    if (!userResponse.ok || !githubUser.id || !githubUser.login) {
      throw new Error('GitHub user lookup failed.');
    }

    setTokenCookie(response, issueAppToken(githubUser, config), config);
    return response.redirect(`${config.clientUrl}/dashboard`);
  } catch (error) {
    console.error('OAuth callback error:', error.message);
    return response.redirect(`${config.clientUrl}/login?error=oauth_failed`);
  }
}
