const contacts = [
  {
    _id: 'fallback-contact-1',
    firstName: 'Kalungi',
    lastName: 'Isaac',
    email: 'kalungi@example.com',
    favoriteColor: 'blue',
    birthday: '1999-05-15',
  },
];

const professionalProfiles = [
  {
    _id: 'fallback-profile-1',
    professionalName: 'Kalungi Isaac',
    nameLink: {
      firstName: 'Kalungi',
      url: 'https://github.com/kalungiisaac',
    },
    base64Image: 'images/image.jpg',
    primaryDescription: 'Student and software developer.',
    workDescription1: 'Building full-stack web applications.',
    workDescription2: 'Focused on Node.js, MongoDB, and API design.',
    linkTitleText: 'Follow me:',
    linkedInLink: {
      link: 'https://www.linkedin.com/in/kalungiisaac/',
      text: 'LinkedIn',
    },
    githubLink: {
      link: 'https://github.com/kalungiisaac',
      text: 'GitHub',
    },
    contactText: 'Available for collaboration opportunities.',
  },
];

module.exports = {
  contacts,
  professionalProfiles,
};
