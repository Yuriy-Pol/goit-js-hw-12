import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

document.addEventListener('DOMContentLoaded', function () {
  const apiKey = '41611700-7d67ead1fe1a36cc390063edf';
  const searchForm = document.getElementById('searchForm');
  const searchQueryInput = document.getElementById('searchQuery');
  const loader = document.getElementById('loader');
  const galleryContainer = document.getElementById('gallery');
  const loadMoreButton = document.getElementById('loadMore');
  let lightbox;
  let currentPage = 1;
  let currentSearchQuery = '';
  let totalHits = 0;

  searchForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const searchQuery = searchQueryInput.value.trim();

    if (searchQuery === '') {
      iziToast.error({
        title: 'Error',
        message: 'Please enter a search query',
      });
      return;
    }

    loadMoreButton.style.display = 'none';

    loader.style.display = 'block';

    try {
      const response = await axios.get(
        `https://pixabay.com/api/?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`
      );

      const data = response.data;
      loader.style.display = 'none';

      if (data.hits.length === 0) {
        iziToast.info({
          title: 'Info',
          message:
            'Sorry, there are no images matching your search query. Please try again!',
        });
      } else {
        totalHits = data.totalHits;

        if (searchQuery !== currentSearchQuery) {
          currentPage = 1;
          currentSearchQuery = searchQuery;
          galleryContainer.innerHTML = '';
        }

        data.hits.forEach(image => {
          const img = document.createElement('img');
          img.src = image.webformatURL;
          img.alt = image.tags;
          img.dataset.large = image.largeImageURL;
          img.dataset.title = `Likes: ${image.likes}, Views: ${image.views}, Comments: ${image.comments}, Downloads: ${image.downloads}`;
          img.classList.add('image-class');
          const a = document.createElement('a');
          a.href = image.largeImageURL;
          a.appendChild(img);

          galleryContainer.appendChild(a);
        });

        lightbox.refresh();

        if (totalHits <= currentPage * 40) {
          iziToast.info({
            title: 'Info',
            message:
              "We're sorry, but you've reached the end of search results.",
          });
        } else {
          loadMoreButton.style.display = 'block';
        }

        const cardHeight =
          galleryContainer.firstElementChild.getBoundingClientRect().height;

        window.scrollTo({
          top: window.scrollY + cardHeight * 2,
          behavior: 'smooth',
        });
      }
    } catch (error) {
      loader.style.display = 'none';
      console.error('Error fetching images:', error);
    }
  });

  loadMoreButton.addEventListener('click', function () {
    currentPage += 1;
    searchForm.dispatchEvent(new Event('submit'));
  });

  lightbox = new SimpleLightbox('#gallery a');
});
