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
          className={`min-h-14 min-w-0 flex-1 rounded-[1.15rem] border px-5 text-base outline-none transition-[border-color,box-shadow,background-color] duration-150 ease-out ${
            isDark
              ? "border-white/10 bg-white text-ink placeholder:text-ink/35 focus:border-blue focus:shadow-focus"
              : "border-transparent bg-white text-ink placeholder:text-ink/35 focus:border-blue focus:shadow-focus"
          }`}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`pressable inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.15rem] px-6 text-base font-black transition-[background-color,color,transform,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-60 ${
            isDark
              ? "bg-blue text-white hover:bg-blue-dark"
              : "bg-ink text-white hover:bg-blue"
          }`}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
          {isSubmitting ? "Joining" : "Join TappedIn"}
        </button>
      </div>
      <p
        className={`min-h-6 px-1 pt-2 text-sm ${
          submitState.status === "success"
            ? isDark
              ? "text-sky-soft"
              : "text-blue"
            : isDark
              ? "text-white/65"
              : "text-muted"
        }`}
        role="status"
        aria-live="polite"
      >
        {submitState.message ||
          "No spam. Just early access and product updates."}
      </p>
    </form>
  );
}
