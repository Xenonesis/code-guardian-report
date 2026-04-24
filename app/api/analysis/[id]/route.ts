import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/analysis/[id] - Get specific analysis
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = params;

    const analysis = await prisma.analysisResult.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}

// PUT /api/analysis/[id] - Update analysis
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = params;
    const body = await request.json();

    // Verify ownership
    const existing = await prisma.analysisResult.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Analysis not found or unauthorized" },
        { status: 404 }
      );
    }

    const { results, tags, isPublic } = body;
    const updateData: any = {};

    if (results) updateData.results = results;
    if (tags) updateData.tags = tags;
    if (typeof isPublic === "boolean") updateData.isPublic = isPublic;

    const analysis = await prisma.analysisResult.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error("Error updating analysis:", error);
    return NextResponse.json(
      { error: "Failed to update analysis" },
      { status: 500 }
    );
  }
}

// DELETE /api/analysis/[id] - Delete analysis
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = params;

    // Verify ownership and get file info for stats update
    const analysis = await prisma.analysisResult.findFirst({
      where: { id, userId },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete analysis
    await prisma.analysisResult.delete({
      where: { id },
    });

    // Update user stats
    const currentStats = await prisma.userStats.findUnique({
      where: { userId },
    });

    if (currentStats) {
      await prisma.userStats.update({
        where: { userId },
        data: {
          totalAnalyses: Math.max(0, currentStats.totalAnalyses - 1),
          totalFilesAnalyzed: Math.max(0, currentStats.totalFilesAnalyzed - 1),
          totalIssuesFound: Math.max(
            0,
            currentStats.totalIssuesFound - ((analysis.results as any)?.issues?.length || 0)
          ),
          totalBytesAnalyzed: Math.max(
            0,
            currentStats.totalBytesAnalyzed - (analysis.fileSize || 0)
          ),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting analysis:", error);
    return NextResponse.json(
      { error: "Failed to delete analysis" },
      { status: 500 }
    );
  }
}
