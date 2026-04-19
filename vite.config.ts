import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    preset: "node-server",
    compatibilityDate: "2025-09-24",
  },
  vite: {
    plugins: [
      tsConfigPaths(),
      tailwindcss(),
    ],
    server: {
      port: 3000,
      strictPort: true,
    },
  },
});
