import { Resend } from "resend";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
    const { email } = await request.json();
    console.log("Received subscription request for email:", email); // receive email from frontend and log it to console
    // store out into contact list or database here (resend’s audiences)
    // 1. create a account
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: createError } = await resend.contacts.create({
        email: email,
    })
    if (createError) {
        return new NextResponse(JSON.stringify({ message: "Subscription failed" }), { status: 500 });
    }
    // 2. add email to the resend‘s audience list
    const { error: addError } = await resend.contacts.segments.add({
        email: email,
        segmentId: "f80a9b33-78a7-4b42-91cf-849d3fb90f47", // replace with your actual segment ID
    })
    if (addError) {
        console.error("Error adding contact to segment:", addError);
        return new NextResponse(JSON.stringify({ message: "Subscription failed" }), { status: 500 });
    }

    return new NextResponse(JSON.stringify({ message: "Subscription successful" }), {
        status: 200, //
        headers: { "Content-Type": "application/json" },
    });

}