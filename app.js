const intro = document.querySelector('#intro-panel');
const panels = ['case-info', 'book-appointment'].map(id => document.getElementById(id));
const menus = [...document.querySelectorAll('[data-menu]')];

function navigate() {
  const route = location.hash.slice(1) || 'home';
  if (route === 'testimonials') {
    location.replace('/yoga-therapy/testimonials/');
    return;
  }
  const activePanel = panels.find(panel => panel.id === route);
  intro.hidden = Boolean(activePanel);
  for (const panel of panels) panel.hidden = panel !== activePanel;
  for (const link of menus) {
    if (link.dataset.menu === route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (activePanel) activePanel.querySelector('h1').focus({ preventScroll: true });
  // Anchor targets may have been hidden when the browser first handled the hash.
  const target = document.getElementById(route);
  if (target) target.scrollIntoView({ block: 'start' });
}
window.addEventListener('hashchange', navigate);
navigate();

const form = document.querySelector('#case-form');
const review = document.querySelector('#case-review');
const details = document.querySelector('#review-details');
const dob = document.querySelector('#dob');
const today = new Date();
dob.max = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const fields = [
  ['firstName', 'First Name'], ['lastName', 'Last Name'],
  ['dateOfBirth', 'Date of Birth'], ['timeOfBirth', 'Time of Birth'],
  ['placeOfBirth', 'Place of Birth'], ['occupation', 'Occupation'],
  ['healthIssues', 'Health issues for which yoga therapy is required'],
];
form.addEventListener('submit', (event) => {
  event.preventDefault();
  for (const field of form.querySelectorAll('input[required]:not([type]), textarea[required]')) {
    field.setCustomValidity(field.value.trim() ? '' : 'Please enter a value.');
  }
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  details.replaceChildren();
  for (const [key, label] of fields) {
    const term = document.createElement('dt');
    const value = document.createElement('dd');
    term.textContent = label;
    value.textContent = data.get(key).trim() || 'Not provided';
    details.append(term, value);
  }
  review.hidden = false;
  document.querySelector('#review-heading').focus();
});
form.addEventListener('input', (event) => {
  event.target.setCustomValidity('');
  review.hidden = true;
  details.replaceChildren();
});
form.addEventListener('reset', () => {
  for (const field of form.elements) if (field.setCustomValidity) field.setCustomValidity('');
  review.hidden = true;
  details.replaceChildren();
});
document.querySelector('#edit-details').addEventListener('click', () => {
  review.hidden = true;
  details.replaceChildren();
  document.querySelector('#first-name').focus();
});

// Enable review only after the handler that prevents submission is installed.
form.querySelector('[type="submit"]').disabled = false;


// Google owns live availability and booking. Local preferences are not sent
// to its cross-origin booking page; never claim a booking from iframe loading.
// Google owns live availability and booking. Local preferences are not sent
// to its cross-origin booking page; never claim a booking from iframe loading.
const appointmentForm = document.querySelector('#appointment-form');
const appointmentChannels = document.querySelectorAll('input[name="channel"]');
const appointmentCenter = document.querySelector('#appointment-center');
appointmentChannels.forEach(channel => channel.addEventListener('change', () => {
  const chosen = document.querySelector('input[name="channel"]:checked');
  appointmentCenter.hidden = !chosen || chosen.value !== 'therapy-center';
}));
appointmentForm.addEventListener('reset', () => {
  document.querySelector('#booking-preferences').textContent = '';
  appointmentCenter.hidden = true;
});
appointmentForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!appointmentForm.reportValidity()) return;
  const channel = document.querySelector('input[name="channel"]:checked').value === 'online' ? 'Online' : 'At therapy center';
  document.querySelector('#booking-preferences').textContent = `Your preference: ${channel}. Choose your date and time in Google Calendar below. Use ${document.querySelector('#appointment-email').value} in Google’s booking form. These details have not been submitted.`;
  document.querySelector('#live-booking-heading').focus();
  document.querySelector('#live-booking').scrollIntoView({ block: 'start', behavior: 'smooth' });
});
appointmentForm.addEventListener('input', () => { document.querySelector('#booking-preferences').textContent = ''; });
appointmentForm.querySelector('[type="submit"]').disabled = false;
