# AI Capsule

AI Capsule is a private prompt library for saving, reviewing and improving useful AI prompts. GitHub authentication keeps each user's records private, while project context, prompt versions, response summaries and review notes remain together.

## Live deployment

https://ai-capsule-22234715-avh6g8eye7c7dzgt.australiaeast-01.azurewebsites.net/

Deployment checks:

```bash
curl -i https://ai-capsule-22234715-avh6g8eye7c7dzgt.australiaeast-01.azurewebsites.net/api/health

curl -i https://ai-capsule-22234715-avh6g8eye7c7dzgt.australiaeast-01.azurewebsites.net/api/auth/me

curl -i -H "Cookie: token=fake" https://ai-capsule-22234715-avh6g8eye7c7dzgt.australiaeast-01.azurewebsites.net/api/auth/me
```

Expected results:

* `/api/health` returns `200`
* A request without a session returns `401`
* A forged token returns `401`

## Core features

* Sign in and sign out with GitHub
* Create, browse, edit and delete prompt capsules
* Save project details, prompt versions and original prompt text
* Record response summaries, categories and usefulness ratings
* Mark records as reviewed or improved
* Add screenshot URLs and notes
* Access only records owned by the authenticated account
* Use the product across desktop and mobile layouts

## Technology

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Web            | React 19 and Vite                          |
| API            | Node.js 24 and Express                     |
| Authentication | GitHub OAuth and application-issued JWT    |
| Database       | SQLite using Node's built-in `node:sqlite` |
| Deployment     | Azure App Service and GitHub Actions       |

The React application and Express API use the same HTTPS origin in production. Express serves the compiled frontend, API endpoints and SPA fallback.

## Project structure

```text
apps/
├── web/
│   └── src/
│       ├── app/             # application shell and routing
│       ├── features/        # authentication, capsules and marketing
│       └── shared/          # shared UI and API client
└── api/
    ├── src/
    │   ├── bootstrap/       # server startup
    │   ├── config/          # runtime configuration
    │   ├── http/            # Express application
    │   ├── infrastructure/  # SQLite connection and repository
    │   └── modules/         # authentication and capsule domains
    └── test/integration/
data/                         # local SQLite data
```

## Capsule data

Each capsule stores:

```text
id, user_id, project_name, prompt_title, prompt_version, prompt_text,
response_summary, category, usefulness, reviewed, improved,
screenshot_url, notes, created_at
```

## Local development

Requires Node.js 24 and npm.

```bash
npm ci
cp .env.example .env
npm run dev
```

Open:

```text
http://localhost:5173
```

When GitHub credentials are absent, development mode provides a local preview account. This development bypass is disabled in production.

Available commands:

```bash
npm run dev       # start the frontend and API
npm run build     # build the production frontend
npm start         # start the production server
npm test          # run API integration tests
npm run verify    # run tests and production build
```

## API

| Method   | Endpoint                | Purpose                       |
| -------- | ----------------------- | ----------------------------- |
| `GET`    | `/api/health`           | Public health check           |
| `GET`    | `/auth/github`          | Start GitHub OAuth            |
| `GET`    | `/auth/github/callback` | Complete GitHub OAuth         |
| `GET`    | `/api/auth/me`          | Return the authenticated user |
| `POST`   | `/api/auth/logout`      | Clear the session             |
| `GET`    | `/api/capsules`         | List the user's capsules      |
| `POST`   | `/api/capsules`         | Create a capsule              |
| `PUT`    | `/api/capsules/:id`     | Update an owned capsule       |
| `DELETE` | `/api/capsules/:id`     | Delete an owned capsule       |

## Authentication and security

* GitHub OAuth establishes the user's identity
* GitHub passwords and access tokens are not stored
* A random, short-lived OAuth `state` protects the authorization flow
* Express creates its own signed JWT after authentication
* The JWT expires after eight hours
* Sessions use a `Secure`, `HttpOnly`, `SameSite=Lax` cookie
* Session tokens are not stored in browser local storage
* User identity comes from the verified JWT subject
* Client-supplied user IDs are never trusted
* Every database operation is scoped to the authenticated owner
* Helmet headers and server-side validation protect the API
* Missing, expired and forged tokens return `401 Unauthorized`

## Azure deployment

The application runs on a Linux Azure App Service with Node.js 24. GitHub Actions deploys changes from the `main` branch.

Azure supplies the application port, and the Express server listens on `0.0.0.0`. Deployment runs:

```bash
npm ci
npm run build
npm start
```

Required Azure settings include:

```text
NODE_ENV
APP_URL
CLIENT_URL
GITHUB_CALLBACK_URL
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
JWT_SECRET
SQLITE_PATH
```

The GitHub OAuth callback is:

```text
https://ai-capsule-22234715-avh6g8eye7c7dzgt.australiaeast-01.azurewebsites.net/auth/github/callback
```

SQLite uses:

```text
/home/data/ai-capsule.db
```


## Testing

```bash
npm run verify
```

The integration suite covers:

* Public health access
* Production secret requirements
* Missing and forged session rejection
* Input validation
* Authenticated CRUD operations
* Cross-user data isolation

## AI acknowledgement

Generative AI supported UI iteration, code refactoring, testing and documentation. The final implementation, security configuration and deployment were reviewed and verified by the developer.
