import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import connectMongo from "@/lib/connectDB";
import * as jose from "jose";
import User from "@/models/user";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
	const { email, password } = await request.json();

	await connectMongo();

	const user = await User.findOne({ email });
	if (!user) {
		return NextResponse.json({ message: "User not found" }, { status: 404 });
	}
	//check if the user is blocked
	if (user.isBlocked) {
		return NextResponse.json({ message: "User is blocked please contact your admin" }, { status: 403 });
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		return NextResponse.json({ message: "Invalid password" }, { status: 401 });
	}
    

	const token = await new jose.SignJWT({
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		phoneNumber: user.phoneNumber,
        privileges: user.privileges.map((p: any) => p.toString()),
	})
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("24h")
		.sign(new TextEncoder().encode(process.env.JOSE_SECRET));

        console.log(user.privileges)

	return NextResponse.json({
		token,
		user: {
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			phoneNumber: user.phoneNumber,
			privileges: user.privileges,
		},
	});
}

export async function GET(request: NextRequest) {
	const user = request.headers.get("user");
	if (!user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}
	return NextResponse.json({ user: JSON.parse(user) });
}
