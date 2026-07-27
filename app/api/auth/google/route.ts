import { NextResponse } from "next/server";
import { loginGoogleUser } from "../../../../lib/angijralDb";

interface GoogleTokenInfo {
  sub?: string;
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  error?: string;
  error_description?: string;
}

export async function POST(request: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const body = (await request.json()) as { credential?: string };
    const credential = body.credential?.trim();

    if (!clientId) {
      return NextResponse.json({ message: "Google Client ID тохируулагдаагүй байна." }, { status: 500 });
    }

    if (!credential) {
      return NextResponse.json({ message: "Google нэвтрэлтийн токен дутуу байна." }, { status: 400 });
    }

    const tokenInfoResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
      { cache: "no-store" }
    );
    const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfo;

    const emailVerified = tokenInfo.email_verified === true || tokenInfo.email_verified === "true";

    if (!tokenInfoResponse.ok || tokenInfo.aud !== clientId || !emailVerified) {
      return NextResponse.json({ message: "Google бүртгэлийг баталгаажуулж чадсангүй." }, { status: 401 });
    }

    const result = await loginGoogleUser({
      googleSub: tokenInfo.sub ?? "",
      email: tokenInfo.email ?? "",
      name: tokenInfo.name ?? "",
    });

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ message: "Google-ээр нэвтрэх үед алдаа гарлаа." }, { status: 500 });
  }
}
