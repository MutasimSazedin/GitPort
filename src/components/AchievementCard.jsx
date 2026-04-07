export const AchievementCard = ({ achievement }) => {
  const {
    title,
    role,
    year,
    category,
    summary,
    impact,
    technologies,
    link,
    githubUrl,
    imageUrl,
  } = achievement;

  return (
    <article className="achievement-card">
      <div className="achievement-media">
        {imageUrl ? (
          <img alt={title} src={imageUrl} />
        ) : (
          <div className="achievement-placeholder">
            <span>{category}</span>
          </div>
        )}
      </div>

      <div className="achievement-body">
        <div className="achievement-meta">
          <span className="achievement-category">{category}</span>
          <span className="achievement-year">{year}</span>
        </div>

        <div>
          <h3 className="achievement-title">{title}</h3>
          <span className="achievement-role">{role}</span>
        </div>

        <p>{summary}</p>

        <div className="achievement-impact">
          <strong>Key result</strong>
          <span>{impact}</span>
        </div>

        <div className="achievement-tools">
          <div className="chip-row">
            {technologies.map((technology) => (
              <span className="chip" key={technology}>
                {technology}
              </span>
            ))}
          </div>
        </div>

        {link || githubUrl ? (
          <div className="achievement-links">
            {link ? (
              <a
                className="achievement-link"
                href={link}
                rel="noreferrer"
                target="_blank"
              >
                View project
              </a>
            ) : null}
            {githubUrl ? (
              <a
                className="achievement-link"
                href={githubUrl}
                rel="noreferrer"
                target="_blank"
              >
                GitHub repo
              </a>
            ) : null}
          </div>
        ) : (
          <span className="achievement-link">Case study available on request</span>
        )}
      </div>
    </article>
  );
};
