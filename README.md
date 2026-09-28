# SimpAns AI Mobile

React Native CLI (TypeScript) Android client for SimpAns AI. This project is separate from `simpans-ai-web` and talks to the same `simpans-ai-backend` HTTP API. It does not contain Gemini, Pinecone, or Supabase credentials.

## Setup

```powershell
cd c:\AK\DriveA\SimpAnsAI\Backup\zSimpAnsAI\simpans-ai-mobile
npm install
```

Point the app at your backend in `src/config.ts`:

- Android emulator: `http://10.0.2.2:5000` (default in `__DEV__`)
- Physical device: your PC LAN IP, for example `http://192.168.1.10:5000`
- Production: deployed backend HTTPS URL

Start the backend from `simpans-ai-backend`, then:

```powershell
npm start
npm run android
```

## Scripts

- `npm start` — Metro bundler
- `npm run android` — build and install the Android app
- `npm run typecheck` — TypeScript check

## Permissions

`INTERNET` is declared for API calls. PDF picking uses the system document picker (Storage Access Framework), so extra storage permissions are not required on modern Android.
