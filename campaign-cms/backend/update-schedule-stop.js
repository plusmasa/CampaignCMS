const { Campaign } = require('./models');

async function updateScheduleStop() {
  try {
    console.log('🔄 Updating duration to scheduleStop...');
    
    // Get all campaigns
    const campaigns = await Campaign.findAll();
    
    for (const campaign of campaigns) {
      let updated = false;
      const newConfig = { ...campaign.channelConfig };
      
      // Update Rewards Dashboard config if it exists
      if (newConfig['Rewards Dashboard'] && newConfig['Rewards Dashboard'].duration) {
        newConfig['Rewards Dashboard'].scheduleStop = newConfig['Rewards Dashboard'].duration;
        delete newConfig['Rewards Dashboard'].duration;
        updated = true;
      }
      
      if (updated) {
        await campaign.update({ channelConfig: newConfig });
        console.log(`✅ Updated campaign: ${campaign.title}`);
      }
    }
    
    console.log('🎉 All campaigns updated successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updateScheduleStop();
