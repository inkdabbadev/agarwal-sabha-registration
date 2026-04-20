import React, { useEffect, useMemo, useState } from "react";
import backgroundTexture from "./assets/background-texture-optimized.jpg";
import eventDate from "./assets/event-date.png";
import inauguralCeremony from "./assets/inaugural-ceremony.png";
import platinumJubileeLogo from "./assets/platinum-jubilee-logo.png";
import sabhaTitle from "./assets/sabha-title.png";
import serviceSince from "./assets/service-since.png";
import topOrnament from "./assets/top-ornament.png";
import { getSupabaseClient, supabaseConfigured } from "./lib/supabaseClient";

const HOME_PATH = "/";
const REGISTER_PATH = "/register";
const EVENT_NAME = "Shree Agarwal Sabha Platinum Jubilee Inaugural Ceremony";
const EVENT_DESCRIPTION =
  "Official registration website for the Shree Agarwal Sabha Platinum Jubilee inaugural ceremony on Sunday, 26th April 2026.";
const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/+$/, "") || window.location.origin;

const initialForm = {
  full_name: "",
  mobile_number: "",
  website: "",
};

function normalizeMobile(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function validateForm(form) {
  const nextErrors = {};
  const cleanName = form.full_name.trim();
  const cleanMobile = normalizeMobile(form.mobile_number);

  if (cleanName.length < 3) {
    nextErrors.full_name = "Please enter a valid full name.";
  }

  if (cleanMobile.length !== 10) {
    nextErrors.mobile_number = "Please enter a valid 10-digit mobile number.";
  }

  return nextErrors;
}

function getRouteFromLocation(location = window.location) {
  const normalizedPath = location.pathname.replace(/\/+$/, "") || HOME_PATH;

  if (location.hash === "#/register" || normalizedPath === REGISTER_PATH) {
    return "register";
  }

  return "home";
}

function getPathForRoute(route) {
  return route === "register" ? REGISTER_PATH : HOME_PATH;
}

function navigateTo(path, { replace = false, preserveSearch = true } = {}) {
  const normalizedTarget = path === HOME_PATH ? HOME_PATH : path.replace(/\/+$/, "");
  const targetUrl = new URL(normalizedTarget, window.location.origin);
  if (preserveSearch && !targetUrl.search) {
    targetUrl.search = window.location.search;
  }

  const nextUrl = `${targetUrl.pathname}${targetUrl.search}`;
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (nextUrl === currentUrl && !window.location.hash) {
    return;
  }

  const historyMethod = replace ? "replaceState" : "pushState";
  window.history[historyMethod]({}, "", nextUrl);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function usePageMetadata(route) {
  useEffect(() => {
    const title =
      route === "register"
        ? "Register | Shree Agarwal Sabha Platinum Jubilee"
        : "Shree Agarwal Sabha | Platinum Jubilee";
    const description =
      route === "register"
        ? "Register for the Shree Agarwal Sabha Platinum Jubilee inaugural ceremony."
        : EVENT_DESCRIPTION;

    document.title = title;

    const setMeta = (selector, attribute, value) => {
      const node = document.head.querySelector(selector);
      if (node) node.setAttribute(attribute, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta(
      'meta[name="robots"]',
      "content",
      route === "register" ? "noindex,follow,max-snippet:-1,max-image-preview:large" : "index,follow,max-snippet:-1,max-image-preview:large",
    );
    setMeta('meta[name="theme-color"]', "content", "#0f3144");
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", `${SITE_URL}${getPathForRoute(route)}`);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);

    const canonicalUrl = `${SITE_URL}${getPathForRoute(route)}`;
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", canonicalUrl);

    let script = document.getElementById("structured-data");
    if (!script) {
      script = document.createElement("script");
      script.id = "structured-data";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Shree Agarwal Sabha",
        url: SITE_URL,
      },
      {
        "@context": "https://schema.org",
        "@type": "Event",
        name: EVENT_NAME,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        startDate: "2026-04-26",
        organizer: {
          "@type": "Organization",
          name: "Shree Agarwal Sabha",
        },
        description: EVENT_DESCRIPTION,
        url: canonicalUrl,
      },
    ]);
  }, [route]);
}

function usePathRoute() {
  const [route, setRoute] = useState(() => getRouteFromLocation());

  useEffect(() => {
    const redirectPath = new URLSearchParams(window.location.search).get("redirect");
    if (window.location.pathname === HOME_PATH && redirectPath) {
      const safePath = redirectPath.startsWith("/") ? redirectPath : HOME_PATH;
      navigateTo(safePath, { replace: true, preserveSearch: false });
      setRoute(getRouteFromLocation());
      return undefined;
    }

    if (window.location.hash === "#/register") {
      navigateTo(REGISTER_PATH, { replace: true });
      return undefined;
    }

    if (window.location.hash === "#/" || window.location.hash === "#") {
      navigateTo(HOME_PATH, { replace: true });
      return undefined;
    }

    const syncRoute = () => setRoute(getRouteFromLocation());
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  return route;
}

function App() {
  const route = usePathRoute();
  usePageMetadata(route);

  return (
    <main
      className={`poster ${route === "register" ? "poster--form" : ""}`}
      style={{
        backgroundImage: [
          "radial-gradient(circle at top center, rgba(255, 255, 255, 0.09), transparent 28%)",
          "linear-gradient(180deg, rgba(11, 39, 53, 0.18), rgba(5, 17, 25, 0.5))",
          `url(${backgroundTexture})`,
        ].join(", "),
      }}
    >
      <div className="poster__overlay" />
      {route === "register" ? <RegistrationPage /> : <LandingPage />}
    </main>
  );
}

function Header() {
  return (
    <header className="poster__header">
      <div className="poster__ornament">
        <img
          className="poster__ornament-image"
          src={topOrnament}
          alt="Agarwal Sabha decorative logo banner"
          width="1400"
          height="276"
          decoding="async"
          fetchPriority="high"
        />

        <div className="poster__title-group">
          <img
            className="poster__title"
            src={sabhaTitle}
            alt="Shree Agarwal Sabha"
            width="1239"
            height="125"
            decoding="async"
            fetchPriority="high"
          />
          <div className="poster__service-wrap">
            <img
              className="poster__service"
              src={serviceSince}
              alt="In service since 1952"
              width="633"
              height="75"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function LandingPage() {
  const handleRegisterClick = (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigateTo(REGISTER_PATH);
  };

  return (
    <>
      <Header />

      <section className="poster__center">
        <div className="poster__glow" />

        <img
          className="poster__logo"
          src={platinumJubileeLogo}
          alt="75th Year Platinum Jubilee celebrations"
          width="783"
          height="796"
          decoding="async"
          fetchPriority="high"
        />

        <div className="poster__event-panel">
          <img
            className="poster__ceremony"
            src={inauguralCeremony}
            alt="Inaugural Ceremony"
            width="533"
            height="218"
            decoding="async"
          />

          <div className="poster__date-wrap">
            <span className="poster__date-line" />
            <img
              className="poster__date"
              src={eventDate}
              alt="Sunday, 26th April, 2026"
              width="906"
              height="112"
              decoding="async"
            />
            <span className="poster__date-line" />
          </div>

          <div className="poster__cta-shell">
            <span className="poster__cta-line" />
            <a className="poster__button" href={REGISTER_PATH} onClick={handleRegisterClick}>
              Register
            </a>
            <span className="poster__cta-line" />
          </div>
        </div>
      </section>
    </>
  );
}

function RegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const isConfigured = useMemo(() => supabaseConfigured, []);

  useEffect(() => {
    if (isConfigured) {
      void getSupabaseClient();
    }
  }, [isConfigured]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "mobile_number" ? normalizeMobile(value) : value,
    }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.website.trim()) {
      setStatus("success");
      setMessage("Registration submitted successfully.");
      setErrors({});
      setForm(initialForm);
      return;
    }

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("error");
      setMessage("Please correct the highlighted fields and try again.");
      return;
    }

    if (!isConfigured) {
      setStatus("error");
      setMessage("Supabase is not configured yet. Add your project URL and anon key first.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    const payload = {
      full_name: form.full_name.trim(),
      mobile_number: normalizeMobile(form.mobile_number),
    };

    const supabase = await getSupabaseClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Supabase is not configured yet. Add your project URL and anon key first.");
      return;
    }

    const { error } = await supabase.from("ag_registrations").insert(payload);

    if (error) {
      setStatus("error");

      if (error.code === "23505") {
        setMessage("This mobile number is already registered.");
        return;
      }

      setMessage(error.message || "Registration could not be completed. Please try again.");
      return;
    }

    setStatus("success");
    setMessage("Registration submitted successfully.");
    setErrors({});
    setForm(initialForm);
  };

  return (
    <>
      <Header />

      <section className="registration">
        <div className="registration__shell">
          <div className="registration__top">
            <div className="registration__hero">
              <img
                className="registration__hero-logo"
                src={platinumJubileeLogo}
                alt="75th Year Platinum Jubilee celebrations"
                width="783"
                height="796"
                decoding="async"
                fetchPriority="high"
              />
              <img
                className="registration__hero-date"
                src={eventDate}
                alt="Sunday, 26th April, 2026"
                width="906"
                height="112"
                decoding="async"
              />
            </div>
          </div>

          <div className="registration__card">
            <div className="registration__intro">
              <div className="registration__heading">
                <img
                  className="registration__heading-art"
                  src={inauguralCeremony}
                  alt="Inaugural Ceremony"
                  width="533"
                  height="218"
                  decoding="async"
                />
                <h1 className="registration__title">Reserve your seat</h1>
                <p className="registration__copy">
                  A simple one-person registration for the Platinum Jubilee inaugural ceremony.
                </p>
              </div>
            </div>

            <div className="registration__form-shell">
              <form className="registration__form" onSubmit={handleSubmit} noValidate>
                <label className="field field--hidden" aria-hidden="true">
                  <span>Website</span>
                  <input
                    name="website"
                    type="text"
                    value={form.website}
                    onChange={handleChange}
                    tabIndex="-1"
                    autoComplete="off"
                  />
                </label>

                <label className="field field--wide">
                  <span>Full Name</span>
                  <input
                    name="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    maxLength="120"
                    minLength="3"
                    required
                    aria-invalid={Boolean(errors.full_name)}
                  />
                  {errors.full_name ? <small className="field__error">{errors.full_name}</small> : null}
                </label>

                <label className="field">
                  <span>Mobile Number</span>
                  <input
                    name="mobile_number"
                    type="tel"
                    inputMode="numeric"
                    value={form.mobile_number}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    pattern="[0-9]{10}"
                    minLength="10"
                    maxLength="10"
                    required
                    aria-invalid={Boolean(errors.mobile_number)}
                  />
                  {errors.mobile_number ? (
                    <small className="field__error">{errors.mobile_number}</small>
                  ) : null}
                </label>

                <div className="registration__actions">
                  <button
                    className="poster__button poster__button--submit"
                    type="submit"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? "Submitting..." : "Submit Registration"}
                  </button>
                </div>

                {message ? (
                  <p
                    className={`registration__message registration__message--${status}`}
                    aria-live="polite"
                  >
                    {message}
                  </p>
                ) : null}

                {!isConfigured ? (
                  <p className="registration__hint">
                    Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env` file to
                    enable submissions.
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
