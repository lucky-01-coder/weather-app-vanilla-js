//DOM Elements
const weatherCard = document.querySelector("#weather-card");
const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const locationBtn = document.querySelector("#location-btn");
const weatherEffects = document.querySelector("#weather-effects");
const header = document.querySelector("header");

const cityNames = document.querySelectorAll(".city-name");
const tempDisplay = document.querySelector("#temp-display");
const weatherCond = document.querySelector("#weather-cond");
const weatherIcon = document.querySelector("#weather-icon");
const dayDate = document.querySelector("#day-date");
const lastUpdated = document.querySelector("#last-updated");
const feelLike = document.querySelector("#feel-like");

const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#wind-speed");
const visibility = document.querySelector("#visibility");
const pressure = document.querySelector("#pressure");

const sunrise = document.querySelector("#sun-rise");
const sunset = document.querySelector("#sun-set");

const toastArea = document.querySelector("#toast");

//Constants
const API_KEY = CONFIG.API_KEY;

const ICON_CHANGE_DELAY = 180;

const DEFAULT_RAIN_DROPS = 120;

const CLOUD_TOP_OFFSET = 20;
const CLOUD_RANDOM_TOP = 150;

const CLOUD_START_LEFT = -250;
const CLOUD_RANDOM_LEFT = 400;

const CLOUD_MIN_DURATION = 25;
const CLOUD_RANDOM_DURATION = 15;

const CLOUD_MAX_DELAY = 5;

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

//Data Configuration
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const weatherConfig = {
  "01d": { background: "sunny-day", clouds: 0, rain: false },
  "01n": { background: "clear-night", clouds: 0, rain: false },

  "02d": { background: "few-clouds", clouds: 2, rain: false },
  "02n": { background: "few-clouds", clouds: 2, rain: false },

  "03d": { background: "scattered-clouds", clouds: 3, rain: false },
  "03n": { background: "scattered-clouds", clouds: 3, rain: false },

  "04d": { background: "broken-clouds", clouds: 4, rain: false },
  "04n": { background: "broken-clouds", clouds: 4, rain: false },

  "09d": { background: "shower-rain", clouds: 4, rain: true },
  "09n": { background: "shower-rain", clouds: 4, rain: true },

  "10d": { background: "rain", clouds: 4, rain: true },
  "10n": { background: "rain", clouds: 4, rain: true },

  "11d": { background: "thunder", clouds: 4, rain: true },
  "11n": { background: "thunder", clouds: 4, rain: true },

  "13d": { background: "snow", clouds: 3, rain: false },
  "13n": { background: "snow", clouds: 3, rain: false },

  "50d": { background: "mist", clouds: 2, rain: false },
  "50n": { background: "mist", clouds: 2, rain: false },
};

//UI Constants
const resetElements = [
  weatherCond,
  dayDate,
  feelLike,
  humidity,
  windSpeed,
  visibility,
  pressure,
  sunrise,
  sunset,
];

//Global Variables
let isLoading = false;
let toastTimer;

//Initial Setup
weatherIcon.onerror = () => {
  weatherIcon.src = "./assets/icons/weather.png";
  weatherIcon.classList.remove("icon-hidden");
};

weatherIcon.addEventListener("load", () => {
  weatherIcon.classList.remove("icon-hidden");
});

resetUI();

//Utility Functions
function formatTime(timestamp, timezone) {
  const time = new Date((timestamp + timezone) * 1000);

  const hour = time.getUTCHours();
  const minute = String(time.getUTCMinutes()).padStart(2, "0");

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${String(hour12).padStart(2, "0")}:${minute} ${suffix}`;
}

function formatDate(timestamp, timezone) {
  const currentDate = new Date((timestamp + timezone) * 1000);

  const date = currentDate.getUTCDate();
  const year = currentDate.getUTCFullYear();

  const month = months[currentDate.getUTCMonth()];
  const day = days[currentDate.getUTCDay()];

  return `${date} ${month} ${year}, ${day}`;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

//API Functions
function getCityWeatherURL(city) {
  return `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
}

