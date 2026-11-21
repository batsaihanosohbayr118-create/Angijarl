"use client";

import { useEffect, useRef } from "react";
import SectionTitle from "./SectionTitle";
import { attachAutoCarousel } from "../autoCarousel";
import { defaultTestimonials } from "../data";
import type { Testimonial } from "../types";
import Link from "next/link";

function TestimonialCard({
  testimonial,
  reveal = false,
  index = 0,
}: {
  testimonial: Testimonial;
  reveal?: boolean;
  index?: number;
}) {
  return (
    <article
      className={`testimonial-card${reveal ? " reveal" : ""}`}
      style={reveal ? { transitionDelay: `${index * 130}ms` } : undefined}
    >
      <span className="testimonial-quote-mark" aria-hidden="true">“</span>
      <blockquote>{testimonial.message}</blockquote>
      <div className="testimonial-footer">
        <div className="testimonial-avatar" aria-hidden="true">{testimonial.initials}</div>
        <div className="testimonial-meta">
          <strong>{testimonial.name}</strong>
          <div className="stars" aria-label={`${testimonial.rating} одтой үнэлгээ`}>
            {"★".repeat(testimonial.rating)}{"☆".repeat(5 - testimonial.rating)}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function TestimonialsSection({ userTestimonials }: { userTestimonials: Testimonial[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const allTestimonials = [...userTestimonials, ...defaultTestimonials].slice(0, 6);

  useEffect(() => {
    const track = gridRef.current;
    if (!track) return;
    return attachAutoCarousel(track, ".testimonial-card", 720);
  }, [userTestimonials]);

  return (
    <section className="testimonial-section">
      <SectionTitle>Хэрэглэгчдийн сэтгэгдэл</SectionTitle>

      <div className="testimonial-content">
        {allTestimonials.length > 3 ? (
          <div className="testimonial-marquee">
            <div className="testimonial-track">
              {[...allTestimonials, ...allTestimonials].map((testimonial, index) => (
                <TestimonialCard testimonial={testimonial} key={`${testimonial.id}-${index}`} />
              ))}
            </div>
          </div>
        ) : (
          <div className="testimonial-grid" ref={gridRef}>
            {allTestimonials.map((testimonial, index) => (
              <TestimonialCard testimonial={testimonial} key={testimonial.id} reveal index={index} />
            ))}
          </div>
        )}
        <div className="testimonial-actions">
          <Link className="primary-button" href="/feedback">Сэтгэгдэл үлдээх <span>↗</span></Link>
        </div>
      </div>
    </section>
  );
}
