import { BOOKS_PER_PAGE, authors, books, genres } from "./data.js";

const matches = books;
let page = 1;

// Responsible for list of books
let fragment = document.createDocumentFragment();
const extracted = books.slice(0, 36);

for (const { author, image, title, id } of extracted) {
  const preview = createPreview({ author, id, image, title });
  fragment.appendChild(preview);
}

document.querySelector('[data-list-items]').appendChild(fragment);

const moreBooks = document.querySelector("[data-list-button]");
let showMore = page * BOOKS_PER_PAGE;

// Responsible for show more title
moreBooks.innerHTML = /* html */ [
  `<span>Show More</span>`,
  `<span class="list__remaining">${
    matches.length - showMore > 0 ? matches.length - showMore : 0
  }</span>`,
];

// When show more is clicked
moreBooks.addEventListener("click", () => {
  const dataListItems = document.querySelector("[data-list-items]");
  const remaining = matches.slice(showMore, matches.length);
  const fragment = document.createDocumentFragment();

  for (const { author, title, image, id } of remaining) {
    const preview = createPreview({ author, id, image, title });
    fragment.appendChild(preview);
  }

  dataListItems.appendChild(fragment);
  showMore += remaining.length;
  moreBooks.disabled = !(matches.length - showMore > 0);
});

// Responsible for the preview and its images
document.querySelector('[data-list-items]').addEventListener('click', (event) => {
  const pathArray = Array.from(event.path || event.composedPath());
  let active;

  for (const node of pathArray) {
    if (active) break;
    const previewId = node?.dataset?.preview;

    for (const singleBook of books) {
      if (singleBook.id === previewId) {
        active = singleBook;
        break;
      }
    }
  }

  if (!active) return;
  document.querySelector('[data-list-active]').open = true;
  document.querySelector('[data-list-image]').setAttribute('src', active.image);
  document.querySelector('[data-list-blur]').style.backgroundImage = `url('${active.image}')`;
  document.querySelector('[data-list-title]').textContent = active.title;
  document.querySelector('[data-list-subtitle]').textContent = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
  document.querySelector('[data-list-description]').textContent = active.description;
});

// Responsible for cancel in search
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
  document.querySelector('[data-search-overlay]').open = false;
});

// Search modal show
document.querySelector('[data-header-search]').addEventListener('click', () => {
  document.querySelector('[data-search-overlay]').open = true;
});

// SEARCH BUTTON

// Search specific books
const searchFilter = document.querySelector('[data-search-form]');
// Add event listener to search form
searchFilter.addEventListener('submit', (event) => {
  event.preventDefault();
  // Hide book list
  document.querySelector('[data-list-items]').style.display = 'none';
  // Clear message area
  document.querySelector('[data-list-message]').innerHTML = '';
  // Get form data
  const formData = new FormData(event.target);
  const title1 = formData.get('title');
  const genre1 = formData.get('genre');
  const author1 = formData.get('author');
  // Array to store filtered books
  const filteredBooks = [];
  // Loop through all books
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    // If genre and author are not selected, filter by title only
    if (genre1 === 'any' && author1 === 'any') {
      if (book.title.toLowerCase().includes(title1.toLowerCase())) {
        filteredBooks.push(book);
      }
    }
    // If genre is not selected, filter by title and author
    if (genre1 === 'any') {
      if (book.title.toLowerCase().includes(title1.toLowerCase()) && book.author === author1) {
        filteredBooks.push(book);
      }
    }
    // If title is not entered, filter by author and genre
    if (title1 === '') {
      if (book.author === author1 && book.genres.includes(genre1)) {
        filteredBooks.push(book);
      }
    }
    // If neither title nor author are selected, filter by genre only
    if (title1 === '' && author1 === 'any') {
      if (book.genres.includes(genre1)) {
        filteredBooks.push(book);
      }
    }
  }

  // Display message if no books match filters
  if (filteredBooks.length > 0) {
    document.querySelector('[data-list-message]').innerText = '';
    document.querySelector('[data-list-button]').disabled = true;
    document.querySelector('[data-list-message]').style.marginTop = '-125px';
  } else {
    document.querySelector('[data-list-message]').innerText = 'No results found. Your filters might be too narrow.';
    document.querySelector('[data-list-button]').disabled = true;
  }

  // Display filtered books
  document.querySelector('[class="list__message"]').style.display = 'block';
  // Create fragment to hold filtered books
  const fragment2 = document.createDocumentFragment();
  for (const { author, image, title, id, description, published } of filteredBooks) {
    const preview = document.createElement('button');
    preview.className = 'preview';
    preview.dataset.id = id;
    preview.dataset.title = title;
    preview.dataset.image = image;
    preview.dataset.subtitle = `${authors[author]} (${new Date(published).getFullYear()})`;
    preview.dataset.description = description;
    preview.dataset.genre = genres;
    // Create preview button with book information
    preview.innerHTML = /* html */ `
      <div>
        <img class='preview__image' src="${image}" alt="book pic"/>
      </div>
      <div class='preview__info'>
        <dt class='preview__title'>${title}</dt>
        <dt class='preview__author'>By ${authors[author]}</dt>
      </div>
    `;
    // Append preview button to fragment
    fragment2.appendChild(preview);
  }
  // Add filtered books to message area
  const booklist2 = document.querySelector('[class="list__message"]');
  booklist2.append(fragment2);
  document.querySelector('[data-search-form]').reset();
  document.querySelector("[data-search-overlay]").close();
});

