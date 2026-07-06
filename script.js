const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");

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

resetUI();

weatherIcon.onerror = () => {
  weatherIcon.src = "./assets/icons/weather.png";
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
      alert(data.message);
      return;
    }

    updateUI(data);
  } catch (error) {
    console.error(error);
    resetUI();
    alert(
      "Something went wrong. Please check your internet connection and try again.",
    );
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

  weatherIcon.src = `./assets/icons/${iconCode}.png`;
}

async function searchCity() {
  const city = searchInput.value.trim();

  if (city === "") {
    alert("Please enter a city name.");
    return;
  }

  if (isLoading) return;

  isLoading = true;

  searchBtn.disabled = true;
  searchBtn.textContent = "Loading...";

  try {
    await fetchWeather(city);
  } finally {
    isLoading = false;

    searchBtn.disabled = false;
    searchBtn.textContent = "Search";

    searchInput.value = "";
    searchInput.focus();
  }
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
}

searchBtn.addEventListener("click", searchCity);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !isLoading) {
    searchCity();
  }
});
