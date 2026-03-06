import urllib.request
import json

BASE = "http://localhost:3002"

def calc(payload):
    req = urllib.request.Request(
        f"{BASE}/api/tariffs/calculate",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def print_result(d):
    print(f"  Total days: {d['totalDays']}")
    print(f"  Free period: {d['freePeriodDays']} days")
    print(f"  Chargeable: {d['chargeableDays']} days")
    for t in d["tiers"]:
        print(f"  Tier: {t['label']} - {t['days']} days x ${t['dailyRate']} = ${t['tierTotal']}")
    if d.get("dgSurchargeAmount"):
        print(f"  DG surcharge (+20%): ${d['dgSurchargeAmount']}")
    print(f"  TOTAL: ${d['totalCharge']}")
    if d.get("clauseReference"):
        print(f"  Clause: {d['clauseReference']}")

print("=" * 60)
print("TARIFF CALCULATION ENGINE - FULL TEST SUITE")
print("=" * 60)

# Test 1
print("\n--- Test 1: Domestic FCL 20ft stored 12 days ---")
print("Expected: 5 days free + 7 days x $20 = $140")
d = calc({"type":"storage","trafficType":"DOMESTIC_IMPORT","cargoForm":"FCL","containerSize":"20","checkInDate":"2026-02-22","checkOutDate":"2026-03-06"})
print_result(d)
assert d["totalCharge"] == 140, f"FAIL: expected 140, got {d['totalCharge']}"
print("  PASS")

# Test 2
print("\n--- Test 2: Transit FCL 40ft DG, 20 days ---")
print("Expected: 1 day free (DG 24hr), 19 chargeable, +20% DG surcharge")
d = calc({"type":"storage","trafficType":"TRANSIT_IMPORT","cargoForm":"FCL","containerSize":"40","isDangerous":True,"checkInDate":"2026-02-14","checkOutDate":"2026-03-06"})
print_result(d)
# 1 free, 19 chargeable: 6 days x $40 = $240 + 13 days x $80 = $1040 = $1280 base + 20% = $1536
assert d["freePeriodDays"] == 1, f"FAIL: expected 1 free day, got {d['freePeriodDays']}"
assert d["dgSurchargeAmount"] > 0, "FAIL: DG surcharge should be > 0"
print("  PASS")

# Test 3
print("\n--- Test 3: Reefer storage 40ft, 10 days ---")
print("Expected: 2 days free (48hr), 8 chargeable")
d = calc({"type":"storage","trafficType":"DOMESTIC_IMPORT","cargoForm":"FCL","containerSize":"40","isReefer":True,"checkInDate":"2026-02-24","checkOutDate":"2026-03-06"})
print_result(d)
assert d["freePeriodDays"] == 2, f"FAIL: expected 2 free days, got {d['freePeriodDays']}"
print("  PASS")

# Test 4
print("\n--- Test 4: Transit export break bulk, 30 days, 100 HTN ---")
print("Expected: 21 days free, 9 chargeable x $0.50/HTN/day x 100 = $450")
d = calc({"type":"storage","trafficType":"TRANSIT_EXPORT","cargoForm":"BREAKBULK","checkInDate":"2026-02-04","checkOutDate":"2026-03-06","quantity":100})
print_result(d)
assert d["freePeriodDays"] == 21, f"FAIL: expected 21 free days, got {d['freePeriodDays']}"
assert d["totalCharge"] == 450, f"FAIL: expected 450, got {d['totalCharge']}"
print("  PASS")

# Test 5
print("\n--- Test 5: Empty 20ft container, 20 days ---")
print("Expected: 5 free, 10 x $4 + 5 x $8 = $80")
d = calc({"type":"storage","trafficType":"DOMESTIC_IMPORT","cargoForm":"EMPTY","containerSize":"20","checkInDate":"2026-02-14","checkOutDate":"2026-03-06"})
print_result(d)
assert d["totalCharge"] == 80, f"FAIL: expected 80, got {d['totalCharge']}"
print("  PASS")

# Test 6
print("\n--- Test 6: ICD Port Extension - Transit import 20ft, 74 days ---")
print("Expected: 60 days free, 14 x $20 = $280")
d = calc({"type":"storage","trafficType":"TRANSIT_IMPORT","cargoForm":"FCL","containerSize":"20","isICDPortExtension":True,"checkInDate":"2025-12-22","checkOutDate":"2026-03-06"})
print_result(d)
assert d["freePeriodDays"] == 60, f"FAIL: expected 60 free days, got {d['freePeriodDays']}"
assert d["totalCharge"] == 280, f"FAIL: expected 280, got {d['totalCharge']}"
print("  PASS")

# Test 7
print("\n--- Test 7: Domestic FCL 40ft, 25 days ---")
print("Expected: 5 free, 10 x $40 + 10 x $80 = $1,200")
d = calc({"type":"storage","trafficType":"DOMESTIC_IMPORT","cargoForm":"FCL","containerSize":"40","checkInDate":"2026-02-09","checkOutDate":"2026-03-06"})
print_result(d)
assert d["totalCharge"] == 1200, f"FAIL: expected 1200, got {d['totalCharge']}"
print("  PASS")

# Test 8: API data counts
print("\n--- Test 8: Verify seeded data ---")
with urllib.request.urlopen(f"{BASE}/api/tariffs") as resp:
    clauses = json.loads(resp.read())
print(f"  Tariff clauses: {len(clauses)}")
assert len(clauses) == 43, f"FAIL: expected 43 clauses, got {len(clauses)}"

total_rates = sum(c["_count"]["rates"] for c in clauses)
print(f"  Total rates: {total_rates}")
assert total_rates == 225, f"FAIL: expected 225 rates, got {total_rates}"

with urllib.request.urlopen(f"{BASE}/api/customers") as resp:
    customers = json.loads(resp.read())
print(f"  Customers: {len(customers)}")
assert len(customers) == 7, f"FAIL: expected 7 customers, got {len(customers)}"

with urllib.request.urlopen(f"{BASE}/api/warehouse") as resp:
    warehouses = json.loads(resp.read())
print(f"  Warehouses: {len(warehouses)}")
assert len(warehouses) == 5, f"FAIL: expected 5 warehouses, got {len(warehouses)}"
print("  PASS")

# Test 9: Create a container via API
print("\n--- Test 9: Create container via API ---")
container_data = {
    "containerNumber": "MSCU1234567",
    "size": "SIZE_20",
    "containerType": "DRY",
    "isFcl": True,
    "customerId": customers[0]["id"]
}
req = urllib.request.Request(
    f"{BASE}/api/containers",
    data=json.dumps(container_data).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req) as resp:
    container = json.loads(resp.read())
print(f"  Created: {container['containerNumber']} (ID: {container['id'][:8]}...)")
assert container["containerNumber"] == "MSCU1234567"
assert container["size"] == "SIZE_20"
print("  PASS")

# Test 10: Create an invoice via API
print("\n--- Test 10: Create invoice with line items ---")
invoice_data = {
    "customerId": customers[0]["id"],
    "vatRate": 18,
    "lineItems": [
        {
            "description": "Storage - Domestic FCL 20ft, 12 days",
            "clauseReference": "Clause 32",
            "quantity": 1,
            "unitRate": 140,
            "lineTotal": 140
        },
        {
            "description": "Shorehandling - FCL 20ft Import",
            "clauseReference": "Clause 29",
            "quantity": 1,
            "unitRate": 90,
            "lineTotal": 90
        }
    ]
}
req = urllib.request.Request(
    f"{BASE}/api/invoices",
    data=json.dumps(invoice_data).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req) as resp:
    invoice = json.loads(resp.read())
print(f"  Invoice #: {invoice['invoiceNumber']}")
print(f"  Subtotal: ${float(invoice['subtotal'])}")
print(f"  VAT (18%): ${float(invoice['vatAmount'])}")
print(f"  Total: ${float(invoice['totalAmount'])}")
print(f"  Line items: {len(invoice['lineItems'])}")
assert float(invoice['subtotal']) == 230
assert float(invoice['vatAmount']) == 41.4
assert float(invoice['totalAmount']) == 271.4
print("  PASS")

print("\n" + "=" * 60)
print("ALL 10 TESTS PASSED")
print("=" * 60)
