const movieGrid = document.getElementById("movie-grid");
const watchlistGrid = document.getElementById("watchlist-grid");
const modal = document.getElementById("modal");
const addToWatchlistButton = document.getElementById("add-to-watchlist");
const watchlistButton = document.getElementById("watchlist-button");
const searchInput = document.getElementById("movie-search");
const sortOptions = document.getElementById("sort-options");
const genreOptions = document.getElementById("genre-options");
const homeButton = document.getElementById("home-button");

let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

document.addEventListener("DOMContentLoaded", () => {
    loadGenres();
    loadPopularMovies();
});

async function loadPopularMovies() {    // берет популярные фильмы с апи
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=011e669ea6b680c83fca5cd0ad83f9ed&language=en-US&page=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error("Error fetching popular movies:", error);
    }
}

searchInput.addEventListener("input", () => {
    if (searchInput.value.length > 2) {
        searchMovies(searchInput.value);
    }
});

sortOptions.addEventListener("change", () => {
    if (searchInput.value.length > 0) {
        searchMovies(searchInput.value);
    } else {
        loadPopularMovies();
    }
});

watchlistButton.addEventListener("click", showWatchlist);

homeButton.addEventListener("click", () => {
    movieGrid.style.display = "flex";
    watchlistGrid.style.display = "none";
    loadPopularMovies();
});

async function searchMovies(query) {   //поисковик
    const sortBy = sortOptions.value;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=011e669ea6b680c83fca5cd0ad83f9ed&query=${query}&sort_by=${sortBy}&language=en-US&page=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

async function loadGenres() {   // берет жанры с апи для фильтра
    const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=011e669ea6b680c83fca5cd0ad83f9ed&language=en-US`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        data.genres.forEach(genre => {
            const option = document.createElement("option");
            option.value = genre.id;
            option.innerText = genre.name;
            genreOptions.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching genres:", error);
    }
}

function displayMovies(movies) {     //показывает фильмы и картинку
    movieGrid.innerHTML = "";
    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release Date: ${movie.release_date}</p>
        `;
        movieCard.addEventListener("click", () => openModal(movie));
        movieGrid.appendChild(movieCard);
    });
}

function openModal(movie) {    //открывает окно с подробной информацией 
    modal.style.display = "flex";
    document.getElementById("movie-poster").src = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
    document.getElementById("movie-title").innerText = movie.title;
    document.getElementById("movie-overview").innerText = movie.overview;
    document.getElementById("movie-details").innerText = `Rating: ${movie.vote_average}, Release Date: ${movie.release_date}`;
    const castUrl = `https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=011e669ea6b680c83fca5cd0ad83f9ed`;
    fetch(castUrl)
        .then(response => response.json())
        .then(data => {
            const castNames = data.cast.slice(0, 5).map(actor => actor.name).join(", ");
            document.getElementById("movie-cast").innerText = `Cast: ${castNames}`;
        });
    const isInWatchlist = watchlist.some(item => item.id === movie.id);
    addToWatchlistButton.innerText = isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist";
    addToWatchlistButton.onclick = () => toggleWatchlist(movie);
}

function toggleWatchlist(movie) {  // сохраняет фильмы которые ты будешь смотреть позже 
    const isInWatchlist = watchlist.some(item => item.id === movie.id);
    if (isInWatchlist) {
        watchlist = watchlist.filter(item => item.id !== movie.id);
        addToWatchlistButton.innerText = "Add to Watchlist";
    } else {
        watchlist.push(movie);
        addToWatchlistButton.innerText = "Remove from Watchlist";
    }
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

function showWatchlist() {  //показывает список желанных фильмов смотреть позже
    movieGrid.style.display = "none";
    watchlistGrid.style.display = "grid";
    watchlistGrid.innerHTML = "";
    watchlist.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>Release Date: ${movie.release_date}</p>
        `;
        movieCard.addEventListener("click", () => openModal(movie));
        watchlistGrid.appendChild(movieCard);
    });
}

document.getElementById("close-btn").addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});
