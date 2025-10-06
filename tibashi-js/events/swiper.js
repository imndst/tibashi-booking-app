let tibashiSlides = [];
let tibashiCurrentIndex = 0;
let autoplayTimeout;
import { fetchSlides } from '../../utils.js';
import { BASE_URL } from '../../utils.js';

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
     if (!tibashiSlides.length) return;

     tibashiSlides.forEach((slide, idx) => {
      const div = document.createElement('div');
      div.classList.add('tibashi-slide');
      if (idx === 0) div.classList.add('active');
      div.dataset.id = slide.id;
      div.innerHTML = `
        <img src="${BASE_URL}/${slide.imgDesk}" alt="Slide ${idx + 1}">
        <div class="tibashi-slide-name">Slide ${idx + 1}</div>
      `;
      wrapper.appendChild(div);
    });

    prevButton.addEventListener('click', () => {
      clearTimeout(autoplayTimeout);
      slideLeftManual();
      startAutoplay();
    });

    startAutoplay();
  } catch (err) {
    console.error(err);
  }
}

function slideLeft() {
  const slides = document.querySelectorAll('.tibashi-slide');
  if (!slides.length) return;
  const currentSlide = slides[tibashiCurrentIndex];
  if (!currentSlide) return;

  const nextIndex = (tibashiCurrentIndex + 1) % slides.length;
  const nextSlide = slides[nextIndex];
  if (!nextSlide) return;

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
  }, 500);
}

function slideLeftManual() {
  const slides = document.querySelectorAll('.tibashi-slide');
  if (!slides.length) return;
  const currentSlide = slides[tibashiCurrentIndex];
  if (!currentSlide) return;

  const nextIndex = (tibashiCurrentIndex + 1) % slides.length;
  const nextSlide = slides[nextIndex];
  if (!nextSlide) return;

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
  }, 100);
}

function startAutoplay() {
  autoplayTimeout = setTimeout(() => {
    slideLeft();
    startAutoplay();
  }, 4000);
}
