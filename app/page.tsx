"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Testimonial = {
  id: string;
  name: string;
  message: string;
  rating: number;
  initials: string;
};

type Teacher = {
  id: string;
  name: string;
  role: string;
  years: number;
  photo: string;
  initials: string;
};

type ServiceItem = {
  id: string;
  title: string;
  description: string;
  photo: string;
};

const navItems = ["Нүүр", "Бидний тухай", "Үйлчилгээ", "Бариачид", "Цаг захиалах"];

const services = [
  ["Оффис бариа засал", "/services/office-massage"],
  ["Хоол зүйн сургалт", "/services/nutrition"],
  ["Байгууллагын бясалгал", "/services/meditation"],
  ["Сэтгэл зүйн сургалт", "/services/psychology"]
];

const reasons = [
  ["experience", "10+ жилийн туршлага", "Клиник болон эмчилгээний салбарт олон жил ажилласан мэргэжилтнүүд үйлчилгээ үзүүлнэ."],
  ["practice", "Мэргэжлийн үйлчилгээ", "Бодит гар дадлага, туршлага дээр суурилсан үр дүнтэй эмчилгээ, засал хийж гүйцэтгэнэ."],
  ["certificate", "Монгол, Англи сертификаттай", "Гадаад, дотоодод хүлээн зөвшөөрөгдөх сертификаттай мэргэжилтнүүдээс үйлчлүүлнэ."],
  ["support", "Хамтарсан эмнэлэг, spa", "Хамтран ажилладаг эмнэлэг, spa, массажийн төвүүдтэй хамтран цогц үйлчилгээ үзүүлнэ."],
  ["classroom", "Орчин үеийн тоног төхөөрөмж", "Стандартад нийцсэн тоног төхөөрөмж, тав тухтай, цэвэрхэн орчинд үйлчлүүлнэ."],
  ["personal", "Хувь хүнд төвлөрсөн хандлага", "Үйлчлүүлэгч бүрийн онцлогт тохирсон, анхааралтай, чанартай үйлчилгээ үзүүлнэ."]
] as const;

const stats = [
  ["500+", "Үйлчлүүлэгч"],
  ["10+", "Жилийн туршлага"],
  ["95%", "Сэтгэл ханамжтай"],
  ["6", "Үйлчилгээ"]
];

const defaultTestimonials: Testimonial[] = [
  {
    id: "default-batsaihan",
    message:
      "АНГИЖРАЛ төвийн үйлчилгээ маш чанартай, мэргэжлийн түвшинд байсан. Хэдхэн удаагийн эмчилгээнээс хойш нурууны өвдөлт мэдэгдэхүйц багассан.",
    name: "Э. Батсайхан",
    initials: "ЭБ",
    rating: 5,
  },
  {
    id: "default-sarnai",
    message:
      "Бариачид маш тэвчээртэй бөгөөд эмчилгээ бүрийн өмнө юу хийхээ тодорхой тайлбарладаг байсан. Орчин цэвэрхэн, тав тухтай.",
    name: "Б. Сарнай",
    initials: "БС",
    rating: 5,
  },
  {
    id: "default-purevdorj",
    message:
      "Удаан хугацаанд зовж байсан хүзүүний өвдөлт минь энд үйлчлүүлснээр арилсан. Мэргэжилтнүүддээ маш их баярлалаа.",
    name: "Д. Пүрэвдорж",
    initials: "ДП",
    rating: 5,
  },
];

