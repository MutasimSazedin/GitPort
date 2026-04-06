import { useEffect, useState } from "react";

const fullText = "<Hello World>";

export const LoadingScreen = ({ onComplete, theme }) => {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    let typingTimeout;
    let handoffTimeout;
    let finishTimeout;

    if (text.length < fullText.length) {
      typingTimeout = window.setTimeout(() => {
        setText(fullText.slice(0, text.length + 1));
      }, text.length < 2 ? 140 : 95);
    } else if (phase === "typing") {
      handoffTimeout = window.setTimeout(() => {
        setPhase("handoff");
      }, 620);
    } else if (phase === "handoff") {
      finishTimeout = window.setTimeout(() => {
        onComplete();
      }, 760);
    }

    return () => {
      window.clearTimeout(typingTimeout);
      window.clearTimeout(handoffTimeout);
      window.clearTimeout(finishTimeout);
    };
  }, [onComplete, phase, text.length]);

  return (
    <div
      className={`loading-screen ${
        phase === "handoff" ? "is-handoff" : ""
      }`}
      data-theme={theme}
    >
      <div className="loading-screen-grid" aria-hidden="true" />
      <div className="loading-screen-orb orb-a" aria-hidden="true" />
      <div className="loading-screen-orb orb-b" aria-hidden="true" />

      <div className="loading-console">
        <div className="loading-console-ring" aria-hidden="true">
          <div className="loading-console-ring-shell">
            <div className="loading-console-ring-core" />
          </div>
        </div>

        <div className="loading-copy">
          <div className="loading-label-row">
            <span className="loading-label">System boot</span>
            <span className="loading-phase">
              {phase === "handoff" ? "handoff" : "initializing"}
            </span>
          </div>

          <div className="loading-type-line">
            <span className="loading-type-text">{text}</span>
            <span className="loading-cursor" aria-hidden="true" />
          </div>

          <div className="loading-progress" aria-hidden="true">
            <div className="loading-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};
