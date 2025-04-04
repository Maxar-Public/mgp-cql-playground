interface ImportMetaEnv {
    readonly VITE_MY_KEY: string;
    readonly VITE_API_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  
