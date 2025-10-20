import { fetchSlides, BASE_URL } from "../../utils.js";
import '../../tibashi-asset/swiper-bundle.min.js'

// Dynamically load Swiper CSS & JS from CDN
async function loadSwiperCDN() {
  // Load CSS
  if (!document.querySelector('link[href*="swiper-bundle.min.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../../tibashi-asset/swiper-bundle.min.css';
    document.head.appendChild(link);
  }

  // Load JS
  if (!window.Swiper) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '../../tibashi-asset/swiper-bundle.min.js'
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

export async function initImageCarousel(container) {
  await loadSwiperCDN(); // Ensure Swiper is loaded

  const slidesData = await fetchSlides();
  const images = slidesData || [];

  if (!images.length) {
    container.innerHTML = "<div>در حال بارگذاری تصاویر...</div>";
    return;
  }

  // Build the Swiper HTML dynamically
  container.innerHTML = `
    <div class="swiper mySwiper">
      <div class="swiper-wrapper">
        ${images
          .map(
            (slide, index) => `
          <div class="swiper-slide" data-id="${slide.id}">
            <img src="${BASE_URL}/${slide.imgDesk}" alt="Slide ${index}" />
          </div>
        `
          )
          .join("")}
      </div>
      <div class="swiper-pagination"></div>
    </div>
  `;

  // Initialize Swiper
  const swiper = new Swiper('.mySwiper', {
    slidesPerView: 2, // default for desktop
    spaceBetween: 10,
    loop: true,
    centeredSlides: true,
    pagination: { el: '.swiper-pagination', clickable: true },
    grabCursor: true,
    freeMode: false,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    breakpoints: {
      0: { // mobile
        slidesPerView: 1,
        spaceBetween: 10,
        centeredSlides: false, // better for single slide on mobile
        pagination:false
      },
      769: { // desktop
        slidesPerView: 2,
        spaceBetween: 10,
        centeredSlides: true,
      },
    },
  });

  // Add click event to each slide to navigate
  container.querySelectorAll(".swiper-slide").forEach((slide) => {
    slide.addEventListener("click", () => {
      const id = slide.dataset.id;
      if (id) {
        window.history.pushState({}, "", `/e/${id}`);
        dispatchEvent(new PopStateEvent("popstate"));
      }
    });
  });
}
