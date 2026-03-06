-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATIONS', 'WAREHOUSE', 'BILLING', 'FINANCE');

-- CreateEnum
CREATE TYPE "RateUnit" AS ENUM ('PER_HTN', 'PER_DWT', 'PER_TEU', 'PER_CONTAINER_20FT', 'PER_CONTAINER_40FT', 'PER_100_GRT', 'PER_GRT', 'PER_HOUR', 'PER_DAY', 'PER_SHIFT', 'PER_OPERATION', 'PER_CALL', 'PER_TRIP', 'PER_MAN_HOUR', 'PER_MINUTE', 'PER_PACKAGE', 'PER_BAG', 'PER_ANIMAL', 'PER_LITRE', 'PER_METRE', 'PER_PERSON', 'AD_VALOREM', 'FIXED', 'PER_TONNE_CAPACITY', 'PER_RECEPTACLE', 'PER_50KG');

-- CreateEnum
CREATE TYPE "VesselCategory" AS ENUM ('DEEP_SEA', 'COASTER', 'TRADITIONAL', 'ALL');

-- CreateEnum
CREATE TYPE "CargoClassification" AS ENUM ('DOMESTIC_IMPORT', 'DOMESTIC_EXPORT', 'TRANSIT_IMPORT', 'TRANSIT_EXPORT', 'TRANSSHIPMENT', 'COASTWISE', 'ALL');

-- CreateEnum
CREATE TYPE "ContainerLoadType" AS ENUM ('FCL', 'LCL', 'EMPTY', 'ALL');

-- CreateEnum
CREATE TYPE "SurchargeType" AS ENUM ('DANGEROUS_GOODS_HANDLING', 'DANGEROUS_GOODS_STORAGE', 'OVER_DIMENSION', 'COLD_STORAGE', 'OVERTIME', 'VAT');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('IMPORTER', 'EXPORTER', 'SHIPPING_AGENT', 'CLEARING_AGENT', 'SHIP_OWNER', 'TERMINAL_OPERATOR', 'TRANSIT_CLIENT');

-- CreateEnum
CREATE TYPE "VesselType" AS ENUM ('CONTAINER_SHIP', 'BULK_CARRIER', 'TANKER', 'RORO', 'GENERAL_CARGO', 'DHOW', 'COASTER', 'TRADITIONAL', 'PLEASURE_CRAFT', 'TUG', 'OTHER');

-- CreateEnum
CREATE TYPE "VesselCallStatus" AS ENUM ('EXPECTED', 'ARRIVED', 'BERTHED', 'WORKING', 'COMPLETED', 'DEPARTED');

-- CreateEnum
CREATE TYPE "ContainerSize" AS ENUM ('SIZE_20', 'SIZE_40', 'SIZE_45');

-- CreateEnum
CREATE TYPE "ContainerType" AS ENUM ('DRY', 'REEFER', 'OPEN_TOP', 'FLAT_RACK', 'TANK', 'OTHER');

-- CreateEnum
CREATE TYPE "ContainerStatus" AS ENUM ('ARRIVING', 'RECEIVED', 'IN_STORAGE', 'UNDER_OPERATION', 'READY_FOR_RELEASE', 'RELEASED', 'DEPARTED');

-- CreateEnum
CREATE TYPE "CargoType" AS ENUM ('DOMESTIC_IMPORT', 'DOMESTIC_EXPORT', 'TRANSIT_IMPORT', 'TRANSIT_EXPORT', 'TRANSSHIPMENT', 'COASTWISE');

-- CreateEnum
CREATE TYPE "IMDGClass" AS ENUM ('CLASS_1', 'CLASS_2_1', 'CLASS_2_2', 'CLASS_2_3', 'CLASS_3', 'CLASS_4_1', 'CLASS_4_2', 'CLASS_4_3', 'CLASS_5_1', 'CLASS_5_2', 'CLASS_6_1', 'CLASS_6_2', 'CLASS_7', 'CLASS_8', 'CLASS_9');

-- CreateEnum
CREATE TYPE "PackingGroup" AS ENUM ('I', 'II', 'III');

-- CreateEnum
CREATE TYPE "WarehouseType" AS ENUM ('BONDED', 'FREE', 'REEFER_YARD', 'DG_ZONE', 'OPEN_YARD');

