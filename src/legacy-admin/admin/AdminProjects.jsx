import { useState } from "react";
import { useCrud } from "../../hooks/useCrud";
import { projectsService } from "../../services/projectsService";
import AdminTable from "../../components/admin/AdminTable";
import AdminModal from "../../components/admin/AdminModal";
import FormField from "../../components/admin/FormField";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import ErrorBanner from "../../components/admin/ErrorBanner";
import SkillOrb from "../../components/ui/SkillOrb";

const EMPTY = {
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
    render: (value) => (
      <SkillOrb
        skill={{
          icon: value,
        }}
        index={value}
        isPlainIcon
      />
    ),
  },
  {
    key: "title_en",
    label: "Title (EN / VI)",
    render: (_v, row) => (
      <div>
        <div>{row.title_en}</div>
        <div className="admin-sub">{row.title_vi}</div>
      </div>
    ),
  },
  {
    key: "tags",
    label: "Tags",
    render: (tags) =>
      (tags || []).map((t) => (
        <span key={t} className="admin-tag">
          {t}
        </span>
      )),
  },
  { key: "sort_order", label: "Order" },
];

/**
 * Converts a comma-separated string to an array and vice-versa for the tags field.
 */
function tagsToString(arr) {
  return Array.isArray(arr) ? arr.join(", ") : arr || "";
}
function stringToTags(str) {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminProjects() {
  const { items, loading, error, addItem, updateItem, removeItem } =
    useCrud(projectsService);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      tags: tagsToString(row.tags),
      image_url: row.image_url || "",
      link_url: row.link_url || "",
      ...row,
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

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

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
            onChange={(v) => set("sort_order")(Number(v))}
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
