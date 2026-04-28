import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/analysis - Get user's analysis history
export async function GET(request: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const fileName = searchParams.get("fileName");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const analyses = await prisma.analysisResult.findMany({
      where: {
        userId,
        ...(fileName && {
          fileName: { contains: fileName, mode: "insensitive" },
        }),
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, data: analyses });
  } catch (error) {
    console.error("Error fetching analysis history:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis history" },
      { status: 500 }
    );
  }
}

// POST /api/analysis - Create new analysis
export async function POST(request: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const body = await request.json();
    const { fileName, fileSize, fileHash, results, metadata, tags, isPublic } =
      body;

    if (!fileName || !results) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const analysis = await prisma.analysisResult.create({
      data: {
        userId,
        fileName,
        fileSize: fileSize || 0,
        fileHash: fileHash || "",
        results,
        metadata: metadata || {},
        tags: tags || [],
        isPublic: isPublic || false,
        syncStatus: "synced",
      },
    });

    // Update user stats
    await prisma.userStats.upsert({
      where: { userId },
      update: {
        totalAnalyses: { increment: 1 },
        totalFilesAnalyzed: { increment: 1 },
        totalIssuesFound: { increment: results.issues?.length || 0 },
        totalBytesAnalyzed: { increment: fileSize || 0 },
        lastAnalysis: new Date(),
      },
      create: {
        userId,
        totalAnalyses: 1,
        totalFilesAnalyzed: 1,
        totalIssuesFound: results.issues?.length || 0,
        totalBytesAnalyzed: fileSize || 0,
        lastAnalysis: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error("Error creating analysis:", error);
    return NextResponse.json(
      { error: "Failed to create analysis" },
      { status: 500 }
    );
  }
}
