import { useState } from "react";
import emailjs from "@emailjs/browser";

const initialFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() ?? "";
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim() ?? "";
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim() ?? "";
const hasEmailJsConfig = Boolean(serviceId && templateId && publicKey);

export const ContactPanel = ({ contactEmail }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState({
    type: "idle",
    message: hasEmailJsConfig
      ? "Ready to send."
      : "Add EmailJS credentials or use the email fallback.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openMailClient = () => {
    if (!contactEmail) {
      setStatus({
        type: "error",
        message: "Set VITE_CONTACT_EMAIL or configure EmailJS.",
      });
      return;
    }

    const subject = encodeURIComponent(formData.subject || "Portfolio inquiry");
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;

    setStatus({
      type: "success",
      message: "Your mail app should open with the message filled in.",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!hasEmailJsConfig) {
      openMailClient();
      setIsSubmitting(false);
      return;
    }

    setStatus({ type: "idle", message: "Sending your message..." });

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          reply_to: formData.email,
          subject: formData.subject || "Portfolio inquiry",
          message: formData.message,
        },
        {
          publicKey,
        }
      );

      setFormData(initialFormState);
      setStatus({
        type: "success",
        message: "Message sent successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.text ||
          "The message could not be sent. Use the fallback email shown on the page instead.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusClassName =
    status.type === "success"
      ? "contact-status is-success"
      : status.type === "error"
        ? "contact-status is-error"
        : "contact-status";

  return (
    <div className="contact-panel glass-card">
      <div className="contact-layout">
        <article className="contact-card">
          <div className="contact-head">
            <span className="panel-eyebrow">Contact</span>
            <span className="status-pill">
              {hasEmailJsConfig ? "Live form" : "Fallback ready"}
            </span>
          </div>
          <h2 className="contact-title">Let&apos;s connect.</h2>
          <p className="contact-copy">
            Reach out for internships, collaborations, freelance work, or
            project ideas.
          </p>

          <div className="contact-meta">
            <p className="contact-small">
              Best fit: software, ML, research, and product-focused work.
            </p>
            <p className="contact-small">
              {contactEmail
                ? `Direct email fallback: ${contactEmail}`
                : "Direct email fallback can be enabled with VITE_CONTACT_EMAIL."}
            </p>
          </div>
        </article>

        <article className="contact-card">
          <div className="panel-heading">
            <span className="panel-eyebrow">Send a message</span>
            <h3>Contact form</h3>
          </div>

          <form className="field-grid" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="contact-name">Name</label>
              <input
                className="input-field"
                id="contact-name"
                name="name"
                onChange={handleChange}
                required
                type="text"
                value={formData.name}
              />
            </div>

            <div className="field-group">
              <label htmlFor="contact-email">Email</label>
              <input
                className="input-field"
                id="contact-email"
                name="email"
                onChange={handleChange}
                required
                type="email"
                value={formData.email}
              />
            </div>

            <div className="field-group full-span">
              <label htmlFor="contact-subject">Subject</label>
              <input
                className="input-field"
                id="contact-subject"
                name="subject"
                onChange={handleChange}
                placeholder="What would you like to discuss?"
                type="text"
                value={formData.subject}
              />
            </div>

            <div className="field-group full-span">
              <label htmlFor="contact-message">Message</label>
              <textarea
                className="textarea-field"
                id="contact-message"
                name="message"
                onChange={handleChange}
                required
                value={formData.message}
              />
            </div>

            <div className="full-span action-row">
              <button className="button-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Sending..." : "Send message"}
              </button>
            </div>
          </form>

          <div className={statusClassName}>{status.message}</div>
        </article>
      </div>
    </div>
  );
};
