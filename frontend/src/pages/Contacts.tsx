import { useState } from 'react';
import { useContacts } from '../hooks/useContacts';

export default function Contacts() {
  const { contacts, loading, clearContacts } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClear = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer tous les contacts ?')) {
      clearContacts();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Contacts LinkedIn</h1>
          <p className="mt-2 text-sm text-gray-600">
            {contacts.length} contact{contacts.length > 1 ? 's' : ''} synchronisé{contacts.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="🔍 Rechercher un contact (nom, titre...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            🗑️ Effacer tout
          </button>
        </div>

        {/* Empty State */}
        {contacts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun contact synchronisé
            </h2>
            <p className="text-gray-600 mb-6">
              Utilisez l'extension Chrome pour extraire vos contacts LinkedIn
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <p className="font-semibold text-blue-900 mb-2">📌 Instructions :</p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Installez l'extension Chrome</li>
                <li>Allez sur LinkedIn (Mes relations)</li>
                <li>Cliquez sur l'icône de l'extension</li>
                <li>Cliquez sur "Extraire les contacts"</li>
              </ol>
            </div>
          </div>
        )}

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4 text-sm text-gray-600">
            {filteredContacts.length} résultat{filteredContacts.length > 1 ? 's' : ''} pour "{searchQuery}"
          </div>
        )}

        {/* Contacts Grid */}
        {filteredContacts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={contact.avatar || 'https://via.placeholder.com/48'}
                    alt={contact.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {contact.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {contact.title || 'Pas de titre'}
                    </p>
                    <a
                      href={contact.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                    >
                      Voir le profil →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {searchQuery && filteredContacts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun résultat
            </h2>
            <p className="text-gray-600">
              Essayez avec d'autres mots-clés
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
