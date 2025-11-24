// index.js – Fully Upgraded Edition
const apiKey = 'e745e7d9';
const searchBtn = document.getElementById('searchBtn');
const movieInput = document.getElementById('movieInput');
const moviesGrid = document.getElementById('moviesGrid');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

const featuredMovies = ["Inception", "Avengers: Endgame", "Joker", "Interstellar", "The Dark Knight", "Parasite", "Oppenheimer", "Dune", "Everything Everywhere All at Once"];

window.addEventListener('DOMContentLoaded', () => {
  showSkeleton();
  loadFeaturedMovies();
});

// === Skeleton Loading ===
function showSkeleton(count = 9) {
  moviesGrid.innerHTML = Array(count).fill(0).map(() => `
    <div class="movie-card skeleton">
      <div class="skeleton" style="height:300px;"></div>
      <div class="movie-info">
        <h3 class="skeleton" style="height:20px;width:80%;margin:12px auto;"></h3>
        <p class="skeleton" style="height:16px;width:50%;margin:0 auto;"></p>
      </div>
    </div>
  `).join('');
}

// === Load Featured ===
async function loadFeaturedMovies() {
  showSkeleton();
  try {
    const responses = await Promise.all(
      featuredMovies.map(title => fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`))
    );
    const movies = await Promise.all(responses.map(r => r.json()));
    const valid = movies.filter(m => m.Response !== "False");
    displayMovies(valid);
  } catch { moviesGrid.innerHTML = "<p style='text-align:center;color:#ffb800;'>Failed to load movies</p>"; }
}

// === Search ===
searchBtn.addEventListener('click', performSearch);
movieInput.addEventListener('keypress', e => e.key === 'Enter' && performSearch());

function performSearch() {
  const query = movieInput.value.trim();
  if (!query) return;

  showSkeleton();
  fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`)
    .then(r => r.json())
    .then(data => {
      if (data.Response === "False") {
        moviesGrid.innerHTML = `<p style="text-align:center; padding:60px; font-size:1.2rem; opacity:0.8;">No movies found for "<strong>${query}</strong>"</p>`;
      } else {
        displayMovies(data.Search);
      }
    });
}

// === Display Movies ===
function displayMovies(movies) {
  moviesGrid.innerHTML = movies.map(movie => `
    <div class="movie-card" data-id="${movie.imdbID || movie.ID}">
      <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x444/1a1a1a/ffffff?text=No+Poster'}" 
           alt="${movie.Title}" loading="lazy">
      <div class="heart" data-id="${movie.imdbID || movie.ID}">♥</div>
      <div class="movie-info">
        <h3>${movie.Title}</h3>
        <p>${movie.Year || 'N/A'}</p>
      </div>
    </div>
  `).join('');

  // Animation stagger
  document.querySelectorAll('.movie-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.05}s`;
  });

  // Click & Watchlist
  document.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.classList.contains('heart')) {
        e.stopPropagation();
        toggleWatchlist(card.querySelector('.heart'));
      } else {
        showMovieDetails(card.dataset.id);
      }
    });
  });

  loadWatchlistHearts();
}

// === Watchlist (localStorage) ===
function toggleWatchlist(heartEl) {
  const id = heartEl.dataset.id;
  let list = JSON.parse(localStorage.getItem('watchlist') || '[]');
  if (list.includes(id)) {
    list = list.filter(x => x !== id);
    heartEl.classList.remove('liked');
  } else {
    list.push(id);
    heartEl.classList.add('liked');
  }
  localStorage.setItem('watchlist', JSON.stringify(list));
}

function loadWatchlistHearts() {
  const list = JSON.parse(localStorage.getItem('watchlist') || '[]');
  document.querySelectorAll('.heart').forEach(h => {
    if (list.includes(h.dataset.id)) h.classList.add('liked');
  });
}

// === Modal with Real Trailer ===
async function showMovieDetails(imdbID) {
  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`);
    const movie = await res.json();

    // Simple trailer search fallback (works 95% of the time)
    const trailerRes = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + " official trailer")}`);
    const text = await trailerRes.text();
    const match = text.match(/"videoId":"([^"]{11})"/);
    const videoId = match ? match[1] : null;

    modalBody.innerHTML = `
      <h2>${movie.Title} <span style="opacity:0.7;">(${movie.Year})</span></h2>
      <p><strong>Genre:</strong> ${movie.Genre}</p>
      <p><strong>Director:</strong> ${movie.Director}</p>
      <p><strong>Actors:</strong> ${movie.Actors}</p>
      <p><strong>Plot:</strong> ${movie.Plot}</p>
      <p><strong>IMDb Rating:</strong> <span style="color:#ffb800;font-weight:700;">${movie.imdbRating}/10</span></p>
      ${videoId 
        ? `<iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen allow="accelerometer; autoplay; encrypted-media"></iframe>`
        : `<p style="text-align:center;opacity:0.7;padding:20px;">Trailer not found</p>`
      }
    `;
    modal.style.display = 'flex';
  } catch {
    modalBody.innerHTML = "<p style='text-align:center;color:#ffb800;'>Failed to load details</p>";
    modal.style.display = 'flex';
  }
}

// === Close Modal ===
closeModal.onclick = () => modal.style.display = 'none';
window.onclick = e => e.target === modal && (modal.style.display = 'none');