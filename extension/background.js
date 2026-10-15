// KarmaKount Service Worker for Chrome Extension
const API_BASE = 'http://localhost:3001';

chrome.runtime.onInstalled.addListener(() => {
  console.log('[KarmaKount Extension] Service Worker Active');
});

// Periodic badge updates or notifications
async function checkLatestDeeds() {
  try {
    const res = await fetch(`${API_BASE}/api/deeds`);
    if (res.ok) {
      const deeds = await res.json();
      const pendingCount = deeds.filter(d => d.status === 'PENDING_JURY').length;
      if (pendingCount > 0) {
        chrome.action.setBadgeText({ text: String(pendingCount) });
        chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
      } else {
        chrome.action.setBadgeText({ text: '' });
      }
    }
  } catch {
    // Server offline
  }
}

setInterval(checkLatestDeeds, 15000);
checkLatestDeeds();
