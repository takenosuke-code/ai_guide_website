// app/components/FaqSection.tsx
import { wpFetch } from "@/lib/wpclient";
import { FAQS_QUERY } from "@/lib/queries";


type FaqNode = { id: string; title: string; content: string };
type FaqsQueryResult = { faqs: { nodes: FaqNode[] } };

export default async function FaqSection() {
  const data = await wpFetch<FaqsQueryResult>(FAQS_QUERY, { first: 50 });
  const faqs = data?.faqs?.nodes ?? [];

  return (
    <section id="faqs" className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
        Frequently asked questions
      </h2>

      {faqs.length === 0 ? (
        <p className="text-center text-gray-500">FAQはまだ登録されていません。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {faqs.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <details className="group">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 p-4 md:p-5 bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <span className="font-semibold text-sm md:text-base flex items-center gap-2 flex-1">
                    <span className="text-xl">😊</span>
                    <span className="line-clamp-2">{f.title}</span>
                  </span>
                  <span className="shrink-0 transition-transform group-open:rotate-180 text-white">⌃</span>
                </summary>
                <div className="p-4 md:p-5 prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: f.content ?? "" }}
                ></div>
              </details>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
