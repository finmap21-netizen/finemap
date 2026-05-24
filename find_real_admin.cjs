const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.bobirtybpeubieljxxzp:finmap21-@@@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function findAdmin() {
  try {
    console.log('Querying users table for admin...');
    try {
      const result = await pool.query("SELECT id, email, role, \"password_hash\", name FROM users");
      console.log('Users found in database:');
      console.table(result.rows);
    } catch (err) {
      if (err.message.includes('relation "users" does not exist')) {
        console.log('Table "users" not found. Listing all tables in public schema:');
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.table(tables.rows);
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error('Error querying database:', err.message);
  } finally {
    await pool.end();
  }
}

findAdmin();
