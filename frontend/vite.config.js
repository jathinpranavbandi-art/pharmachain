import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const api = `http://localhost:${process.env.API_PORT || 4000}`;
const port = Number(process.env.FRONTEND_PORT) || 5173;
// host: true => reachable from your phone on the same Wi-Fi. /api is proxied to the backend.
export default defineConfig({
  plugins: [react()],
  server: { host: true, port, strictPort: true, proxy: { '/api': api } },
  preview: { host: true, port, proxy: { '/api': api } },
});
