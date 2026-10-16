/* =========================================================================
   TMV - SARL | script.js
   Fonctionnalités : menu mobile, header sticky, révélation au défilement,
   filtre galerie, modal images, validation formulaires, génération de
   messages WhatsApp, bouton retour en haut.
   ========================================================================= */

/* -------------------------------------------------------------------------
   CONFIGURATION — à modifier facilement
   ------------------------------------------------------------------------- */
// Numéro WhatsApp de l'entreprise au format international, SANS "+" ni espaces.
// Exemple : "22370000000". Remplacer par le vrai numéro avant mise en ligne.
const whatsappNumber = "NUMERO_A_AJOUTER";

// Adresse email de contact (déjà fournie par l'entreprise)
const contactEmail = "tmvsarl@gmail.com";

document.addEventListener("DOMContentLoaded", function () {
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initGalleryFilter();
  initGalleryModal();
  initContactForm();
  initDevisForm();
  initWhatsappFloat();
  initBackToTop();
  initFooterYear();
});

/* -------------------------------------------------------------------------
   HEADER STICKY — ombre au défilement
   ------------------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = function () {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* -------------------------------------------------------------------------
   MENU MOBILE (hamburger)
   ------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const header = document.querySelector(".site-header");
  if (!toggle || !header) return;

  toggle.addEventListener("click", function () {
    const isOpen = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Ferme le menu quand on clique sur un lien
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* -------------------------------------------------------------------------
   RÉVÉLATION AU DÉFILEMENT — légère, un seul type d'effet
   ------------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach(function (el) { observer.observe(el); });
}

/* -------------------------------------------------------------------------
   GALERIE — FILTRE PAR CATÉGORIE
   ------------------------------------------------------------------------- */
function initGalleryFilter() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");
  if (!filterButtons.length || !galleryItems.length) return;

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      const category = btn.getAttribute("data-filter");

      galleryItems.forEach(function (item) {
        const matches = category === "all" || item.getAttribute("data-category") === category;
        item.hidden = !matches;
      });
    });
  });
}

/* -------------------------------------------------------------------------
   GALERIE — MODAL D'AFFICHAGE EN GRAND
   ------------------------------------------------------------------------- */
function initGalleryModal() {
  const galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  const backdrop = document.getElementById("galleryModal");
  if (!galleryItems.length || !backdrop) return;

  const modalImage = backdrop.querySelector(".modal-box .ph-image img");
  const modalTitle = backdrop.querySelector(".modal-info strong");
  const modalCategory = backdrop.querySelector(".modal-info span");
  const closeBtn = backdrop.querySelector(".modal-close");
  const prevBtn = backdrop.querySelector(".modal-prev");
  const nextBtn = backdrop.querySelector(".modal-next");

  let currentIndex = 0;
  let visibleItems = [];

  function getVisibleItems() {
    return galleryItems.filter(function (item) { return !item.hidden; });
  }

  function openModal(index) {
    visibleItems = getVisibleItems();
    currentIndex = index;
    renderModal();
    backdrop.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function renderModal() {
    const item = visibleItems[currentIndex];
    if (!item) return;
    const title = item.getAttribute("data-title") || "Réalisation TMV";
    const category = item.getAttribute("data-category-label") || "";
    const imageSrc = item.getAttribute("data-image") || "";
    modalTitle.textContent = title;
    modalCategory.textContent = category;
    if (imageSrc) modalImage.setAttribute("src", imageSrc);
    modalImage.setAttribute("alt", title);
  }

  function closeModal() {
    backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener("click", function () {
      openModal(getVisibleItems().indexOf(item));
    });
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(getVisibleItems().indexOf(item));
      }
    });
  });

  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (!backdrop.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowRight") { nextImage(); }
    if (e.key === "ArrowLeft") { prevImage(); }
  });

  function nextImage() {
    if (!visibleItems.length) return;
    currentIndex = (currentIndex + 1) % visibleItems.length;
    renderModal();
  }
  function prevImage() {
    if (!visibleItems.length) return;
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    renderModal();
  }
  if (nextBtn) nextBtn.addEventListener("click", nextImage);
  if (prevBtn) prevBtn.addEventListener("click", prevImage);
}

/* -------------------------------------------------------------------------
   VALIDATION GÉNÉRIQUE DE FORMULAIRE
   ------------------------------------------------------------------------- */
function validateField(field) {
  const wrapper = field.closest(".field");
  if (!wrapper) return true;
  let isValid = true;

  if (field.hasAttribute("required") && !field.value.trim()) {
    isValid = false;
  }

  if (isValid && field.type === "email" && field.value.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    isValid = emailPattern.test(field.value.trim());
  }

  if (isValid && field.type === "tel" && field.value.trim()) {
    const phonePattern = /^[0-9+\s]{8,}$/;
    isValid = phonePattern.test(field.value.trim());
  }

  wrapper.classList.toggle("has-error", !isValid);
  return isValid;
}

