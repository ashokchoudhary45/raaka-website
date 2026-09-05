"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function AlluArjunPage() {
  const [birthdayTime, setBirthdayTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateBirthdayCountdown = () => {
      const now = new Date();

      const birthday = new Date(
        "2027-04-08T00:00:00+05:30"
      );

      const difference = Math.max(
        0,
        birthday.getTime() - now.getTime()
      );

      setBirthdayTime({
        days: Math.floor(
          difference / (1000 * 60 * 60 * 24)
        ),
        hours: Math.floor(
          (difference / (1000 * 60 * 60)) % 24
        ),
        minutes: Math.floor(
          (difference / (1000 * 60)) % 60
        ),
        seconds: Math.floor(
          (difference / 1000) % 60
        ),
      });
    };

    updateBirthdayCountdown();

    const timer = setInterval(
      updateBirthdayCountdown,
      1000
    );

    return () => clearInterval(timer);
  }, []);

  const movies = [
    { year: "2003", title: "Gangotri", image: "movie1.jpg" },
    { year: "2004", title: "Arya", image: "movie2.jpg" },
    { year: "2005", title: "Bunny", image: "movie3.jpg" },
    { year: "2006", title: "Happy", image: "movie41.jpg" },
    { year: "2007", title: "Desamuduru", image: "movie5.jpg" },
    { year: "2008", title: "Parugu", image: "movie6.jpg" },
    { year: "2009", title: "Arya 2", image: "movie7.jpg" },
    { year: "2010", title: "Varudu", image: "movie8.jpg" },
    { year: "2010", title: "Vedam", image: "movie9.jpg" },
    { year: "2011", title: "Badrinath", image: "movie10.jpg" },
    { year: "2012", title: "Julayi", image: "movie111.jpg" },
    {
      year: "2013",
      title: "Iddarammayilatho",
      image: "movie12.jpg",
    },
    {
      year: "2014",
      title: "Race Gurram",
      image: "movie13.jpg",
    },
    {
      year: "2015",
      title: "S/O Satyamurthy",
      image: "movie14.jpg",
    },
    {
      year: "2015",
      title: "Rudhramadevi",
      image: "movie15.jpg",
    },
    {
      year: "2016",
      title: "Sarrainodu",
      image: "movie16.jpg",
    },
    {
      year: "2017",
      title: "Duvvada Jagannadham",
      image: "movie17.jpg",
    },
    {
      year: "2018",
      title: "Naa Peru Surya, Naa Illu India",
      image: "movie18.jpg",
    },
    {
      year: "2020",
      title: "Ala Vaikunthapurramuloo",
      image: "movie19.jpg",
    },
    {
      year: "2021",
      title: "Pushpa: The Rise",
      image: "movie20.jpg",
    },
    {
      year: "2024",
      title: "Pushpa 2: The Rule",
      image: "movie21.jpg",
    },
    {
      year: "Coming Soon",
      title: "Raaka",
      image: "movie22.jpg",
    },
    {
      year: "Coming Soon",
      title: "AA23",
      image: "movie23.jpg",
    },
  ];

  const cameos = [
    {
      year: "2007",
      title: "Shankar Dada Zindabad",
      image: "cameo1.jpg",
    },
    {
      year: "2014",
      title: "Yevadu",
      image: "cameo3.jpg",
    },
  ];

  const childArtist = [
    {
      year: "1985",
      title: "Vijetha",
      image: "child1.jpg",
    },
    {
      year: "1986",
      title: "Swathi Muthyam",
      image: "child2.jpg",
    },
    {
      year: "2001",
      title: "Daddy",
      image: "child3.jpg",
    },
  ];

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* FULL WEBSITE BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">

        <Image
          src="/images/raakabg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-40 animate-raaka-bg-1"
        />

        <Image
          src="/images/raakabg1.jpg"
          alt=""
          fill
          className="object-cover object-center opacity-0 animate-raaka-bg-2"
        />

        <Image
          src="/images/raakabg2.jpg"
          alt=""
          fill
          className="object-cover object-center opacity-0 animate-raaka-bg-3"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />

      </div>


      {/* PAGE CONTENT */}
      <div className="relative z-10">


      {/* HERO */}
