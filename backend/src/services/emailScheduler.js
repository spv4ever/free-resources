import EmailImportContext from '../models/EmailImportContext.js';
import { importEmails } from './gmailService.js';

function shouldRunNow(frequency, lastRun) {
  if (frequency === 'manual') return false;
  if (!lastRun) return true;

  const now = new Date();
  const last = new Date(lastRun);
  const diffHours = (now - last) / (1000 * 60 * 60);

  return frequency === 'daily' ? diffHours >= 24 : diffHours >= 168;
}

export async function runScheduledImports() {
  const contexts = await EmailImportContext.find({ active: true });

  console.log('📋 Contextos activos encontrados:', contexts.map(c => ({
    context: c.context,
    searchTerm: c.searchTerm,
    frequency: c.frequency,
    lastImportedAt: c.lastImportedAt
  })));

  for (const cfg of contexts) {
    if (shouldRunNow(cfg.frequency, cfg.lastImportedAt)) {
      try {
        const result = await importEmails({
          searchTerm: cfg.searchTerm,
          context: cfg.context
        });

        cfg.lastImportedAt = new Date();
        await cfg.save();

        console.log(`✅ [${cfg.context}] Importados ${result.imported} / ${result.total}`);
      } catch (err) {
        console.error(`❌ Error en [${cfg.context}]`, err.message);
      }
    } else {
      console.log(`⏭️ [${cfg.context}] No requiere actualización`);
    }
  }
}