const defaultOfferedServices: ServiceItem[] = [
  {
    id: "s1",
    title: "Оффис бариа засал",
    description: "Суудал дээр нь хийх хүзүү, толгой, мөр гарын бариа",
    photo: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "s2",
    title: "Байгууллагын бясалгал",
    description: "Стресс тайлж, бүтээмж нэмэх сонирхолтой хөтөлбөрт бүлгийн бясалгал",
    photo: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "s3",
    title: "Хоол зүйн сургалт",
    description: "Хоол зүйн бүлгийн сургалт болон ганцаарчилсан зөвлөгөө, дэглэм",
    photo: "https://images.pexels.com/photos/5905902/pexels-photo-5905902.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "s4",
    title: "Сэтгэл зүйн сургалт",
    description: "Мэргэжлийн сэтгэл зүйчийн бүлгийн сургалт, зөвлөгөө",
    photo: "https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
];

const faqs = [
  [
    "Нэг удаад хэдэн хүн үйлчлүүлж болох вэ?",
    "Манай төвд хэд хэдэн мэргэжилтэн зэрэг ажилладаг тул урьдчилан цаг захиалснаар удаан хүлээлгүйгээр үйлчлүүлэх боломжтой."
  ],
  [
    "Үйлчилгээ авсны дараа ямар үр дүн хүлээж болох вэ?",
    "Ихэнх үйлчлүүлэгч эхний 2-3 удаагийн эмчилгээнээс хойш өвдөлт багасаж, хөдөлгөөн сайжирсан мэдэгдэхүйц өөрчлөлтийг мэдэрдэг."
  ],
  [
    "Үйлчилгээ үзүүлэгч мэргэжилтнүүд ямар туршлагатай вэ?",
    "Манай мэргэжилтнүүд клиникийн болон эмчилгээний салбарт 10-аас дээш жил ажилласан туршлагатай."
  ],
  [
    "Үйлчилгээ авахад ямар бэлтгэл хийх шаардлагатай вэ?",
    "Тусгай бэлтгэл шаардлагагүй, зөвхөн тав тухтай хувцастай ирэхэд хангалттай."
  ],
  [
    "Гэрээр ирж бариа хийх үү?",
    "Тийм ээ, тодорхой тохиолдолд гэрээр очиж үйлчилгээ үзүүлэх боломжтой. Урьдчилан бидэнтэй холбогдож захиалга өгнө үү."
  ],
  [
    "Хэр урт хугацаанд үйлчилгээ авах хэрэгтэй вэ?",
    "Энэ нь эрүүл мэндийн байдал, шинж тэмдгээс хамаарна. Ихэвчлэн 5-10 удаагийн курсээр эмчилгээ хийлгэхийг зөвлөдөг."
  ],
  [
    "Тогтмол очиж эмчлүүлбэл хямдрал байдаг уу?",
    "Тийм ээ, багц эмчилгээ болон тогтмол үйлчлүүлэгчдэд зориулсан хямдралтай үнийн санал байдаг."
  ],
  [
    "Төлбөрийг урьдчилж төлөх шаардлагатай юу?",
    "Үгүй, төлбөрийг үйлчилгээ авсны дараа, эсвэл цаг захиалгын үедээ төлж болно."
  ],
  [
    "Захиалгаа хэрхэн өгөх, өөрчлөх боломжтой вэ?",
    "Утас эсвэл Messenger-ээр холбогдож цаг захиалах, өөрчлөх боломжтой."
  ],
  [
    "Хаяг хаана байдаг вэ?",
    "БЗД, Сайд нарын 2-р эмнэлгийн баруун урд, 25-р байр, 306 тоотод байрладаг."
  ]
] as const;

const contactItems = [
  ["phone", "9127 1178", undefined],
  ["mail", "angijraltuv@yahoo.com", "mailto:angijraltuv@yahoo.com"],
  ["messenger", "Ангижрал сургалт Angijral surgalt", "https://m.me/angijral"]
] as const;

const defaultTeachers: Teacher[] = [
  {
    id: "teacher-bat-erdene",
    name: "Б.Бат-Эрдэнэ",
    role: "Ахлах бариач",
    years: 15,
    photo: "https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=700",
    initials: "Б",
  },
  {
    id: "teacher-enkhtuyaa",
    name: "Ц.Энхтуяа",
    role: "Бариач",
    years: 10,
    photo: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=700",
    initials: "Ц",
  },
  {
    id: "teacher-orgil",
    name: "Г.Оргил",
    role: "Бариач",
    years: 8,
    photo: "https://images.pexels.com/photos/6627534/pexels-photo-6627534.jpeg?auto=compress&cs=tinysrgb&w=700",
    initials: "Г",
  },
];

const partners = [
  "AIRMARKET",
  "AND GLOBAL",
  "ГАЗАР ШИМ",
  "GOLOMT CAPITAL",
  "GRAPECITY",
  "ЖУР УР",
  "MAJOR SUPPLY",
  "MSM"
];

type SessionState = { role: "user" | "admin"; name: string } | null;

let cachedSessionSnapshot: SessionState = null;

const navHref = (item: string, index: number) => {
  if (item === "Бидний тухай") return "/about";
  if (item === "Бариачид") return "/teachers";
  if (item === "Цаг захиалах") return "/booking";
  return `#${index === 0 ? "home" : item}`;
};

const getSessionSnapshot = (): SessionState => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("angijral_session");
    const next = raw ? (JSON.parse(raw) as SessionState) : null;

    if (!next) {
      cachedSessionSnapshot = null;
      return null;
    }

    const sameSession =
      cachedSessionSnapshot &&
      cachedSessionSnapshot.role === next.role &&
      cachedSessionSnapshot.name === next.name
        ? cachedSessionSnapshot
        : next;

    cachedSessionSnapshot = sameSession;
    return sameSession;
  } catch {
    cachedSessionSnapshot = null;
    return null;
  }
};

