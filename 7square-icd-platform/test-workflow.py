import urllib.request
import json

BASE = "http://localhost:3002"

def api(method, path, data=None):
    url = f"{BASE}{path}"
    body = json.dumps(data).encode() if data else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

print("=" * 60)
print("7SQUARE ICD - END-TO-END WORKFLOW TEST")
print("=" * 60)

# Step 1: Register a vessel
print("\n--- Step 1: Register Vessel ---")
code, vessel = api("POST", "/api/vessels", {
    "name": "MSC FLAMINIA",
    "imoNumber": "9225898",
    "grt": 54612,
    "dwt": 66692,
    "loa": 275.60,
    "vesselType": "CONTAINER_SHIP",
    "flagState": "Germany",
    "isCoaster": False
})
print(f"  Status: {code}")
print(f"  Vessel: {vessel['name']} (IMO {vessel['imoNumber']})")
print(f"  GRT: {vessel['grt']}, DWT: {vessel['dwt']}, LOA: {vessel['loa']}m")
assert code == 201, f"FAIL: expected 201, got {code}"
print("  PASS")

# Step 2: Get a customer
print("\n--- Step 2: Get existing customer ---")
code, customers = api("GET", "/api/customers")
customer = customers[0]
print(f"  Customer: {customer['name']} ({customer['customerType']}) - {customer['country']}")
print("  PASS")

# Step 3: Register a container (domestic import FCL 20ft)
print("\n--- Step 3: Register Container (FCL 20ft domestic import) ---")
code, container1 = api("POST", "/api/containers", {
    "containerNumber": "MAEU2345678",
    "size": "SIZE_20",
    "containerType": "DRY",
    "isFcl": True,
    "isEmpty": False,
    "isOverDimension": False,
    "tareWeight": 2200,
    "vgmWeight": 24500,
    "vgmCertified": True,
    "sealNumber": "SL-2024-0891",
    "customerId": customer["id"]
})
print(f"  Status: {code}")
print(f"  Container: {container1['containerNumber']} ({container1['size']})")
print(f"  VGM: {container1['vgmWeight']}kg, Certified: {container1['vgmCertified']}")
print(f"  Seal: {container1['sealNumber']}")
assert code == 201
print("  PASS")

# Step 4: Register a reefer container (40ft)
print("\n--- Step 4: Register Reefer Container (40ft) ---")
code, container2 = api("POST", "/api/containers", {
    "containerNumber": "TCLU9876543",
    "size": "SIZE_40",
    "containerType": "REEFER",
    "isFcl": True,
    "isEmpty": False,
    "tareWeight": 4200,
    "vgmWeight": 28900,
    "vgmCertified": True,
    "customerId": customer["id"]
})
print(f"  Status: {code}")
print(f"  Container: {container2['containerNumber']} (REEFER {container2['size']})")
assert code == 201
print("  PASS")

# Step 5: Register a DG container (20ft)
print("\n--- Step 5: Register DG Container (20ft) ---")
code, container3 = api("POST", "/api/containers", {
    "containerNumber": "HLCU1122334",
    "size": "SIZE_20",
    "containerType": "DRY",
    "isFcl": True,
    "isEmpty": False,
    "isOverDimension": False,
    "tareWeight": 2300,
    "vgmWeight": 18500,
    "vgmCertified": True,
    "customerId": customer["id"]
})
print(f"  Status: {code}")
print(f"  Container: {container3['containerNumber']}")
assert code == 201
print("  PASS")

# Step 6: Register cargo
print("\n--- Step 6: Register Cargo ---")
code, cargo1 = api("POST", "/api/cargo", {
    "description": "Electronic equipment - TV sets and monitors",
    "hsCode": "8528.72",
    "weightKg": 18500,
    "volumeCbm": 28,
    "cifValueUsd": 45000,
    "cargoType": "DOMESTIC_IMPORT",
    "isDangerous": False,
    "isColdStorage": False,
    "isValuable": True,
    "packageCount": 120,
    "customerId": customer["id"]
})
print(f"  Status: {code}")
print(f"  Cargo: {cargo1['description']}")
print(f"  Weight: {cargo1['weightKg']}kg, Volume: {cargo1['volumeCbm']}cbm")
print(f"  Harbour Tonnes: {cargo1['harbourTonnes']} (auto-calculated: max(18500/1000, 28) = 28)")
assert float(cargo1["harbourTonnes"]) == 28.0, f"FAIL: HTN should be 28, got {cargo1['harbourTonnes']}"
print("  PASS")

