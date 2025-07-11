import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/connectDB";
import User from "@/models/user";
import bcrypt from "bcrypt";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    /*
    	firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    phoneNumber?: string;
    privileges?: [string];
    isBlocked?: boolean;
    */
   const {firstName, lastName, email, password, phoneNumber} = await req.json();
    await connectMongo();
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Failed to create user", error: error.message },
            { status: 500 }
        );
    }

}