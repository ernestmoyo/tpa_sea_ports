<p align="center">
  <img src="7square-icd-platform/public/7square-logo.png" alt="7Square Logo" width="200" />
</p>

<h1 align="center">7Square ICD Integrated Operations Platform</h1>

<p align="center">
  <strong>Open-source port operations platform built for Tanzania's Inland Container Depots</strong>
</p>

<p align="center">
  <a href="https://www.7squareinc.com">www.7squareinc.com</a> | <a href="mailto:info@7squareinc.com">info@7squareinc.com</a>
</p>

---

## About

This is an open-source operations management platform purpose-built for **Inland Container Depots (ICDs)** operating within the **Tanzania Ports Authority (TPA)** ecosystem. It manages the full lifecycle of container and cargo operations -- from vessel arrival to cargo release -- with billing powered by the complete **TPA Sea Ports Tariff Book (February 2024)**.

The platform was developed by **7Square Inc.** as part of our mission to **convert Africa's challenges into opportunities**. Tanzania's port infrastructure is the economic gateway for East and Southern Africa, serving landlocked nations including Zambia, DRC, Burundi, Rwanda, Malawi, Uganda, and Zimbabwe. By open-sourcing this system, we aim to:

- **Modernize port operations** across Tanzania and the broader region
- **Increase transparency** in tariff application and billing
- **Reduce cargo dwell times** through better tracking and SLA enforcement
- **Enable data-driven decisions** with UNCTAD-standard KPIs
- **Lower barriers** for ICDs and port operators to adopt digital systems

We believe that efficient, transparent port operations are foundational to trade-led economic growth in Africa. This platform is our contribution to making that vision a reality.

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Real-time KPIs -- containers, warehouses, tariff data, UNCTAD performance indicators |
| **Container Management** | ISO 6346 registry, full status lifecycle, VGM (SOLAS) compliance |
| **Cargo Registration** | Break bulk & containerized, harbour tonne calculation, transit routing |
| **Warehouse Management** | Bonded/free warehouses, capacity tracking, occupancy monitoring |
| **Billing Engine** | Invoice generation referencing specific TPA tariff clauses, VAT, multi-currency |
| **Tariff Book** | All 43 TPA clauses with 225+ rates pre-loaded, searchable, browsable |
| **Storage Calculator** | Free periods, tiered daily rates, domestic vs transit vs ICD special modes |
| **Surcharge Engine** | DG (+10%/+20%), over-dimension (+30%), cold storage (+30%) auto-calculation |
| **Dangerous Goods** | IMDG Code classes 1-9, UN numbers, packing groups, MSDS tracking |
| **Reefer Monitoring** | Power supply billing, temperature logging, deviation alerts |
| **Document Management** | B/L, D/O, R/O, VGM certificates -- 15-minute SLA tracking per TPA Charter |
| **Reports** | UNCTAD port performance: dwell time, throughput, occupancy, SLA compliance |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Prisma ORM |
| Database | PostgreSQL |
| Authentication | NextAuth.js with role-based access control |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+

### Installation

```bash
cd 7square-icd-platform
npm install
```

### Environment

Create `7square-icd-platform/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sevensquare_icd"
NEXTAUTH_SECRET="generate-a-secure-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Setup

```bash
npx prisma migrate dev    # Create tables
npx prisma db seed        # Load all 43 TPA tariff clauses (225+ rates)
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@7square.co.tz | admin123 |
| Operations | ops@7square.co.tz | admin123 |
| Warehouse | warehouse@7square.co.tz | admin123 |
| Billing | billing@7square.co.tz | admin123 |

> **Note:** Change default passwords before any production use.

---

## Project Structure

```
tpa_sea_ports/
├── 7square-icd-platform/        # Next.js application
│   ├── prisma/
│   │   ├── schema.prisma        # Full database schema
│   │   └── seed.ts              # TPA tariff data (all 43 clauses)
│   ├── src/
│   │   ├── app/                 # Pages + API routes
│   │   │   ├── (auth)/          # Login
│   │   │   ├── (dashboard)/     # All operational modules
│   │   │   └── api/             # REST endpoints
│   │   ├── components/          # Shared UI components
│   │   └── lib/
│   │       ├── tariff-engine.ts       # Tariff lookup & calculation
│   │       ├── storage-calculator.ts  # Free periods, tiered rates
│   │       └── surcharge.ts           # DG/OD/cold surcharge rules
│   └── public/
├── docs/
│   └── tariff-book/
│       └── TPA_Sea_Ports_Tariff_Book_Feb_2024.md   # Full tariff reference
└── README.md
```

---

## TPA Tariff Coverage

The system includes the complete **TPA Sea Ports Tariff Book (February 2024)**:

| Clauses | Category |
|---------|----------|
| 1-3 | Pilotage, Port Dues, Navigational Dues |
| 4-7 | Dockage, Tug Services, Lighters, Mooring |
| 8-9 | Fresh Water, Garbage Disposal |
| 11-12 | Staff & Labour Hire, Equipment Hire |
| 14 | Stevedoring (all cargo types) |
| 27-29 | Wharfage, Wayleave Dues, Shorehandling |
| 32-33 | Storage Rates, Coastwise Cargo |
| 36-39 | Container Handling (DCT, Berths 0-7, RORO, Other Services) |
| 40-41 | Bulk Oils, Grain Terminal |
| 42 | ICD Special Rates (NASACO, Ubungo, Other ICDs) |
| 43 | Miscellaneous (VGM, weighing, sorting, fumigation) |

---

## Compliance Standards

- **TPA Tariff Book** -- February 2024, all 43 clauses
- **IMDG Code** -- International Maritime Dangerous Goods, classes 1-9
- **SOLAS VGM** -- Verified Gross Mass certification tracking
- **UNCTAD** -- Port performance indicators framework
- **TPA Customer Service Charter** -- 15-minute document processing SLA

---

## Contributing

We welcome contributions from developers, port operators, logistics professionals, and anyone passionate about improving trade infrastructure in Africa.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/improvement`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## About 7Square

**7Square Inc.** exists to convert Africa's challenges into opportunities. We build technology solutions that modernize critical infrastructure across the continent, starting with port and logistics operations in East Africa.

**Website:** [www.7squareinc.com](https://www.7squareinc.com)
**Email:** [info@7squareinc.com](mailto:info@7squareinc.com)

---

## License

This project is open source under the [MIT License](LICENSE).
