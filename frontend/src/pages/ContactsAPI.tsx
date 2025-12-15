import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contactsAPI, type Contact } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function ContactsAPI() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts', searchQuery],
    queryFn: () => contactsAPI.getAll(searchQuery),
  });

  const handleExport = () => {
    // CSV export
    const csv = [
      ['Name', 'Title', 'Company', 'Location', 'LinkedIn URL', 'Email', 'Phone'],
      ...contacts.map((c: Contact) => [
        c.name,
        c.title || '',
        c.company || '',
        c.location || '',
        c.profileUrl,
        c.email || '',
        c.phone || '',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">LinkedIn Contact Sync</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">My LinkedIn Contacts</h2>
            <p className="mt-2 text-sm text-gray-600">
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''} synced
            </p>
          </div>

          {/* Search & Export */}
          <div className="mb-6 flex gap-4">
            <input
              type="text"
              placeholder="🔍 Search contacts (name, title, company...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleExport}
              disabled={contacts.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              📥 Export CSV
            </button>
          </div>

          {/* Empty State */}
          {contacts.length === 0 && !searchQuery && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No contacts synced yet
              </h3>
              <p className="text-gray-600 mb-6">
                Install the browser extension to start syncing your LinkedIn contacts
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                <p className="font-semibold text-blue-900 mb-2">📌 Next steps:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Install the Chrome/Firefox extension</li>
                  <li>Sign in with your account</li>
                  <li>Visit LinkedIn connections page</li>
                  <li>Click "Extract contacts" in the extension</li>
                </ol>
              </div>
            </div>
          )}

          {/* No Search Results */}
          {contacts.length === 0 && searchQuery && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try different keywords</p>
            </div>
          )}

          {/* Contacts Grid */}
          {contacts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact: Contact) => (
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
                        {contact.title || 'No title'}
                      </p>
                      {contact.company && (
                        <p className="text-xs text-gray-500 mt-1">{contact.company}</p>
                      )}
                      <a
                        href={contact.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        View on LinkedIn →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
