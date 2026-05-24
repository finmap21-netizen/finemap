const { Pool } = require('pg');

async function run() {
  const urls = [
    'postgresql://postgres.wyghmfyijasqrnczzepd:Inkibatordz2026%40@aws-1-eu-north-1.pooler.supabase.com:6543/postgres',
    'postgresql://postgres.bobirtybpeubieljxxzp:finmap21-@@@aws-0-eu-west-1.pooler.supabase.com:6543/postgres'
  ];

  for (const url of urls) {
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
    try {
      console.log(`Syncing admin to: ${url.split('@')[1]}`);
      // The inkibator DB uses 'password' column, Tax Assistant DB uses 'password_hash' column.
      // I need to check which one it is.
      const tables = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
      const columns = tables.rows.map(r => r.column_name);
      
      if (columns.includes('password_hash')) {
        // Tax Assistant format (hashed)
        const hash = '669627a184a4b5d0fbb7c4882e35bd4c713f93d72568347fe856d2d93863bf7e';
        await pool.query(`
          INSERT INTO users (name, email, password_hash, role, is_active) 
          VALUES ('المدير', 'admin@smetax.dz', $1, 'admin', true)
          ON CONFLICT (email) DO UPDATE SET password_hash = $1
        `, [hash]);
      } else if (columns.includes('password')) {
        // Inkibator format (plaintext)
        await pool.query(`
          INSERT INTO users (id, email, password, role, first_name, last_name, approved) 
          VALUES ('admin_tax', 'admin@smetax.dz', 'Admin@2024', 'admin', 'المدير', 'النظام', true)
          ON CONFLICT (email) DO UPDATE SET password = 'Admin@2024'
        `);
      }
      console.log('Success!');
    } catch (e) {
      console.error(`Error with ${url}:`, e.message);
    } finally {
      await pool.end();
    }
  }
}

run();
