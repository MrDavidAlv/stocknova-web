import { defineConfig } from "cypress";
import { config } from "dotenv";

config();

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:8081",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    setupNodeEvents() {},
    env: {
      ADMIN_EMAIL: process.env.CYPRESS_ADMIN_EMAIL,
      ADMIN_PASSWORD: process.env.CYPRESS_ADMIN_PASSWORD,
      MANAGER_EMAIL: process.env.CYPRESS_MANAGER_EMAIL,
      MANAGER_PASSWORD: process.env.CYPRESS_MANAGER_PASSWORD,
      VIEWER_EMAIL: process.env.CYPRESS_VIEWER_EMAIL,
      VIEWER_PASSWORD: process.env.CYPRESS_VIEWER_PASSWORD,
    },
  },
});
