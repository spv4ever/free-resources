import md5 from 'md5';

export function generateCpxUrl(userId) {
  const publicHash = process.env.REACT_APP_CPX_PUBLIC_HASH;
  const secureHash = md5(`${userId}-${publicHash}`);

  return `https://cpx-research.com/panel/?user_id=${userId}&secure_hash=${secureHash}`;
}
