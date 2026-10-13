"use strict";

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const themeButton = document.querySelector("[data-theme-toggle]");
if (themeButton) {
  const root = document.documentElement;
  try {
    const savedTheme = localStorage.getItem("shreejan-theme");
    if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
  } catch (error) {
    console.warn("Could not restore the saved colour theme.", error);
  }
  const updateThemeButton = () => {
    const dark = root.dataset.theme === "dark" ||
      (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    themeButton.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    themeButton.textContent = dark ? "☼" : "◐";
  };
  updateThemeButton();
  themeButton.addEventListener("click", () => {
    const currentlyDark = root.dataset.theme === "dark" ||
      (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = currentlyDark ? "light" : "dark";
    try {
      localStorage.setItem("shreejan-theme", root.dataset.theme);
    } catch (error) {
      console.warn("Could not save the colour theme preference.", error);
    }
    updateThemeButton();
  });
}

const gallery = document.querySelector(".gallery");
if (gallery) {
  const tiles = Array.from(gallery.querySelectorAll(".gallery-tile"));
  const chips = Array.from(document.querySelectorAll("[data-filter]"));
  let activeFilter = "all";
  const visibleTiles = () => tiles.filter((tile) => !tile.hidden);
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.filter || "all";
      chips.forEach((item) => item.setAttribute("aria-pressed", String(item === chip)));
      tiles.forEach((tile) => { tile.hidden = activeFilter !== "all" && tile.dataset.cat !== activeFilter; });
    });
  });

  const lightbox = document.querySelector("#lightbox");
  if (lightbox) {
    const image = lightbox.querySelector(".lightbox-image");
    const title = lightbox.querySelector(".lightbox-title strong");
    const subtitle = lightbox.querySelector(".lightbox-title span");
    const closeButton = lightbox.querySelector("[data-close]");
    let currentIndex = 0;
    let returnFocus = null;

    const showTile = (index) => {
      const items = visibleTiles();
      if (!items.length) return;
      currentIndex = (index + items.length) % items.length;
      const tile = items[currentIndex];
      const source = tile.querySelector("img");
      image.src = source.currentSrc || source.src;
      image.alt = source.alt;
      title.textContent = tile.dataset.title || "";
      subtitle.textContent = tile.dataset.subtitle || "";
    };
    const close = () => {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
    };
    tiles.forEach((tile) => {
      tile.addEventListener("click", () => {
        const items = visibleTiles();
        returnFocus = tile;
        showTile(items.indexOf(tile));
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
        closeButton.focus();
      });
    });
    lightbox.querySelector("[data-previous]").addEventListener("click", () => showTile(currentIndex - 1));
    lightbox.querySelector("[data-next]").addEventListener("click", () => showTile(currentIndex + 1));
    closeButton.addEventListener("click", close);
    lightbox.addEventListener("click", (event) => { if (event.target === lightbox) close(); });
    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showTile(currentIndex - 1);
      if (event.key === "ArrowRight") showTile(currentIndex + 1);
    });
  }
}

const enquiryForm = document.querySelector("#enquiry-form");
if (enquiryForm) {
  enquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = enquiryForm.elements.namedItem("name");
    const contact = enquiryForm.elements.namedItem("contact");
    if (!name.value.trim() || !contact.value.trim()) {
      (name.value.trim() ? contact : name).reportValidity();
      return;
    }
    const formData = new FormData(enquiryForm);
    const message = [
      "Hello, I'd like to enquire about an interior design project.",
      `Name: ${String(formData.get("name") || "").trim()}`,
      `Phone or email: ${String(formData.get("contact") || "").trim()}`,
      `Project type: ${String(formData.get("projectType") || "").trim()}`,
      `Approximate size: ${String(formData.get("size") || "").trim() || "Not specified"}`,
      `What I'd like to change: ${String(formData.get("message") || "").trim() || "Not specified"}`
    ].join("\n");
    const whatsappUrl = `https://wa.me/917742517708?text=${encodeURIComponent(message)}`;
    const whatsappLink = document.querySelector("#enquiry-whatsapp-link");
    whatsappLink.href = whatsappUrl;
    enquiryForm.hidden = true;
    document.querySelector("#enquiry-success").hidden = false;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });
}
