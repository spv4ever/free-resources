const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(
  __dirname,
  '..',
  'node_modules',
  'react-datepicker',
  'dist',
  'index.es.js'
);

if (!fs.existsSync(targetFile)) {
  console.warn('[postinstall] react-datepicker not found, skipping sourcemap patch.');
  process.exit(0);
}

const source = fs.readFileSync(targetFile, 'utf8');
const patched = source.replace(/\n\/\/\# sourceMappingURL=index\.es\.js\.map\s*$/, '');

if (source === patched) {
  console.log('[postinstall] sourceMappingURL already removed.');
  process.exit(0);
}

fs.writeFileSync(targetFile, patched, 'utf8');
console.log('[postinstall] Removed react-datepicker sourceMappingURL from dist/index.es.js');
