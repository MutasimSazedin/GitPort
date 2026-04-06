export const Navbar = ({
  navItems,
  menuOpen,
  onAdminClick,
  onThemeToggle,
  onMenuToggle,
  theme,
}) => {
  return (
    <header className="site-nav">
      <div className="site-nav-frame">
        <a className="site-brand" href="#overview">
          <span>Portfolio</span>
          <strong>Mutasim Sazedin</strong>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {navItems.map((item) => (
            <a className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav-utility">
          <button className="button-ghost admin-nav-button" type="button" onClick={onAdminClick}>
            Admin
          </button>
          <button
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className={`theme-toggle ${
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
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="menu-button"
            type="button"
            onClick={onMenuToggle}
          >
            {menuOpen ? "x" : "+"}
          </button>
        </div>
      </div>
    </header>
  );
};
