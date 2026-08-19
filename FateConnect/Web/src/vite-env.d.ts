/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_API_URL: string;
  readonly VITE_RIDE_API_URL: string;
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
