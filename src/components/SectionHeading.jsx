export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "left",
}) => {
  return (
    <div className={`section-heading ${align === "center" ? "is-center" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      {description ? <p className="section-description">{description}</p> : null}
    </div>
  );
};
