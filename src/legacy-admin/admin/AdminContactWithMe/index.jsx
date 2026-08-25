import { useEffect, useRef, useState } from "react";
import AdminTable from "../../../components/admin/AdminTable";
import ErrorBanner from "../../../components/admin/ErrorBanner";
import {
  contactWithMeService,
  replyEmailService,
} from "../../../services/contactMeService";

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  {
    key: "message",
    label: "Message",
    render: (v) => (
      <span title={v} style={{ maxWidth: 260, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {v}
      </span>
    ),
  },
  {
    key: "replied_at",
    label: "Status",
    render: (v) =>
      v ? (
        <span style={{ color: "#4ade80" }}>
          ✅ Replied {new Date(v).toLocaleDateString()}
        </span>
      ) : (
        <span style={{ color: "#facc15" }}>⏳ Pending</span>
      ),
  },
  {
    key: "created_at",
    label: "Created At",
    render: (v) => new Date(v).toLocaleString(),
  },
];

/* ── Reply Modal ──────────────────────────────────────────── */
function ReplyModal({ contact, onClose, onSent }) {
  const dialogRef = useRef(null);
  const [subject, setSubject] = useState(`Re: Message from ${contact?.name ?? ""}`);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (contact && !d.open) d.showModal();
    if (!contact && d.open) d.close();
  }, [contact]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files ?? []);
    // Limit total size to 10 MB
    const totalSize = selected.reduce((s, f) => s + f.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      setError("Total attachment size must be under 10 MB");
      return;
    }
    setFiles(selected);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    setError("");
    try {
      await replyEmailService({
        contactId: contact.id,
        email: contact.email,
        subject,
        message: `<div style="font-family:sans-serif;line-height:1.6">${message.replaceAll("\n", "<br/>")}</div>`,
        attachments: files,
      });
      onSent();
    } catch (err) {
      setError(err.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  if (!contact) return null;

  return (
    <dialog
      ref={dialogRef}
      className="admin-modal"
      onClick={(e) => e.target === dialogRef.current && onClose()}
    >
      <form className="admin-modal-inner" onSubmit={handleSend} style={{ maxWidth: 600 }}>
        <div className="admin-modal-header">
          <h3>Reply to {contact.name}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          {/* Original message */}
          <div style={{ background: "#1a1a2e", padding: "0.75rem 1rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.85rem", color: "#a0a0b8" }}>
            <strong>From:</strong> {contact.name} &lt;{contact.email}&gt;
            <br />
            <strong>Message:</strong>
            <p style={{ margin: "0.5rem 0 0", whiteSpace: "pre-wrap" }}>{contact.message}</p>
          </div>

          {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

          {/* Subject */}
          <div className="admin-field">
            <label htmlFor="reply-subject" className="admin-label">Subject</label>
            <input
              id="reply-subject"
              className="admin-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Message body */}
          <div className="admin-field">
            <label htmlFor="reply-message" className="admin-label">
              Message <span className="admin-required">*</span>
            </label>
            <textarea
              id="reply-message"
              className="admin-input admin-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Type your reply…"
              required
            />
          </div>

          {/* Attachments */}
          <div className="admin-field">
            <label htmlFor="reply-attachments" className="admin-label">Attachments</label>
            <input
              id="reply-attachments"
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ color: "#ccc" }}
            />
            {files.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0" }}>
                {files.map((f, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.85rem",
                      color: "#ccc",
                      marginBottom: "0.25rem",
                    }}
                  >
                    📎 {f.name}{" "}
                    <span style={{ color: "#888" }}>
                      ({(f.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f87171",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="admin-modal-footer">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={sending || !message.trim()}
          >
            {sending ? "Sending…" : "Send Reply"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function AdminContactWithMe() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataSearch, setDataSearch] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);

  const loadData = async (searchText = "") => {
    try {
      setLoading(true);
      const data = await contactWithMeService.getAll({ searchText });
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => loadData(dataSearch);

  const handleReplySent = () => {
    setReplyTarget(null);
    loadData(dataSearch); // reload to show updated replied_at
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Contacts with me</h2>
      </div>

      <ErrorBanner message={error} />

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          className="admin-input"
          placeholder="Search by email or name…"
          value={dataSearch}
          onChange={(e) => setDataSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1 }}
        />
        <button className="admin-btn admin-btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      <AdminTable
        columns={COLUMNS}
        rows={items}
        loading={loading}
        showEdit={false}
        showDelete={false}
        actionButtons={(row) => (
          <button
            className="admin-btn admin-btn-edit"
            onClick={() => setReplyTarget(row)}
          >
            {row.replied_at ? "Reply Again" : "Reply"}
          </button>
        )}
      />

      <ReplyModal
        contact={replyTarget}
        onClose={() => setReplyTarget(null)}
        onSent={handleReplySent}
      />
    </div>
  );
}
