"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import Icon from "./Icon";
import CardNav from "./CardNav";
import Dropdown from "./Dropdown";
import DatePicker from "./DatePicker";
import { formatCouponValue } from "../_lib/format";
import { scrollCards } from "../_lib/scroll";
import type { Coupon, CouponDiscountType } from "../_lib/types";

const emptyCouponDraft = {
  code: "",
  discountType: "percent" as CouponDiscountType,
  value: "10",
  expiresAt: "",
  active: "true",
  usageLimit: "",
};

export default function CouponsTab({
  coupons,
  setCoupons,
}: {
  coupons: Coupon[];
  setCoupons: Dispatch<SetStateAction<Coupon[]>>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [couponDraft, setCouponDraft] = useState(emptyCouponDraft);

  const openCouponForm = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCouponId(coupon.id);
      setCouponDraft({
        code: coupon.code,
        discountType: coupon.discountType,
        value: String(coupon.value),
        expiresAt: coupon.expiresAt ?? "",
        active: String(coupon.active),
        usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      });
    } else {
      setEditingCouponId(null);
      setCouponDraft(emptyCouponDraft);
    }
    setShowCouponForm(true);
  };

  const submitCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!couponDraft.code.trim()) return;

    const payload = {
      code: couponDraft.code.trim(),
      discountType: couponDraft.discountType,
      value: Number(couponDraft.value),
      expiresAt: couponDraft.expiresAt,
      active: couponDraft.active === "true",
      usageLimit: couponDraft.usageLimit ? Number(couponDraft.usageLimit) : undefined,
    };

    try {
      const response = await fetch("/api/admin/coupons", {
        method: editingCouponId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCouponId ? { id: editingCouponId, ...payload } : payload),
      });
      const data = (await response.json()) as { coupon?: Coupon };

      if (response.ok && data.coupon) {
        setCoupons((current) =>
          editingCouponId
            ? current.map((coupon) => (coupon.id === editingCouponId ? data.coupon! : coupon))
            : [data.coupon!, ...current]
        );
      }
    } catch {
      /* ignore */
    }

    setShowCouponForm(false);
    setEditingCouponId(null);
    setCouponDraft(emptyCouponDraft);
  };

  const deleteCoupon = async (id: string) => {
    const previousCoupons = coupons;
    setCoupons((current) => current.filter((coupon) => coupon.id !== id));

    try {
      const response = await fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setCoupons(previousCoupons);
      }
    } catch {
      setCoupons(previousCoupons);
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>Купон кодууд</h2>
        <button type="button" className="admin-primary-btn" onClick={() => openCouponForm()}>
          <Icon name="plus" />
          Купон нэмэх
        </button>
      </div>

      {showCouponForm && (
        <form className="admin-inline-form" onSubmit={submitCoupon}>
          <div className="admin-form-grid">
            <div className="form-field">
              <label>Код</label>
              <input
                type="text"
                value={couponDraft.code}
                onChange={(event) => setCouponDraft((d) => ({ ...d, code: event.target.value.toUpperCase() }))}
                placeholder="WELCOME10"
                required
              />
            </div>
            <div className="form-field">
              <label>Төрөл</label>
              <Dropdown
                value={couponDraft.discountType}
                onChange={(value) => setCouponDraft((d) => ({ ...d, discountType: value as CouponDiscountType }))}
                options={[
                  { value: "percent", label: "Хувь (%)" },
                  { value: "amount", label: "Мөнгөн дүн (₮)" },
                ]}
              />
            </div>
            <div className="form-field">
              <label>Хэмжээ</label>
              <input
                type="number"
                min="1"
                max={couponDraft.discountType === "percent" ? "100" : undefined}
                value={couponDraft.value}
                onChange={(event) => setCouponDraft((d) => ({ ...d, value: event.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label>Дуусах огноо</label>
              <DatePicker
                value={couponDraft.expiresAt}
                onChange={(value) => setCouponDraft((d) => ({ ...d, expiresAt: value }))}
              />
            </div>
            <div className="form-field">
              <label>Ашиглах лимит</label>
              <input
                type="number"
                min="1"
                value={couponDraft.usageLimit}
                onChange={(event) => setCouponDraft((d) => ({ ...d, usageLimit: event.target.value }))}
                placeholder="Хязгааргүй"
              />
            </div>
            <div className="form-field">
              <label>Төлөв</label>
              <Dropdown
                value={couponDraft.active}
                onChange={(value) => setCouponDraft((d) => ({ ...d, active: value }))}
                options={[
                  { value: "true", label: "Идэвхтэй" },
                  { value: "false", label: "Идэвхгүй" },
                ]}
              />
            </div>
          </div>
          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() => {
                setShowCouponForm(false);
                setEditingCouponId(null);
              }}
            >
              Цуцлах
            </button>
            <button type="submit" className="admin-primary-btn">
              {editingCouponId ? "Шинэчлэх" : "Хадгалах"}
            </button>
          </div>
        </form>
      )}

      {coupons.length === 0 ? (
        <p className="admin-empty-state">Одоогоор купон нэмээгүй байна.</p>
      ) : (
        <>
          <div className="admin-table-wrap" ref={wrapRef}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Код</th>
                  <th>Хөнгөлөлт</th>
                  <th>Ашиглалт</th>
                  <th>Дуусах</th>
                  <th>Төлөв</th>
                  <th aria-label="Үйлдэл" />
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td data-label="Код">{coupon.code}</td>
                    <td data-label="Хөнгөлөлт">{formatCouponValue(coupon)}</td>
                    <td data-label="Ашиглалт">
                      {coupon.usedCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </td>
                    <td data-label="Дуусах">{coupon.expiresAt || "—"}</td>
                    <td data-label="Төлөв">
                      <span className={`admin-badge ${coupon.active ? "confirmed" : "cancelled"}`}>
                        {coupon.active ? "Идэвхтэй" : "Идэвхгүй"}
                      </span>
                    </td>
                    <td data-label="Үйлдэл" className="admin-table-actions-cell">
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-icon-btn"
                          aria-label="Засах"
                          onClick={() => openCouponForm(coupon)}
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn danger"
                          aria-label="Устгах"
                          onClick={() => deleteCoupon(coupon.id)}
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {coupons.length > 1 && (
            <CardNav onPrev={() => scrollCards(wrapRef, -1)} onNext={() => scrollCards(wrapRef, 1)} />
          )}
        </>
      )}
    </section>
  );
}
