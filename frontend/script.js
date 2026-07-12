// script.js — Fetches contacts from the live MongoDB database via database.js
// and renders them as cards on the page.

const contactsGrid = document.getElementById('contactsGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');

// Color name → CSS color mapping for the swatch
const COLOR_MAP = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
  pink: '#ec4899',
  cyan: '#06b6d4',
  black: '#1e1e1e',
  white: '#f5f5f5',
};

// Gradient palettes for avatars
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #8b5cf6, #6366f1)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #f43f5e, #ec4899)',
  'linear-gradient(135deg, #f97316, #eab308)',
  'linear-gradient(135deg, #22c55e, #14b8a6)',
  'linear-gradient(135deg, #a855f7, #ec4899)',
];

/**
 * Format a birthday string (e.g. "1999-05-15") into a readable date.
 */
function formatBirthday(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr + 'T00:00:00'); // avoid timezone shift
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Resolve a color name to a CSS color value.
 */
function resolveColor(colorName) {
  if (!colorName) return '#888';
  const key = colorName.toLowerCase().trim();
  return COLOR_MAP[key] || colorName;
}

/**
 * Build a single contact card's HTML.
 */
function buildContactCard(contact, index) {
  const initials = `${(contact.firstName || '?')[0]}${(contact.lastName || '?')[0]}`.toUpperCase();
  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  const colorCSS = resolveColor(contact.favoriteColor);

  return `
    <article class="contact-card" id="contact-${contact._id || index}">
      <div class="card-avatar" style="background: ${gradient};">${initials}</div>
      <h2 class="card-name">${contact.firstName} ${contact.lastName}</h2>
      <p class="card-email"><a href="mailto:${contact.email}">${contact.email}</a></p>
      <div class="card-details">
        <div class="detail-row">
          <span class="detail-icon"><i class="fas fa-palette"></i></span>
          <div>
            <div class="detail-label">Favorite Color</div>
            <div class="detail-value">
              <span class="color-swatch" style="background: ${colorCSS};"></span>${contact.favoriteColor}
            </div>
          </div>
        </div>
        <div class="detail-row">
          <span class="detail-icon"><i class="fas fa-birthday-cake"></i></span>
          <div>
            <div class="detail-label">Birthday</div>
            <div class="detail-value">${formatBirthday(contact.birthday)}</div>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Main: fetch contacts from the live database and render them.
 */
async function loadContacts() {
  try {
    const contacts = await Database.getAllContacts();

    // Hide loading, show grid
    loadingState.style.display = 'none';

    if (!contacts || contacts.length === 0) {
      errorState.querySelector('h2').textContent = 'No contacts found';
      errorState.querySelector('p').textContent = 'The contacts collection in the database is empty.';
      errorState.style.display = 'block';
      return;
    }

    contactsGrid.innerHTML = contacts.map(buildContactCard).join('');
  } catch (error) {
    console.error('Failed to fetch contacts from database:', error);
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
  }
}

// Kick off
loadContacts();
