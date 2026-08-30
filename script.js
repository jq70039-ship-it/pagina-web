const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.style.background = "rgba(9, 9, 9, 0.95)";
    header.style.backdropFilter = "blur(10px)";
  } else {
    header.style.background =
      "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)";
    header.style.backdropFilter = "none";
  }
});

const form = document.querySelector(".booking-form");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  alert("Gracias. Hemos recibido tu solicitud de reserva.");
});
