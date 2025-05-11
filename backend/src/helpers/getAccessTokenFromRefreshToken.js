import axios from 'axios';

export async function getAccessTokenFromRefreshToken(refreshToken) {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        client_id: process.env.GMAIL_CLIENT_ID,
        client_secret: process.env.GMAIL_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error al obtener access_token:', error.response?.data || error.message);
    throw new Error('No se pudo obtener access_token');
  }
}
