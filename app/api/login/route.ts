import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const APPS_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbwahvrD8ZrKtEaQXQLTQN3vbvGFRrY0jLow2puEr9k8myHKdFxtz2mMETWwX2orA-C70g/exec";

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        username: username,
        password: password,
      }),
    });

    const result = await response.json();

    if (result.success) {
      return NextResponse.json({ success: true, user: result.user.username });
    } else {
      return NextResponse.json(
        { success: false, message: "Kredensial Salah" },
        { status: 401 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
