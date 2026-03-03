export async function POST(request: Request) {
    const { email } = await request.json();
    console.log("Received subscription request for email:", email);
    return new Response(JSON.stringify({ message: "Subscription successful" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });

}