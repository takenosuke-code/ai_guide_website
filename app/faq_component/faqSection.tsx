// app/components/FaqSection.tsx
import { wpFetch } from "@/lib/wpclient";
import { FAQS_QUERY } from "@/lib/queries";


type FaqNode = { id: string; title: string; content: string };
type FaqsQueryResult = { faqs: { nodes: FaqNode[] } };

export default async function FaqSection() {
  const data = await wpFetch<FaqsQueryResult>(FAQS_QUERY, { first: 50 });
  const faqs = data?.faqs?.nodes ?? [];

  return (
    <section id="faqs" className="max-w-3xl mx-auto py-20">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10">
        Frequently asked questions
      </h2>

      {faqs.length === 0 ? (
        <p className="text-center text-gray-500">FAQはまだ登録されていません。</p>
      ) : (
        <ul className="space-y-4">
          {faqs.map((f) => (
            <li key={f.id} className="border rounded-2xl p-4 bg-white">
              <details className="group">
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                  <span className="font-semibold text-lg">{f.title}</span>
                  <span className="shrink-0 transition-transform group-open:rotate-180">⌃</span>
                </summary>
                <div className="mt-3 prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: f.content ?? "" }}
                ></div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
