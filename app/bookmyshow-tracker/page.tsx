"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type InterestRow = {
  id: number;
  day_number: number;
  record_date: string;
  interest: number | null;
  increase: number | null;
};

type TicketRow = {
  id: number;
  day_number: number;
  record_date: string;
  tickets_sold: number | null;
  increase: number | null;
};

type TrackerConfig = {
  interest_start_date: string;
  booking_start_date: string | null;
  release_date: string | null;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";

  const d = new Date(dateStr + "T00:00:00");

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const number = (value: number | null | undefined) =>
  value == null ? "—" : value.toLocaleString("en-IN");

const interestValue = (value: number | null | undefined) =>
  value == null ? "—" : value.toLocaleString("en-IN");

function daysBetween(start: string, end: string) {
  const a = new Date(start + "T00:00:00").getTime();
  const b = new Date(end + "T00:00:00").getTime();

  return Math.max(1, Math.floor((b - a) / 86400000) + 1);
}

function Sparkline({
  values,
  label,
}: {
  values: number[];
  label: string;
}) {
  if (!values.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025]">
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/25">
            {label}
          </p>

          <p className="mt-3 text-sm text-white/40">
            Data will appear automatically
          </p>
        </div>
      </div>
    );
  }

  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);

  const points = values
    .map((value, index) => {
      const x =
        values.length === 1
          ? 0
          : (index / (values.length - 1)) * 100;

      const y = 92 - ((value - min) / range) * 72;

      return x + "," + y;
    })
    .join(" ");

  return (
    <div className="relative h-64 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-5">
      <div className="absolute inset-x-5 top-5 flex justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-white/25">
        <span>History</span>
        <span>Live</span>
      </div>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-x-5 bottom-7 top-14 h-[170px] w-[calc(100%-2.5rem)]"
      >
        <defs>
          <linearGradient
            id={"fill-" + label}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="white"
              stopOpacity="0.16"
            />

            <stop
              offset="100%"
              stopColor="white"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <polyline
          points={"0,100 " + points + " 100,100"}
          fill={"url(#fill-" + label + ")"}
          stroke="none"
        />

        <polyline
          points={points}
          fill="none"
          stroke="white"
          strokeOpacity="0.75"
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="absolute bottom-4 left-5 right-5 flex justify-between font-mono text-[8px] uppercase tracking-[0.18em] text-white/20">
        <span>Day 1</span>
        <span>Day {values.length}</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-md">
      <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/35">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-white/35">
        {sub}
      </p>
    </div>
  );
}

