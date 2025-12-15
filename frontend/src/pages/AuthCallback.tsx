import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/login?error=no_token');
      return;
    }

    // Check if opened from extension (has window.opener or chrome.extension)
    const isFromExtension = window.opener || (window.chrome && window.chrome.runtime);

    // Send token to extension if opened from extension
    if (isFromExtension && window.opener) {
      window.opener.postMessage({
        type: 'LINKEDIN_AUTH_SUCCESS',
        token
      }, '*');

      // Show success message and close window after 2 seconds
      setTimeout(() => {
        window.close();
      }, 2000);
      return;
    }

    // Get user info with token (normal web flow)
    const fetchUser = async () => {
      try {
        localStorage.setItem('auth_token', token);
        const user = await authAPI.getCurrentUser();
        setAuth(user, token);
        navigate('/');
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/login?error=invalid_token');
      }
    };

    fetchUser();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
