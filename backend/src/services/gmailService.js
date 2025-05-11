import { google } from 'googleapis';
import EmailEntry from '../models/EmailEntry.js';
import { saveArticlesFromEmail } from './extractArticlesFromEmail.js';

export async function authorizeGmail() {
  const refresh_token = process.env.GMAIL_REFRESH_TOKEN;
  const client_id = process.env.GMAIL_CLIENT_ID;
  const client_secret = process.env.GMAIL_CLIENT_SECRET;
  const redirect_uri = process.env.GMAIL_REDIRECT_URI;

  if (!refresh_token || !client_id || !client_secret || !redirect_uri) {
    throw new Error('❌ Faltan variables de entorno necesarias para Gmail OAuth');
  }

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
  oAuth2Client.setCredentials({ refresh_token });

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
