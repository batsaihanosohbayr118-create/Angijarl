"use client";

import { useEffect, useRef } from "react";
import Icon from "./Icon";

/**
 * Хөтчийн confirm()-ийн оронд хэрэглэх, админ самбарын загвартай баталгаажуулах цонх.
 * Native <dialog> — Esc, фокус, арын бүдэгрүүлэлтийг хөтөч өөрөө зохицуулна.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Устгах",
  cancelLabel = "Цуцлах",
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      /* Санамсаргүй Enter дарж устгахаас сэргийлж фокусыг "Цуцлах" дээр тавина */
      cancelRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="admin-confirm"
      aria-labelledby="admin-confirm-title"
      aria-describedby="admin-confirm-message"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div className="admin-confirm-body">
        <span className={`admin-confirm-icon${danger ? " danger" : ""}`} aria-hidden="true">
          <Icon name={danger ? "trash" : "edit"} />
        </span>
        <h3 id="admin-confirm-title">{title}</h3>
        <p id="admin-confirm-message">{message}</p>
        <div className="admin-confirm-actions">
          <button ref={cancelRef} type="button" className="admin-secondary-btn" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? "admin-danger-btn" : "admin-primary-btn"}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Түр хүлээнэ үү..." : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