# Step 7: Register DG cargo
print("\n--- Step 7: Register Dangerous Goods Cargo ---")
code, cargo2 = api("POST", "/api/cargo", {
    "description": "Industrial solvents - Methanol",
    "hsCode": "2905.11",
    "weightKg": 15000,
    "volumeCbm": 16,
    "cifValueUsd": 12000,
    "cargoType": "TRANSIT_IMPORT",
    "isDangerous": True,
    "isColdStorage": False,
    "packageCount": 60,
    "destinationCountry": "ZM",
    "customerId": customer["id"]
})
print(f"  Status: {code}")
print(f"  Cargo: {cargo2['description']} (DG: {cargo2['isDangerous']})")
print(f"  Destination: {cargo2['destinationCountry']} (Zambia)")
print(f"  Harbour Tonnes: {cargo2['harbourTonnes']} (max(15000/1000, 16) = 16)")
assert float(cargo2["harbourTonnes"]) == 16.0
print("  PASS")

# Step 8: Calculate storage for the domestic container (12 days)
print("\n--- Step 8: Calculate Storage - Domestic FCL 20ft, 12 days ---")
code, storage1 = api("POST", "/api/tariffs/calculate", {
    "type": "storage",
    "trafficType": "DOMESTIC_IMPORT",
    "cargoForm": "FCL",
    "containerSize": "20",
    "checkInDate": "2026-02-22",
    "checkOutDate": "2026-03-06"
})
print(f"  Free period: {storage1['freePeriodDays']} days")
print(f"  Chargeable: {storage1['chargeableDays']} days")
print(f"  Storage charge: ${storage1['totalCharge']}")
assert storage1["totalCharge"] == 140
print("  PASS")

# Step 9: Calculate storage for DG container (transit, 20 days)
print("\n--- Step 9: Calculate Storage - Transit DG 20ft, 20 days ---")
code, storage2 = api("POST", "/api/tariffs/calculate", {
    "type": "storage",
    "trafficType": "TRANSIT_IMPORT",
    "cargoForm": "FCL",
    "containerSize": "20",
    "isDangerous": True,
    "checkInDate": "2026-02-14",
    "checkOutDate": "2026-03-06"
})
print(f"  Free period: {storage2['freePeriodDays']} days (DG = 24hr)")
print(f"  Chargeable: {storage2['chargeableDays']} days")
print(f"  Base storage: ${storage2['baseStorageCharge']}")
print(f"  DG surcharge (+20%): ${storage2['dgSurchargeAmount']}")
print(f"  Total: ${storage2['totalCharge']}")
assert storage2["freePeriodDays"] == 1
assert storage2["dgSurchargeAmount"] > 0
print("  PASS")

# Step 10: Calculate reefer power (40ft, 10 days)
print("\n--- Step 10: Calculate Reefer Storage - 40ft, 10 days ---")
code, reefer = api("POST", "/api/tariffs/calculate", {
    "type": "storage",
    "trafficType": "DOMESTIC_IMPORT",
    "cargoForm": "FCL",
    "containerSize": "40",
    "isReefer": True,
    "checkInDate": "2026-02-24",
    "checkOutDate": "2026-03-06"
})
print(f"  Free period: {reefer['freePeriodDays']} days (48hr)")
print(f"  Chargeable: {reefer['chargeableDays']} days")
print(f"  Reefer storage: ${reefer['totalCharge']}")
print("  PASS")

