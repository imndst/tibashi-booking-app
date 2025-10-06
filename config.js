// 🌐 Global environment config for Tibashi

// Choose environment: "dev" or "pro"
const ENV_MODE = "dev"; // change to "pro" for production

const CONFIG = {
  dev: {
    API_BASE: "https://localhost:7032/api",
    BASE_URL: "https://new.gishot.ir/"
  },
  pro: {
    API_BASE: "https://bdcast.gishot.ir/api",
    BASE_URL: "https://new.gishot.ir/"
  }
};

export const API_BASE = CONFIG[ENV_MODE].API_BASE;
export const BASE_URL = CONFIG[ENV_MODE].BASE_URL;

// For debugging
console.log(`[Tibashi Config] Mode: ${ENV_MODE}`);
console.log(`[Tibashi Config] API_BASE: ${API_BASE}`);
