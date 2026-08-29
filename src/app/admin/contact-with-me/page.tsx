"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import AdminTable from "@/components/admin/AdminTable";
import ErrorBanner from "@/components/admin/ErrorBanner";
import { contactWithMeService, replyEmailService } from "@/services/contactMeService";

interface ContactWithMe {
  id: string;
  name: string;
  email: string;
  message: string;
  replied_at: string | null;
  created_at: string;
  reply_count: number;
}

interface ContactReply {
  id: string;
  contact_id: string;
  subject: string;
  message: string;
  attachment_names: string[];
  sent_at: string;
}

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  {
    key: "message",
    label: "Message",
    render: (v: unknown) => (
      <span
        title={v as string}
        style={{ maxWidth: 260, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {v as string}
      </span>
    ),
  },
  {
    key: "replied_at",
    label: "Status",
    render: (v: unknown) =>
      v ? (
        <span style={{ color: "#4ade80" }}>
          ✅ Replied {new Date(v as string).toLocaleDateString()}
        </span>
      ) : (
        <span style={{ color: "#facc15" }}>⏳ Pending</span>
      ),
  },
  {
    key: "created_at",
    label: "Created At",
    render: (v: unknown) => new Date(v as string).toLocaleString(),
  },
  {
    key: "reply_count",
    label: "Replies",
    render: (v: unknown) => <span>{(v as number) ?? 0}</span>,
  },
];

/* ── Reply Modal ──────────────────────────────────────────── */
interface ReplyModalProps {
  contact: ContactWithMe | null;
  onClose: () => void;
  onSent: () => void;
}

function ReplyModal({ contact, onClose, onSent }: ReplyModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [subject, setSubject] = useState(`Re: Message from ${contact?.name ?? ""}`);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (contact && !d.open) d.showModal();
    if (!contact && d.open) d.close();
  }, [contact]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const totalSize = selected.reduce((s, f) => s + f.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      setError("Total attachment size must be under 10 MB");
      return;
    }
    setFiles(selected);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !contact) return;

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
      setError(err instanceof Error ? err.message : "Failed to send email");
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
          <div style={{ background: "#1a1a2e", padding: "0.75rem 1rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.85rem", color: "#a0a0b8" }}>
            <strong>From:</strong> {contact.name} &lt;{contact.email}&gt;
            <br />
            <strong>Message:</strong>
            <p style={{ margin: "0.5rem 0 0", whiteSpace: "pre-wrap" }}>{contact.message}</p>
          </div>

          {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

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

/* ── History Modal ────────────────────────────────────────── */
interface HistoryModalProps {
  contact: ContactWithMe | null;
  onClose: () => void;
}

function HistoryModal({ contact, onClose }: HistoryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [replies, setReplies] = useState<ContactReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (contact && !d.open) d.showModal();
    if (!contact && d.open) d.close();
  }, [contact]);

  useEffect(() => {
    if (!contact) return;
    setLoading(true);
    setError("");
    contactWithMeService
      .getReplies(contact.id)
      .then((data) => {
        setReplies(data);
        // Expand the most recent reply, collapse the rest.
        setCollapsed(
          Object.fromEntries(data.map((r, i) => [r.id, i !== 0]))
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load history"))
      .finally(() => setLoading(false));
  }, [contact]);

  const toggleCollapsed = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!contact) return null;

  return (
    <dialog
      ref={dialogRef}
      className="admin-modal admin-modal-large"
      onClick={(e) => e.target === dialogRef.current && onClose()}
    >
      <div className="admin-modal-inner" style={{ width: "95vw", height: "100%", display: "flex", flexDirection: "column" }}>
        <div className="admin-modal-header">
          <h3>Reply History — {contact.name}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body" style={{ flex: 1, overflowY: "auto" }}>
          {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

          {loading ? (
            <p style={{ fontSize: "0.9rem", color: "#a0a0b8" }}>Loading…</p>
          ) : replies.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#a0a0b8" }}>No replies sent yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {replies.map((r, i) => {
                const isCollapsed = collapsed[r.id];
                const num = replies.length - i;
                return (
                  <div
                    key={r.id}
                    style={{
                      background: "#1a1a2e",
                      borderRadius: 10,
                      fontSize: "0.9rem",
                      color: "#c8c6d8",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCollapsed(r.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0.85rem 1rem",
                        color: "#a0a0b8",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
                        <span style={{ color: "#888", flexShrink: 0 }}>{isCollapsed ? "▶" : "▼"}</span>
                        <span style={{ color: "#6c6ce0", flexShrink: 0 }}>#{num}</span>
                        <strong style={{ color: "#e8e6f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.subject}
                        </strong>
                      </span>
                      <span style={{ flexShrink: 0 }}>{new Date(r.sent_at).toLocaleString()}</span>
                    </button>
                    {!isCollapsed && (
                      <div style={{ padding: "0 1rem 1rem" }}>
                        <div dangerouslySetInnerHTML={{ __html: r.message }} />
                        {r.attachment_names.length > 0 && (
                          <div style={{ marginTop: "0.5rem", color: "#888" }}>
                            📎 {r.attachment_names.join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function AdminContactWithMePage() {
  const [items, setItems] = useState<ContactWithMe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataSearch, setDataSearch] = useState("");
  const [replyTarget, setReplyTarget] = useState<ContactWithMe | null>(null);
  const [historyTarget, setHistoryTarget] = useState<ContactWithMe | null>(null);

  const loadData = async (searchText = "") => {
    try {
      setLoading(true);
      const data = await contactWithMeService.getAll({ searchText });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
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
    loadData(dataSearch);
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
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="admin-btn admin-btn-edit"
              onClick={() => setReplyTarget(row)}
            >
              {row.replied_at ? "Reply Again" : "Reply"}
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setHistoryTarget(row)}
              disabled={!row.reply_count}
            >
              View History
            </button>
          </div>
        )}
      />

      <ReplyModal
        key={replyTarget?.id ?? "none"}
        contact={replyTarget}
        onClose={() => setReplyTarget(null)}
        onSent={handleReplySent}
      />

      <HistoryModal
        contact={historyTarget}
        onClose={() => setHistoryTarget(null)}
      />
    </div>
  );
}
