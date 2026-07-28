// import { defineConfig, loadEnv } from "vite";
// import react from "@vitejs/plugin-react";
// import { fileURLToPath, URL } from "node:url";

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd(), "");
//   const proxyTarget =
//     env.VITE_PROXY_TARGET || "https://mohaimin8010.sobhoy.com";

//   return {
//     plugins: [react()],
//     resolve: {
//       alias: {
//         "@": fileURLToPath(new URL("./src", import.meta.url)),
//       },
//     },
//     server: {
//       port: 5174,
//       proxy: {
//         // Browser → same-origin /api/v1 → Vite proxies to real backend (no CORS)
//         "/api/v1": {
//           target: proxyTarget,
//           changeOrigin: true,
//           secure: false,
//         },
//       },
//     },
//   };
// });


import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget =
    env.VITE_PROXY_TARGET || "https://mohaimin8010.sobhoy.com";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5174,
      allowedHosts: ["mohaimin8001.sobhoy.com"],
      proxy: {
        // Browser → same-origin /api/v1 → Vite proxies to real backend (no CORS)
        "/api/v1": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});