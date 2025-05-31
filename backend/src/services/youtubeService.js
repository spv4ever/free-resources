import { google } from 'googleapis';
import dotenv from 'dotenv';
import YoutubeToken from '../models/youtubeTokenModel.js';
import fs from 'fs';

dotenv.config();

const createOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.YT_CLIENT_ID,
    process.env.YT_CLIENT_SECRET,
    process.env.YT_REDIRECT_URI
  );
};

const getValidAuthClient = async (channelId) => {
  const tokenEntry = await YoutubeToken.findOne({ channelId });
  if (!tokenEntry) throw new Error(`No hay tokens de YouTube para el canal: ${channelId}`);

  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({
    access_token: tokenEntry.access_token,
    refresh_token: tokenEntry.refresh_token,
    scope: tokenEntry.scope,
    token_type: tokenEntry.token_type,
    expiry_date: tokenEntry.expiry_date.getTime()
  });

  // Refrescar si ha expirado
  const now = Date.now();
  if (now >= tokenEntry.expiry_date.getTime()) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    await YoutubeToken.findOneAndUpdate(
      { channelId },
      {
        ...credentials,
        expiry_date: new Date(credentials.expiry_date)
      }
    );
  }

  return oauth2Client;
};

export const uploadVideo = async ({
  channelId,
  videoPath,
  title,
  description,
  tags = [],
  scheduledTime = null
}) => {
  const auth = await getValidAuthClient(channelId);
  const youtube = google.youtube({ version: 'v3', auth });

  const requestBody = {
    snippet: {
      title,
      description,
      tags,
      categoryId: '22'
    },
    status: {
      privacyStatus: scheduledTime ? 'private' : 'public',
      publishAt: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
      selfDeclaredMadeForKids: false
    }
  };

  const media = {
    body: fs.createReadStream(videoPath)
  };

  const response = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody,
    media
  });

  return response.data;
};
