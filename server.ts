import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PYTHON_PORT = 8000;
const FASTAPI_URL = `http://127.0.0.1:${PYTHON_PORT}`;

let pythonProcess: ChildProcess | null = null;

function startPythonBackend() {
  console.log(`Starting Python FastAPI backend on port ${PYTHON_PORT}...`);
  pythonProcess = spawn('python3', ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', `${PYTHON_PORT}`], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  pythonProcess.on('error', (err) => {
    console.error('Failed to start Python backend:', err);
  });

  pythonProcess.on('exit', (code, signal) => {
    console.log(`Python backend exited with code ${code}, signal ${signal}`);
  });
}

// Clean up child process on exit
process.on('SIGINT', () => {
  if (pythonProcess) pythonProcess.kill('SIGINT');
  process.exit();
});
process.on('SIGTERM', () => {
  if (pythonProcess) pythonProcess.kill('SIGTERM');
  process.exit();
});

async function startServer() {
  startPythonBackend();

  const app = express();
  app.use(express.json());

  // Proxy /api/* to FastAPI backend
  app.all('/api/*', async (req, res) => {
    const targetUrl = `${FASTAPI_URL}${req.originalUrl}`;
    
    // Attempt request with retries if FastAPI is warming up
    let attempts = 0;
    const maxAttempts = 6;
    
    while (attempts < maxAttempts) {
      try {
        const fetchOptions: RequestInit = {
          method: req.method,
          headers: {
            'Content-Type': req.headers['content-type'] || 'application/json',
            Accept: req.headers['accept'] || 'application/json',
          },
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
          fetchOptions.body = JSON.stringify(req.body);
        }

        const backendRes = await fetch(targetUrl, fetchOptions);
        const data = await backendRes.text();

        res.status(backendRes.status);
        const contentType = backendRes.headers.get('content-type');
        if (contentType) {
          res.setHeader('Content-Type', contentType);
        }
        return res.send(data);
      } catch (err: any) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.error(`Failed proxying to ${targetUrl}:`, err.message);
          return res.status(503).json({
            error: 'Backend service initializing or unavailable',
            details: err.message,
          });
        }
        // Wait 500ms before retry
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Autonomous Multi-Agent System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
