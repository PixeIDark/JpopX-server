const fs = require('fs');
const path = require('path');

function saveFilesAsTxt(directory, outputFile) {
  const files = fs.readdirSync(directory);
  let outputContent = '';

  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      saveFilesAsTxt(fullPath, outputFile); // 재귀적으로 하위 폴더도 탐색
    } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx')) { // 파일 확장자 지정
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      outputContent += `--- ${fullPath} ---\n${fileContent}\n\n`;
    }
  });

  fs.appendFileSync(outputFile, outputContent);
}

// src 폴더 경로와 출력될 텍스트 파일 경로 지정
saveFilesAsTxt('src', 'server.txt');
