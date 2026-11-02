import { useEffect, useRef, useState } from "react";
import Brand from "./Brand.jsx";
import { sendChatMessage } from "../api.js";

const suggestions = [
  {
    icon: "✳",
    className: "idea-icon",
    title: "Spark an idea",
    description: "Brainstorm something wonderfully unexpected",
    prompt: "Help me brainstorm a creative project I can start this weekend",
  },
  {
    icon: "↗",
    className: "travel-icon",
    title: "Plan an adventure",
    description: "Build a trip that feels like you",
    prompt:
      "Plan a relaxing weekend in Kyoto with food, culture, and a little adventure",
  },
  {
    icon: "⌘",
    className: "learn-icon",
    title: "Learn something",
    description: "Make a big idea feel beautifully simple",
    prompt: "Explain a tricky concept in a simple, memorable way",
  },
  {
    icon: "✎",
    className: "write-icon",
    title: "Find the words",
    description: "Turn a blank page into a first draft",
    prompt: "Help me write a thoughtful message for someone important to me",
  },
];

const initialHistory = [
  "A little inspiration",
  "Weekend in Kyoto",
  "Easy weeknight recipes",
];

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
    </svg>
  );
}

export default function ChatPage({ user }) {
  const username =
    typeof user.name === "string" && user.name.trim()
      ? user.name.trim()
      : user.email
        ? user.email.split("@")[0].split(/[._-]/)[0]
        : "Rutuja";
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);
  const [messages, setMessages] = useState([]);
  const [isResponding, setIsResponding] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState(initialHistory);
  const [activeHistory, setActiveHistory] = useState(initialHistory[0]);
  const [currentChatTitle, setCurrentChatTitle] = useState(initialHistory[0]);
  const [model, setModel] = useState("Advanced");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const textareaRef = useRef(null);
  const chatScrollArea = useRef(null);
  const toastTimer = useRef(null);
  const requestId = useRef(0);

  useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (chatScrollArea.current) {
      chatScrollArea.current.scrollTop = chatScrollArea.current.scrollHeight;
    }
  }, [messages, isResponding]);

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        startNewChat();
      }
      if (event.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  });

  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  }

  function startNewChat() {
    requestId.current += 1;
    setMessages([]);
    setIsResponding(false);
    setCurrentChatTitle("New chat");
    setActiveHistory("");
    setSidebarOpen(false);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }

  function selectHistory(title) {
    requestId.current += 1;
    setActiveHistory(title);
    setCurrentChatTitle(title);
    setMessages([]);
    setSidebarOpen(false);
  }

  function handleInputChange(event) {
    setInput(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 130)}px`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isResponding) return;

    const currentRequestId = ++requestId.current;
    setMessages((current) => [...current, { role: "user", text }]);
    if (currentChatTitle === "New chat") {
      const title = text.length > 27 ? `${text.slice(0, 27).trim()}…` : text;
      setCurrentChatTitle(title);
      setActiveHistory(title);
      setHistory((current) => [title, ...current.slice(0, 2)]);
    }
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsResponding(true);
    try {
      const result = await sendChatMessage(text);
      const responseData = result?.data ?? result;
      const answer =
        typeof responseData === "string"
          ? responseData
          : responseData?.response ||
            responseData?.reply ||
            responseData?.answer ||
            responseData?.message;

      if (typeof answer !== "string" || !answer.trim()) {
        throw new Error("The chat service returned an empty response.");
      }

      if (requestId.current === currentRequestId) {
        setMessages((current) => [
          ...current,
          { role: "assistant", text: answer },
        ]);
      }
    } catch (error) {
      if (requestId.current === currentRequestId) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            text:
              error instanceof Error
                ? error.message
                : "Something went wrong. Please try again.",
          },
        ]);
      }
    } finally {
      if (requestId.current === currentRequestId) setIsResponding(false);
    }
  }

  function handleSuggestion(prompt) {
    setInput(prompt);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        130,
      )}px`;
      textareaRef.current.focus();
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form.requestSubmit();
    }
  }

  return (
    <section className="chat-page" aria-label="AI chat">
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-top">
          <Brand className="chat-brand" />
          <button
            className="icon-button sidebar-collapse"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5h16M4 12h10M4 19h16" />
              <path d="m17 9 3 3-3 3" />
            </svg>
          </button>
        </div>
        <button className="new-chat-button" onClick={startNewChat}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>New chat</span>
          <kbd>⌘ K</kbd>
        </button>

        <div className="history-section">
          <p className="sidebar-label">RECENT</p>
          {history.map((title) => (
            <button
              className={`history-item${activeHistory === title ? " active" : ""}`}
              key={title}
              onClick={() => selectHistory(title)}
            >
              <HistoryIcon />
              <span>{title}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-spacer" />
        <div className="sidebar-bottom">
          <button
            className="utility-link"
            onClick={() => showToast("Help & FAQ will be available soon.")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.6 9a2.5 2.5 0 1 1 4.5 1.5c-1.1 1.2-2.1 1.4-2.1 3" />
              <path d="M12 17.5h.01" />
            </svg>
            Help &amp; FAQ
          </button>
          <button
            className="profile-button"
            onClick={() => showToast("Profile settings will be available soon.")}
          >
            <span className="profile-avatar">{displayName.charAt(0)}</span>
            <span className="profile-details">
              <strong>{displayName}</strong>
              <small>Free plan</small>
            </span>
            <svg className="profile-more" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="5" cy="12" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="chat-main">
        <header className="chat-header">
          <button
            className="icon-button mobile-menu"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="model-picker-wrap">
            <button
              className="model-picker"
              aria-expanded={modelMenuOpen}
              onClick={() => setModelMenuOpen((open) => !open)}
            >
              <span className="gemini-glyph small-glyph">✦</span>
              <span>
                Gemini <span className="model-light">{model}</span>
              </span>
              <svg className="chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </button>
            {modelMenuOpen && (
              <div className="model-menu">
                {["Advanced", "Flash"].map((modelName) => (
                  <button
                    className={`model-option${model === modelName ? " selected" : ""}`}
                    key={modelName}
                    onClick={() => {
                      setModel(modelName);
                      setModelMenuOpen(false);
                    }}
                  >
                    <span
                      className={`option-glyph${modelName === "Flash" ? " fast-glyph" : ""}`}
                    >
                      {modelName === "Flash" ? "✧" : "✦"}
                    </span>
                    <span>
                      <strong>Gemini {modelName}</strong>
                      <small>
                        {modelName === "Flash"
                          ? "Fast for everyday help"
                          : "Best for complex tasks"}
                      </small>
                    </span>
                    {model === modelName && (
                      <span className="checkmark">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="header-actions">
            <button
              className="upgrade-button"
              onClick={() => showToast("Plan options will be available soon.")}
            >
              <span>✦</span> Upgrade
            </button>
            <button
              className="icon-button header-more"
              aria-label="More options"
              onClick={() => showToast("More chat options will be available soon.")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="5" cy="12" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
              </svg>
            </button>
          </div>
        </header>

        <div className="chat-scroll-area" ref={chatScrollArea}>
          {messages.length === 0 ? (
            <div className="welcome-content">
              <div className="welcome-orb" aria-hidden="true">
                <span>✦</span>
              </div>
              <p className="welcome-overline">YOUR CREATIVE SIDEKICK</p>
              <h1>
                Good morning, <span>{displayName}</span>
                <span className="wave">✳</span>
              </h1>
              <p className="welcome-subtitle">
                What would you like to explore today?
              </p>
              <div className="suggestion-grid">
                {suggestions.map((suggestion) => (
                  <button
                    className="suggestion-card"
                    key={suggestion.title}
                    onClick={() => handleSuggestion(suggestion.prompt)}
                  >
                    <span className={`suggestion-icon ${suggestion.className}`}>
                      {suggestion.icon}
                    </span>
                    <span className="suggestion-title">{suggestion.title}</span>
                    <span className="suggestion-description">
                      {suggestion.description}
                    </span>
                    <span className="suggestion-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="conversation" aria-live="polite">
              {messages.map((message, index) => (
                <article
                  className={`message ${
                    message.role === "user" ? "user-message" : "assistant-message"
                  }`}
                  key={`${message.role}-${index}`}
                >
                  <span className="message-avatar">
                    {message.role === "user" ? displayName.charAt(0) : "✦"}
                  </span>
                  <div className="message-body">
                    <p>{message.text}</p>
                  </div>
                </article>
              ))}
              {isResponding && (
                <article className="message assistant-message">
                  <span className="message-avatar">✦</span>
                  <div className="message-body">
                    <div className="typing-dots" aria-label="Preparing preview">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </article>
              )}
            </div>
          )}
        </div>

        <div className="composer-area">
          <form className="composer" onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              rows="1"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              aria-label="Message Gemini"
            />
            <div className="composer-toolbar">
              <div className="composer-tools">
                <button
                  type="button"
                  className="composer-tool"
                  aria-label="Attach a file"
                  onClick={() =>
                    showToast("File attachments will be available in a future update.")
                  }
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m8.5 12.5 6.4-6.4a3 3 0 0 1 4.2 4.2l-8.6 8.6a5 5 0 0 1-7.1-7.1l8.5-8.5" />
                  </svg>
                </button>
                <span className="tool-divider" />
                <button
                  type="button"
                  className="search-tool"
                  aria-pressed={searchEnabled}
                  onClick={() => {
                    setSearchEnabled((enabled) => !enabled);
                    showToast(
                      searchEnabled
                        ? "Web search turned off."
                        : "Web search enabled for this chat preview.",
                    );
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 4.5 4.5" />
                  </svg>
                  <span>Search</span>
                </button>
              </div>
              <div className="composer-right">
                <span className="composer-hint">Gemini can make mistakes</span>
                <button
                  type="submit"
                  className="send-button"
                  aria-label="Send message"
                  disabled={!input.trim() || isResponding}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 19V5M6 11l6-6 6 6" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
          <p className="composer-disclaimer">
            By using Nova, you agree to our{" "}
            <a href="#" onClick={(event) => {
              event.preventDefault();
              showToast("Terms will be available soon.");
            }}>
              Terms
            </a>{" "}
            and{" "}
            <a href="#" onClick={(event) => {
              event.preventDefault();
              showToast("Privacy policy will be available soon.");
            }}>
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
      <div className={`toast${toast ? " visible" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
      <div
        className={`mobile-scrim${sidebarOpen ? " visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
    </section>
  );
}
