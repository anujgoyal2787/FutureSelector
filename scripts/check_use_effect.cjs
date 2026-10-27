const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.jsx') || file.endsWith('.js')) results.push(file);
  });
  return results;
}

const files = walk(path.join(__dirname, '../client/src'));
console.log(`Checking ${files.length} files...`);

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (/\buseEffect\s*\(/.test(content)) {
    const hasImport = /import\s+[^;]*\buseEffect\b[^;]*from\s+['"]react['"]/.test(content) ||
                      /import\s+\*\s+as\s+React\s+from\s+['"]react['"]/.test(content);
    if (!hasImport) {
      console.log('🚨 MISSING useEffect IMPORT IN:', f);
    }
  }
  if (/\buseState\s*\(/.test(content)) {
    const hasImport = /import\s+[^;]*\buseState\b[^;]*from\s+['"]react['"]/.test(content) ||
                      /import\s+\*\s+as\s+React\s+from\s+['"]react['"]/.test(content);
    if (!hasImport) {
      console.log('🚨 MISSING useState IMPORT IN:', f);
    }
  }
  if (/\buseRef\s*\(/.test(content)) {
    const hasImport = /import\s+[^;]*\buseRef\b[^;]*from\s+['"]react['"]/.test(content) ||
                      /import\s+\*\s+as\s+React\s+from\s+['"]react['"]/.test(content);
    if (!hasImport) {
      console.log('🚨 MISSING useRef IMPORT IN:', f);
    }
  }
});
console.log('Check finished.');
