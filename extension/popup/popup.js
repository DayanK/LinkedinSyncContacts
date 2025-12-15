const API_URL = 'http://localhost:4001/api';

// Check authentication on load
chrome.storage.local.get(['auth_token', 'user'], (result) => {
  if (!result.auth_token) {
    window.location.href = 'popup-auth.html';
  }
});

const extractBtn = document.getElementById('extractBtn');
const viewBtn = document.getElementById('viewBtn');
const clearBtn = document.getElementById('clearBtn');
const totalContactsEl = document.getElementById('totalContacts');
const statusEl = document.getElementById('status');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');

// Load stats from backend
async function loadStats() {
  try {
    const { auth_token } = await chrome.storage.local.get(['auth_token']);

    const response = await fetch(`${API_URL}/contacts/stats`, {
      headers: { 'Authorization': `Bearer ${auth_token}` }
    });

    if (response.ok) {
      const stats = await response.json();
      totalContactsEl.textContent = stats.totalContacts || 0;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'status';
  }, 3000);
}

// Extract and sync contacts to backend
extractBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('linkedin.com')) {
      showStatus('❌ Please open LinkedIn first', 'error');
      return;
    }

    extractBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    // Extract from page
    chrome.tabs.sendMessage(tab.id, { action: 'extractContacts' }, async (response) => {
      extractBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');

      if (chrome.runtime.lastError || !response || !response.success) {
        showStatus('❌ Error: Reload LinkedIn page', 'error');
        return;
      }

      // Sync to backend
      try {
        const { auth_token, contacts } = await chrome.storage.local.get(['auth_token', 'contacts']);

        const syncResponse = await fetch(`${API_URL}/contacts/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth_token}`
          },
          body: JSON.stringify({ contacts: contacts || [] })
        });

        if (syncResponse.ok) {
          const result = await syncResponse.json();
          showStatus(`✅ Synced! ${result.added} new, ${result.updated} updated`, 'success');
          loadStats();
        } else {
          showStatus(`⚠️ Extracted but sync failed`, 'error');
        }
      } catch (error) {
        console.error('Sync error:', error);
        showStatus(`⚠️ Extracted ${response.count} contacts (sync failed)`, 'error');
      }
    });
  } catch (error) {
    console.error('Error:', error);
    showStatus('❌ An error occurred', 'error');
    extractBtn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  }
});

// View contacts (open web app)
viewBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:5173' });
});

// Clear contacts (backend + local)
clearBtn.addEventListener('click', async () => {
  if (confirm('Are you sure you want to delete all contacts?')) {
    try {
      const { auth_token } = await chrome.storage.local.get(['auth_token']);

      // Note: Backend doesn't have delete all endpoint yet
      // Just clear local storage for now
      await chrome.storage.local.set({ contacts: [] });
      showStatus('✅ Local contacts cleared', 'success');
      loadStats();
    } catch (error) {
      showStatus('❌ Error clearing contacts', 'error');
    }
  }
});

// Load stats on startup
loadStats();
