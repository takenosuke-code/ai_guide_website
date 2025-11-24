import { NextResponse } from "next/server";

const WP_REST_BASE_URL = process.env.WP_REST_BASE_URL;
const WP_APP_USERNAME = process.env.WP_REST_APP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_REST_APP_PASSWORD;
const SITE_REVIEW_POST_TYPE = process.env.WP_SITE_REVIEW_POST_TYPE;
const SITE_REVIEW_CATEGORY_ID = process.env.WP_SITE_REVIEW_CATEGORY_ID;
const TOOL_REVIEW_POST_TYPE = process.env.WP_TOOL_REVIEW_POST_TYPE;
const TOOL_REVIEW_CATEGORY_ID = process.env.WP_TOOL_REVIEW_CATEGORY_ID;

function requireEnv() {
  if (
    !WP_REST_BASE_URL ||
    !WP_APP_USERNAME ||
    !WP_APP_PASSWORD ||
    !SITE_REVIEW_POST_TYPE ||
    !TOOL_REVIEW_POST_TYPE
  ) {
    throw new Error(
      "WP_REST_BASE_URL, WP_REST_APP_USERNAME, WP_REST_APP_PASSWORD, WP_SITE_REVIEW_POST_TYPE, and WP_TOOL_REVIEW_POST_TYPE must be defined in .env.local"
    );
  }
}

type ReviewPayload = {
  reviewType: "site" | "tool";
  title: string;
  content: string;
  rating?: number;
  authorName: string;
  authorEmail?: string;
  authorWebsite?: string;
  toolName?: string;
  toolSlug?: string;
};

function buildMeta(payload: ReviewPayload) {
  return {
    reviewer_name: payload.authorName,
    reviewer_email: payload.authorEmail || "",
    reviewer_url: payload.authorWebsite || "",
    review_rating: typeof payload.rating === "number" ? payload.rating : "",
    tool_name: payload.toolName || "",
    tool_slug: payload.toolSlug || "",
  };
}

async function createWordPressPost(
  endpoint: string,
  body: Record<string, unknown>
) {
  const authToken = Buffer.from(
    `${WP_APP_USERNAME}:${WP_APP_PASSWORD}`
  ).toString("base64");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authToken}`,
    },
    body: JSON.stringify(body),
  });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create review");
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    requireEnv();

    const payload = (await request.json()) as ReviewPayload;
    if (!payload.title || !payload.content || !payload.authorName) {
      return NextResponse.json(
        { error: "title, content, and authorName are required" },
        { status: 400 }
      );
    }

    if (payload.reviewType === "tool" && !payload.toolSlug) {
      return NextResponse.json(
        { error: "tool reviews require a toolSlug" },
        { status: 400 }
      );
    }

    const isSiteReview = payload.reviewType === "site";
    const postType = isSiteReview
      ? SITE_REVIEW_POST_TYPE
      : TOOL_REVIEW_POST_TYPE;
    const categoryId = isSiteReview
      ? SITE_REVIEW_CATEGORY_ID
      : TOOL_REVIEW_CATEGORY_ID;

    const endpoint = `${WP_REST_BASE_URL.replace(
      /\/$/,
      ""
    )}/wp-json/wp/v2/${postType}`;

    const body: Record<string, unknown> = {
      title: payload.title,
      content: payload.content,
      status: "pending",
      meta: buildMeta(payload),
    };

    if (categoryId) {
      body.categories = [Number(categoryId)];
    }

    const created = await createWordPressPost(endpoint, body);
    return NextResponse.json({ success: true, postId: created.id });
  } catch (error) {
    console.error("[submit-review]", error);
    return NextResponse.json(
      { error: "Unable to submit review" },
      { status: 500 }
    );
  }
}


