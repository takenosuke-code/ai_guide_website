// Server Component - handles data fetching automatically
import { wpFetch } from "@/lib/wpclient";
import { TESTIMONIALS_QUERY } from "@/lib/queries";
import SiteTestimonialsCarousel from "./SiteTestimonialsCarousel";

interface SiteTestimonialsSectionProps {
  maxTestimonials?: number;
  title?: string;
  subtitle?: string;
  autoRotate?: boolean;
  intervalMs?: number;
  showIfEmpty?: boolean;
}

export default async function SiteTestimonialsSection({
  maxTestimonials = 5,
  title = "What Our Users Say",
  subtitle,
  autoRotate = true,
  intervalMs = 5000,
  showIfEmpty = false,
}: SiteTestimonialsSectionProps) {
  // Fetch testimonials from WordPress
  const testimonialsData = await wpFetch<{
    testimonials: { nodes: any[] };
  }>(
    TESTIMONIALS_QUERY,
    { first: maxTestimonials },
    { revalidate: 3600 } // Cache for 1 hour
  );

  const testimonials = testimonialsData?.testimonials?.nodes ?? [];

  // Don't render section if no testimonials (unless showIfEmpty is true)
  if (testimonials.length === 0 && !showIfEmpty) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        {title && (
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Testimonials Carousel */}
        {testimonials.length > 0 ? (
          <SiteTestimonialsCarousel
            testimonials={testimonials}
            autoRotate={autoRotate}
            intervalMs={intervalMs}
          />
        ) : (
          showIfEmpty && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No testimonials available yet. Check back soon!
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}

