import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig(() => {
    const apiBase = process.env.VITE_API_BASE_URL
    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            proxy: apiBase ? undefined : {
                // Forward /api/* to backend dev server (default http://localhost:8000)
                "/api": {
                    target: "http://localhost:8000",
                    changeOrigin: true,
                },
            },
        },
    }
})
