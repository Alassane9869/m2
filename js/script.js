/* =========================================================================
   TMV - SARL | script.js
   Fonctionnalités : menu mobile, header sticky, révélation au défilement,
   filtre galerie, modal images, validation formulaires, génération de
   messages WhatsApp, bouton retour en haut.
   ========================================================================= */

/* -------------------------------------------------------------------------
   CONFIGURATION — TMV SARL Bamako
   ------------------------------------------------------------------------- */
// Numéro WhatsApp officiel de l'entreprise : +223 99 96 72 63
const whatsappNumber = "22399967263";

// Adresse email de contact officielle
const contactEmail = "tmvsarl@gmail.com";

document.addEventListener("DOMContentLoaded", function () {
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initCounters();
  initGalleryFilter();
  initGalleryModal();
  initContactForm();
  initDevisForm();
  initWhatsappTriggers();
  initWhatsappFloat();
  initBackToTop();
  initFooterYear();
  initFaqAccordion();
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

  function closeMenu() {
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  toggle.addEventListener("click", function () {
    const isOpen = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // Ferme le menu quand on clique sur un lien ou action
  document.querySelectorAll(".nav-links a, .nav-drawer-cta a").forEach(function (link) {
    link.addEventListener("click", function () {
      closeMenu();
    });
  });

  // Ferme en cliquant en dehors du header
  document.addEventListener("click", function (e) {
    if (header.classList.contains("menu-open") && !header.contains(e.target)) {
      closeMenu();
    }
  });

  // Ferme avec la touche Échap
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header.classList.contains("menu-open")) {
      closeMenu();
    }
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
    const imgEl = item.querySelector("img");
    let imageSrc = item.getAttribute("data-image") || "";
    // Priorité à la vraie photo si l'attribut pointe vers un vieux SVG
    if (!imageSrc || imageSrc.includes(".svg")) {
      if (imgEl && imgEl.getAttribute("src")) {
        imageSrc = imgEl.getAttribute("src");
      }
    }
    modalTitle.textContent = title;
    modalCategory.textContent = category;
    if (imageSrc) modalImage.setAttribute("src", imageSrc);
    modalImage.setAttribute("alt", title);

    // Mise à jour du bouton d'action dans la modal si présent
    let modalAction = backdrop.querySelector(".modal-wa-btn");
    if (!modalAction) {
      modalAction = document.createElement("a");
      modalAction.className = "btn btn-whatsapp modal-wa-btn";
      modalAction.style.marginTop = "0.75rem";
      modalAction.style.display = "inline-flex";
      modalAction.innerHTML = '<i class="bi bi-whatsapp"></i> Commander un projet similaire';
      backdrop.querySelector(".modal-info").appendChild(modalAction);
    }
    modalAction.onclick = function (e) {
      e.preventDefault();
      openWhatsapp("Bonjour TMV, j'ai vu votre réalisation « " + title + " » (" + category + ") sur votre site web et je souhaite commander un projet similaire.");
    };
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
   ANIMATION DES COMPTEURS CHIFFRES CLÉS
   ------------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-counter"), 10);
        const prefix = el.getAttribute("data-prefix") || "";
        const suffix = el.getAttribute("data-suffix") || "";
        const duration = 1600;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out expo
          const current = Math.floor(progress === 1 ? target : target * (1 - Math.pow(2, -10 * progress)));
          el.textContent = prefix + current + suffix;
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = prefix + target + suffix;
          }
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(function (el) { observer.observe(el); });
}

/* -------------------------------------------------------------------------
   DÉCLENCHEURS WHATSAPP DYNAMIQUES
   ------------------------------------------------------------------------- */
function initWhatsappTriggers() {
  document.querySelectorAll("[data-wa-service]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const service = btn.getAttribute("data-wa-service");
      openWhatsapp("Bonjour TMV-SARL, je souhaite demander des informations et un devis pour votre service : " + service + ".");
    });
  });

  document.querySelectorAll("[data-wa-custom]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const msg = btn.getAttribute("data-wa-custom");
      openWhatsapp(msg);
    });
  });
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

  // Envoi direct via WhatsApp
  const btnWa = document.getElementById("btnContactWhatsApp");
  if (btnWa) {
    btnWa.addEventListener("click", function () {
      if (!validateForm(form)) return;

      const data = new FormData(form);
      const nom = data.get("nom") || "";
      const telephone = data.get("telephone") || "";
      const email = data.get("email") || "";
      const service = data.get("service") || "";
      const message = data.get("message") || "";

      let texte = "Bonjour TMV, je vous contacte depuis votre formulaire de contact :\n\n";
      texte += "Nom et prénom : " + nom + "\n";
      texte += "Téléphone : " + telephone + "\n";
      if (email) texte += "Email : " + email + "\n";
      texte += "Service concerné : " + service + "\n\n";
      texte += "Message / Description :\n" + message;

      openWhatsapp(texte);
      showFormSuccess(form, "Votre message a été préparé pour WhatsApp. Finalisez l'envoi dans la discussion.");
      form.reset();
    });
  }

  // Envoi par email classique
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

    window.location.href = mailtoLink;
    showFormSuccess(form, "Votre logiciel de messagerie va s'ouvrir avec votre message pré-rempli. Vous pouvez également nous écrire directement sur WhatsApp.");
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

/* -------------------------------------------------------------------------
   ACCORDÉON FAQ (Foire Aux Questions)
   ------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach(function (item) {
    const btn = item.querySelector(".faq-question");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const isOpen = item.classList.contains("is-open");

      // Fermer les autres questions pour une lecture fluide (accordéon exclusif)
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove("is-open");
          const otherBtn = other.querySelector(".faq-question");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        }
      });

      // Basculer l'état de l'élément cliqué
      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });
}
