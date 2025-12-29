import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // CRITICAL: Base path for GitHub Pages
  // - Production: /Master-DevTools/ (matches repo name with HYPHEN)
  // - Development: / (for local dev and Lovable)
  base: mode === 'production' ? '/Master-DevTools/' : '/',
  
  server: {
    host: "::",
    port: 8080,
  },
  
  build: {
    outDir: 'dist',
    // Ensure assets use relative paths
    assetsDir: 'assets',
  },
  
  plugins: [
    react(), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
