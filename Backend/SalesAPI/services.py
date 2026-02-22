from django.utils import timezone
from escpos.printer import Dummy
from pathlib import Path
import win32print
import win32api
import pytz


ARG_TZ = pytz.timezone("America/Argentina/Buenos_Aires")


def format_date(dt):
    if not dt:
        return ""
    local_dt = timezone.localtime(dt, ARG_TZ)
    return local_dt.strftime("%Y/%m/%d")


def format_hour(dt):
    if not dt:
        return ""
    local_dt = timezone.localtime(dt, ARG_TZ)
    return local_dt.strftime("%H:%M:%S")


def generate_ticket_data(sale):
    p = Dummy()
    text_lines = []

    p.set(align='center', bold=True, width=2, height=2)    
    line = f"Fecha: {format_date(sale.created_at)}"
    p.text(line + "\n")
    text_lines.append(line)

    line = f"Hora: {format_hour(sale.created_at)}"
    p.text(line + "\n")
    text_lines.append(line)

    p.set(align='left')
    line = f"Venta #{sale.id}"
    p.text(line + "\n")
    text_lines.append(line)

    sep = "-" * 32
    p.text(sep + "\n")
    text_lines.append(sep)

    for item in sale.items.all():
        line1 = f"{item.product.name}"
        line2 = f"{item.quantity} x ${item.unit_price}"

        p.text(line1 + "\n")
        p.text(line2 + "\n")

        text_lines.append(line1)
        text_lines.append(line2)

    p.text(sep + "\n")
    text_lines.append(sep)

    p.set(align='right')
    total_line = f"TOTAL: ${sale.total_price}"
    p.text(total_line + "\n\n")
    text_lines.append(total_line)

    p.cut()

    data = p.output

    base_path = Path(__file__).resolve().parent / "../../tickets_impresos"
    base_path.mkdir(parents=True, exist_ok=True)

    file_path = base_path / f"venta_{sale.id}.txt"

    with open(file_path, "w", encoding="utf-8") as f:
        f.write("\n".join(text_lines))

    return data


def print_raw_to_default_printer(data: bytes):
    printer_name = win32print.GetDefaultPrinter()
     
    handle = win32print.OpenPrinter(printer_name)
    try:
        job = win32print.StartDocPrinter(handle, 1, ("Ticket", None, "RAW"))
        win32print.StartPagePrinter(handle)
        win32print.WritePrinter(handle, data)
        win32print.EndPagePrinter(handle)
        win32print.EndDocPrinter(handle)
    finally:
        win32print.ClosePrinter(handle)