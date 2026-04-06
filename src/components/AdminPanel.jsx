import { useState } from "react";

const initialCredentials = {
  email: "",
  password: "",
};

const initialStatus = {
  type: "idle",
  message: "",
};

const initialProjectForm = {
  title: "",
  role: "",
  year: "",
  category: "Web App",
  summary: "",
  impact: "",
  tools: "",
  link: "",
  featured: true,
};

const initialAchievementForm = {
  title: "",
  meta: "",
  year: "",
  summary: "",
  link: "",
};

const initialCertificateForm = {
  title: "",
  issuer: "",
  year: "",
  credentialId: "",
  link: "",
};

const sections = [
  {
    id: "projects",
    label: "Projects",
    description: "Add portfolio work and keep the main showcase current.",
  },
  {
    id: "achievements",
    label: "Achievements",
    description: "Add hackathons, volunteering, leadership roles, and notable milestones.",
  },
  {
    id: "certificates",
    label: "Certificates",
    description: "Add certifications, issuers, years, and optional verification links.",
  },
];

const statusClassName = (status) => {
  if (status.type === "success") {
    return "admin-status is-success";
  }

  if (status.type === "error") {
    return "admin-status is-error";
  }

  return "admin-status";
};

export const AdminPanel = ({
  projects,
  achievements,
  certificates,
  authLoading,
  isAdmin,
  isConfigured,
  isAdminConfigured,
  onAddProject,
  onDeleteProject,
  onAddAchievement,
  onAddCertificate,
  onDeleteAchievement,
  onDeleteCertificate,
  onSignIn,
  onSignOut,
  user,
}) => {
  const [credentials, setCredentials] = useState(initialCredentials);
  const [activeSection, setActiveSection] = useState("projects");
  const [projectForm, setProjectForm] = useState(initialProjectForm);
  const [achievementForm, setAchievementForm] = useState(initialAchievementForm);
  const [certificateForm, setCertificateForm] = useState(initialCertificateForm);
  const [status, setStatus] = useState(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState("");

  const handleFormChange = (setter) => ({ target }) => {
    const { checked, files, name, type, value } = target;

    setter((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
            ? files?.[0] ?? null
            : value,
    }));
  };

  const handleCredentialChange = ({ target }) => {
    const { name, value } = target;
    setCredentials((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProjectFieldChange = handleFormChange(setProjectForm);
  const handleAchievementFieldChange = handleFormChange(setAchievementForm);
  const handleCertificateFieldChange = handleFormChange(setCertificateForm);

  const handleSignIn = async (event) => {
    event.preventDefault();
    setStatus({ type: "idle", message: "Checking admin credentials..." });

    try {
      await onSignIn(credentials);
      setCredentials(initialCredentials);
      setStatus({
        type: "success",
        message: "Signed in. You can publish updates now.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to sign in with that account.",
      });
    }
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "Uploading project..." });

    try {
      await onAddProject(projectForm);
      setProjectForm(initialProjectForm);
      setStatus({
        type: "success",
        message: "Project published successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "The upload could not be completed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAchievementSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "Publishing achievement..." });

    try {
      await onAddAchievement(achievementForm);
      setAchievementForm(initialAchievementForm);
      setStatus({
        type: "success",
        message: "Achievement published successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "The achievement could not be published.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCertificateSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "Publishing certificate..." });

    try {
      await onAddCertificate(certificateForm);
      setCertificateForm(initialCertificateForm);
      setStatus({
        type: "success",
        message: "Certificate published successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "The certificate could not be published.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSection = sections.find((section) => section.id === activeSection);
  const currentEntries =
    activeSection === "projects"
      ? projects
      : activeSection === "achievements"
        ? achievements
        : certificates;

  const handleDelete = async (entry) => {
    const contentLabel =
      activeSection === "projects"
        ? "project"
        : activeSection === "achievements"
          ? "achievement"
          : "certificate";
    const shouldDelete = window.confirm(
      `Remove "${entry.title}" from your ${contentLabel} list?`
    );

    if (!shouldDelete) {
      return;
    }

    setRemovingId(entry.id);
    setStatus({
      type: "idle",
      message: `Removing ${contentLabel}...`,
    });

    try {
      if (activeSection === "projects") {
        await onDeleteProject(entry);
      } else if (activeSection === "achievements") {
        await onDeleteAchievement(entry);
      } else {
        await onDeleteCertificate(entry);
      }

      setStatus({
        type: "success",
        message: `"${entry.title}" was removed.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || `The ${contentLabel} could not be removed.`,
      });
    } finally {
      setRemovingId("");
    }
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setStatus(initialStatus);
  };

  const counts = {
    projects: projects.length,
    achievements: achievements.length,
    certificates: certificates.length,
  };

  if (!isConfigured) {
    return (
      <div className="admin-layout">
        <article className="admin-card glass-card">
          <div className="admin-header">
            <div>
              <span className="panel-eyebrow">Setup required</span>
              <h3 className="admin-title">Portfolio publishing needs Firebase</h3>
            </div>
            <span className="status-pill is-warning">Seeded mode</span>
          </div>
          <p className="admin-copy">
            The site is running locally, but sign-in, uploads, achievements,
            certificates, and live sync stay disabled until Firebase is
            configured.
          </p>
          <div className="admin-status">
            Add the Firebase values from <code>.env.example</code>, then deploy
            again to enable sign-in and live updates.
          </div>
        </article>

        <article className="admin-card glass-card">
          <div className="panel-heading">
            <span className="panel-eyebrow">Next step</span>
            <h3>Finish setup and publish</h3>
          </div>
          <p className="admin-copy">
            Once Firebase is configured, this panel becomes your projects,
            achievements, and certificates manager.
          </p>
        </article>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-layout">
        <article className="admin-card glass-card">
          <div className="admin-header">
            <div>
              <span className="panel-eyebrow">Admin sign-in</span>
              <h3 className="admin-title">Admin sign-in</h3>
            </div>
            <span className="status-pill">{authLoading ? "Checking" : "Locked"}</span>
          </div>

          {!isAdminConfigured ? (
            <div className="admin-status is-error">
              Add <code>VITE_ADMIN_EMAIL</code> so the UI can recognize the
              admin account after sign-in.
            </div>
          ) : null}

          <form className="field-grid" onSubmit={handleSignIn}>
            <div className="field-group full-span">
              <label htmlFor="admin-email">Admin email</label>
              <input
                autoComplete="username"
                className="input-field"
                id="admin-email"
                name="email"
                onChange={handleCredentialChange}
                required
                type="email"
                value={credentials.email}
              />
            </div>

            <div className="field-group full-span">
              <label htmlFor="admin-password">Password</label>
              <input
                autoComplete="current-password"
                className="input-field"
                id="admin-password"
                name="password"
                onChange={handleCredentialChange}
                required
                type="password"
                value={credentials.password}
              />
            </div>

            <div className="full-span action-row">
              <button
                className="button-primary"
                disabled={authLoading || !isAdminConfigured}
                type="submit"
              >
                {authLoading ? "Checking session..." : "Sign in as admin"}
              </button>
            </div>
          </form>

          {status.message ? (
            <div className={statusClassName(status)}>{status.message}</div>
          ) : null}
        </article>

        <article className="admin-card glass-card">
          <div className="panel-heading">
            <span className="panel-eyebrow">Content overview</span>
            <h3>Current sections</h3>
          </div>

          <div className="management-list">
            {sections.map((section) => (
              <div className="management-list-item" key={section.id}>
                <div>
                  <strong>{section.label}</strong>
                </div>
                <span className="status-pill">{`${counts[section.id]} item${
                  counts[section.id] === 1 ? "" : "s"
                }`}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <article className="admin-card glass-card">
        <div className="admin-header">
          <div>
            <span className="panel-eyebrow">Publishing</span>
            <h3 className="admin-title">Manage your portfolio</h3>
          </div>
          <span className="status-pill is-admin">{user?.email || "Admin"}</span>
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Portfolio sections">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`admin-tab ${
                activeSection === section.id ? "is-active" : ""
              }`}
              onClick={() => handleSectionChange(section.id)}
            >
              <span>{section.label}</span>
              <strong>{counts[section.id]}</strong>
            </button>
          ))}
        </div>

        <p className="admin-copy">{currentSection?.description}</p>

        {activeSection === "projects" ? (
          <form className="field-grid" onSubmit={handleProjectSubmit}>
            <div className="field-group">
              <label htmlFor="project-title">Project title</label>
              <input
                className="input-field"
                id="project-title"
                name="title"
                onChange={handleProjectFieldChange}
                required
                type="text"
                value={projectForm.title}
              />
            </div>

            <div className="field-group">
              <label htmlFor="project-role">Role</label>
              <input
                className="input-field"
                id="project-role"
                name="role"
                onChange={handleProjectFieldChange}
                required
                type="text"
                value={projectForm.role}
              />
            </div>

            <div className="field-group">
              <label htmlFor="project-year">Year or period</label>
              <input
                className="input-field"
                id="project-year"
                name="year"
                onChange={handleProjectFieldChange}
                required
                type="text"
                value={projectForm.year}
              />
            </div>

            <div className="field-group">
              <label htmlFor="project-category">Category</label>
              <select
                className="select-field"
                id="project-category"
                name="category"
                onChange={handleProjectFieldChange}
                value={projectForm.category}
              >
                <option value="Web App">Web App</option>
                <option value="Research">Research</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Data">Data</option>
                <option value="Game Development">Game Development</option>
              </select>
            </div>

            <div className="field-group full-span">
              <label htmlFor="project-summary">Summary</label>
              <textarea
                className="textarea-field"
                id="project-summary"
                name="summary"
                onChange={handleProjectFieldChange}
                required
                value={projectForm.summary}
              />
            </div>

            <div className="field-group full-span">
              <label htmlFor="project-impact">Impact</label>
              <textarea
                className="textarea-field"
                id="project-impact"
                name="impact"
                onChange={handleProjectFieldChange}
                required
                value={projectForm.impact}
              />
            </div>

            <div className="field-group full-span">
              <label htmlFor="project-tools">Tools and technologies</label>
              <input
                className="input-field"
                id="project-tools"
                name="tools"
                onChange={handleProjectFieldChange}
                placeholder="Python, TensorFlow, Power BI"
                required
                type="text"
                value={projectForm.tools}
              />
            </div>

            <div className="field-group full-span">
              <label htmlFor="project-link">Project link</label>
              <input
                className="input-field"
                id="project-link"
                name="link"
                onChange={handleProjectFieldChange}
                placeholder="https://..."
                type="url"
                value={projectForm.link}
              />
            </div>

            <div className="field-group full-span">
              <label className="checkbox-field" htmlFor="project-featured">
                <input
                  checked={projectForm.featured}
                  id="project-featured"
                  name="featured"
                  onChange={handleProjectFieldChange}
                  type="checkbox"
                />
                <span>Mark as featured</span>
              </label>
            </div>

            <div className="full-span action-row">
              <button className="button-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Uploading..." : "Publish project"}
              </button>
              <button className="button-secondary" type="button" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          </form>
        ) : null}

        {activeSection === "achievements" ? (
          <form className="field-grid" onSubmit={handleAchievementSubmit}>
            <div className="field-group">
              <label htmlFor="achievement-title">Achievement title</label>
              <input
                className="input-field"
                id="achievement-title"
                name="title"
                onChange={handleAchievementFieldChange}
                required
                type="text"
                value={achievementForm.title}
              />
            </div>

            <div className="field-group">
              <label htmlFor="achievement-meta">Category or organization</label>
              <input
                className="input-field"
                id="achievement-meta"
                name="meta"
                onChange={handleAchievementFieldChange}
                placeholder="Hackathon, Volunteer work, Club role"
                required
                type="text"
                value={achievementForm.meta}
              />
            </div>

            <div className="field-group full-span">
              <label htmlFor="achievement-year">Year or period</label>
              <input
                className="input-field"
                id="achievement-year"
                name="year"
                onChange={handleAchievementFieldChange}
                placeholder="2026 or 2025-2026"
                required
                type="text"
                value={achievementForm.year}
              />
            </div>

            <div className="field-group full-span">
              <label htmlFor="achievement-summary">Summary</label>
              <textarea
                className="textarea-field"
                id="achievement-summary"
                name="summary"
                onChange={handleAchievementFieldChange}
                required
                value={achievementForm.summary}
              />
            </div>

            <div className="field-group full-span">
              <label htmlFor="achievement-link">Optional link</label>
              <input
                className="input-field"
                id="achievement-link"
                name="link"
                onChange={handleAchievementFieldChange}
                placeholder="https://..."
                type="url"
                value={achievementForm.link}
              />
            </div>

            <div className="full-span action-row">
              <button className="button-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Publishing..." : "Publish achievement"}
              </button>
              <button className="button-secondary" type="button" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          </form>
        ) : null}

        {activeSection === "certificates" ? (
          <form className="field-grid" onSubmit={handleCertificateSubmit}>
            <div className="field-group">
              <label htmlFor="certificate-title">Certificate title</label>
              <input
                className="input-field"
                id="certificate-title"
                name="title"
                onChange={handleCertificateFieldChange}
                required
                type="text"
                value={certificateForm.title}
              />
            </div>

            <div className="field-group">
              <label htmlFor="certificate-issuer">Issuer</label>
              <input
                className="input-field"
                id="certificate-issuer"
                name="issuer"
                onChange={handleCertificateFieldChange}
                required
                type="text"
                value={certificateForm.issuer}
              />
            </div>

            <div className="field-group">
              <label htmlFor="certificate-year">Year</label>
              <input
                className="input-field"
                id="certificate-year"
                name="year"
                onChange={handleCertificateFieldChange}
                required
                type="text"
                value={certificateForm.year}
              />
            </div>

            <div className="field-group">
              <label htmlFor="certificate-id">Credential ID</label>
              <input
                className="input-field"
                id="certificate-id"
                name="credentialId"
                onChange={handleCertificateFieldChange}
                placeholder="Optional"
                type="text"
                value={certificateForm.credentialId}
              />
            </div>

            <div className="field-group full-span">
              <label htmlFor="certificate-link">Verification link</label>
              <input
                className="input-field"
                id="certificate-link"
                name="link"
                onChange={handleCertificateFieldChange}
                placeholder="https://..."
                type="url"
                value={certificateForm.link}
              />
            </div>

            <div className="full-span action-row">
              <button className="button-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Publishing..." : "Publish certificate"}
              </button>
              <button className="button-secondary" type="button" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          </form>
        ) : null}

        {activeSection === "projects" ? (
          <p className="form-note">
            Comma-separated technologies become the chips shown on each
            project card.
          </p>
        ) : null}

        {status.message ? (
          <div className={statusClassName(status)}>{status.message}</div>
        ) : null}
      </article>

      <article className="admin-card glass-card">
        <div className="panel-heading">
          <span className="panel-eyebrow">Current list</span>
          <h3>{currentSection?.label}</h3>
        </div>

        {currentEntries.length ? (
          <div className="management-list">
            {currentEntries.map((entry) => (
              <div className="management-list-item" key={entry.id}>
                <div>
                  <strong>{entry.title}</strong>
                  <span>
                    {activeSection === "projects"
                      ? `${entry.category} / ${entry.year}`
                      : activeSection === "achievements"
                        ? `${entry.meta} / ${entry.year}`
                        : `${entry.issuer} / ${entry.year}`}
                  </span>
                </div>
                <button
                  className="button-ghost danger-button"
                  disabled={removingId === entry.id}
                  type="button"
                  onClick={() => handleDelete(entry)}
                >
                  {removingId === entry.id ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="management-empty">
            No {currentSection?.label?.toLowerCase() || "items"} added yet.
          </p>
        )}
      </article>
    </div>
  );
};
