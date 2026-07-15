/**
 * database.js -Frontend data access module
 * 
 * Centralizes all fetch calls to the live MongoDB-backed API endpoints.
 * The backend (controllers/professional.js & controllers/contacts.js)
 * reads from the MongoDB Atlas `cse341` database.
 */

const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.protocol === 'file:';

const BASE_URL =
  isLocal && window.location.port !== '8080' ? 'http://localhost:8080' : '';

/**
 * Generic fetch helper -calls the API and returns parsed JSON or text.
 * Throws on non-OK responses so callers can handle errors uniformly.
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'object' && data !== null ? data.message : data;
    throw new Error(message || `API error ${response.status}: ${response.statusText}`);
  }

  return data;
}


 // Professional data  (MongoDB cse341.user)

/**
 * Fetch the professional profile from the live database.
 * Endpoint: GET /professional
 * @returns {Promise<Object>} Professional profile object
 */
async function getProfessionalData() {
  return apiFetch('/professional');
}

/* ───────────────────────────────────────────
 *  Contacts data  (MongoDB → cse341.contacts)
 * ─────────────────────────────────────────── */

/**
 * Fetch all contacts from the live database.
 * Endpoint: GET /contacts
 * @returns {Promise<Array>} Array of contact objects
 */
async function getAllContacts() {
  return apiFetch('/contacts');
}

/**
 * Fetch all professional profiles from the live database.
 * Endpoint: GET /professional/all
 * @returns {Promise<Array>} Array of professional profile objects
 */
async function getAllProfessionalProfiles() {
  return apiFetch('/professional/all');
}

/**
 * Fetch a single contact by its MongoDB ObjectId.
 * Endpoint: GET /contacts/:id
 * @param {string} id - The contact's ObjectId
 * @returns {Promise<Object>} Single contact object
 */
async function getContactById(id) {
  return apiFetch(`/contacts/${id}`);
}

/**
 * Create a new contact through the live API.
 * Endpoint: POST /contacts
 * @param {Object} contact - Contact payload
 * @returns {Promise<Object>} API response payload
 */
async function createContact(contact) {
  return apiFetch('/contacts', {
    method: 'POST',
    body: JSON.stringify(contact),
  });
}

/* ── Export as a single object for easy access ── */
// Using a global so it works in plain <script> tags (no bundler needed).
window.Database = {
  getProfessionalData,
  getAllContacts,
  getAllProfessionalProfiles,
  getContactById,
  createContact,
};
