import { NextResponse } from "next/server";
import { listServices } from "../../../lib/angijralDb";

export async function GET() {
  const services = await listServices();
  return NextResponse.json({ services });
}