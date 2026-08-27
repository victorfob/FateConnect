/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_API_URL: string;
  readonly VITE_RIDE_API_URL: string;
  /** Ausente em desenvolvimento e em teste: sem ela o Sentry não sobe. */
  readonly VITE_SENTRY_DSN?: string;
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