const subscribeToSession = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === "angijral_session") {
      callback();
    }
  };

  const handleSessionChange = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener("angijral-session-change", handleSessionChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("angijral-session-change", handleSessionChange);
  };
};

function WhyIcon({ type }: { type: string }) {
  if (type === "experience") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "practice") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 12.5c0-.9.7-1.6 1.6-1.6h1.9V8.4c0-.9.7-1.6 1.6-1.6.9 0 1.6.7 1.6 1.6v2.5h1c1.4 0 2.3 1.1 2.3 2.3v1.6c0 2.4-1.9 4.7-4.6 4.7-3 0-5.4-1.6-5.4-4.4v-2.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7 14h-.6c-.8 0-1.4-.6-1.4-1.4v-.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "certificate") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 13.2 7 21l5-2.6 5 2.6-1.5-7.8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "support") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.5" y="8" width="17" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 8V6.8c0-1 .8-1.8 1.8-1.8h3.4c1 0 1.8.8 1.8 1.8V8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3.5 13h17" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (type === "classroom") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 20h8M12 17v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 6c1.4.3 2.4 1.5 2.4 3s-1 2.7-2.4 3M17.8 14.5c2 .4 3.5 2 3.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ContactIcon({ type }: { type: "phone" | "mail" | "messenger" | "address" }) {
  if (type === "phone") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.5c0-.6.4-1 1-1H7.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
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

function CountUpStat({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => {
    const match = value.match(/^(\d+)(.*)$/);
    return match ? "0" : value;
  });
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const match = value.match(/^(\d+)(.*)$/);
    const target = match ? parseInt(match[1], 10) : 0;
    const suffix = match ? match[2] : "";

    if (!match) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || hasAnimated.current) return;
          hasAnimated.current = true;

          const duration = 1400;
          const start = performance.now();

          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            setDisplay(`${current}${suffix}`);
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return <strong ref={ref}>{display}</strong>;
}

