
import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StockSalesApp.settings')
django.setup()

from rest_framework.test import APIClient
from Auth.models import CustomUser
from InventoryAPI.models import Product
from EntryAPI.models import Entry

def run_tests():
    print("Starting Verification...")
    
    # Get a user and a product
    user = CustomUser.objects.first()
    if not user:
        print("Error: No user found.")
        return

    product = Product.objects.filter(in_use=True).first()
    if not product:
        print("Error: No product found.")
        return

    print(f"User: {user.email}")
    print(f"Product Code: {product.code}")

    client = APIClient()
    client.force_authenticate(user=user)

    # 1. Test Create
    print("\n[TEST] Creating Entry...")
    create_data = {
        "details": [
            {
                "product": product.code,
                "quantity": 10,
                "unit_price": 100.0,
                "observations": "Test create"
            }
        ]
    }
    
    response = client.post('/api/entries/', create_data, format='json')
    
    entry_id = None
    if response.status_code != 201:
        print(f"FAILED: Create returned {response.status_code}")
        print(response.data)
        return
    else:
        print("SUCCESS: Entry Created")
        if 'entry' in response.data:
            entry_data = response.data['entry']
        else:
            entry_data = response.data # Maybe serializer returns data directly if not wrapped
            
        entry_id = entry_data['id']
        print(f"Entry ID: {entry_id}")
        print(f"Total: {entry_data['total']}")

    if not entry_id:
        print("Could not get entry ID, aborting.")
        return

    # 2. Test Patch (Update)
    print("\n[TEST] Patching Entry...")
    patch_data = {
        "details": [
            {
                "product": product.code,
                "quantity": 20,
                "unit_price": 100.0, # Total should be 2000
                "observations": "Test patch"
            }
        ]
    }

    response = client.patch(f'/api/entries/{entry_id}/', patch_data, format='json')

    if response.status_code != 200:
        print(f"FAILED: Patch returned {response.status_code}")
        print(response.data)
    else:
        print("SUCCESS: Entry Patched")
        if 'entry' in response.data:
            entry_data = response.data['entry']
        else:
            entry_data = response.data

        print(f"New Total: {entry_data['total']}")
        
        # Verify details count
        entry = Entry.objects.get(pk=entry_id)
        details_count = entry.details.count()
        print(f"Details count in DB: {details_count} (Expected: 1)")
        
        detail = entry.details.first()
        if detail and detail.quantity == 20:
             print("SUCCESS: Quantity updated correctly")
        else:
             print(f"FAILED: Quantity mismatch (Expected 20, got {detail.quantity if detail else 'None'})")


    # Cleanup
    print("\n[CLEANUP] Deleting test entry (ORM)...")
    try:
        if entry_id:
            Entry.objects.get(pk=entry_id).delete()
            print("Done.")
    except Exception as e:
        print(f"Error deleting entry: {e}")

if __name__ == "__main__":
    run_tests()
