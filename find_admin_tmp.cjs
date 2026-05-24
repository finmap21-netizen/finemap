const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.wyghmfyijasqrnczzepd:Inkibatordz2026%40@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function findAdmin() {
  try {
    const result = await pool.query("SELECT id, email, password, role FROM users WHERE role = 'admin'");
    console.log('Admin Users:');
    console.table(result.rows);
  } catch (err) {
    console.error('Error querying database:', err.message);
  } finally {
    await pool.end();
  }
}

findAdmin();
