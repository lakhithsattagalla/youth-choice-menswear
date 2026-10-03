import app from '../server/index.js';

export default function handler(req: any, res: any) {
  // Restore path if Vercel rewrite stripped it
  const matchedPath = req.headers['x-matched-path'];
  if (typeof matchedPath === 'string' && (req.url === '/api' || req.url === '/api/' || req.url === '/')) {
    req.url = matchedPath;
  }
  return app(req, res);
}
