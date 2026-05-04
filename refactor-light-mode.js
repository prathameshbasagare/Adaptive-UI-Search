const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(srcDir);

// Mapping of dark slate classes to their light counterparts
const colorMap = {
  'slate-950': 'slate-50',
  'slate-900': 'slate-100',
  'slate-800': 'slate-200',
  'slate-700': 'slate-300',
  'slate-600': 'slate-400',
  'slate-500': 'slate-500', // midpoint
  'slate-400': 'slate-600',
  'slate-300': 'slate-700',
  'slate-200': 'slate-800',
  'slate-100': 'slate-900',
  'slate-50': 'slate-950',
  'white': 'slate-950',
};

// Regex to find standard tailwind color utility classes
const classRegex = /(?:([a-z-]+):)?(bg|text|border|ring|divide|from|via|to|fill|stroke|shadow)-(slate-\d+|white)(?:\/(\d+|\[.*?\]))?/g;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const classNameRegex = /className=(?:["']([^"']+)["']|\{`([^`]+)`\})/g;
  
  content = content.replace(classNameRegex, (match, p1, p2) => {
    const classStr = p1 || p2;
    if (!classStr) return match;

    const newClassStr = classStr.replace(classRegex, (fullMatch, prefix, type, color, opacity) => {
      // If it's already a dark: class, skip it
      if (prefix === 'dark') return fullMatch;
      
      const lightColor = colorMap[color];
      if (!lightColor) return fullMatch;

      const lightClass = `${prefix ? prefix + ':' : ''}${type}-${lightColor}${opacity ? '/' + opacity : ''}`;
      const darkClass = `dark:${prefix ? prefix + ':' : ''}${type}-${color}${opacity ? '/' + opacity : ''}`;
      
      // If it already has both, skip
      if (classStr.includes(darkClass)) return fullMatch;

      return `${lightClass} ${darkClass}`;
    });

    if (newClassStr !== classStr) {
      changed = true;
      if (p1) return `className="${newClassStr}"`;
      if (p2) return `className={\`${newClassStr}\`}`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${path.relative(__dirname, file)}`);
  }
});
