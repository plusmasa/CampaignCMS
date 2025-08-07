const { sequelize } = require('./models');
const { initializeDatabase, seedDatabase } = require('./database/init');

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // Drop all tables and recreate them
    await sequelize.sync({ force: true });
    
    console.log('✅ Database reset complete');
    
    // Re-seed with updated data
    await seedDatabase();
    
    console.log('🎉 Database reset and re-seeded successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
