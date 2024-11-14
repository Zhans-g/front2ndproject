const apiKey = '4d67f9c757c24bc497d14c8331966fab';

document.getElementById('search-btn').addEventListener('click', fetchRecipes);

function fetchRecipes() {  //отправляет запрос к апи 
    const query = document.getElementById('search-input').value;
    fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=9&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => displayRecipes(data.results))
        .catch(error => console.error('Error fetching recipes:', error));
}

function displayRecipes(recipes) {  //отображает рецепты полученнный от апи
    const grid = document.getElementById('recipe-grid');
    grid.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.innerHTML = `
            <img src="https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <button class="favorite-btn" onclick="toggleFavorite(${recipe.id}, '${recipe.title}')">⭐</button>
        `;
        recipeCard.addEventListener('click', () => fetchRecipeDetails(recipe.id));
        grid.appendChild(recipeCard);
    });
}

function fetchRecipeDetails(id) {      //получает подробный инфу от апи
    fetch(`https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => displayRecipeDetails(data))
        .catch(error => console.error('Error fetching recipe details:', error));
}

function displayRecipeDetails(recipe) {    //показывает инфу полученный от апи
    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('recipe-image').src = recipe.image;

    const cleanDescription = recipe.summary.replace(/<\/?[^>]+(>|$)/g, "");
    document.getElementById('recipe-description').textContent = cleanDescription;

    document.getElementById('nutrition-info').innerHTML = `
        <p>Calories: ${recipe.nutrition.nutrients[0].amount} kcal</p>
        <p>Protein: ${recipe.nutrition.nutrients[1].amount} g</p>
        <p>Fat: ${recipe.nutrition.nutrients[2].amount} g</p>
    `;

    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = '';
    recipe.extendedIngredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = `${ingredient.original}`;
        ingredientsList.appendChild(li);
    });

    const instructionsList = document.getElementById('instructions-list');
    instructionsList.innerHTML = '';
    recipe.analyzedInstructions[0]?.steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step.step;
        instructionsList.appendChild(li);
    });

    document.getElementById('modal').style.display = 'block';
}

document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});

function toggleFavorite(id, title) {   //избранное
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const index = favorites.findIndex(fav => fav.id === id);
    if (index === -1) {
        favorites.push({ id, title });
        alert(`${title} added to favorites!`); //добавление в избранное
    } else {
        favorites.splice(index, 1);
        alert(`${title} removed from favorites.`);//удаление из избранного
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

document.getElementById('favorites-btn').addEventListener('click', showFavorites);

function showFavorites() {    //показывает избранные рецепты
    const favoritesGrid = document.getElementById('favorites-grid');
    const recipeGrid = document.getElementById('recipe-grid');

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (favorites.length === 0) {
        favoritesGrid.innerHTML = '<p>No favorites yet!</p>';
    } else {
        favoritesGrid.innerHTML = ''; 
        favorites.forEach(favorite => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            recipeCard.innerHTML = `
                <h3>${favorite.title}</h3>
                <button onclick="fetchRecipeDetails(${favorite.id})">View</button>
            `;
            favoritesGrid.appendChild(recipeCard);
        });
    }

    favoritesGrid.style.display = 'block';
    recipeGrid.style.display = 'none';
}
