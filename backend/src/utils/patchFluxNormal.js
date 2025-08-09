// src/utils/patchFluxNormal.js
/**
 * Patcher específico para flux_keiko.json (modo "normal")
 * Nodos usados:
 *  - #13 String Literal -> prompt
 *  - #1  EmptyLatentImage -> width, height
 *  - #10 BasicScheduler -> steps
 *  - #12 RandomNoise -> noise_seed
 *  - #25 LoraLoader -> lora_name, strength_model, strength_clip
 *  - #30 SaveImage -> filename_prefix
 */
export function patchFluxNormal(
  flow,
  {
    prompt,
    width,
    height,
    steps,
    seed, // opcional
    filename_prefix,
    forceLoraStrength = false, // si true y no se pasa strength_model, pone 1.0
    lora = null,               // { name, trigger, strength_model, strength_clip, insertMode }
  }
) {
  if (!flow) throw new Error('flow requerido');

  const changed = [];

  // --- TRIGGER helper ---
  const insertTrigger = (text, trigger, insertMode = 'prefix') => {
    if (!trigger || !trigger.trim()) return text;
    const t = trigger.trim();
    const re = new RegExp(`\\b${escapeRegex(t)}\\b`, 'i');
    if (re.test(text)) return text; // ya está presente

    if (insertMode === 'suffix') return `${text.trim()}, ${t}`;
    // default: prefix
    return `${t}, ${text.trim()}`;
  };
  // Normaliza a POSIX y fuerza doble “//” solo para Comfy en JSON
  function toComfyLoraPath(pathStr) {
    if (!pathStr) return pathStr;
    // 1) normaliza backslashes -> forward
    let s = String(pathStr).trim().replace(/\\/g, '/');
    // 2) colapsa posibles // previos a una sola /
    s = s.replace(/\/{2,}/g, '/');
    // 3) convierte cada / simple a //
    s = s.replace(/\//g, '//');
    return s;
  }



  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // #13 String Literal -> prompt (inyecta trigger si procede)
  if (flow["13"]?.class_type === "String Literal") {
    const prev = flow["13"].inputs.string ?? '';
    let nextPrompt = String(prompt ?? '').trim();

    if (lora?.trigger) {
      const mode = lora.insertMode || 'prefix';
      nextPrompt = insertTrigger(nextPrompt, lora.trigger, mode);
    }

    flow["13"].inputs.string = nextPrompt;
    changed.push({ node: "13", field: "string", from: prev, to: nextPrompt });
  } else {
    throw new Error('Nodo 13 (String Literal) no encontrado: no puedo inyectar el prompt');
  }

  // #1 EmptyLatentImage -> width/height
  if (flow["1"]?.class_type === "EmptyLatentImage") {
    if (Number.isFinite(width)) {
      const prev = flow["1"].inputs.width;
      flow["1"].inputs.width = width;
      changed.push({ node: "1", field: "width", from: prev, to: width });
    }
    if (Number.isFinite(height)) {
      const prev = flow["1"].inputs.height;
      flow["1"].inputs.height = height;
      changed.push({ node: "1", field: "height", from: prev, to: height });
    }
  } else {
    throw new Error('Nodo 1 (EmptyLatentImage) no encontrado: no puedo fijar dimensiones');
  }

  // #10 BasicScheduler -> steps
  if (flow["10"]?.class_type === "BasicScheduler") {
    if (Number.isFinite(steps)) {
      const prev = flow["10"].inputs.steps;
      flow["10"].inputs.steps = steps;
      changed.push({ node: "10", field: "steps", from: prev, to: steps });
    }
  } else {
    throw new Error('Nodo 10 (BasicScheduler) no encontrado: no puedo fijar steps');
  }

  // #12 RandomNoise -> noise_seed (si viene)
  if (flow["12"]?.class_type === "RandomNoise") {
    if (Number.isInteger(seed)) {
      const prev = flow["12"].inputs.noise_seed;
      flow["12"].inputs.noise_seed = seed;
      changed.push({ node: "12", field: "noise_seed", from: prev, to: seed });
    }
  } else {
    throw new Error('Nodo 12 (RandomNoise) no encontrado: no puedo fijar seed');
  }

  // #25 LoraLoader -> lora_name / strengths
  if (flow["25"]?.class_type === "LoraLoader") {
    if (lora?.name) {
      const prevName = flow["25"].inputs.lora_name;
      const comfyName = toComfyLoraPath(lora.name);      // 👈 fuerza “//”
      flow["25"].inputs.lora_name = comfyName;
      changed.push({ node: "25", field: "lora_name", from: prevName, to: comfyName });
    }

    // strength_model -> prioridad: valor del frontend, luego (opcional) forzar a 1.0
    if (typeof lora?.strength_model === 'number') {
      const prev = flow["25"].inputs.strength_model;
      flow["25"].inputs.strength_model = lora.strength_model;
      changed.push({ node: "25", field: "strength_model", from: prev, to: lora.strength_model });
    } else if (forceLoraStrength && Object.prototype.hasOwnProperty.call(flow["25"].inputs, "strength_model")) {
      const prev = flow["25"].inputs.strength_model;
      flow["25"].inputs.strength_model = 1.0;
      changed.push({ node: "25", field: "strength_model", from: prev, to: 1.0 });
    }

    // strength_clip (opcional)
    if (typeof lora?.strength_clip === 'number' && Object.prototype.hasOwnProperty.call(flow["25"].inputs, "strength_clip")) {
      const prev = flow["25"].inputs.strength_clip;
      flow["25"].inputs.strength_clip = lora.strength_clip;
      changed.push({ node: "25", field: "strength_clip", from: prev, to: lora.strength_clip });
    }
  } else {
    throw new Error('Nodo 25 (LoraLoader) no encontrado');
  }

  // #30 SaveImage -> filename_prefix
  if (flow["30"]?.class_type === "SaveImage") {
    if (filename_prefix) {
      const prev = flow["30"].inputs.filename_prefix;
      flow["30"].inputs.filename_prefix = filename_prefix;
      changed.push({ node: "30", field: "filename_prefix", from: prev, to: filename_prefix });
    }
  } else {
    throw new Error('Nodo 30 (SaveImage) no encontrado: no puedo fijar filename_prefix');
  }

  return changed;
}
