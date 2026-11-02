import { useState } from "react";
import Brand from "./Brand.jsx";
import { loginAccount, registerAccount } from "../api.js";

export default function LoginPage({ onLogin }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const credentials = {
      email,
      password: formData.get("password"),
    };

    setMessage("");
    setHasError(false);
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await registerAccount({ ...credentials, name });
        setMode("login");
        setMessage("Account created. Sign in with your new account.");
      } else {
        const result = await loginAccount(credentials);
        const responseData = result?.data ?? result;
        const account = responseData?.user ?? responseData;
        const accountName = account?.name || account?.full_name;
        onLogin({
          email: account?.email || email,
          name: typeof accountName === "string" ? accountName : name,
          token:
            responseData?.access_token ||
            responseData?.accessToken ||
            responseData?.token,
        });
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="login-page" aria-label="Sign in">
      <div className="login-backdrop" aria-hidden="true">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="orb orb-three" />
        <div className="star-field" />
      </div>
      <Brand className="login-brand" />

      <div className="login-layout">
        <div className="login-intro">
          <div className="eyebrow">
            <span className="status-dot" /> A new way to think
          </div>
          <h1>
            Ideas, meet
            <br />
            <span>imagination.</span>
          </h1>
          <p>
            Your space to explore, create, and make the impossible feel
            effortless.
          </p>
          <div className="intro-note">
            <div className="mini-avatars" aria-hidden="true">
              <span>J</span>
              <span>M</span>
              <span>A</span>
            </div>
            <span>Made for curious minds</span>
            <span className="note-sparkle">✳</span>
          </div>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <div className="card-heading">
            <div className="gemini-glyph" aria-hidden="true">
              ✦
            </div>
            <p className="card-kicker">
              {mode === "login" ? "WELCOME TO NOVA" : "JOIN NOVA"}
            </p>
            <h2>
              {mode === "login" ? "Sign in to your space" : "Create your account"}
            </h2>
            <p className="card-subtitle">
              {mode === "login"
                ? "Your next great idea is one step away."
                : "A little space for your next great idea."}
            </p>
          </div>

          {mode === "register" && (
            <>
              <label className="field-label" htmlFor="name">
                Name
              </label>
              <div className="input-wrap">
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            </>
          )}

          <label className="field-label" htmlFor="email">
            Email address
          </label>
          <div className="input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="5" width="17" height="14" rx="3" />
              <path d="m4.5 7 7.5 5.5L19.5 7" />
            </svg>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="password-label">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            {mode === "login" && (
              <a
                href="#"
                className="text-link"
                onClick={(event) => {
                  event.preventDefault();
                  setMessage("Password reset is not available yet.");
                }}
              >
                Forgot password?
              </a>
            )}
          </div>
          <div className="input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4.5" y="10" width="15" height="11" rx="3" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <path d="M12 14.5v2" />
            </svg>
            <input
              id="password"
              name="password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              minLength={4}
            />
            <button
              className="password-toggle"
              type="button"
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              onClick={() => setPasswordVisible((visible) => !visible)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </button>
          </div>

          <button
            className="primary-button sign-in-button"
            type="submit"
            disabled={isSubmitting}
          >
            <span>
              {isSubmitting
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          {mode === "login" && (
            <>
              <div className="divider">
                <span>or continue with</span>
              </div>
              <button
                className="google-button"
                type="button"
                onClick={() => setMessage("Google sign-in is not available yet.")}
              >
                <span className="google-g" aria-hidden="true">
                  G
                </span>
                Continue with Google
              </button>
            </>
          )}
          <p className="signup-copy">
            {mode === "login" ? "New to Nova? " : "Already have an account? "}
            <button
              className="text-link"
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage("");
                setHasError(false);
              }}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <p
            className={`form-message${hasError ? " error" : ""}`}
            aria-live="polite"
            role={hasError ? "alert" : "status"}
          >
            {message}
          </p>
        </form>
      </div>
      <p className="login-footer">
        © 2025 Nova AI <span>·</span> Thoughtfully made for you
      </p>
    </section>
  );
}
