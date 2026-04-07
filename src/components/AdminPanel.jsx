import { useState } from "react";

const initialCredentials = {
  email: "",
  password: "",
};

const initialStatus = {
  type: "idle",
  message: "",
};

const createInitialProjectForm = (displayOrder = 1) => ({
  title: "",
  role: "",
  year: "",
  category: "Web App",
  summary: "",
  impact: "",
  tools: "",
  link: "",
  githubUrl: "",
  featured: true,
  displayOrder: String(Math.max(displayOrder, 1)),
});

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
    description:
      "Add, edit, remove, and reorder project cards. Serial numbers stay hidden on the public cards.",
  },
  {
    id: "achievements",
    label: "Achievements",
    description:
      "Manage the Beyond projects cards, including edits to titles, summaries, dates, and links.",
  },
  {
    id: "certificates",
    label: "Certificates",
    description:
      "Add and edit certifications, issuers, years, credential IDs, and verification links.",
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

const getProjectDisplayOrder = (project, projects) => {
  if (Number.isInteger(project.displayOrder) && project.displayOrder > 0) {
    return project.displayOrder;
  }

  return projects.findIndex((entry) => entry.id === project.id) + 1;
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
  onUpdateProject,
  onDeleteProject,
  onAddAchievement,
  onUpdateAchievement,
  onAddCertificate,
  onUpdateCertificate,
  onDeleteAchievement,
  onDeleteCertificate,
  onSignIn,
  onSignOut,
  user,
}) => {
  const [credentials, setCredentials] = useState(initialCredentials);
  const [activeSection, setActiveSection] = useState("projects");
  const [projectForm, setProjectForm] = useState(() =>
    createInitialProjectForm(projects.length + 1)
  );
  const [achievementForm, setAchievementForm] = useState(initialAchievementForm);
  const [certificateForm, setCertificateForm] = useState(initialCertificateForm);
  const [editingState, setEditingState] = useState(null);
  const [status, setStatus] = useState(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState("");

  const resetSectionEditor = (
    sectionId,
    nextProjectDisplayOrder = projects.length + 1
  ) => {
    setEditingState(null);

    if (sectionId === "projects") {
      setProjectForm(createInitialProjectForm(nextProjectDisplayOrder));
      return;
    }

    if (sectionId === "achievements") {
      setAchievementForm(initialAchievementForm);
      return;
    }

    setCertificateForm(initialCertificateForm);
  };

  const handleFormChange = (setter) => ({ target }) => {
    const { checked, name, type, value } = target;

    setter((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
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
    const editingProject =
      editingState?.section === "projects"
        ? projects.find((project) => project.id === editingState.entryId) ?? null
        : null;

    setIsSubmitting(true);
    setStatus({
      type: "idle",
      message: editingProject
        ? "Saving project changes..."
        : "Uploading project...",
    });

    try {
      if (editingProject) {
        await onUpdateProject(editingProject, projectForm);
      } else {
        await onAddProject(projectForm);
      }

      resetSectionEditor("projects", projects.length + 1);
      setStatus({
        type: "success",
        message: editingProject
          ? "Project updated successfully."
          : "Project published successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "The project could not be saved.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAchievementSubmit = async (event) => {
    event.preventDefault();
    const editingAchievement =
      editingState?.section === "achievements"
        ? achievements.find((item) => item.id === editingState.entryId) ?? null
        : null;

    setIsSubmitting(true);
    setStatus({
      type: "idle",
      message: editingAchievement
        ? "Saving achievement changes..."
        : "Publishing achievement...",
    });

    try {
      if (editingAchievement) {
        await onUpdateAchievement(editingAchievement, achievementForm);
      } else {
        await onAddAchievement(achievementForm);
      }

      resetSectionEditor("achievements");
      setStatus({
        type: "success",
        message: editingAchievement
          ? "Achievement updated successfully."
          : "Achievement published successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "The achievement could not be saved.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCertificateSubmit = async (event) => {
    event.preventDefault();
    const editingCertificate =
      editingState?.section === "certificates"
        ? certificates.find((item) => item.id === editingState.entryId) ?? null
        : null;

    setIsSubmitting(true);
    setStatus({
      type: "idle",
      message: editingCertificate
        ? "Saving certificate changes..."
        : "Publishing certificate...",
    });

    try {
      if (editingCertificate) {
        await onUpdateCertificate(editingCertificate, certificateForm);
      } else {
        await onAddCertificate(certificateForm);
      }

      resetSectionEditor("certificates");
      setStatus({
        type: "success",
        message: editingCertificate
          ? "Certificate updated successfully."
          : "Certificate published successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "The certificate could not be saved.",
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
  const currentEditingEntry =
    editingState?.section === activeSection
      ? currentEntries.find((entry) => entry.id === editingState.entryId) ?? null
      : null;
  const isEditing = Boolean(currentEditingEntry);

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
        if (
          editingState?.section === "projects" &&
          editingState.entryId === entry.id
        ) {
          resetSectionEditor("projects", Math.max(projects.length, 1));
        }
      } else if (activeSection === "achievements") {
        await onDeleteAchievement(entry);
        if (
          editingState?.section === "achievements" &&
          editingState.entryId === entry.id
        ) {
          resetSectionEditor("achievements");
        }
      } else {
        await onDeleteCertificate(entry);
        if (
          editingState?.section === "certificates" &&
          editingState.entryId === entry.id
        ) {
          resetSectionEditor("certificates");
        }
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
    resetSectionEditor(sectionId, projects.length + 1);
    setStatus(initialStatus);
  };

  const handleEdit = (entry) => {
    if (activeSection === "projects") {
      setProjectForm({
        title: entry.title,
        role: entry.role,
        year: entry.year,
        category: entry.category,
        summary: entry.summary,
        impact: entry.impact,
        tools: entry.technologies.join(", "),
        link: entry.link || "",
        githubUrl: entry.githubUrl || "",
        featured: Boolean(entry.featured),
        displayOrder: String(getProjectDisplayOrder(entry, projects)),
      });
    } else if (activeSection === "achievements") {
      setAchievementForm({
        title: entry.title,
        meta: entry.meta,
        year: entry.year,
        summary: entry.summary,
        link: entry.link || "",
      });
    } else {
      setCertificateForm({
        title: entry.title,
        issuer: entry.issuer,
        year: entry.year,
        credentialId: entry.credentialId || "",
        link: entry.link || "",
      });
    }

    setEditingState({
      section: activeSection,
      entryId: entry.id,
    });
    setStatus({
      type: "idle",
      message: `Editing "${entry.title}".`,
    });
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

        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              {isEditing ? "Edit mode" : "Create mode"}
            </span>
            <h3>
              {activeSection === "projects"
                ? isEditing
                  ? "Edit project"
                  : "Add project"
                : activeSection === "achievements"
                  ? isEditing
                    ? "Edit achievement"
                    : "Add achievement"
                  : isEditing
                    ? "Edit certificate"
                    : "Add certificate"}
            </h3>
          </div>

          {isEditing ? (
            <button
              className="button-ghost"
              type="button"
              onClick={() => resetSectionEditor(activeSection, projects.length + 1)}
            >
              Cancel edit
            </button>
          ) : null}
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

            <div className="field-group">
              <label htmlFor="project-display-order">Serial number</label>
              <input
                className="input-field"
                id="project-display-order"
                min="1"
                name="displayOrder"
                onChange={handleProjectFieldChange}
                required
                type="number"
                value={projectForm.displayOrder}
              />
            </div>

            <div className="field-group">
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
              <label htmlFor="project-github-url">GitHub repo link</label>
              <input
                className="input-field"
                id="project-github-url"
                name="githubUrl"
                onChange={handleProjectFieldChange}
                placeholder="https://github.com/..."
                type="url"
                value={projectForm.githubUrl}
              />
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
                {isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Uploading..."
                  : isEditing
                    ? "Save project"
                    : "Publish project"}
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
                {isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Publishing..."
                  : isEditing
                    ? "Save achievement"
                    : "Publish achievement"}
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
                {isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Publishing..."
                  : isEditing
                    ? "Save certificate"
                    : "Publish certificate"}
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
            project card. The serial number only controls order in the public
            list and stays hidden on the card itself.
          </p>
        ) : null}

        {status.message ? (
          <div className={statusClassName(status)}>{status.message}</div>
        ) : null}
      </article>

      <article className="admin-card glass-card">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">Current list</span>
            <h3>{currentSection?.label}</h3>
          </div>
          {activeSection === "projects" ? (
            <span className="status-pill">Hidden serial order</span>
          ) : null}
        </div>

        {currentEntries.length ? (
          <div className="management-list">
            {currentEntries.map((entry) => (
              <div className="management-list-item" key={entry.id}>
                <div className="management-meta">
                  {activeSection === "projects" ? (
                    <span className="management-order-badge">
                      #{getProjectDisplayOrder(entry, projects)}
                    </span>
                  ) : null}
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
                </div>
                <div className="management-actions">
                  <button
                    className="button-ghost"
                    type="button"
                    onClick={() => handleEdit(entry)}
                  >
                    Edit
                  </button>
                  <button
                    className="button-ghost danger-button"
                    disabled={removingId === entry.id}
                    type="button"
                    onClick={() => handleDelete(entry)}
                  >
                    {removingId === entry.id ? "Removing..." : "Remove"}
                  </button>
                </div>
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
