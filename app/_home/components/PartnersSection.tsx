import SectionTitle from "./SectionTitle";
import { partners } from "../data";

export default function PartnersSection() {
  return (
    <section className="partners-section">
      <SectionTitle>Бидний үйлчилгээ үзүүлэгч байгууллагууд</SectionTitle>

      <div className="partners-marquee">
        <div className="partners-track">
          {[...partners, ...partners].map((name, index) => (
            <span className="partner-logo" key={`${name}-${index}`} aria-hidden={index >= partners.length}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
