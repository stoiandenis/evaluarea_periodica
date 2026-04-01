"use client";

import { useState, useEffect } from "react";

const CATEGORIES_INCOME = ["Зарплата", "Фриланс", "Инвестиции", "Подарок", "Другое"];
const CATEGORIES_EXPENSE = ["Еда", "Транспорт", "Жильё", "Здоровье", "Развлечения", "Одежда", "Другое"];

const formatMDL = (n) =>
  new Intl.NumberFormat("ru-MD", { style: "currency", currency: "MDL", maximumFractionDigits: 0 }).format(n);

const formatDate = (str) => {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}.${m}.${y}`;
};

export default function Home() {
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterTip, setFilterTip] = useState("все");

  const [form, setForm] = useState({
    tip: "доход",
    suma: "",
    categorie: "",
    data: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const data = localStorage.getItem("buget");
    if (data) setItems(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("buget", JSON.stringify(items));
  }, [items]);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    if (e.target.name === "tip") updated.categorie = "";
    setForm(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.suma || !form.categorie || !form.data) {
      alert("Заполните все поля!");
      return;
    }
    if (editId) {
      setItems(items.map((item) =>
        item.id === editId ? { ...form, id: editId, suma: Number(form.suma) } : item
      ));
      setEditId(null);
    } else {
      const maxNum = items.reduce((max, i) => Math.max(max, i.num || 0), 0);
      setItems([...items, { ...form, id: Date.now(), num: maxNum + 1, suma: Number(form.suma) }]);
    }
    setForm({ tip: "доход", suma: "", categorie: "", data: new Date().toISOString().split("T")[0] });
    setShowForm(false);
  };

  const handleDelete = (id) => setItems(items.filter((item) => item.id !== id));

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm({ tip: "доход", suma: "", categorie: "", data: new Date().toISOString().split("T")[0] });
    setEditId(null);
    setShowForm(false);
  };

  const totalIncome = items.filter((i) => i.tip === "доход").reduce((s, i) => s + i.suma, 0);
  const totalExpense = items.filter((i) => i.tip === "расходы").reduce((s, i) => s + i.suma, 0);
  const balance = totalIncome - totalExpense;

  const filtered = filterTip === "все" ? items : items.filter((i) => i.tip === filterTip);
  const sorted = [...filtered].sort((a, b) => new Date(b.data) - new Date(a.data));

  const cats = form.tip === "доход" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", fontFamily: "'Georgia', serif" }}>

      <div style={{ background: "var(--color-background-primary)", borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)", letterSpacing: "-0.3px" }}>Личный бюджет</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>{items.length} операций</p>
        </div>
        <button
          onClick={() => { setEditId(null); setShowForm(true); }}
          style={{ background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: "var(--border-radius-md)", padding: "8px 16px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
        >
          + Добавить
        </button>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
          {[
            { label: "Баланс", value: balance, color: balance >= 0 ? "var(--color-text-success)" : "var(--color-text-danger)" },
            { label: "Доходы", value: totalIncome, color: "var(--color-text-success)" },
            { label: "Расходы", value: totalExpense, color: "var(--color-text-danger)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</p>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color }}>{formatMDL(value)}</p>
            </div>
          ))}
        </div>

        {showForm && (
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem", marginBottom: "1.5rem" }}>
            <p style={{ margin: "0 0 1rem", fontWeight: 500, fontSize: 15, color: "var(--color-text-primary)" }}>
              {editId ? "Редактировать запись" : "Новая запись"}
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["доход", "расходы"].map((t) => (
                  <button
                    key={t} type="button"
                    onClick={() => setForm({ ...form, tip: t, categorie: "" })}
                    style={{
                      flex: 1, padding: "8px", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)",
                      background: form.tip === t ? "var(--color-text-primary)" : "transparent",
                      color: form.tip === t ? "var(--color-background-primary)" : "var(--color-text-secondary)",
                      cursor: "pointer", fontFamily: "inherit", fontSize: 14, transition: "all .15s",
                    }}
                  >
                    {t === "доход" ? "▲ Доход" : "▼ Расход"}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Сумма (MDL)</label>
                  <input
                    type="number" name="suma" placeholder="0" value={form.suma} onChange={handleChange}
                    style={{ width: "100%", boxSizing: "border-box", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "8px 10px", fontSize: 15, fontFamily: "inherit", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Дата</label>
                  <input
                    type="date" name="data" value={form.data} onChange={handleChange}
                    style={{ width: "100%", boxSizing: "border-box", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "8px 10px", fontSize: 14, fontFamily: "inherit", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Категория</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {cats.map((c) => (
                    <button
                      key={c} type="button"
                      onClick={() => setForm({ ...form, categorie: c })}
                      style={{
                        padding: "5px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 99,
                        background: form.categorie === c ? "var(--color-text-primary)" : "transparent",
                        color: form.categorie === c ? "var(--color-background-primary)" : "var(--color-text-secondary)",
                        cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="submit"
                  style={{ flex: 1, background: "var(--color-text-primary)", color: "var(--color-background-primary)", border: "none", borderRadius: "var(--border-radius-md)", padding: "9px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
                >
                  {editId ? "Обновить" : "Сохранить"}
                </button>
                <button
                  type="button" onClick={handleCancel}
                  style={{ padding: "9px 16px", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
          {["все", "доход", "расходы"].map((f) => (
            <button
              key={f} onClick={() => setFilterTip(f)}
              style={{
                padding: "5px 14px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 99,
                background: filterTip === f ? "var(--color-text-primary)" : "transparent",
                color: filterTip === f ? "var(--color-background-primary)" : "var(--color-text-secondary)",
                cursor: "pointer", fontFamily: "inherit", fontSize: 13, textTransform: "capitalize",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-text-secondary)", fontSize: 14 }}>
            Нет записей. Нажмите «+ Добавить», чтобы начать.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sorted.map((item) => (
              <div key={item.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                    background: item.tip === "доход" ? "var(--color-background-success)" : "var(--color-background-danger)",
                  }}>
                    {item.tip === "доход" ? "↑" : "↓"}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{item.categorie}</p>
                      {item.num && (
                        <span style={{ fontSize: 11, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", borderRadius: 4, padding: "1px 6px" }}>
                          #{String(item.num).padStart(3, "0")}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{formatDate(item.data)}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: item.tip === "доход" ? "var(--color-text-success)" : "var(--color-text-danger)" }}>
                    {item.tip === "доход" ? "+" : "−"}{formatMDL(item.suma)}
                  </span>
                  <button onClick={() => handleEdit(item)} style={{ background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "4px 10px", cursor: "pointer", fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "inherit" }}>
                    Изм.
                  </button>
                  <button onClick={() => handleDelete(item.id)} style={{ background: "transparent", border: "0.5px solid var(--color-border-danger)", borderRadius: "var(--border-radius-md)", padding: "4px 10px", cursor: "pointer", fontSize: 12, color: "var(--color-text-danger)", fontFamily: "inherit" }}>
                    Удал.
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}