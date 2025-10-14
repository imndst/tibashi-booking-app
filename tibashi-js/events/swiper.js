import { fetchSlides, BASE_URL } from "../../utils.js";

let autoSlideTimeout;
let isAnimating = false;
let currentIndex = 0;

/**
 * Initializes the image carousel inside a given container.
 * @param {HTMLElement} container - The DOM element where the carousel should render.
 */
export async function initImageCarousel(container) {
  const slidesData = await fetchSlides();
  
  const images = slidesData || [];

  if (!images.length) {
    container.innerHTML = "<div>در حال بارگذاری تصاویر...</div>";
    return;
  }

  // Create slider structure
  container.classList.add("carousel-container");
  container.innerHTML = `
    <div class="carousel-wrapper">
      <div class="carousel-slides"></div>
      <div class="carousel-overlay">
        <h2 class="carousel-title"></h2>
        <div class="carousel-dots"></div>
      </div>
    </div>
  `;

  const slidesContainer = container.querySelector(".carousel-slides");
  const titleEl = container.querySelector(".carousel-title");
  const dotsContainer = container.querySelector(".carousel-dots");

  // Create slides and dots
  images.forEach((img, index) => {
    const slide = document.createElement("img");
    slide.src = img.imgDesk.startsWith("http") ? img.imgDesk : `${BASE_URL}/${img.imgDesk}`;
    slide.className = "carousel-slide";
    if (index === 0) slide.classList.add("active");
    slidesContainer.appendChild(slide);

    const dot = document.createElement("span");
    dot.className = "carousel-dot";
    dot.addEventListener("click", () => {
      if (isAnimating || index === currentIndex) return;
      goToSlide(index);
    });
    dotsContainer.appendChild(dot);
  });

  updateUI();

  // --- Swipe Handling ---
  let touch = {};
  container.addEventListener("touchstart", (e) => {
    touch.startX = e.touches[0].clientX;
    touch.startY = e.touches[0].clientY;
    touch.time = Date.now();
  });

  container.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touch.startX;
    const dy = e.changedTouches[0].clientY - touch.startY;
    const dt = Date.now() - touch.time;

    if (dt < 1000 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      nextSlide(dx < 0 ? 1 : -1);
    }
  });

  // --- Auto Slide ---
  const autoSlideDelay = 5000;
  function resetAutoSlide() {
    clearTimeout(autoSlideTimeout);
    autoSlideTimeout = setTimeout(() => nextSlide(1), autoSlideDelay);
  }

  function nextSlide(direction) {
    if (isAnimating) return;
    isAnimating = true;
    const nextIndex = (currentIndex + direction + images.length) % images.length;
    animateSlideChange(nextIndex, direction);
  }

  function goToSlide(index) {
    if (isAnimating || index === currentIndex) return;
    const direction = index > currentIndex ? 1 : -1;
    animateSlideChange(index, direction);
  }

  function animateSlideChange(newIndex, direction) {
    const currentSlide = slidesContainer.children[currentIndex];
    const nextSlide = slidesContainer.children[newIndex];

    currentSlide.style.transition = "transform 0.6s ease, opacity 0.6s ease";
    nextSlide.style.transition = "transform 0.6s ease, opacity 0.6s ease";

    nextSlide.style.transform = `translateX(${direction * 100}%)`;
    nextSlide.classList.add("active");

    requestAnimationFrame(() => {
      currentSlide.style.transform = `translateX(${direction * -100}%)`;
      currentSlide.style.opacity = "0";
      nextSlide.style.transform = "translateX(0)";
      nextSlide.style.opacity = "1";
    });

    setTimeout(() => {
      currentSlide.classList.remove("active");
      currentSlide.style.transition = "none";
      currentSlide.style.transform = "none";
      currentSlide.style.opacity = "1";

      isAnimating = false;
      currentIndex = newIndex;
      updateUI();
      resetAutoSlide();

      // const newId = images[newIndex].id;
      // window.history.pushState({}, "", `/e/${newId}`);
    }, 600);
  }

  function updateUI() {
    titleEl.textContent = `اسلاید ${currentIndex + 1} از ${images.length}`;
    Array.from(dotsContainer.children).forEach((dot, i) =>
      dot.classList.toggle("active", i === currentIndex)
    );
  }

  resetAutoSlide();
}
