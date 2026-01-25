import Item from "./Item.jsx";
export default function Table({ setIsSomethingSelected,
  items = [],
  loading,
  columns = [],
  selectedItems,
  setSelectedItems,
  pkName }) {
  // columns should be an array of objects with keys: className (css class), key(for finding the element), label(header label)
  if (!Array.isArray(items)) {
    console.error('Items no es un array');
    return <></>;
  }

  return (
    <table className="table table-bordered align-middle">
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index} className={`col-${col.className}`}>{col.label}</th>
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
          items.map((item, index) => (
            <Item setIsSomethingSelected={setIsSomethingSelected}
              item={item}
              key={index}
              columns={columns}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              pkName={pkName} />
          ))

        )}
      </tbody>
    </table>

  );
}

