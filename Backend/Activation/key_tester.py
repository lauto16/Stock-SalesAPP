import hashlib
import json
import os


def encrypt_string(hash_string):
    sha_signature = hashlib.sha256(hash_string.encode()).hexdigest()
    return sha_signature


def test_key(key: str) -> bool:
    """
    Test if a given key is valid
    """
    FILE_NAME = "keys.json"
    file_path = os.path.join(os.getcwd(), FILE_NAME)

    with open(file_path, "r") as f:
        data = json.load(f)

    keys = data["keys"]

    for valid_key in keys:
        if valid_key == encrypt_string(key):
            return True

    return False
