import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import fs from "fs/promises";

const BOOKMYSHOW_URL =
  "https://in.bookmyshow.com/movies/mumbai/raaka-telugu/ET00494565";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ============================================================
// INTEREST COUNT PARSER
// ============================================================

function parseInterestCount(text) {
  if (!text) {
    return null;
  }

  /*
    Supported examples:

    18.2K+ are interested
    18.2K are interested
    18,200 are interested
    18200 are interested
    1.2M+ are interested
    2B+ are interested
  */

  const match = text.match(
    /([\d,]+(?:\.\d+)?)\s*(K|M|B)?\+?\s*are\s+interested/i
  );

  if (!match) {
    return null;
  }

  const numberPart = match[1].replace(/,/g, "");
  const value = Number.parseFloat(numberPart);

  if (!Number.isFinite(value)) {
    return null;
  }

  const unit = (match[2] || "").toUpperCase();

  if (unit === "K") {
    return Math.round(value * 1000);
  }

  if (unit === "M") {
    return Math.round(value * 1000000);
  }

  if (unit === "B") {
    return Math.round(value * 1000000000);
  }

  return Math.round(value);
}

// ============================================================
// READ BOOKMYSHOW INTEREST
// ============================================================

async function getBookMyShowInterest(page) {
  console.log("Waiting for BookMyShow content...");

  const interestPattern =
    /([\d,]+(?:\.\d+)?)\s*(K|M|B)?\+?\s*are\s+interested/i;

  // ----------------------------------------------------------
  // Capture BookMyShow API/JSON responses
  // ----------------------------------------------------------

  const apiCandidates = [];

  const responseHandler = async (response) => {
    try {
      const url = response.url();

      if (!url.includes("bookmyshow.com")) {
        return;
      }

      const isApi =
        /\/api\//i.test(url) ||
        /sa-in\.bookmyshow\.com/i.test(url);

      if (!isApi) {
        return;
      }

      const contentType =
        response.headers()["content-type"] || "";

      if (!/json|javascript|text/i.test(contentType)) {
        return;
      }

      const body = await response.text();

      if (!body || body.length > 1500000) {
        return;
      }

      if (
        /are\s+interested|interest(?:ed|Count|_count|CountValue)/i.test(
          body
        )
      ) {
        apiCandidates.push({
          url,
          body,
        });
      }
    } catch {
      // Some responses cannot be read after navigation.
    }
  };

  page.on("response", responseHandler);

  // ----------------------------------------------------------
  // Wait for interest widget
  // ----------------------------------------------------------

  try {
    await page.waitForFunction(
      function () {
        const bodyText =
          document.body?.innerText || "";

        return /are\s+interested/i.test(bodyText);
      },
      {
        timeout: 45000,
      }
    );

    console.log(
      "Interest information found on page."
    );
  } catch {
    console.log(
      "Interest text was not detected within 45 seconds."
    );
  }

  // Give BookMyShow dynamic components time to finish.
  await new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });

  // ----------------------------------------------------------
  // 1. Target the actual visible interest widget
  // ----------------------------------------------------------

  const visibleText = await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll("span, div")
    );

    const hit = nodes.find((node) => {
      const text =
        (node.textContent || "")
          .replace(/\s+/g, " ")
          .trim();

      return /^\d[\d,.]*(?:\.\d+)?\s*(?:K|M|B)?\+?\s+are\s+interested$/i.test(
        text
      );
    });

    return (
      hit?.textContent
        ?.replace(/\s+/g, " ")
        .trim() || ""
    );
  });

  if (visibleText) {
    const count = parseInterestCount(
      visibleText
    );

    if (count !== null) {
      console.log(
        "BookMyShow visible counter:",
        visibleText
      );

      return {
        rawText: visibleText,
        count,
      };
    }
  }

  // ----------------------------------------------------------
  // 2. Fallback to complete body text
  // ----------------------------------------------------------

  const bodyText = await page.evaluate(() => {
    return document.body?.innerText || "";
  });

  const bodyMatch =
    bodyText.match(interestPattern);

  if (bodyMatch) {
    const rawText = bodyMatch[0]
      .replace(/\s+/g, " ")
      .trim();

    const count =
      parseInterestCount(rawText);

    if (count !== null) {
      console.log(
        "BookMyShow body counter:",
        rawText
      );

      return {
        rawText,
        count,
      };
    }
  }

  // ----------------------------------------------------------
  // 3. Try captured API/JSON responses
  // ----------------------------------------------------------

  for (const candidate of apiCandidates) {
    const match =
      candidate.body.match(interestPattern);

    if (!match) {
      continue;
    }

    const rawText = match[0]
      .replace(/\s+/g, " ")
      .trim();

    const count =
      parseInterestCount(rawText);

    if (count !== null) {
      console.log(
        "BookMyShow API counter:",
        rawText
      );

      return {
        rawText,
        count,
      };
    }
  }

  // ----------------------------------------------------------
  // 4. Debug files
  // ----------------------------------------------------------

  try {
    await fs.writeFile(
      "raaka_bms_debug.txt",
      bodyText,
      "utf8"
    );

    if (apiCandidates.length) {
      await fs.writeFile(
        "raaka_bms_api_debug.txt",
        apiCandidates
          .map(
            (item) =>
              `URL: ${item.url}\n\n${item.body}`
          )
          .join(
            "\n\n==============================\n\n"
          ),
        "utf8"
      );
    }

    console.log(
      "Debug files saved."
    );
  } catch (error) {
    console.log(
      "Could not save debug files:",
      error.message
    );
  }

  return {
    rawText: null,
    count: null,
  };
}

