import './style.css';
import './reset.css';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { apiKey } from './secret.js';

const cities = [
  { name: "Ghana", image: "images/img1.jpg" },
  { name: "Brussel", image: "images/img2.jpg" },
  { name: "Moscow", image: "images/img3.jpg" },
  { name: "Tokyo", image: "images/img4.jpg" },
  { name: "Sydney", image: "images/img5.jpg" } // TEST
];

const swiper = new Swiper('.swiper', {
  modules: [Navigation, Pagination],
  direction: 'horizontal',
  loop: true,
  slidesPerView: 3, // Toon 5 afbeeldingen tegelijk
  centeredSlides: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});



async function getCoordinates(cityName) {
  const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
  try {
    const response = await fetch(geocodingUrl);
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    const data = await response.json();
    if (data.length === 0) {
      throw new Error(`No coordinates found for ${cityName}`);
    }
    return { lat: data[0].lat, lon: data[0].lon };
  } catch (error) {
    console.error("Error getting coordinates:", error);
    return null;
  }
}

async function getWeatherData(lat, lon) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting weather data:", error);
    return null;
  }
}

async function displayWeather(city, index) {
  const slide = document.querySelectorAll('.swiper-slide')[index];
  const temperatureSpan = slide.querySelector('.temperature');
  const loader = slide.querySelector('.loader');

  try {
    const coordinates = await getCoordinates(city.name);
    if (coordinates) {
      const weatherData = await getWeatherData(coordinates.lat, coordinates.lon);
      if (weatherData) {
        temperatureSpan.textContent = `${Math.round(weatherData.main.temp)}°C`;
        loader.style.display = 'none';
      } else {
        temperatureSpan.textContent = "Error getting weather";
        loader.style.display = 'none';
      }
    } else {
      temperatureSpan.textContent = "Error getting location";
      loader.style.display = 'none';
    }
  } catch (error) {
    console.error("Error in displayWeather:", error);
    temperatureSpan.textContent = "Error";
    loader.style.display = 'none';
  }
 
}


cities.forEach((city, index) => {
  displayWeather(city, index);
});