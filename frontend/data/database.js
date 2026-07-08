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
 * Generic fetch helper – calls the API and returns parsed JSON.
 * Throws on non-OK responses so callers can handle errors uniformly.
 */
async function apiFetch(endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }
  return response.json();
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
 * Fetch a single contact by its MongoDB ObjectId.
 * Endpoint: GET /contacts/:id
 * @param {string} id - The contact's ObjectId
 * @returns {Promise<Object>} Single contact object
 */
async function getContactById(id) {
  return apiFetch(`/contacts/${id}`);
}

/* ── Export as a single object for easy access ── */
// Using a global so it works in plain <script> tags (no bundler needed).
window.Database = {
  getProfessionalData,
  getAllContacts,
  getContactById,
};
