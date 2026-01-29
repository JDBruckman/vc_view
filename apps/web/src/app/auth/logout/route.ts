import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.redirect(new URL("/login", "http://localhost:3000"));

  res.cookies.set("vc_view_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false,
    maxAge: 0,
  });

  return res;
}
