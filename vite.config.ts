
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Define environment variables that will be available at build time
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://ptkqosrcopnsclgyrjqh.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0a3Fvc3Jjb3Buc2NsZ3lyanFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5Nzg2MzUsImV4cCI6MjA1OTU1NDYzNX0.02iDkud89OEj98hFFkOt8_QNhs_N6uqAXj4laoZi7Mk')
  }
}));
