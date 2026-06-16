const { getPool } = require('./db');

async function addDocuments(docs) {
  if (!docs || docs.length === 0) return;

  const pool = getPool();
  const query = `
    INSERT INTO code_chunks 
      (file_path, content, start_line, end_line, embedding, repo_id, symbol_name, symbol_type, language, file_hash)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;

  try {
    await Promise.all(docs.map(doc => {
      const vecString = `[${doc.embedding.join(',')}]`;
      return pool.query(query, [
        doc.filePath || '',
        doc.content || '',
        doc.startLine || 0,
        doc.endLine || 0,
        vecString,
        doc.repoId || 'default',
        doc.symbolName || '',
        doc.symbolType || '',
        doc.language || '',
        doc.fileHash || ''
      ]);
    }));
    console.log(`📦 pgvector: Inserted ${docs.length} chunks.`);
  } catch (err) {
    console.error('❌ pgvector: Failed to insert documents:', err.message);
  }
}

async function removeDocumentsForFile(filePath, repoId = 'default') {
  try {
    const pool = getPool();
    await pool.query(
      `DELETE FROM code_chunks WHERE file_path = $1 AND repo_id = $2`,
      [filePath, repoId]
    );
    console.log(`🗑️ pgvector: Removed chunks for ${filePath} from repo "${repoId}".`);
  } catch (err) {
    console.error(`❌ pgvector: Failed to remove chunks for ${filePath}:`, err.message);
  }
}

async function similaritySearch(queryVector, topK = 15, repoId = 'default') {
  try {
    const pool = getPool();
    const vecString = `[${queryVector.join(',')}]`;

    const res = await pool.query(
      `SELECT file_path, content, start_line, end_line, repo_id, symbol_name, symbol_type, language,
              (1 - (embedding <=> $1)) as score
       FROM code_chunks
       WHERE repo_id = $2
       ORDER BY embedding <=> $1
       LIMIT $3`,
      [vecString, repoId, topK]
    );

    return res.rows.map(row => ({
      filePath: row.file_path,
      content: row.content,
      startLine: row.start_line,
      endLine: row.end_line,
      repoId: row.repo_id,
      symbolName: row.symbol_name,
      symbolType: row.symbol_type,
      language: row.language,
      score: Number(row.score)
    }));
  } catch (err) {
    console.error(`❌ pgvector search failed for repo "${repoId}":`, err.message);
    return [];
  }
}

async function getChunkCount(repoId = 'default') {
  try {
    const pool = getPool();
    const res = await pool.query(
      `SELECT COUNT(*) as count FROM code_chunks WHERE repo_id = $1`,
      [repoId]
    );
    return parseInt(res.rows[0].count, 10) || 0;
  } catch {
    return 0;
  }
}

async function dropRepo(repoId) {
  try {
    const pool = getPool();
    await pool.query(
      `DELETE FROM code_chunks WHERE repo_id = $1`,
      [repoId]
    );
    console.log(`🗑️ pgvector: Dropped all chunks for repo "${repoId}"`);
  } catch (err) {
    console.error(`❌ pgvector: Failed to drop repo "${repoId}":`, err.message);
  }
}

module.exports = {
  addDocuments,
  removeDocumentsForFile,
  similaritySearch,
  getChunkCount,
  dropRepo
};
