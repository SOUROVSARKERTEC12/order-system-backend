"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const EXECUTE_DIR = path.resolve(__dirname, 'execute');
// Ensure execute folder exists
if (!fs.existsSync(EXECUTE_DIR)) {
    fs.mkdirSync(EXECUTE_DIR, { recursive: true });
}
function generateMigration(name) {
    const cleanName = name.trim().replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const version = `M${timestamp}-${cleanName}`;
    // Command to generate a Prisma migration
    const command = `npx prisma migrate dev --name ${version} --schema ./prisma/schema.prisma`;
    console.log(`➡️ Generating migration: ${cleanName}`);
    try {
        (0, child_process_1.execSync)(command, { stdio: 'inherit' });
        console.log('✅ Migration generated successfully in migration/execute!');
    }
    catch (error) {
        console.error('❌ Migration generation failed:', error);
        process.exit(1);
    }
}
// CLI argument or interactive
const args = process.argv.slice(2);
const migrationName = args[0];
if (migrationName) {
    generateMigration(migrationName);
}
else {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    readline.question('📝 Enter migration name: ', (name) => {
        if (!name.trim()) {
            console.error('❌ Migration name is required.');
            readline.close();
            process.exit(1);
        }
        generateMigration(name);
        readline.close();
    });
}
