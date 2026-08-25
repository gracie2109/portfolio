import { useState, useMemo } from "react";
import { useCrud } from "../../hooks/useCrud";
import { skillsService } from "../../services/skillsService";
import AdminTable from "../../components/admin/AdminTable";
import AdminModal from "../../components/admin/AdminModal";
import FormField from "../../components/admin/FormField";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import ErrorBanner from "../../components/admin/ErrorBanner";
import SkillOrb from "../../components/ui/SkillOrb";

const EMPTY = { icon: "⚡", name: "", type: "frontend", sort_order: 0 };

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
  { key: "name", label: "Name" },
  {
    key: "type",
    label: "Type",
    render: (value) => {
      const opt = TYPE_OPTIONS.find((o) => o.value === value);
      return opt ? opt.label : value;
    },
  },
  { key: "sort_order", label: "Order" },
];

const FILTER_OPTIONS = [{ value: "all", label: "All" }, ...TYPE_OPTIONS];

export default function AdminSkills() {
  const { items, loading, error, addItem, updateItem, removeItem } =
    useCrud(skillsService);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = add, object = edit
  const [form, setForm] = useState(EMPTY);
  const [confirmTarget, setConfirmTarget] = useState(null);
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

  const openEdit = (row) => {
    setEditing(row);
    setForm({ type: row.type || "frontend", ...row });
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
          onChange={(v) => set("sort_order")(Number(v))}
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
