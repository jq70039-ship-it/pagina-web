/* =========================================================
   NOIR — Sitio público conectado al panel de administración
   Lee los cambios guardados por Administración/admin.html
   ========================================================= */

const NOIR_STORAGE_KEY = "noir_admin_data";

/* Mobile navigation */
const menuButton = document.getElementById("menuButton");
const nav = document.getElementById("nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    nav.classList.toggle("active");
    menuButton.textContent = nav.classList.contains("active") ? "×" : "☰";
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("active");
      menuButton.textContent = "☰";
    });
  });
}

/* Header */
const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
  if (header) header.classList.toggle("scrolled", window.scrollY > 40);
});

/* Reveal animation */
const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("visible"));
}

/* =========================================================
   LIGHTBOX
   Se usa delegación para que también funcionen las imágenes
   agregadas posteriormente desde el panel de administración.
   ========================================================= */

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(item) {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;

  const image = item.dataset.src ||
    item.querySelector("img")?.currentSrc ||
    item.querySelector("img")?.src ||
    "";

  const title =
    item.dataset.alt ||
    item.dataset.title ||
    item.querySelector("span")?.textContent ||
    "NOIR Tattoo Studio";

  const description = item.dataset.description || "";
  const caption = description ? `${title} — ${description}` : title;

  lightboxImage.src = image;
  lightboxImage.alt = title;
  lightboxCaption.textContent = caption;

  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

document.addEventListener("click", (event) => {
  const item = event.target.closest(".lightbox-trigger");
  if (!item) return;

  event.preventDefault();
  openLightbox(item);
});

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox?.classList.contains("active")) {
    closeLightbox();
  }
});

/* =========================================================
   ADMINISTRACIÓN → SITIO PÚBLICO
   ========================================================= */

