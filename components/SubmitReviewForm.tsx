"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type ReviewType = "site" | "tool";

const REVIEW_TYPES: { label: string; value: ReviewType }[] = [
  { label: "Site Review", value: "site" },
  { label: "AI Tool Review", value: "tool" },
];

type SubmitState = {
  status: "idle" | "submitting" | "success" | "error";
  message?: string;
};

export default function SubmitReviewForm() {
  const searchParams = useSearchParams();
  const initialToolSlug = searchParams.get("tool") ?? "";
  const initialToolName = searchParams.get("toolName") ?? "";
  const initialReviewType =
    (searchParams.get("reviewType") as ReviewType) ??
    (initialToolSlug ? "tool" : "site");

  const [reviewType, setReviewType] = useState<ReviewType>(initialReviewType);
  const [formState, setFormState] = useState({
    authorName: "",
    authorEmail: "",
    authorWebsite: "",
    title: "",
    content: "",
    rating: "",
    toolName: initialToolName,
    toolSlug: initialToolSlug,
  });
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  const canSubmit = useMemo(() => {
    if (!formState.authorName.trim() || !formState.title.trim()) {
      return false;
    }
    if (reviewType === "tool" && !formState.toolSlug.trim()) {
      return false;
    }
    return true;
  }, [formState, reviewType]);

  const handleChange = (
    field: keyof typeof formState,
    value: string
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || submitState.status === "submitting") {
      return;
    }

    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewType,
          title: formState.title,
          content: formState.content,
          rating: formState.rating ? Number(formState.rating) : undefined,
          authorName: formState.authorName,
          authorEmail: formState.authorEmail || undefined,
          authorWebsite: formState.authorWebsite || undefined,
          toolName: reviewType === "tool" ? formState.toolName : undefined,
          toolSlug: reviewType === "tool" ? formState.toolSlug : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitState({
        status: "success",
        message: "Thanks for your review! We’ll publish it after moderation.",
      });
      setFormState({
        authorName: "",
        authorEmail: "",
        authorWebsite: "",
        title: "",
        content: "",
        rating: "",
        toolName: initialToolName,
        toolSlug: initialToolSlug,
      });
      setReviewType(initialToolSlug ? "tool" : "site");
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to submit review",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Review Type
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={reviewType}
            onChange={(event) =>
              setReviewType(event.target.value as ReviewType)
            }
          >
            {REVIEW_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Rating (1–5)
          <input
            type="number"
            min="1"
            max="5"
            step="1"
            value={formState.rating}
            onChange={(event) => handleChange("rating", event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Your Name *
          <input
            type="text"
            required
            value={formState.authorName}
            onChange={(event) =>
              handleChange("authorName", event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            value={formState.authorEmail}
            onChange={(event) =>
              handleChange("authorEmail", event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Website / Profile Link
          <input
            type="url"
            value={formState.authorWebsite}
            onChange={(event) =>
              handleChange("authorWebsite", event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Review Title *
          <input
            type="text"
            required
            value={formState.title}
            onChange={(event) => handleChange("title", event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>
      </div>

      {reviewType === "tool" && (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Tool Name *
            <input
              type="text"
              required
              value={formState.toolName}
              onChange={(event) =>
                handleChange("toolName", event.target.value)
              }
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Tool Slug *
            <input
              type="text"
              required
              value={formState.toolSlug}
              onChange={(event) =>
                handleChange("toolSlug", event.target.value)
              }
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500">
              Example: <code>chatgpt</code>. Pre-filled when you use
              “Leave a Review” buttons.
            </span>
          </label>
        </div>
      )}

      <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
        Review Content *
        <textarea
          required
          rows={6}
          value={formState.content}
          onChange={(event) => handleChange("content", event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </label>

      {submitState.status === "error" && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {submitState.message}
        </p>
      )}

      {submitState.status === "success" && (
        <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
          {submitState.message}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || submitState.status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {submitState.status === "submitting" ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}


