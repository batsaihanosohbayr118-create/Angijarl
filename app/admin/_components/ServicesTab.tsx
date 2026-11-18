"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import ServicePhoto from "../../components/ServicePhoto";
import Icon from "./Icon";
import CardNav from "./CardNav";
import { scrollGridCards } from "../_lib/scroll";
import type { ServiceItem } from "../_lib/types";

const emptyServiceDraft = { title: "", description: "", photo: "" };

export default function ServicesTab({
  services,
  setServices,
}: {
  services: ServiceItem[];
  setServices: Dispatch<SetStateAction<ServiceItem[]>>;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceDraft, setServiceDraft] = useState(emptyServiceDraft);
  const [serviceFormError, setServiceFormError] = useState<string | null>(null);

  const openServiceForm = (service?: ServiceItem) => {
    setServiceFormError(null);
    if (service) {
      setEditingServiceId(service.id);
      setServiceDraft({ title: service.title, description: service.description, photo: service.photo });
    } else {
      setEditingServiceId(null);
      setServiceDraft(emptyServiceDraft);
    }
    setShowServiceForm(true);
  };

  const submitService = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!serviceDraft.title.trim()) return;
    setServiceFormError(null);

    const payload = {
      title: serviceDraft.title.trim(),
      description: serviceDraft.description.trim(),
      photo: serviceDraft.photo.trim(),
    };

    try {
      const response = await fetch("/api/admin/services", {
        method: editingServiceId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingServiceId ? { id: editingServiceId, ...payload } : payload),
      });
      const data = (await response.json()) as { service?: ServiceItem; message?: string };

      if (!response.ok || !data.service) {
        setServiceFormError(data.message ?? "Хадгалахад алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }

      setServices((current) =>
        editingServiceId
          ? current.map((service) => (service.id === editingServiceId ? data.service! : service))
          : [data.service!, ...current]
      );
    } catch {
      setServiceFormError("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
      return;
    }

    setShowServiceForm(false);
    setEditingServiceId(null);
    setServiceDraft(emptyServiceDraft);
  };

  const deleteService = async (id: string) => {
    const previousServices = services;
    setServices((current) => current.filter((s) => s.id !== id));

    try {
      const response = await fetch(`/api/admin/services?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setServices(previousServices);
      }
    } catch {
      setServices(previousServices);
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>Санал болгох үйлчилгээнүүд</h2>
        <button type="button" className="admin-primary-btn" onClick={() => openServiceForm()}>
          <Icon name="plus" />
          Үйлчилгээ нэмэх
        </button>
      </div>

      {showServiceForm && (
        <form className="admin-inline-form" onSubmit={submitService}>
          <div className="admin-form-grid">
            <div className="form-field">
              <label>Гарчиг</label>
              <input
                type="text"
                value={serviceDraft.title}
                onChange={(event) => setServiceDraft((d) => ({ ...d, title: event.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label>Зургийн холбоос (URL)</label>
              <input
                type="text"
                value={serviceDraft.photo}
                onChange={(event) => setServiceDraft((d) => ({ ...d, photo: event.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="form-field admin-form-field-wide">
              <label>Тайлбар</label>
              <input
                type="text"
                value={serviceDraft.description}
                onChange={(event) => setServiceDraft((d) => ({ ...d, description: event.target.value }))}
              />
            </div>
          </div>
          {serviceFormError && <p className="form-error">{serviceFormError}</p>}
          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() => {
                setShowServiceForm(false);
                setEditingServiceId(null);
                setServiceFormError(null);
              }}
            >
              Цуцлах
            </button>
            <button type="submit" className="admin-primary-btn">
              {editingServiceId ? "Шинэчлэх" : "Хадгалах"}
            </button>
          </div>
        </form>
      )}

      {services.length === 0 ? (
        <p className="admin-empty-state">Одоогоор үйлчилгээ нэмээгүй байна.</p>
      ) : (
        <>
          <div className="admin-services-grid" ref={gridRef}>
            {services.map((s) => (
              <article className="admin-service-card" key={s.id}>
                <div className="admin-service-photo">
                  <ServicePhoto photo={s.photo} alt={s.title} sizes="220px" />
                </div>
                <div className="admin-service-body">
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <div className="admin-service-actions">
                    <button type="button" className="admin-icon-btn" aria-label="Засах" onClick={() => openServiceForm(s)}>
                      <Icon name="edit" />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn danger"
                      aria-label="Устгах"
                      onClick={() => deleteService(s.id)}
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {services.length > 1 && (
            <CardNav onPrev={() => scrollGridCards(gridRef, -1)} onNext={() => scrollGridCards(gridRef, 1)} />
          )}
        </>
      )}
    </section>
  );
}
