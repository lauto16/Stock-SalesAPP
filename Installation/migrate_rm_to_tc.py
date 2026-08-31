import sqlite3
import shutil
import os
from datetime import datetime


OLD_DB = "old.sqlite3"
# esta base de datos debe estar migrada a tienda click (se debe realizar post-instalacion)
NEW_DB = "new.sqlite3"
BACKUP_DB = "new_backup.sqlite3"

def connect_old():
    connection = sqlite3.connect(OLD_DB)
    connection.row_factory = sqlite3.Row
    return connection


def connect_new():
    connection = sqlite3.connect(NEW_DB)
    connection.row_factory = sqlite3.Row
    return connection


def create_backup():
    if not os.path.exists(NEW_DB):
        raise FileNotFoundError(
            f"No existe la base nueva: {NEW_DB}"
        )

    shutil.copy2(NEW_DB, BACKUP_DB)

    print(f"[+] Backup creado: {BACKUP_DB}")


def get_or_create_provider(new_conn, provider_name):
    """
    Busca un proveedor por nombre.
    Si no existe, lo crea.

    Devuelve el ID del proveedor.
    """

    if provider_name is None:
        return None

    provider_name = provider_name.strip()

    if not provider_name:
        return None

    cursor = new_conn.cursor()

    cursor.execute(
        """
        SELECT id
        FROM ProvidersAPI_provider
        WHERE name = ?
        LIMIT 1
        """,
        (provider_name,)
    )

    row = cursor.fetchone()

    if row:
        return row["id"]

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute(
        """
        INSERT INTO ProvidersAPI_provider
        (
            name,
            address,
            created_at,
            updated_at,
            email,
            phone
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            provider_name,
            "",
            now,
            now,
            "",
            "",
        )
    )

    provider_id = cursor.lastrowid

    print(
        f"    [+] Proveedor creado: "
        f"{provider_name} (ID {provider_id})"
    )

    return provider_id


def migrate_products(old_conn, new_conn):
    """
    Migra:

        InventaryAPI_product
                ↓
        InventoryAPI_product

    Relación:

        old.id
          ↓
        old.code
          ↓
        new.code
    """

    old_cursor = old_conn.cursor()
    new_cursor = new_conn.cursor()

    old_cursor.execute(
        """
        SELECT
            id,
            name,
            usd_price,
            pesos_price,
            provider,
            last_modification,
            stock,
            code
        FROM InventaryAPI_product
        ORDER BY id
        """
    )

    products = old_cursor.fetchall()

    created = 0
    updated = 0
    skipped = 0

    print()
    print("=" * 60)
    print("MIGRANDO PRODUCTOS")
    print("=" * 60)

    for old_product in products:

        code = old_product["code"]

        if not code:
            print(
                f"[!] Producto ID {old_product['id']} "
                f"sin código. Se omite."
            )
            skipped += 1
            continue

        provider_id = get_or_create_provider(
            new_conn,
            old_product["provider"]
        )

        # Verificar si ya existe
        new_cursor.execute(
            """
            SELECT code
            FROM InventoryAPI_product
            WHERE code = ?
            """,
            (code,)
        )

        exists = new_cursor.fetchone()

        if exists:

            # Actualizar producto existente
            new_cursor.execute(
                """
                UPDATE InventoryAPI_product
                SET
                    name = ?,
                    stock = ?,
                    sell_price = ?,
                    provider_id = ?,
                    last_modification = ?,
                    in_use = 1
                WHERE code = ?
                """,
                (
                    old_product["name"],
                    old_product["stock"],
                    old_product["pesos_price"],
                    provider_id,
                    old_product["last_modification"],
                    code,
                )
            )

            updated += 1

            print(
                f"[~] Producto actualizado: "
                f"{code} - {old_product['name']}"
            )

        else:

            # Crear producto nuevo
            new_cursor.execute(
                """
                INSERT INTO InventoryAPI_product
                (
                    code,
                    name,
                    stock,
                    sell_price,
                    buy_price,
                    last_modification,
                    provider_id,
                    category_id,
                    expiration,
                    in_use
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    code,
                    old_product["name"],
                    old_product["stock"],
                    old_product["pesos_price"],
                    0,
                    old_product["last_modification"],
                    provider_id,
                    None,
                    None,
                    1,
                )
            )

            created += 1

            print(
                f"[+] Producto creado: "
                f"{code} - {old_product['name']}"
            )

    new_conn.commit()

    print()
    print(f"Productos creados:     {created}")
    print(f"Productos actualizados: {updated}")
    print(f"Productos omitidos:    {skipped}")


