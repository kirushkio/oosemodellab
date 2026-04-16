const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  // Auth
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  registerDonor: (body) => request('/auth/register/donor', { method: 'POST', body: JSON.stringify(body) }),
  registerNGO: (body) => request('/auth/register/ngo', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  // Donations
  createDonation: (body) => request('/donations', { method: 'POST', body: JSON.stringify(body) }),
  getAvailable: () => request('/donations/available'),
  getMyDonations: () => request('/donations/mine'),
  updateDonationStatus: (id, status) => request(`/donations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Pickups
  createPickup: (body) => request('/pickups', { method: 'POST', body: JSON.stringify(body) }),
  getMyPickups: () => request('/pickups/mine'),
  updatePickupStatus: (id, status) => request(`/pickups/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