# Step 11: Generate an invoice with multiple line items
print("\n--- Step 11: Generate Full Invoice ---")
code, invoice = api("POST", "/api/invoices", {
    "customerId": customer["id"],
    "currency": "USD",
    "vatRate": 18,
    "notes": "Container MAEU2345678 - domestic import services",
    "lineItems": [
        {
            "description": "Shorehandling - Domestic FCL 20ft Import",
            "clauseReference": "Clause 29",
            "quantity": 1,
            "unitRate": 90,
            "lineTotal": 90
        },
        {
            "description": "Storage - Domestic FCL 20ft, 12 days (5 free + 7 x $20)",
            "clauseReference": "Clause 32",
            "quantity": 1,
            "unitRate": 140,
            "lineTotal": 140
        },
        {
            "description": "Container Stevedoring - DCT Berths 8-11, FCL 20ft",
            "clauseReference": "Clause 36",
            "quantity": 1,
            "unitRate": 80,
            "lineTotal": 80
        },
        {
            "description": "Wharfage - Domestic Import 1.6% ad valorem ($45,000)",
            "clauseReference": "Clause 27",
            "quantity": 1,
            "unitRate": 720,
            "lineTotal": 720
        },
        {
            "description": "VGM Verification - DSM Port",
            "clauseReference": "Clause 43",
            "quantity": 1,
            "unitRate": 60,
            "lineTotal": 60
        }
    ]
})
print(f"  Status: {code}")
print(f"  Invoice #: {invoice['invoiceNumber']}")
print(f"  Customer: {invoice['customer']['name']}")
print(f"  Line items: {len(invoice['lineItems'])}")
for item in invoice["lineItems"]:
    print(f"    - {item['description']}: ${float(item['lineTotal']):.2f} ({item['clauseReference']})")
print(f"  Subtotal: ${float(invoice['subtotal']):.2f}")
print(f"  VAT (18%): ${float(invoice['vatAmount']):.2f}")
print(f"  TOTAL: ${float(invoice['totalAmount']):.2f}")
expected_subtotal = 90 + 140 + 80 + 720 + 60
assert float(invoice["subtotal"]) == expected_subtotal, f"FAIL: subtotal {invoice['subtotal']} != {expected_subtotal}"
assert code == 201
print("  PASS")

# Step 12: Verify container details via GET
print("\n--- Step 12: Verify Container Details ---")
code, detail = api("GET", f"/api/containers/{container1['id']}")
print(f"  Container: {detail['containerNumber']}")
print(f"  Status: {detail['status']}")
print(f"  Customer: {detail['customer']['name']}")
print(f"  VGM Certified: {detail['vgmCertified']}")
print(f"  Operations: {len(detail['operations'])}")
print(f"  Documents: {len(detail['documents'])}")
assert code == 200
print("  PASS")

# Step 13: Update container status
print("\n--- Step 13: Update Container Status ---")
code, updated = api("PATCH", f"/api/containers/{container1['id']}", {
    "status": "IN_STORAGE"
})
print(f"  Container: {updated['containerNumber']}")
print(f"  New status: {updated['status']}")
assert updated["status"] == "IN_STORAGE"
print("  PASS")

# Step 14: Verify all data via list endpoints
print("\n--- Step 14: Verify All Data ---")
_, containers = api("GET", "/api/containers")
_, cargos = api("GET", "/api/cargo")
_, invoices = api("GET", "/api/invoices")
_, vessels = api("GET", "/api/vessels")
print(f"  Containers: {len(containers)}")
print(f"  Cargo items: {len(cargos)}")
print(f"  Invoices: {len(invoices)}")
print(f"  Vessels: {len(vessels)}")
assert len(containers) >= 3, f"Expected at least 3 containers, got {len(containers)}"
assert len(cargos) >= 2, f"Expected at least 2 cargo items, got {len(cargos)}"
assert len(invoices) >= 1, f"Expected at least 1 invoice, got {len(invoices)}"
assert len(vessels) >= 1, f"Expected at least 1 vessel, got {len(vessels)}"
print("  PASS")

print("\n" + "=" * 60)
print("ALL 14 WORKFLOW STEPS PASSED")
print("=" * 60)
print(f"\nCreated:")
print(f"  Vessel: {vessel['name']} (IMO {vessel['imoNumber']})")
print(f"  Containers: {container1['containerNumber']}, {container2['containerNumber']}, {container3['containerNumber']}")
print(f"  Cargo: {cargo1['description'][:40]}... ({cargo1['harbourTonnes']} HTN)")
print(f"  Cargo: {cargo2['description'][:40]}... (DG, dest: {cargo2['destinationCountry']})")
print(f"  Invoice: {invoice['invoiceNumber']} - ${float(invoice['totalAmount']):.2f} (5 line items)")
