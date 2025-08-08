// ID generation utility for Campaigns
// Format: CAMP-YYYY-XXX where XXX is a zero-padded incremental counter per process start

let counter = Math.floor(Math.random() * 900) + 100; // start with a random 3-digit to reduce collision risk across restarts

function pad3(n) {
  return String(n).padStart(3, '0');
}

function generateCampaignId() {
  const now = new Date();
  const year = now.getFullYear();
  const id = `CAMP-${year}-${pad3(counter++)}`;
  return id;
}

module.exports = {
  generateCampaignId
};
