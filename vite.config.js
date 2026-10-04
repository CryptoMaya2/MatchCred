import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function nebiusApiPlugin() {
  return {
    name: 'nebius-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/nebius-match', async (req, res, next) => {
        if (req.method === 'POST') {
          let rawBody = '';
          req.on('data', chunk => { rawBody += chunk; });
          req.on('end', async () => {
            try {
              let body = {};
              if (rawBody && rawBody.trim()) {
                body = JSON.parse(rawBody);
              }
              const apiKey = process.env.NEBIUS_API_KEY;
              const { handleNebiusMatchRequest } = await import('./api/nebius-match.js');
              const result = await handleNebiusMatchRequest(body, apiKey);
              res.statusCode = result.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result.data));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: false, 
                error: `Local server error: ${err.message}`,
                provider: 'Nebius Token Factory',
                apiUrl: 'https://api.tokenfactory.nebius.com/v1/chat/completions'
              }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.NEBIUS_API_KEY) {
    process.env.NEBIUS_API_KEY = env.NEBIUS_API_KEY;
  }

  return {
    plugins: [
      tailwindcss(),
      react(),
      nebiusApiPlugin()
    ]
  };
});
