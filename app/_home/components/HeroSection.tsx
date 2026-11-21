import TypewriterText from "../../components/TypewriterText";

const HERO_IMAGE = "/hero.jpg";

export default function HeroSection() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <div
          className="hero-bg-image"
          style={{
            backgroundImage: `url("${HERO_IMAGE}"), linear-gradient(90deg, #ffffff, #f8faf8 42%, #ded8cf 100%)`,
          }}
        />
      </div>
      <div className="hero-content">
        <TypewriterText
          as="p"
          className="eyebrow"
          text="Эрүүл бие • Тайван сэтгэл • Идэвхтэй амьдрал"
          speed={26}
          startDelay={300}
        />
        <TypewriterText as="h1" text="Хөдөлгөөнөөр эрүүл амьдрал" speed={45} startDelay={1500} />
        <div className="hero-actions">
          <a className="primary-button" href="#contact">Холбоо барих <span>↗</span></a>
        </div>
      </div>
    </section>
  );
}
