"""
set_local_ip.py

Detecta la IP local "saliente" de la máquina (la que usa para salir a la red)
y guarda {"local_ip": "x.x.x.x"} en config.json dentro del directorio indicado.

Uso:
    python set_local_ip.py              # escribe config.json en el directorio donde está el script
    python set_local_ip.py -d "C:\ruta\al\repo"
"""

import socket
import json
import os
import argparse
import sys

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = None
    finally:
        s.close()
    if not ip:
        try:
            ip = socket.gethostbyname(socket.gethostname())
            if ip.startswith("127."):
                ip = None
        except Exception:
            ip = None
    return ip or "localhost"

def write_config(path, ip):
    data = {"local_ip": ip}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return path

def main():
    parser = argparse.ArgumentParser(description="Escribe config.json con la IP local detectable.")
    parser.add_argument("-d", "--dir", default=os.path.dirname(os.path.abspath(__file__)),
                        help="Directorio donde guardar config.json (por defecto: carpeta del script)")
    parser.add_argument("-n", "--name", default="config.json", help="Nombre del archivo JSON (por defecto config.json)")
    args = parser.parse_args()

    target_dir = args.dir
    if not os.path.isdir(target_dir):
        print(f"ERROR: el directorio '{target_dir}' no existe.", file=sys.stderr)
        sys.exit(1)

    ip = get_local_ip()
    config_path = os.path.join(target_dir, args.name)
    write_config(config_path, ip)
    print(f"Wrote {config_path} with local_ip = {ip}")

if __name__ == "__main__":
    main()