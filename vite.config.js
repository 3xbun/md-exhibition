import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0", // Change this to a valid IP address if needed
    port: 5173, // Optional otherwise your app will start on default port
    allowedHosts: true,
  },
});
