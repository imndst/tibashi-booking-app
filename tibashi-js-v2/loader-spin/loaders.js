// loaders.js (Minimal Centered Loader)
// Usage:
// const id = showLoader({ type: 'circle', theme: 'primary' });
// hideLoader(id);

let __loaderStyleInjected = false;

function injectStyles() {
  if (__loaderStyleInjected) return;
  __loaderStyleInjected = true;

  const css = `
  :root {
    --loader-size: 52px;
    --loader-primary: #0ea5e9; /* blue */
    --loader-danger: #ef4444;  /* red */
    --loader-default: #c0c0c0; /* silver */
  }

  /* loader container (always centered) */
  .comp-loader-root {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 80px;
  }

  /* Circle spinner */
  .loader-circle {
    width: var(--loader-size);
    height: var(--loader-size);
    border-radius: 50%;
    border: 4px solid rgba(0,0,0,0.08);
    border-top-color: var(--loader-color, var(--loader-default));
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    100% { transform: rotate(360deg); }
  }

  /* Dots pulsing */
  .loader-dots {
    display: flex;
    gap: 6px;
  }
  .loader-dots .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--loader-color, var(--loader-default));
    animation: dotPulse 0.8s infinite ease-in-out;
  }
  .loader-dots .dot:nth-child(2) { animation-delay: 0.15s; }
  .loader-dots .dot:nth-child(3) { animation-delay: 0.3s; }
  @keyframes dotPulse {
    0%, 80%, 100% { opacity: 0.4; transform: scale(1); }
    40% { opacity: 1; transform: scale(1.4); }
  }

  /* 4-point flip */
  .loader-flip4 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 6px;
  }
  .loader-flip4 .cell {
    width: 12px;
    height: 12px;
    background: var(--loader-color, var(--loader-default));
    animation: flip4 1s infinite ease-in-out;
    border-radius: 3px;
  }
  .loader-flip4 .cell:nth-child(2) { animation-delay: 0.1s; }
  .loader-flip4 .cell:nth-child(3) { animation-delay: 0.2s; }
  .loader-flip4 .cell:nth-child(4) { animation-delay: 0.3s; }

  @keyframes flip4 {
    0%, 100% { transform: rotateY(0deg); opacity: 1; }
    50% { transform: rotateY(180deg); opacity: 0.5; }
  }
  `;
  
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
}

/**
 * Create loader DOM
 */
function createLoaderElement(type = 'circle', theme = 'default') {
  const root = document.createElement('div');
  root.className = 'comp-loader-root';
  root.style.setProperty('--loader-color', theme === 'primary'
    ? 'var(--loader-primary)'
    : theme === 'danger'
    ? 'var(--loader-danger)'
    : 'var(--loader-default)'
  );

  if (type === 'circle') {
    root.innerHTML = `<div class="loader-circle"></div>`;
  } else if (type === 'dots') {
    root.innerHTML = `
      <div class="loader-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>`;
  } else if (type === 'flip4') {
    root.innerHTML = `
      <div class="loader-flip4">
        <div class="cell"></div>
        <div class="cell"></div>
        <div class="cell"></div>
        <div class="cell"></div>
      </div>`;
  } else {
    root.textContent = '...';
  }

  return root;
}

/**
 * showLoader
 */
export function showLoader({ type = 'circle', target = document.body, theme = 'default' } = {}) {
  injectStyles();

  const container = document.createElement('div');
  const loaderId = `comp-loader-${Math.random().toString(36).slice(2, 9)}`;
  container.dataset.compLoaderId = loaderId;

  const loader = createLoaderElement(type, theme);
  container.appendChild(loader);

  // center container inside parent
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.minHeight = '80px';

  target.appendChild(container);
  return loaderId;
}

/**
 * hideLoader
 */
export function hideLoader(id) {
  if (!id) return;
  const el = document.querySelector(`[data-comp-loader-id="${id}"]`);
  if (el) el.remove();
}

/* Shortcuts */
export const showCircle = (target, theme = 'default') =>
  showLoader({ type: 'circle', target, theme });

export const showDots = (target, theme = 'default') =>
  showLoader({ type: 'dots', target, theme });

export const showFlip4 = (target, theme = 'default') =>
  showLoader({ type: 'flip4', target, theme });
