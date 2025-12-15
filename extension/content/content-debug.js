// Script de debug pour trouver les bons sélecteurs LinkedIn

console.log('=== LINKEDIN DEBUG ===');
console.log('URL:', window.location.href);

// Tester différents sélecteurs possibles
const selectors = [
  '.mn-connection-card',
  '.reusable-search__result-container',
  '[data-view-name="connection-card"]',
  '.scaffold-finite-scroll__content li',
  '.artdeco-list__item',
  '.entity-result',
  '.search-result',
  '[class*="connection"]',
  '[class*="entity-result"]'
];

console.log('\n=== Test des sélecteurs ===');
selectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  console.log(`${selector}: ${elements.length} éléments trouvés`);
  if (elements.length > 0) {
    console.log('Premier élément:', elements[0]);
  }
});

// Afficher la structure du premier contact visible
console.log('\n=== Structure HTML du premier contact ===');
const possibleContacts = document.querySelectorAll('li[class*="reusable-search"], li[class*="entity"], .artdeco-list__item');
if (possibleContacts.length > 0) {
  console.log('HTML du premier contact:');
  console.log(possibleContacts[0].innerHTML);
}
