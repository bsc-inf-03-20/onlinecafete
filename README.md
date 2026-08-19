# onlinecafete

This repository is being turned into an Online Cafeteria API built with NestJS and MongoDB.

## What you need

- Node.js
- MongoDB running locally on `127.0.0.1:27017`

## Local setup

1. Start MongoDB locally:

```console
npm run mongo-start
```

2. Install dependencies:

```console
npm install
```

3. Start the API:

```console
npm run start:dev
```

4. Open the browser UI:

```text
http://localhost:3000
```

The app uses this connection by default:

```text
mongodb://127.0.0.1:27017/onlinecafete
```

If you want to use a different MongoDB server, set `DATABASE_URL` before starting the app.

## Handy scripts

- `npm run mongo-start` starts a local MongoDB container on port `27017`
- `npm run mongo-stop` removes the local MongoDB container
- `npm run start:dev` starts the NestJS API with live reload
- `npm run build` compiles the API for production

## API Design Docs

- [Cafeteria API design](docs/cafeteria-api-design.md)
- [Cafeteria API spec](docs/cafeteria-api-spec.md)
- [Cafeteria OpenAPI contract](docs/cafeteria-api-openapi.yaml)

## Notes

- The front end is now a lightweight API landing page served from `public/`
- The database name is `onlinecafete`
