// checkRoutes.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta a tu carpeta de rutas
const routesDir = path.join(__dirname, 'src', 'routes');

// Expresión para detectar rutas malformadas como /:, /:?, /:/test, etc.
const badRouteRegex = /['"`]\/:[^a-zA-Z0-9]/;

function scanRoutes(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      scanRoutes(fullPath); // Recursivo si hay subdirectorios
    } else if (file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (badRouteRegex.test(line)) {
          console.warn(`⚠️ Posible ruta mal formada en ${file} (línea ${index + 1}):\n${line.trim()}`);
        }
      });
    }
  }
}

console.log('🔍 Escaneando archivos de rutas...');
scanRoutes(routesDir);
console.log('✅ Escaneo completado.');