function attachLiveValidation(form) {
  form.querySelectorAll("input, textarea, select").forEach(function (field) {
    field.addEventListener("blur", function () { validateField(field); });
    field.addEventListener("input", function () {
      const wrapper = field.closest(".field");
      if (wrapper && wrapper.classList.contains("has-error")) validateField(field);
    });
  });
}

function validateForm(form) {
  let formIsValid = true;
  form.querySelectorAll("input, textarea, select").forEach(function (field) {
    if (!validateField(field)) formIsValid = false;
  });
  return formIsValid;
}

/* -------------------------------------------------------------------------
   FORMULAIRE DE CONTACT
   Pas de backend : après validation, ouverture du client mail (mailto:)
   avec les informations du formulaire pré-remplies.
   ------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  attachLiveValidation(form);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateForm(form)) return;

    const data = new FormData(form);
    const nom = data.get("nom") || "";
    const telephone = data.get("telephone") || "";
    const email = data.get("email") || "";
    const service = data.get("service") || "";
    const message = data.get("message") || "";

    const subject = "Demande de contact - Site web TMV";
    const body =
      "Nom et prénom : " + nom + "\n" +
      "Téléphone : " + telephone + "\n" +
      "Email : " + email + "\n" +
      "Service recherché : " + service + "\n\n" +
      "Message :\n" + message;

    const mailtoLink =
      "mailto:" + contactEmail +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    // Ouvre le logiciel de messagerie de l'utilisateur avec le message pré-rempli
    window.location.href = mailtoLink;

    showFormSuccess(form, "Votre logiciel de messagerie va s'ouvrir avec votre message pré-rempli. Vous pouvez aussi nous écrire directement sur WhatsApp.");
    form.reset();
  });
}

/* -------------------------------------------------------------------------
   FORMULAIRE DE DEMANDE DE DEVIS
   Pas de backend : après validation, ouverture de WhatsApp avec un message
   automatiquement construit à partir des informations saisies.
   ------------------------------------------------------------------------- */
function initDevisForm() {
  const form = document.getElementById("devisForm");
  if (!form) return;
  attachLiveValidation(form);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateForm(form)) return;

    const data = new FormData(form);
    const nom = data.get("nom") || "";
    const telephone = data.get("telephone") || "";
    const email = data.get("email") || "";
    const prestation = data.get("prestation") || "";
    const localisation = data.get("localisation") || "";
    const dimensions = data.get("dimensions") || "";
    const description = data.get("description") || "";

    let texte = "Bonjour TMV, je souhaite une demande de devis :\n\n";
    texte += "Nom : " + nom + "\n";
    texte += "Téléphone : " + telephone + "\n";
    if (email) texte += "Email : " + email + "\n";
    texte += "Type de prestation : " + prestation + "\n";
    texte += "Localisation du projet : " + localisation + "\n";
    if (dimensions) texte += "Dimensions indicatives : " + dimensions + "\n";
    texte += "Description du projet : " + description;

    openWhatsapp(texte);

    showFormSuccess(form, "Votre demande a été préparée. Finalisez son envoi depuis WhatsApp.");
    form.reset();
  });
}

function showFormSuccess(form, message) {
  let successBox = form.querySelector(".form-success");
  if (!successBox) {
    successBox = document.createElement("div");
    successBox.className = "form-success";
    form.prepend(successBox);
  }
  successBox.textContent = message;
  successBox.classList.add("is-visible");
  successBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* -------------------------------------------------------------------------
   OUVERTURE WHATSAPP — utilitaire commun
   ------------------------------------------------------------------------- */
function openWhatsapp(message) {
  const encoded = encodeURIComponent(message);
  const url = "https://wa.me/" + whatsappNumber + "?text=" + encoded;
  window.open(url, "_blank", "noopener");
}

function initWhatsappFloat() {
  const btn = document.getElementById("whatsappFloat");
  if (!btn) return;
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    openWhatsapp("Bonjour TMV, je souhaite avoir plus d'informations sur vos services de métallerie et vitrage.");
  });
}

/* -------------------------------------------------------------------------
   BOUTON RETOUR EN HAUT
   ------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    function () {
      btn.classList.toggle("is-visible", window.scrollY > 480);
    },
    { passive: true }
  );

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* -------------------------------------------------------------------------
   ANNÉE COURANTE DANS LE FOOTER
   ------------------------------------------------------------------------- */
function initFooterYear() {
  const el = document.getElementById("currentYear");
  if (el) el.textContent = new Date().getFullYear();
}
