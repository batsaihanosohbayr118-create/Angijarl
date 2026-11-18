export type Testimonial = {
  id: string;
  name: string;
  message: string;
  rating: number;
  initials: string;
};

export type Teacher = {
  id: string;
  name: string;
  role: string;
  years: number;
  photo: string;
  initials: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  photo: string;
};

export type SessionState = { role: "user" | "admin"; name: string } | null;