def build_product_map(old_conn):
    """
    Construye un mapa:

        old_product_id -> product_code

    Ejemplo:

        1 -> "ABC123"
        2 -> "XYZ456"
    """

    cursor = old_conn.cursor()

    cursor.execute(
        """
        SELECT id, code
        FROM InventaryAPI_product
        """
    )

    rows = cursor.fetchall()

    product_map = {}

    for row in rows:
        product_map[row["id"]] = row["code"]

    return product_map


def migrate_sales(old_conn, new_conn):
    """
    Convierte:

        SellDetail -> Sale
        Sell       -> SaleItem

    Mantiene:
        - fecha
        - recargo
        - cantidades
        - precio unitario
        - productos
    """

    old_cursor = old_conn.cursor()
    new_cursor = new_conn.cursor()

    product_map = build_product_map(old_conn)

    old_cursor.execute(
        """
        SELECT
            id,
            date,
            budget,
            total_pesos,
            total_dollars,
            customer_id,
            surcharge_percentage
        FROM SellAPI_selldetail
        ORDER BY id
        """
    )

    sell_details = old_cursor.fetchall()

    created_sales = 0
    created_items = 0
    skipped_sales = 0

    print()
    print("=" * 60)
    print("MIGRANDO VENTAS")
    print("=" * 60)

    for detail in sell_details:

        detail_id = detail["id"]

        try:

            # ====================================================
            # OBTENER SELLS RELACIONADOS
            # ====================================================

            old_cursor.execute(
                """
                SELECT
                    s.id,
                    s.amount,
                    s.date,
                    s.product_id,
                    s.total_price_pesos,
                    s.total_price_dollars,
                    s.unit_price_pesos,
                    s.unit_price_dollars,
                    s.product_name
                FROM SellAPI_sell s
                INNER JOIN SellAPI_selldetail_sells ds
                    ON ds.sell_id = s.id
                WHERE ds.selldetail_id = ?
                ORDER BY s.id
                """,
                (detail_id,)
            )

            sells = old_cursor.fetchall()

            # ====================================================
            # CREAR SALE
            # ====================================================

            surcharge = detail["surcharge_percentage"] or 0

            initial_price = 0

            # Calculamos inicialmente desde los Sell
            for sell in sells:
                initial_price += (
                    sell["unit_price_pesos"]
                    * sell["amount"]
                )

            total_price = (
                initial_price
                * (1 + surcharge / 100)
            )

            # Si no hay sells, conservar el total viejo
            if not sells:
                initial_price = detail["total_pesos"] or 0
                total_price = initial_price

            new_cursor.execute(
                """
                INSERT INTO SalesAPI_sale
                (
                    total_price,
                    created_by_id,
                    initial_price,
                    applied_charge_percentage,
                    charge_reason,
                    payment_method_id,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    total_price,
                    None,
                    initial_price,
                    surcharge,
                    "Migración desde SellDetail",
                    None,
                    detail["date"],
                )
            )

            sale_id = new_cursor.lastrowid

            # ====================================================
            # CREAR SALE ITEMS
            # ====================================================

            sale_items_for_sale = 0

            for sell in sells:

                old_product_id = sell["product_id"]

                if old_product_id is None:

                    print(
                        f"    [!] Sell {sell['id']} "
                        f"sin producto. Se omite."
                    )

                    continue

                # Obtener código del producto viejo
                product_code = product_map.get(
                    old_product_id
                )

                if product_code is None:

                    print(
                        f"    [!] Sell {sell['id']}: "
                        f"producto viejo {old_product_id} "
                        f"no encontrado."
                    )

                    continue

                # Verificar producto en DB nueva
                new_cursor.execute(
                    """
                    SELECT code
                    FROM InventoryAPI_product
                    WHERE code = ?
                    """,
                    (product_code,)
                )

                new_product = new_cursor.fetchone()

                if new_product is None:

                    print(
                        f"    [!] Sell {sell['id']}: "
                        f"producto {product_code} "
                        f"no existe en DB nueva."
                    )

                    continue

                # Crear SaleItem
                new_cursor.execute(
                    """
                    INSERT INTO SalesAPI_saleitem
                    (
                        unit_price,
                        product_id,
                        sale_id,
                        charge_percentage,
                        quantity
                    )
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        sell["unit_price_pesos"],
                        product_code,
                        sale_id,
                        0,
                        sell["amount"],
                    )
                )

                created_items += 1
                sale_items_for_sale += 1

            # ====================================================
            # COMMIT DE LA VENTA
            # ====================================================

            new_conn.commit()

            created_sales += 1

            print(
                f"[+] Venta vieja {detail_id} "
                f"-> Sale nueva {sale_id} "
                f"({sale_items_for_sale} items)"
            )

        except Exception as e:

            new_conn.rollback()

            skipped_sales += 1

            print(
                f"[ERROR] SellDetail {detail_id}: {e}"
            )

    print()
    print(f"Ventas creadas:       {created_sales}")
    print(f"Items creados:        {created_items}")
    print(f"Ventas omitidas:      {skipped_sales}")


