import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clauseNumber = searchParams.get("clause")

  if (clauseNumber) {
    const clause = await prisma.tariffClause.findUnique({
      where: { clauseNumber: parseInt(clauseNumber) },
      include: {
        rates: { where: { isActive: true }, orderBy: { serviceCode: "asc" } },
        freePeriods: true,
      },
    })
    if (!clause) return NextResponse.json({ error: "Clause not found" }, { status: 404 })
    return NextResponse.json(clause)
  }

  const clauses = await prisma.tariffClause.findMany({
    where: { isActive: true },
    include: { _count: { select: { rates: true } } },
    orderBy: { clauseNumber: "asc" },
  })

  return NextResponse.json(clauses)
}
