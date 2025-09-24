    // ES Modules
    import 'dotenv/config';
    import axios from 'axios';
    import fs from 'fs';
    import path from 'path';
    import os from 'os';
    import { spawn } from 'child_process';
    import mongoose from 'mongoose';
    import { v2 as cloudinary } from 'cloudinary';
    import ffmpegPath from 'ffmpeg-static';
    import ImagenGenerada from '../models/ImagenGenerada.js';

    // ====== IG ENV (tus mismas variables) ======
    const IG_USER_ID = process.env.IG_USER_ID_ACCOUNT2;
    const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN_ACCOUNT2;
    const IG_ACCOUNT_ALIAS = process.env.IG_ACCOUNT_ALIAS || 'keikodevfree';
    const GRAPH_VER = 'v23.0'; // usar la última estable

    // Perfil FULLHD (1080x1920 @ ~3 Mbps) y LITE (720x1280 @ ~2 Mbps)
    const REEL_PROFILES = {
    full: { w: 1080, h: 1920, bVideo: '3000k', buf: '6000k' },
    lite: { w: 720,  h: 1280, bVideo: '2000k', buf: '4000k' },
    };
    // elige perfil por parámetro o ENV (fallback full)
    const REEL_PROFILE = (process.env.IG_REEL_PROFILE || 'full').toLowerCase();

    // ====== Cloudinary (tus mismas ENV) ======
    cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // (Opcional) si tu proyecto ya conecta a Mongo antes, quita estos connect/disconnect.
    const MONGO_URI = process.env.MONGO_URI;
    const MONGO_DB  = process.env.MONGO_DB;

    // ====== Binario FFmpeg ======
    const FFMPEG_BIN = process.env.FFMPEG_PATH || ffmpegPath || 'ffmpeg';

    // ====== TUNABLES ======
    const FPS                = 30;      // IG Reels: mínimo 30 FPS
    const MIN_PER_SLIDE_SECS = 2;
    const MAX_REEL_SECS      = 90;      // Límite Graph API Reels
    const POLL_INTERVAL_MS   = 2000;    // polling del container
    const PARENT_TIMEOUT_MS  = 180000;  // 180s para el container
    const MAX_VIDEO_SIZE_MB  = 300;     // seguridad (IG suele aceptar <= 200–300 MB)

    // ====== UTILS ======
    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    async function ensureFfmpeg() {
    return new Promise((resolve, reject) => {
        const p = spawn(FFMPEG_BIN, ['-version']);
        p.on('error', reject);
        p.on('close', code => (code === 0 ? resolve() : reject(new Error('ffmpeg no disponible'))));
    });
    }

    async function downloadToTemp(url) {
    const filename = `reel_${Date.now()}_${Math.random().toString(36).slice(2)}${path.extname(new URL(url).pathname) || '.jpg'}`;
    const outPath = path.join(os.tmpdir(), filename);
    const res = await axios.get(url, { responseType: 'stream' });
    await new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(outPath);
        res.data.pipe(ws);
        ws.on('finish', resolve);
        ws.on('error', reject);
    });
    return outPath;
    }

    async function headOk(url) {
    try {
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        if (!res.ok) return { ok: false };
        const ct = res.headers.get('content-type') || '';
        const cl = res.headers.get('content-length');
        const sizeMB = cl ? (+cl / (1024 * 1024)) : null;
        return {
        ok: ct.startsWith('image/'),
        ct,
        sizeMB
        };
    } catch {
        return { ok: false };
    }
    }

    async function headVideoOk(url) {
    try {
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        if (!res.ok) return { ok: false };
        const ct = res.headers.get('content-type') || '';
        const cl = res.headers.get('content-length');
        const sizeMB = cl ? (+cl / (1024 * 1024)) : null;
        return {
        ok: ct.startsWith('video/'),
        ct,
        sizeMB
        };
    } catch {
        return { ok: false };
    }
    }

    async function runFfmpeg(args) {
    return new Promise((resolve, reject) => {
        const p = spawn(FFMPEG_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });
        let out = '', err = '';
        p.stdout.on('data', d => (out += d.toString()));
        p.stderr.on('data', d => (err += d.toString()));
        p.on('close', code => (code === 0 ? resolve({ out, err }) : reject(new Error(err || `ffmpeg exited ${code}`))));
    });
    }

    function buildCaptionKeikoDevFree({ titulo = '', tagsExtra = [] } = {}) {
    const base = [
        '#KeikoDevFree', '#RecursosGratis', '#IA', '#Diseño', '#DesarrolloWeb',
        '#Creatividad', '#Productividad', '#WebDev', '#OpenSource'
    ];
    const tituloSafe = titulo?.trim() ? `📌 ${titulo.trim()}\n\n` : '';
    const hashtags = [...new Set([...base, ...tagsExtra])]
        .filter(Boolean)
        .join(' ');
    return `${tituloSafe}Reel generado con recursos visuales de @${IG_ACCOUNT_ALIAS}.\n${hashtags}`;
    }

    // ====== IG HELPERS ======
    async function igCreateReelContainer({ videoUrl, caption, thumbOffset = 0.0 }) {
    const url = `https://graph.facebook.com/${GRAPH_VER}/${IG_USER_ID}/media`;
    const params = {
        media_type: 'REELS',
        video_url: videoUrl,
        caption,
        thumb_offset: thumbOffset,
        access_token: IG_ACCESS_TOKEN
    };
    const { data } = await axios.post(url, null, { params });
    return data.id; // creation_id
    }

    async function igCreateReelContainerRetry({ videoUrl, caption, thumbOffset = 0.0, maxAttempts = 4 }) {
    // Preflight: HEAD de video/mp4 y tamaño razonable
    const hv = await headVideoOk(videoUrl);
    if (!hv.ok) throw new Error(`HEAD video falló o no es video/* (${hv.ct || 'sin CT'}) → ${videoUrl}`);
    if (hv.sizeMB && hv.sizeMB > MAX_VIDEO_SIZE_MB) {
        throw new Error(`Video supera ${MAX_VIDEO_SIZE_MB} MB (${hv.sizeMB.toFixed(1)} MB)`);
    }

    let lastErr;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
        const id = await igCreateReelContainer({ videoUrl, caption, thumbOffset });
        return id;
        } catch (e) {
        lastErr = e;
        const payload = e?.response?.data?.error || {};
        const maybeTransient = payload?.code === 1 || payload?.code === 2 || payload?.is_transient;

        console.error(
            `[reel][attempt ${attempt}/${maxAttempts}] fallo creando container`,
            payload || e.message
        );

        if (!maybeTransient || attempt === maxAttempts) break;

        // backoff exponencial con jitter
        const base = Math.pow(2, attempt - 1) * 1000;
        const jitter = Math.floor(Math.random() * 400);
        await sleep(base + jitter);
        }
    }
    throw lastErr;
    }

    async function igPublish({ creationId }) {
    const url = `https://graph.facebook.com/${GRAPH_VER}/${IG_USER_ID}/media_publish`;
    const params = { creation_id: creationId, access_token: IG_ACCESS_TOKEN };
    const { data } = await axios.post(url, null, { params });
    return data.id; // igMediaId
    }

    async function igPublishRetry({ creationId, maxAttempts = 8 }) {
    let lastErr;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
        // Espera creciente (≈3s, 4.6s, 6.6s, 9.7s, ...)
        const wait = 3000 + Math.pow(1.6, attempt - 1) * 1000 + Math.floor(Math.random() * 400);
        await sleep(wait);

        // Re-chequeo de estado por si volvió a IN_PROGRESS
        try {
            const st = await igGetStatusCode(creationId);
            if (st !== 'FINISHED') {
            console.warn(`[reel publish] status=${st} aún; difiriendo intento ${attempt}`);
            continue;
            }
        } catch (e) {
            console.warn('[reel publish] no se pudo leer status antes del publish', e?.response?.data || e.message);
        }

        const id = await igPublish({ creationId });
        return id;
        } catch (e) {
        lastErr = e;
        const payload = e?.response?.data?.error || {};
        const maybeTransient = payload?.code === 1 || payload?.code === 2 || payload?.is_transient;

        console.error(
            `[reel publish][attempt ${attempt}/${maxAttempts}] fallo en media_publish`,
            payload || e.message
        );

        if (!maybeTransient || attempt === maxAttempts) break;
        // si es transitorio, el bucle reintenta (con espera creciente)
        }
    }
    throw lastErr;
    }

    async function igGetStatusCode(creationId) {
    const url = `https://graph.facebook.com/${GRAPH_VER}/${creationId}`;
    const params = { fields: 'status_code', access_token: IG_ACCESS_TOKEN };
    const { data } = await axios.get(url, { params });
    return data?.status_code || null; // IN_PROGRESS | FINISHED | ERROR
    }
    async function waitUntilFinished(creationId, { timeoutMs, label }) {
    const start = Date.now();
    while (true) {
        let status = 'UNKNOWN';
        try {
        status = await igGetStatusCode(creationId);
        } catch (e) {
        console.warn(`[${label}] fallo consultando status_code`, e?.response?.data || e.message);
        }
        if (status === 'FINISHED') return true;
        if (status === 'ERROR') throw new Error(`${label} status_code=ERROR (${creationId})`);
        if (Date.now() - start > timeoutMs) throw new Error(`${label} timeout esperando FINISHED (${creationId})`);
        await sleep(POLL_INTERVAL_MS);
    }
    }

    // ====== DATA PICKER (filtra ya publicadas y deduplica por URL y filename) ======
    async function pickPublishableImages({ limit = 6 }) {
    const hardMax = Math.min(Math.max(limit, 2), 20); // 2..20

    const query = {
        publishable: true,
        finalUrl: { $exists: true, $ne: '' },
        $nor: [{
        publications: { $elemMatch: { platform: 'instagram', account: IG_ACCOUNT_ALIAS } }
        }]
    };

    // Trae un buffer más amplio y luego deduplica
    const candidates = await ImagenGenerada
        .find(query)
        .sort({ createdAt: -1 })
        .limit(hardMax * 4)  // buffer para dedup
        .lean();

    const normalizeUrl = (u) => {
        try { const x = new URL(u); x.search = ''; return x.toString(); } catch { return u; }
    };

    const seenUrl = new Set();
    const seenFile = new Set();
    const deduped = [];
    for (const img of candidates) {
        const keyUrl = normalizeUrl(img.finalUrl);
        const keyFile = (img.filename || '').trim().toLowerCase();
        if (seenUrl.has(keyUrl) || (keyFile && seenFile.has(keyFile))) continue;
        seenUrl.add(keyUrl);
        if (keyFile) seenFile.add(keyFile);
        deduped.push(img);
        if (deduped.length >= hardMax) break;
    }

    // Verifica accesibilidad (HEAD image/*)
    const okImgs = [];
    for (const img of deduped) {
        const h = await headOk(img.finalUrl);
        if (h.ok) okImgs.push(img);
    }

    return okImgs;
    }

    // ====== CREA VIDEO 9:16 CON FFmpeg (segmentos + concat, ultra-compatible) ======
    async function buildReelVideoFromImages({ images, perSlideSec = 4, profile = REEL_PROFILE }) {
    await ensureFfmpeg();

    const n = images.length;
    if (n < 2) throw new Error('Se necesitan al menos 2 imágenes para un Reel.');

    const p = REEL_PROFILES[profile] || REEL_PROFILES.full; // {w,h,bVideo,buf}

    // Evita > 90s
    let dur = Math.max(MIN_PER_SLIDE_SECS, perSlideSec);
    if (n * dur > MAX_REEL_SECS) {
        dur = Math.max(MIN_PER_SLIDE_SECS, Math.floor(MAX_REEL_SECS / n));
    }
    const totalDur = n * dur;

    // Descarga imágenes a /tmp
    const localImgs = [];
    for (const img of images) {
        const fp = await downloadToTemp(img.finalUrl);
        localImgs.push(fp);
    }

    // 1) Genera segmentos homogéneos (mismo codec y params)
    const segPaths = [];
    for (let i = 0; i < localImgs.length; i++) {
        const inImg = localImgs[i];
        const segPath = path.join(
        os.tmpdir(),
        `reel_seg_${i}_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`
        );

        const args = [
        '-y',
        '-loop', '1', '-t', String(dur), '-i', inImg,
        '-f', 'lavfi', '-t', String(dur), '-i', 'anullsrc=r=48000:cl=stereo',

        // Escala/pad a perfil elegido (1080x1920 o 720x1280)
        '-filter_complex',
        `[0:v]scale=${p.w}:-2:force_original_aspect_ratio=decrease,` +
        `pad=${p.w}:${p.h}:(${p.w}-iw)/2:(${p.h}-ih)/2:color=black,` +
        `format=yuv420p,setsar=1[v]`,

        // Mapeos
        '-map', '[v]',
        '-map', '1:a',
        '-shortest',

        // Sincronía y fps
        '-vsync', 'cfr',
        '-r', String(FPS),

        // H.264 “ultra-compatible” para IG (sin B-frames)
        '-c:v', 'libx264',
        '-profile:v', 'main',
        '-level', '4.1',
        '-pix_fmt', 'yuv420p',
        '-g', String(FPS * 2), // GOP ~2s
        '-x264-params', `keyint=${FPS*2}:min-keyint=${FPS*2}:scenecut=0:nal-hrd=cbr:force-cfr=1:bframes=0`,
        '-preset', 'veryfast',
        // CBR/ABR estable (segmento)
        '-b:v', p.bVideo,
        '-maxrate', p.bVideo,
        '-minrate', p.bVideo,
        '-bufsize', p.buf,

        // Audio AAC
        '-c:a', 'aac',
        '-b:a', '160k',
        '-ar', '48000',

        // Moov al inicio
        '-movflags', '+faststart',

        segPath
        ];

        await runFfmpeg(args);
        segPaths.push(segPath);
    }

    // 2) Lista concat
    const listPath = path.join(os.tmpdir(), `reel_concat_${Date.now()}.txt`);
    fs.writeFileSync(
        listPath,
        segPaths.map(pth => `file '${pth.replace(/'/g, "'\\''")}'`).join('\n'),
        'utf8'
    );

    // 3) Concat + recodificación final con los mismos parámetros
    const outPath = path.join(os.tmpdir(), `reel_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`);
    const concatArgs = [
        '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', listPath,

        // sincronía + fps
        '-vsync', 'cfr',
        '-r', String(FPS),

        // H.264 “ultra-compatible” (idéntico a segmentos, sin B-frames)
        '-c:v', 'libx264',
        '-profile:v', 'main',
        '-level', '4.1',
        '-pix_fmt', 'yuv420p',
        '-g', String(FPS * 2),
        '-x264-params', `keyint=${FPS*2}:min-keyint=${FPS*2}:scenecut=0:nal-hrd=cbr:force-cfr=1:bframes=0`,
        '-preset', 'veryfast',
        '-b:v', p.bVideo,
        '-maxrate', p.bVideo,
        '-minrate', p.bVideo,
        '-bufsize', p.buf,

        // Audio AAC
        '-c:a', 'aac',
        '-b:a', '160k',
        '-ar', '48000',

        // Moov al inicio
        '-movflags', '+faststart',

        outPath
    ];
    await runFfmpeg(concatArgs);

    // Limpieza
    try {
        for (const pth of localImgs) fs.unlink(pth, () => {});
        for (const pth of segPaths) fs.unlink(pth, () => {});
        fs.unlink(listPath, () => {});
    } catch {}

    return { outPath, totalDur };
    }

    // ====== Subir video a Cloudinary (resource_type: 'video') ======
    async function uploadReelToCloudinary(localPath, { folder = 'keikodevfree/reels' } = {}) {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Faltan credenciales de Cloudinary (CLOUDINARY_*)');
    }
    const res = await cloudinary.uploader.upload(localPath, {
        resource_type: 'video',
        folder,
        use_filename: true,
        unique_filename: true
    });
    return res.secure_url;
    }

    // ====== JOB PRINCIPAL ======
    /**
     * Construye y publica un Reel 9:16 con imágenes publishable:true.
     *
     * @param {Object} opts
     * @param {number} [opts.limit=6]        - nº de imágenes (2..20)
     * @param {number} [opts.perSlideSec=4]  - seg por imagen (se recorta si excede 90s total)
     * @param {string} [opts.titulo='']      - título opcional para el caption
     * @param {Array<string>} [opts.tagsExtra=[]] - hashtags extra
     * @param {boolean} [opts.dryRun=false]  - si true, genera y sube (no publica)
     */
    export async function postReelAccount2({
    limit = 6,
    perSlideSec = 4,
    titulo = '',
    tagsExtra = [],
    dryRun = false
    } = {}) {
    if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
        throw new Error('Faltan IG_USER_ID_ACCOUNT2 o IG_ACCESS_TOKEN_ACCOUNT2 en .env');
    }

    const images = await pickPublishableImages({ limit });
    if (images.length < 2) {
        console.log('[keikodevfree.reel] No hay suficientes imágenes nuevas (>=2).');
        return null;
    }

    // 1) Construir vídeo
    console.log('[keikodevfree.reel] Imágenes usadas:', images.map(i => i.finalUrl));
    const { outPath, totalDur } = await buildReelVideoFromImages({ images, perSlideSec });
    console.log(`[keikodevfree.reel] Vídeo generado ${outPath} (${totalDur}s)`);

    // 2) Subir a Cloudinary como video
    const videoUrl = await uploadReelToCloudinary(outPath);
    console.log('[keikodevfree.reel] Video URL:', videoUrl);

    // Limpia local
    try { fs.unlink(outPath, () => {}); } catch {}

    // Preflight del video (CT + tamaño)
    const hv = await headVideoOk(videoUrl);
    if (!hv.ok) throw new Error(`HEAD de video falló (CT=${hv.ct || 'desconocido'})`);
    if (hv.sizeMB && hv.sizeMB > MAX_VIDEO_SIZE_MB) {
        throw new Error(`Video demasiado grande (${hv.sizeMB.toFixed(1)} MB)`);
    }

    const caption = buildCaptionKeikoDevFree({ titulo, tagsExtra });

    if (dryRun) {
        console.log('[keikodevfree.reel] DRY RUN →', { videoUrl, caption });
        return { dryRun: true, videoUrl, caption };
    }

    // 3) Crear container REELS (con reintentos) y esperar FINISHED
    const creationId = await igCreateReelContainerRetry({ videoUrl, caption, thumbOffset: 0.5 });
    await waitUntilFinished(creationId, { timeoutMs: PARENT_TIMEOUT_MS, label: 'reel-parent' });

    // Pequeño respiro extra antes de publicar (da tiempo a que “asiente”)
    await sleep(8000);

    // 4) Publicar con reintentos/backoff (maneja code 1/2 y re-chequea status)
    const igMediaId = await igPublishRetry({ creationId });

    // 5) Marca las imágenes como publicadas en esta cuenta
    try {
        const usedIds = images.map(i => i._id);
        await ImagenGenerada.updateMany(
        { _id: { $in: usedIds } },
        {
            $push: {
            publications: {
                platform: 'instagram',
                account: IG_ACCOUNT_ALIAS,
                postId: igMediaId,
                postedAt: new Date()
            }
            }
        }
        );
    } catch (e) {
        console.error('[keikodevfree.reel] No se pudo actualizar publications:', e?.message || e);
    }

    return { igMediaId, videoUrl, used: images.map(i => i.finalUrl) };
    }

    // ====== CLI OPCIONAL ======
    if (process.argv[1] === new URL(import.meta.url).pathname) {
    (async () => {
        let connected = false;
        try {
        if (MONGO_URI) { await mongoose.connect(MONGO_URI, { dbName: MONGO_DB }); connected = true; }
        const res = await postReelAccount2({
            limit: 6,
            perSlideSec: 4,
            titulo: 'Highlights del día',
            tagsExtra: ['#IA', '#RecursosWeb'],
            dryRun: false
        });
        console.log(res);
        } catch (err) {
        console.error(err);
        process.exitCode = 1;
        } finally {
        if (connected) await mongoose.disconnect();
        }
    })();
    }
