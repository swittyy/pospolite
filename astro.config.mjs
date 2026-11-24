import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://swittyy.github.io",
  base: "/pospolite",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory"
  }
});
