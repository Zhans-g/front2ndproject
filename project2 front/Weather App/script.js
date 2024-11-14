const apiKey = '4ebc8df59598570103b9b53fc07866aa';

function displayCurrentWeather(data) {   //бугынгы прогноз
    const currentWeather = document.getElementById('current-weather');
    const { temp } = data.main;
    const { description, icon } = data.weather[0];
    currentWeather.innerHTML = `
        <h2>Current Weather in ${data.name}</h2>
        <p>Temperature: ${temp}°C</p>
        <p>Condition: ${description}</p>
        <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon"> 
    `;
}

function display5DayForecast(data) {  //келесы бес куннын прогнозын корсетеды
    const forecastWeather = document.getElementById('forecast-weather');
    forecastWeather.innerHTML = '<h2>5-Day Forecast</h2>';
    const currentDate = new Date().getDate(); //бугынгы кун
    const dailyForecasts = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt);
        return forecastDate.getDate() !== currentDate && forecastDate.getHours() === 12;   //ертенгы кун
    });

    dailyForecasts.slice(0, 5).forEach(forecast => {   //ертенгы куннен бастап 5дневный прогноз
        const { temp } = forecast.main;
        const { description, icon } = forecast.weather[0];
        const date = new Date(forecast.dt_txt).toLocaleDateString();
        forecastWeather.innerHTML += `
            <div class="forecast-item">
                <p>${date}</p>
                <p>Temperature: ${temp}°C</p>
                <p>Condition: ${description}</p>
                <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon">
            </div>
        `;
    });
}

function fetchWeatherForCity(city) {  //по названию города поиск
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => displayCurrentWeather(data))
        .catch(error => console.error('Error fetching current weather:', error));
    
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => display5DayForecast(data))
        .catch(error => console.error('Error fetching 5-day forecast:', error));
}

function getWeatherByGeolocation() {   //местоположение бойынша карайды
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`)
                .then(response => response.json())
                .then(data => displayCurrentWeather(data))
                .catch(error => console.error('Error fetching weather by location:', error));
            
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`)
                .then(response => response.json())
                .then(data => display5DayForecast(data))
                .catch(error => console.error('Error fetching forecast by location:', error));
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

document.getElementById('search-button').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    fetchWeatherForCity(city);
});

document.getElementById('geolocation-button').addEventListener('click', getWeatherByGeolocation);
fetchWeatherForCity("Almaty");   //ашылган кезде Алматыны корсетып турады

const cityInput = document.getElementById('city-input');   
const suggestions = document.getElementById('suggestions');
cityInput.addEventListener('input', () => {
    const query = cityInput.value;
    if (query.length > 2) {   //минимум 3 арып болу керек
        fetchCitySuggestions(query);
    }
});

async function fetchCitySuggestions(query) {   //подсказка поиска городов
    try {
        const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=4ebc8df59598570103b9b53fc07866aa`);
        const cities = await response.json();
        suggestions.innerHTML = '';
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = `${city.name}, ${city.country}`;
            suggestions.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
    }
}
