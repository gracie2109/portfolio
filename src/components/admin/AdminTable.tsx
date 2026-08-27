import type { ReactNode } from "react";

interface AdminColumn<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
}

interface WithId {
  id: string;
}

interface AdminTableProps<T extends WithId> {
  columns: AdminColumn<T>[];
  rows: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  loading?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  actionButtons?: (row: T) => ReactNode;
  hideFunction?: boolean;
}

/**
 * Reusable data table for admin pages.
 */
export default function AdminTable<T extends WithId>({
  columns,
  rows,
  onEdit,
  onDelete,
  loading,
  showEdit = true,
  showDelete = true,
  actionButtons = () => null,
  hideFunction = false,
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>Loading…</span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="admin-empty">
        No records found. Click &quot;Add&quot; to create one.
      </p>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th className="admin-th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render((row as unknown as Record<string, unknown>)[col.key], row)
                    : (row as unknown as Record<string, unknown>)[col.key] as ReactNode}
                </td>
              ))}
              {!hideFunction && (
                <td className="admin-td-actions">
                  {showEdit && (
                    <button
                      className="admin-btn admin-btn-edit"
                      onClick={() => onEdit?.(row)}
                    >
                      Edit
                    </button>
                  )}

                  {showDelete && (
                    <button
                      className="admin-btn admin-btn-delete"
                      onClick={() => onDelete?.(row)}
                    >
                      Delete
                    </button>
                  )}

                  {actionButtons(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
