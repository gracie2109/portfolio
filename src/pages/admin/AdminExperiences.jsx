import { useState } from "react";
import { useCrud } from "../../hooks/useCrud";
import { experiencesService } from "../../services/experiencesService";
import AdminTable from "../../components/admin/AdminTable";
import AdminModal from "../../components/admin/AdminModal";
import FormField from "../../components/admin/FormField";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import ErrorBanner from "../../components/admin/ErrorBanner";

const EMPTY = {
  start_time: "",
  end_time: "",
  company: "",
  role_en: "",
  role_vi: "",
  description_en: "",
  description_vi: "",
  sort_order: 0,
};

const COLUMNS = [
  {
    key: "start_time",
    label: "Period",
    render: (_v, row) => (
      <span>
        {row.start_time} — {row.end_time || "Present"}
      </span>
    ),
  },
  { key: "company", label: "Company" },
  {
    key: "role_en",
    label: "Role (EN / VI)",
    render: (_v, row) => (
      <div>
        <div>{row.role_en}</div>
        <div className="admin-sub">{row.role_vi}</div>
      </div>
    ),
  },
  {
    key: "description_en",
    label: "Description",
    render: (v) => <span className="admin-truncate">{v}</span>,
  },
  { key: "sort_order", label: "Order" },
];

export default function AdminExperiences() {
  const { items, loading, error, addItem, updateItem, removeItem } =
    useCrud(experiencesService);

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
      ...row,
      end_time: row.end_time || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, end_time: form.end_time || null };
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
        <h2>Experiences</h2>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          + Add Experience
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
        title={editing ? "Edit Experience" : "Add Experience"}
        onClose={closeModal}
        onSubmit={handleSave}
      >
        <div className="admin-field-row">
          <FormField
            label="Start"
            value={form.start_time}
            onChange={set("start_time")}
            required
            placeholder="2025-01"
          />
          <FormField
            label="End"
            value={form.end_time}
            onChange={set("end_time")}
            placeholder="empty = Present"
          />
          <FormField
            label="Company"
            value={form.company}
            onChange={set("company")}
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
            label="Role (EN)"
            value={form.role_en}
            onChange={set("role_en")}
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
            label="Role (VI)"
            value={form.role_vi}
            onChange={set("role_vi")}
          />
          <FormField
            label="Description (VI)"
            value={form.description_vi}
            onChange={set("description_vi")}
            textarea
          />
        </div>

        {saving && <p className="admin-saving">Saving…</p>}
      </AdminModal>

      <ConfirmDialog
        open={!!confirmTarget}
        itemLabel={confirmTarget?.role_en || ""}
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
