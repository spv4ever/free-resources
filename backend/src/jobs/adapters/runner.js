// jobs/adapters/runner.js
import { runViaHttp } from './runnerHttp.js';

const MODE = (process.env.WEEKLY_RUNNER_MODE || 'http').toLowerCase();

/**
 * Ejecuta la publicación de tipo post | carousel | reel para una cuenta.
 */
export async function run(type, accountCtx, opts) {
  if (MODE === 'http') return runViaHttp(type, accountCtx, opts);
  return runViaHttp(type, accountCtx, opts); // fallback por si acaso
}
