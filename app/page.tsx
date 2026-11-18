"use client";

import { useEffect, useState } from "react";
import { attachScrollReveal } from "./components/scrollReveal";
import SiteHeader from "./_home/components/SiteHeader";
import HeroSection from "./_home/components/HeroSection";
import WhySection from "./_home/components/WhySection";
import OfferedServicesSection from "./_home/components/OfferedServicesSection";
import PartnersSection from "./_home/components/PartnersSection";
import TeachersSection from "./_home/components/TeachersSection";
import TestimonialsSection from "./_home/components/TestimonialsSection";
import FaqSection from "./_home/components/FaqSection";
import CallbackSection from "./_home/components/CallbackSection";
import type { ServiceItem, Teacher, Testimonial } from "./_home/types";

export default function Home() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [offeredServices, setOfferedServices] = useState<ServiceItem[]>([]);
  const [userTestimonials, setUserTestimonials] = useState<Testimonial[]>([]);
  const [heroImage, setHeroImage] = useState("");

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials");
        const data = (await response.json()) as { testimonials?: Testimonial[] };
        setUserTestimonials(Array.isArray(data.testimonials) ? data.testimonials : []);
      } catch {
        setUserTestimonials([]);
      }
    };

    const loadTeachers = async () => {
      try {
        const response = await fetch("/api/teachers");
        const data = (await response.json()) as { teachers?: Teacher[] };
        if (response.ok && Array.isArray(data.teachers) && data.teachers.length > 0) {
          setTeachers(data.teachers);
        }
      } catch {
        setTeachers([]);
      }
    };

    const loadServices = async () => {
      try {
        const response = await fetch("/api/services");
        const data = (await response.json()) as { services?: ServiceItem[] };
        if (response.ok && Array.isArray(data.services) && data.services.length > 0) {
          setOfferedServices(data.services);
        }
      } catch {
        setOfferedServices([]);
      }
    };

    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = (await response.json()) as { heroImage?: string };
        if (response.ok && data.heroImage) {
          setHeroImage(data.heroImage);
        }
      } catch {
        /* keep hero background as the plain gradient */
      }
    };

    void loadTestimonials();
    void loadTeachers();
    void loadServices();
    void loadSettings();
  }, []);

  /* Өгөгдөл ачаалагдсаны дараа шинэ .reveal элементүүдийг дахин холбоно */
  useEffect(() => {
    return attachScrollReveal();
  }, [offeredServices, userTestimonials, teachers]);

  return (
    <main>
      <SiteHeader />
      <HeroSection heroImage={heroImage} />
      <WhySection />
      <OfferedServicesSection services={offeredServices} />
      <PartnersSection />
      <TeachersSection teachers={teachers} />
      <TestimonialsSection userTestimonials={userTestimonials} />
      <FaqSection />
      <CallbackSection />
    </main>
  );
}
