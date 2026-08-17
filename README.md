# UI for the EOSC Fair Assessments Proxy API

Tanstack Start + TypeScript + Vite Plus application. Multilingual ready.

## Configuration

Copy `.env.example` and fill in the values:

| Variable | Description                            |
| -------- | -------------------------------------- |
| `API`    | Fair Assessment API base URL (for SSR) |

For local development use `.env.development`, for production use `.env.production`.

## Running locally

Make sure Vite Plus is installed. If not, install:

```bash
curl -fsSL https://vite.plus | bash
```

and open a new terminal tab.

When Vite Plus is installed, run:

```bash
vp i
vp dev
```

## Cleanup

Use Vite Plus for linting and code formatting.

```bash
vp check
```

## Building

```bash
vp build
```

## Docker

Build the image:

```bash
docker build \
  -t fair-assessments-ui .
```

Run the container and specify the required runtime variables:

```bash
docker run -e API=https://... -p 3000:3000 fair-assessments-ui
```

Or when you have a populated .env file:

```bash
docker run --env-file .env -p 3000:3000 fair-assessments-ui
```

The app will be available at http://localhost:3000.
