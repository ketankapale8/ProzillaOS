const path = require('path');

const EXT_TO_LANG = {
  '.js':   'javascript',
  '.jsx':  'javascript',
  '.ts':   'typescript',
  '.tsx':  'typescript',
  '.py':   'python',
  '.css':  'generic',
  '.json': 'generic',
  '.yaml': 'generic',
  '.yml':  'generic',
  '.md':   'generic',
  '.txt':  'generic'
};

function genericChunk(filePath, content, windowLines = 40, overlapLines = 8) {
  const lines = content.split('\n');
  const chunks = [];
  let i = 0;

  while (i < lines.length) {
    const sliceLines = lines.slice(i, i + windowLines);
    const chunkContent = sliceLines.join('\n');
    if (chunkContent.trim().length > 0) {
      chunks.push({
        filePath,
        content: chunkContent,
        startLine: i + 1,
        endLine: Math.min(i + windowLines, lines.length),
        language: 'generic',
        symbolName: '',
        symbolType: 'block'
      });
    }
    i += windowLines - overlapLines;
    if (i + overlapLines >= lines.length) break;
  }

  if (lines.length > 0) {
    const lastChunk = chunks[chunks.length - 1];
    const lastLine = lastChunk ? lastChunk.endLine : 0;
    if (lastLine < lines.length) {
      const tailLines = lines.slice(lastLine);
      if (tailLines.join('').trim().length > 0) {
        chunks.push({
          filePath: filePath,
          content: tailLines.join('\n'),
          startLine: lastLine + 1,
          endLine: lines.length,
          language: 'generic',
          symbolName: '',
          symbolType: 'block'
        });
      }
    }
  }

  return chunks;
}

function splitCodeIntoChunks(filePath, content) {
  // Always use generic chunker for GitHub Action execution to avoid complex native dependency builds (tree-sitter requires node-gyp compilation)
  return genericChunk(filePath, content);
}

module.exports = {
  splitCodeIntoChunks
};
