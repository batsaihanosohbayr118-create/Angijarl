import TypewriterText from "../../components/TypewriterText";

export default function HeroSection({ heroImage }: { heroImage: string }) {
  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        {heroImage && (
          <div
            className="hero-bg-image"
            style={{
              backgroundImage: `url("${heroImage}"), linear-gradient(90deg, #ffffff, #f8faf8 42%, #ded8cf 100%)`,
            }}
          />
        )}
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