// ============================================================
// ENSURE TODAY'S DAILY RECORD
// ============================================================

async function ensureTodayDailyRecord() {
  console.log("");

  console.log(
    "Ensuring today's daily record exists..."
  );

  const { error } =
    await supabase.rpc(
      "ensure_bookmyshow_interest_day"
    );

  if (error) {
    throw new Error(
      "Could not ensure today's daily record: " +
        error.message
    );
  }

  console.log(
    "Daily record check completed."
  );
}

// ============================================================
// GET LATEST DAILY RECORDS
// ============================================================

async function getDailyRecords() {
  const { data, error } =
    await supabase
      .from("bookmyshow_interest_daily")
      .select("*")
      .order("day_number", {
        ascending: false,
      })
      .limit(2);

  if (error) {
    throw new Error(
      "Supabase records error: " +
        error.message
    );
  }

  return data || [];
}

// ============================================================
// SAVE INTEREST COUNT
// ============================================================

async function saveInterestCount(
  latestRow,
  previousRow,
  interestCount
) {
  let increase = 0;

  if (previousRow) {
    const previousInterest =
      Number(
        previousRow.interest || 0
      );

    increase =
      interestCount -
      previousInterest;

    // Never show negative increase.
    if (increase < 0) {
      increase = 0;
    }
  }

  const { data, error } =
    await supabase.rpc(
      "update_bookmyshow_interest_day",
      {
        p_id: latestRow.id,
        p_interest: interestCount,
        p_increase: increase,
      }
    );

  if (error) {
    throw new Error(
      "Supabase update RPC error: " +
        error.message
    );
  }

  if (
    !data ||
    data.success !== true
  ) {
    throw new Error(
      "Supabase update was not confirmed."
    );
  }

  console.log(
    "Supabase confirmed update:",
    data
  );

  return increase;
}

// ============================================================
// MAIN TRACKER
// ============================================================