export default function Home() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>(defaultTeachers);
  const [teacherIndex, setTeacherIndex] = useState(0);
  const activeTeacher = teachers[teacherIndex] ?? defaultTeachers[0];
  const [offeredServices, setOfferedServices] = useState<ServiceItem[]>(defaultOfferedServices);

  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [userTestimonials, setUserTestimonials] = useState<Testimonial[]>([]);

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

    loadTestimonials();
  }, []);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await fetch("/api/teachers");
        const data = (await response.json()) as { teachers?: Teacher[] };
        if (response.ok && Array.isArray(data.teachers) && data.teachers.length > 0) {
          setTeachers(data.teachers);
          setTeacherIndex((current) => Math.min(current, data.teachers!.length - 1));
        }
      } catch {
        setTeachers(defaultTeachers);
      }
    };

    void loadTeachers();
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch("/api/services");
        const data = (await response.json()) as { services?: ServiceItem[] };
        if (response.ok && Array.isArray(data.services) && data.services.length > 0) {
          setOfferedServices(data.services);
        }
      } catch {
        setOfferedServices(defaultOfferedServices);
      }
    };

    void loadServices();
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem("angijral_session");
    window.dispatchEvent(new Event("angijral-session-change"));
    setProfileOpen(false);
    router.push("/login");
  };

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

  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackSent, setCallbackSent] = useState(false);
  const [callbackSending, setCallbackSending] = useState(false);
  const [callbackError, setCallbackError] = useState("");

  const handleCallbackSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!callbackPhone.trim() || callbackSending) return;

    setCallbackSending(true);
    setCallbackError("");

    try {
      const response = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: callbackPhone.trim() }),
      });

      if (!response.ok) throw new Error("request failed");

      setCallbackSent(true);
      setCallbackPhone("");
    } catch {
      setCallbackError("Илгээхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setCallbackSending(false);
    }
  };

  useEffect(() => {
    if (!servicesOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [servicesOpen]);

  useEffect(() => {
    if (!profileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const showPrevTeacher = () => {
    setTeacherIndex((current) => (current === 0 ? teachers.length - 1 : current - 1));
  };

  const showNextTeacher = () => {
    setTeacherIndex((current) => (current === teachers.length - 1 ? 0 : current + 1));
  };

  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/">
          <Image className="brand-logo" src="/logo.jpg" alt="АНГИЖРАЛ бариа заслын сургалтын төв" width={120} height={40} />
        </Link>

        <nav aria-label="Үндсэн цэс">
          {navItems.map((item, index) =>
            item === "Үйлчилгээ" ? (
              <div className="nav-dropdown" key={item} ref={servicesRef}>
                <button
                  type="button"
                  className="nav-dropdown-trigger"
                  aria-expanded={servicesOpen}
                  aria-haspopup="true"
                  onClick={() => setServicesOpen((open) => !open)}
                >
                  {item}
                  <span className={`nav-dropdown-chevron${servicesOpen ? " open" : ""}`} aria-hidden="true">
                    <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                {servicesOpen && (
                  <div className="nav-dropdown-menu" role="menu">
                    {services.map(([label, href]) => (
                      <a href={href} key={label} role="menuitem" onClick={() => setServicesOpen(false)}>
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a key={item} className={index === 0 ? "active" : ""} href={navHref(item, index)}>
                {item}
              </a>
            )
          )}
        </nav>

        {session ? (
          <div className="profile-chip" ref={profileRef}>
            <button
              type="button"
              className="profile-trigger"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <span className="profile-avatar" aria-hidden="true">
                {session.name.trim().charAt(0).toUpperCase() || "Х"}
              </span>
              <span className="profile-name">{session.name}</span>
              <span className={`nav-dropdown-chevron${profileOpen ? " open" : ""}`} aria-hidden="true">
                <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            {profileOpen && (
              <div className="profile-menu" role="menu">
                <div className="profile-menu-info">
                  <strong>{session.name}</strong>
                  <span>{session.role === "admin" ? "Админ эрх" : "Хэрэглэгч"}</span>
                </div>
                {session.role === "admin" && (
                  <a href="/admin" role="menuitem" onClick={() => setProfileOpen(false)}>
                    Админ самбар
                  </a>
                )}
                <button type="button" role="menuitem" className="profile-menu-logout" onClick={handleLogout}>
                  Гарах
                </button>
              </div>
            )}
          </div>
        ) : (
          <a className="login-button" href="/login" aria-label="Нэвтрэх">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="8.2" r="3.4" stroke="currentColor" strokeWidth="1.6" />
              <path d="M5 19.5c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Нэвтрэх
          </a>
        )}
      </header>

      <section className="hero" id="home">
        <div className="hero-bg" />
        <div className="hero-content">
          <p className="eyebrow">Эрүүл бие • Тайван сэтгэл • Идэвхтэй амьдрал</p>
          <h1>Хөдөлгөөнөөр эрүүл амьдрал</h1>
          <div className="hero-actions">
            <a className="primary-button" href="#contact">Холбоо барих <span>↗</span></a>
          </div>
        </div>
      </section>

      <section className="why-section" id="Яагаад бид">
        <div className="section-title">
          <span />
          <h2>Яагаад АНГИЖРАЛ-ыг сонгох вэ?</h2>
          <span />
        </div>
        <p className="why-lead">
          Бид онолын мэдлэг биш, шууд бодит үр дүнд тулгуурласан үйлчилгээ үзүүлдэг.
          Иймээс үйлчлүүлэгчид маань бидэнд дахин дахин итгэж хандсаар ирсэн.
        </p>

        <div className="why-grid">
          {reasons.map(([icon, title, body]) => (
            <article className="why-card" key={title}>
              <span>
                <WhyIcon type={icon} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>

        <div className="why-stats">
          {stats.map(([value, label]) => (
            <div className="why-stat" key={label}>
              <CountUpStat value={value} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="offered-services-section">
        <div className="section-title">
          <span />
          <h2>Санал болгох үйлчилгээ</h2>
          <span />
        </div>

        <div className="offered-services-grid">
          {offeredServices.map((service) => (
            <article className="offered-service-card" key={service.id}>
              <div
                className="offered-service-photo"
                style={{ backgroundImage: `url("${service.photo}")` }}
                aria-hidden="true"
              />
              <div className="offered-service-overlay">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="partners-section">
        <div className="section-title">
          <span />
          <h2>Бидний үйлчилгээ үзүүлэгч байгууллагууд</h2>
          <span />
        </div>

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

      <section className="teachers-section" id="Бариачид">
        <article className="teachers panel">
          <p className="teachers-eyebrow">Мэргэжлийн баг</p>

          <div className="teacher-slide">
            <div className="teacher-info">
              <h3 className="teacher-role">{activeTeacher.role}</h3>
              <ul className="teacher-points">
                <li>{activeTeacher.years}+ жил туршлагатай</li>
              </ul>
            </div>

            <div className="teacher-photo-wrap" key={teacherIndex}>
              {activeTeacher.photo ? (
                <Image className="teacher-photo" src={activeTeacher.photo} alt={activeTeacher.name} width={320} height={420} />
              ) : (
                <div className="teacher-photo fallback" aria-hidden="true">{activeTeacher.initials}</div>
              )}
              <span className="teacher-badge">{activeTeacher.name}</span>
            </div>
          </div>

          <div className="teacher-nav">
            <button type="button" aria-label="Өмнөх багш" onClick={showPrevTeacher}>‹</button>
            <button type="button" className="next" aria-label="Дараагийн багш" onClick={showNextTeacher}>›</button>
            <span className="teacher-count">{teacherIndex + 1} / {teachers.length}</span>
            <div className="teacher-progress">
              <span style={{ width: `${((teacherIndex + 1) / teachers.length) * 100}%` }} />
            </div>
          </div>
        </article>
      </section>

      <section className="testimonial-section">
        <div className="section-title">
          <span />
          <h2>Хэрэглэгчдийн сэтгэгдэл</h2>
          <span />
        </div>

        <div className="testimonial-content">
          {(() => {
            const allTestimonials = [...userTestimonials, ...defaultTestimonials].slice(0, 6);
            const renderCard = (testimonial: Testimonial, key: string) => (
              <article className="testimonial-card" key={key}>
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

            if (allTestimonials.length > 3) {
              return (
                <div className="testimonial-marquee">
                  <div className="testimonial-track">
                    {[...allTestimonials, ...allTestimonials].map((testimonial, index) =>
                      renderCard(testimonial, `${testimonial.id}-${index}`)
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div className="testimonial-grid">
                {allTestimonials.map((testimonial) => renderCard(testimonial, testimonial.id))}
              </div>
            );
          })()}
          <div className="testimonial-actions">
            <a className="primary-button" href="/feedback">Сэтгэгдэл үлдээх <span>↗</span></a>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="section-title">
          <span />
          <h2>Түгээмэл асуулт хариулт</h2>
          <span />
        </div>

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
                    <div className={`faq-item${isOpen ? " open" : ""}`} key={question}>
                      <button
                        type="button"
                        className="faq-question"
                        aria-expanded={isOpen}
                        onClick={() => toggleFaq(index)}
                      >
                        <span>{question}</span>
                        <span className={`faq-chevron${isOpen ? " open" : ""}`} aria-hidden="true">
                          <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>
                      {isOpen && <p className="faq-answer">{answer}</p>}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </section>

      <section className="callback-band">
        <p className="callback-text">
          Танд манай үйлчилгээтэй холбоотой асуулт эсвэл санал хүсэлт байгаа бол
          бидэнд утасны дугаараа үлдээгээрэй. Бид тантай холбогдох болно
        </p>

        <form className="callback-form" onSubmit={handleCallbackSubmit}>
          <input
            type="tel"
            inputMode="tel"
            className="callback-input"
            placeholder="Утасны дугаар"
            value={callbackPhone}
            onChange={(event) => {
              setCallbackPhone(event.target.value);
              setCallbackSent(false);
            }}
            aria-label="Утасны дугаар"
          />
          <button type="submit" className="callback-submit" disabled={callbackSending}>
            {callbackSending ? "Илгээж байна..." : "Илгээх"}
          </button>
        </form>

        {callbackSent && <p className="callback-success">Баярлалаа! Бид удахгүй тантай холбогдох болно.</p>}
        {callbackError && <p className="callback-error">{callbackError}</p>}
      </section>

    </main>
  );
}