let tibashiSlides = [];
let tibashiCurrentIndex = 0;
let autoplayTimeout;
import { fetchSlides } from './utils/api.js';
import { BASE_URL } from './utils/constants.js';
export async function initTibashiSlider() {
  const container = document.getElementById('swiperContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="tibashi-slider-wrapper">
      <button class="tibashi-slider-prev">&#10094;</button>
    </div>
  `;
  const wrapper = container.querySelector('.tibashi-slider-wrapper');
  const prevButton = container.querySelector('.tibashi-slider-prev');

  try {
     tibashiSlides = await fetchSlides();
     tibashiSlides.forEach((slide, idx) => {
      const div = document.createElement('div');
      div.classList.add('tibashi-slide');
      if (idx === 0) div.classList.add('active');
      div.dataset.id = slide.id;
      div.innerHTML = `
        <img src="${BASE_URL}/${slide.imgDesk}" alt="Slide ${idx + 1}">
        <div class="tibashi-slide-name">Slide ${idx + 1}</div>
      `;
      div.addEventListener('click', () => openSlideModal(slide.id));
      wrapper.appendChild(div);
    });

    prevButton.addEventListener('click', () => {
      clearTimeout(autoplayTimeout);
      slideLeftX();
      startAutoplayX();
    });

    startAutoplay();
  } catch (err) {
    console.error(err);
  }
}
function slideLeft() {
  const slides = document.querySelectorAll('.tibashi-slide');
  const total = tibashiSlides.length;
  if (!total) return;
  const currentSlide = slides[tibashiCurrentIndex];
  const nextIndex = (tibashiCurrentIndex + 1) % total;
  const nextSlide = slides[nextIndex];
  currentSlide.classList.remove('active');
  currentSlide.classList.add('prev');
  nextSlide.classList.add('active');
  nextSlide.style.left = '100%';
  requestAnimationFrame(() => {
    nextSlide.style.transform = 'translateX(-100%)';
  });

  setTimeout(() => {
    currentSlide.classList.remove('prev');
    currentSlide.style.left = '100%';
    currentSlide.style.transform = 'translateX(0)';
    nextSlide.style.transform = 'translateX(0)';
    tibashiCurrentIndex = nextIndex;
  }, 2000); 
}

function slideLeftX() {
  const slides = document.querySelectorAll('.tibashi-slide');
  const total = tibashiSlides.length;
  if (!total) return;

  const currentSlide = slides[tibashiCurrentIndex];
  const nextIndex = (tibashiCurrentIndex + 1) % total;
  const nextSlide = slides[nextIndex];

  currentSlide.classList.remove('active');
  currentSlide.classList.add('prev');

  nextSlide.classList.add('active');
  nextSlide.style.left = '100%';
  requestAnimationFrame(() => {
    nextSlide.style.transform = 'translateX(-100%)';
  });

  setTimeout(() => {
    currentSlide.classList.remove('prev');
    currentSlide.style.left = '100%';
    currentSlide.style.transform = 'translateX(0)';
    nextSlide.style.transform = 'translateX(0)';
    tibashiCurrentIndex = nextIndex;
  }, 100); // keep original fast timing for manual click
}

function startAutoplay() {
  autoplayTimeout = setTimeout(() => {
    slideLeft();
    startAutoplay();
  }, 4000);
}

function startAutoplayX() {
  autoplayTimeout = setTimeout(() => {
    slideLeft();
    startAutoplay();
  }, 300);
}

function openSlideModal(id) {
  const slide = tibashiSlides.find(s => s.id == id);
  if (!slide) return;

  const modal = document.getElementById('eventModal');
  const body = document.getElementById('eventBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <img src="${BASE_URL}${slide.imgDesk}" class="tibashi-modal-img">
    <div class="tibashi-modal-info">
      <h2 class="tibashi-modal-title">Slide ${tibashiSlides.indexOf(slide) + 1}</h2>
    </div>
  `;
  modal.style.display = 'flex';
}
