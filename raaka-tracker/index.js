import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function trackInterest() {
  console.log("Fetching BookMyShow page...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  try {
    // Yahan Raaka movie ka BookMyShow link dalein
    await page.goto('https://in.bookmyshow.com/', { waitUntil: 'networkidle2' });

    // Page ka text content ya target element extract karein
    const bodyText = await page.evaluate(() => document.body.innerText);
    await browser.close();

    // Gemini API se exact interest count nikalwayein
    console.log("Extracting count using Gemini...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: Extract only the numerical interest count (e.g., likes or people interested) for the movie Raaka from this text. Return ONLY the number, nothing else: ${bodyText},
    });

    const interestCount = parseInt(response.text.trim(), 10);

    if (isNaN(interestCount)) {
      console.error("Could not parse interest count.");
      return;
    }

    // Supabase me data insert karein
    const { data, error } = await supabase
      .from('raaka_interests')
      * // Aaj ki date aur count save karein
      .insert([{ interest_count: interestCount }]);

    if (error) console.error("Supabase Error:", error);
    else console.log("Successfully saved interest count:", interestCount);

  } catch (err) {
    console.error("Error:", err);
    await browser.close();
  }
}

trackInterest();