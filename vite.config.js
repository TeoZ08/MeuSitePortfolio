import { defineConfig } from "vite";

export default defineConfig({
  base: "/MeuSitePortfolio/",
  server: {
    host: true
  },
  build: {
    target: "es2022",
    sourcemap: false,
    // Three.js fica em um chunk dinâmico de ~509 kB (~128 kB gzip).
    // O limite documenta que esse custo é intencional e não bloqueia o HTML.
    chunkSizeWarningLimit: 550
  }
});
