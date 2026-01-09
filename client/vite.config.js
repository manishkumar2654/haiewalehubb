import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), visualizer({ open: true })],
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
      "http://localhost:8080/api/v1"
    ),
    "import.meta.env.VITE_GOOGLE_CLIENT_ID": JSON.stringify(
      "655741534906-d2tap253l9sg51tc9idbshsfkm7h2guq.apps.googleusercontent.com"
    ),
  },
});
