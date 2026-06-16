const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const APP_DIR = __dirname;
let _config = null;

function getConfig() {
  if (_config) return _config;

  const configPath = path.join(APP_DIR, 'config.yaml');
  if (!fs.existsSync(configPath)) {
    throw new Error(`config.yaml not found at ${configPath}.`);
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    _config = yaml.load(raw);
    console.log(`✅ Config loaded: ${_config.repos.length} repo(s) configured.`);
    return _config;
  } catch (err) {
    throw new Error(`Failed to parse config.yaml: ${err.message}`);
  }
}

function getRepoForJiraProject(projectKey) {
  const config = getConfig();
  const key = (projectKey || '').toUpperCase().trim();

  for (const repo of config.repos) {
    const projects = (repo.jiraProjects || []).map(p => p.toUpperCase().trim());
    if (projects.includes(key)) {
      return repo;
    }
  }

  return config.repos[0] || null;
}

function extractProjectKey(issueKey) {
  if (!issueKey) return '';
  const match = String(issueKey).match(/^([A-Z]+)-\d+/i);
  return match ? match[1].toUpperCase() : '';
}

function getLLMProviders(tier) {
  const config = getConfig();
  const llmConfig = config.llm || {};
  return (llmConfig[tier] && llmConfig[tier].providers) || llmConfig.fast.providers;
}

function getAllRepos() {
  return getConfig().repos || [];
}

function getTokenBudget(format) {
  const config = getConfig();
  return (config.tokenBudget && config.tokenBudget[format]) || { ticketTokens: 200, codeTokens: 1800, instructionTokens: 150, maxChunks: 15 };
}

function getIndexerConfig() {
  const config = getConfig();
  return config.indexer || {
    chunkSizeChars: 1200,
    chunkOverlapChars: 200,
    embeddingDelayMs: 120,
    hashCachePath: './data/hashes'
  };
}

module.exports = {
  getConfig,
  getRepoForJiraProject,
  extractProjectKey,
  getLLMProviders,
  getAllRepos,
  getTokenBudget,
  getIndexerConfig
};
