import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Swiper from 'swiper';
import 'swiper/css';

// Basis setup voor Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('threejs-container').appendChild(renderer.domElement);

camera.position.set(0, 0, 10);

// Voeg belichting toe
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(ambientLight, directionalLight);

// Voeg OrbitControls toe
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// Textuur laden en aarde maken
const textureLoader = new THREE.TextureLoader();
textureLoader.load('images/2k_earth_daymap.jpg', (texture) => {
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const geometry = new THREE.SphereGeometry(5, 64, 64);
  const earth = new THREE.Mesh(geometry, material);
  scene.add(earth);

  // Voeg steden toe met sprites en markers
  addCityMarkers(earth);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
});

async function getWeatherData(city) {
  const apiKey = '2a6b6d53be7d7b14c3cf1da5900016db'; // Vervang dit door je eigen API-sleutel
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.main.temp; // Retourneer de temperatuur
  } catch (error) {
    console.error('Fout bij het ophalen van weersgegevens:', error);
    return null;
  }
}

async function addCityMarkers(earth) {
  const cities = [
    { name: 'Ghana', lat: 7.9465, lon: -1.0232 },
    { name: 'Brussel', lat: 50.8503, lon: 4.3517 },
    { name: 'Moscow', lat: 55.7558, lon: 37.6176 },
    { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  ];

  for (const city of cities) {
    const radius = 5;
    const phi = (90 - city.lat) * (Math.PI / 180);
    const theta = (city.lon + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    // Rode bolletjes-marker toevoegen
    const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x * 1.01, y * 1.01, z * 1.01);
    earth.add(marker);

    // Actuele temperatuur ophalen
    const temp = await getWeatherData(city.name);

    if (temp !== null) {
      // Temperatuur afronden
      const roundedTemp = Math.round(temp);

      // Maak tekst met sprites
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = '20px Arial';
      context.fillStyle = 'white';
      context.fillText(`${city.name} - ${roundedTemp}°C`, 0, 20);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x * 1.05, y * 1.05, z * 1.05);
      earth.add(sprite);
    }
  }
}

// Responsief maken
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Swiper initialiseren
const swiper = new Swiper('.swiper-container', {
  pagination: {
    el: '.swiper-pagination',
  },
});