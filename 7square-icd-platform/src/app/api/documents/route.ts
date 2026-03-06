import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const documents = await prisma.document.findMany({
    include: {
      container: { select: { id: true, containerNumber: true } },
      cargo: { select: { id: true, description: true } },
      customer: { select: { id: true, name: true } },
    },
    orderBy: { uploadedAt: "desc" },
    take: 100,
  })
  return NextResponse.json(documents)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.documentType || !body.fileName) {
      return NextResponse.json({ message: "Document type and file name are required" }, { status: 400 })
    }

    const document = await prisma.document.create({
      data: {
        documentType: body.documentType,
        documentNumber: body.documentNumber || null,
        fileName: body.fileName,
        filePath: body.filePath || null,
        containerId: body.containerId || null,
        cargoId: body.cargoId || null,
        customerId: body.customerId || null,
        notes: body.notes || null,
        receivedAt: new Date(),
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    return NextResponse.json({ message: error.message || "Failed to upload document" }, { status: 500 })
  }
}
