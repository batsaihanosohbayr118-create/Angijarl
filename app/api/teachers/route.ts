import { NextResponse } from "next/server";
import { listTeachers } from "../../../lib/angijralDb";

export async function GET() {
  const teachers = await listTeachers();
  return NextResponse.json({ teachers });
}
