/**
 * Reusable data table for admin pages.
 *
 * @param {{ columns: {key,label,render?}[], rows: object[], onEdit, onDelete, loading }} props
 */
export default function AdminTable({ columns, rows, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>Loading…</span>
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="admin-empty">No records found. Click "Add" to create one.</p>;
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
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              <td className="admin-td-actions">
                <button className="admin-btn admin-btn-edit" onClick={() => onEdit(row)}>
                  Edit
                </button>
                <button className="admin-btn admin-btn-delete" onClick={() => onDelete(row)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
