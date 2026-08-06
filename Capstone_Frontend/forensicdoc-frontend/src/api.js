const API_BASE = 'http://127.0.0.1:8000';

export function getStoredToken() {
  return localStorage.getItem('forensicdoc_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('forensicdoc_token', token);
  } else {
    localStorage.removeItem('forensicdoc_token');
  }
}

export async function login(username = 'officer', password = 'officerpassword123') {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed. Check backend credentials.');
  }

  const data = await res.json();
  setStoredToken(data.access);
  return data;
}

export async function fetchWithAuth(url, options = {}) {
  let token = getStoredToken();
  
  // Auto-login fallback for seamless demo if no token present
  if (!token) {
    try {
      const authData = await login();
      token = authData.access;
    } catch (e) {
      console.warn('Auto-login failed:', e);
    }
  }

  const headers = {
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  // Token expired - try relogging once
  if (res.status === 401) {
    try {
      const authData = await login();
      headers['Authorization'] = `Bearer ${authData.access}`;
      res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    } catch (e) {
      setStoredToken(null);
      throw new Error('Authentication expired. Please log in again.');
    }
  }

  return res;
}

export async function fetchDocuments() {
  const res = await fetchWithAuth('/api/documents/');
  if (!res.ok) {
    throw new Error(`Failed to fetch documents (${res.status})`);
  }
  return res.json();
}

export async function uploadDocument(file, lguUnit = '', notes = '') {
  const formData = new FormData();
  formData.append('file', file);
  if (lguUnit) formData.append('lgu_unit', lguUnit);
  if (notes) formData.append('notes', notes);

  const res = await fetchWithAuth('/api/documents/upload/', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.file?.[0] || 'File upload failed');
  }

  return res.json();
}

export async function fetchAnalysis(documentId) {
  const res = await fetchWithAuth(`/api/documents/${documentId}/analysis/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch analysis (${res.status})`);
  }
  return res.json();
}
