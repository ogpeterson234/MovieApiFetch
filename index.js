   const apiKey = 'e745e7d9'; // Your OMDb API key
    const searchBtn = document.getElementById('searchBtn');
    const movieInput = document.getElementById('movieInput');
    const moviesGrid = document.getElementById('moviesGrid');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    // Default movies overview
    const featuredMovies = [
      "Inception",
      "Avengers: Endgame",
      "Joker",
      "Interstellar",
      "The Dark Knight",
      "Black Panther",
      "Parasite",
      "Titanic",
      "The Matrix"
    ];

    // Load featured movies on page load
    window.addEventListener('DOMContentLoaded', () => {
      loadFeaturedMovies();
    });

    function loadFeaturedMovies() {
      moviesGrid.innerHTML = "<p style='text-align:center;'>Loading featured movies...</p>";
      Promise.all(
        featuredMovies.map(title =>
          fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`)
            .then(res => res.json())
        )
      ).then(results => {
        const validMovies = results.filter(movie => movie.Response !== "False");
        displayMovies(validMovies);
      });
    }

    // Search movies
    searchBtn.addEventListener('click', () => {
      const title = movieInput.value.trim();
      if (!title) return alert('Enter a movie title');

      fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${apiKey}`)
        .then(res => res.json())
        .then(data => {
          if (data.Response === "False") {
            moviesGrid.innerHTML = "<p style='text-align:center;'>No movies found.</p>";
            return;
          }
          displayMovies(data.Search);
        });
    });

    // Display movie cards
    function displayMovies(movies) {
      moviesGrid.innerHTML = movies.map(movie => `
        <div class="movie-card" data-id="${movie.imdbID}">
          <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x270'}" alt="${movie.Title}">
          <div class="movie-info">
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
          </div>
        </div>
      `).join('');

      // Add click events for modal
      document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => showMovieDetails(card.dataset.id));
      });
    }

    // Show movie details in modal
    function showMovieDetails(imdbID) {
      fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`)
        .then(res => res.json())
        .then(movie => {
          modalBody.innerHTML = `
            <h2>${movie.Title} (${movie.Year})</h2>
            <p><strong>Genre:</strong> ${movie.Genre}</p>
            <p><strong>Director:</strong> ${movie.Director}</p>
            <p><strong>Actors:</strong> ${movie.Actors}</p>
            <p><strong>Plot:</strong> ${movie.Plot}</p>
            <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
            <iframe src="https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(movie.Title + ' trailer')}" allowfullscreen></iframe>
          `;
          modal.style.display = 'block';
        });
    }

    // Close modal
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });