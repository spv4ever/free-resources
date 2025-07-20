// src/utils/slugify.js
export default function slugify(text) {
  return text
    .toString()
    .normalize('NFKD')                // elimina tildes
    .replace(/[^\w\s-]/g, '')         // elimina caracteres especiales
    .trim()
    .replace(/\s+/g, '-')             // espacios → guiones
    .replace(/-+/g, '-')              // guiones múltiples → uno solo
    .toLowerCase();
}
