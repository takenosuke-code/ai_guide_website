import Container from "../(components)/Container";
import SubmitReviewForm from "@/components/SubmitReviewForm";

export const metadata = {
  title: "Submit a Review | AI Tools Directory",
  description:
    "Share your experience with AI tools or our site. Approved reviews help other builders pick the right product.",
};

export default function SubmitReviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Community Powered
            </p>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">
              Submit a Review
            </h1>
            <p className="mt-3 text-gray-600">
              Tell us what you love (or don’t) about an AI tool or the site
              itself. Every submission is reviewed by our editorial team before
              publishing.
            </p>
          </div>

          <SubmitReviewForm />
        </div>
      </Container>
    </div>
  );
}


