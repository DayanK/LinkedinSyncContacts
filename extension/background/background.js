// Service worker pour l'extension
console.log('LinkedIn Contact Sync: Background service worker loaded');

// Écouter les messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'contactsDetected') {
    // Afficher une notification badge
    chrome.action.setBadgeText({ text: String(request.count) });
    chrome.action.setBadgeBackgroundColor({ color: '#0a66c2' }); // Bleu LinkedIn
  }
});

// Réinitialiser le badge quand on change d'onglet
chrome.tabs.onActivated.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
});
