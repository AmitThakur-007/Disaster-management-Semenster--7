import pg from 'pg';
const { Client } = pg;

async function setup() {
  const client = new Client({ connectionString: 'postgresql://postgres:1234@localhost:5432/postgres' });
  await client.connect();

  const userRes = await client.query("SELECT 1 FROM pg_roles WHERE rolname = 'disaster'");
  if (userRes.rowCount === 0) {
    await client.query("CREATE ROLE disaster WITH LOGIN PASSWORD '1234' SUPERUSER");
    console.log("Created role 'disaster'");
  } else {
    await client.query("ALTER ROLE disaster WITH PASSWORD '1234' SUPERUSER");
    console.log("Updated role 'disaster'");
  }

  const dbRes = await client.query("SELECT 1 FROM pg_database WHERE datname = 'disaster_watch'");
  if (dbRes.rowCount === 0) {
    await client.query("CREATE DATABASE disaster_watch OWNER disaster");
    console.log("Created database 'disaster_watch'");
  } else {
    console.log("Database 'disaster_watch' already exists");
  }

  await client.end();
  console.log("Database setup complete.");
}

setup().catch((err) => {
  console.error("Setup error:", err);
  process.exit(1);
});
