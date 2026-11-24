import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://pospoliteshop.ru",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory"
  }
});
