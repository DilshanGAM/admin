import connectMongo from "@/lib/connectDB";
import Leed from "@/models/leedsModal";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	//create leed
	await connectMongo();
	const body = await request.json();
	try {
		return NextResponse.json(await Leed.create(body));
	} catch (error: any) {
		return NextResponse.json(
			{ message: "Failed to create leed", error: error.message },
			{ status: 500 }
		);
	}
}
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
		const startDateRaw =
			req.nextUrl.searchParams.get("startDate") || "1960-01-01";

		const startDate = new Date(startDateRaw);

		const endDateRaw =
			req.nextUrl.searchParams.get("endDate") ||
			new Date().toISOString().split("T")[0];
		const query = req.nextUrl.searchParams.get("query") || "";

		const endDate = new Date(new Date(endDateRaw).setHours(23, 59, 59, 999));
		const countInString = req.nextUrl.searchParams.get("count") || "20";
		const count = parseInt(countInString, 10);
		const sortBy = req.nextUrl.searchParams.get("sortBy") || "createdAt";
		const sortOrder = req.nextUrl.searchParams.get("sortOrder") || "desc";
		const pageInString = req.nextUrl.searchParams.get("page") || "1";
		const page = parseInt(pageInString, 10);
		let badgeList =
			req.nextUrl.searchParams.get("badgeList")?.split(",") || [];
		
		if(badgeList[0] === "") {
			badgeList = []
		}
		console.log("Badge List:", badgeList);
		//check if badgeList is not present or empty

		const leedsCount = await Leed.countDocuments({
			createdAt: {
				$gte: startDate,
				$lte: endDate,
			},
			$or: [
				{ firstName: { $regex: query, $options: "i" } },
				{ lastName: { $regex: query, $options: "i" } },
				{ phoneNumber: { $regex: query, $options: "i" } },
			],
			//find the leeds with the badges in the badgeList
			badges: badgeList.length > 0 ? { $all: badgeList } : { $exists: true },			

		});
		const pageCount = Math.ceil(leedsCount / count);
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
			//find the leeds with the badges in the badgeList if badgeList is not empty
			badges : badgeList.length > 0 ? { $all: badgeList } : { $exists: true },
		})
			.sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
			.limit(count)
			.skip((page - 1) * count)
			.lean();
		return NextResponse.json({
			leeds,
			pageCount,
			leedsCount,
			startDate,
			endDate,
			count,
			sortBy,
			sortOrder,
		});
	} catch (error: any) {
		return NextResponse.json(
			{ message: "Failed to fetch leeds", error: error.message },
			{ status: 500 }
		);
	}
}

//update leed badges
export async function PUT(request: NextRequest) {
	await connectMongo();
	const user = request.headers.get("user");
	if (!user) {
		return NextResponse.json(
			{ message: "You need to login as an admin to update leeds." },
			{ status: 401 }
		);
	}
	const leedsObjectId = request.nextUrl.searchParams.get("id");
	if (!leedsObjectId) {
		return NextResponse.json(
			{ message: "Leed ID is required" },
			{ status: 400 }
		);
	}
	const body = await request.json();
	try {
		const updatedLeed = await Leed.findByIdAndUpdate(
			leedsObjectId,
			{ badges: body.badges },
			{ new: true }
		);
		if (!updatedLeed) {
			return NextResponse.json({ message: "Leed not found" }, { status: 404 });
		}
		return NextResponse.json(updatedLeed);
	} catch (error: any) {
		return NextResponse.json(
			{ message: "Failed to update leed", error: error.message },
			{ status: 500 }
		);
	}
}
