const apikey = '49cb96f4';

const watchlistResults = document.getElementById('watchlistResults');
const emptyMessage = document.getElementById('emptyMessage');
const watchlistCount = document.getElementById('watchlistCount');

function getWatchlist() {
  try {
    return JSON.parse(localStorage.getItem('cinemaWatchlist')) || [];
  } catch (error) {
    return [];
  }
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function renderWatchlist() {
  const list = getWatchlist();
  watchlistResults.replaceChildren();
  watchlistCount.textContent = list.length;
  emptyMessage.classList.toggle('d-none', list.length > 0);

  list.forEach((movie) => {
    const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : '';
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
          <button class="btn btn-outline-danger w-100 mt-2"><i class="bi bi-trash me-1"></i>Hapus dari Watchlist</button>
        </div>
      </article>`;
    column.querySelector('button').addEventListener('click', () => {
      const updatedList = getWatchlist().filter(item => item.imdbID !== movie.imdbID);
      localStorage.setItem('cinemaWatchlist', JSON.stringify(updatedList));
      renderWatchlist();
    });
    watchlistResults.appendChild(column);
  });
}

renderWatchlist();
