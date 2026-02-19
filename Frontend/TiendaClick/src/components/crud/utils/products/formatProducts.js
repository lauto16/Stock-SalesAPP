export function formatProducts(products) {
    if (!products) return [];
    return products.map((p) => ({
        value: p.code,
        label: `${p.name} (${p.code}) - $${p.sell_price.toFixed(2)} - Stock: ${p.stock}`,
        ...p
    }));
}

export function castProductData(product) {
    return {
        ...product,
        sell_price: Number(product.sell_price),
        stock: Number(product.stock),
        buy_price: Number(product.buy_price),
    }
}