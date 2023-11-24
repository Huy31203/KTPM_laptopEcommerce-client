// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        search: resolve(__dirname, "search.html"),
        productDetail: resolve(__dirname, "product-detail.html"),
        cart: resolve(__dirname, "cart.html"),
        history: resolve(__dirname, "history.html"),
        login: resolve(__dirname, "login.html"),
        register: resolve(__dirname, "register.html"),
        admin: resolve(__dirname, "admin.html"),
      },
    },
  },
});