export default function BookMyShowTrackerPage() {
  const supabase = getSupabase();

  const [config, setConfig] = useState<TrackerConfig | null>(null);
  const [interestRows, setInterestRows] = useState<InterestRow[]>([]);
  const [ticketRows, setTicketRows] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState("--");

  const today = new Date().toISOString().slice(0, 10);

  async function loadTracker() {
    setLoading(true);

    /*
     * IMPORTANT:
     * Do NOT call ensure_bookmyshow_interest_day() here.
     *
     * This function only READS existing records.
     * New interest days are created by the 12:00 AM IST cron job.
     */

    const [
      { data: configData },
      { data: interestData },
      { data: ticketData },
    ] = await Promise.all([
      supabase
        .from("bookmyshow_tracker_config")
        .select("*")
        .eq("id", 1)
        .maybeSingle(),

      supabase
        .from("bookmyshow_interest_daily")
        .select(
          "id,day_number,record_date,interest,increase",
        )
        .order("day_number", {
          ascending: true,
        }),

      supabase
        .from("bookmyshow_ticket_daily")
        .select(
          "id,day_number,record_date,tickets_sold,increase",
        )
        .order("day_number", {
          ascending: true,
        }),
    ]);

    setConfig(configData ?? null);

    setInterestRows(
      (interestData ?? []) as InterestRow[],
    );

    setTicketRows(
      (ticketData ?? []) as TicketRow[],
    );

    setLastRefresh(
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );

    setLoading(false);
  }

  useEffect(() => {
    loadTracker();

    /*
     * Refresh existing data every hour.
     *
     * This DOES NOT create a new day.
     * It only reads the latest records from Supabase.
     */
    const timer = window.setInterval(
      loadTracker,
      60 * 60 * 1000,
    );

    return () => window.clearInterval(timer);
  }, []);

  const interestDays = useMemo(() => {
    if (!config) return 0;

    const end =
      config.release_date &&
      config.release_date < today
        ? config.release_date
        : today;

    return daysBetween(
      config.interest_start_date,
      end,
    );
  }, [config, today]);

  const bookingDays = useMemo(() => {
    if (!config?.booking_start_date) return 0;

    const end =
      config.release_date &&
      config.release_date < today
        ? config.release_date
        : today;

    return daysBetween(
      config.booking_start_date,
      end,
    );
  }, [config, today]);

  const currentInterest =
    interestRows.at(-1)?.interest ?? null;

  const previousInterest =
    interestRows.length > 1
      ? interestRows[interestRows.length - 2].interest
      : null;

  const interestIncrease =
    currentInterest != null &&
    previousInterest != null
      ? currentInterest - previousInterest
      : null;

  const currentTickets =
    ticketRows.at(-1)?.tickets_sold ?? null;

  const previousTickets =
    ticketRows.length > 1
      ? ticketRows[ticketRows.length - 2].tickets_sold
      : null;

  const ticketIncrease =
    currentTickets != null &&
    previousTickets != null
      ? currentTickets - previousTickets
      : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_34%),radial-gradient(circle_at_0%_70%,rgba(255,255,255,0.04),transparent_28%)]" />

      {/* HERO */}
      <header className="relative mx-auto max-w-7xl px-5 pb-14 pt-8 md:px-10 md:pt-12">
        <Link
          href="/"
          className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/45 transition hover:border-white/25 hover:text-white"
        >
          ← Back to RAAKA
        </Link>

        <div className="mt-20 max-w-5xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-white/35">
            RAAKA • BOOKMYSHOW DATA CENTER
          </p>

          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.045em] md:text-8xl">
            BookMyShow
            <br />

            <span className="text-white/30">
              Tracker.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/45 md:text-base">
            A cinematic day-by-day archive for audience
            interest and live ticket activity. Interest starts
            from today. Ticket Day 1 starts only when booking
            officially begins.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Interest Day"
            value={
              config
                ? "Day " + interestDays
                : "—"
            }
            sub="Automatic daily counter"
          />

          <StatCard
            label="Current Interest"
            value={interestValue(currentInterest)}
            sub={
              interestIncrease == null
                ? "Waiting for data"
                : "+" +
                  number(interestIncrease) +
                  " today"
            }
          />

          <StatCard
            label="Booking Day"
            value={
              config?.booking_start_date
                ? "Day " + bookingDays
                : "—"
            }
            sub={
              config?.booking_start_date
                ? "Booking is active"
                : "Booking not started"
            }
          />

          <StatCard
            label="Tickets Sold"
            value={number(currentTickets)}
            sub={
              ticketIncrease == null
                ? "Waiting for booking data"
                : "+" +
                  number(ticketIncrease) +
                  " today"
            }
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">
          <span className="rounded-full border border-white/10 px-3 py-2">
            Auto daily record
          </span>

          <span className="rounded-full border border-white/10 px-3 py-2">
            Release-aware
          </span>

          <span className="rounded-full border border-white/10 px-3 py-2">
            Last refresh {lastRefresh}
          </span>
        </div>
      </header>

      {/* INTEREST SECTION */}
      <section className="relative mx-auto max-w-7xl px-5 py-12 md:px-10">
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/25">
              01 / Audience Demand
            </p>

            <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
              BookMyShow Interest
            </h2>
          </div>

          <span className="hidden rounded-full border border-white/10 px-3 py-2 font-mono text-[8px] uppercase tracking-[0.2em] text-white/30 sm:block">
            Updates every 24H
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <Sparkline
            label="Interest"
            values={interestRows
              .map((row) => row.interest)
              .filter(
                (value): value is number =>
                  value != null,
              )}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <StatCard
              label="Daily Increase"
              value={
                interestIncrease == null
                  ? "—"
                  : "+" +
                    number(interestIncrease)
              }
              sub="Compared with previous day"
            />

            <StatCard
              label="Tracking Started"
              value={
                config
                  ? formatDate(
                      config.interest_start_date,
                    )
                  : "—"
              }
              sub="Day 1 is generated from start date"
            />
          </div>
        </div>

        {/* INTEREST TABLE */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <div className="border-b border-white/10 px-5 py-4 md:px-7">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                Daily Interest Archive
              </p>

              <p className="font-mono text-[9px] text-white/20">
                {interestRows.length} records
              </p>
            </div>
          </div>

          <div className="max-h-[620px] overflow-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="sticky top-0 bg-[#090909]/95 backdrop-blur-md">
                <tr className="border-b border-white/10 font-mono text-[8px] uppercase tracking-[0.2em] text-white/25">
                  <th className="px-5 py-4 md:px-7">
                    Day
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right">
                    Interest Count
                  </th>

                  <th className="px-5 py-4 text-right">
                    Daily Increase
                  </th>
                </tr>
              </thead>

              <tbody>
                {interestRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-16 text-center text-sm text-white/30"
                    >
                      No interest records found.
                    </td>
                  </tr>
                )}

                {interestRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.06] transition hover:bg-white/[0.035]"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-white/60 md:px-7">
                      {String(
                        row.day_number,
                      ).padStart(2, "0")}
                    </td>

                    <td className="px-5 py-4 text-sm text-white/55">
                      {formatDate(
                        row.record_date,
                      )}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-white">
                      {number(row.interest)}
                    </td>

                    <td className="px-5 py-4 text-right font-mono text-xs text-white/45">
                      {row.increase == null
                        ? "—"
                        : "+" +
                          number(row.increase)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TICKET SECTION */}
      <section className="relative mx-auto max-w-7xl px-5 py-12 md:px-10">
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/25">
              02 / Ticket Sales
            </p>

            <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
              Ticket Booking Archive
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <Sparkline
            label="Tickets"
            values={ticketRows
              .map(
                (row) => row.tickets_sold,
              )
              .filter(
                (value): value is number =>
                  value != null,
              )}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <StatCard
              label="Daily Increase"
              value={
                ticketIncrease == null
                  ? "—"
                  : "+" +
                    number(ticketIncrease)
              }
              sub="Compared with previous day"
            />

            <StatCard
              label="Booking Started"
              value={
                config?.booking_start_date
                  ? formatDate(
                      config.booking_start_date,
                    )
                  : "—"
              }
              sub={
                config?.booking_start_date
                  ? "Day 1 → Day " +
                    bookingDays
                  : "Waiting for booking"
              }
            />
          </div>
        </div>

        {/* TICKET TABLE */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <div className="border-b border-white/10 px-5 py-4 md:px-7">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                Ticket Booking Archive
              </p>

              <p className="font-mono text-[9px] text-white/20">
                {ticketRows.length} days
              </p>
            </div>
          </div>

          <div className="max-h-[620px] overflow-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="sticky top-0 bg-[#090909]/95 backdrop-blur-md">
                <tr className="border-b border-white/10 font-mono text-[8px] uppercase tracking-[0.2em] text-white/25">
                  <th className="px-5 py-4 md:px-7">
                    Day
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right">
                    Tickets Sold
                  </th>

                  <th className="px-5 py-4 text-right">
                    Daily Increase
                  </th>
                </tr>
              </thead>

              <tbody>
                {ticketRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-16 text-center text-sm text-white/30"
                    >
                      Booking has not started.
                      Ticket Day 1 will appear
                      automatically.
                    </td>
                  </tr>
                )}

                {ticketRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.06] transition hover:bg-white/[0.035]"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-white/60 md:px-7">
                      {String(
                        row.day_number,
                      ).padStart(2, "0")}
                    </td>

                    <td className="px-5 py-4 text-sm text-white/55">
                      {formatDate(
                        row.record_date,
                      )}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-white">
                      {number(
                        row.tickets_sold,
                      )}
                    </td>

                    <td className="px-5 py-4 text-right font-mono text-xs text-white/45">
                      {row.increase == null
                        ? "—"
                        : "+" +
                          number(row.increase)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TRACKING PROTOCOL */}
      <section className="relative mx-auto max-w-7xl px-5 pb-24 pt-12 md:px-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 md:p-10">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/25">
                Tracking Protocol
              </p>

              <h3 className="mt-4 text-2xl font-semibold">
                Built for the full RAAKA run.
              </h3>
            </div>

            <div className="space-y-5 text-sm leading-6 text-white/40">
              <p>
                <strong className="text-white/70">
                  Interest:
                </strong>{" "}
                starts from the tracker start date
                and creates one daily record.
              </p>

              <p>
                <strong className="text-white/70">
                  Tickets:
                </strong>{" "}
                remain inactive until the first
                official booking snapshot is recorded.
              </p>
            </div>

            <div className="space-y-5 text-sm leading-6 text-white/40">
              <p>
                <strong className="text-white/70">
                  Increase:
                </strong>{" "}
                is always calculated against the
                previous daily value.
              </p>

              <p>
                <strong className="text-white/70">
                  Release:
                </strong>{" "}
                once a release date is configured,
                daily generation stops after that
                date.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-[8px] uppercase tracking-[0.22em] text-white/20">
          Figures are displayed only when an
          authorized/public data source is connected.
          This page does not invent BookMyShow numbers.
        </p>
      </section>
    </main>
  );
}