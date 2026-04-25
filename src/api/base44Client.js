const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('auth_token');
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const authApi = {
  register: (email, password, fullName) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    }),
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
};

export const memoriesApi = {
  getAll: () => apiRequest('/memories'),
  getActive: () => apiRequest('/memories/active'),
  create: (text, enabled = true, scope = 'global', workspaceId = null) =>
    apiRequest('/memories', {
      method: 'POST',
      body: JSON.stringify({ text, enabled, scope, workspace_id: workspaceId }),
    }),
  update: (id, updates) =>
    apiRequest(`/memories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  delete: (id) => apiRequest(`/memories/${id}`, { method: 'DELETE' }),
};

export const promptsApi = {
  generate: (userPrompt, workspaceId = null, memoryScope = 'global') =>
    apiRequest('/prompts/generate', {
      method: 'POST',
      body: JSON.stringify({ userPrompt, workspaceId, memoryScope }),
    }),
  getAll: (search = '') => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/prompts${params}`);
  },
  save: (title, originalInput, improvedOutput, isTemplate = false, templateBody = null) =>
    apiRequest('/prompts/save', {
      method: 'POST',
      body: JSON.stringify({
        title,
        original_input: originalInput,
        improved_output: improvedOutput,
        is_template: isTemplate,
        template_body: templateBody,
      }),
    }),
  delete: (id) => apiRequest(`/prompts/${id}`, { method: 'DELETE' }),
  getFolders: () => apiRequest('/prompts/folders'),
  createFolder: (name) =>
    apiRequest('/prompts/folders', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  deleteFolder: (id) =>
    apiRequest(`/prompts/folders/${id}`, { method: 'DELETE' }),
};

export default { authApi, memoriesApi, promptsApi };