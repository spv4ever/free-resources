import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const ivLength = 16;

const getKeyFromJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  return crypto.createHash('sha256').update(secret).digest(); // 32 bytes
};

export function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const key = getKeyFromJWTSecret();
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(encryptedText) {
  const [ivHex, dataHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedBuffer = Buffer.from(dataHex, 'hex');
  const key = getKeyFromJWTSecret();
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}
