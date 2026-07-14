const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const locationBtn = document.querySelector("#location-btn");

const cityNames = document.querySelectorAll(".city-name");
const tempDisplay = document.querySelector("#temp-display");
const weatherCond = document.querySelector("#weather-cond");
const weatherIcon = document.querySelector("#weather-icon");
const dayDate = document.querySelector("#day-date");
const feelLike = document.querySelector("#feel-like");

const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#wind-speed");
const visibility = document.querySelector("#visibility");
const pressure = document.querySelector("#pressure");

const sunrise = document.querySelector("#sun-rise");
const sunset = document.querySelector("#sun-set");

const toastArea = document.querySelector("#toast");

const API_KEY = "c58bc56b08a9b09689154cb47412e873";

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

const weatherBackgrounds = {
  "01d": "sunny-day",
  "01n": "clear-night",

  "02d": "few-clouds",
  "02n": "few-clouds",

  "03d": "scattered-clouds",
  "03n": "scattered-clouds",

  "04d": "broken-clouds",
  "04n": "broken-clouds",

  "09d": "shower-rain",
  "09n": "shower-rain",

  "10d": "rain",
  "10n": "rain",

  "11d": "thunder",
  "11n": "thunder",

  "13d": "snow",
  "13n": "snow",

  "50d": "mist",
  "50n": "mist",
};

resetUI();

weatherIcon.onerror = () => {
  weatherIcon.src = "./assets/icons/weather.png";
  weatherIcon.classList.remove("icon-hidden");
};

let isLoading = false;

async function fetchWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Request Failed");
    }

    const data = await response.json();
    if (Number(data.cod) !== 200) {
      resetUI();
      showToast(data.message);
      return;
    }
    console.log(data);

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
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Request Failed");
    }

    const data = await response.json();

    updateUI(data);
  } catch (error) {
    console.error(error);
    resetUI();
    showToast("Unable to fetch weather for your location.");
  }
}

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

function updateUI(data) {
  const timezone = data.timezone;

  //Sunrise time
  sunrise.textContent = formatTime(data.sys.sunrise, timezone);

  //Sunset time & displaying on UI
  sunset.textContent = formatTime(data.sys.sunset, timezone);

  //City Display
  cityNames.forEach((city) => {
    city.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${data.name}`;
  });

  //Temperature Display
  tempDisplay.textContent = `${Math.round(data.main.temp)}°C`;

  //Weather cond. display
  weatherCond.textContent = capitalize(data.weather[0].description);

  //feels like display
  feelLike.textContent = `Feels Like ${Math.round(data.main.feels_like)}°C`;

  //humidity display
  humidity.textContent = `${data.main.humidity}%`;

  //windspeed
  windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;

  //visibility
  visibility.textContent = `${Math.round(data.visibility / 1000)} km`;

  //pressure
  pressure.textContent = `${data.main.pressure} hPa`;

  //date & day display
  dayDate.textContent = formatDate(data.dt, timezone);

  //Weather icon update
  const iconCode = data.weather[0].icon;

  //hide current icon
  weatherIcon.classList.add("icon-hidden");

  //change icon after small delay
  setTimeout(() => {
    weatherIcon.src = `./assets/icons/${iconCode}.png`;
  }, 180);

  //show new icon after image loads
  weatherIcon.onload = () => {
    weatherIcon.classList.remove("icon-hidden");
  };

  //background change
  document.body.className = "";

  const bgClass = weatherBackgrounds[iconCode];

  if (bgClass) {
    document.body.classList.add(bgClass);
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

  searchBtn.disabled = true;
  searchBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

  try {
    await fetchWeather(city);
  } finally {
    isLoading = false;

    searchBtn.disabled = false;
    searchBtn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i>`;

    searchInput.value = "";
    searchInput.focus();
  }
}

function getCurrentLocation() {
  if (isLoading) return;

  isLoading = true;

  locationBtn.disabled = true;

  if (!navigator.geolocation) {
    isLoading = false;
    locationBtn.disabled = false;
    showToast("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      fetchWeatherByCoords(latitude, longitude).finally(() => {
        isLoading = false;
        locationBtn.disabled = false;
      });
    },
    () => {
      isLoading = false;
      locationBtn.disabled = false;
      showToast("Unable to access your location.");
    },
  );
}

function resetUI() {
  tempDisplay.textContent = "Search a city";
  weatherCond.textContent = "";
  cityNames.forEach((city) => {
    city.innerHTML = "";
  });
  dayDate.textContent = "";
  feelLike.textContent = "";
  humidity.textContent = "";
  windSpeed.textContent = "";
  visibility.textContent = "";
  pressure.textContent = "";
  sunrise.textContent = "";
  sunset.textContent = "";
  weatherIcon.src = `./assets/icons/weather.png`;
  weatherIcon.classList.remove("icon-hidden");
  document.body.className = "";
  document.body.classList.add("shower-rain");
}

let toastTimer;

function showToast(message) {
  toastArea.textContent = message;

  toastArea.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toastArea.classList.remove("show");
  }, 3000);
}

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
