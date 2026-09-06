import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const supabase = getSupabase();

    // 1. Pehle ensure karo ki aaj ki entry ban jaye
    await supabase.rpc("ensure_bookmyshow_interest_day");

    // 2. Yahan tum BookMyShow se data fetch karne ka logic likh sakte ho 
    // (Abhi ke liye yeh ensure function ko trigger kar dega)

    return NextResponse.json({ 
      success: true, 
      message: "Tracker successfully checked/updated for today!" 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}