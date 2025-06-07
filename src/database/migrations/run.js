const { sequelize } = require('../config');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    // Get all migration files
    const migrationFiles = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith('.js') && file !== 'run.js')
      .sort();

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(__dirname, file));
      await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    }

    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations(); 
