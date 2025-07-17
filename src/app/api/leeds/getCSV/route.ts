export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectDB";
import Leed from "@/models/leedsModal";
export async function GET(req: NextRequest) {
	await connectMongo();
	const user = req.headers.get("user");
	if (!user) {
		return NextResponse.json(
			{ message: "You need to login as an admin to view these data." },
			{ status: 401 }
		);
	}
	const userData = JSON.parse(user);

	if (userData.privileges.includes("view-leeds") === false) {
		return NextResponse.json(
			{ message: "You do not have permission to view leeds." },
			{ status: 403 }
		);
	}

	try {
		const startDateRaw = req.nextUrl.searchParams.get("startDate") || "1960-01-01";
		const endDateRaw =
			req.nextUrl.searchParams.get("endDate") || new Date().toISOString().split("T")[0];
		const query = req.nextUrl.searchParams.get("query") || "";
		const sortBy = req.nextUrl.searchParams.get("sortBy") || "createdAt";
		const sortOrder = req.nextUrl.searchParams.get("sortOrder") || "desc";

		const startDate = new Date(startDateRaw);
		const endDate = new Date(new Date(endDateRaw).setHours(23, 59, 59, 999));

		const leeds = await Leed.find({
			createdAt: {
				$gte: startDate,
				$lte: endDate,
			},
			$or: [
				{ firstName: { $regex: query, $options: "i" } },
				{ lastName: { $regex: query, $options: "i" } },
				{ phoneNumber: { $regex: query, $options: "i" } },
			],
		})
			.sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
			.lean();

		// Exclude badges and transform to CSV
		const csvHeader = ["First Name", "Last Name", "Phone Number", "Time", "Previous Site"];
		const csvRows = leeds.map((l) => [
			l.firstName,
			l.lastName,
			l.phoneNumber,
			new Date(l.time).toISOString(),
			l.previousSite,
		]);

		const csvString = [csvHeader, ...csvRows].map((row) => row.join(",")).join("\n");

		return new NextResponse(csvString, {
			status: 200,
			headers: {
				"Content-Type": "text/csv",
				"Content-Disposition": `attachment; filename="leeds_export.csv"`,
			},
		});
	} catch (error: any) {
		return NextResponse.json(
			{ message: "Failed to fetch leeds", error: error.message },
			{ status: 500 }
		);
	}
}
