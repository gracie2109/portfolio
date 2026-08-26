"use client";

import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { projectsService } from "@/services/projectsService";
import AdminTable from "@/components/admin/AdminTable";
import AdminModal from "@/components/admin/AdminModal";
import FormField from "@/components/admin/FormField";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ErrorBanner from "@/components/admin/ErrorBanner";
import SkillOrb from "@/components/ui/SkillOrb";

interface Project {
  id: string;
  emoji: string;
  tags: string[];
  image_url: string;
  link_url: string;
  title_en: string;
  title_vi: string;
  description_en: string;
  description_vi: string;
  sort_order: number;
}

type ProjectForm = Omit<Project, "id" | "tags"> & { tags: string };

const EMPTY: ProjectForm = {
  emoji: "🚀",
  tags: "",
  image_url: "",
  link_url: "",
  title_en: "",
  title_vi: "",
  description_en: "",
  description_vi: "",
  sort_order: 0,
};

const COLUMNS = [
  {
    key: "emoji",
    label: "Emoji",
    render: (value: unknown) => (
      <SkillOrb skill={{ icon: value as string }} isPlainIcon />
    ),
  },
  {
    key: "title_en",
    label: "Title (EN / VI)",
    render: (_v: unknown, row: Project) => (
      <div>
        <div>{row.title_en}</div>
        <div className="admin-sub">{row.title_vi}</div>
      </div>
    ),
  },
  {
    key: "tags",
    label: "Tags",
    render: (tags: unknown) =>
      ((tags as string[]) || []).map((t) => (
        <span key={t} className="admin-tag">
          {t}
        </span>
      )),
  },
  { key: "sort_order", label: "Order" },
];

function tagsToString(arr: string[] | string | undefined): string {
  return Array.isArray(arr) ? arr.join(", ") : arr || "";
}
function stringToTags(str: string): string[] {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminProjectsPage() {
  const { items, loading, error, addItem, updateItem, removeItem } =
    useCrud<Project>(projectsService);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectForm>(EMPTY);
  const [confirmTarget, setConfirmTarget] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (row: Project) => {
    setEditing(row);
    setForm({
      ...row,
      tags: tagsToString(row.tags),
      image_url: row.image_url || "",
      link_url: row.link_url || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, tags: stringToTags(form.tags) };
    try {
      if (editing) {
        await updateItem(editing.id, payload);
      } else {
        await addItem(payload);
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

  const set = (key: keyof ProjectForm) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Projects</h2>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          + Add Project
        </button>
      </div>

      <ErrorBanner message={error} />

      <AdminTable
        columns={COLUMNS}
        rows={items}
        onEdit={openEdit}
        onDelete={setConfirmTarget}
        loading={loading}
      />

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Project" : "Add Project"}
        onClose={closeModal}
        onSubmit={handleSave}
      >
        <div className="admin-field-row">
          <FormField
            label="Emoji"
            value={form.emoji}
            onChange={set("emoji")}
            required
          />
          <FormField
            label="Sort Order"
            value={form.sort_order}
            onChange={(v) => setForm((f) => ({ ...f, sort_order: Number(v) }))}
            type="number"
          />
        </div>

        <div className="admin-lang-group">
          <span className="admin-lang-badge">🇬🇧 English</span>
          <FormField
            label="Title (EN)"
            value={form.title_en}
            onChange={set("title_en")}
            required
          />
          <FormField
            label="Description (EN)"
            value={form.description_en}
            onChange={set("description_en")}
            textarea
          />
        </div>

        <div className="admin-lang-group">
          <span className="admin-lang-badge">🇻🇳 Tiếng Việt</span>
          <FormField
            label="Title (VI)"
            value={form.title_vi}
            onChange={set("title_vi")}
          />
          <FormField
            label="Description (VI)"
            value={form.description_vi}
            onChange={set("description_vi")}
            textarea
          />
        </div>

        <FormField
          label="Tags (comma-separated)"
          value={form.tags}
          onChange={set("tags")}
          placeholder="React, Node.js, etc."
        />
        <FormField
          label="Image URL"
          value={form.image_url}
          onChange={set("image_url")}
          placeholder="https://..."
        />
        <FormField
          label="Link URL"
          value={form.link_url}
          onChange={set("link_url")}
          placeholder="https://..."
        />

        {saving && <p className="admin-saving">Saving…</p>}
      </AdminModal>

      <ConfirmDialog
        open={!!confirmTarget}
        itemLabel={confirmTarget?.title_en || ""}
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
