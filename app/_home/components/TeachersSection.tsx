"use client";

import { useState } from "react";
import TeacherPhoto from "../../components/TeacherPhoto";
import type { Teacher } from "../types";

export default function TeachersSection({ teachers }: { teachers: Teacher[] }) {
  const [teacherIndex, setTeacherIndex] = useState(0);
  // Жагсаалт богиносвол индексийг хязгаарлана
  const safeIndex = Math.min(teacherIndex, Math.max(teachers.length - 1, 0));
  const activeTeacher = teachers[safeIndex];

  if (!activeTeacher) return null;

  const showPrevTeacher = () => {
    setTeacherIndex(safeIndex === 0 ? teachers.length - 1 : safeIndex - 1);
  };

  const showNextTeacher = () => {
    setTeacherIndex(safeIndex === teachers.length - 1 ? 0 : safeIndex + 1);
  };

  return (
    <section className="teachers-section" id="Бариачид">
      <article className="teachers panel reveal">
        <p className="teachers-eyebrow">Мэргэжлийн баг</p>

        <div className="teacher-slide">
          <div className="teacher-info" key={`info-${safeIndex}`}>
            <h3 className="teacher-role">{activeTeacher.role}</h3>
            <ul className="teacher-points">
              <li>{activeTeacher.years}+ жил туршлагатай</li>
            </ul>
          </div>

          <div className="teacher-photo-wrap" key={`photo-${safeIndex}`}>
            <TeacherPhoto
              photo={activeTeacher.photo}
              alt={activeTeacher.name}
              initials={activeTeacher.initials}
              className="teacher-photo"
              width={320}
              height={420}
            />
            <span className="teacher-badge">{activeTeacher.name}</span>
          </div>
        </div>

        <div className="teacher-nav">
          <button type="button" aria-label="Өмнөх багш" onClick={showPrevTeacher}>‹</button>
          <button type="button" className="next" aria-label="Дараагийн багш" onClick={showNextTeacher}>›</button>
          <span className="teacher-count">{safeIndex + 1} / {teachers.length}</span>
          <div className="teacher-progress">
            <span style={{ width: `${((safeIndex + 1) / teachers.length) * 100}%` }} />
          </div>
        </div>
      </article>
    </section>
  );
}
