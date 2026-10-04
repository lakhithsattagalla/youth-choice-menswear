import app from '../server/index.js';

export default function handler(req: any, res: any) {
  // Extract true request path in Vercel serverless environment
  let requestPath = req.url || '/';

  const forwardedUri = req.headers['x-forwarded-uri'] || req.headers['x-invoke-path'] || req.originalUrl;
  if (typeof forwardedUri === 'string' && forwardedUri.length > 0 && !forwardedUri.endsWith('/api') && !forwardedUri.endsWith('/api/')) {
    requestPath = forwardedUri;
  }

  if (!requestPath.startsWith('/api') && !requestPath.startsWith('/auth') && !requestPath.startsWith('/admin')) {
    requestPath = `/api${requestPath.startsWith('/') ? '' : '/'}${requestPath}`;
  }

  req.url = requestPath;
  return app(req, res);
}
