// Content script injecté sur LinkedIn
console.log('LinkedIn Contact Sync: Extension loaded');

// Fonction pour extraire les contacts de la page LinkedIn
function extractContacts() {
  const contacts = [];

  // Nouvelle approche : chercher tous les liens de profil
  const profileLinks = document.querySelectorAll('a[href*="/in/"]');

  console.log(`Trouvé ${profileLinks.length} liens de profil`);

  // Grouper les liens par container parent proche
  const processedProfiles = new Set();

  profileLinks.forEach((link) => {
    try {
      // Extraire l'ID LinkedIn du profil URL
      const profileUrl = link.href;
      const linkedInId = profileUrl.match(/\/in\/([^\/\?]+)/)?.[1];

      if (!linkedInId || processedProfiles.has(linkedInId)) {
        return; // Skip si déjà traité
      }

      processedProfiles.add(linkedInId);

      // Le container est 2 niveaux au-dessus du lien
      const container = link.parentElement.parentElement;

      if (!container) {
        return;
      }

      // Extraire le nom et titre depuis les <p>
      const paragraphs = container.querySelectorAll('p');

      let name = '';
      let title = '';

      // P[0] = Nom, P[1] = Titre, P[2] = Date
      if (paragraphs.length >= 2) {
        name = paragraphs[0].textContent.trim();
        title = paragraphs[1].textContent.trim();
      } else if (paragraphs.length === 1) {
        name = paragraphs[0].textContent.trim();
      }

      // Extraire l'image de profil
      let avatar = '';
      const imgElement = container.querySelector('img');
      if (imgElement && imgElement.src) {
        avatar = imgElement.src;
      }

      // Ajouter uniquement si on a au moins un nom
      if (name && name.length > 2) {
        contacts.push({
          id: linkedInId,
          linkedInId: linkedInId,
          name: name,
          title: title || 'N/A',
          avatar: avatar,
          profileUrl: profileUrl,
          scrapedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error extracting contact:', error);
    }
  });

  console.log(`Extracted ${contacts.length} contacts`);
  console.log('Contacts:', contacts);
  return contacts;
}

// Écouter les messages du popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContacts') {
    const contacts = extractContacts();

    // Sauvegarder dans Chrome Storage
    chrome.storage.local.get(['contacts'], (result) => {
      const existingContacts = result.contacts || [];

      // Fusionner avec les contacts existants (éviter doublons par ID)
      const contactMap = new Map();
      existingContacts.forEach(c => contactMap.set(c.id, c));
      contacts.forEach(c => contactMap.set(c.id, c));

      const mergedContacts = Array.from(contactMap.values());

      chrome.storage.local.set({ contacts: mergedContacts }, () => {
        sendResponse({
          success: true,
          count: contacts.length,
          total: mergedContacts.length
        });
      });
    });

    return true; // Indique une réponse asynchrone
  }

  if (request.action === 'getPageInfo') {
    sendResponse({
      url: window.location.href,
      isMyNetwork: window.location.href.includes('/mynetwork/'),
      isSearch: window.location.href.includes('/search/results/people/')
    });
  }
});

// Auto-extraction si on est sur la page des relations
if (window.location.href.includes('/mynetwork/') || window.location.href.includes('/search/results/people/')) {
  // Attendre que la page soit chargée
  setTimeout(() => {
    const contacts = extractContacts();
    if (contacts.length > 0) {
      chrome.runtime.sendMessage({
        action: 'contactsDetected',
        count: contacts.length
      });
    }
  }, 2000);
}
