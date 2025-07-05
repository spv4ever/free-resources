import { google } from 'googleapis';
import EmailEntry from '../models/EmailEntry.js';
import { saveArticlesFromEmail } from './extractArticlesFromEmail.js';

import GmailToken from '../models/GmailToken.js'; // Modelo para tokens

export async function authorizeGmail() {
  const client_id = process.env.GMAIL_CLIENT_ID;
  const client_secret = process.env.GMAIL_CLIENT_SECRET;
  const redirect_uri = process.env.GMAIL_REDIRECT_URI;

  if (!client_id || !client_secret || !redirect_uri) {
    throw new Error('❌ Faltan variables de entorno necesarias para Gmail OAuth');
  }

  const tokenDoc = await GmailToken.findOne({ identifier: 'primary_gmail_account' });
  if (!tokenDoc) {
    throw new Error('❌ No se encontró token de Gmail en base de datos. Por favor, autoriza la aplicación.');
  }

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

  // Configuramos el OAuth2Client con tokens desde la BD
  oAuth2Client.setCredentials({
    access_token: tokenDoc.accessToken,
    refresh_token: tokenDoc.refreshToken,
    expiry_date: tokenDoc.tokenExpiry ? new Date(tokenDoc.tokenExpiry).getTime() : null,
  });

  // Escuchar evento para actualizar tokens cuando se refresquen automáticamente
  oAuth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      tokenDoc.refreshToken = tokens.refresh_token;
    }
    if (tokens.access_token) {
      tokenDoc.accessToken = tokens.access_token;
    }
    if (tokens.expiry_date) {
      tokenDoc.tokenExpiry = new Date(tokens.expiry_date);
    }
    await tokenDoc.save();
  });

  return oAuth2Client;
}

export async function getFilteredEmails(auth, searchTerm) {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: searchTerm,
    maxResults: 10,
  });

  const messages = res.data.messages || [];
  const results = [];

  for (const msg of messages) {
    const msgData = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full',
    });

    const headers = msgData.data.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value;
    const dateStr = headers.find(h => h.name === 'Date')?.value;
    const date = new Date(dateStr);
    const snippet = msgData.data.snippet;
    const parts = msgData.data.payload.parts || [];
    const htmlPart = parts.find(p => p.mimeType === 'text/html');
    const html = htmlPart?.body?.data
      ? Buffer.from(htmlPart.body.data, 'base64').toString('utf-8')
      : null;

    results.push({
      messageId: msg.id,
      subject,
      date,
      snippet,
      html,
    });
  }

  return results;
}

export async function importEmails({ searchTerm, context }) {
  const auth = await authorizeGmail();
  const emails = await getFilteredEmails(auth, searchTerm);

  let saved = 0;
  for (const email of emails) {
    const exists = await EmailEntry.findOne({ messageId: email.messageId });
    if (!exists) {
      const nuevoEmail = await EmailEntry.create({ ...email, context });
      await saveArticlesFromEmail(nuevoEmail);
      saved++;
    }
  }

  return { total: emails.length, imported: saved };
}
