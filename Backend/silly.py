import sqlite3

# Conectar a la base de datos
conn = sqlite3.connect("db.sqlite3")
cursor = conn.cursor()

# Obtener el primer registro (según rowid)
cursor.execute("SELECT id, pin FROM Auth_customuser ORDER BY id ASC LIMIT 1")
registro = cursor.fetchone()

if registro:
    id, pin_actual = registro
    print(f"Valor actual: {pin_actual}")

    # Nuevo valor
    nuevo_valor = "1234"

    # Actualizar el registro
    cursor.execute(
        "UPDATE Auth_customuser SET pin = ? WHERE id = ?",
        (nuevo_valor, id)
    )

    conn.commit()
    print("Registro actualizado correctamente.")
else:
    print("La tabla está vacía.")

# Cerrar conexión
conn.close()
