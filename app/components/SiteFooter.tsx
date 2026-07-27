const footerNavItems = [
  ["Нүүр", "/"],
  ["Бидний тухай", "/about"],
  ["Үйлчилгээ", "/#services"],
  ["Бариачид", "/teachers"],
  ["Сэтгэгдэл", "/feedback"],
  ["Цаг захиалах", "/booking"],
] as const;

const footerServices = [
  ["Оффис бариа засал", "/services/office-massage"],
  ["Хоол зүйн сургалт", "/services/nutrition"],
  ["Байгууллагын бясалгал", "/services/meditation"],
  ["Сэтгэл зүйн сургалт", "/services/psychology"],
] as const;

const footerContactItems = [
  ["phone", "9127 1178", "tel:+97691271178"],
  ["mail", "angijraltuv@yahoo.com", "mailto:angijraltuv@yahoo.com"],
  ["messenger", "Ангижрал сургалт Angijral surgalt", "https://m.me/angijral"],
] as const;

function FooterIcon({ type }: { type: "phone" | "mail" | "messenger" | "address" }) {
  if (type === "phone") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.5c0-.6.4-1 1-1H7.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "mail") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="m4 6.5 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "address") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C6.98 3 3 6.69 3 11.25c0 2.6 1.31 4.92 3.36 6.44V21l3.07-1.69c.82.23 1.68.35 2.57.35 5.02 0 9-3.69 9-8.25S17.02 3 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m7.8 12.4 2.7-2.85 2.4 1.8 2.7-2.85-2.7 3.9-2.4-1.8-2.7 2.85Z" fill="currentColor" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-col">
          <h3>Үндсэн цэс</h3>
          <nav aria-label="Доод үндсэн цэс">
            {footerNavItems.map(([label, href]) => (
              <a href={href} key={label}>{label}</a>
            ))}
          </nav>
        </div>

        <div className="footer-col">
          <h3>Үйлчилгээ</h3>
          <nav aria-label="Доод үйлчилгээний цэс">
            {footerServices.map(([label, href]) => (
              <a href={href} key={label}>{label}</a>
            ))}
          </nav>
        </div>

        <div className="footer-col" id="contact">
          <h3>Холбоо барих</h3>
          <ul className="footer-contact-list">
            {footerContactItems.map(([type, label, href]) => (
              <li key={type}>
                <span className="footer-contact-icon">
                  <FooterIcon type={type} />
                </span>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3>Хаяг</h3>
          <div className="footer-address">
            <span className="footer-contact-icon">
              <FooterIcon type="address" />
            </span>
            <p>БЗД, Сайд нарын 2-р эмнэлгийн баруун урд, 25-р байр, 306 тоот</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 АНГИЖРАЛ. Бүх эрх хуулиар хамгаалагдсан.</p>
      </div>
    </footer>
  );
}
