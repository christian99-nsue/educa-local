import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig(({ mode }) => ({
  base: mode === "github" ? "/educa-local/" : "/",
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    ViteImageOptimizer({
      png: { quality: 75 },
      jpg: { quality: 75 },
      jpeg: { quality: 75 },
    }),
  ],
}));
