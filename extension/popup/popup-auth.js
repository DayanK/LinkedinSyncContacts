const API_URL = 'http://localhost:4001/api';

const loginBtn = document.getElementById('loginBtn');
const linkedinBtn = document.getElementById('linkedinBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorEl = document.getElementById('error');

console.log('Auth page loaded');
console.log('LinkedIn button:', linkedinBtn);

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  setTimeout(() => errorEl.classList.add('hidden'), 5000);
}

// LinkedIn OAuth flow with window.postMessage
let authWindow = null;

linkedinBtn.addEventListener('click', async () => {
  console.log('LinkedIn button clicked!');
  
  try {
    const authUrl = `${API_URL}/auth/linkedin`;
    console.log('Opening auth URL:', authUrl);

    // Open OAuth in a new window (not tab)
    authWindow = window.open(
      authUrl,
      'LinkedIn Login',
      'width=600,height=700'
    );

    // Listen for messages from the auth window
    window.addEventListener('message', handleAuthMessage);

  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    showError('Failed to start OAuth flow');
  }
});

async function handleAuthMessage(event) {
  console.log('Message received:', event.data);

  if (event.data.type === 'LINKEDIN_AUTH_SUCCESS') {
    const token = event.data.token;
    console.log('Token received:', token);

    try {
      // Verify token and get user info
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to verify token');
      }

      const user = await response.json();
      console.log('User info received:', user);

      // Save to chrome storage
      await chrome.storage.local.set({
        auth_token: token,
        user: user
      });

      console.log('Token saved to storage');

      // Close the auth window if still open
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }

      // Remove event listener
      window.removeEventListener('message', handleAuthMessage);

      // Redirect to main popup
      window.location.href = 'popup.html';

    } catch (error) {
      console.error('Failed to save auth:', error);
      showError('Authentication failed');
      
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }
    }
  }
}

// Email/password login
loginBtn.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Please enter email and password');
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const { token, user } = await response.json();

    // Save to storage
    await chrome.storage.local.set({
      auth_token: token,
      user: user
    });

    // Redirect to main popup
    window.location.href = 'popup.html';
  } catch (error) {
    showError(error.message);
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
});
