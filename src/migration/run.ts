import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const EXECUTE_DIR = path.resolve(__dirname, 'execute');
const HISTORY_DIR = path.resolve(__dirname, 'history');

// Ensure history folder exists
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

const runMigrations = async () => {
  const files = fs.readdirSync(EXECUTE_DIR).filter(f => f.endsWith('.ts'));

  if (files.length === 0) {
    console.log('No pending migrations.');
    return;
  }

  for (const file of files) {
    console.log(`Executing migration: ${file}`);
    const migrationPath = path.join(EXECUTE_DIR, file);
    
    // Dynamic import of the migration file
    const migration = require(migrationPath);
    
    if (migration.run) {
      try {
        await migration.run();
        
        // Move to history
        const historyPath = path.join(HISTORY_DIR, file);
        fs.renameSync(migrationPath, historyPath);
        console.log(`Moved ${file} to history.`);
      } catch (error) {
        console.error(`Failed to execute ${file}:`, error);
        process.exit(1);
      }
    } else {
      console.error(`Migration ${file} does not export a 'run' function.`);
    }
  }
};

runMigrations()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // If you have a PrismaClient instance you want to disconnect
    // await prisma.$disconnect();
  });