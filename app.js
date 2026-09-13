const intro = document.querySelector('#intro-panel');
const panels = ['case-info', 'book-appointment', 'testimonials'].map(id => document.getElementById(id));
const menus = [...document.querySelectorAll('[data-menu]')];

function navigate() {
  const route = location.hash.slice(1) || 'home';
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
const appointmentForm = document.querySelector('#appointment-form');
const appointmentDate = document.querySelector('#appointment-date');
const appointmentChannel = document.querySelector('#appointment-channel');
const appointmentCenter = document.querySelector('#appointment-center');
function updateAppointmentDateMinimum() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const value = type => parts.find(part => part.type === type).value;
  appointmentDate.min = `${value('year')}-${value('month')}-${value('day')}`;
}
updateAppointmentDateMinimum();
appointmentDate.addEventListener('focus', updateAppointmentDateMinimum);
appointmentChannel.addEventListener('change', () => {
  appointmentCenter.hidden = appointmentChannel.value !== 'therapy-center';
});
appointmentForm.addEventListener('reset', () => {
  document.querySelector('#booking-preferences').textContent = '';
  appointmentCenter.hidden = true;
  updateAppointmentDateMinimum();
});
appointmentForm.addEventListener('submit', event => {
  event.preventDefault();
  updateAppointmentDateMinimum();
  if (!appointmentForm.reportValidity()) return;
  const channel = appointmentChannel.value === 'online' ? 'Online' : 'At therapy center';
  document.querySelector('#booking-preferences').textContent = `Your preferences: ${appointmentDate.value} (India time), ${channel}. Use ${document.querySelector('#appointment-email').value} in Google’s booking form. These details have not been submitted.`;
  document.querySelector('#live-booking-heading').focus();
  document.querySelector('#live-booking').scrollIntoView({ block: 'start', behavior: 'smooth' });
});
appointmentForm.addEventListener('input', () => {
  document.querySelector('#booking-preferences').textContent = '';
});
appointmentForm.querySelector('[type="submit"]').disabled = false;
