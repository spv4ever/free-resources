import { google } from 'googleapis';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import EmailEntry from '../models/EmailEntry.js';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

async function writeTempFile(name, base64Content) {
  const filePath = path.join(os.tmpdir(), name);
  await fs.writeFile(filePath, Buffer.from(base64Content, 'base64'));
  return filePath;
}

export async function authorizeGmail() {
  console.log('🔎 GMAIL_CREDENTIALS_BASE64:', typeof process.env.GMAIL_CREDENTIALS_BASE64);
  console.log('🔎 GMAIL_TOKEN_BASE64:', typeof process.env.GMAIL_TOKEN_BASE64);
  if (!process.env.GMAIL_CREDENTIALS_BASE64 || !process.env.GMAIL_TOKEN_BASE64) {
    throw new Error('❌ Falta alguna variable de entorno Gmail (credenciales o token)');
  }
  const credentialsPath = await writeTempFile('credentials.json', process.env.GMAIL_CREDENTIALS_BASE64);
  const tokenPath = await writeTempFile('gmail-token.json', process.env.GMAIL_TOKEN_BASE64);

  const content = await fs.readFile(credentialsPath);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  const token = await fs.readFile(tokenPath);
  oAuth2Client.setCredentials(JSON.parse(token));

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
      await EmailEntry.create({ ...email, context });
      saved++;
    }
  }

  return { total: emails.length, imported: saved };
}
