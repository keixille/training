import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const drizzleDir = path.resolve(__dirname, '../../drizzle');

function patchMigrations() {
  if (!fs.existsSync(drizzleDir)) {
    console.error(`❌ Directory not found: ${drizzleDir}`);
    return;
  }

  const files = fs.readdirSync(drizzleDir).filter((f) => f.endsWith('.sql'));

  files.forEach((file) => {
    const filePath = path.join(drizzleDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    if (content.includes('CREATE SCHEMA "')) {
      const newContent = content.replace(
        /CREATE SCHEMA "(.+?)";/g,
        'CREATE SCHEMA IF NOT EXISTS "$1";',
      );
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    }

    const tableRegex = /CREATE TABLE (?!IF NOT EXISTS)(.+?)( \(|\n)/g;
    if (tableRegex.test(content)) {
      content = content.replace(tableRegex, 'CREATE TABLE IF NOT EXISTS $1$2');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Patched: ${file}`);
    } else {
      console.log(`ℹ️ No changes needed: ${file}`);
    }
  });

  console.log('🚀 Migration patching complete.');
}

patchMigrations();
