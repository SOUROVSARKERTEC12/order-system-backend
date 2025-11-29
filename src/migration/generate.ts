import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const EXECUTE_DIR = path.resolve(__dirname, 'execute');

// Ensure execute folder exists
if (!fs.existsSync(EXECUTE_DIR)) {
  fs.mkdirSync(EXECUTE_DIR, { recursive: true });
}

function generateMigration(name: string) {
  const cleanName = name.trim().replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = Date.now();
  const version = `M${timestamp}-${cleanName}`;

  // Command to generate a Prisma migration
  const command = `npx prisma migrate dev --name ${version} --schema ./prisma/schema.prisma`;

  console.log(`➡️ Generating migration: ${cleanName}`);

  try {
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Migration generated successfully in migration/execute!');
  } catch (error) {
    console.error('❌ Migration generation failed:', error);
    process.exit(1);
  }
}

// CLI argument or interactive
const args = process.argv.slice(2);
const migrationName = args[0];

if (migrationName) {
  generateMigration(migrationName);
} else {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question('📝 Enter migration name: ', (name:string) => {
    if (!name.trim()) {
      console.error('❌ Migration name is required.');
      readline.close();
      process.exit(1);
    }
    generateMigration(name);
    readline.close();
  });
}