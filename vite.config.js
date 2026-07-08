import { defineConfig } from "vite";

const hybridEntry = {
  name: "hybrid-subtraction-entry",
  transform(code, id) {
    if (!id.endsWith("/src/main.js")) return null;
    return `${code}\nimport "./hybrid.js";\n`;
  }
};

export default defineConfig({
  base: "/MeuSitePortfolio/",
  plugins: [hybridEntry],
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
