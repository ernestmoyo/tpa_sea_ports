import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * POST /api/invoices/check-overdue
 * Scans all ISSUED invoices past their dueDate and marks them OVERDUE.
 * Can be called manually from the dashboard or via a cron job.
 */
export async function POST() {
  const now = new Date()

  const result = await prisma.invoice.updateMany({
    where: {
      status: "ISSUED",
      dueDate: { lt: now },
    },
    data: {
      status: "OVERDUE",
    },
  })

  return NextResponse.json({
    markedOverdue: result.count,
    checkedAt: now.toISOString(),
  })
}
