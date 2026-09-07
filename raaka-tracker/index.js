import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const BOOKMYSHOW_URL =
  "https://in.bookmyshow.com/movies/mumbai/raaka-telugu/ET00494565";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function parseInterestCount(text) {
  if (!text) {
    return null;
  }

  const match = text.match(
    /([\d,.]+)\s*(K|M)?\+?\s*are interested/i
  );

  if (!match) {
    return null;
  }

  const numberPart = match[1].replace(/,/g, "");
  const value = parseFloat(numberPart);

  if (isNaN(value)) {
    return null;
  }

  const unit = match[2];

  if (unit && unit.toUpperCase() === "K") {
    return Math.round(value * 1000);
  }

  if (unit && unit.toUpperCase() === "M") {
    return Math.round(value * 1000000);
  }

  return Math.round(value);
}

async function getBookMyShowInterest(page) {
  console.log("Waiting for BookMyShow content...");

  try {
    await page.waitForFunction(
      function () {
        return document.documentElement.innerHTML.includes(
          "are interested"
        );
      },
      {
        timeout: 30000
      }
    );

    console.log("Interest information found on page.");
  } catch (error) {
    console.log(
      "Interest text was not detected within 30 seconds."
    );
  }

  await new Promise(function (resolve) {
    setTimeout(resolve, 3000);
  });

  const pageHtml = await page.content();

  const match = pageHtml.match(
    /([\d,.]+)\s*(K|M)?\+?\s*are interested/i
  );

  if (!match) {
    return {
      rawText: null,
      count: null
    };
  }

  const rawText = match[0];
  const count = parseInterestCount(rawText);

  return {
    rawText: rawText,
    count: count
  };
}

async function getDailyRecords() {
  const { data, error } = await supabase
    .from("bookmyshow_interest_daily")
    .select("*")
    .order("day_number", {
      ascending: false
    })
    .limit(2);

  if (error) {
    throw new Error(
      "Supabase records error: " + error.message
    );
  }

  return data || [];
}

async function createDailyRecord() {
  console.log("");
  console.log("No daily record found.");
  console.log("Creating a daily record...");

  const { error } = await supabase.rpc(
    "ensure_bookmyshow_interest_day"
  );

  if (error) {
    throw new Error(
      "Could not create daily record: " +
        error.message
    );
  }

  const records = await getDailyRecords();

  if (!records || records.length === 0) {
    throw new Error(
      "Daily record was not created."
    );
  }

  return records;
}

async function saveInterestCount(
  latestRow,
  previousRow,
  interestCount
) {
  let increase = interestCount;

  if (previousRow) {
    const previousInterest = Number(
      previousRow.interest || 0
    );

    increase =
      interestCount - previousInterest;

    if (increase < 0) {
      increase = 0;
    }
  }

  const { error } = await supabase
    .from("bookmyshow_interest_daily")
    .update({
      interest: interestCount,
      increase: increase
    })
    .eq("id", latestRow.id);

  if (error) {
    throw new Error(
      "Supabase update error: " + error.message
    );
  }

  return increase;
}

async function trackInterest() {
  let browser = null;

  try {
    console.log("");
    console.log("========================================");
    console.log("RAAKA BOOKMYSHOW INTEREST TRACKER");
    console.log("========================================");
    console.log("");

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

    console.log(
      "Opening BookMyShow Mumbai page..."
    );

    console.log(BOOKMYSHOW_URL);
    console.log("");

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ]
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1366,
      height: 900
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/131.0.0.0 Safari/537.36"
    );

    await page.goto(BOOKMYSHOW_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    console.log(
      "BookMyShow page loaded."
    );

    const result =
      await getBookMyShowInterest(page);

    console.log("");
    console.log(
      "========== BOOKMYSHOW RESULT =========="
    );

    if (!result.rawText) {
      console.log(
        "Interest count was NOT found."
      );

      console.log("");
      console.log(
        "No value will be saved to Supabase."
      );

      return;
    }

    console.log(
      "Interest text:",
      result.rawText
    );

    if (result.count === null) {
      console.log("");
      console.log(
        "Could not convert interest count."
      );

      return;
    }

    console.log(
      "Extracted interest count:",
      result.count
    );

    console.log(
      "========================================"
    );

    console.log("");
    console.log(
      "Getting daily records from Supabase..."
    );

    let records = await getDailyRecords();

    if (!records || records.length === 0) {
      records =
        await createDailyRecord();
    }

    const latestRow = records[0];
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
      "Previous interest:",
      previousRow
        ? previousRow.interest
        : "None"
    );

    console.log(
      "Current interest:",
      result.count
    );

    const increase =
      await saveInterestCount(
        latestRow,
        previousRow,
        result.count
      );

    console.log("");
    console.log(
      "========================================"
    );
    console.log("SUCCESS");
    console.log(
      "========================================"
    );

    console.log(
      "Day:",
      latestRow.day_number
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

    console.log(
      "========================================"
    );

    console.log("");
  } catch (error) {
    console.log("");
    console.log(
      "========================================"
    );
    console.log("TRACKER ERROR");
    console.log(
      "========================================"
    );

    if (error && error.message) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    console.log(
      "========================================"
    );

    console.log("");
  } finally {
    if (browser) {
      await browser.close();
      console.log("Chrome closed.");
    }
  }
}

trackInterest();