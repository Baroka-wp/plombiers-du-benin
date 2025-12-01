import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, format } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const filter = searchParams.get("filter") || "week"; // today, week, month, year

    const skip = (page - 1) * limit;

    // Définir la plage de dates
    const now = new Date();
    let startDate = startOfWeek(now);
    let endDate = endOfWeek(now);

    switch (filter) {
      case "today":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case "week":
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Lundi
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "year":
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
    }

    // Récupérer les requêtes paginées
    const whereClause = {
      plumberId: id,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [requests, total] = await Promise.all([
      prisma.contactRequest.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contactRequest.count({ where: whereClause }),
    ]);

    // Générer les données pour le graphique
    // On récupère TOUTES les données de la période pour le graph (pas paginées)
    const allRequestsForChart = await prisma.contactRequest.findMany({
      where: whereClause,
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    let chartData: any[] = [];

    if (filter === "today") {
      // Grouper par heure
      const hours = new Array(24).fill(0);
      allRequestsForChart.forEach((req) => {
        const hour = new Date(req.createdAt).getHours();
        hours[hour]++;
      });
      chartData = hours.map((count, i) => ({
        name: `${i}h`,
        value: count,
      }));
    } else if (filter === "week") {
      // Grouper par jour de la semaine
      const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
      const counts = new Array(7).fill(0);
      allRequestsForChart.forEach((req) => {
        let dayIndex = new Date(req.createdAt).getDay() - 1; // 0 = Dimanche -> -1
        if (dayIndex === -1) dayIndex = 6; // Dimanche devient 6
        counts[dayIndex]++;
      });
      chartData = days.map((day, i) => ({
        name: day,
        value: counts[i],
      }));
    } else if (filter === "month") {
      // Grouper par jour du mois
      // Simplification: liste des jours
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const counts = new Array(daysInMonth).fill(0);
      allRequestsForChart.forEach((req) => {
        const day = new Date(req.createdAt).getDate() - 1;
        counts[day]++;
      });
      chartData = counts.map((count, i) => ({
        name: `${i + 1}`,
        value: count,
      }));
    } else if (filter === "year") {
      // Grouper par mois
      const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
      const counts = new Array(12).fill(0);
      allRequestsForChart.forEach((req) => {
        const month = new Date(req.createdAt).getMonth();
        counts[month]++;
      });
      chartData = months.map((month, i) => ({
        name: month,
        value: counts[i],
      }));
    }

    return NextResponse.json({
      requests,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      chartData,
    });
  } catch (error) {
    logger.error("Error fetching contact requests", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de la récupération des demandes" },
      { status: 500 }
    );
  }
}

