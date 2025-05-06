import fs from 'fs';

function encodeFileToBase64(filePath) {
  const file = fs.readFileSync(filePath);
  return Buffer.from(file).toString('base64');
}

console.log('CREDENTIALS:');
console.log(encodeFileToBase64('credentials.json'));

console.log('\nTOKEN:');
console.log(encodeFileToBase64('gmail-token.json'));
