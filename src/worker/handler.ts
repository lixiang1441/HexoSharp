import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler';
import json from './middlewares/json';
import jwtVerify from './middlewares/jwtVerify';
import router from './router';
import authRouter from './service/authRouter';
import ghCorsRouter from './service/ghCorsRouter';
import kvRouter from './service/kvRouter';

router.all('*', json);

authRouter();
ghCorsRouter();
router.all('/api/*', jwtVerify);
router.get(
  '/api/ping',
  () => new Response(null, { status: 200, headers: { 'Content-Type': 'text/plain' } }),
);
kvRouter();

router.all(
  '/api',
  (req) =>
    new Response(JSON.stringify(req, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    }),
);

router.get('*', async (req, event: FetchEvent) => {
  if (!event) return new Response(null, { status: 400 });
  try {
    const page = await getAssetFromKV(event, { mapRequestToAsset: serveSinglePageApp });
    const response = new Response(page.body, page);
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'unsafe-url');
    response.headers.set('Feature-Policy', 'none');
    return response;
  } catch (e) {
    return new Response(null, { status: 404 });
  }
});

const handleRequest = async (request: Request, event?: FetchEvent) => router.handle(request, event);

export default handleRequest;
