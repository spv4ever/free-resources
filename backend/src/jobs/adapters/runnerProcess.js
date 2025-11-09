// jobs/adapters/runnerProcess.js
import { spawn } from 'node:child_process';

const MAP = {
  post:     'node ./jobs/IGDailyPost.js',
  carousel: 'node ./jobs/IGDailyCarousel.js',
  reel:     'node ./jobs/IGDailyReel.js',
};

export async function runViaProcess(type, accountCtx) {
  const cmd = MAP[type];
  if (!cmd) throw new Error(`Unknown type ${type}`);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd.split(' ')[0], cmd.split(' ').slice(1), {
      stdio: 'inherit',
      env: {
        ...process.env,
        // En caso de que tus jobs lean estas envs, las inyectamos:
        
        IG_USER_ID_ACCOUNT2: accountCtx.igUserId,
        IG_ACCESS_TOKEN_ACCOUNT2: accountCtx.accessToken,
        IG_ACCOUNT_ALIAS: accountCtx.alias,
      },
    });
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Exit ${code}`)));
    child.on('error', reject);
  });
}
