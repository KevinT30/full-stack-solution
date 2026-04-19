import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: {
        preset: "node-server",
        compatibilityDate: "2025-09-24",
      },
    }),
    react(),
    tsConfigPaths(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    strictPort: true,
  },
});
