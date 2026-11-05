import { useState } from "react";
import { askEducationQuestion } from "../api.js";

export default function QuestionStudio() {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || isLoading) return;

    setError("");
    setNotice("");
    setAnswer("");
    setSubmittedQuestion(cleanQuestion);
    setQuestion("");
    setIsLoading(true);

    try {
      const result = await askEducationQuestion(cleanQuestion);
      if (typeof result?.answer !== "string" || !result.answer.trim()) {
        throw new Error("The education service returned an empty answer.");
      }
      setAnswer(result.answer.trim());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Your question could not be answered. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function copyAnswer() {
    try {
      await navigator.clipboard.writeText(answer);
      setNotice("Answer copied to your clipboard.");
      setError("");
    } catch {
      setError("Could not access the clipboard. Please copy the answer manually.");
      setNotice("");
    }
  }

  return (
    <div className="chat-scroll-area education-scroll-area">
      <main className="question-studio">
        <div className="studio-breadcrumb">
          <span>Nova</span>
          <span aria-hidden="true">/</span>
          <strong>Question studio</strong>
          <span className="studio-live-dot" />
          <span className="studio-live-label">Education assistant</span>
        </div>

        <section className="studio-hero">
          <div className="studio-hero-copy">
            <span className="studio-eyebrow"><span>✦</span> YOUR PERSONAL LEARNING ASSISTANT</span>
            <h1>Curious about<br /><span>something? Ask away.</span></h1>
            <p>
              Ask a question about your learning material and get a clear,
              helpful answer.
            </p>
          </div>
          <div className="studio-hero-art" aria-hidden="true">
            <div className="studio-art-orbit orbit-one" />
            <div className="studio-art-orbit orbit-two" />
            <div className="studio-art-card"><span>Q</span><i>✦</i></div>
            <span className="studio-art-spark spark-one">✳</span>
            <span className="studio-art-spark spark-two">✧</span>
            <span className="studio-art-dot" />
          </div>
        </section>

        <div className="studio-layout">
          <form className="studio-form-card" onSubmit={handleSubmit}>
            <div className="studio-card-heading">
              <span className="studio-step">01</span>
              <div>
                <h2>Ask your question</h2>
                <p>Keep it simple. We’ll find the answer for you.</p>
              </div>
              <span className="studio-card-sparkle">✳</span>
            </div>

            <label className="studio-label" htmlFor="question-topic">What would you like to know?</label>
            <div className="topic-input-wrap question-input-wrap">
              <span aria-hidden="true">⌕</span>
              <textarea
                id="question-topic"
                value={question}
                onChange={(event) => {
                  setQuestion(event.target.value);
                  setAnswer("");
                  setError("");
                  setNotice("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form.requestSubmit();
                  }
                }}
                placeholder="e.g. What is a widget?"
                maxLength={1000}
                rows={3}
                required
              />
              <span className="topic-input-decoration" aria-hidden="true">✦</span>
            </div>

            <div className="studio-form-footer">
              <span className="question-hint">Press Enter to ask · Shift + Enter for a new line</span>
              <button className="generate-questions-button" type="submit" disabled={!question.trim() || isLoading}>
                {isLoading ? (
                  <><span className="generate-spinner" /> Finding answer...</>
                ) : (
                  <>Get answer <span aria-hidden="true">↗</span></>
                )}
              </button>
            </div>
          </form>

          <aside className="studio-tip-card">
            <div className="tip-card-icon">✦</div>
            <span className="tip-card-kicker">ASK AWAY</span>
            <h3>Small questions can lead to big ideas.</h3>
            <p>Ask in your own words. Try a topic from your lessons to get started.</p>
            <div className="tip-card-footer"><span /> Here to help you learn</div>
          </aside>
        </div>

        {(error || notice) && (
          <p className={`studio-feedback${error ? " error" : ""}`} role={error ? "alert" : "status"}>
            <span>{error ? "!" : "✓"}</span>{error || notice}
            {error && <button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button>}
          </p>
        )}

        {answer ? (
          <section className="generated-set answer-set" aria-live="polite">
            <div className="generated-set-heading">
              <div>
                <span className="generated-kicker">YOUR ANSWER</span>
                <h2>{submittedQuestion}</h2>
              </div>
              <div className="generated-actions">
                <button type="button" className="generated-action copy-questions" onClick={copyAnswer}>
                  <span aria-hidden="true">▢</span> Copy answer
                </button>
              </div>
            </div>
            <article className="generated-question answer-card">
              <span className="generated-question-number" aria-hidden="true">✦</span>
              <p>{answer}</p>
            </article>
          </section>
        ) : (
          <div className="studio-empty-state">
            <span className="empty-state-icon">✳</span>
            <div><strong>Your answer will appear here</strong><span>Type a question above to get a clear, helpful answer.</span></div>
            <span className="empty-state-count">— — —</span>
          </div>
        )}
      </main>
    </div>
  );
}
