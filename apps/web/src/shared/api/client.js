async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    },
    ...options
  });

  if (response.status === 401) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'The request could not be completed.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const api = {
  me: () => request('/api/auth/me'),
  listCapsules: () => request('/api/capsules'),
  createCapsule: (capsule) => request('/api/capsules', {
    method: 'POST',
    body: JSON.stringify(capsule)
  }),
  updateCapsule: (id, capsule) => request(`/api/capsules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(capsule)
  }),
  deleteCapsule: (id) => request(`/api/capsules/${id}`, { method: 'DELETE' }),
  logout: () => request('/api/auth/logout', { method: 'POST' })
};
