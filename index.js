const cityInput = document.getElementById("city");
const provinceInput = document.getElementById("province");
const countryInput = document.getElementById("country");

const button = document.getElementById("getWeather");
const weather = document.getElementById("weatherResult");
const errorMessage = document.getElementById("errorMessage");

async function getWeather() {
  button.disabled = true;
  weather.textContent = "Loading weather...";
  errorMessage.textContent = "";

  const city = cityInput.value.trim();
  const province = provinceInput.value.trim();
  const country = countryInput.value.trim();

  if (!city || !province || !country) {
    errorMessage.textContent = "Please fill in all fields.";
    weather.textContent = "";
    button.disabled = false;
    return;
  }

  try {
    const geoURL =
      "https://geocoding-api.open-meteo.com/v1/search" +
      "?name=" +
      encodeURIComponent(city) +
      "&count=10&language=en&format=json";

    const geoResponse = await fetch(geoURL);

    if (!geoResponse.ok) {
      throw new Error("Could not find location.");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results) {
      throw new Error("Location not found. Please check your information.");
    }

    const location = geoData.results.find(
      (result) =>
        result.name.toLowerCase() === city.toLowerCase() &&
        result.admin1?.toLowerCase() === province.toLowerCase() &&
        result.country.toLowerCase() === country.toLowerCase(),
    );

    if (!location) {
      throw new Error("City, province or country does not match.");
    }

    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" +
      location.latitude +
      "&longitude=" +
      location.longitude +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m" +
      "&timezone=auto";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Could not get weather.");
    }

    const data = await response.json();
    const current = data.current;

    const temperature = current.temperature_2m;
    const feelsLike = current.apparent_temperature;
    const humidity = current.relative_humidity_2m;
    const wind = current.wind_speed_10m;

    weather.textContent =
      "Location: " +
      location.name +
      ", " +
      location.admin1 +
      ", " +
      location.country +
      "\n" +
      "Temperature: " +
      temperature +
      "°C\n" +
      "Feels like: " +
      feelsLike +
      "°C\n" +
      "Humidity: " +
      humidity +
      "%\n" +
      "Wind: " +
      wind +
      " km/h";

    errorMessage.textContent = "";
  } catch (error) {
    weather.textContent = "";
    errorMessage.textContent =
      "Sorry! Unable to load weather. Please check your location and try again.";

    console.error(error);
  } finally {
    button.disabled = false;
  }
}

button.addEventListener("click", getWeather);
