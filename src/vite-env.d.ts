/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRANSLATION_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
