export const normalizarImagenParaModal = (img, user = null) => ({
  _id: img._id,
  finalUrl: img.finalUrl || img.url,
  promptScene: img.promptScene || img.scene || img.prompt || 'Sin título',
  packTitle: img.packTitle || 'Personal',
  nickname: img.nickname || user?.nickname || 'Tú',
  createdAt: img.createdAt || null,
  prompt: img.prompt || '',
  url: img.url || '', // opcional si lo usas para fallback
});
