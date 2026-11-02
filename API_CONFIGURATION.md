# API configuration

`.env` controls the dashboard API mode independently of `npm run dev` / `npm run build`:

```dotenv
VITE_USE_PRODUCTION=true
VITE_DEVELOPMENT_API_URL=http://localhost:8080/api
VITE_CONFIG_BASE_URL=https://school-springboot-backend.onrender.com/api
```

`true` (default) uses the live URL saved in Settings. `false` uses only
`VITE_DEVELOPMENT_API_URL` and ignores remote configuration and cached live URLs.
Restart Vite after changing `.env`; rebuild deployed dashboards after changes.
Copy `.env.example` when setting up another checkout.

In Flutter, `lib/utils/app_url.dart` defines `useProduction` (default true),
`developmentUrl`, and the stable `configBaseUrl`. Set the bool default to false
for development, or run:

```sh
flutter run --dart-define=USE_PRODUCTION=false --dart-define=DEVELOPMENT_API_URL=http://192.168.31.107:8080/api
```

Use the backend computer's LAN IP for a physical phone. Rebuild/restart the app
after changing these compile-time values.

Deploy/restart the updated Spring Boot backend on the configuration server.
Only Super Admin can edit the live URL through Profile > Settings. The database
stores this URL; production clients refresh it every 15 seconds. The public
configuration endpoint always returns live, including databases with a legacy
development selection. Development URLs and mode selection stay local to each
client. If configuration is unavailable, production uses its last known live URL
or the production default. Moving to a different API server can require login.
The configuration server address stays fixed so clients can discover future URL changes.
