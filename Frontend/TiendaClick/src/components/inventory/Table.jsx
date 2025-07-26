export default function Table({ items = [], loading = false, columns = [] }) {


  return (
    <table className="table table-bordered align-middle">
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index} className={`col-${col.key}`}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody id="table-body">
        {loading ? (
          <tr>
            <td colSpan={columns.length}>Cargando...</td>
          </tr>
        ) : items.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>No hay datos para mostrar.</td>
          </tr>
        ) : (
          items.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`col-${col.key}`}>
                  {item[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
