// services/instagramService.js
import fetch from 'node-fetch';

const IG_API = (path) => `https://graph.facebook.com/v21.0/${path}`;

export async function createContainer({ igUserId, accessToken, imageUrl, caption }) {
  const url = IG_API(`${igUserId}/media`) +
    `?image_url=${encodeURIComponent(imageUrl)}` +
    `&caption=${encodeURIComponent(caption)}` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  const r = await fetch(url, { method: 'POST' });
  const j = await r.json();
  if (!r.ok || !j.id) {
    const msg = `IG createContainer error: ${r.status} ${r.statusText} - ${JSON.stringify(j)}`;
    throw new Error(msg);
  }
  return j.id; // creation_id
}

export async function publishContainer({ igUserId, accessToken, creationId }) {
  const url = IG_API(`${igUserId}/media_publish`) +
    `?creation_id=${encodeURIComponent(creationId)}` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  const r = await fetch(url, { method: 'POST' });
  const j = await r.json();
  if (!r.ok || !j.id) {
    const msg = `IG publish error: ${r.status} ${r.statusText} - ${JSON.stringify(j)}`;
    throw new Error(msg);
  }
  return j.id; // published media id
}
