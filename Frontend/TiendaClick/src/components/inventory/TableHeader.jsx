export default function TableHeader() {
  return (
    <thead className="thead-products">
      <tr>
        <th className="col-code">Código</th>
        <th className="col-name">Nombre</th>
        <th className="col-sell-price">Precio Venta</th>
        <th className="col-buy-price">Precio Compra</th>
        <th className="col-stock">Stock</th>
        <th className="col-last-modification">Última Modificación</th>
      </tr>
    </thead>
  );
}