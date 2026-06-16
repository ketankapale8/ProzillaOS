const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getIndexerConfig } = require('./configLoader');

const APP_DIR = __dirname;

function getCacheDir() {
  const cfg = getIndexerConfig();
  const cacheDir = path.isAbsolute(cfg.hashCachePath)
    ? cfg.hashCachePath
    : path.join(APP_DIR, cfg.hashCachePath);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  return cacheDir;
}

function getCachePath(repoId) {
  return path.join(getCacheDir(), `${repoId}.json`);
}

function loadCache(repoId) {
  const cachePath = getCachePath(repoId);
  if (!fs.existsSync(cachePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch {
    return {};
  }
}

function saveCache(repoId, cache) {
  const cachePath = getCachePath(repoId);
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
}

function hashContent(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function isChanged(filePath, content, cache) {
  const currentHash = hashContent(content);
  return cache[filePath] !== currentHash;
}

function updateCache(filePath, content, cache) {
  cache[filePath] = hashContent(content);
}

function findDeletedFiles(cache) {
  const deleted = [];
  for (const filePath of Object.keys(cache)) {
    if (!fs.existsSync(filePath)) {
      deleted.push(filePath);
    }
  }
  return deleted;
}

function removeFromCache(filePath, cache) {
  delete cache[filePath];
}

module.exports = {
  loadCache,
  saveCache,
  hashContent,
  isChanged,
  updateCache,
  findDeletedFiles,
  removeFromCache
};
