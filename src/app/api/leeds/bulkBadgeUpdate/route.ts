export const dynamic = "force-dynamic";
import connectMongo from "@/lib/connectDB";
import Leed from "@/models/leedsModal";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest){

    await connectMongo();

    const user = request.headers.get("user");
    if (!user) {
        return NextResponse.json(
            { message: "You need to login as an admin to update these data." },
            { status: 401 }
        );
    }
    
    //const userObject = JSON.parse(user);

    const body = await request.json();
    const { ids, badges } = body;

    //update the badges of the leeds
    try {
        const updatedLeeds = await Leed.updateMany(
            { _id: { $in: ids } },
            { $set: { badges: badges } },
            { new: true }
        );

        return NextResponse.json(updatedLeeds, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Failed to update leeds", error: error.message },
            { status: 500 }
        );
    }
}