// Dropdown options
function createDropdownOptions(parentElement, options, defaultOption) {
  const defaultOptionElement = document.createElement("option");
  defaultOptionElement.value = "any";
  defaultOptionElement.innerText = defaultOption;
  parentElement.appendChild(defaultOptionElement);
  for (const [id, name] of Object.entries(options)) {
    const element = document.createElement("option");
    element.value = id;
    element.innerText = name;
    parentElement.appendChild(element);
  }
}

// Select genres
const dataSearchGenres = document.querySelector("[data-search-genres]");
const allGenresOption = document.createElement("option");
allGenresOption.value = "any";
allGenresOption.innerText = "All Genres";
dataSearchGenres.appendChild(allGenresOption);
for (const [id, names] of Object.entries(genres)) {
  const element = document.createElement("option");
  element.value = id;
  element.innerText = names;
  dataSearchGenres.appendChild(element);
}

// Filter authors
const dataSearchAuthors = document.querySelector("[data-search-authors]");
const allAuthorsOption = document.createElement("option");
allAuthorsOption.value = "any";
allAuthorsOption.innerText = "All Authors";
dataSearchAuthors.appendChild(allAuthorsOption);
for (const [id, names] of Object.entries(authors)) {
  const element = document.createElement("option");
  element.value = id;
  element.innerText = names;
  dataSearchAuthors.appendChild(element);
}

// Event listener for settings form submit
document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  actions.settings.submit();
});

// Closes the preview overlay
document.querySelector('[data-list-close]').addEventListener('click', () => {
  document.querySelector('[data-list-active]').open = false;
});

// Show more books on the list
function createPreview({ author, id, image, title }) {
  let element = document.createElement('button');
  element.classList = 'preview';
  element.setAttribute('data-preview', id);

  element.innerHTML = /* html */ `
    <img class="preview__image" src="${image}" />
    <div class="preview__info">
      <h3 class="preview__title">${title}</h3>
      <div class="preview__author">"${authors[author]}"</div>
    </div>
  `;
  return element;
}

document.addEventListener('DOMContentLoaded', () => {
  const settingsBtn = document.querySelector('[data-header-settings]');
  const settingsOverlay = document.querySelector('[data-settings-overlay]');
  const settingsCancelBtn = document.querySelector('[data-settings-cancel]');
  const form = document.getElementById('settings');
  const themeSelect = document.querySelector('[data-settings-theme]');
  
  const css = {
      day: {
          dark: '10, 10, 20',
          light: '255, 255, 255',
          previewText: 'lightgrey',
      },
      night: {
          dark: '255, 255, 255',
          light: '10, 10, 20',
          previewText: 'whitesmoke',
      }
  };
  
  settingsBtn.addEventListener('click', (event) => {
      event.preventDefault();
      settingsOverlay.showModal();
  });
  
  settingsCancelBtn.addEventListener('click', () => {
      settingsOverlay.close();
  });
  
  form.addEventListener('submit', (event) => {
      event.preventDefault();
      const theme = themeSelect.value;
      document.documentElement.style.setProperty('--color-dark', css[theme].dark);
      document.documentElement.style.setProperty('--color-light', css[theme].light);
      document.documentElement.style.setProperty('--color-preview-text', css[theme].previewText);
      settingsOverlay.close();
  });

  // Initialize theme based on user's OS theme preference
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = prefersDarkMode ? 'night' : 'day';
  document.documentElement.style.setProperty('--color-dark', css[initialTheme].dark);
  document.documentElement.style.setProperty('--color-light', css[initialTheme].light);
  document.documentElement.style.setProperty('--color-preview-text', css[initialTheme].previewText);
});
