const toast = document.querySelector('#toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

document.querySelectorAll('[data-toast]').forEach((button) => {
  button.addEventListener('click', () => showToast(button.dataset.toast));
});

const publishModal = document.querySelector('#publish-modal');

document.querySelectorAll('[data-open-modal]').forEach((button) => {
  button.addEventListener('click', () => {
    publishModal.hidden = false;
    publishModal.querySelector('.publish-choices button').focus();
  });
});

publishModal.querySelector('.modal-close').addEventListener('click', () => {
  publishModal.hidden = true;
});

publishModal.addEventListener('click', (event) => {
  if (event.target === publishModal) publishModal.hidden = true;
});

publishModal.querySelectorAll('[data-publish-choice]').forEach((choice) => {
  choice.addEventListener('click', () => {
    const action = choice.dataset.publishChoice === 'offer' ? 'oferi' : 'cauti';
    publishModal.hidden = true;
    showToast(`Super. Urmatorul pas este anuntul pe care il ${action}.`);
  });
});

document.querySelectorAll('.heart').forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.toggle('saved');
    button.textContent = button.classList.contains('saved') ? '♥' : '♡';
    showToast(button.classList.contains('saved') ? 'Salvat la favorite.' : 'Scos din favorite.');
  });
});

document.querySelectorAll('.filter').forEach((filter) => {
  filter.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active'));
    filter.classList.add('active');
    const category = filter.dataset.filter;
    document.querySelectorAll('.listing-card').forEach((card) => {
      card.hidden = category !== 'all' && !card.dataset.category.split(' ').includes(category);
    });
  });
});

document.querySelectorAll('.category-filter').forEach((filter) => {
  filter.addEventListener('click', () => {
    document.querySelectorAll('.category-filter').forEach((item) => item.classList.remove('active'));
    filter.classList.add('active');
    const category = filter.dataset.categoryFilter;
    document.querySelectorAll('.listing-card').forEach((card) => {
      card.hidden = category !== 'all' && !card.dataset.category.split(' ').includes(category);
    });
    const target = category === 'events' ? document.querySelector('#events') : document.querySelector('#community');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (category === 'events') {
      document.querySelectorAll('.event-card').forEach((card) => card.hidden = false);
    }
  });
});

document.querySelectorAll('.event-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.event-tab').forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    const eventType = tab.dataset.eventFilter;
    document.querySelectorAll('.event-card').forEach((card) => {
      card.hidden = eventType !== 'all' && card.dataset.eventType !== eventType;
    });
  });
});

const uploadButton = document.querySelector('#upload-button');
const photoUpload = document.querySelector('#photo-upload');

uploadButton.addEventListener('click', () => photoUpload.click());
photoUpload.addEventListener('change', () => {
  const count = photoUpload.files.length;
  if (count) showToast(`${count} ${count === 1 ? 'fotografie selectata' : 'fotografii selectate'}. Vor fi adaugate in arhiva.`);
});

document.querySelector('#search-button').addEventListener('click', () => {
  const location = document.querySelector('#location-input').value.trim();
  showToast(location ? `Cautam anunturi in ${location}.` : 'Scrie un oras din Valea Jiului ca sa incepi.');
  document.querySelector('#listings').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.querySelector('.menu-button').addEventListener('click', () => showToast('Navigarea mobila este pregatita pentru urmatorul pas.'));
