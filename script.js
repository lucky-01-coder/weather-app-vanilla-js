const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");

const cityName = document.querySelectorAll(".city-name");
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

function searchCity() {
  const city = searchInput.value.trim();

  if (city === "") {
    console.error("Please enter a city name.");
    return;
  }

  console.log(city.toUpperCase());
}

searchBtn.addEventListener("click", searchCity);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchCity();
  }
});
