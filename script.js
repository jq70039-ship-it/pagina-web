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
  header.classList.toggle("scrolled", window.scrollY > 40);
});

/* Reveal animation */
const revealElements = document.querySelectorAll(".reveal");
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

/* Lightbox */
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

document.querySelectorAll(".lightbox-trigger").forEach((item) => {
  item.addEventListener("click", () => {
    const src = item.dataset.src || getComputedStyle(item).backgroundImage.slice(5, -2);
    const alt = item.dataset.alt || item.querySelector("span")?.textContent || "NOIR Tattoo Studio";

    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightboxCaption.textContent = alt;
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
});

function closeLightbox() {
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("active")) {
    closeLightbox();
  }
});

/* Booking demo */
const form = document.getElementById("bookingForm");
const message = document.getElementById("formMessage");

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent =
      "Solicitud registrada. El siguiente paso será conectar este formulario con correo o WhatsApp.";
    form.reset();
  });
}
