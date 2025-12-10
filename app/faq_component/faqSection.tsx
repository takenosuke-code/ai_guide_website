// app/components/FaqSection.tsx
import { wpFetch } from "@/lib/wpclient";
import { FAQS_QUERY } from "@/lib/queries";
import FaqCard from "./FaqCard";
import Container from "../(components)/Container";

type FaqNode = { id: string; title: string; content: string };
type FaqsQueryResult = { freqquestions: { nodes: FaqNode[] } };

export default async function FaqSection() {
  const data = await wpFetch<FaqsQueryResult>(FAQS_QUERY, { first: 50 });
  const faqs = data?.freqquestions?.nodes ?? [];

  return (
    <section id="faqs" className="py-20">
      <Container>
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
          Frequently asked questions
        </h2>

        {faqs.length === 0 ? (
          <p className="text-center text-gray-500">FAQはまだ登録されていません。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center items-start">
            {faqs.map((f) => (
              <FaqCard key={f.id} id={f.id} title={f.title} content={f.content} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
