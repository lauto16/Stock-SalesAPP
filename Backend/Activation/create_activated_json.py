from datetime import datetime
import json
import os

FILE_NAME = "activated.json"

def create_activation_file():
    file_path = os.path.join(os.getcwd(), FILE_NAME)

    data = {
        "activated": False,
        "free_trial_init": datetime.now().strftime("%d/%m/%Y")
    }

    with open(file_path, "w") as f:
        json.dump(data, f, indent=4)

    print(f"Archivo creado en: {file_path}")


if __name__ == "__main__":
    create_activation_file()