const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.wyghmfyijasqrnczzepd:Inkibatordz2026%40@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function findAdmin() {
  try {
    console.log('Querying users table for admin...');
    const result = await pool.query("SELECT * FROM users WHERE email = 'admin@smetax.dz'");
    if (result.rows.length > 0) {
      console.log('Admin User Found:');
      console.table(result.rows);
    } else {
      console.log('No user with email admin@smetax.dz found. Checking all users...');
      const allUsers = await pool.query("SELECT id, email, role, password FROM users");
      console.table(allUsers.rows);
    }
  } catch (err) {
    console.error('Error querying database:', err.message);
  } finally {
    await pool.end();
  }
}

findAdmin();