function getCoordsWeatherURL(lat, lon) {
  return `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
}

async function getWeatherData(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Request Failed");
  }

  return await response.json();
}

//UI Functions
function updateWeatherInfo(data) {
  const timezone = data.timezone;

  sunrise.textContent = formatTime(data.sys.sunrise, timezone);
  sunset.textContent = formatTime(data.sys.sunset, timezone);

  cityNames.forEach((city) => {
    city.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${data.name}`;
  });

  tempDisplay.textContent = `${Math.round(data.main.temp)}°C`;
  weatherCond.textContent = capitalize(data.weather[0].description);
  feelLike.textContent = `Feels Like ${Math.round(data.main.feels_like)}°C`;

  humidity.textContent = `${data.main.humidity}%`;
  windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  visibility.textContent = `${Math.round(data.visibility / 1000)} km`;
  pressure.textContent = `${data.main.pressure} hPa`;

  dayDate.textContent = formatDate(data.dt, timezone);

  lastUpdated.textContent = `Updated: ${new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
}

function updateWeatherEffects(iconCode) {
  clearWeatherEffects();

  const config = weatherConfig[iconCode];

  if (!config) return;

  for (let i = 0; i < config.clouds; i++) {
    createCloud();
  }

  if (config.rain) {
    createRain();
  }
}

function updateWeatherIcon(iconCode) {
  weatherIcon.classList.add("icon-hidden");

  setTimeout(() => {
    weatherIcon.src = `./assets/icons/${iconCode}.png`;
  }, ICON_CHANGE_DELAY);
}

function updateBackground(iconCode) {
  document.body.className = "";

  const background = weatherConfig[iconCode]?.background;

  if (background) {
    document.body.classList.add(background);
  }
}

function updateUI(data) {
  weatherCard.classList.remove("weather-update");
  void weatherCard.offsetWidth;
  weatherCard.classList.add("weather-update");

  const iconCode = data.weather[0].icon;

  updateWeatherInfo(data);
  updateWeatherEffects(iconCode);
  updateWeatherIcon(iconCode);
  updateBackground(iconCode);
}

function setSearchLoading(state) {
  searchBtn.disabled = state;

  searchBtn.innerHTML = state
    ? `<i class="fa-solid fa-spinner fa-spin"></i>`
    : `<i class="fa-solid fa-magnifying-glass"></i>`;
}

function setLocationLoading(state) {
  locationBtn.disabled = state;

  locationBtn.innerHTML = state
    ? `<i class="fa-solid fa-spinner fa-spin"></i>`
    : `<i class="fa-solid fa-location-crosshairs"></i>`;
}

function resetUI() {
  tempDisplay.textContent = "Search a city";
  cityNames.forEach((city) => {
    city.innerHTML = "";
  });
  resetElements.forEach((element) => {
    element.textContent = "";
  });
  weatherIcon.src = `./assets/icons/weather.png`;
  weatherIcon.classList.remove("icon-hidden");
  document.body.className = "";
  document.body.classList.add("clear-night");
}

function showToast(message) {
  toastArea.textContent = message;

  toastArea.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toastArea.classList.remove("show");
  }, 3000);
}

//Weather Effects
function createCloud() {
  const cloud = document.createElement("div");

  cloud.className = "cloud";

  // Random vertical position
  cloud.style.top = `${header.offsetHeight + CLOUD_TOP_OFFSET + Math.random() * CLOUD_RANDOM_TOP}px`;

  // Random starting position (off-screen)
  cloud.style.left = `${CLOUD_START_LEFT - Math.random() * CLOUD_RANDOM_LEFT}px`;

  // Random cloud size
  // cloud.style.transform = `scale(${0.7 + Math.random() * 0.8})`;

  // Random animation speed
  cloud.style.animationDuration = `${CLOUD_MIN_DURATION + Math.random() * CLOUD_RANDOM_DURATION}s`;

  // Random animation delay
  cloud.style.animationDelay = `${Math.random() * CLOUD_MAX_DELAY}s`;

  weatherEffects.appendChild(cloud);
}

function createRain(count = DEFAULT_RAIN_DROPS) {
  for (let i = 0; i < count; i++) {
    const drop = document.createElement("div");

    drop.className = "rain-drop";

    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDuration = `${0.6 + Math.random() * 0.5}s`;
    drop.style.animationDelay = `${Math.random() * 2}s`;
    drop.style.opacity = Math.random();

    weatherEffects.appendChild(drop);
  }
}

function clearWeatherEffects() {
  weatherEffects.innerHTML = "";
}

//Actions
async function fetchWeather(city) {
  try {
    const url = getCityWeatherURL(city);

    const data = await getWeatherData(url);

    if (Number(data.cod) !== 200) {
      resetUI();
      showToast(data.message);
      return;
    }

    localStorage.setItem("lastCity", data.name);
    updateUI(data);
  } catch (error) {
    console.error(error);
    resetUI();
    showToast(
      "Something went wrong. Please check your internet connection and try again.",
    );
  }
}

async function fetchWeatherByCoords(lat, lon) {
  try {
    const url = getCoordsWeatherURL(lat, lon);

    const data = await getWeatherData(url);

    if (Number(data.cod) !== 200) {
      resetUI();
      showToast(data.message);
      return;
    }

    updateUI(data);
  } catch (error) {
    console.error(error);
    resetUI();
    showToast("Unable to fetch weather for your location.");
  }
}

async function searchCity() {
  const city = searchInput.value.trim();

  if (city === "") {
    showToast("Please enter a city name.");
    return;
  }

  if (isLoading) return;

  isLoading = true;
  setSearchLoading(true);

  try {
    await fetchWeather(city);
  } finally {
    isLoading = false;
    setSearchLoading(false);

    searchInput.value = "";
    searchInput.focus();
  }
}

function getCurrentLocation() {
  if (isLoading) return;

  isLoading = true;
  setLocationLoading(true);

  if (!navigator.geolocation) {
    isLoading = false;
    setLocationLoading(false);
    showToast("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      fetchWeatherByCoords(latitude, longitude).finally(() => {
        isLoading = false;
        setLocationLoading(false);
      });
    },
    () => {
      isLoading = false;
      setLocationLoading(false);
      showToast("Unable to access your location.");
    },
  );
}

//Event Listeners
searchBtn.addEventListener("click", searchCity);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !isLoading) {
    searchCity();
  }
});

locationBtn.addEventListener("click", getCurrentLocation);

window.addEventListener("load", () => {
  const lastCity = localStorage.getItem("lastCity");

  if (lastCity) {
    fetchWeather(lastCity);
  } else {
    getCurrentLocation();
  }
});
