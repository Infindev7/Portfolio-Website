import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserOrOrgSite = repoName.endsWith(".github.io");
const explicitBase = process.env.VITE_BASE_PATH?.trim();
const base = explicitBase
  ? explicitBase
  : repoName && !isUserOrOrgSite
    ? `/${repoName}/`
    : "/";

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
});
