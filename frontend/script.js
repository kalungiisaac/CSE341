// script.js — Fetches contacts from the live MongoDB database via database.js
// and renders them as cards on the page.

const contactsGrid = document.getElementById('contactsGrid');
const usersGrid = document.getElementById('usersGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const toggleContactFormButton = document.getElementById('toggleContactForm');
const viewUsersButton = document.getElementById('viewUsersButton');
const backToContactsButton = document.getElementById('backToContactsButton');
const contactForm = document.getElementById('contactForm');
const cancelContactFormButton = document.getElementById('cancelContactForm');
const formMessage = document.getElementById('formMessage');
const professionalCard = document.getElementById('professionalCard');
const professionalLinks = document.getElementById('professionalLinks');
const authLink = document.getElementById('authLink');
let showingUsers = false;

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
    <article class="contact-card scroll-reveal" id="contact-${contact._id || index}">
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

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveProfileImageSrc(profile) {
  const imageValue = profile.imagePath || profile.base64Image || profile.imageUrl || '';
  if (!imageValue) return '';

  const value = String(imageValue).trim().replace(/\\/g, '/');
  if (!value) return '';
  if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value;
  }

  const looksLikeBase64 = /^[A-Za-z0-9+/=\s]+$/.test(value) && value.length > 100;
  if (looksLikeBase64) {
    const compactValue = value.replace(/\s/g, '');
    const mimeType = compactValue.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
    return `data:${mimeType};base64,${compactValue}`;
  }

  if (value.startsWith('frontend/images/')) {
    return value.replace('frontend/', '');
  }

  if (value.startsWith('images/')) {
    return value;
  }

  const localImageMatch = value.match(/(?:^|\/)([^/]+\.(?:png|jpe?g|gif|webp|svg))$/i);
  if (localImageMatch) {
    return `images/${localImageMatch[1]}`;
  }

  return `images/${value.replace(/^(\.+\/)+/, '')}`;
}

function buildUserCard(profile, index) {
  const label = profile.professionalName || profile.nameLink?.firstName || 'User';
  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  const nameValue = escapeHtml(label);
  const summary = escapeHtml(profile.primaryDescription || 'No profile summary available.');
  const work1 = escapeHtml(profile.workDescription1 || '');
  const work2 = escapeHtml(profile.workDescription2 || '');
  const linkTitle = escapeHtml(profile.linkTitleText || '');
  const contactText = escapeHtml(profile.contactText || 'No contact information provided.');
  const websiteLabel = escapeHtml(profile.nameLink?.firstName || 'Website');
  const websiteUrl = profile.nameLink?.url || '';
  const linkedInText = escapeHtml(profile.linkedInLink?.text || 'LinkedIn');
  const linkedInLink = profile.linkedInLink?.link || '';
  const githubText = escapeHtml(profile.githubLink?.text || 'GitHub');
  const githubLink = profile.githubLink?.link || '';
  const imageSrc = resolveProfileImageSrc(profile);
  const hasImage = Boolean(imageSrc);

  return `
    <article class="contact-card user-card scroll-reveal" id="user-${profile._id || index}">
      <div class="user-image-wrap" style="--avatar-bg: ${gradient};">
        ${hasImage ? `<img class="profile-image" src="${escapeHtml(imageSrc)}" alt="${nameValue}" loading="lazy" decoding="async">` : `<div class="card-avatar">${(nameValue[0] || 'U').toUpperCase()}</div>`}
      </div>
      <div class="user-card-body">
        <h2 class="card-name">${nameValue}</h2>
        <p class="card-email">${summary}</p>
        <div class="profile-section">
          ${work1 ? `<p><strong>Work</strong><span>${work1}</span></p>` : ''}
          ${work2 ? `<p><strong>Experience</strong><span>${work2}</span></p>` : ''}
          ${linkTitle ? `<p><strong>Links</strong><span>${linkTitle}</span></p>` : ''}
        </div>
        <div class="card-details">
          ${websiteUrl ? `<div class="detail-row">
            <span class="detail-icon"><i class="fas fa-link"></i></span>
            <div>
              <div class="detail-label">Website</div>
              <div class="detail-value"><a href="${escapeHtml(websiteUrl)}" target="_blank" rel="noreferrer">${websiteLabel}</a></div>
            </div>
          </div>` : ''}
          ${linkedInLink ? `<div class="detail-row">
            <span class="detail-icon"><i class="fab fa-linkedin"></i></span>
            <div>
              <div class="detail-label">LinkedIn</div>
              <div class="detail-value"><a href="${escapeHtml(linkedInLink)}" target="_blank" rel="noreferrer">${linkedInText}</a></div>
            </div>
          </div>` : ''}
          ${githubLink ? `<div class="detail-row">
            <span class="detail-icon"><i class="fab fa-github"></i></span>
            <div>
              <div class="detail-label">GitHub</div>
              <div class="detail-value"><a href="${escapeHtml(githubLink)}" target="_blank" rel="noreferrer">${githubText}</a></div>
            </div>
          </div>` : ''}
          ${contactText ? `<div class="detail-row">
            <span class="detail-icon"><i class="fas fa-comment-dots"></i></span>
            <div>
              <div class="detail-label">Contact</div>
              <div class="detail-value">${contactText}</div>
            </div>
          </div>` : ''}
        </div>
      </div>
    </article>
  `;
}

