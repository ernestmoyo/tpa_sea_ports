# Standard Operating Procedure (SOP)
# 7Square ICD Integrated Operations Platform

**Document No:** 7SQ-SOP-001
**Effective Date:** March 2026
**Prepared for:** 7Square Inland Container Depot, Dar es Salaam
**Platform URL:** http://localhost:3002
**Contact:** www.7squareinc.com | info@7squareinc.com

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Login & User Roles](#2-login--user-roles)
3. [Dashboard](#3-dashboard)
4. [Customer Management](#4-customer-management)
5. [Vessel Registry](#5-vessel-registry)
6. [Container Management](#6-container-management)
7. [Cargo Registration](#7-cargo-registration)
8. [Warehouse Management](#8-warehouse-management)
9. [Dangerous Goods (IMDG)](#9-dangerous-goods-imdg)
10. [Reefer Monitoring](#10-reefer-monitoring)
11. [Document Management](#11-document-management)
12. [Tariff Book Reference](#12-tariff-book-reference)
13. [Billing & Invoicing](#13-billing--invoicing)
14. [Reports & KPIs](#14-reports--kpis)
15. [Common Workflows](#15-common-workflows)
16. [Appendix: TPA Tariff Quick Reference](#16-appendix-tpa-tariff-quick-reference)

---

## 1. System Overview

The 7Square ICD Platform manages the full lifecycle of container and cargo operations at the Inland Container Depot, including:

- Container receiving, storage, and release
- Bonded and free warehouse management
- Billing based on the **TPA Sea Ports Tariff Book (Feb 2024)** -- all 43 clauses pre-loaded
- Dangerous goods classification per **IMDG Code**
- Reefer container power and temperature monitoring
- Trade document tracking with **15-minute SLA** per TPA Charter
- SOLAS **VGM (Verified Gross Mass)** compliance
- Transit cargo routing to landlocked countries (Zambia, DRC, Burundi, Rwanda, Malawi, Uganda, Zimbabwe)

**Tech stack:** Next.js 14, PostgreSQL, Prisma ORM, NextAuth.js

---

## 2. Login & User Roles

### 2.1 How to Log In

1. Open the platform in your browser: `http://localhost:3002/login`
2. Enter your **email** and **password**
3. Click **Sign In**

### 2.2 Default Accounts (change passwords after first login)

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@7square.co.tz | admin123 | Full access to all modules |
| Operations | ops@7square.co.tz | admin123 | Containers, cargo, vessels, warehouse |
| Warehouse | warehouse@7square.co.tz | admin123 | Warehouse, storage, reefer |
| Billing | billing@7square.co.tz | admin123 | Invoicing, tariffs, customers |

### 2.3 Navigation

The left sidebar provides access to all 12 modules:
- Dashboard, Containers, Cargo, Warehouse, Vessels, Tariffs, Billing, Documents, Dangerous Goods, Reefer, Customers, Reports

Your name and role appear at the bottom of the sidebar. Click **Sign Out** to log out.

---

## 3. Dashboard

**Path:** Sidebar > Dashboard

The dashboard shows real-time KPI cards:

| Card | What it shows |
|------|--------------|
| Active Containers | Total containers currently registered |
| Customers | Total active customer accounts |
| Warehouses | Number of operational warehouses |
| Invoices | Total invoices generated |
| TPA Tariff Clauses | Number of tariff clauses loaded (should be 43) |
| Tariff Rates Loaded | Total individual rate items (should be 225) |

Use this as your daily operational snapshot.

---

## 4. Customer Management

**Path:** Sidebar > Customers

### 4.1 View Customers
- The customer list shows all active customers with their type, country, and counts of containers/invoices.

### 4.2 Add a New Customer

1. Click **"+ Add Customer"** button (top right)
2. Fill in the form:

| Field | Required | Notes |
|-------|----------|-------|
| Name | Yes | Contact person or company name |
| Type | Yes | Importer, Exporter, Shipping Agent, Clearing Agent, Ship Owner, Terminal Operator, Transit Client |
| Country | Yes | TZ (Tanzania), ZM (Zambia), CD (DRC), BI (Burundi), RW (Rwanda), MW (Malawi), UG (Uganda), ZW (Zimbabwe) |
| Company Name | No | Registered company name |
| Email | No | Contact email |
| Phone | No | Contact phone |
| TIN (Tax ID) | No | Tanzania Revenue Authority TIN |

3. Click **"Add Customer"**
4. You will be redirected to the customer list

**Important:** For transit clients, always select the correct destination country -- this affects storage free periods (transit gets 15-21 days vs domestic 5 days).

---

## 5. Vessel Registry

**Path:** Sidebar > Vessels

### 5.1 Register a Vessel

1. Click **"+ Register Vessel"**
2. Fill in the form:

| Field | Required | Notes |
|-------|----------|-------|
| Vessel Name | Yes | e.g. "MSC FLAMINIA" |
| IMO Number | No | 7-digit IMO number (must be unique) |
| Vessel Type | Yes | Container Ship, Bulk Carrier, Tanker, RORO, General Cargo, Dhow, Coaster, Traditional, Tug, Other |
| GRT | Yes | Gross Registered Tonnage -- **critical for charge calculation** (pilotage, port dues, tug services are per 100 GRT) |
| DWT | No | Deadweight tonnage |
| LOA | No | Length overall in metres |
| Flag State | No | e.g. Panama, Liberia, Tanzania |
| Coaster | Checkbox | Tick if vessel qualifies for reduced coaster rates |

3. Click **"Register Vessel"**

**Why GRT matters:** Pilotage = $5.50/100 GRT, Port Dues = $13.40/100 GRT, Tug = $14.00/100 GRT. A 50,000 GRT vessel entering port costs approximately: Pilotage $2,750 + Port Dues $6,700 + Tug $7,000 = **$16,450** in vessel charges alone.

---

## 6. Container Management

**Path:** Sidebar > Containers

### 6.1 View Containers
- Shows all containers with status badges (Arriving, Received, In Storage, Under Operation, Released, Departed)
- VGM and DG indicators shown where applicable

### 6.2 Register a Container

1. Click **"+ Register Container"**
2. Fill in:

| Field | Required | Notes |
|-------|----------|-------|
| Container Number | Yes | ISO 6346 format, e.g. MSCU1234567 (auto-uppercased) |
| Size | Yes | 20ft, 40ft, or 45ft |
| Type | Yes | Dry, Reefer, Open Top, Flat Rack, Tank, Other |
| Customer | No | Link to existing customer |
| Seal Number | No | Customs/shipping seal |
| Tare Weight | No | Empty weight in kg |
| VGM Weight | No | SOLAS Verified Gross Mass in kg |
| FCL | Checkbox | Full Container Load (default: checked) |
| Empty | Checkbox | Empty container |
| Over-dimension | Checkbox | Triggers **+30% surcharge** on handling |
| VGM Certified | Checkbox | SOLAS VGM compliance confirmed |

3. Click **"Register Container"**

### 6.3 Container Status Lifecycle

```
ARRIVING --> RECEIVED --> IN_STORAGE --> UNDER_OPERATION --> READY_FOR_RELEASE --> RELEASED --> DEPARTED
```

Status updates happen:
- **RECEIVED:** When container physically arrives at ICD
- **IN_STORAGE:** Automatically set when a storage booking is created
- **UNDER_OPERATION:** During stuffing, stripping, palletising, etc.
- **RELEASED:** When all charges paid and customs clearance obtained
- **DEPARTED:** When container physically leaves the ICD

### 6.4 Surcharge Flags

| Flag | Surcharge | Applies To |
|------|-----------|-----------|
| Over-dimension | +30% | Shorehandling (Clause 29), Stevedoring (Clauses 36-38) |
| DG (set via Cargo) | +10% handling, +20% storage | Clauses 14, 29, 32, 36-38 |
| Reefer | Power: $8/day (20ft), $12/day (40ft) | Clause 39 |

---

## 7. Cargo Registration

**Path:** Sidebar > Cargo

### 7.1 Register Cargo

1. Click **"+ Register Cargo"**
2. Fill in:

| Field | Required | Notes |
|-------|----------|-------|
| Description | Yes | e.g. "Electronic equipment, cement bags" |
| Cargo Type | Yes | Domestic Import, Domestic Export, Transit Import, Transit Export, Transshipment, Coastwise |
| HS Code | No | Harmonized System code |
| Weight (kg) | Yes | Gross weight |
| Volume (CBM) | No | Cubic metres |
| CIF Value (USD) | No | For ad valorem wharfage calculation |
| Packages | No | Number of packages |
| Customer | No | Link to customer |
| Destination Country | Conditional | Appears for Transit/Transshipment types |
| Dangerous Goods | Checkbox | +10% handling, +20% storage surcharge |
| Cold Storage | Checkbox | +30% handling surcharge |
| Valuable Cargo | Checkbox | Higher stevedoring rate ($7/HTN vs $5.50/HTN) |

### 7.2 Harbour Tonne Calculation

The system **automatically calculates** harbour tonnes using the formula:

```
Harbour Tonnes (HTN) = MAX(Weight in kg / 1000, Volume in CBM)
```

This is displayed live on the form as you type. HTN is the billing unit for most break-bulk charges.

**Example:** 15,000 kg cargo at 22.5 CBM = MAX(15, 22.5) = **22.5 HTN**

### 7.3 Cargo Type Impact on Billing

| Cargo Type | Free Storage Period | Wharfage Basis |
|------------|-------------------|----------------|
| Domestic Import | 5 days | 1.6% ad valorem |
| Domestic Export | 5 days | 1.0% ad valorem |
| Transit Import | 15 days | $3/HTN flat |
| Transit Export | 21 days | $3/HTN flat |
| Transshipment | 10 days | 0.8% ad valorem |
| Coastwise | 3 days | $2/HTN |

---

## 8. Warehouse Management

**Path:** Sidebar > Warehouse

### 8.1 View Warehouses
- Shows warehouse cards with type, capacity (TEU), and occupancy bar

### 8.2 Add a Warehouse

1. Click **"+ Add Warehouse"**
2. Fill in:

| Field | Required | Notes |
|-------|----------|-------|
| Warehouse Name | Yes | e.g. "Bonded Warehouse A" |
| Type | Yes | Bonded, Free, Reefer Yard, DG Zone, Open Yard |
| Total Capacity (TEU) | Yes | Maximum TEU capacity |
| Location | No | e.g. "Block A, Zone 3" |

3. Click **"Add Warehouse"**

### 8.3 Warehouse Types

| Type | Purpose | Special Rules |
|------|---------|--------------|
| **Bonded** | Customs-controlled goods awaiting clearance | Goods under customs bond |
| **Free** | Cleared goods, general storage | Standard rates |
| **Reefer Yard** | Refrigerated containers | Power supply $8-12/day, 48hr free storage |
| **DG Zone** | Dangerous goods (IMDG compliant) | 24hr free, then +20% storage surcharge |
| **Open Yard** | Break bulk, over-dimension cargo | Standard rates |

---

## 9. Dangerous Goods (IMDG)

**Path:** Sidebar > Dangerous Goods

### 9.1 Register Dangerous Goods

1. Click **"+ Register DG"**
2. Fill in:

| Field | Required | Notes |
|-------|----------|-------|
| UN Number | Yes | e.g. UN1203 (auto-uppercased) |
| IMDG Class | Yes | Class 1-9 per IMDG Code (see table below) |
| Proper Shipping Name | Yes | e.g. "METHANOL" |
| Packing Group | No | I (Great Danger), II (Medium), III (Minor) |
| Flash Point | No | e.g. "11 C" |
| Container | No | Link to container carrying the DG |
| Segregation Group | No | For IMDG segregation compliance |
| Notes | No | Handling instructions |

3. Click **"Register DG"**

### 9.2 IMDG Classes

| Class | Description | Examples |
|-------|-------------|---------|
| 1 | Explosives | Fireworks, ammunition |
| 2.1 | Flammable Gases | LPG, propane |
| 2.2 | Non-Flammable Gases | Nitrogen, CO2 |
| 2.3 | Toxic Gases | Chlorine, ammonia |
| 3 | Flammable Liquids | Methanol, petrol, paint |
| 4.1 | Flammable Solids | Matches, sulphur |
| 4.2 | Spontaneously Combustible | White phosphorus |
| 4.3 | Dangerous When Wet | Sodium, calcium |
| 5.1 | Oxidizing Substances | Ammonium nitrate |
| 5.2 | Organic Peroxides | Methyl ethyl ketone peroxide |
| 6.1 | Toxic Substances | Pesticides, cyanide |
| 6.2 | Infectious Substances | Medical waste |
| 7 | Radioactive Material | Uranium, medical isotopes |
| 8 | Corrosives | Battery acid, bleach |
| 9 | Miscellaneous | Lithium batteries, dry ice |

### 9.3 DG Surcharge Summary

| Charge Type | Surcharge | Reference |
|-------------|-----------|-----------|
| Stevedoring | +10% | Clauses 14, 36, 37, 38 |
| Shorehandling | +10% | Clause 29 |
| Storage | +20% (after 24hr free) | Clause 32 |
| Lighter hire | Treble (3x) rates | Clause 6 |

---

## 10. Reefer Monitoring

**Path:** Sidebar > Reefer

This module tracks refrigerated containers connected to power supply at the ICD.

### 10.1 Key Rates (Clause 39)

| Service | 20ft | 40ft+ |
|---------|------|-------|
| Power supply per day | $8.00 | $12.00 |
| Reefer storage (after 48hr free) per day | $20.00 | $40.00 |

### 10.2 What to Monitor

- **Set Temperature vs Actual Temperature** -- alerts if deviation exceeds threshold
- **Power Status** -- connected/disconnected
- **Days on Power** -- for billing calculation

---

## 11. Document Management

**Path:** Sidebar > Documents

### 11.1 Upload a Document

1. Click **"+ Upload Document"**
2. Fill in:

| Field | Required | Notes |
|-------|----------|-------|
| Document Type | Yes | See list below |
| Document Number | No | e.g. BL-2024-0891 |
| File Name | Yes | e.g. BL_MSCU1234567.pdf |
| Container | No | Link to container |
| Customer | No | Link to customer |
| Notes | No | Additional notes |

3. Click **"Upload Document"**

### 11.2 Document Types

| Type | Abbreviation | When Used |
|------|-------------|-----------|
| Bill of Lading | B/L | Cargo receipt, proof of shipment |
| Delivery Order | D/O | Authorization to release cargo |
| Release Order | R/O | Customs release authorization |
| Customs Declaration | - | Import/export customs filing |
| MSDS | MSDS | Material Safety Data Sheet (DG cargo) |
| Shipping Order | S/O | Booking confirmation |
| Manifest | - | Cargo manifest from vessel |
| VGM Certificate | VGM | SOLAS verified gross mass |
| TANCIS Entry | - | Tanzania Customs Integrated System entry |
| Packing List | - | Itemized cargo contents |
| Commercial Invoice | C/I | Seller's invoice for valuation |
| Certificate of Origin | C/O | Country of manufacture |
| Fumigation Certificate | - | Pest treatment confirmation |
| DG Declaration | - | Dangerous goods declaration form |
| Other | - | Any other document |

### 11.3 SLA Target

Per TPA Charter: **All documents must be processed within 15 minutes** of receipt. The system tracks processing time against this target.

---

## 12. Tariff Book Reference

**Path:** Sidebar > Tariffs

### 12.1 Browsing Tariffs

The tariff page displays all **43 clauses** of the TPA Sea Ports Tariff Book (Feb 2024). Each clause can be expanded to view its rate table.

### 12.2 Key Clauses for Daily Operations

| Clause | Title | What It Covers |
|--------|-------|---------------|
| 1 | Pilotage Fees | $5.50/100 GRT per operation |
| 2 | Port Dues | $13.40/100 GRT first 5 days |
| 5 | Tug Services | $14.00/100 GRT per tug |
| 14 | Stevedoring | $5.50/HTN breakbulk |
| 27 | Wharfage | 1.6% ad valorem import, $90/$180 FCL transit |
| 29 | Shorehandling | $90/$135 domestic FCL, $80/$120 transit FCL |
| 32 | Storage | Tiered daily rates after free period |
| 36 | Container Handling (DCT 8-11) | $80/$120 stevedoring FCL |
| 37 | Container Handling (Berths 0-7) | $100/$150 stevedoring FCL |
| 39 | Other Container Services | Reefer power, stuffing/stripping |
| 42 | ICD Special Rates | $180/$310 (Ubungo), $280/$510 (NASACO) |
| 43 | Miscellaneous | VGM $60, weighing, sorting |

---

## 13. Billing & Invoicing

**Path:** Sidebar > Billing

### 13.1 View Invoices
- Shows all invoices with status (Draft, Issued, Paid, Overdue)
- Filter by status or customer

### 13.2 Create a New Invoice

1. Click **"+ New Invoice"**
2. Fill in the header:

| Field | Required | Notes |
|-------|----------|-------|
| Customer | Yes | Select from registered customers |
| Currency | Yes | USD or TZS |
| VAT Rate (%) | Yes | Default: 18% |
| Notes | No | e.g. "Container MSCU1234567 services" |

3. Add **line items** (click "+ Add Item" for more):

| Field | Notes |
|-------|-------|
| Description | Service description, e.g. "Container handling FCL 20ft" |
| Clause Ref | TPA clause reference, e.g. "Clause 36" |
| Qty | Number of units |
| Unit Rate ($) | Rate per unit from tariff book |
| Line Total | Auto-calculated: Qty x Unit Rate |

4. Review the **totals panel** (bottom right):
   - Subtotal (sum of all line items)
   - VAT (subtotal x VAT rate)
   - **Total** (subtotal + VAT)

5. Click **"Create Invoice (Draft)"**

### 13.3 Invoice Number Format

Auto-generated: `INV-YYYYMMDD-XXXX` (e.g. INV-20260306-0001)

### 13.4 Common Invoice Line Items

**For a typical domestic FCL 20ft container (Clause 32 storage + handling):**

| Line Item | Clause | Rate |
|-----------|--------|------|
| Container stevedoring FCL 20ft | Clause 36 | $80.00 |
| Shorehandling FCL 20ft domestic | Clause 29 | $90.00 |
| Wharfage FCL 20ft domestic | Clause 27 | $90.00 |
| Storage (days beyond free period x daily rate) | Clause 32 | $20.00/day |

**Add surcharges as separate line items or adjust unit rate:**
- DG container: Add +10% to handling lines, +20% to storage lines
- Over-dimension: Add +30% to handling lines
- Cold storage: Add +30% to shorehandling line

---

## 14. Reports & KPIs

**Path:** Sidebar > Reports

Displays UNCTAD port performance indicators:

| KPI | What It Measures |
|-----|-----------------|
| Container Throughput (TEU) | Total TEU handled per period |
| Average Dwell Time | Days containers spend in storage |
| Berth Occupancy Rate | Percentage of time berths are in use |
| Vessel Turnaround Time | Hours from vessel arrival to departure |
| SLA Compliance Rate | % of documents processed within 15 min |
| Revenue per TEU | Average revenue generated per container |

---

## 15. Common Workflows

### Workflow A: Receive an Import Container

```
Step 1: Ensure the customer exists       --> Customers > + Add Customer (if new)
Step 2: Register the vessel (if new)     --> Vessels > + Register Vessel
Step 3: Register the container           --> Containers > + Register Container
                                             (set size, type, customer, VGM)
Step 4: Register the cargo               --> Cargo > + Register Cargo
                                             (set cargo type, weight, volume)
Step 5: Upload documents                 --> Documents > + Upload Document
                                             (B/L, D/O, customs declaration)
Step 6: If DG cargo                      --> Dangerous Goods > + Register DG
                                             (IMDG class, UN number, MSDS)
Step 7: Container enters storage         --> Status auto-updates to IN_STORAGE
Step 8: Generate invoice                 --> Billing > + New Invoice
                                             (add handling, storage, wharfage lines)
Step 9: Release container                --> Container status > RELEASED
```

### Workflow B: Transit Container to Zambia

```
Step 1: Register customer (Transit Client, country: ZM)
Step 2: Register container (FCL 40ft)
Step 3: Register cargo (Transit Import, destination: ZM)
                         Weight: 22,000 kg -> HTN auto-calculated
Step 4: Upload B/L + TANCIS entry + customs declaration
Step 5: Note: Transit gets 15 days FREE storage (vs 5 days domestic)
Step 6: Invoice with transit rates:
         - Shorehandling transit FCL 40ft: $120 (Clause 29)
         - Wharfage transit FCL 40ft: $180 (Clause 27)
         - Storage after day 15: $40/day for 40ft (Clause 32)
Step 7: Release for transit trucking to Zambia
```

### Workflow C: Dangerous Goods Container

```
Step 1: Register container (note: do NOT tick over-dimension unless applicable)
Step 2: Register cargo (tick "Dangerous Goods" checkbox)
Step 3: Register DG details (IMDG class, UN number, packing group)
Step 4: Upload MSDS document
Step 5: Assign to DG Zone warehouse
Step 6: DG storage: only 24 hours free, then +20% surcharge
Step 7: Invoice with DG surcharges:
         - Stevedoring: base rate + 10%
         - Shorehandling: base rate + 10%
         - Storage: base rate + 20%
```

### Workflow D: Reefer Container

```
Step 1: Register container (Type: Reefer, Size: 40ft)
Step 2: Assign to Reefer Yard warehouse
Step 3: Connect to power supply (tracked in Reefer module)
Step 4: Monitor temperature daily
Step 5: Reefer power billing: $12/day for 40ft (Clause 39)
Step 6: Reefer storage: 48 hours free, then $40/day for 40ft
Step 7: Include power + storage charges on invoice
```

---

## 16. Appendix: TPA Tariff Quick Reference

### Storage Free Periods

| Cargo Category | Domestic | Transit |
|---------------|----------|---------|
| Break bulk import | 5 days | 15 days |
| Break bulk export | 5 days | 21 days |
| FCL container import | 5 days | 15 days |
| FCL container export | 5 days | 21 days |
| Empty container | 5 days | 5 days |
| Transshipment | 10 days | 10 days |
| Coastwise | 3 days | -- |
| ICD local import (port extension) | 30 days | -- |
| ICD transit import (port extension) | 60 days | -- |
| Reefer storage | 48 hours | 48 hours |
| DG storage | 24 hours | 24 hours |

### Storage Daily Rates (after free period)

| Container | Tier 1 Rate | Tier 2 Rate |
|-----------|------------|------------|
| FCL 20ft Import | $20.00/day (next 10 days) | $40.00/day (thereafter) |
| FCL 40ft Import | $40.00/day (next 10 days) | $80.00/day (thereafter) |
| FCL 20ft Export | $16.00/day | -- |
| FCL 40ft Export | $32.00/day | -- |
| Empty 20ft | $4.00/day (next 10 days) | $8.00/day (thereafter) |
| Empty 40ft | $8.00/day (next 10 days) | $16.00/day (thereafter) |

### Surcharge Summary

| Surcharge | Rate | Applies To |
|-----------|------|-----------|
| Dangerous Goods -- handling | +10% | Stevedoring & shorehandling |
| Dangerous Goods -- storage | +20% | Storage (after 24hr free) |
| Over-dimension containers | +30% | Shorehandling & stevedoring |
| Cold storage cargo | +30% | Shorehandling |
| Overtime (3rd shift/weekends) | Variable | Labour & equipment |

### ICD Package Rates (Clause 42)

| ICD Location | 20ft | 40ft |
|-------------|------|------|
| NASACO Yard | $280 | $510 |
| Ubungo ICD | $180 | $310 |
| Other ICDs (Kwala Ruvu etc.) | $180 | $310 |

### VGM Charges (Clause 43)

| Location | Rate per container |
|----------|-------------------|
| Dar es Salaam port | $60.00 |
| Tanga / Mtwara | $30.00 |

---

**END OF SOP**

*This document should be reviewed and updated whenever TPA tariff rates change or new operational procedures are introduced.*
