import {
  bootWeeklyPlanner,
  setWeeklyPlannerEnabled,
  startCronProbe,
} from './jobs/WeeklyPlanner.js';

export const initializePostStartTasks = async () => {
  // Encendido por .env, sin distinguir prod/dev
  const want = (process.env.WEEKLY_PLANNER_ENABLED || 'false') === 'true';
  setWeeklyPlannerEnabled(want);

  if (want) {
    await bootWeeklyPlanner();
    if (process.env.DEBUG_WEEKLY === '1') startCronProbe('Europe/Madrid');
    return;
  }

  console.log('⚠️ Weekly planner desactivado por .env');
};
