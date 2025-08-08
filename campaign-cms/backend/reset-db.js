const { sequelize } = require('./database/connection');
const { seedDatabase } = require('./database/init');

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // Force sync to recreate tables with new schema
    await sequelize.sync({ force: true });
    
    console.log('✅ Database reset successfully');
    
    // Seed with new data including campaign IDs
    await seedDatabase();
    
    console.log('🎉 Database reset and seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
