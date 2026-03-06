import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding 7Square ICD Platform...")

  // =========================================================================
  // USERS
  // =========================================================================
  const adminPassword = await bcrypt.hash("admin123", 10)
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@7square.co.tz" },
      update: {},
      create: { email: "admin@7square.co.tz", name: "System Admin", password: adminPassword, role: "ADMIN" },
    }),
    prisma.user.upsert({
      where: { email: "ops@7square.co.tz" },
      update: {},
      create: { email: "ops@7square.co.tz", name: "Operations Manager", password: adminPassword, role: "OPERATIONS" },
    }),
    prisma.user.upsert({
      where: { email: "warehouse@7square.co.tz" },
      update: {},
      create: { email: "warehouse@7square.co.tz", name: "Warehouse Manager", password: adminPassword, role: "WAREHOUSE" },
    }),
    prisma.user.upsert({
      where: { email: "billing@7square.co.tz" },
      update: {},
      create: { email: "billing@7square.co.tz", name: "Billing Officer", password: adminPassword, role: "BILLING" },
    }),
  ])
  console.log(`Created ${users.length} users`)

  // =========================================================================
  // TPA TARIFF CLAUSES (Feb 2024 Tariff Book - All 43 Clauses)
  // =========================================================================
  const clauses = [
    { clauseNumber: 1, title: "Pilotage Fees", partNumber: 3, description: "Pilotage fees for vessels entering, leaving, or moving within port limits" },
    { clauseNumber: 2, title: "Port Dues", partNumber: 3, description: "Port dues payable by all vessels entering the port" },
    { clauseNumber: 3, title: "Navigational Dues", partNumber: 3, description: "Combined navigational dues covering coast lights" },
    { clauseNumber: 4, title: "Dockage and Buoyage", partNumber: 3, description: "Charges for vessels mooring alongside or at buoys" },
    { clauseNumber: 5, title: "Tug Services", partNumber: 3, description: "Charges for tug services for all vessels" },
    { clauseNumber: 6, title: "Hire of Lighters and Pontoons", partNumber: 3, description: "Hire charges for lighters and pontoons" },
    { clauseNumber: 7, title: "Mooring and Unmooring Services", partNumber: 3, description: "Charges for mooring and unmooring vessels" },
    { clauseNumber: 8, title: "Supply of Fresh Water to Vessels", partNumber: 3, description: "Rates for fresh water supply to vessels" },
    { clauseNumber: 9, title: "Garbage Disposal", partNumber: 3, description: "Charges for garbage disposal from vessels" },
    { clauseNumber: 11, title: "Hire of Staff and Labour", partNumber: 3, description: "Charges for hire of staff and labour" },
    { clauseNumber: 12, title: "Hire of Equipment", partNumber: 3, description: "Charges for hire of port equipment" },
    { clauseNumber: 13, title: "Port Labour Kept or Remaining Idle", partNumber: 3, description: "Charges for port labour ordered but remaining idle" },
    { clauseNumber: 14, title: "Stevedoring", partNumber: 3, description: "Stevedoring charges for cargo handling" },
    { clauseNumber: 15, title: "Movement of Cargo In or From a Vessel", partNumber: 3, description: "Charges for temporary landing and reloading of cargo" },
    { clauseNumber: 16, title: "Laid-Up Ships", partNumber: 3, description: "Dues for laid-up vessels in port" },
    { clauseNumber: 17, title: "Slipping and Unslipping of Vessels / Hire of Slipways", partNumber: 3, description: "Charges for slipway services" },
    { clauseNumber: 18, title: "Other Charges and Fees", partNumber: 3, description: "Miscellaneous port charges and licensing fees" },
    { clauseNumber: 19, title: "Hire of Row Boats, Boats, Portrages and Bumboatmen's Licences", partNumber: 3, description: "Passenger boat and porterage charges" },
    { clauseNumber: 20, title: "Baggage Attendants' Charges", partNumber: 3, description: "Charges for baggage handling attendants" },
    { clauseNumber: 21, title: "Passenger and Luggage Services - Lindi", partNumber: 3, description: "Coastwise passenger and luggage service charges at Lindi" },
    { clauseNumber: 22, title: "Private Mooring Buoys", partNumber: 3, description: "Charges for private mooring buoys" },
    { clauseNumber: 23, title: "Amending or Cancelling of Orders or Invoices", partNumber: 3, description: "Fees for amending or cancelling orders/invoices" },
    { clauseNumber: 24, title: "Ships' Stores", partNumber: 3, description: "Charges for handling ships' stores" },
    { clauseNumber: 25, title: "Military Baggage", partNumber: 3, description: "Charges for handling military baggage" },
    { clauseNumber: 26, title: "Charts", partNumber: 3, description: "Charges for nautical charts" },
    { clauseNumber: 27, title: "Wharfage", partNumber: 3, description: "Wharfage charges on all cargo passing over quays, wharves, jetties and buoys" },
    { clauseNumber: 28, title: "Wayleave Dues", partNumber: 3, description: "Wayleave dues for cargo passing over non-Authority facilities" },
    { clauseNumber: 29, title: "Shorehandling", partNumber: 3, description: "Shorehandling charges for import, export and transshipment cargo" },
    { clauseNumber: 30, title: "Heavy Lifts", partNumber: 3, description: "Additional charges for heavy lift cargo" },
    { clauseNumber: 31, title: "Removal Charges", partNumber: 3, description: "Charges for removal of overstayed cargo" },
    { clauseNumber: 32, title: "Storage", partNumber: 3, description: "Storage charges for cargo remaining beyond free periods" },
    { clauseNumber: 33, title: "Coastwise Cargo", partNumber: 3, description: "Special rates for coastwise cargo" },
    { clauseNumber: 34, title: "Import and Export of Livestock", partNumber: 3, description: "Charges for handling livestock" },
    { clauseNumber: 35, title: "Special Rates", partNumber: 3, description: "Special wharfage and shorehandling rates" },
    { clauseNumber: 36, title: "Container Handling Rates - DCT Berths 8-11", partNumber: 3, description: "Container handling rates at Dar es Salaam Container Terminal Berths 8-11" },
    { clauseNumber: 37, title: "Container Handling Rates - Berths 0-7", partNumber: 3, description: "Container handling rates at Berths 0-7 and other Dedicated Terminals" },
    { clauseNumber: 38, title: "Roll On-Roll Off Operations", partNumber: 3, description: "Container handling rates for RORO vessels" },
    { clauseNumber: 39, title: "Other Container Service Charges", partNumber: 3, description: "Reefer, status change, stuffing/stripping, transshipment, shut-out charges" },
    { clauseNumber: 40, title: "Handling Charges for Bulk Oils", partNumber: 3, description: "Charges for bulk oil handling and storage" },
    { clauseNumber: 41, title: "The Grain Terminal Services", partNumber: 3, description: "Grain terminal handling, storage and bagging charges" },
    { clauseNumber: 42, title: "Special Rate for Inland Clearance Depots or Dry Ports (ICDs)", partNumber: 3, description: "ICD package rates and storage for Ex NASACO, Ubungo ICD, Kwala Ruvu and others" },
    { clauseNumber: 43, title: "Miscellaneous Provisions and Charges", partNumber: 4, description: "Weighing, measuring, VGM, sorting, removal, bagging, fumigation and other services" },
    { clauseNumber: 44, title: "Miscellaneous Port Service", partNumber: 4, description: "Additional miscellaneous port services" },
  ]

  for (const c of clauses) {
    await prisma.tariffClause.upsert({
      where: { clauseNumber: c.clauseNumber },
      update: { title: c.title, description: c.description },
      create: c,
    })
  }
  console.log(`Created ${clauses.length} tariff clauses`)

  // Helper to get clause ID
  async function getClauseId(num: number) {
    const c = await prisma.tariffClause.findUnique({ where: { clauseNumber: num } })
    return c!.id
  }

  // =========================================================================
  // TARIFF RATES - ALL CLAUSES
  // =========================================================================

  // Clear existing rates for re-seeding
  await prisma.tariffRate.deleteMany({})
  await prisma.tariffFreePeriod.deleteMany({})
  await prisma.tariffSurcharge.deleteMany({})

  // --- CLAUSE 1: PILOTAGE FEES ---
  const c1 = await getClauseId(1)
  const pilotageRates = [
    { clauseId: c1, serviceCode: "PILOT_ENTER_LEAVE", serviceName: "Entering or leaving Port", subClause: "1(a)", vesselCategory: "DEEP_SEA" as const, rateAmount: 5.50, rateUnit: "PER_100_GRT" as const },
    { clauseId: c1, serviceCode: "PILOT_ENTER_LEAVE_C", serviceName: "Entering or leaving Port (Coaster)", subClause: "1(a)", vesselCategory: "COASTER" as const, rateAmount: 1.10, rateUnit: "PER_100_GRT" as const },
    { clauseId: c1, serviceCode: "PILOT_INTERNAL", serviceName: "Internal movements", subClause: "1(b)", vesselCategory: "DEEP_SEA" as const, rateAmount: 5.50, rateUnit: "PER_100_GRT" as const },
    { clauseId: c1, serviceCode: "PILOT_INTERNAL_C", serviceName: "Internal movements (Coaster)", subClause: "1(b)", vesselCategory: "COASTER" as const, rateAmount: 1.10, rateUnit: "PER_100_GRT" as const },
    { clauseId: c1, serviceCode: "PILOT_DEAD_SHIP", serviceName: "Dead ship movements", subClause: "1(c)", vesselCategory: "DEEP_SEA" as const, rateAmount: 15.00, rateUnit: "PER_100_GRT" as const },
    { clauseId: c1, serviceCode: "PILOT_DEAD_SHIP_C", serviceName: "Dead ship movements (Coaster)", subClause: "1(c)", vesselCategory: "COASTER" as const, rateAmount: 3.10, rateUnit: "PER_100_GRT" as const },
    { clauseId: c1, serviceCode: "PILOT_ADJACENT", serviceName: "Movements between adjacent berths", subClause: "1(d)", vesselCategory: "DEEP_SEA" as const, rateAmount: 2.80, rateUnit: "PER_100_GRT" as const },
    { clauseId: c1, serviceCode: "PILOT_ADJACENT_C", serviceName: "Movements between adjacent berths (Coaster)", subClause: "1(d)", vesselCategory: "COASTER" as const, rateAmount: 0.60, rateUnit: "PER_100_GRT" as const },
    { clauseId: c1, serviceCode: "PILOT_MIN", serviceName: "Minimum charge per pilotage service", subClause: "1(e)", vesselCategory: "DEEP_SEA" as const, rateAmount: 150.00, rateUnit: "PER_OPERATION" as const, isMinimum: true },
    { clauseId: c1, serviceCode: "PILOT_MIN_C", serviceName: "Minimum charge per pilotage service (Coaster)", subClause: "1(e)", vesselCategory: "COASTER" as const, rateAmount: 33.80, rateUnit: "PER_OPERATION" as const, isMinimum: true },
    { clauseId: c1, serviceCode: "PILOT_DETENTION", serviceName: "Pilotage detention (per minute after 30min free)", subClause: "2(b)", vesselCategory: "DEEP_SEA" as const, rateAmount: 4.20, rateUnit: "PER_MINUTE" as const, minimumAmount: 100.00 },
    { clauseId: c1, serviceCode: "PILOT_DETENTION_C", serviceName: "Pilotage detention (Coaster)", subClause: "2(b)", vesselCategory: "COASTER" as const, rateAmount: 0.80, rateUnit: "PER_MINUTE" as const, minimumAmount: 22.50 },
  ]

  // --- CLAUSE 2: PORT DUES ---
  const c2 = await getClauseId(2)
  const portDuesRates = [
    { clauseId: c2, serviceCode: "PORT_DUES_FIRST5", serviceName: "Port dues - first 5 days", subClause: "1", vesselCategory: "DEEP_SEA" as const, rateAmount: 13.40, rateUnit: "PER_100_GRT" as const },
    { clauseId: c2, serviceCode: "PORT_DUES_FIRST5_C", serviceName: "Port dues - first 5 days (Coaster)", subClause: "1", vesselCategory: "COASTER" as const, rateAmount: 2.50, rateUnit: "PER_100_GRT" as const },
    { clauseId: c2, serviceCode: "PORT_DUES_NEXT5", serviceName: "Port dues - each successive 5 days", subClause: "2", vesselCategory: "DEEP_SEA" as const, rateAmount: 8.10, rateUnit: "PER_100_GRT" as const },
    { clauseId: c2, serviceCode: "PORT_DUES_NEXT5_C", serviceName: "Port dues - each successive 5 days (Coaster)", subClause: "2", vesselCategory: "COASTER" as const, rateAmount: 1.50, rateUnit: "PER_100_GRT" as const },
  ]

  // --- CLAUSE 3: NAVIGATIONAL DUES ---
  const c3 = await getClauseId(3)
  const navDuesRates = [
    { clauseId: c3, serviceCode: "NAV_DUES", serviceName: "Combined navigational dues", subClause: "1(a)", vesselCategory: "DEEP_SEA" as const, rateAmount: 6.00, rateUnit: "PER_100_GRT" as const },
    { clauseId: c3, serviceCode: "NAV_DUES_C", serviceName: "Combined navigational dues (Coaster)", subClause: "1(a)", vesselCategory: "COASTER" as const, rateAmount: 1.20, rateUnit: "PER_100_GRT" as const },
    { clauseId: c3, serviceCode: "NAV_DUES_MIN", serviceName: "Minimum charge per call", subClause: "1(b)", vesselCategory: "DEEP_SEA" as const, rateAmount: 26.90, rateUnit: "PER_CALL" as const, isMinimum: true },
    { clauseId: c3, serviceCode: "NAV_DUES_MIN_C", serviceName: "Minimum charge per call (Coaster)", subClause: "1(b)", vesselCategory: "COASTER" as const, rateAmount: 5.10, rateUnit: "PER_CALL" as const, isMinimum: true },
  ]

  // --- CLAUSE 4: DOCKAGE AND BUOYAGE ---
  const c4 = await getClauseId(4)
  const dockageRates = [
    { clauseId: c4, serviceCode: "DOCK_QUAY", serviceName: "Vessels at quays/wharves/jetties", subClause: "1", vesselCategory: "DEEP_SEA" as const, rateAmount: 0.50, rateUnit: "PER_HOUR" as const },
    { clauseId: c4, serviceCode: "DOCK_QUAY_C", serviceName: "Vessels at quays/wharves/jetties (Coaster)", subClause: "1", vesselCategory: "COASTER" as const, rateAmount: 0.10, rateUnit: "PER_HOUR" as const },
    { clauseId: c4, serviceCode: "DOCK_BUOY", serviceName: "Vessels moored at buoys", subClause: "2", vesselCategory: "DEEP_SEA" as const, rateAmount: 0.30, rateUnit: "PER_HOUR" as const },
    { clauseId: c4, serviceCode: "DOCK_BUOY_C", serviceName: "Vessels moored at buoys (Coaster)", subClause: "2", vesselCategory: "COASTER" as const, rateAmount: 0.10, rateUnit: "PER_HOUR" as const },
    { clauseId: c4, serviceCode: "DOCK_DOUBLE", serviceName: "Vessels double banked", subClause: "3", vesselCategory: "DEEP_SEA" as const, rateAmount: 0.50, rateUnit: "PER_HOUR" as const },
    { clauseId: c4, serviceCode: "DOCK_TANKER", serviceName: "Tankers at bulk oil jetties", subClause: "4", vesselCategory: "DEEP_SEA" as const, rateAmount: 0.50, rateUnit: "PER_HOUR" as const },
    { clauseId: c4, serviceCode: "DOCK_SBM", serviceName: "Tankers at single mooring points", subClause: "5", vesselCategory: "DEEP_SEA" as const, rateAmount: 0.50, rateUnit: "PER_HOUR" as const },
    { clauseId: c4, serviceCode: "DOCK_DHOW", serviceName: "Vessels at dhow/lighter wharf", subClause: "6", vesselCategory: "DEEP_SEA" as const, rateAmount: 0.30, rateUnit: "PER_HOUR" as const },
    { clauseId: c4, serviceCode: "DOCK_RORO", serviceName: "RORO vessels stern ramp to quay", subClause: "7", vesselCategory: "DEEP_SEA" as const, rateAmount: 0.30, rateUnit: "PER_HOUR" as const },
    { clauseId: c4, serviceCode: "DOCK_OUTER", serviceName: "Vessels at outer anchorage", subClause: "8", vesselCategory: "DEEP_SEA" as const, rateAmount: 2.10, rateUnit: "PER_HOUR" as const },
  ]

  // --- CLAUSE 5: TUG SERVICES ---
  const c5 = await getClauseId(5)
  const tugRates = [
    { clauseId: c5, serviceCode: "TUG_BERTH", serviceName: "Berthing or unberthing", subClause: "3(a)", vesselCategory: "DEEP_SEA" as const, rateAmount: 14.00, rateUnit: "PER_100_GRT" as const },
    { clauseId: c5, serviceCode: "TUG_BERTH_C", serviceName: "Berthing or unberthing (Coaster)", subClause: "3(a)", vesselCategory: "COASTER" as const, rateAmount: 5.40, rateUnit: "PER_100_GRT" as const },
    { clauseId: c5, serviceCode: "TUG_TURNING", serviceName: "Assisting turning vessel", subClause: "3(b)", vesselCategory: "DEEP_SEA" as const, rateAmount: 9.40, rateUnit: "PER_100_GRT" as const },
    { clauseId: c5, serviceCode: "TUG_TURNING_C", serviceName: "Assisting turning vessel (Coaster)", subClause: "3(b)", vesselCategory: "COASTER" as const, rateAmount: 2.70, rateUnit: "PER_100_GRT" as const },
    { clauseId: c5, serviceCode: "TUG_MOVE_WITHIN", serviceName: "Moving vessel within port limits", subClause: "3(c)", vesselCategory: "DEEP_SEA" as const, rateAmount: 14.00, rateUnit: "PER_100_GRT" as const },
    { clauseId: c5, serviceCode: "TUG_MOVE_WITHIN_C", serviceName: "Moving vessel within port limits (Coaster)", subClause: "3(c)", vesselCategory: "COASTER" as const, rateAmount: 5.40, rateUnit: "PER_100_GRT" as const },
    { clauseId: c5, serviceCode: "TUG_MOVE_OUTSIDE", serviceName: "Moving vessel from/to outside port", subClause: "3(d)", vesselCategory: "DEEP_SEA" as const, rateAmount: 20.00, rateUnit: "PER_100_GRT" as const },
    { clauseId: c5, serviceCode: "TUG_MOVE_OUTSIDE_C", serviceName: "Moving vessel from/to outside port (Coaster)", subClause: "3(d)", vesselCategory: "COASTER" as const, rateAmount: 6.80, rateUnit: "PER_100_GRT" as const },
    { clauseId: c5, serviceCode: "TUG_LIGHTER", serviceName: "Towage of lighters/pontoons/small crafts", subClause: "3(f)", vesselCategory: "DEEP_SEA" as const, rateAmount: 8.00, rateUnit: "PER_100_GRT" as const },
    { clauseId: c5, serviceCode: "TUG_IDLE", serviceName: "Tug ordered but kept idle (per hour)", subClause: "6", vesselCategory: "DEEP_SEA" as const, rateAmount: 200.00, rateUnit: "PER_HOUR" as const },
  ]

  // --- CLAUSE 7: MOORING ---
  const c7 = await getClauseId(7)
  const mooringRates = [
    { clauseId: c7, serviceCode: "MOOR_NORMAL", serviceName: "Mooring/Unmooring (normal time)", subClause: "1", vesselCategory: "DEEP_SEA" as const, rateAmount: 2.00, rateUnit: "PER_100_GRT" as const, minimumAmount: 100.00 },
    { clauseId: c7, serviceCode: "MOOR_OT", serviceName: "Mooring/Unmooring (overtime)", subClause: "1", vesselCategory: "DEEP_SEA" as const, rateAmount: 3.00, rateUnit: "PER_100_GRT" as const, isOvertime: true },
    { clauseId: c7, serviceCode: "MOOR_NORMAL_C", serviceName: "Mooring/Unmooring (Coaster normal)", subClause: "1", vesselCategory: "COASTER" as const, rateAmount: 0.60, rateUnit: "PER_100_GRT" as const, minimumAmount: 25.90 },
    { clauseId: c7, serviceCode: "MOOR_OT_C", serviceName: "Mooring/Unmooring (Coaster overtime)", subClause: "1", vesselCategory: "COASTER" as const, rateAmount: 1.12, rateUnit: "PER_100_GRT" as const, isOvertime: true },
  ]

  // --- CLAUSE 8: FRESH WATER ---
  const c8 = await getClauseId(8)
  const waterRates = [
    { clauseId: c8, serviceCode: "WATER_SHORE", serviceName: "Fresh water from shore hydrants", subClause: "1", rateAmount: 4.00, rateUnit: "PER_HTN" as const },
    { clauseId: c8, serviceCode: "WATER_STREAM", serviceName: "Supply of water in stream", subClause: "2", rateAmount: 8.00, rateUnit: "PER_HTN" as const, minimumAmount: 95.00 },
    { clauseId: c8, serviceCode: "WATER_OUTER", serviceName: "Supply at outer anchorage", subClause: "3(a)", rateAmount: 14.00, rateUnit: "PER_HTN" as const, minimumAmount: 145.00 },
    { clauseId: c8, serviceCode: "WATER_BARGE", serviceName: "Fresh water from barges", subClause: "3(b)", rateAmount: 8.00, rateUnit: "PER_HTN" as const },
    { clauseId: c8, serviceCode: "WATER_BOWSER", serviceName: "Fresh water from bowsers", subClause: "3(c)", rateAmount: 14.00, rateUnit: "PER_HTN" as const },
  ]

  // --- CLAUSE 9: GARBAGE ---
  const c9 = await getClauseId(9)
  const garbageRates = [
    { clauseId: c9, serviceCode: "GARBAGE_RECEPTACLE", serviceName: "Garbage per receptacle per day", subClause: "1", rateAmount: 13.00, rateUnit: "PER_RECEPTACLE" as const },
    { clauseId: c9, serviceCode: "GARBAGE_VEHICLE", serviceName: "Vehicle hire per trip (regular)", rateAmount: 114.20, rateUnit: "PER_TRIP" as const },
    { clauseId: c9, serviceCode: "GARBAGE_VEHICLE_OT", serviceName: "Vehicle hire per trip (overtime)", rateAmount: 125.00, rateUnit: "PER_TRIP" as const, isOvertime: true },
  ]

  // --- CLAUSE 11: HIRE OF STAFF & LABOUR ---
  const c11 = await getClauseId(11)
  const labourRates = [
    { clauseId: c11, serviceCode: "LABOUR_CARPENTER", serviceName: "Carpenter/Cooper", subClause: "1", rateAmount: 2.50, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 5.00 },
    { clauseId: c11, serviceCode: "LABOUR_LABOURER", serviceName: "Labourer/Watchman/Sorter", subClause: "3(a)", rateAmount: 2.00, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 4.00 },
    { clauseId: c11, serviceCode: "LABOUR_CRANE_OP", serviceName: "Crane/Winch Operator", subClause: "3(c)", rateAmount: 2.50, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 5.00 },
    { clauseId: c11, serviceCode: "LABOUR_FORKLIFT_OP", serviceName: "Forklift Operator", subClause: "3(d)", rateAmount: 2.50, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 5.00 },
    { clauseId: c11, serviceCode: "LABOUR_CLERK", serviceName: "Clerk/Serang", subClause: "3(e)", rateAmount: 2.50, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 5.00 },
    { clauseId: c11, serviceCode: "LABOUR_FOREMAN", serviceName: "Foreman", subClause: "3(g)", rateAmount: 3.00, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 6.00 },
    { clauseId: c11, serviceCode: "LABOUR_ASST_OPS", serviceName: "Asst. Operations Officer", subClause: "3(h)", rateAmount: 3.50, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 7.00 },
    { clauseId: c11, serviceCode: "LABOUR_OPS_OFFICER", serviceName: "Operations Officer", subClause: "3(i)", rateAmount: 4.50, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 9.00 },
    { clauseId: c11, serviceCode: "LABOUR_CRANE_FOREMAN", serviceName: "Crane/Winch Foreman", subClause: "4(a)", rateAmount: 3.50, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 7.00 },
    { clauseId: c11, serviceCode: "LABOUR_FIRE_PRINCIPAL", serviceName: "Principal Fire & Safety Officer", subClause: "5(a)", rateAmount: 5.00, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 10.00 },
    { clauseId: c11, serviceCode: "LABOUR_FIRE_SENIOR", serviceName: "Senior Fire & Safety Officer", subClause: "5(b)", rateAmount: 4.50, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 9.00 },
    { clauseId: c11, serviceCode: "LABOUR_FIRE_OFFICER", serviceName: "Fire & Safety Officer", subClause: "5(c)", rateAmount: 4.00, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 8.00 },
    { clauseId: c11, serviceCode: "LABOUR_FIRE_INSPECTOR", serviceName: "Fire & Safety Inspector", subClause: "5(d)", rateAmount: 3.00, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 6.00 },
    { clauseId: c11, serviceCode: "LABOUR_FIREFIGHTER", serviceName: "Firefighter", subClause: "5(g)", rateAmount: 2.00, rateUnit: "PER_MAN_HOUR" as const, overtimeRate: 4.00 },
  ]

  // --- CLAUSE 12: HIRE OF EQUIPMENT ---
  const c12 = await getClauseId(12)
  const equipmentRates = [
    { clauseId: c12, serviceCode: "EQUIP_FORKLIFT_5T", serviceName: "Forklift up to 5T (within port)", subClause: "1(a)", rateAmount: 16.00, rateUnit: "PER_HOUR" as const, notes: "Outside port: USD 32.00" },
    { clauseId: c12, serviceCode: "EQUIP_FORKLIFT_10T", serviceName: "Forklift 5-10T (within port)", subClause: "1(b)", rateAmount: 20.00, rateUnit: "PER_HOUR" as const, notes: "Outside port: USD 40.00" },
    { clauseId: c12, serviceCode: "EQUIP_FORKLIFT_16T", serviceName: "Forklift 11-16T (within port)", subClause: "1(c)", rateAmount: 60.00, rateUnit: "PER_HOUR" as const, notes: "Outside port: USD 120.00" },
    { clauseId: c12, serviceCode: "EQUIP_FORKLIFT_60T", serviceName: "Forklift 16-60T (within port)", subClause: "1(d)", rateAmount: 90.00, rateUnit: "PER_HOUR" as const, notes: "Outside port: USD 180.00" },
    { clauseId: c12, serviceCode: "EQUIP_CRANE_5T", serviceName: "Mobile crane up to 5T", subClause: "2(a)", rateAmount: 40.00, rateUnit: "PER_HOUR" as const, notes: "Outside port: USD 80.00" },
    { clauseId: c12, serviceCode: "EQUIP_CRANE_10T", serviceName: "Mobile crane 5-10T", subClause: "2(b)", rateAmount: 60.00, rateUnit: "PER_HOUR" as const, notes: "Outside port: USD 120.00" },
    { clauseId: c12, serviceCode: "EQUIP_CRANE_20T", serviceName: "Mobile crane 10-20T", subClause: "2(c)", rateAmount: 80.00, rateUnit: "PER_HOUR" as const, notes: "Outside port: USD 160.00" },
    { clauseId: c12, serviceCode: "EQUIP_CRANE_40T", serviceName: "Mobile crane 20-40T", subClause: "2(d)", rateAmount: 100.00, rateUnit: "PER_HOUR" as const, notes: "Outside port: USD 200.00" },
    { clauseId: c12, serviceCode: "EQUIP_CRANE_40T_PLUS", serviceName: "Mobile crane 40T+", subClause: "2(e)", rateAmount: 150.00, rateUnit: "PER_HOUR" as const, notes: "Outside port: USD 300.00" },
    { clauseId: c12, serviceCode: "EQUIP_QUAY_CRANE_5T", serviceName: "Quay crane up to 5T", subClause: "3(a)", rateAmount: 100.00, rateUnit: "PER_HOUR" as const },
    { clauseId: c12, serviceCode: "EQUIP_QUAY_CRANE_5T_PLUS", serviceName: "Quay crane over 5T", subClause: "3(b)", rateAmount: 120.00, rateUnit: "PER_HOUR" as const },
    { clauseId: c12, serviceCode: "EQUIP_PILOT_BOAT", serviceName: "Pilot boat (per hour)", subClause: "5", rateAmount: 500.00, rateUnit: "PER_HOUR" as const },
    { clauseId: c12, serviceCode: "EQUIP_PALLET", serviceName: "Pallets (per day)", subClause: "6(a)", rateAmount: 2.00, rateUnit: "PER_DAY" as const, notes: "Outside port: USD 4.00" },
    { clauseId: c12, serviceCode: "EQUIP_TARPAULIN", serviceName: "Tarpaulins (per day)", subClause: "6(b)", rateAmount: 20.00, rateUnit: "PER_DAY" as const, notes: "Outside port: USD 40.00" },
    { clauseId: c12, serviceCode: "EQUIP_GANGWAY", serviceName: "Gangways (per day)", subClause: "6(c)", rateAmount: 40.00, rateUnit: "PER_DAY" as const, notes: "Outside port: USD 80.00" },
    { clauseId: c12, serviceCode: "EQUIP_LORRY", serviceName: "Lorry per trip (regular hours)", subClause: "6(d)", rateAmount: 100.00, rateUnit: "PER_TRIP" as const },
    { clauseId: c12, serviceCode: "EQUIP_LORRY_OT", serviceName: "Lorry per trip (overtime)", subClause: "6(d)", rateAmount: 200.00, rateUnit: "PER_TRIP" as const, isOvertime: true },
    { clauseId: c12, serviceCode: "EQUIP_TRAILER", serviceName: "Port trailer per day", subClause: "6(e)", rateAmount: 100.00, rateUnit: "PER_DAY" as const, notes: "Outside port: USD 200.00" },
  ]

  // --- CLAUSE 14: STEVEDORING ---
  const c14 = await getClauseId(14)
  const stevedoringRates = [
    { clauseId: c14, serviceCode: "STEV_BREAKBULK", serviceName: "Breakbulk cargo (discharge/load/shift)", subClause: "2a(i)", rateAmount: 5.50, rateUnit: "PER_HTN" as const },
    { clauseId: c14, serviceCode: "STEV_NOT_ACCEPTED", serviceName: "Cargo loaded but not accepted", subClause: "2a(ii)", rateAmount: 9.00, rateUnit: "PER_HTN" as const },
    { clauseId: c14, serviceCode: "STEV_RESHIPPED", serviceName: "Cargo landed and reshipped", subClause: "2a(iii)", rateAmount: 9.00, rateUnit: "PER_HTN" as const },
    { clauseId: c14, serviceCode: "STEV_TRANSSHIP", serviceName: "Transshipment cargo", subClause: "2a(iv)", rateAmount: 6.00, rateUnit: "PER_HTN" as const },
    { clauseId: c14, serviceCode: "STEV_DRY_BULK", serviceName: "Dry bulk (mechanical)", subClause: "2b", rateAmount: 6.00, rateUnit: "PER_HTN" as const },
    { clauseId: c14, serviceCode: "STEV_BAGGING", serviceName: "Bagging charges", subClause: "2c(ii)", rateAmount: 7.50, rateUnit: "PER_HTN" as const },
    { clauseId: c14, serviceCode: "STEV_DIFFICULT", serviceName: "Difficult cargo (charcoal, sulphur, etc.)", subClause: "2e(i)", rateAmount: 7.00, rateUnit: "PER_HTN" as const },
    { clauseId: c14, serviceCode: "STEV_TIMBER", serviceName: "Loose timber and scrap", subClause: "2e(ii)", rateAmount: 8.00, rateUnit: "PER_HTN" as const },
    { clauseId: c14, serviceCode: "STEV_COLD", serviceName: "Cold storage cargo", subClause: "2e(iii)", rateAmount: 12.00, rateUnit: "PER_HTN" as const },
    { clauseId: c14, serviceCode: "STEV_VALUABLE", serviceName: "Valuable cargo", subClause: "2f", rateAmount: 7.00, rateUnit: "PER_HTN" as const },
    { clauseId: c14, serviceCode: "STEV_HEAVY_5_10", serviceName: "Heavy lift 5-10 DWT", subClause: "2g(i)", rateAmount: 10.00, rateUnit: "PER_PACKAGE" as const },
    { clauseId: c14, serviceCode: "STEV_HEAVY_10_20", serviceName: "Heavy lift 10-20 DWT", subClause: "2g(ii)", rateAmount: 15.00, rateUnit: "PER_PACKAGE" as const },
    { clauseId: c14, serviceCode: "STEV_HEAVY_20_40", serviceName: "Heavy lift 20-40 DWT", subClause: "2g(iii)", rateAmount: 25.00, rateUnit: "PER_PACKAGE" as const },
    { clauseId: c14, serviceCode: "STEV_HEAVY_40_PLUS", serviceName: "Heavy lift 40+ DWT", subClause: "2g(iv)", rateAmount: 36.00, rateUnit: "PER_PACKAGE" as const },
    { clauseId: c14, serviceCode: "STEV_OVERTIME_GANG", serviceName: "Overtime per gang per shift", subClause: "2i", rateAmount: 500.00, rateUnit: "PER_SHIFT" as const, isOvertime: true },
    { clauseId: c14, serviceCode: "STEV_BAGGAGE", serviceName: "Passenger/crew baggage per package", subClause: "2d(i)", rateAmount: 2.00, rateUnit: "PER_PACKAGE" as const },
    { clauseId: c14, serviceCode: "STEV_MAIL", serviceName: "Mail bags per bag", subClause: "2d(ii)", rateAmount: 1.00, rateUnit: "PER_BAG" as const },
  ]

  // --- CLAUSE 27: WHARFAGE ---
  const c27 = await getClauseId(27)
  const wharfageRates = [
    { clauseId: c27, serviceCode: "WHARF_DOM_IMP", serviceName: "Wharfage - Domestic imports", subClause: "3(a)(i)", cargoClass: "DOMESTIC_IMPORT" as const, rateAmount: 1.60, rateUnit: "AD_VALOREM" as const, notes: "1.6% ad valorem. Min $200/HTN, Max $2,500/HTN" },
    { clauseId: c27, serviceCode: "WHARF_TRANSIT_IMP", serviceName: "Wharfage - Transit imports", subClause: "3(a)(ii)", cargoClass: "TRANSIT_IMPORT" as const, rateAmount: 3.00, rateUnit: "PER_HTN" as const },
    { clauseId: c27, serviceCode: "WHARF_DOM_EXP", serviceName: "Wharfage - Domestic exports", subClause: "3(b)(i)", cargoClass: "DOMESTIC_EXPORT" as const, rateAmount: 1.00, rateUnit: "AD_VALOREM" as const, notes: "1.0% ad valorem" },
    { clauseId: c27, serviceCode: "WHARF_TRANSIT_EXP", serviceName: "Wharfage - Transit exports", subClause: "3(b)(ii)", cargoClass: "TRANSIT_EXPORT" as const, rateAmount: 3.00, rateUnit: "PER_HTN" as const },
    { clauseId: c27, serviceCode: "WHARF_TRANSSHIP", serviceName: "Wharfage - Transshipment", subClause: "3(c)", cargoClass: "TRANSSHIPMENT" as const, rateAmount: 0.80, rateUnit: "AD_VALOREM" as const },
    { clauseId: c27, serviceCode: "WHARF_TRANSIT_FCL_IMP_20", serviceName: "Wharfage - Transit FCL Import 20ft", subClause: "4(a)", cargoClass: "TRANSIT_IMPORT" as const, containerSize: "20", rateAmount: 90.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c27, serviceCode: "WHARF_TRANSIT_FCL_IMP_40", serviceName: "Wharfage - Transit FCL Import 40ft", subClause: "4(a)", cargoClass: "TRANSIT_IMPORT" as const, containerSize: "40", rateAmount: 180.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c27, serviceCode: "WHARF_TRANSIT_FCL_EXP_20", serviceName: "Wharfage - Transit FCL Export 20ft", subClause: "4(b)", cargoClass: "TRANSIT_EXPORT" as const, containerSize: "20", rateAmount: 75.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c27, serviceCode: "WHARF_TRANSIT_FCL_EXP_40", serviceName: "Wharfage - Transit FCL Export 40ft", subClause: "4(b)", cargoClass: "TRANSIT_EXPORT" as const, containerSize: "40", rateAmount: 150.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c27, serviceCode: "WHARF_EMPTY_20", serviceName: "Wharfage - Empty containers 20ft", subClause: "6", containerSize: "20", rateAmount: 3.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c27, serviceCode: "WHARF_EMPTY_40", serviceName: "Wharfage - Empty containers 40ft", subClause: "6", containerSize: "40", rateAmount: 6.00, rateUnit: "PER_CONTAINER_40FT" as const },
  ]

  // --- CLAUSE 29: SHOREHANDLING ---
  const c29 = await getClauseId(29)
  const shorehandlingRates = [
    // Domestic traffic
    { clauseId: c29, serviceCode: "SHORE_DOM_IMP_BREAK", serviceName: "Imported dry/breakbulk", subClause: "1(a)(i)", cargoClass: "DOMESTIC_IMPORT" as const, rateAmount: 7.00, rateUnit: "PER_HTN" as const },
    { clauseId: c29, serviceCode: "SHORE_DOM_EXP", serviceName: "Domestic exports", subClause: "1(a)(ii)", cargoClass: "DOMESTIC_EXPORT" as const, rateAmount: 3.50, rateUnit: "PER_HTN" as const },
    { clauseId: c29, serviceCode: "SHORE_TRANSSHIP", serviceName: "Transshipment/overlanded cargo", subClause: "1(a)(iii)", cargoClass: "TRANSSHIPMENT" as const, rateAmount: 7.00, rateUnit: "PER_HTN" as const },
    { clauseId: c29, serviceCode: "SHORE_SHUTOUT", serviceName: "Shut-out cargo", subClause: "1(a)(iv)", rateAmount: 1.50, rateUnit: "PER_HTN" as const },
    { clauseId: c29, serviceCode: "SHORE_TRANSFER", serviceName: "Transfer within port", subClause: "1(a)(v)", rateAmount: 3.50, rateUnit: "PER_HTN" as const },
    { clauseId: c29, serviceCode: "SHORE_DIRECT_DEL", serviceName: "Direct delivery from vessel", subClause: "1(a)(vii)", cargoClass: "DOMESTIC_IMPORT" as const, rateAmount: 6.00, rateUnit: "PER_HTN" as const },
    // Domestic containers
    { clauseId: c29, serviceCode: "SHORE_DOM_FCL_20", serviceName: "Domestic FCL 20ft", subClause: "1(f)(i)", cargoClass: "DOMESTIC_IMPORT" as const, containerSize: "20", containerLoadType: "FCL" as const, rateAmount: 90.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c29, serviceCode: "SHORE_DOM_FCL_40", serviceName: "Domestic FCL 40ft", subClause: "1(f)(i)", cargoClass: "DOMESTIC_IMPORT" as const, containerSize: "40", containerLoadType: "FCL" as const, rateAmount: 135.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c29, serviceCode: "SHORE_STUFF_20", serviceName: "Stripping/Stuffing 20ft", subClause: "1(f)(ii)", containerSize: "20", rateAmount: 70.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c29, serviceCode: "SHORE_STUFF_40", serviceName: "Stripping/Stuffing 40ft", subClause: "1(f)(ii)", containerSize: "40", rateAmount: 140.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c29, serviceCode: "SHORE_EMPTY_20", serviceName: "Empty container 20ft", subClause: "1(f)(iii)", containerSize: "20", containerLoadType: "EMPTY" as const, rateAmount: 10.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c29, serviceCode: "SHORE_EMPTY_40", serviceName: "Empty container 40ft", subClause: "1(f)(iii)", containerSize: "40", containerLoadType: "EMPTY" as const, rateAmount: 20.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c29, serviceCode: "SHORE_VERIFY_20", serviceName: "Verification-FCL 20ft", subClause: "1(f)(iv)", containerSize: "20", rateAmount: 90.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c29, serviceCode: "SHORE_VERIFY_40", serviceName: "Verification-FCL 40ft", subClause: "1(f)(iv)", containerSize: "40", rateAmount: 140.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c29, serviceCode: "SHORE_EXTRA_20", serviceName: "Extra movement 20ft", subClause: "1(f)(v)", containerSize: "20", rateAmount: 10.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c29, serviceCode: "SHORE_EXTRA_40", serviceName: "Extra movement 40ft", subClause: "1(f)(v)", containerSize: "40", rateAmount: 20.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c29, serviceCode: "SHORE_STATUS_20", serviceName: "Change of status 20ft", subClause: "1(f)(vi)", containerSize: "20", rateAmount: 80.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c29, serviceCode: "SHORE_STATUS_40", serviceName: "Change of status 40ft", subClause: "1(f)(vi)", containerSize: "40", rateAmount: 135.00, rateUnit: "PER_CONTAINER_40FT" as const },
    // Transit traffic
    { clauseId: c29, serviceCode: "SHORE_TRANSIT_IMP", serviceName: "Transit imported breakbulk", subClause: "2(a)(i)", cargoClass: "TRANSIT_IMPORT" as const, rateAmount: 6.00, rateUnit: "PER_HTN" as const },
    { clauseId: c29, serviceCode: "SHORE_TRANSIT_DIRECT", serviceName: "Transit direct delivery", subClause: "2(a)(ii)", cargoClass: "TRANSIT_IMPORT" as const, rateAmount: 5.00, rateUnit: "PER_HTN" as const },
    { clauseId: c29, serviceCode: "SHORE_TRANSIT_EXP", serviceName: "Transit exports", subClause: "2(a)(iii)", cargoClass: "TRANSIT_EXPORT" as const, rateAmount: 3.00, rateUnit: "PER_HTN" as const },
    { clauseId: c29, serviceCode: "SHORE_TRANSIT_FCL_20", serviceName: "Transit FCL 20ft", subClause: "2(b)(i)", cargoClass: "TRANSIT_IMPORT" as const, containerSize: "20", containerLoadType: "FCL" as const, rateAmount: 80.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c29, serviceCode: "SHORE_TRANSIT_FCL_40", serviceName: "Transit FCL 40ft", subClause: "2(b)(i)", cargoClass: "TRANSIT_IMPORT" as const, containerSize: "40", containerLoadType: "FCL" as const, rateAmount: 120.00, rateUnit: "PER_CONTAINER_40FT" as const },
  ]

  // --- CLAUSE 32: STORAGE ---
  const c32 = await getClauseId(32)
  const storageRates = [
    // Domestic break bulk import
    { clauseId: c32, serviceCode: "STORE_DOM_IMP_T1", serviceName: "Domestic import storage - next 30 days", subClause: "1(a)(ii)", cargoClass: "DOMESTIC_IMPORT" as const, rateAmount: 1.00, rateUnit: "PER_HTN" as const, notes: "Per HTN per day, after 5 days free" },
    { clauseId: c32, serviceCode: "STORE_DOM_IMP_T2", serviceName: "Domestic import storage - thereafter", subClause: "1(a)(iii)", cargoClass: "DOMESTIC_IMPORT" as const, rateAmount: 1.50, rateUnit: "PER_HTN" as const, notes: "Per HTN per day" },
    // Domestic break bulk export
    { clauseId: c32, serviceCode: "STORE_DOM_EXP_T1", serviceName: "Domestic export storage - after free", subClause: "1(b)(ii)", cargoClass: "DOMESTIC_EXPORT" as const, rateAmount: 0.50, rateUnit: "PER_HTN" as const },
    // Domestic FCL containers import
    { clauseId: c32, serviceCode: "STORE_DOM_FCL_IMP_20_T1", serviceName: "Domestic FCL import 20ft - day 6-15", subClause: "2(a)(ii)", cargoClass: "DOMESTIC_IMPORT" as const, containerSize: "20", containerLoadType: "FCL" as const, rateAmount: 20.00, rateUnit: "PER_DAY" as const },
    { clauseId: c32, serviceCode: "STORE_DOM_FCL_IMP_40_T1", serviceName: "Domestic FCL import 40ft - day 6-15", subClause: "2(a)(ii)", cargoClass: "DOMESTIC_IMPORT" as const, containerSize: "40", containerLoadType: "FCL" as const, rateAmount: 40.00, rateUnit: "PER_DAY" as const },
    { clauseId: c32, serviceCode: "STORE_DOM_FCL_IMP_20_T2", serviceName: "Domestic FCL import 20ft - thereafter", subClause: "2(a)(iii)", cargoClass: "DOMESTIC_IMPORT" as const, containerSize: "20", containerLoadType: "FCL" as const, rateAmount: 40.00, rateUnit: "PER_DAY" as const },
    { clauseId: c32, serviceCode: "STORE_DOM_FCL_IMP_40_T2", serviceName: "Domestic FCL import 40ft - thereafter", subClause: "2(a)(iii)", cargoClass: "DOMESTIC_IMPORT" as const, containerSize: "40", containerLoadType: "FCL" as const, rateAmount: 80.00, rateUnit: "PER_DAY" as const },
    // Domestic FCL containers export
    { clauseId: c32, serviceCode: "STORE_DOM_FCL_EXP_20", serviceName: "Domestic FCL export 20ft - after free", subClause: "2(b)(ii)", cargoClass: "DOMESTIC_EXPORT" as const, containerSize: "20", containerLoadType: "FCL" as const, rateAmount: 16.00, rateUnit: "PER_DAY" as const },
    { clauseId: c32, serviceCode: "STORE_DOM_FCL_EXP_40", serviceName: "Domestic FCL export 40ft - after free", subClause: "2(b)(ii)", cargoClass: "DOMESTIC_EXPORT" as const, containerSize: "40", containerLoadType: "FCL" as const, rateAmount: 32.00, rateUnit: "PER_DAY" as const },
    // Transit break bulk import
    { clauseId: c32, serviceCode: "STORE_TRANSIT_IMP_T1", serviceName: "Transit import storage - next 30 days", subClause: "3(a)(ii)", cargoClass: "TRANSIT_IMPORT" as const, rateAmount: 1.00, rateUnit: "PER_HTN" as const, notes: "Per HTN per day, after 15 days free" },
    { clauseId: c32, serviceCode: "STORE_TRANSIT_IMP_T2", serviceName: "Transit import storage - thereafter", subClause: "3(a)(iii)", cargoClass: "TRANSIT_IMPORT" as const, rateAmount: 1.50, rateUnit: "PER_HTN" as const },
    // Transit break bulk export
    { clauseId: c32, serviceCode: "STORE_TRANSIT_EXP_T1", serviceName: "Transit export storage - after free", subClause: "3(b)", cargoClass: "TRANSIT_EXPORT" as const, rateAmount: 0.50, rateUnit: "PER_HTN" as const },
    // Transit FCL containers import
    { clauseId: c32, serviceCode: "STORE_TRANSIT_FCL_IMP_20_T1", serviceName: "Transit FCL import 20ft - day 16-21", subClause: "4(a)(ii)", cargoClass: "TRANSIT_IMPORT" as const, containerSize: "20", containerLoadType: "FCL" as const, rateAmount: 20.00, rateUnit: "PER_DAY" as const },
    { clauseId: c32, serviceCode: "STORE_TRANSIT_FCL_IMP_40_T1", serviceName: "Transit FCL import 40ft - day 16-21", subClause: "4(a)(ii)", cargoClass: "TRANSIT_IMPORT" as const, containerSize: "40", containerLoadType: "FCL" as const, rateAmount: 40.00, rateUnit: "PER_DAY" as const },
    { clauseId: c32, serviceCode: "STORE_TRANSIT_FCL_IMP_20_T2", serviceName: "Transit FCL import 20ft - thereafter", subClause: "4(a)(iii)", cargoClass: "TRANSIT_IMPORT" as const, containerSize: "20", containerLoadType: "FCL" as const, rateAmount: 40.00, rateUnit: "PER_DAY" as const },
    { clauseId: c32, serviceCode: "STORE_TRANSIT_FCL_IMP_40_T2", serviceName: "Transit FCL import 40ft - thereafter", subClause: "4(a)(iii)", cargoClass: "TRANSIT_IMPORT" as const, containerSize: "40", containerLoadType: "FCL" as const, rateAmount: 80.00, rateUnit: "PER_DAY" as const },
    // Transit FCL containers export
    { clauseId: c32, serviceCode: "STORE_TRANSIT_FCL_EXP_20", serviceName: "Transit FCL export 20ft - after free", subClause: "4(b)(ii)", cargoClass: "TRANSIT_EXPORT" as const, containerSize: "20", containerLoadType: "FCL" as const, rateAmount: 16.00, rateUnit: "PER_DAY" as const },
    { clauseId: c32, serviceCode: "STORE_TRANSIT_FCL_EXP_40", serviceName: "Transit FCL export 40ft - after free", subClause: "4(b)(ii)", cargoClass: "TRANSIT_EXPORT" as const, containerSize: "40", containerLoadType: "FCL" as const, rateAmount: 32.00, rateUnit: "PER_DAY" as const },
    // Empty containers
    { clauseId: c32, serviceCode: "STORE_EMPTY_20_T1", serviceName: "Empty 20ft - next 10 days", subClause: "5(ii)", containerSize: "20", containerLoadType: "EMPTY" as const, rateAmount: 4.00, rateUnit: "PER_DAY" as const },
    { clauseId: c32, serviceCode: "STORE_EMPTY_40_T1", serviceName: "Empty 40ft - next 10 days", subClause: "5(ii)", containerSize: "40", containerLoadType: "EMPTY" as const, rateAmount: 8.00, rateUnit: "PER_DAY" as const },
    { clauseId: c32, serviceCode: "STORE_EMPTY_20_T2", serviceName: "Empty 20ft - thereafter", subClause: "5(iii)", containerSize: "20", containerLoadType: "EMPTY" as const, rateAmount: 8.00, rateUnit: "PER_DAY" as const },
    { clauseId: c32, serviceCode: "STORE_EMPTY_40_T2", serviceName: "Empty 40ft - thereafter", subClause: "5(iii)", containerSize: "40", containerLoadType: "EMPTY" as const, rateAmount: 16.00, rateUnit: "PER_DAY" as const },
  ]

  // --- CLAUSE 36: CONTAINER HANDLING DCT BERTHS 8-11 ---
  const c36 = await getClauseId(36)
  const dctRates = [
    { clauseId: c36, serviceCode: "DCT_STEV_FCL_20", serviceName: "Stevedoring FCL 20ft", subClause: "1(a)", containerSize: "20", containerLoadType: "FCL" as const, rateAmount: 80.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c36, serviceCode: "DCT_STEV_FCL_40", serviceName: "Stevedoring FCL 40ft", subClause: "1(a)", containerSize: "40", containerLoadType: "FCL" as const, rateAmount: 120.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c36, serviceCode: "DCT_STEV_LCL_20", serviceName: "Stevedoring LCL 20ft", subClause: "1(b)", containerSize: "20", containerLoadType: "LCL" as const, rateAmount: 160.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c36, serviceCode: "DCT_STEV_LCL_40", serviceName: "Stevedoring LCL 40ft", subClause: "1(b)", containerSize: "40", containerLoadType: "LCL" as const, rateAmount: 255.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c36, serviceCode: "DCT_STEV_EMPTY_20", serviceName: "Stevedoring Empty 20ft", subClause: "1(c)", containerSize: "20", containerLoadType: "EMPTY" as const, rateAmount: 40.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c36, serviceCode: "DCT_STEV_EMPTY_40", serviceName: "Stevedoring Empty 40ft", subClause: "1(c)", containerSize: "40", containerLoadType: "EMPTY" as const, rateAmount: 60.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c36, serviceCode: "DCT_SHIFTING_20", serviceName: "Shifting containers 20ft", subClause: "1(d)", containerSize: "20", rateAmount: 100.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c36, serviceCode: "DCT_SHIFTING_40", serviceName: "Shifting containers 40ft", subClause: "1(d)", containerSize: "40", rateAmount: 200.00, rateUnit: "PER_CONTAINER_40FT" as const },
  ]

  // --- CLAUSE 37: CONTAINER HANDLING BERTHS 0-7 ---
  const c37 = await getClauseId(37)
  const berth07Rates = [
    { clauseId: c37, serviceCode: "B07_STEV_FCL_20", serviceName: "Stevedoring FCL 20ft (Berths 0-7)", subClause: "1(a)", containerSize: "20", containerLoadType: "FCL" as const, rateAmount: 100.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c37, serviceCode: "B07_STEV_FCL_40", serviceName: "Stevedoring FCL 40ft (Berths 0-7)", subClause: "1(a)", containerSize: "40", containerLoadType: "FCL" as const, rateAmount: 150.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c37, serviceCode: "B07_STEV_LCL_20", serviceName: "Stevedoring LCL 20ft (Berths 0-7)", subClause: "1(b)", containerSize: "20", containerLoadType: "LCL" as const, rateAmount: 170.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c37, serviceCode: "B07_STEV_LCL_40", serviceName: "Stevedoring LCL 40ft (Berths 0-7)", subClause: "1(b)", containerSize: "40", containerLoadType: "LCL" as const, rateAmount: 270.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c37, serviceCode: "B07_STEV_EMPTY_20", serviceName: "Stevedoring Empty 20ft (Berths 0-7)", subClause: "1(c)", containerSize: "20", containerLoadType: "EMPTY" as const, rateAmount: 50.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c37, serviceCode: "B07_STEV_EMPTY_40", serviceName: "Stevedoring Empty 40ft (Berths 0-7)", subClause: "1(c)", containerSize: "40", containerLoadType: "EMPTY" as const, rateAmount: 70.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c37, serviceCode: "B07_SHIFTING_20", serviceName: "Shifting containers 20ft (Berths 0-7)", subClause: "1(d)", containerSize: "20", rateAmount: 115.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c37, serviceCode: "B07_SHIFTING_40", serviceName: "Shifting containers 40ft (Berths 0-7)", subClause: "1(d)", containerSize: "40", rateAmount: 230.00, rateUnit: "PER_CONTAINER_40FT" as const },
  ]

  // --- CLAUSE 38: RORO ---
  const c38 = await getClauseId(38)
  const roroRates = [
    { clauseId: c38, serviceCode: "RORO_FCL_20", serviceName: "RORO Stevedoring FCL 20ft", subClause: "1(a)", containerSize: "20", containerLoadType: "FCL" as const, rateAmount: 70.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c38, serviceCode: "RORO_FCL_40", serviceName: "RORO Stevedoring FCL 40ft", subClause: "1(a)", containerSize: "40", containerLoadType: "FCL" as const, rateAmount: 105.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c38, serviceCode: "RORO_EMPTY_20", serviceName: "RORO Stevedoring Empty 20ft", subClause: "1(c)", containerSize: "20", containerLoadType: "EMPTY" as const, rateAmount: 30.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c38, serviceCode: "RORO_EMPTY_40", serviceName: "RORO Stevedoring Empty 40ft", subClause: "1(c)", containerSize: "40", containerLoadType: "EMPTY" as const, rateAmount: 40.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c38, serviceCode: "RORO_SHIFTING_20", serviceName: "RORO Shifting 20ft", subClause: "1(d)", containerSize: "20", rateAmount: 80.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c38, serviceCode: "RORO_SHIFTING_40", serviceName: "RORO Shifting 40ft", subClause: "1(d)", containerSize: "40", rateAmount: 120.00, rateUnit: "PER_CONTAINER_40FT" as const },
  ]

  // --- CLAUSE 39: OTHER CONTAINER SERVICES ---
  const c39 = await getClauseId(39)
  const containerServiceRates = [
    { clauseId: c39, serviceCode: "REEFER_POWER_20", serviceName: "Reefer power supply 20ft per day", subClause: "1(a)", containerSize: "20", rateAmount: 8.00, rateUnit: "PER_DAY" as const },
    { clauseId: c39, serviceCode: "REEFER_POWER_40", serviceName: "Reefer power supply 40ft per day", subClause: "1(a)", containerSize: "40", rateAmount: 12.00, rateUnit: "PER_DAY" as const },
    { clauseId: c39, serviceCode: "REEFER_STORAGE_20", serviceName: "Reefer storage 20ft per day (after 48hr)", subClause: "1(b)", containerSize: "20", rateAmount: 20.00, rateUnit: "PER_DAY" as const },
    { clauseId: c39, serviceCode: "REEFER_STORAGE_40", serviceName: "Reefer storage 40ft per day (after 48hr)", subClause: "1(b)", containerSize: "40", rateAmount: 40.00, rateUnit: "PER_DAY" as const },
    { clauseId: c39, serviceCode: "STATUS_CHANGE_20", serviceName: "Change of container status 20ft", subClause: "2", containerSize: "20", rateAmount: 25.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c39, serviceCode: "STATUS_CHANGE_40", serviceName: "Change of container status 40ft", subClause: "2", containerSize: "40", rateAmount: 35.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c39, serviceCode: "STUFF_STRIP_20", serviceName: "Stuffing/Stripping 20ft", subClause: "3", containerSize: "20", rateAmount: 70.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c39, serviceCode: "STUFF_STRIP_40", serviceName: "Stuffing/Stripping 40ft", subClause: "3", containerSize: "40", rateAmount: 140.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c39, serviceCode: "TRANSSHIP_STEV_20", serviceName: "Transshipment stevedoring 20ft", subClause: "4(a)", containerSize: "20", cargoClass: "TRANSSHIPMENT" as const, rateAmount: 90.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c39, serviceCode: "TRANSSHIP_STEV_40", serviceName: "Transshipment stevedoring 40ft", subClause: "4(a)", containerSize: "40", cargoClass: "TRANSSHIPMENT" as const, rateAmount: 135.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c39, serviceCode: "TRANSSHIP_STORE_20", serviceName: "Transshipment storage 20ft per day (after 15d free)", subClause: "4(e)", containerSize: "20", cargoClass: "TRANSSHIPMENT" as const, rateAmount: 15.00, rateUnit: "PER_DAY" as const },
    { clauseId: c39, serviceCode: "TRANSSHIP_STORE_40", serviceName: "Transshipment storage 40ft per day (after 15d free)", subClause: "4(e)", containerSize: "40", cargoClass: "TRANSSHIPMENT" as const, rateAmount: 30.00, rateUnit: "PER_DAY" as const },
    { clauseId: c39, serviceCode: "TRANSSHIP_TRANSFER_20", serviceName: "Transshipment transfer 20ft", subClause: "4(f)", containerSize: "20", rateAmount: 10.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c39, serviceCode: "TRANSSHIP_TRANSFER_40", serviceName: "Transshipment transfer 40ft", subClause: "4(f)", containerSize: "40", rateAmount: 15.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c39, serviceCode: "SHUTOUT_20", serviceName: "Shut-out charges 20ft", subClause: "5(a)", containerSize: "20", rateAmount: 50.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c39, serviceCode: "SHUTOUT_40", serviceName: "Shut-out charges 40ft", subClause: "5(a)", containerSize: "40", rateAmount: 75.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c39, serviceCode: "SHUTOUT_REMOVAL_20", serviceName: "Shut-out removal 20ft", subClause: "5(b)", containerSize: "20", rateAmount: 30.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c39, serviceCode: "SHUTOUT_REMOVAL_40", serviceName: "Shut-out removal 40ft", subClause: "5(b)", containerSize: "40", rateAmount: 45.00, rateUnit: "PER_CONTAINER_40FT" as const },
    { clauseId: c39, serviceCode: "SHUTOUT_STORE_20", serviceName: "Shut-out storage 20ft per day (after 5d free)", subClause: "5(d)", containerSize: "20", rateAmount: 15.00, rateUnit: "PER_DAY" as const },
    { clauseId: c39, serviceCode: "SHUTOUT_STORE_40", serviceName: "Shut-out storage 40ft per day (after 5d free)", subClause: "5(d)", containerSize: "40", rateAmount: 30.00, rateUnit: "PER_DAY" as const },
  ]

  // --- CLAUSE 42: ICD SPECIAL RATES (KEY FOR 7SQUARE) ---
  const c42 = await getClauseId(42)
  const icdRates = [
    // Ex NASACO Yard
    { clauseId: c42, serviceCode: "ICD_NASACO_PKG_20", serviceName: "Ex NASACO Yard package rate 20ft", subClause: "1", containerSize: "20", rateAmount: 280.00, rateUnit: "PER_CONTAINER_20FT" as const, notes: "All services (a-f) as package incl transport to port" },
    { clauseId: c42, serviceCode: "ICD_NASACO_PKG_40", serviceName: "Ex NASACO Yard package rate 40ft", subClause: "1", containerSize: "40", rateAmount: 510.00, rateUnit: "PER_CONTAINER_40FT" as const, notes: "All services (a-f) as package incl transport to port" },
    // Ubungo ICD
    { clauseId: c42, serviceCode: "ICD_UBUNGO_PKG_20", serviceName: "Ubungo ICD package rate 20ft", subClause: "2", containerSize: "20", rateAmount: 180.00, rateUnit: "PER_CONTAINER_20FT" as const, notes: "All services (a-e) as package. Conveyance separate" },
    { clauseId: c42, serviceCode: "ICD_UBUNGO_PKG_40", serviceName: "Ubungo ICD package rate 40ft", subClause: "2", containerSize: "40", rateAmount: 310.00, rateUnit: "PER_CONTAINER_40FT" as const, notes: "All services (a-e) as package. Conveyance separate" },
    // Other ICDs (Kwala Ruvu and others)
    { clauseId: c42, serviceCode: "ICD_OTHER_PKG_20", serviceName: "Other ICD package rate 20ft", subClause: "3", containerSize: "20", rateAmount: 180.00, rateUnit: "PER_CONTAINER_20FT" as const, notes: "Kwala Ruvu and others. All services (a-e). Conveyance separate" },
    { clauseId: c42, serviceCode: "ICD_OTHER_PKG_40", serviceName: "Other ICD package rate 40ft", subClause: "3", containerSize: "40", rateAmount: 310.00, rateUnit: "PER_CONTAINER_40FT" as const, notes: "Kwala Ruvu and others. All services (a-e). Conveyance separate" },
    // ICD Port Extension Mode storage
    { clauseId: c42, serviceCode: "ICD_STORE_LOCAL_T1_20", serviceName: "ICD local import storage 20ft - day 31-44", subClause: "4(e)(iii)", cargoClass: "DOMESTIC_IMPORT" as const, containerSize: "20", rateAmount: 20.00, rateUnit: "PER_DAY" as const, notes: "After 30 days free" },
    { clauseId: c42, serviceCode: "ICD_STORE_LOCAL_T1_40", serviceName: "ICD local import storage 40ft - day 31-44", subClause: "4(e)(iii)", cargoClass: "DOMESTIC_IMPORT" as const, containerSize: "40", rateAmount: 40.00, rateUnit: "PER_DAY" as const },
    { clauseId: c42, serviceCode: "ICD_STORE_TRANSIT_T1_20", serviceName: "ICD transit import storage 20ft - day 61-74", subClause: "4(e)(iv)", cargoClass: "TRANSIT_IMPORT" as const, containerSize: "20", rateAmount: 20.00, rateUnit: "PER_DAY" as const, notes: "After 60 days free" },
    { clauseId: c42, serviceCode: "ICD_STORE_TRANSIT_T1_40", serviceName: "ICD transit import storage 40ft - day 61-74", subClause: "4(e)(iv)", cargoClass: "TRANSIT_IMPORT" as const, containerSize: "40", rateAmount: 40.00, rateUnit: "PER_DAY" as const },
    { clauseId: c42, serviceCode: "ICD_STORE_T2_20", serviceName: "ICD storage thereafter 20ft", subClause: "4(e)(v)", containerSize: "20", rateAmount: 40.00, rateUnit: "PER_DAY" as const },
    { clauseId: c42, serviceCode: "ICD_STORE_T2_40", serviceName: "ICD storage thereafter 40ft", subClause: "4(e)(v)", containerSize: "40", rateAmount: 80.00, rateUnit: "PER_DAY" as const },
    // ICD General cargo storage
    { clauseId: c42, serviceCode: "ICD_STORE_GC", serviceName: "ICD general cargo storage per HTN/day", subClause: "5(iii)", rateAmount: 0.50, rateUnit: "PER_HTN" as const, notes: "After 30d local / 60d transit free" },
  ]

  // --- CLAUSE 43: MISCELLANEOUS ---
  const c43 = await getClauseId(43)
  const miscRates = [
    { clauseId: c43, serviceCode: "MISC_WEIGH_SINGLE", serviceName: "Weighing single packages per 50kg", subClause: "1(a)", rateAmount: 1.00, rateUnit: "PER_50KG" as const },
    { clauseId: c43, serviceCode: "MISC_WEIGH_COLLECTIVE", serviceName: "Weighing collective per tonne", subClause: "1(b)", rateAmount: 4.00, rateUnit: "PER_HTN" as const },
    { clauseId: c43, serviceCode: "MISC_VGM_DSM", serviceName: "VGM verification - DSM port", subClause: "2(a)", rateAmount: 60.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c43, serviceCode: "MISC_VGM_OTHER", serviceName: "VGM verification - Tanga/Mtwara", subClause: "2(b)", rateAmount: 30.00, rateUnit: "PER_CONTAINER_20FT" as const },
    { clauseId: c43, serviceCode: "MISC_MEASURING", serviceName: "Measuring per tonne/CBM", subClause: "3(a)", rateAmount: 4.00, rateUnit: "PER_HTN" as const },
    { clauseId: c43, serviceCode: "MISC_REMOVAL_DSM", serviceName: "Removal of exports - DSM", subClause: "4(a)", rateAmount: 4.00, rateUnit: "PER_HTN" as const },
    { clauseId: c43, serviceCode: "MISC_SORTING_EXP", serviceName: "Sorting exports", subClause: "4(b)", rateAmount: 2.00, rateUnit: "PER_HTN" as const },
    { clauseId: c43, serviceCode: "MISC_SORTING_IMP", serviceName: "Sorting imports", subClause: "4(c)(a)", rateAmount: 3.00, rateUnit: "PER_HTN" as const },
    { clauseId: c43, serviceCode: "MISC_BAGGING_MANUAL", serviceName: "Bagging manual per bag", subClause: "4(d)(i)", rateAmount: 2.00, rateUnit: "PER_BAG" as const },
    { clauseId: c43, serviceCode: "MISC_BAGGING_MECH", serviceName: "Bagging mechanised per bag", subClause: "4(d)(ii)", rateAmount: 1.00, rateUnit: "PER_BAG" as const },
    { clauseId: c43, serviceCode: "MISC_PATCHING", serviceName: "Patching/re-sewing per bale/bag", subClause: "4(e)", rateAmount: 1.00, rateUnit: "PER_BAG" as const },
    { clauseId: c43, serviceCode: "MISC_FUMIG_RICE", serviceName: "Fumigation rice per DWT", subClause: "4(h)(i)", rateAmount: 4.00, rateUnit: "PER_DWT" as const },
    { clauseId: c43, serviceCode: "MISC_FUMIG_OTHER", serviceName: "Fumigation other per package", subClause: "4(h)(ii)", rateAmount: 1.00, rateUnit: "PER_PACKAGE" as const },
  ]

  // Bulk insert all rates
  const allRates = [
    ...pilotageRates, ...portDuesRates, ...navDuesRates, ...dockageRates,
    ...tugRates, ...mooringRates, ...waterRates, ...garbageRates,
    ...labourRates, ...equipmentRates, ...stevedoringRates,
    ...wharfageRates, ...shorehandlingRates, ...storageRates,
    ...dctRates, ...berth07Rates, ...roroRates,
    ...containerServiceRates, ...icdRates, ...miscRates,
  ]

  for (const rate of allRates) {
    await prisma.tariffRate.create({ data: rate as any })
  }
  console.log(`Created ${allRates.length} tariff rates across all clauses`)

  // =========================================================================
  // FREE PERIODS
  // =========================================================================
  const freePeriods = [
    // Domestic
    { clauseId: c32, cargoClass: "DOMESTIC_IMPORT" as const, freeDays: 5, description: "Domestic import break bulk - 5 days free from discharge/Tancis post" },
    { clauseId: c32, cargoClass: "DOMESTIC_EXPORT" as const, freeDays: 5, description: "Domestic export break bulk - 5 days free from acceptance" },
    // Domestic containers
    { clauseId: c32, cargoClass: "DOMESTIC_IMPORT" as const, containerSize: "20", freeDays: 5, description: "Domestic FCL import 20ft - 5 days free" },
    { clauseId: c32, cargoClass: "DOMESTIC_IMPORT" as const, containerSize: "40", freeDays: 5, description: "Domestic FCL import 40ft - 5 days free" },
    { clauseId: c32, cargoClass: "DOMESTIC_EXPORT" as const, containerSize: "20", freeDays: 5, description: "Domestic FCL export 20ft - 5 days free" },
    { clauseId: c32, cargoClass: "DOMESTIC_EXPORT" as const, containerSize: "40", freeDays: 5, description: "Domestic FCL export 40ft - 5 days free" },
    // Transit
    { clauseId: c32, cargoClass: "TRANSIT_IMPORT" as const, freeDays: 15, description: "Transit import break bulk - 15 days free" },
    { clauseId: c32, cargoClass: "TRANSIT_EXPORT" as const, freeDays: 21, description: "Transit export break bulk - 21 days free" },
    // Transit containers
    { clauseId: c32, cargoClass: "TRANSIT_IMPORT" as const, containerSize: "20", freeDays: 15, description: "Transit FCL import 20ft - 15 days free" },
    { clauseId: c32, cargoClass: "TRANSIT_IMPORT" as const, containerSize: "40", freeDays: 15, description: "Transit FCL import 40ft - 15 days free" },
    { clauseId: c32, cargoClass: "TRANSIT_EXPORT" as const, containerSize: "20", freeDays: 21, description: "Transit FCL export 20ft - 21 days free" },
    { clauseId: c32, cargoClass: "TRANSIT_EXPORT" as const, containerSize: "40", freeDays: 21, description: "Transit FCL export 40ft - 21 days free" },
    // Empty containers
    { clauseId: c32, cargoClass: "ALL" as const, containerSize: "20", freeDays: 5, description: "Empty 20ft - 5 days free" },
    { clauseId: c32, cargoClass: "ALL" as const, containerSize: "40", freeDays: 5, description: "Empty 40ft - 5 days free" },
    // Transshipment
    { clauseId: c32, cargoClass: "TRANSSHIPMENT" as const, freeDays: 10, description: "Transshipment break bulk - 10 days free" },
    { clauseId: c39, cargoClass: "TRANSSHIPMENT" as const, containerSize: "20", freeDays: 15, description: "Transshipment containers - 15 days free" },
    { clauseId: c39, cargoClass: "TRANSSHIPMENT" as const, containerSize: "40", freeDays: 15, description: "Transshipment containers - 15 days free" },
    // Coastwise
    { clauseId: c32, cargoClass: "COASTWISE" as const, freeDays: 3, description: "Coastwise cargo - 3 days free" },
    // ICD Port Extension Mode
    { clauseId: c42, cargoClass: "DOMESTIC_IMPORT" as const, containerSize: "20", freeDays: 30, description: "ICD local import - 30 days free" },
    { clauseId: c42, cargoClass: "DOMESTIC_IMPORT" as const, containerSize: "40", freeDays: 30, description: "ICD local import - 30 days free" },
    { clauseId: c42, cargoClass: "TRANSIT_IMPORT" as const, containerSize: "20", freeDays: 60, description: "ICD transit import - 60 days free" },
    { clauseId: c42, cargoClass: "TRANSIT_IMPORT" as const, containerSize: "40", freeDays: 60, description: "ICD transit import - 60 days free" },
    // Reefer (48 hours = 2 days)
    { clauseId: c39, cargoClass: "ALL" as const, freeDays: 0, freeHours: 48, description: "Reefer storage - 48 hours free" },
    // DG (24 hours = 1 day)
    { clauseId: c32, cargoClass: "ALL" as const, freeDays: 0, freeHours: 24, description: "Dangerous goods storage - 24 hours free at ICDs" },
  ]

  for (const fp of freePeriods) {
    await prisma.tariffFreePeriod.create({ data: fp })
  }
  console.log(`Created ${freePeriods.length} free period rules`)

  // =========================================================================
  // SURCHARGES
  // =========================================================================
  const surcharges = [
    { surchargeType: "DANGEROUS_GOODS_HANDLING" as const, percentage: 10, description: "DG surcharge on stevedoring and shorehandling", appliesToClauses: ["14", "29", "36", "37", "38"] },
    { surchargeType: "DANGEROUS_GOODS_STORAGE" as const, percentage: 20, description: "DG surcharge on storage (after 24hr free)", appliesToClauses: ["32", "42"] },
    { surchargeType: "OVER_DIMENSION" as const, percentage: 30, description: "Over-dimension container surcharge on handling", appliesToClauses: ["29", "36", "37", "38"] },
    { surchargeType: "COLD_STORAGE" as const, percentage: 30, description: "Cold storage cargo handling surcharge", appliesToClauses: ["29"] },
  ]

  for (const s of surcharges) {
    await prisma.tariffSurcharge.create({ data: s })
  }
  console.log(`Created ${surcharges.length} surcharge rules`)

  // =========================================================================
  // SAMPLE CUSTOMERS
  // =========================================================================
  const customers = [
    { name: "DSM Freight Ltd", customerType: "CLEARING_AGENT" as const, companyName: "DSM Freight Ltd", country: "TZ", email: "info@dsmfreight.co.tz" },
    { name: "Zambia Copper Traders", customerType: "TRANSIT_CLIENT" as const, companyName: "Zambia Copper Traders", country: "ZM", email: "trade@zmcopper.com" },
    { name: "Congo Mining Corp", customerType: "TRANSIT_CLIENT" as const, companyName: "Congo Mining Corp", country: "CD", email: "ops@congomining.cd" },
    { name: "Rwanda Fresh Exports", customerType: "EXPORTER" as const, companyName: "Rwanda Fresh Exports", country: "RW", email: "export@rwfresh.rw" },
    { name: "Burundi Trading Co", customerType: "IMPORTER" as const, companyName: "Burundi Trading Co", country: "BI", email: "import@btc.bi" },
    { name: "Maersk Line (TZ)", customerType: "SHIPPING_AGENT" as const, companyName: "Maersk Line", country: "TZ", email: "tz@maersk.com" },
    { name: "MSC Tanzania", customerType: "SHIPPING_AGENT" as const, companyName: "Mediterranean Shipping Company", country: "TZ", email: "tz@msc.com" },
  ]

  for (const c of customers) {
    await prisma.customer.create({ data: c })
  }
  console.log(`Created ${customers.length} sample customers`)

  // =========================================================================
  // SAMPLE WAREHOUSES
  // =========================================================================
  const warehouses = [
    { name: "Warehouse A - Bonded", warehouseType: "BONDED" as const, location: "7Square ICD Main Yard", totalCapacityTeu: 200 },
    { name: "Warehouse B - Free", warehouseType: "FREE" as const, location: "7Square ICD Main Yard", totalCapacityTeu: 300 },
    { name: "Reefer Yard", warehouseType: "REEFER_YARD" as const, location: "7Square ICD East Wing", totalCapacityTeu: 50 },
    { name: "DG Storage Zone", warehouseType: "DG_ZONE" as const, location: "7Square ICD Isolated Area", totalCapacityTeu: 30 },
    { name: "Open Yard", warehouseType: "OPEN_YARD" as const, location: "7Square ICD Open Area", totalCapacityTeu: 500 },
  ]

  for (const w of warehouses) {
    await prisma.warehouse.create({ data: w })
  }
  console.log(`Created ${warehouses.length} warehouses`)

  console.log("\nSeed completed successfully!")
  console.log(`Total tariff rates: ${allRates.length}`)
  console.log(`Total free period rules: ${freePeriods.length}`)
  console.log(`Total surcharge rules: ${surcharges.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
