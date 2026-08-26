"use client";

import { useState, useMemo } from "react";
import { useCrud } from "@/hooks/useCrud";
import { skillsService } from "@/services/skillsService";
import AdminTable from "@/components/admin/AdminTable";
import AdminModal from "@/components/admin/AdminModal";
import FormField from "@/components/admin/FormField";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ErrorBanner from "@/components/admin/ErrorBanner";
import SkillOrb from "@/components/ui/SkillOrb";

interface Skill {
  id: string;
  icon: string;
  name: string;
  type: string;
  sort_order: number;
}

const EMPTY: Omit<Skill, "id"> = { icon: "⚡", name: "", type: "frontend", sort_order: 0 };

const TYPE_OPTIONS = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  // { value: "database", label: "Database" },
  { value: "cloud_tool", label: "Cloud & Tools" },
];

const COLUMNS = [
  {
    key: "icon",
    label: "Icon",
    render: (value: unknown) => (
      <SkillOrb
        skill={{ icon: value as string }}
        isPlainIcon
      />
    ),
  },
  { key: "name", label: "Name" },
  {
    key: "type",
    label: "Type",
    render: (value: unknown) => {
      const opt = TYPE_OPTIONS.find((o) => o.value === value);
      return opt ? opt.label : (value as string);
    },
  },
  { key: "sort_order", label: "Order" },
];

const FILTER_OPTIONS = [{ value: "all", label: "All" }, ...TYPE_OPTIONS];

export default function AdminSkillsPage() {
  const { items, loading, error, addItem, updateItem, removeItem } =
    useCrud<Skill>(skillsService);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Omit<Skill, "id">>(EMPTY);
  const [confirmTarget, setConfirmTarget] = useState<Skill | null>(null);
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState("frontend");

  const filteredItems = useMemo(() => {
    if (typeFilter === "all") return items;
    return items.filter((item) => (item.type || "frontend") === typeFilter);
  }, [items, typeFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (row: Skill) => {
    setEditing(row);
    setForm({ ...row, type: row.type || "frontend" });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateItem(editing.id, form);
      } else {
        await addItem(form);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmTarget) return;
    await removeItem(confirmTarget.id);
    setConfirmTarget(null);
  };

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Skills</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <select
            className="admin-input"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: "auto", minWidth: 140 }}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button className="admin-btn admin-btn-primary" onClick={openAdd}>
            + Add Skill
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      <AdminTable
        columns={COLUMNS}
        rows={filteredItems}
        onEdit={openEdit}
        onDelete={setConfirmTarget}
        loading={loading}
      />

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Skill" : "Add Skill"}
        onClose={closeModal}
        onSubmit={handleSave}
      >
        <FormField
          label="Icon (emoji)"
          value={form.icon}
          onChange={set("icon")}
          required
        />
        <FormField
          label="Name"
          value={form.name}
          onChange={set("name")}
          required
        />
        <FormField
          label="Type"
          value={form.type}
          onChange={set("type")}
          type="select"
          options={TYPE_OPTIONS}
        />
        <FormField
          label="Sort Order"
          value={form.sort_order}
          onChange={(v) => setForm((f) => ({ ...f, sort_order: Number(v) }))}
          type="number"
        />
        {saving && <p className="admin-saving">Saving…</p>}
      </AdminModal>

      <ConfirmDialog
        open={!!confirmTarget}
        itemLabel={confirmTarget?.name || ""}
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
