"use client";

import { useState } from "react";
import SectionTitle from "./SectionTitle";
import Chevron from "./Chevron";
import { faqs } from "../data";

export default function FaqSection() {
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());

  const toggleFaq = (index: number) => {
    setOpenFaqs((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <section className="faq-section">
      <SectionTitle>Түгээмэл асуулт хариулт</SectionTitle>

      <div className="faq-grid">
        {[0, 1].map((column) => (
          <div className="faq-column" key={column}>
            {faqs
              .filter((_, index) => index % 2 === column)
              .map((_, i) => {
                const index = i * 2 + column;
                const [question, answer] = faqs[index];
                const isOpen = openFaqs.has(index);
                return (
                  <div
                    /* className тогтмол байх ёстой: scrollReveal-ийн нэмсэн "in-view"-ийг React дарж бичихгүйн тулд */
                    className="faq-item reveal"
                    data-open={isOpen || undefined}
                    style={{ transitionDelay: `${i * 110}ms` }}
                    key={question}
                  >
                    <button
                      type="button"
                      className="faq-question"
                      aria-expanded={isOpen}
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{question}</span>
                      <Chevron open={isOpen} className="faq-chevron" />
                    </button>
                    {isOpen && <p className="faq-answer">{answer}</p>}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </section>
  );
}
