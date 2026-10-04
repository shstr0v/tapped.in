"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

type WaitlistFormProps = {
  variant?: "light" | "dark";
};

type SubmitState = {
  status: "idle" | "success" | "error";
  message: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm({ variant = "light" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });

  const isDark = variant === "dark";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail)) {
      setSubmitState({
        status: "error",
        message: "Enter a valid email so we can send your invite.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ status: "idle", message: "" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setEmail("");
      setSubmitState({
        status: "success",
        message: data.message || "You are on the waitlist.",
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not join the waitlist right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`waitlist-form ${
        isDark ? "waitlist-form-dark" : "waitlist-form-light"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`waitlist-email-${variant}`}>
          Email address
        </label>
        <input
          id={`waitlist-email-${variant}`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="artist@studio.com"
          className={`min-h-14 min-w-0 flex-1 rounded-[20px] border bg-white px-5 text-base text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-ink/35 focus:border-blue focus:shadow-focus ${
            isDark ? "border-white/10" : "border-transparent"
          }`}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="pressable waitlist-submit"
        >
          {isSubmitting ? "Joining…" : "Join waitlist"}
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <p
        className={`min-h-6 px-1 pt-2 text-sm ${
          submitState.status === "success"
            ? isDark
              ? "text-blue-soft"
              : "text-blue"
            : isDark
              ? "text-white/65"
              : "text-muted"
        }`}
        role="status"
        aria-live="polite"
      >
        {submitState.message ||
          "One email when your invite is ready. That's it."}
      </p>
    </form>
  );
}
