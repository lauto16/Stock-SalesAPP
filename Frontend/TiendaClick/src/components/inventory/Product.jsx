export default function Product(props) {
    const item = props.item
    const selectProduct = props.selectProduct
    const index = props.index
    const selectedProducts = props.selectedProducts

    

    return (
        <tr
            id={item.code}
            onClick={(e) => selectProduct(e, item.code)}
            key={index}
            className={selectedProducts.includes(item.code) ? 'selected-product' : ''}
        >
            <td className="col-code">{item.code}</td>
            <td className="col-name">{item.name}</td>
            <td className="col-sell-price">${item.sell_price}</td>
            <td className="col-buy-price">${item.buy_price}</td>
            <td className="col-stock">{item.stock}</td>
            <td className="col-last-modification">{item.last_modification}</td>
        </tr>
    )
}