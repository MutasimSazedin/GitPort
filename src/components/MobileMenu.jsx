import { useEffect } from "react";

export const MobileMenu = ({
  navItems,
  isOpen,
  onAdminClick,
  onClose,
  onThemeToggle,
  theme,
}) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className={`mobile-menu ${isOpen ? "is-open" : ""}`}>
      <div className="mobile-menu-panel">
        <button
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className={`theme-toggle mobile-theme-toggle ${
            theme === "dark" ? "is-dark" : "is-light"
          }`}
          type="button"
          onClick={onThemeToggle}
        >
          <span className="theme-toggle-copy">
            <span className="theme-toggle-label">Theme</span>
            <span className="theme-toggle-value">{theme}</span>
          </span>
            <span className="theme-toggle-knob" aria-hidden="true" />
        </button>
        <button
          className="button-ghost admin-nav-button mobile-admin-button"
          type="button"
          onClick={onAdminClick}
        >
          Admin
        </button>
        {navItems.map((item) => (
          <a
            className="mobile-link"
            href={item.href}
            key={item.href}
            onClick={onClose}
          >
            <span>{item.label}</span>
            <span>+</span>
          </a>
        ))}
        <button className="button-secondary" type="button" onClick={onClose}>
          Close menu
        </button>
      </div>
    </div>
  );
};
