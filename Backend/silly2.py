import sqlite3

DB_PATH = "db.sqlite3"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("""
    SELECT name
    FROM sqlite_master
    WHERE type='table'
    ORDER BY name;
""")

tablas = cursor.fetchall()

for tabla in tablas:
    print(tabla[0])

conn.close()