async function trackInterest() {
  let browser = null;

  try {
    console.log("");
    console.log(
      "========================================"
    );

    console.log(
      "RAAKA BOOKMYSHOW INTEREST TRACKER"
    );

    console.log(
      "========================================"
    );

    console.log("");

    // --------------------------------------------------------
    // Environment variables
    // --------------------------------------------------------

    if (!process.env.SUPABASE_URL) {
      throw new Error(
        "SUPABASE_URL is missing from .env"
      );
    }

    if (!process.env.SUPABASE_KEY) {
      throw new Error(
        "SUPABASE_KEY is missing from .env"
      );
    }

    // --------------------------------------------------------
    // IMPORTANT:
    // Open BookMyShow FIRST.
    //
    // Today's DB row will only be created after a valid
    // interest value is extracted.
    // --------------------------------------------------------

    console.log("");
    console.log(
      "Opening BookMyShow Mumbai page..."
    );

    console.log(
      BOOKMYSHOW_URL
    );

    console.log("");

    browser =
      await puppeteer.launch({
        headless: true,

        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      });

    const page =
      await browser.newPage();

    // --------------------------------------------------------
    // Browser settings
    // --------------------------------------------------------

    await page.setViewport({
      width: 1366,
      height: 900,
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/131.0.0.0 Safari/537.36"
    );

    // --------------------------------------------------------
    // Open BookMyShow
    // --------------------------------------------------------

    await page.goto(
      BOOKMYSHOW_URL,
      {
        waitUntil: "networkidle2",
        timeout: 60000,
      }
    );

    console.log(
      "BookMyShow page loaded."
    );

    // --------------------------------------------------------
    // Extract interest
    // --------------------------------------------------------

    const result =
      await getBookMyShowInterest(
        page
      );

    console.log("");

    console.log(
      "========== BOOKMYSHOW RESULT =========="
    );

    // --------------------------------------------------------
    // If interest wasn't found
    // --------------------------------------------------------

    if (!result.rawText) {
      console.log(
        "Interest count was NOT found."
      );

      console.log("");

      console.log(
        "IMPORTANT: Nothing will be saved."
      );

      console.log(
        "This prevents a failed scrape from becoming 0."
      );

      return;
    }

    // --------------------------------------------------------
    // Show raw BookMyShow text
    // --------------------------------------------------------

    console.log(
      "Interest text:",
      result.rawText
    );

    // --------------------------------------------------------
    // Validate number
    // --------------------------------------------------------

    if (
      result.count === null ||
      !Number.isFinite(result.count)
    ) {
      console.log("");

      console.log(
        "Could not convert interest count."
      );

      console.log(
        "Nothing will be saved."
      );

      return;
    }

    console.log("");

    console.log(
      "Extracted interest count:",
      result.count
    );

    // --------------------------------------------------------
    // NEVER save 0 from failed extraction
    // --------------------------------------------------------

    if (result.count <= 0) {
      console.log("");

      console.log(
        "Fetched interest count is 0."
      );

      console.log(
        "Nothing will be written to Supabase."
      );

      return;
    }

    // --------------------------------------------------------
    // NOW create today's row.
    // --------------------------------------------------------

    await ensureTodayDailyRecord();

    console.log(
      "========================================"
    );

    console.log("");

    // --------------------------------------------------------
    // Get daily records
    // --------------------------------------------------------

    console.log(
      "Getting daily records from Supabase..."
    );

    const records =
      await getDailyRecords();

    if (
      !records ||
      records.length === 0
    ) {
      throw new Error(
        "No daily records found after ensuring today's record."
      );
    }

    // --------------------------------------------------------
    // Latest + previous day
    // --------------------------------------------------------

    const latestRow =
      records[0];

    const previousRow =
      records.length > 1
        ? records[1]
        : null;

    console.log("");

    console.log(
      "Latest Day:",
      latestRow.day_number
    );

    console.log(
      "Latest Date:",
      latestRow.record_date
    );

    console.log(
      "Previous interest:",
      previousRow
        ? previousRow.interest
        : "None"
    );

    console.log(
      "Current interest:",
      result.count
    );

    // --------------------------------------------------------
    // Save
    // --------------------------------------------------------

    const increase =
      await saveInterestCount(
        latestRow,
        previousRow,
        result.count
      );

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "SUCCESS"
    );

    console.log(
      "========================================"
    );

    console.log("");

    console.log(
      "Day:",
      latestRow.day_number
    );

    console.log(
      "Date:",
      latestRow.record_date
    );

    console.log(
      "Interest:",
      result.count
    );

    console.log(
      "Increase:",
      increase
    );

    console.log(
      "BookMyShow:",
      result.rawText
    );

    console.log("");

    console.log(
      "NOTE: BookMyShow currently exposes the public counter in rounded form, e.g. 18.2K+."
    );

    console.log(
      "The stored value represents the displayed BookMyShow counter."
    );

    console.log("");

    console.log(
      "========================================"
    );

    console.log("");
  } catch (error) {
    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "TRACKER ERROR"
    );

    console.log(
      "========================================"
    );

    if (
      error &&
      error.message
    ) {
      console.error(
        error.message
      );
    } else {
      console.error(
        error
      );
    }

    console.log(
      "========================================"
    );

    console.log("");
  } finally {
    if (browser) {
      await browser.close();

      console.log(
        "Chrome closed."
      );
    }
  }
}

// ============================================================
// START
// ============================================================

trackInterest();