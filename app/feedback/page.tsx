import { redirect } from "next/navigation";

/* Сэтгэгдэл одоо нүүр хуудсан дээр modal-аар үлдээгдэнэ — хуучин холбоосыг тийш нь шилжүүлнэ */
export default function FeedbackPage() {
  redirect("/#feedback");
}
