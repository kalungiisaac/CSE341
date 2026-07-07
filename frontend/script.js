// helpful link for converting image to base64: https://elmah.io/tools/base64-image-encoder/
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
const baseUrl = isLocal && window.location.port !== '8080' ? 'http://localhost:8080' : '';

async function apiFetch(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

const getData = async () => {
  try {
    const data = await apiFetch(`${baseUrl}/professional`);
    displayAllData(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    document.querySelector('.about').innerHTML = 
      '<h2 style="color: #ff6b6b; text-align: center; padding: 2rem;">⚠️ Could not load data. Make sure the backend server is running on port 8080.</h2>';
  }
};

function displayAllData(data) {
  displayProfessionalName(data.professionalName);
  displayImage(data.base64Image);
  displayPrimaryDescription(data);
  displayWorkDescription(data);
  displayLinkTitleText(data);
  displayLinkedInLink(data);
  displayGitHubLink(data);
}

function displayProfessionalName(n) {
  let professionalName = document.getElementById('professionalName');
  professionalName.innerHTML = n;
}

function displayImage(img) {
  let image = document.getElementById('professionalImage');
  image.src = `data:image/png;base64, ${img}`;
}
function displayPrimaryDescription(data) {
  let nameLink = document.getElementById('nameLink');
  nameLink.innerHTML = data.nameLink.firstName;
  nameLink.href = data.nameLink.url;
  let primaryDescription = document.getElementById('primaryDescription');
  primaryDescription.innerHTML = data.primaryDescription;
}

function displayWorkDescription(data) {
  let workDescription1 = document.getElementById('workDescription1');
  workDescription1.innerHTML = data.workDescription1;
  let workDescription2 = document.getElementById('workDescription2');
  workDescription2.innerHTML = data.workDescription2;
}

function displayLinkTitleText(data) {
  let linkTitle = document.getElementById('linkTitleText');
  linkTitle.innerHTML = data.linkTitleText;
}

function displayLinkedInLink(data) {
  let linkedInLink = document.getElementById('linkedInLink');
  linkedInLink.innerHTML = data.linkedInLink.text;
  linkedInLink.href = data.linkedInLink.link;
}

function displayGitHubLink(data) {
  let githubLink = document.getElementById('githubLink');
  githubLink.innerHTML = data.githubLink.text;
  githubLink.href = data.githubLink.link;
}

getData();
