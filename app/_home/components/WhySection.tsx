import SectionTitle from "./SectionTitle";
import WhyIcon from "./WhyIcon";
import CountUpStat from "./CountUpStat";
import { reasons, stats } from "../data";

export default function WhySection() {
  return (
    <section className="why-section" id="Яагаад бид">
      <SectionTitle>Яагаад АНГИЖРАЛ-ыг сонгох вэ?</SectionTitle>
      <p className="why-lead reveal">
        Бид онолын мэдлэг биш, шууд бодит үр дүнд тулгуурласан үйлчилгээ үзүүлдэг.
        Иймээс үйлчлүүлэгчид маань бидэнд дахин дахин итгэж хандсаар ирсэн.
      </p>

      <div className="why-grid">
        {reasons.map(([icon, title, body], index) => (
          <article className="why-card reveal" style={{ transitionDelay: `${index * 140}ms` }} key={title}>
            <span>
              <WhyIcon type={icon} />
            </span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>

      <div className="why-stats">
        {stats.map(([value, label], index) => (
          <div className="why-stat reveal" style={{ transitionDelay: `${index * 120}ms` }} key={label}>
            <CountUpStat value={value} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
