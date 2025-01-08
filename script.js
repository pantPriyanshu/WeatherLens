// Select UI elements
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessButton = document.querySelector("[data-grantAccess]");
const searchInput = document.querySelector("[data-searchInput]");

// Initial variables
let oldTab = userTab;
const API_KEY = "355c13dc1f260d2cfe8845dc39ab28fe";

oldTab.classList.add("current-tab");
initializeWeatherInfo();

function switchTab(newTab) {
    if (newTab !== oldTab) {
        oldTab.classList.remove("current-tab");
        newTab.classList.add("current-tab");
        oldTab = newTab;

        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            initializeWeatherInfo();
        }
    }
}

userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

grantAccessButton.addEventListener("click", getLocation);
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cityName = searchInput.value.trim();
    if (cityName) fetchWeatherByCity(cityName);
});

function initializeWeatherInfo() {
    const storedCoordinates = sessionStorage.getItem("user-coordinates");
    if (storedCoordinates) {
        const coordinates = JSON.parse(storedCoordinates);
        fetchWeatherByCoordinates(coordinates);
    } else {
        grantAccessContainer.classList.add("active");
    }
}

async function fetchWeatherByCoordinates({ lat, lon }) {
    toggleLoadingScreen(true);
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        updateUIWithWeatherInfo(data);
    } catch (error) {
        console.error("Failed to fetch weather data.", error);
    } finally {
        toggleLoadingScreen(false);
    }
}

async function fetchWeatherByCity(city) {
    toggleLoadingScreen(true);
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        updateUIWithWeatherInfo(data);
    } catch (error) {
        console.error("Failed to fetch weather data.", error);
    } finally {
        toggleLoadingScreen(false);
    }
}

function updateUIWithWeatherInfo(data) {
    if (data.cod !== 200) {
        alert("Weather data not found.");
        return;
    }

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = data.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data.sys.country.toLowerCase()}.png`;
    desc.innerText = data.weather[0].description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    temp.innerText = `${data.main.temp} °C`;
    windspeed.innerText = `${data.wind.speed} m/s`;
    humidity.innerText = `${data.main.humidity}%`;
    cloudiness.innerText = `${data.clouds.all}%`;

    userInfoContainer.classList.add("active");
}

function toggleLoadingScreen(isLoading) {
    if (isLoading) {
        loadingScreen.classList.add("active");
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
    } else {
        loadingScreen.classList.remove("active");
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const coordinates = {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
            };
            sessionStorage.setItem("user-coordinates", JSON.stringify(coordinates));
            fetchWeatherByCoordinates(coordinates);
        }, () => {
            alert("Failed to access location.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}
