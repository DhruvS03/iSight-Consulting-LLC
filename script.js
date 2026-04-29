const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const themeToggle = document.querySelector(".theme-toggle");
const themeLogo = document.querySelector("[data-light-logo][data-dark-logo]");
const backToTopButton = document.querySelector(".back-to-top");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
const submitButton = contactForm?.querySelector('button[type="submit"]');
const themeStorageKey = "isight-theme";

const updateThemeUi = (theme) => {
  const isDark = theme === "dark";
  document.body.dataset.theme = theme;

  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "title",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  if (themeLogo) {
    themeLogo.src = isDark
      ? themeLogo.dataset.darkLogo || themeLogo.src
      : themeLogo.dataset.lightLogo || themeLogo.src;
  }
};

const savedTheme = window.localStorage.getItem(themeStorageKey);
const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = savedTheme || (preferredDark ? "dark" : "light");

updateThemeUi(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    updateThemeUi(nextTheme);
    window.localStorage.setItem(themeStorageKey, nextTheme);
  });
}

const syncBackToTopVisibility = () => {
  if (!backToTopButton) {
    return;
  }

  backToTopButton.classList.toggle("is-visible", window.scrollY > 360);
};

syncBackToTopVisibility();
window.addEventListener("scroll", syncBackToTopVisibility, { passive: true });

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "";
    formStatus.dataset.state = "";

    if (!contactForm.reportValidity()) {
      formStatus.dataset.state = "error";
      formStatus.textContent = "Please complete all required fields first.";
      return;
    }

    const formAction = contactForm.getAttribute("action");
    const formData = new FormData(contactForm);
    formData.set("name", String(formData.get("name") || "").trim());
    formData.set("email", String(formData.get("email") || "").trim());
    formData.set("message", String(formData.get("message") || "").trim());

    if (!formAction || formAction.includes("punitbaxi@gmail.com")) {
      formStatus.dataset.state = "error";
      formStatus.textContent =
        "Add your real Formspree form endpoint in the contact form action first.";
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    formStatus.dataset.state = "loading";
    formStatus.textContent = "Sending your request...";

    try {
      const response = await fetch(formAction, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      formStatus.dataset.state = "success";
      formStatus.textContent =
        "Thanks, your consultation request has been sent successfully.";
      contactForm.reset();
    } catch (error) {
      formStatus.dataset.state = "error";
      formStatus.textContent =
        error instanceof Error
          ? error.message
          : "We couldn't send your request right now. Please try again.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Request";
      }
    }
  });
}
