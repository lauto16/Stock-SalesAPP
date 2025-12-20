from openpyxl import Workbook
from django.http import HttpResponse
import os
from django.conf import settings
from PaymentMethodAPI.models import PaymentMethod
from Auth.models import CustomUser

def export_to_excel(filename: str, columns: list, queryset):
    """
    filename: name of the file (without .xlsx)
    columns: list of tuples -> [("Title", "model_field"), ...]
    queryset: queryset or iterable
    """
    output_folder = os.path.join(settings.MEDIA_ROOT, "planillas_excel")
    os.makedirs(output_folder, exist_ok=True)
    file_name = f'{filename}.xlsx'
    file_path = os.path.join(output_folder, file_name)

    wb = Workbook()
    ws = wb.active
    ws.title = "Datos"
    #headers
    headers = [col[0] for col in columns]
    ws.append(headers)
    
    #rows
    for obj in queryset:
        row = []
        for _, field in columns:
            value = getattr(obj, field, "")
            if (isinstance(value, PaymentMethod)):
                value = value.name
            elif (isinstance(value, CustomUser)):
                value = value.username
                
            row.append(value)
                
                
        ws.append(row)

    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response["Content-Disposition"] = f'attachment; filename="{filename}.xlsx"'
    try:
        wb.save(file_path)
    except Exception as e:
        print(e)
        return False, 'Primero cierre el archivo excel en la computadora principal'
    
    return True, file_path
