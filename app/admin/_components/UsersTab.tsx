"use client";

import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import Icon from "./Icon";
import CardNav from "./CardNav";
import { scrollCards } from "../_lib/scroll";
import type { AppUser } from "../_lib/types";

export default function UsersTab({
  users,
  setUsers,
}: {
  users: AppUser[];
  setUsers: Dispatch<SetStateAction<AppUser[]>>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [userSearch, setUserSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q)
    );
  }, [users, userSearch]);

  const toggleRole = async (id: string) => {
    const previousUsers = users;
    const target = users.find((user) => user.id === id);
    if (!target) return;

    const role = target.role === "admin" ? "user" : "admin";
    setUsers((current) => current.map((u) => (u.id === id ? { ...u, role } : u)));

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      const data = (await response.json()) as { user?: AppUser };

      if (!response.ok || !data.user) {
        setUsers(previousUsers);
        return;
      }

      setUsers((current) => current.map((u) => (u.id === id ? data.user! : u)));
    } catch {
      setUsers(previousUsers);
    }
  };

  const deleteUser = async (id: string) => {
    const previousUsers = users;
    setUsers((current) => current.filter((u) => u.id !== id));

    try {
      const response = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setUsers(previousUsers);
      }
    } catch {
      setUsers(previousUsers);
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>Бүртгэлтэй хэрэглэгчид</h2>
        <div className="admin-search-wrap">
          <span className="admin-search-icon">
            <Icon name="search" />
          </span>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Хайх"
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <p className="admin-empty-state">Хайлтад тохирох хэрэглэгч олдсонгүй.</p>
      ) : (
        <>
          <div className="admin-table-wrap" ref={wrapRef}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Нэр</th>
                  <th>И-мэйл</th>
                  <th>Утас</th>
                  <th>Эрх</th>
                  <th>Элссэн огноо</th>
                  <th aria-label="Үйлдэл" />
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td data-label="Нэр">{u.name}</td>
                    <td data-label="И-мэйл">{u.email}</td>
                    <td data-label="Утас">{u.phone}</td>
                    <td data-label="Эрх">
                      <span className={`admin-badge ${u.role === "admin" ? "role-admin" : "role-user"}`}>
                        {u.role === "admin" ? "Админ" : "Хэрэглэгч"}
                      </span>
                    </td>
                    <td data-label="Элссэн огноо">{u.joinedAt}</td>
                    <td data-label="Үйлдэл" className="admin-table-actions-cell">
                      <div className="admin-row-actions">
                        <button type="button" className="admin-text-action" onClick={() => toggleRole(u.id)}>
                          {u.role === "admin" ? "Админ эрх хасах" : "Админ болгох"}
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn danger"
                          aria-label="Устгах"
                          onClick={() => deleteUser(u.id)}
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
          {filteredUsers.length > 1 && (
            <CardNav onPrev={() => scrollCards(wrapRef, -1)} onNext={() => scrollCards(wrapRef, 1)} />
          )}
        </>
      )}
    </section>
  );
}