/**
 * Main: fetch contacts from the live database and render them.
 */
async function updateAuthUI() {
  if (!authLink) return;

  try {
    const response = await fetch('/auth/status');
    const data = await response.json();

    if (data.authenticated) {
      authLink.href = '/auth/logout';
      authLink.innerHTML = '<i class="fab fa-github" style="margin-right:0.5rem;"></i>Log out';
      authLink.style.background = '#dc2626';
    } else {
      authLink.href = '/auth/login';
      authLink.innerHTML = '<i class="fab fa-github" style="margin-right:0.5rem;"></i>Log in with GitHub';
      authLink.style.background = '#2563eb';
    }
  } catch (error) {
    console.error('Failed to fetch auth status:', error);
  }
}

async function loadProfessionalProfile() {
  try {
    const profile = await Database.getProfessionalData();
    if (!professionalCard || !professionalLinks) return;

    const name = profile.professionalName || profile.nameLink?.firstName || 'Professional profile';
    const description = profile.primaryDescription || 'Professional profile data is available.';

    professionalCard.querySelector('#professionalName').textContent = name;
    professionalCard.querySelector('#professionalDescription').textContent = description;

    const links = [];
    if (profile.nameLink?.url && profile.nameLink?.firstName) {
      links.push({ label: profile.nameLink.firstName, url: profile.nameLink.url });
    }
    if (profile.linkedInLink?.link && profile.linkedInLink?.text) {
      links.push({ label: profile.linkedInLink.text, url: profile.linkedInLink.link });
    }
    if (profile.githubLink?.link && profile.githubLink?.text) {
      links.push({ label: profile.githubLink.text, url: profile.githubLink.link });
    }

    professionalLinks.innerHTML = links
      .map((link) => `<a class="profile-link" href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`)
      .join('');
  } catch (error) {
    console.error('Failed to load professional profile:', error);
    if (!professionalCard || !professionalLinks) return;

    professionalCard.querySelector('#professionalName').textContent = 'Unable to load profile';
    professionalCard.querySelector('#professionalDescription').textContent =
      'Make sure the backend server is running and the /professional endpoint is available.';
    professionalLinks.innerHTML = '';
  }
}

async function loadAllUsers() {
  try {
    const users = await Database.getAllProfessionalProfiles();
    usersGrid.style.display = 'flex';
    contactsGrid.style.display = 'none';
    loadingState.style.display = 'none';
    errorState.style.display = 'none';

    if (!users || users.length === 0) {
      errorState.querySelector('h2').textContent = 'No users found';
      errorState.querySelector('p').textContent = 'The user collection in the database is empty.';
      errorState.style.display = 'block';
      return;
    }

    usersGrid.innerHTML = users.map(buildUserCard).join('');
  } catch (error) {
    console.error('Failed to fetch users from database:', error);
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
  }
}

async function loadContacts() {
  try {
    const contacts = await Database.getAllContacts();

    // Hide loading, show grid
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    usersGrid.style.display = 'none';
    contactsGrid.style.display = 'grid';

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

function toggleContactForm(show) {
  contactForm.style.display = show ? 'block' : 'none';
  toggleContactFormButton.textContent = show ? 'Hide Form' : '+ Add Contact';
  if (!show) {
    contactForm.reset();
    formMessage.textContent = '';
    formMessage.className = 'form-message';
  }
}

async function handleAddContact(event) {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const contact = Object.fromEntries(formData.entries());

  try {
    formMessage.textContent = 'Saving contact...';
    formMessage.className = 'form-message';
    await Database.createContact(contact);
    toggleContactForm(false);
    await loadContacts();
    formMessage.textContent = 'Contact added successfully.';
    formMessage.className = 'form-message success';
  } catch (error) {
    console.error('Failed to add contact:', error);
    formMessage.textContent = error.message || 'Unable to add contact.';
    formMessage.className = 'form-message error';
  }
}

toggleContactFormButton.addEventListener('click', () => {
  const isVisible = contactForm.style.display === 'block';
  toggleContactForm(!isVisible);
});

viewUsersButton.addEventListener('click', () => {
  loadingState.style.display = 'block';
  errorState.style.display = 'none';
  if (backToContactsButton) backToContactsButton.style.display = 'inline-block';
  loadAllUsers();
});

if (backToContactsButton) {
  backToContactsButton.addEventListener('click', () => {
    usersGrid.style.display = 'none';
    contactsGrid.style.display = 'grid';
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    backToContactsButton.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

cancelContactFormButton.addEventListener('click', () => toggleContactForm(false));
contactForm.addEventListener('submit', handleAddContact);

// Kick off
updateAuthUI();
loadProfessionalProfile();
loadContacts();

// Scroll reveal — animate cards as they enter / leave the viewport
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      } else {
        entry.target.classList.remove('revealed');
      }
    });
  },
  { threshold: 0.1 }
);

function observeScrollReveal() {
  document.querySelectorAll('.scroll-reveal:not(.revealed)').forEach((el) => {
    revealObserver.observe(el);
  });
}

// Re-observe whenever new cards are added
const mutationObs = new MutationObserver(() => observeScrollReveal());
mutationObs.observe(contactsGrid, { childList: true });
mutationObs.observe(usersGrid, { childList: true });
