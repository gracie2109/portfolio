/**
 * Labelled input / textarea / select for admin forms.
 *
 * @param {{ label, value, onChange, type?, textarea?, placeholder?, required?, options? }} props
 */
export default function FormField({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  placeholder = "",
  required = false,
  options = [],
}) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const renderControl = () => {
    if (type === "select") {
      return (
        <select
          id={id}
          className="admin-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }
    if (type === "radio") {
      return (
        <div className="admin-radio-group">
          {options.map((opt) => {
            const optionId = `${id}-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={optionId}
                className="admin-radio-label"
              >
                <input
                  id={optionId}
                  type="radio"
                  name={name || id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  required={required}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
    }
    if (textarea) {
      return (
        <textarea
          id={id}
          className="admin-input admin-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={3}
        />
      );
    }

    return (
      <input
        id={id}
        type={type}
        className="admin-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    );
  };

  return (
    <div className="admin-field">
      <label htmlFor={id} className="admin-label">
        {label}
        {required && <span className="admin-required">*</span>}
      </label>
      {renderControl()}
    </div>
  );
}