function getAdminData() {
  try {
    const raw = localStorage.getItem(NOIR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("NOIR: no se pudo leer la información del administrador.", error);
    return null;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

function normalizeStyle(style) {
  const key = String(style || "").trim().toUpperCase();
  const map = {
    "FINE LINE": "FINE LINE",
    "BLACKWORK": "BLACKWORK",
    "ORNAMENTAL": "ORNAMENTAL",
    "BODY FLOW": "BODY FLOW"
  };
  return map[key] || key;
}

function getRailForStyle(style) {
  const map = {
    "BLACKWORK": "#blackwork-gallery .photo-rail",
    "FINE LINE": "#fine-line-gallery .photo-rail",
    "ORNAMENTAL": "#ornamental-gallery .photo-rail",
    "BODY FLOW": "#sigil-gallery .photo-rail"
  };

  return document.querySelector(map[normalizeStyle(style)]);
}

function addAdminWorks(works) {
  if (!Array.isArray(works) || !works.length) return;

  /* Limpiamos una renderización anterior, si existe. */
  document.querySelectorAll("[data-admin-work='true']").forEach((item) => item.remove());

  const realWorks = works.filter((work) => work && work.image);

  /* 1. Obras nuevas en la galería principal */
  const mainGrid = document.querySelector(".gallery-grid");

  realWorks.slice().reverse().forEach((work, index) => {
    const style = normalizeStyle(work.style);
    const title = work.title || `${style} / ${index + 1}`;
    const description = work.description || "";

    if (mainGrid) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "gallery-card lightbox-trigger";
      card.dataset.adminWork = "true";
      card.dataset.src = work.image;
      card.dataset.alt = title;
      card.dataset.description = description;
      card.style.backgroundImage = `linear-gradient(rgba(0,0,0,.08), rgba(0,0,0,.32)), url("${work.image}")`;
      card.innerHTML = `<span>${escapeHTML(style)} / ${escapeHTML(title)}</span>`;

      /* Las nuevas obras aparecen primero. */
      mainGrid.prepend(card);
    }

    /* 2. La misma obra entra automáticamente en su estilo */
    const rail = getRailForStyle(style);

    if (rail) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "portfolio-photo lightbox-trigger";
      item.dataset.adminWork = "true";
      item.dataset.src = work.image;
      item.dataset.alt = title;
      item.dataset.description = description;

      item.innerHTML = `
        <img loading="lazy"
             src="${escapeHTML(work.image)}"
             alt="${escapeHTML(title)}">
        <span>${String(index + 1).padStart(2, "0")}</span>
      `;

      rail.prepend(item);
    }
  });
}

function updateStyleContent(styles) {
  if (!styles || typeof styles !== "object") return;

  const styleSelectors = {
    "BLACKWORK": ".blackwork",
    "FINE LINE": ".fine-line",
    "ORNAMENTAL": ".ornamental",
    "BODY FLOW": ".sigilism"
  };

  Object.entries(styleSelectors).forEach(([key, selector]) => {
    const styleData = styles[key];
    const block = document.querySelector(selector);

    if (!styleData || !block) return;

    const label = block.querySelector(".style-label");
    const paragraph = block.querySelector(".content-frame > p:not(.style-number):not(.style-label)");

    if (label && styleData.name) label.textContent = styleData.name;
    if (paragraph && styleData.description) paragraph.textContent = styleData.description;
  });
}

function updateStudio(studio) {
  if (!studio || typeof studio !== "object") return;

  const name = String(studio.studioName || "").trim();
  const city = String(studio.city || "").trim();
  const instagram = String(studio.instagram || "").trim();
  const contact = String(studio.contact || "").trim();
  const description = String(studio.studioDescription || "").trim();

  /* Nombre del estudio */
  if (name) {
    document.querySelectorAll(".logo span, .footer-brand strong").forEach((element) => {
      element.textContent = name;
    });

    document.title = `${name} — Tattoo Studio`;
  }

  /* Descripción dentro de la sección Studio */
  const studioContent = document.querySelector(".studio-content .content-frame");
  const studioDescription = studioContent?.querySelector("p:not(.eyebrow)");

  if (studioDescription && description) {
    studioDescription.textContent = description;
  }

  /* Información de contacto debajo de la descripción */
  if (studioContent) {
    let meta = studioContent.querySelector(".noir-studio-meta");

    if (!meta) {
      meta = document.createElement("div");
      meta.className = "noir-studio-meta";
      meta.style.marginTop = "24px";
      meta.style.display = "flex";
      meta.style.flexWrap = "wrap";
      meta.style.gap = "10px 18px";
      meta.style.fontSize = "10px";
      meta.style.letterSpacing = "1.5px";
      meta.style.textTransform = "uppercase";
      meta.style.opacity = ".72";

      const button = studioContent.querySelector(".dark-button");
      if (button) studioContent.insertBefore(meta, button);
      else studioContent.append(meta);
    }

    const parts = [city, contact, instagram].filter(Boolean);
    meta.textContent = parts.join(" · ");
    meta.style.display = parts.length ? "flex" : "none";
  }

  /* Footer */
  const footerInfo = document.querySelector(".footer-info");

  if (footerInfo) {
    const spans = footerInfo.querySelectorAll("span");

    if (spans[0] && city) spans[0].textContent = city.toUpperCase();

    if (spans[1]) {
      const contactInfo = [contact, instagram].filter(Boolean).join(" · ");
      if (contactInfo) {
        spans[1].textContent = contactInfo;
      }
    }
  }

  /* El botón de reserva puede abrir WhatsApp si se ingresó un número. */
  if (contact) {
    const cleanPhone = contact.replace(/[^\d]/g, "");

    if (cleanPhone.length >= 7) {
      document.querySelectorAll(".booking-button, .text-button").forEach((link) => {
        link.dataset.noirContact = cleanPhone;
      });
    }
  }
}

function applyAdminData() {
  const data = getAdminData();
  if (!data) return;

  updateStudio(data.studio);
  updateStyleContent(data.styles);
  addAdminWorks(data.works);
}

/* Aplicar al cargar la página */
applyAdminData();

/* Si el administrador guarda cambios en otra pestaña, actualizar esta. */
window.addEventListener("storage", (event) => {
  if (event.key === NOIR_STORAGE_KEY) {
    applyAdminData();
  }
});

/* =========================================================
   FORMULARIO DE RESERVA — demostración
   ========================================================= */

const form = document.getElementById("bookingForm");
const message = document.getElementById("formMessage");

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = getAdminData();
    const contact = data?.studio?.contact?.replace(/[^\d]/g, "") || "";

    if (contact.length >= 7) {
      const formData = new FormData(form);
      const text = [
        "Hola, quiero solicitar una cita en NOIR.",
        "",
        `Nombre: ${formData.get("name") || form.querySelector('input')?.value || ""}`,
        `Estilo: ${form.querySelector("select")?.value || ""}`,
        `Idea: ${form.querySelector("textarea")?.value || ""}`
      ].join("\n");

      /* Se mantiene como demostración para evitar abrir WhatsApp sin
         que el usuario haya decidido configurar el flujo definitivo. */
      message.textContent =
        "Solicitud registrada. Contacto disponible: " + contact;
    } else {
      message.textContent =
        "Solicitud registrada. El siguiente paso será conectar este formulario con correo o WhatsApp.";
    }

    form.reset();
  });
}
