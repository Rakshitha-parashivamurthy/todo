import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
      },
    },
    plugins: [
      react(),
      {
        name: 'configure-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              console.log(`[Middleware] Request: ${req.method} ${req.url}`);
            }
            if (req.url.startsWith('/api/ai') && req.method === 'POST') {
              console.log("Middleware matched /api/ai");
              try {
                // Buffer the body
                const buffers = [];
                for await (const chunk of req) {
                  buffers.push(chunk);
                }
                const body = JSON.parse(Buffer.concat(buffers).toString());

                // Mock Vercel-like Request/Response
                (req as any).body = body;

                // Inject env vars for the handler
                Object.assign(process.env, env);

                (res as any).status = (statusCode: number) => {
                  res.statusCode = statusCode;
                  return res;
                };

                (res as any).json = (data: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return res;
                };

                // Dynamic import of the function
                const handlerData = await import('./api/ai.js');
                const handler = handlerData.default;

                await handler(req, res);
              } catch (error) {
                console.error("Middleware Error:", error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Internal Middleware Error' }));
              }
            } else {
              next();
            }
          });
        },
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
  };
});