-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('STANDARD', 'REEFER_POINT', 'DG_ZONE', 'HEAVY_LIFT', 'OPEN_YARD');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('RECEIVING', 'PALLETISING', 'STRETCH_WRAPPING', 'STUFFING', 'STRIPPING', 'WEIGHING', 'MEASURING', 'FUMIGATION', 'LOADING', 'UNLOADING', 'DELIVERY', 'TRANSFER', 'INSPECTION', 'VGM_VERIFICATION', 'SORTING', 'REMOVAL', 'BAGGING');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'CREDITED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CASH', 'CHEQUE', 'MOBILE_MONEY', 'CREDIT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BILL_OF_LADING', 'DELIVERY_ORDER', 'RELEASE_ORDER', 'CUSTOMS_DECLARATION', 'MSDS', 'SHIPPING_ORDER', 'MANIFEST', 'VGM_CERTIFICATE', 'TANCIS_ENTRY', 'PACKING_LIST', 'COMMERCIAL_INVOICE', 'CERTIFICATE_OF_ORIGIN', 'FUMIGATION_CERTIFICATE', 'DG_DECLARATION', 'OTHER');

-- CreateEnum
CREATE TYPE "SLAServiceType" AS ENUM ('DOCUMENT_PROCESSING', 'CARGO_OPERATIONS', 'CUSTOMER_INQUIRY', 'WRITTEN_CORRESPONDENCE', 'EMAIL_QUERY', 'DETAILED_ANALYSIS', 'RECEPTION_DESK', 'DEPARTMENT_VISIT', 'PHONE_CALL', 'PILOTAGE');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATIONS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TariffClause" (
    "id" TEXT NOT NULL,
    "clauseNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "partNumber" INTEGER NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TariffClause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TariffRate" (
    "id" TEXT NOT NULL,
    "clauseId" TEXT NOT NULL,
    "serviceCode" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "subClause" TEXT,
    "vesselCategory" "VesselCategory" NOT NULL DEFAULT 'ALL',
    "cargoClass" "CargoClassification" NOT NULL DEFAULT 'ALL',
    "containerSize" TEXT,
    "containerLoadType" "ContainerLoadType" NOT NULL DEFAULT 'ALL',
    "rateAmount" DECIMAL(12,2) NOT NULL,
    "rateUnit" "RateUnit" NOT NULL,
    "isMinimum" BOOLEAN NOT NULL DEFAULT false,
    "minimumAmount" DECIMAL(12,2),
    "isOvertime" BOOLEAN NOT NULL DEFAULT false,
    "overtimeRate" DECIMAL(12,2),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TariffRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TariffSurcharge" (
    "id" TEXT NOT NULL,
    "surchargeType" "SurchargeType" NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "description" TEXT NOT NULL,
    "appliesToClauses" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TariffSurcharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TariffFreePeriod" (
    "id" TEXT NOT NULL,
    "clauseId" TEXT NOT NULL,
    "cargoClass" "CargoClassification" NOT NULL,
    "containerSize" TEXT,
    "freeDays" INTEGER NOT NULL,
    "freeHours" INTEGER,
    "description" TEXT,

    CONSTRAINT "TariffFreePeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerType" "CustomerType" NOT NULL,
    "companyName" TEXT,
    "country" TEXT NOT NULL DEFAULT 'TZ',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "taxId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vessel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imoNumber" TEXT,
    "grt" DECIMAL(12,2) NOT NULL,
    "dwt" DECIMAL(12,2),
    "loa" DECIMAL(8,2),
    "vesselType" "VesselType" NOT NULL,
    "flagState" TEXT,
    "isCoaster" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vessel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VesselCall" (
    "id" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    "voyageNumber" TEXT,
    "eta" TIMESTAMP(3),
    "ata" TIMESTAMP(3),
    "atd" TIMESTAMP(3),
    "berth" TEXT,
    "status" "VesselCallStatus" NOT NULL DEFAULT 'EXPECTED',
    "dischargeDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VesselCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Container" (
    "id" TEXT NOT NULL,
    "containerNumber" TEXT NOT NULL,
    "size" "ContainerSize" NOT NULL,
    "containerType" "ContainerType" NOT NULL DEFAULT 'DRY',
    "status" "ContainerStatus" NOT NULL DEFAULT 'ARRIVING',
    "isFcl" BOOLEAN NOT NULL DEFAULT true,
    "isEmpty" BOOLEAN NOT NULL DEFAULT false,
    "isOverDimension" BOOLEAN NOT NULL DEFAULT false,
    "tareWeight" DECIMAL(10,2),
    "vgmWeight" DECIMAL(10,2),
    "vgmCertified" BOOLEAN NOT NULL DEFAULT false,
    "sealNumber" TEXT,
    "customerId" TEXT,
    "vesselCallId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Container_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cargo" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hsCode" TEXT,
    "weightKg" DECIMAL(12,2) NOT NULL,
    "volumeCbm" DECIMAL(12,2),
    "harbourTonnes" DECIMAL(12,2) NOT NULL,
    "cifValueUsd" DECIMAL(14,2),
    "cargoType" "CargoType" NOT NULL,
    "isDangerous" BOOLEAN NOT NULL DEFAULT false,
    "isColdStorage" BOOLEAN NOT NULL DEFAULT false,
    "isValuable" BOOLEAN NOT NULL DEFAULT false,
    "packageCount" INTEGER,
    "destinationCountry" TEXT,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContainerCargo" (
    "id" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "cargoId" TEXT NOT NULL,

    CONSTRAINT "ContainerCargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DangerousGoods" (
    "id" TEXT NOT NULL,
    "containerId" TEXT,
    "cargoId" TEXT,
    "imdgClass" "IMDGClass" NOT NULL,
    "unNumber" TEXT NOT NULL,
    "properShippingName" TEXT NOT NULL,
    "packingGroup" "PackingGroup",
    "flashPoint" TEXT,
    "segregationGroup" TEXT,
    "emergencySchedule" TEXT,
    "msdsDocumentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DangerousGoods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "warehouseType" "WarehouseType" NOT NULL,
    "location" TEXT,
    "totalCapacityTeu" INTEGER NOT NULL,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageSlot" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "slotCode" TEXT NOT NULL,
    "block" TEXT,
    "bay" INTEGER,
    "row" INTEGER,
    "tier" INTEGER,
    "slotType" "SlotType" NOT NULL DEFAULT 'STANDARD',
    "isOccupied" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StorageSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageBooking" (
    "id" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3),
    "trafficType" "CargoType" NOT NULL,
    "freePeriodDays" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReeferMonitoring" (
    "id" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "setTemperature" DECIMAL(5,2) NOT NULL,
    "actualTemperature" DECIMAL(5,2) NOT NULL,
    "humidity" DECIMAL(5,2),
    "powerStatus" BOOLEAN NOT NULL DEFAULT true,
    "alertGenerated" BOOLEAN NOT NULL DEFAULT false,
    "alertMessage" TEXT,

    CONSTRAINT "ReeferMonitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReeferPowerLog" (
    "id" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "connectDate" TIMESTAMP(3) NOT NULL,
    "disconnectDate" TIMESTAMP(3),
    "dailyRate" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "ReeferPowerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargoOperation" (
    "id" TEXT NOT NULL,
    "containerId" TEXT,
    "cargoId" TEXT,
    "operationType" "OperationType" NOT NULL,
    "performedById" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "isOvertime" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CargoOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vesselCallId" TEXT,
    "issuedById" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "exchangeRate" DECIMAL(12,4),
    "subtotal" DECIMAL(14,2) NOT NULL,
    "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vatAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issuedDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLineItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "tariffRateId" TEXT,
    "description" TEXT NOT NULL,
    "clauseReference" TEXT,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unitRate" DECIMAL(12,2) NOT NULL,
    "surchargeType" TEXT,
    "surchargeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentNumber" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT,
    "containerId" TEXT,
    "cargoId" TEXT,
    "customerId" TEXT,
    "notes" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SLALog" (
    "id" TEXT NOT NULL,
    "serviceType" "SLAServiceType" NOT NULL,
    "targetMinutes" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "actualMinutes" INTEGER,
    "metTarget" BOOLEAN,
    "performedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SLALog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "assignedToId" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TariffClause_clauseNumber_key" ON "TariffClause"("clauseNumber");

-- CreateIndex
CREATE INDEX "TariffRate_clauseId_idx" ON "TariffRate"("clauseId");

-- CreateIndex
CREATE INDEX "TariffRate_serviceCode_idx" ON "TariffRate"("serviceCode");

-- CreateIndex
CREATE INDEX "TariffFreePeriod_clauseId_idx" ON "TariffFreePeriod"("clauseId");

-- CreateIndex
CREATE UNIQUE INDEX "Vessel_imoNumber_key" ON "Vessel"("imoNumber");

-- CreateIndex
CREATE INDEX "VesselCall_vesselId_idx" ON "VesselCall"("vesselId");

-- CreateIndex
CREATE UNIQUE INDEX "Container_containerNumber_key" ON "Container"("containerNumber");

-- CreateIndex
CREATE INDEX "Container_customerId_idx" ON "Container"("customerId");

-- CreateIndex
CREATE INDEX "Container_vesselCallId_idx" ON "Container"("vesselCallId");

-- CreateIndex
CREATE INDEX "Container_status_idx" ON "Container"("status");

-- CreateIndex
CREATE INDEX "Cargo_customerId_idx" ON "Cargo"("customerId");

-- CreateIndex
CREATE INDEX "Cargo_cargoType_idx" ON "Cargo"("cargoType");

-- CreateIndex
CREATE UNIQUE INDEX "ContainerCargo_containerId_cargoId_key" ON "ContainerCargo"("containerId", "cargoId");

-- CreateIndex
CREATE INDEX "DangerousGoods_containerId_idx" ON "DangerousGoods"("containerId");

-- CreateIndex
CREATE INDEX "DangerousGoods_cargoId_idx" ON "DangerousGoods"("cargoId");

-- CreateIndex
CREATE INDEX "DangerousGoods_imdgClass_idx" ON "DangerousGoods"("imdgClass");

-- CreateIndex
CREATE INDEX "StorageSlot_warehouseId_idx" ON "StorageSlot"("warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "StorageSlot_warehouseId_slotCode_key" ON "StorageSlot"("warehouseId", "slotCode");

-- CreateIndex
CREATE INDEX "StorageBooking_containerId_idx" ON "StorageBooking"("containerId");

-- CreateIndex
CREATE INDEX "StorageBooking_slotId_idx" ON "StorageBooking"("slotId");

-- CreateIndex
CREATE INDEX "ReeferMonitoring_containerId_idx" ON "ReeferMonitoring"("containerId");

-- CreateIndex
CREATE INDEX "ReeferMonitoring_timestamp_idx" ON "ReeferMonitoring"("timestamp");

-- CreateIndex
CREATE INDEX "ReeferPowerLog_containerId_idx" ON "ReeferPowerLog"("containerId");

-- CreateIndex
CREATE INDEX "CargoOperation_containerId_idx" ON "CargoOperation"("containerId");

-- CreateIndex
CREATE INDEX "CargoOperation_cargoId_idx" ON "CargoOperation"("cargoId");

-- CreateIndex
CREATE INDEX "CargoOperation_operationType_idx" ON "CargoOperation"("operationType");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_invoiceId_idx" ON "InvoiceLineItem"("invoiceId");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Document_containerId_idx" ON "Document"("containerId");

-- CreateIndex
CREATE INDEX "Document_cargoId_idx" ON "Document"("cargoId");

-- CreateIndex
CREATE INDEX "Document_documentType_idx" ON "Document"("documentType");

-- CreateIndex
CREATE INDEX "SLALog_serviceType_idx" ON "SLALog"("serviceType");

-- CreateIndex
CREATE INDEX "SLALog_metTarget_idx" ON "SLALog"("metTarget");

-- CreateIndex
CREATE INDEX "Complaint_customerId_idx" ON "Complaint"("customerId");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

-- AddForeignKey
ALTER TABLE "TariffRate" ADD CONSTRAINT "TariffRate_clauseId_fkey" FOREIGN KEY ("clauseId") REFERENCES "TariffClause"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TariffFreePeriod" ADD CONSTRAINT "TariffFreePeriod_clauseId_fkey" FOREIGN KEY ("clauseId") REFERENCES "TariffClause"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VesselCall" ADD CONSTRAINT "VesselCall_vesselId_fkey" FOREIGN KEY ("vesselId") REFERENCES "Vessel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Container" ADD CONSTRAINT "Container_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Container" ADD CONSTRAINT "Container_vesselCallId_fkey" FOREIGN KEY ("vesselCallId") REFERENCES "VesselCall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cargo" ADD CONSTRAINT "Cargo_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContainerCargo" ADD CONSTRAINT "ContainerCargo_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContainerCargo" ADD CONSTRAINT "ContainerCargo_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DangerousGoods" ADD CONSTRAINT "DangerousGoods_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DangerousGoods" ADD CONSTRAINT "DangerousGoods_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageSlot" ADD CONSTRAINT "StorageSlot_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageBooking" ADD CONSTRAINT "StorageBooking_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageBooking" ADD CONSTRAINT "StorageBooking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "StorageSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReeferMonitoring" ADD CONSTRAINT "ReeferMonitoring_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReeferPowerLog" ADD CONSTRAINT "ReeferPowerLog_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargoOperation" ADD CONSTRAINT "CargoOperation_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargoOperation" ADD CONSTRAINT "CargoOperation_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargoOperation" ADD CONSTRAINT "CargoOperation_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_vesselCallId_fkey" FOREIGN KEY ("vesselCallId") REFERENCES "VesselCall"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_tariffRateId_fkey" FOREIGN KEY ("tariffRateId") REFERENCES "TariffRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLALog" ADD CONSTRAINT "SLALog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
