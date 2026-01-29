import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.redirect(new URL("/overview", "http://localhost:3000"));

  //Mock session cookie (httpOnly so JS can't read it)
  res.cookies.set("vc_view_session", "mock-session", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false, //set true in production with https
    maxAge: 60 * 60 * 8,
  });

  return res;
}