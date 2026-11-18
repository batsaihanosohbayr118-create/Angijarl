"use client";

import { useEffect, useRef } from "react";
import ServicePhoto from "../../components/ServicePhoto";
import SectionTitle from "./SectionTitle";
import { attachAutoCarousel } from "../autoCarousel";
import type { ServiceItem } from "../types";

export default function OfferedServicesSection({ services }: { services: ServiceItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    return attachAutoCarousel(track, "article", 560);
  }, [services]);

  return (
    <section className="offered-services-section">
      <SectionTitle>Санал болгох үйлчилгээ</SectionTitle>

      <div className="offered-services-grid" ref={trackRef}>
        {services.map((service, index) => (
          <article
            className="offered-service-card reveal"
            style={{ transitionDelay: `${(index % 4) * 130}ms` }}
            key={service.id}
          >
            <ServicePhoto photo={service.photo} alt={service.title} className="offered-service-photo" />
            <div className="offered-service-overlay">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
