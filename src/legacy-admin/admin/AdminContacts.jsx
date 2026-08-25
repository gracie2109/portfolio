import { useState } from "react";
import { useCrud } from "../../hooks/useCrud";
import { contactsService } from "../../services/contactsService";
import AdminTable from "../../components/admin/AdminTable";
import AdminModal from "../../components/admin/AdminModal";
import FormField from "../../components/admin/FormField";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import ErrorBanner from "../../components/admin/ErrorBanner";
import SkillOrb from "../../components/ui/SkillOrb";

const EMPTY = {
  icon: "🔗",
  label: "",
  href: "",
  sort_order: 0,
  data_type: "normal",
};

const COLUMNS = [
  {
    key: "icon",
    label: "Icon",
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
  { key: "label", label: "Label" },
  {
    key: "href",
    label: "URL",
    render: (v) => (
      <a
        href={v}
        target="_blank"
        rel="noreferrer"
        className="admin-truncate"
        style={{ color: "#7c6fe6" }}
      >
        {v}
      </a>
    ),
  },
  { key: "sort_order", label: "Order" },
];

export default function AdminContacts() {
  const { items, loading, error, addItem, updateItem, removeItem } =
    useCrud(contactsService);

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
    setForm({ ...row });
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

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Contacts</h2>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          + Add Contact
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
        title={editing ? "Edit Contact" : "Add Contact"}
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
          label="Label"
          value={form.label}
          onChange={set("label")}
          required
          placeholder="GitHub"
        />
        <FormField
          label="URL"
          value={form.href}
          onChange={set("href")}
          required
          placeholder="https://github.com/you"
        />
        <FormField
          label="Sort Order"
          value={form.sort_order}
          onChange={(v) => set("sort_order")(Number(v))}
          type="number"
        />
        <FormField
          label="Contact Type"
          type="radio"
          name="contactType"
          value={form.data_type}
          onChange={set("data_type")}
          options={[
            { label: "Normal", value: "normal" },
            { label: "Email", value: "mail" },
            { label: "Phone", value: "phone" },
          ]}
        />
        {saving && <p className="admin-saving">Saving…</p>}
      </AdminModal>

      <ConfirmDialog
        open={!!confirmTarget}
        itemLabel={confirmTarget?.label || ""}
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