def show_summary(old_conn, new_conn):

    old_cursor = old_conn.cursor()
    new_cursor = new_conn.cursor()

    print()
    print("=" * 60)
    print("RESUMEN")
    print("=" * 60)

    # Productos viejos
    old_cursor.execute(
        "SELECT COUNT(*) AS count FROM InventaryAPI_product"
    )
    old_products = old_cursor.fetchone()["count"]

    # Productos nuevos
    new_cursor.execute(
        "SELECT COUNT(*) AS count FROM InventoryAPI_product"
    )
    new_products = new_cursor.fetchone()["count"]

    # SellDetails
    old_cursor.execute(
        "SELECT COUNT(*) AS count FROM SellAPI_selldetail"
    )
    old_sales = old_cursor.fetchone()["count"]

    # Sales
    new_cursor.execute(
        "SELECT COUNT(*) AS count FROM SalesAPI_sale"
    )
    new_sales = new_cursor.fetchone()["count"]

    # Sell
    old_cursor.execute(
        "SELECT COUNT(*) AS count FROM SellAPI_sell"
    )
    old_sells = old_cursor.fetchone()["count"]

    # SaleItems
    new_cursor.execute(
        "SELECT COUNT(*) AS count FROM SalesAPI_saleitem"
    )
    new_items = new_cursor.fetchone()["count"]

    print()
    print(f"Productos viejos:      {old_products}")
    print(f"Productos nuevos:      {new_products}")
    print()
    print(f"SellDetails viejos:    {old_sales}")
    print(f"Sales nuevas:          {new_sales}")
    print()
    print(f"Sells viejos:          {old_sells}")
    print(f"SaleItems nuevos:      {new_items}")
    print()


def main():

    print("=" * 60)
    print("MIGRACIÓN OLD STORE -> TIENDACLICK")
    print("=" * 60)

    # --------------------------------------------------------
    # Verificar archivos
    # --------------------------------------------------------

    if not os.path.exists(OLD_DB):
        print(f"[ERROR] No existe {OLD_DB}")
        return

    if not os.path.exists(NEW_DB):
        print(f"[ERROR] No existe {NEW_DB}")
        return

    # --------------------------------------------------------
    # Backup
    # --------------------------------------------------------

    print()
    create_backup()

    # --------------------------------------------------------
    # Conectar
    # --------------------------------------------------------

    old_conn = connect_old()
    new_conn = connect_new()

    try:

        # ----------------------------------------------------
        # Productos
        # ----------------------------------------------------

        migrate_products(
            old_conn,
            new_conn
        )

        # ----------------------------------------------------
        # Ventas
        # ----------------------------------------------------

        migrate_sales(
            old_conn,
            new_conn
        )

        # ----------------------------------------------------
        # Resumen
        # ----------------------------------------------------

        show_summary(
            old_conn,
            new_conn
        )

        print("=" * 60)
        print("MIGRACIÓN FINALIZADA")
        print("=" * 60)

    except Exception as e:

        new_conn.rollback()

        print()
        print("=" * 60)
        print("ERROR GENERAL")
        print("=" * 60)
        print(e)

        print()
        print(
            "La base nueva NO se ha restaurado automáticamente."
        )
        print(
            f"Tenés el backup en: {BACKUP_DB}"
        )

    finally:

        old_conn.close()
        new_conn.close()


if __name__ == "__main__":
    main()

