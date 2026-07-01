"use client";

import { useState } from "react";
import Script from "next/script";
import { trackEvent } from "@/lib/analytics";
import { SURVEY_EMAILCHEF } from "@/lib/siteConfig";

const EMAILCHEF_SCRIPT = `https://app.emailchef.com/signup/form.js/${SURVEY_EMAILCHEF.token}/en/api`;
const EMAILCHEF_ACTION = `https://app.emailchef.com/signupwl/${SURVEY_EMAILCHEF.token}/en`;

const ROLES = [
  "Backend / full-stack developer",
  "Database administrator",
  "Data analyst / scientist",
  "Founder / product",
  "Student / hobbyist",
  "Other",
];

const DATABASES = [
  "PostgreSQL",
  "MySQL / MariaDB",
  "SQLite",
  "MongoDB",
  "Other",
];

const PRIORITIES = [
  "Speed & performance",
  "Clean, modern UI",
  "Plugin extensibility",
  "Built-in AI assistance",
  "Works fully offline",
  "Open source",
  "Free / low cost",
];

const newsletterConfigured =
  !SURVEY_EMAILCHEF.fields.newsletter.startsWith("REPLACE");

// Shared suppression key: once set (on submit or dismiss, from popup OR the
// dedicated page) the floating prompt never reappears. Bump the suffix to
// re-surface the survey to everyone.
export const SURVEY_STORAGE_KEY = "tabularis-survey-v1";

interface SurveyFormProps {
  // Where this instance lives — used to label analytics events.
  source: "popup" | "page";
  // Called right before the page navigates to the thank-you page on submit.
  onSubmitted?: () => void;
}

