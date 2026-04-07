import { useEffect, useState } from "react";
import "./App.css";
import { Navbar } from "./components/Navbar";
import { MobileMenu } from "./components/MobileMenu";
import { LoadingScreen } from "./components/LoadingScreen";
import { RevealOnScroll } from "./components/RevealOnScroll";
import { SectionHeading } from "./components/SectionHeading";
import { AchievementCard } from "./components/AchievementCard";
import { AdminPanel } from "./components/AdminPanel";
import { ContactPanel } from "./components/ContactPanel";
import { focusAreas, seedProjects } from "./data/siteContent";
import { adminEmail } from "./lib/firebase";
import { usePortfolioData } from "./hooks/usePortfolioData";

const navigationItems = [
  { label: "Projects", href: "#projects" },
  { label: "Achievements", href: "#achievements" },
  { label: "Certificates", href: "#certificates" },
  { label: "Contact", href: "#contact" },
];

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem("portfolio-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [showIntro, setShowIntro] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const {
    projects,
    projectsLoading,
    projectError,
    achievements,
    achievementsLoading,
    achievementError,
    certificates,
    certificatesLoading,
    certificateError,
    isConfigured,
    user,
    isAdmin,
    authLoading,
    signIn,
    signOutAdmin,
    addProject,
    updateProject,
    removeProject,
    addAchievement,
    updateAchievement,
    removeAchievement,
    addCertificate,
    updateCertificate,
    removeCertificate,
  } = usePortfolioData();

  useEffect(() => {
    const nextCategories = [
      "All",
      ...new Set(projects.map((project) => project.category)),
    ];

    if (!nextCategories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [projects, selectedCategory]);

  const categories = ["All", ...new Set(projects.map((project) => project.category))];

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((project) => project.category === selectedCategory);

  const archiveSummary = isConfigured ? "Live content" : "Local preview";
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim() ?? "";
  const formatCount = (value) => String(value).padStart(2, "0");
  const heroStats = [
    { label: "Projects", value: formatCount(projects.length) },
    { label: "Achievements", value: formatCount(achievements.length) },
    { label: "Certificates", value: formatCount(certificates.length) },
  ];
  const runtimeFeed = [
    { label: "focus", value: "FullStack + AI/ML + DevOps" },
    {
      label: "theme",
      value:
        theme === "dark"
          ? "navy / blue / purple"
          : "ice blue / cobalt / violet",
    },
    { label: "contact", value: contactEmail ? "ready" : "configure email target" },
  ];
  const overviewMetrics = [
    { label: "sync", value: isConfigured ? "live collections" : "local preview" },
    { label: "stack", value: "react / firebase / vite" },
    { label: "motion", value: theme === "dark" ? "signal mesh" : "soft telemetry" },
  ];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  return (
    <div
      className={`page-shell ${showIntro ? "is-intro-active" : "is-ready"}`}
      data-theme={theme}
    >
      {showIntro ? (
        <LoadingScreen
          onComplete={() => setShowIntro(false)}
          theme={theme}
        />
      ) : null}
      <div className="background-grid" aria-hidden="true" />
      <div className="background-scanlines" aria-hidden="true" />
      <div className="background-orb orb-one" aria-hidden="true" />
      <div className="background-orb orb-two" aria-hidden="true" />
      <div className="background-orb orb-three" aria-hidden="true" />
      <Navbar
        menuOpen={menuOpen}
        navItems={navigationItems}
        onAdminClick={() => {
          document
            .getElementById("admin")
            ?.scrollIntoView({ behavior: "smooth" });
          setMenuOpen(false);
        }}
        onThemeToggle={() =>
          setTheme((currentTheme) =>
            currentTheme === "dark" ? "light" : "dark"
          )
        }
        onMenuToggle={() => setMenuOpen((current) => !current)}
        theme={theme}
      />
      <MobileMenu
        isOpen={menuOpen}
        navItems={navigationItems}
        onAdminClick={() => {
          document
            .getElementById("admin")
            ?.scrollIntoView({ behavior: "smooth" });
          setMenuOpen(false);
        }}
        onClose={() => setMenuOpen(false)}
        onThemeToggle={() =>
          setTheme((currentTheme) =>
            currentTheme === "dark" ? "light" : "dark"
          )
        }
        theme={theme}
      />

      <main className="content-stack">
        <section
          id="overview"
          className="section-shell hero-section anchor-section"
        >
          <RevealOnScroll className="hero-layout">
            <div className="hero-copy compact-hero-copy">
              <div className="hero-chipline">
                <span className="eyebrow">Portfolio</span>
                <span className="status-pill subtle-pill">
                  {theme === "dark" ? "Dark interface" : "Light interface"}
                </span>
              </div>
              <h1 className="hero-name">Mutasim Sazedin</h1>
              <p className="hero-role-line">
                Full-stack Developer / Machine Learning / Research
              </p>
              <p className="hero-description">
                Building clean web apps, thoughtful interfaces, and data-driven
                projects.
              </p>
              <div className="hero-signal-strip">
                {focusAreas.map((area) => (
                  <div className="hero-signal" key={area.label}>
                    <span className="hero-signal-label">{area.label}</span>
                    <strong>{area.text}</strong>
                  </div>
                ))}
              </div>
              <div className="hero-actions">
                <a className="button-primary" href="#projects">
                  View projects
                </a>
                <a className="button-secondary" href="#contact">
                  Contact me
                </a>
              </div>

              <div className="hero-stats">
                {heroStats.map((stat) => (
                  <div className="stat-card" key={stat.label}>
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-panel glass-card hero-console compact-hero-console">
              <div className="hero-panel-head hero-console-header">
                <span className="hero-panel-kicker">Overview</span>
                <span className="status-pill">{archiveSummary}</span>
              </div>
              <div className="hero-console-body">
                <div className="console-ring" aria-hidden="true">
                  <div className="console-ring-shell">
                    <div className="console-ring-shell inner-shell">
                      <div className="console-ring-core">
                        <span>signal</span>
                        <strong>SYNC</strong>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="console-feed">
                  {runtimeFeed.map((entry) => (
                    <div className="console-feed-row" key={entry.label}>
                      <span>{entry.label}</span>
                      <strong>{entry.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hero-mini-board" aria-hidden="true">
                {overviewMetrics.map((item) => (
                  <div className="hero-mini-board-item" key={item.label}>
                    <span className="mini-board-label">{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </section>

        <section
          id="projects"
          className="section-shell anchor-section achievements-section"
        >
          <RevealOnScroll>
            <SectionHeading
              description="A curated selection of technical work."
              eyebrow="Projects"
              title="Selected projects"
            />
          </RevealOnScroll>

          <RevealOnScroll className="achievement-toolbar glass-card" delay={80}>
            <div>
              <span className="toolbar-label">Filter</span>
              <div className="filter-row">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`chip-button ${
                      selectedCategory === category ? "is-active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="toolbar-summary">
              <span className="status-pill">{archiveSummary}</span>
              <span className="status-pill">{`${projects.length} projects`}</span>
              {projectError ? (
                <span className="status-pill is-warning">Fallback active</span>
              ) : null}
            </div>
          </RevealOnScroll>

          {projectError ? (
            <RevealOnScroll className="inline-message is-warning" delay={110}>
              {projectError}
            </RevealOnScroll>
          ) : null}

          <div className="achievement-grid">
            {projectsLoading
              ? seedProjects.slice(0, 3).map((achievement) => (
                  <div className="loading-card glass-card" key={achievement.id}>
                    <div className="loading-bar wide" />
                    <div className="loading-bar" />
                    <div className="loading-bar" />
                  </div>
                ))
              : filteredProjects.map((achievement, index) => (
                  <RevealOnScroll key={achievement.id} delay={index * 60}>
                    <AchievementCard achievement={achievement} />
                  </RevealOnScroll>
                ))}
          </div>

          {!projectsLoading && filteredProjects.length === 0 ? (
            <RevealOnScroll className="empty-state glass-card">
              No projects match this filter yet.
            </RevealOnScroll>
          ) : null}
        </section>

        <section id="achievements" className="section-shell anchor-section">
          <RevealOnScroll>
            <SectionHeading
              description="Hackathons, volunteering, leadership, and other highlights."
              eyebrow="Achievements"
              title="Beyond projects"
            />
          </RevealOnScroll>

          {achievementError ? (
            <RevealOnScroll className="inline-message is-warning" delay={90}>
              {achievementError}
            </RevealOnScroll>
          ) : null}

          {achievementsLoading ? (
            <RevealOnScroll className="section-note" delay={90}>
              Loading achievements...
            </RevealOnScroll>
          ) : achievements.length ? (
            <div className="summary-grid">
              {achievements.map((item, index) => (
                <RevealOnScroll
                  className="summary-card glass-card"
                  delay={index * 70}
                  key={item.id}
                >
                  <div className="summary-card-head">
                    <span className="summary-meta">{item.meta}</span>
                    {item.year ? <span className="summary-year">{item.year}</span> : null}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  {item.link ? (
                    <a
                      className="summary-link"
                      href={item.link}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View details
                    </a>
                  ) : null}
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <RevealOnScroll className="section-note" delay={90}>
              Add achievements from the admin panel to show them here.
            </RevealOnScroll>
          )}
        </section>

        <section id="certificates" className="section-shell anchor-section">
          <RevealOnScroll>
            <SectionHeading
              description="A quick view of current certifications."
              eyebrow="Certificates"
              title="Certificates"
            />
          </RevealOnScroll>

          {certificateError ? (
            <RevealOnScroll className="inline-message is-warning" delay={90}>
              {certificateError}
            </RevealOnScroll>
          ) : null}

          {certificatesLoading ? (
            <RevealOnScroll className="section-note" delay={90}>
              Loading certificates...
            </RevealOnScroll>
          ) : certificates.length ? (
            <div className="summary-grid certificates-grid">
              {certificates.map((item, index) => (
                <RevealOnScroll
                  className="summary-card glass-card certificate-card"
                  delay={index * 70}
                  key={item.id}
                >
                  <div className="summary-card-head">
                    <span className="summary-meta">{item.issuer}</span>
                    {item.year ? <span className="summary-year">{item.year}</span> : null}
                  </div>
                  <h3>{item.title}</h3>
                  {item.credentialId ? (
                    <p className="certificate-detail">{item.credentialId}</p>
                  ) : (
                    <p className="certificate-detail">Credential available on request.</p>
                  )}
                  {item.link ? (
                    <a
                      className="summary-link"
                      href={item.link}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View credential
                    </a>
                  ) : null}
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <RevealOnScroll className="section-note" delay={90}>
              Add certificates from the admin panel to show them here.
            </RevealOnScroll>
          )}
        </section>

        <section id="contact" className="section-shell anchor-section contact-section">
          <RevealOnScroll>
            <ContactPanel contactEmail={contactEmail} />
          </RevealOnScroll>
        </section>

        <section id="admin" className="section-shell anchor-section">
          <RevealOnScroll>
            <SectionHeading
              eyebrow="Admin"
              title="Admin sign-in"
            />
          </RevealOnScroll>

          <RevealOnScroll delay={80}>
            <AdminPanel
              projects={projects}
              achievements={achievements}
              certificates={certificates}
              authLoading={authLoading}
              isAdmin={isAdmin}
              isAdminConfigured={Boolean(adminEmail)}
              isConfigured={isConfigured}
              onAddProject={addProject}
              onUpdateProject={updateProject}
              onDeleteProject={removeProject}
              onAddAchievement={addAchievement}
              onUpdateAchievement={updateAchievement}
              onDeleteAchievement={removeAchievement}
              onAddCertificate={addCertificate}
              onUpdateCertificate={updateCertificate}
              onDeleteCertificate={removeCertificate}
              onSignIn={signIn}
              onSignOut={signOutAdmin}
              user={user}
            />
          </RevealOnScroll>
        </section>
      </main>

      <footer className="site-footer">
        <p>Mutasim Sazedin portfolio</p>
        <span>Built with React, Vite, Firebase, and EmailJS.</span>
      </footer>
    </div>
  );
}

export default App;
