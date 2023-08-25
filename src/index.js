import SimpleLightbox from 'simplelightbox';
import Notiflix from 'notiflix';
import axios from 'axios';


axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '39058445-583a5edd643a4562ace127962';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a');

let page = 1;
let searchQuery = '';
let isLoading = false;

searchForm.addEventListener('submit', handleSearchFormSubmit);
loadMoreBtn.addEventListener('click', loadMoreImages);

function handleSearchFormSubmit(event) {
  event.preventDefault();
  searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    Notiflix.Notify.failure('Please enter a search query!');
    return;
  }

  clearGallery();
  page = 1;
  searchImages();
}

async function searchImages() {
  if (isLoading) {
    return;
  }

  isLoading = true;

  try {
    const response = await axios.get('', {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: 40,
      },
    });

    const images = response.data.hits;

    if (images.length === 0) {
      Notiflix.Notify.failure('No images found for your query. Please try again.');
    } else {
      createGalleryMarkup(images);
      lightbox.refresh();
      page += 1;
      Notiflix.Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Something went wrong. Please try again later.');
  } finally {
    isLoading = false;
    hideLoadMoreBtnIfNeeded();
  }
}

function createGalleryMarkup(images) {
  const galleryMarkup = images
    .map(
      ({ webformatURL, largeImageURL, likes, views, comments, downloads, tags }) => `
      <div class="photo-card">
        <a href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${likes}</p>
          <p class="info-item"><b>Views:</b> ${views}</p>
          <p class="info-item"><b>Comments:</b> ${comments}</p>
          <p class="info-item"><b>Downloads:</b> ${downloads}</p>
        </div>
      </div>
    `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', galleryMarkup);
}

function clearGallery() {
  gallery.innerHTML = '';
}

function hideLoadMoreBtnIfNeeded() {
  if (page === 1) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'block';
  }
}

function loadMoreImages() {
  searchImages();
  scrollPage();
}

function scrollPage() {
  const { height: cardHeight } = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