<section className="relative min-h-screen w-full overflow-hidden">

  {/* BACKGROUND FILL */}
  <div className="absolute inset-0 scale-110">
    <Image
      src="/images/actor4.png"
      alt=""
      fill
      priority
      className="object-cover object-center blur-2xl"
    />
  </div>

  <div className="absolute inset-0 bg-black/60" />

  {/* FULL ALLU ARJUN IMAGE - NO CROP */}
  <div className="absolute inset-0 flex items-center justify-center">
    <Image
      src="/images/actor4.png"
      alt="Allu Arjun"
      fill
      priority
      sizes="100vw"
      className="object-contain object-center"
    />
  </div>

  {/* DARK OVERLAY */}
  <div className="absolute inset-0 bg-black/35" />

  {/* LEFT GRADIENT */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent" />

  {/* BOTTOM GRADIENT */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

  {/* CONTENT */}
  <div className="relative z-10 min-h-screen flex items-end">

    <div className="max-w-7xl mx-auto w-full px-6 md:px-10 pb-20">

      <p className="text-xs uppercase tracking-[0.45em] text-amber-100/70 mb-5">
        Icon Star
      </p>

      <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight">
        ALLU
        <br />
        ARJUN
      </h1>

      <p className="mt-6 max-w-xl text-sm md:text-base leading-7 text-zinc-300">
        Indian actor and performer known for his powerful screen
        presence, distinctive style and memorable performances.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">

        <a
          href="#filmography"
          className="px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition"
        >
          Filmography
        </a>

        <a
          href="#birthday"
          className="px-6 py-3 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm text-sm font-semibold hover:bg-white/10 transition"
        >
          Birthday Countdown
        </a>

      </div>

    </div>

  </div>

</section>

        {/* ABOUT */}
        <section className="px-6 md:px-10 py-24">

          <div className="max-w-6xl mx-auto">

            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
              About
            </p>

            <h2 className="text-4xl md:text-5xl font-bold">
              The Journey
            </h2>

            <p className="mt-8 max-w-3xl text-zinc-400 leading-8">
              From his early performances to becoming one of Indian cinema's
              most recognisable stars, Allu Arjun has built a career defined
              by versatility, dance, style and intense performances.
            </p>

          </div>

        </section>


        {/* FILMOGRAPHY */}
        <section
          id="filmography"
          className="px-6 md:px-10 py-24 border-t border-white/10"
        >

          <div className="max-w-6xl mx-auto">

            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
              Career
            </p>

            <h2 className="text-4xl md:text-5xl font-bold">
              Filmography
            </h2>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">

              {movies.map((movie) => (
                <div
                  key={`${movie.year}-${movie.title}`}
                  className="group"
                >

                  <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                    <Image
                      src={`/images/${movie.image}`}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {movie.year === "Coming Soon" && (
                      <div className="absolute top-3 left-3 rounded-full border border-amber-100/30 bg-black/70 backdrop-blur-md px-3 py-1">

                        <span className="text-[9px] uppercase tracking-[0.2em] text-amber-100/80">
                          Coming Soon
                        </span>

                      </div>
                    )}

                  </div>

                  <p className="mt-4 text-xs uppercase tracking-[0.25em] text-zinc-500">
                    {movie.year}
                  </p>

                  <h3 className="mt-2 text-lg md:text-xl font-semibold leading-tight">
                    {movie.title}
                  </h3>

                </div>
              ))}

            </div>

          </div>

        </section>


        {/* CAMEO / GUEST APPEARANCES */}
        <section className="px-6 md:px-10 py-24 border-t border-white/10">

          <div className="max-w-6xl mx-auto">

            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
              Special Appearances
            </p>

            <h2 className="text-4xl md:text-5xl font-bold">
              Cameo & Guest Appearances
            </h2>

            <p className="mt-5 max-w-2xl text-zinc-500 leading-7">
              Special appearances and cameo roles across Allu Arjun's career.
            </p>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">

              {cameos.map((movie) => (
                <div
                  key={movie.title}
                  className="group"
                >

                  <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                    <Image
                      src={`/images/${movie.image}`}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-3 left-3 rounded-full border border-white/20 bg-black/70 backdrop-blur-md px-3 py-1">

                      <span className="text-[9px] uppercase tracking-[0.2em] text-white/70">
                        Cameo
                      </span>

                    </div>

                  </div>

                  <p className="mt-4 text-xs uppercase tracking-[0.25em] text-zinc-500">
                    {movie.year}
                  </p>

                  <h3 className="mt-2 text-lg md:text-xl font-semibold leading-tight">
                    {movie.title}
                  </h3>

                </div>
              ))}

            </div>

          </div>

        </section>


        {/* CHILD ARTIST */}
        <section className="px-6 md:px-10 py-24 border-t border-white/10">

          <div className="max-w-6xl mx-auto">

            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
              Early Appearance
            </p>

            <h2 className="text-4xl md:text-5xl font-bold">
              As Child Artist
            </h2>

            <p className="mt-5 max-w-2xl text-zinc-500 leading-7">
              Early screen appearances from Allu Arjun's childhood.
            </p>

            <div className="mt-12 space-y-3">

              {childArtist.map((movie) => (
                <div
                  key={movie.title}
                  className="group flex items-center justify-between gap-6 border-b border-white/10 py-5 hover:border-white/25 transition"
                >

                  <div className="flex items-center gap-6">

                    <span className="text-sm md:text-base font-medium text-zinc-500 w-16">
                      {movie.year}
                    </span>

                    <h3 className="text-lg md:text-2xl font-semibold group-hover:text-amber-100 transition">
                      {movie.title}
                    </h3>

                  </div>

                  <span className="text-[9px] md:text-xs uppercase tracking-[0.25em] text-zinc-600">
                    Child Artist
                  </span>

                </div>
              ))}

            </div>

          </div>

        </section>


        {/* BIRTHDAY COUNTDOWN */}
        <section
          id="birthday"
          className="px-6 md:px-10 py-24 border-t border-white/10"
        >

          <div className="max-w-6xl mx-auto">

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 md:p-20 text-center">

              <p className="text-xs uppercase tracking-[0.45em] text-amber-100/60">
                The Celebration Begins
              </p>

              <h2 className="mt-5 text-5xl md:text-7xl font-black">
                45TH BIRTHDAY
              </h2>

              <p className="mt-4 text-sm md:text-lg uppercase tracking-[0.3em] text-amber-50/90">
                8 April 2027
              </p>

              <p className="mt-6 text-zinc-400">
                The celebration of the Icon Star.
              </p>

              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">

                {/* DAYS */}
                <div className="border border-white/10 bg-black/30 rounded-2xl p-6">

                  <p className="text-3xl md:text-5xl font-black tabular-nums">
                    {String(birthdayTime.days).padStart(3, "0")}
                  </p>

                  <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                    Days
                  </p>

                </div>


                {/* HOURS */}
                <div className="border border-white/10 bg-black/30 rounded-2xl p-6">

                  <p className="text-3xl md:text-5xl font-black tabular-nums">
                    {String(birthdayTime.hours).padStart(2, "0")}
                  </p>

                  <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                    Hours
                  </p>

                </div>


                {/* MINUTES */}
                <div className="border border-white/10 bg-black/30 rounded-2xl p-6">

                  <p className="text-3xl md:text-5xl font-black tabular-nums">
                    {String(birthdayTime.minutes).padStart(2, "0")}
                  </p>

                  <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                    Minutes
                  </p>

                </div>


                {/* SECONDS */}
                <div className="border border-white/10 bg-black/30 rounded-2xl p-6">

                  <p className="text-3xl md:text-5xl font-black tabular-nums">
                    {String(birthdayTime.seconds).padStart(2, "0")}
                  </p>

                  <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                    Seconds
                  </p>

                </div>

              </div>

              <p className="mt-12 text-[10px] md:text-sm uppercase tracking-[0.4em] text-amber-100/60">
                The Icon Star Turns 45
              </p>

            </div>

          </div>

        </section>


        {/* SOCIAL MEDIA */}
        <section className="px-6 md:px-10 py-24 border-t border-white/10">

          <div className="max-w-6xl mx-auto">

            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
              Connect
            </p>

            <h2 className="text-4xl md:text-5xl font-bold">
              Social Media
            </h2>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-5">

              <a
                href="https://www.instagram.com/alluarjunonline/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition"
              >

                <p className="text-lg font-semibold">
                  Instagram
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Follow
                </p>

              </a>


              <a
                href="https://www.facebook.com/AlluArjun"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition"
              >

                <p className="text-lg font-semibold">
                  Facebook
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Follow
                </p>

              </a>


              <a
                href="https://x.com/alluarjun"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition"
              >

                <p className="text-lg font-semibold">
                  X
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Follow
                </p>

              </a>


              <a
                href="https://www.youtube.com/@alluarjun"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition"
              >

                <p className="text-lg font-semibold">
                  YouTube
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Watch
                </p>

              </a>

            </div>

          </div>

        </section>


        {/* BACK TO RAAKA */}
        <section className="px-6 py-20 text-center border-t border-white/10">

          <a
            href="/"
            className="inline-flex px-7 py-3 rounded-full border border-white/20 hover:bg-white/10 transition text-sm font-semibold"
          >
            ← Back to Raaka
          </a>

        </section>

      </div>

    </main>
  );
}