import fetch from 'node-fetch';

const INSTAGRAM_WEB_APP_ID = '936619743392459';

function mapEdgeToPost(edge) {
  const node = edge?.node || {};
  const caption = node?.edge_media_to_caption?.edges?.[0]?.node?.text || '';

  return {
    id: node.id,
    shortcode: node.shortcode,
    permalink: node.shortcode ? `https://www.instagram.com/p/${node.shortcode}/` : null,
    caption,
    thumbnailUrl: node.thumbnail_src || node.display_url || null,
    displayUrl: node.display_url || node.thumbnail_src || null,
    isVideo: Boolean(node.is_video),
    timestamp: node.taken_at_timestamp || null,
  };
}

export async function fetchInstagramPublicFeed(username, { limit = 6 } = {}) {
  if (!username) {
    throw new Error('Username de Instagram requerido');
  }

  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'X-IG-App-ID': INSTAGRAM_WEB_APP_ID,
      'Referer': `https://www.instagram.com/${username}/`,
    },
  });

  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.data?.user) {
    const error = new Error(`No se pudo obtener el feed público de Instagram (${response.status})`);
    error.details = text.slice(0, 300);
    error.status = response.status;
    throw error;
  }

  const user = payload.data.user;
  const edges = user?.edge_owner_to_timeline_media?.edges || [];

  return {
    username: user.username || username,
    fullName: user.full_name || '',
    biography: user.biography || '',
    profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || null,
    followers: user.edge_followed_by?.count || 0,
    posts: edges.slice(0, limit).map(mapEdgeToPost).filter((post) => post.permalink && post.thumbnailUrl),
  };
}
