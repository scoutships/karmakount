const API_BASE = 'http://localhost:3001';

let activePlayer = null;
let currentPolarity = 'VIRTUE';

const karmaScoreEl = document.getElementById('karmaScore');
const playerAvatarEl = document.getElementById('playerAvatar');
const playerNameEl = document.getElementById('playerName');
const playerTitleEl = document.getElementById('playerTitle');
const feedContainer = document.getElementById('feedContainer');
const btnVirtue = document.getElementById('btnVirtue');
const btnVice = document.getElementById('btnVice');
const deedTitleInput = document.getElementById('deedTitle');
const btnSubmit = document.getElementById('btnSubmit');

// Switch polarity
btnVirtue.addEventListener('click', () => {
  currentPolarity = 'VIRTUE';
  btnVirtue.className = 'polarity-btn active-virtue';
  btnVice.className = 'polarity-btn';
  btnSubmit.className = 'submit-btn';
  btnSubmit.innerText = '+ Inscribe Virtue (+35)';
});

btnVice.addEventListener('click', () => {
  currentPolarity = 'VICE';
  btnVice.className = 'polarity-btn active-vice';
  btnVirtue.className = 'polarity-btn';
  btnSubmit.className = 'submit-btn vice-btn';
  btnSubmit.innerText = '- Record Vice (-35)';
});

async function loadData() {
  try {
    const [playersRes, deedsRes] = await Promise.all([
      fetch(`${API_BASE}/api/players`).then(r => r.json()),
      fetch(`${API_BASE}/api/deeds`).then(r => r.json())
    ]);

    if (playersRes && playersRes.length > 0) {
      activePlayer = playersRes[0]; // Primary player
      playerAvatarEl.innerText = activePlayer.avatar;
      playerNameEl.innerText = activePlayer.displayName;
      playerTitleEl.innerText = `${activePlayer.username} • ${activePlayer.title}`;
      
      const score = activePlayer.karmaScore;
      karmaScoreEl.innerText = (score > 0 ? `+${score}` : `${score}`) + ' PTS';
      karmaScoreEl.className = 'score-badge ' + (score >= 0 ? 'score-positive' : 'score-negative');
    }

    if (deedsRes && deedsRes.length > 0) {
      feedContainer.innerHTML = '';
      deedsRes.slice(0, 4).forEach(deed => {
        const item = document.createElement('div');
        item.className = 'feed-item' + (deed.polarity === 'VICE' ? ' vice-item' : '');
        item.innerHTML = `
          <div class="feed-title">${deed.title}</div>
          <div class="feed-meta">
            ${deed.actorPlayerName.split(' ')[0]} • 
            <strong style="color: ${deed.polarity === 'VIRTUE' ? '#fbbf24' : '#fb7185'}">
              ${deed.karmaValue > 0 ? '+' : ''}${deed.karmaValue} pts
            </strong> • 
            ${deed.status.replace(/_/g, ' ')}
          </div>
        `;
        feedContainer.appendChild(item);
      });
    }
  } catch (err) {
    playerNameEl.innerText = 'Server Offline';
    playerTitleEl.innerText = 'Start server at localhost:3001';
    feedContainer.innerHTML = '<div style="font-size: 10px; color: #f43f5e; text-align: center; padding: 10px;">Cannot connect to KarmaKount API. Launch npm start.</div>';
  }
}

// Quick submit deed
btnSubmit.addEventListener('click', async () => {
  const text = deedTitleInput.value.trim();
  if (!text || !activePlayer) return;

  btnSubmit.disabled = true;
  btnSubmit.innerText = 'Inscribing...';

  try {
    const payload = {
      polarity: currentPolarity,
      category: currentPolarity === 'VIRTUE' ? 'Altruism & Charity' : 'Petty Spite & Obstruction',
      title: text,
      description: text,
      impactTier: 'NOTABLE',
      actorPlayerId: activePlayer.id,
      reporterPlayerId: activePlayer.id,
      isSelfReport: true,
      location: {
        name: 'Browser Extension Quick-Log',
        lat: activePlayer.location.lat,
        lng: activePlayer.location.lng
      }
    };

    const res = await fetch(`${API_BASE}/api/deeds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      deedTitleInput.value = '';
      await loadData();
    }
  } catch (err) {
    alert('Failed to submit deed. Ensure KarmaKount server is running.');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerText = currentPolarity === 'VIRTUE' ? '+ Inscribe Virtue (+35)' : '- Record Vice (-35)';
  }
});

loadData();
