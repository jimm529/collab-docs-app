const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Thin fetch wrapper: attaches the JWT, parses JSON, and throws a friendly
// Error with the server's message on non-2xx responses.
async function request(path, { method = 'GET', body, token, isFormData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  signup: (name, email, password) => request('/auth/signup', { method: 'POST', body: { name, email, password } }),
  listDocuments: (token) => request('/documents', { token }),
  createDocument: (token, title) => request('/documents', { method: 'POST', body: { title }, token }),
  getDocument: (token, id) => request(`/documents/${id}`, { token }),
  updateDocument: (token, id, updates) => request(`/documents/${id}`, { method: 'PATCH', body: updates, token }),
  shareDocument: (token, id, email, role) =>
    request(`/documents/${id}/share`, { method: 'POST', body: { email, role }, token }),
  importDocument: (token, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/documents/import', { method: 'POST', body: formData, token, isFormData: true });
  },
};
