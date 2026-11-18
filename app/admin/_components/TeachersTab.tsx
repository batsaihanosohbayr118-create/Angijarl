"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import TeacherPhoto from "../../components/TeacherPhoto";
import Icon from "./Icon";
import CardNav from "./CardNav";
import { scrollGridCards } from "../_lib/scroll";
import type { ServiceItem, Teacher } from "../_lib/types";

const emptyTeacherDraft = {
  name: "",
  role: "",
  years: "0",
  bio: "",
  photo: "",
  serviceIds: [] as string[],
};

export default function TeachersTab({
  teachers,
  setTeachers,
  services,
}: {
  teachers: Teacher[];
  setTeachers: Dispatch<SetStateAction<Teacher[]>>;
  services: ServiceItem[];
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teacherDraft, setTeacherDraft] = useState(emptyTeacherDraft);
  const [teacherFormError, setTeacherFormError] = useState<string | null>(null);

  const openTeacherForm = (teacher?: Teacher) => {
    setTeacherFormError(null);
    if (teacher) {
      setEditingTeacherId(teacher.id);
      setTeacherDraft({
        name: teacher.name,
        role: teacher.role,
        years: String(teacher.years),
        bio: teacher.bio,
        photo: teacher.photo,
        serviceIds: teacher.serviceIds ?? [],
      });
    } else {
      setEditingTeacherId(null);
      setTeacherDraft(emptyTeacherDraft);
    }
    setShowTeacherForm(true);
  };

  const toggleTeacherService = (serviceId: string) => {
    setTeacherDraft((d) => ({
      ...d,
      serviceIds: d.serviceIds.includes(serviceId)
        ? d.serviceIds.filter((id) => id !== serviceId)
        : [...d.serviceIds, serviceId],
    }));
  };

  const submitTeacher = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!teacherDraft.name.trim() || !teacherDraft.role.trim() || !teacherDraft.bio.trim()) return;
    setTeacherFormError(null);

    const payload = {
      name: teacherDraft.name.trim(),
      role: teacherDraft.role.trim(),
      years: Number(teacherDraft.years),
      bio: teacherDraft.bio.trim(),
      photo: teacherDraft.photo.trim(),
      serviceIds: teacherDraft.serviceIds,
    };

    try {
      const response = await fetch("/api/admin/teachers", {
        method: editingTeacherId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTeacherId ? { id: editingTeacherId, ...payload } : payload),
      });
      const data = (await response.json()) as { teacher?: Teacher; message?: string };

      if (!response.ok || !data.teacher) {
        setTeacherFormError(data.message ?? "Хадгалахад алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }

      setTeachers((current) =>
        editingTeacherId
          ? current.map((teacher) => (teacher.id === editingTeacherId ? data.teacher! : teacher))
          : [data.teacher!, ...current]
      );
    } catch {
      setTeacherFormError("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
      return;
    }

    setShowTeacherForm(false);
    setEditingTeacherId(null);
    setTeacherDraft(emptyTeacherDraft);
  };

  const deleteTeacher = async (id: string) => {
    const previousTeachers = teachers;
    setTeachers((current) => current.filter((teacher) => teacher.id !== id));

    try {
      const response = await fetch(`/api/admin/teachers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setTeachers(previousTeachers);
      }
    } catch {
      setTeachers(previousTeachers);
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>Бариачдын мэдээлэл</h2>
        <button type="button" className="admin-primary-btn" onClick={() => openTeacherForm()}>
          <Icon name="plus" />
          Бариач нэмэх
        </button>
      </div>

      {showTeacherForm && (
        <form className="admin-inline-form" onSubmit={submitTeacher}>
          <div className="admin-form-grid">
            <div className="form-field">
              <label>Нэр</label>
              <input
                type="text"
                value={teacherDraft.name}
                onChange={(event) => setTeacherDraft((d) => ({ ...d, name: event.target.value }))}
                placeholder="Жишээ: Б.Бат-Эрдэнэ"
                required
              />
            </div>
            <div className="form-field">
              <label>Албан тушаал</label>
              <input
                type="text"
                value={teacherDraft.role}
                onChange={(event) => setTeacherDraft((d) => ({ ...d, role: event.target.value }))}
                placeholder="Бариач"
                required
              />
            </div>
            <div className="form-field">
              <label>Туршлага (жил)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={teacherDraft.years}
                onChange={(event) => setTeacherDraft((d) => ({ ...d, years: event.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label>Зургийн холбоос (URL)</label>
              <input
                type="url"
                value={teacherDraft.photo}
                onChange={(event) => setTeacherDraft((d) => ({ ...d, photo: event.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="form-field admin-form-field-wide">
              <label>Тайлбар</label>
              <textarea
                value={teacherDraft.bio}
                onChange={(event) => setTeacherDraft((d) => ({ ...d, bio: event.target.value }))}
                placeholder="Мэргэшил, туршлага, үзүүлэх үйлчилгээний товч тайлбар"
                required
              />
            </div>
            <div className="form-field admin-form-field-wide">
              <label>Ямар үйлчилгээ хариуцдаг вэ?</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px" }}>
                {services.map((s) => (
                  <label
                    key={s.id}
                    style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      className="admin-checkbox"
                      checked={teacherDraft.serviceIds.includes(s.id)}
                      onChange={() => toggleTeacherService(s.id)}
                    />
                    <span>{s.title}</span>
                  </label>
                ))}
                {services.length === 0 && (
                  <p className="admin-empty-state">Эхлээд &quot;Үйлчилгээ&quot; хэсэгт үйлчилгээ нэмнэ үү.</p>
                )}
              </div>
            </div>
          </div>
          {teacherFormError && <p className="form-error">{teacherFormError}</p>}
          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() => {
                setShowTeacherForm(false);
                setEditingTeacherId(null);
                setTeacherFormError(null);
              }}
            >
              Цуцлах
            </button>
            <button type="submit" className="admin-primary-btn">
              {editingTeacherId ? "Шинэчлэх" : "Хадгалах"}
            </button>
          </div>
        </form>
      )}

      {teachers.length === 0 ? (
        <p className="admin-empty-state">Одоогоор бариач нэмээгүй байна.</p>
      ) : (
        <>
          <div className="admin-services-grid" ref={gridRef}>
            {teachers.map((teacher) => (
              <article className="admin-service-card" key={teacher.id}>
                <TeacherPhoto
                  photo={teacher.photo}
                  alt={teacher.name}
                  initials={teacher.initials}
                  className="admin-teacher-photo"
                  width={120}
                  height={120}
                />
                <div className="admin-service-body">
                  <h3>{teacher.name}</h3>
                  <p>
                    {teacher.role} · {teacher.years} жил
                  </p>
                  <p className="admin-teacher-bio">{teacher.bio}</p>
                  <p style={{ fontSize: "13px", opacity: 0.75 }}>
                    {teacher.serviceIds && teacher.serviceIds.length > 0
                      ? teacher.serviceIds
                          .map((id) => services.find((s) => s.id === id)?.title)
                          .filter(Boolean)
                          .join(", ")
                      : "Үйлчилгээ сонгоогүй"}
                  </p>
                  <div className="admin-service-actions">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      aria-label="Засах"
                      onClick={() => openTeacherForm(teacher)}
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn danger"
                      aria-label="Устгах"
                      onClick={() => deleteTeacher(teacher.id)}
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {teachers.length > 1 && (
            <CardNav onPrev={() => scrollGridCards(gridRef, -1)} onNext={() => scrollGridCards(gridRef, 1)} />
          )}
        </>
      )}
    </section>
  );
}
