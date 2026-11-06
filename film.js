const apikey = '49cb96f4';

const searchForm = document.getElementById('searchForm');
const keywordInput = document.getElementById('keyword');
const movieResults = document.getElementById('movieResults');
const statusText = document.getElementById('status');
const watchlistCount = document.getElementById('watchlistCount');

function getWatchlist() {
  try {
    return JSON.parse(localStorage.getItem('cinemaWatchlist')) || [];
  } catch (error) {
    return [];
  }
}

function updateWatchlistCount() {
  if (watchlistCount) watchlistCount.textContent = getWatchlist().length;
}

function safePoster(poster) {
  return poster && poster !== 'N/A' ? poster : '';
}

function renderMovie(movie) {
  const poster = safePoster(movie.Poster);
  const alreadySaved = getWatchlist().some(item => item.imdbID === movie.imdbID);
  const column = document.createElement('div');
  column.className = 'col-12 col-sm-6 col-lg-4 col-xl-3';
  column.innerHTML = `
    <article class="movie-card">
      ${poster
        ? `<img class="poster" src="${poster}" alt="Poster ${escapeHTML(movie.Title)}" loading="lazy">`
        : `<div class="poster-placeholder"><div class="text-center"><i class="bi bi-image fs-1"></i><p class="mb-0">Poster tidak tersedia</p></div></div>`}
      <div class="card-body p-3">
        <h5 class="card-title fw-bold">${escapeHTML(movie.Title || 'Judul tidak tersedia')}</h5>
        <p class="text-warning mb-2"><i class="bi bi-calendar-event me-1"></i>${escapeHTML(movie.Year || 'Tahun tidak tersedia')}</p>
        <p class="movie-plot flex-grow-1">${escapeHTML(movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'Penjelasan film tidak tersedia.')}</p>
        <button class="btn ${alreadySaved ? 'btn-secondary' : 'btn-warning'} w-100 mt-2" ${alreadySaved ? 'disabled' : ''}>
          <i class="bi bi-bookmark-plus me-1"></i>${alreadySaved ? 'Sudah di Watchlist' : 'Tambahkan ke Watchlist'}
        </button>
      </div>
    </article>`;
  const button = column.querySelector('button');
  if (!alreadySaved) {
    button.addEventListener('click', () => {
      const list = getWatchlist();
      if (list.some(item => item.imdbID === movie.imdbID)) return;
      list.push({
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster,
        Plot: movie.Plot || 'N/A'
      });
      localStorage.setItem('cinemaWatchlist', JSON.stringify(list));
      button.disabled = true;
      button.className = 'btn btn-secondary w-100 mt-2';
      button.innerHTML = '<i class="bi bi-check2 me-1"></i>Sudah di Watchlist';
      updateWatchlistCount();
    });
  }
  movieResults.appendChild(column);
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const keyword = keywordInput.value.trim();
  if (!keyword) return;

  movieResults.replaceChildren();
  statusText.textContent = 'Sedang mencari film...';

  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${apikey}&s=${encodeURIComponent(keyword)}`);
    const data = await response.json();

    if (data.Response !== 'True' || !Array.isArray(data.Search)) {
      statusText.textContent = data.Error || 'Film tidak ditemukan. Coba kata kunci lain.';
      return;
    }

    statusText.textContent = `Ditemukan ${data.Search.length} hasil. Memuat detail film...`;

    
    const detailedMovies = await Promise.all(data.Search.map(async (movie) => {
      try {
        const detailResponse = await fetch(`https://www.omdbapi.com/?apikey=${apikey}&i=${encodeURIComponent(movie.imdbID)}&plot=short`);
        const detail = await detailResponse.json();
        return detail.Response === 'True' ? detail : movie;
      } catch (error) {
        return movie;
      }
    }));

    movieResults.replaceChildren();
    detailedMovies.forEach(renderMovie);
    statusText.textContent = `Menampilkan ${detailedMovies.length} hasil untuk “${keyword}”.`;
  } catch (error) {
    statusText.textContent = 'Tidak dapat mengambil data film. Periksa koneksi internet lalu coba lagi.';
  }
});

updateWatchlistCount();