export function SurveyForm({ source, onSubmitted }: SurveyFormProps) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [databases, setDatabases] = useState<string[]>([]);
  const [databasesOther, setDatabasesOther] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [missing, setMissing] = useState("");
  const [newsletter, setNewsletter] = useState(false);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function onSubmit() {
    // emailchef's form.js handles the actual POST + redirect. Persist the
    // suppression flag here so a completed survey (from the popup OR this page)
    // never re-triggers the floating prompt on later visits.
    try {
      localStorage.setItem(SURVEY_STORAGE_KEY, "submitted");
    } catch {
      // localStorage unavailable (private mode) — non-fatal.
    }
    trackEvent("survey", "submitted", `${source}:${role || "unknown"}`);
    onSubmitted?.();
  }

  // Send the typed-in database in place of the generic "Other" token.
  const databasesValue = databases
    .flatMap((d) =>
      d === "Other" ? (databasesOther.trim() ? [databasesOther.trim()] : []) : [d],
    )
    .join(", ");

  const LAST_STEP = 3;
  // Every step must be answered before advancing. The final step's text +
  // email are enforced natively via `required` on submit.
  const canAdvance =
    step === 0
      ? role !== ""
      : step === 1
        ? databases.length > 0 &&
          (!databases.includes("Other") || databasesOther.trim() !== "")
        : step === 2
          ? priorities.length > 0
          : true;

  return (
    <>
      <div className="survey-progress" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`survey-dot ${i <= step ? "survey-dot--on" : ""}`}
          />
        ))}
      </div>

      <form
        method="POST"
        action={EMAILCHEF_ACTION}
        className="survey-form"
        onSubmit={onSubmit}
      >
        {/* Step 0 — role */}
        {step === 0 && (
          <fieldset className="survey-fieldset">
            <legend className="survey-question">What best describes you?</legend>
            <div className="survey-options">
              {ROLES.map((r) => (
                <label
                  key={r}
                  className={`survey-option ${role === r ? "survey-option--on" : ""}`}
                >
                  <input
                    type="radio"
                    name="survey-role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                  />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Step 1 — databases */}
        {step === 1 && (
          <fieldset className="survey-fieldset">
            <legend className="survey-question">
              Which databases do you work with?
            </legend>
            <div className="survey-options">
              {DATABASES.map((d) => (
                <label
                  key={d}
                  className={`survey-option ${databases.includes(d) ? "survey-option--on" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={databases.includes(d)}
                    onChange={() => toggle(databases, setDatabases, d)}
                  />
                  {d}
                </label>
              ))}
            </div>
            {databases.includes("Other") && (
              <input
                type="text"
                className="survey-input"
                value={databasesOther}
                onChange={(e) => setDatabasesOther(e.target.value)}
                placeholder="Which one? e.g. DuckDB, ClickHouse…"
                aria-label="Other database"
              />
            )}
          </fieldset>
        )}

        {/* Step 2 — priorities */}
        {step === 2 && (
          <fieldset className="survey-fieldset">
            <legend className="survey-question">
              What matters most in a database tool?
            </legend>
            <div className="survey-options">
              {PRIORITIES.map((p) => (
                <label
                  key={p}
                  className={`survey-option ${priorities.includes(p) ? "survey-option--on" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={priorities.includes(p)}
                    onChange={() => toggle(priorities, setPriorities, p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Step 3 — open feedback + email */}
        {step === 3 && (
          <div className="survey-fieldset">
            <label className="survey-question" htmlFor="survey-missing">
              What&apos;s missing from the database tools you use today?{" "}
              <span className="survey-required">*</span>
            </label>
            <textarea
              id="survey-missing"
              className="survey-textarea"
              rows={3}
              value={missing}
              onChange={(e) => setMissing(e.target.value)}
              placeholder="The one thing you wish existed…"
              name={`field[${SURVEY_EMAILCHEF.fields.missing}]`}
              required
            />
            <label className="survey-question" htmlFor="survey-email">
              Your email <span className="survey-required">*</span>
            </label>
            <input
              id="survey-email"
              type="email"
              name="field[-1]"
              className="survey-input"
              placeholder="you@example.com"
              required
            />
            {newsletterConfigured && (
              <label className="survey-checkline">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                />
                Also subscribe me to the newsletter
              </label>
            )}
            <p className="survey-fineprint">
              We&apos;ll only use it to follow up on your feedback. No spam.
            </p>
          </div>
        )}

        {/* Hidden inputs carrying the earlier steps' answers to emailchef */}
        <input
          type="hidden"
          name={`field[${SURVEY_EMAILCHEF.fields.role}]`}
          value={role}
        />
        <input
          type="hidden"
          name={`field[${SURVEY_EMAILCHEF.fields.databases}]`}
          value={databasesValue}
        />
        <input
          type="hidden"
          name={`field[${SURVEY_EMAILCHEF.fields.priorities}]`}
          value={priorities.join(", ")}
        />
        {newsletterConfigured && (
          <input
            type="hidden"
            name={`field[${SURVEY_EMAILCHEF.fields.newsletter}]`}
            value={newsletter ? "1" : "0"}
          />
        )}
        <input type="hidden" name="form_id" value={SURVEY_EMAILCHEF.formId} />
        <input type="hidden" name="lang" value="" />
        <input type="hidden" name="referrer" value="" />
        <input type="hidden" name="redirect" value={SURVEY_EMAILCHEF.redirect} />

        <div className="survey-actions">
          {step > 0 && (
            <button
              type="button"
              className="survey-btn survey-btn--ghost"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </button>
          )}
          {step < LAST_STEP ? (
            <button
              type="button"
              className="survey-btn survey-btn--primary"
              disabled={!canAdvance}
              onClick={() => setStep((s) => s + 1)}
            >
              Next
            </button>
          ) : (
            <button type="submit" className="survey-btn survey-btn--primary">
              Send feedback
            </button>
          )}
        </div>

        <a
          className="survey-credit"
          href="https://www.emailchef.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/emailchef-logo.svg" alt="emailchef" />
        </a>

        <Script src={EMAILCHEF_SCRIPT} strategy="lazyOnload" />
      </form>
    </>
  );
}
