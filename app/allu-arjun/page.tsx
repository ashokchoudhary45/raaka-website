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
    { year: "2003", title: "Gangotri", image: "movie1a.jpg" },
    { year: "2004", title: "Arya", image: "movie2.jpg" },
    { year: "2005", title: "Bunny", image: "movie3.jpg" },
    { year: "2006", title: "Happy", image: "movie41.jpg" },
    { year: "2007", title: "Desamuduru", image: "movie5.jpg" },
    { year: "2008", title: "Parugu", image: "movie6.jpg" },
    { year: "2009", title: "Arya 2", image: "movie7.jpg" },
    { year: "2010", title: "Varudu", image: "movie8.jpg" },
    { year: "2010", title: "Vedam", image: "movie91.jpg" },
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
      image: "movie18a.jpg",
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
    },
    {
      year: "1986",
      title: "Swathi Muthyam",
    },
    {
      year: "2001",
      title: "Daddy",
    },
  ];

  return (
    <main className="allu-site relative min-h-screen bg-black text-white overflow-hidden">

      {/* FULL WEBSITE ALLU ARJUN BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">

        <Image
          src="/images/raakabg2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/90" />

      </div>

      {/* PAGE CONTENT */}
      <div className="relative z-10">

        {/* HERO */}
        <section className="relative min-h-screen w-full overflow-hidden">

          {/* MOBILE / DESKTOP HERO IMAGE */}
          <div className="absolute inset-0 w-full h-full">

            <Image
              src="/images/actor1b.jpg"
              alt="Allu Arjun"
              fill
              priority
              sizes="100vw"
              className="allu-hero-image object-cover object-center"
            />

          </div>

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/40" />

          {/* LEFT GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent" />

          {/* BOTTOM GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

          {/* HERO CONTENT */}
          <div className="relative z-10 min-h-screen flex items-end">

            <div className="max-w-7xl mx-auto w-full px-6 md:px-10 pb-12 md:pb-20">

              <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.45em] text-amber-100/70 mb-4 md:mb-5">
                Icon Star
              </p>

              <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.9]">
                ALLU
                <br />
                ARJUN
              </h1>

              <p className="mt-5 md:mt-6 max-w-xl text-sm md:text-base leading-6 md:leading-7 text-zinc-300">
                Indian actor and performer known for his powerful screen
                presence, distinctive style and memorable performances.
              </p>

              <div className="mt-7 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">

                <a
                  href="#filmography"
                  className="w-fit px-7 py-3.5 rounded-full bg-white text-black text-sm md:text-base font-semibold hover:bg-zinc-200 transition"
                >
                  Filmography
                </a>
                <a
  href="/allu-arjun/awards"
  className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-md transition hover:border-white/30 hover:bg-white/10 hover:text-white"
>
  🏆 Awards
</a>

                <a
                  href="#birthday"
                  className="w-fit px-7 py-3.5 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm text-sm md:text-base font-semibold hover:bg-white/10 transition"
                >
                  Birthday Countdown
                </a>

              </div>

            </div>

          </div>

        </section>


        {/* FILMOGRAPHY */}
        <section
          id="filmography"
          data-design-section="filmography"
          className="px-6 md:px-10 py-24 border-t border-white/10"
        >

          <div className="max-w-6xl mx-auto">

            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
              The Journey
            </p>

            <h2 className="text-4xl md:text-5xl font-bold">
              Filmography
            </h2>

            <p className="mt-5 max-w-2xl text-zinc-500 leading-7">
              A look through Allu Arjun&apos;s journey on the big screen,
              from his debut to his upcoming projects.
            </p>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">

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
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                    <div className="absolute top-3 left-3 rounded-full border border-white/20 bg-black/70 backdrop-blur-md px-3 py-1">

                      <span className="text-[9px] uppercase tracking-[0.2em] text-white/80">
                        {movie.year}
                      </span>

                    </div>

                  </div>

                  <h3 className="mt-4 text-base md:text-lg font-semibold leading-tight group-hover:text-amber-100 transition">
                    {movie.title}
                  </h3>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* CAMEO / GUEST APPEARANCES */}
        <section className="allu-special-section px-6 md:px-10 py-24 border-t border-white/10">

          <div className="max-w-6xl mx-auto">

            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
              Special Appearances
            </p>

            <h2 className="text-4xl md:text-5xl font-bold">
              Cameo & Guest Appearances
            </h2>

            <p className="mt-5 max-w-2xl text-zinc-500 leading-7">
              Special appearances and cameo roles across Allu Arjun&apos;s career.
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
                      sizes="(max-width: 768px) 50vw, 25vw"
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
        <section className="allu-special-section px-6 md:px-10 py-24 border-t border-white/10">

          <div className="max-w-6xl mx-auto">

            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
              Early Appearance
            </p>

            <h2 className="text-4xl md:text-5xl font-bold">
              As Child Artist
            </h2>

            <p className="mt-5 max-w-2xl text-zinc-500 leading-7">
              Early screen appearances from Allu Arjun&apos;s childhood.
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

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-20 text-center">

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


       

{/* ALLU ARJUN — AWARDS WON */}
<section
  id="awards"
  className="max-w-7xl mx-auto px-6 py-24"
>
  <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
    Achievements
  </p>

  <h2 className="text-4xl md:text-5xl font-bold mt-3">
    ALLU ARJUN — AWARDS WON
  </h2>

  <p className="mt-4 max-w-2xl text-zinc-500">
    A movie-wise collection of awards won by Allu Arjun throughout his career.
  </p>

  <div className="grid md:grid-cols-2 gap-5 mt-10">

    {/* Gangotri */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">1. Gangotri</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>CineMAA Award – Best Male Debut</li>
        <li>Nandi Award – Special Jury Award</li>
        <li>Santosham Film Award – Best Male Debut</li>
      </ul>
    </div>

    {/* Arya */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">2. Arya</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>CineMAA Award – Best Actor (Jury)</li>
        <li>Nandi Award – Special Jury Award</li>
        <li>Santosham Film Award – Best Young Performer</li>
      </ul>
    </div>

    {/* Bunny */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">3. Bunny</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>Santosham Film Award – Best Young Performer</li>
      </ul>
    </div>

    {/* Desamuduru */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">4. Desamuduru</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>CineMAA Award – Best Actor (Jury)</li>
      </ul>
    </div>

    {/* Parugu */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">5. Parugu</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>Filmfare Award South – Best Actor (Telugu)</li>
        <li>CineMAA Award – Best Actor</li>
        <li>Nandi Award – Special Jury Award</li>
        <li>South Scope Lifestyle Award – Best Actor</li>
      </ul>
    </div>

    {/* Arya 2 */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">6. Arya 2</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>South Scope Lifestyle Award – Best Stylish Actor</li>
      </ul>
    </div>

    {/* Vedam */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">7. Vedam</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>Filmfare Award South – Best Actor (Telugu)</li>
        <li>Nandi Award – Special Jury Award</li>
        <li>South Scope Lifestyle Award – Best Actor</li>
      </ul>
    </div>

    {/* Race Gurram */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">8. Race Gurram</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>Filmfare Award South – Best Actor (Telugu)</li>
        <li>CineMAA Award – Best Actor</li>
        <li>Mirchi Music Award South – Youth Icon of the Year</li>
        <li>TSR–TV9 National Film Award – Best Hero</li>
        <li>SIIMA – Stylish Youth Icon of South Indian Cinema (Male)</li>
      </ul>
    </div>

    {/* Rudhramadevi */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">9. Rudhramadevi</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>Filmfare Award South – Best Supporting Actor (Telugu)</li>
        <li>CineMAA Award – Best Actor (Jury)</li>
        <li>Nandi Award – Best Character Actor</li>
        <li>IIFA Utsavam – Performance in a Supporting Role (Male)</li>
        <li>SIIMA – Best Actor (Critics – Telugu)</li>
        <li>TSR–TV9 National Film Award – Best Outstanding Performance</li>
      </ul>
    </div>

    {/* S/O Satyamurthy */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">10. S/O Satyamurthy</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>TSR–TV9 National Film Award – Best Hero</li>
      </ul>
    </div>

    {/* Sarrainodu */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">11. Sarrainodu</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>Filmfare Critics Award South – Best Actor (Telugu)</li>
        <li>Sakshi Excellence Award – Most Popular Actor of the Year (Male)</li>
      </ul>
    </div>

    {/* DJ */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">12. DJ: Duvvada Jagannadham</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>Zee Cine Awards Telugu – Favourite Actor</li>
      </ul>
    </div>

    {/* Ala Vaikunthapurramuloo */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">13. Ala Vaikunthapurramuloo</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>Sakshi Excellence Award – Most Popular Actor of the Year (Male)</li>
        <li>SIIMA – Best Actor (Telugu)</li>
      </ul>
    </div>

    {/* Pushpa: The Rise */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">14. Pushpa: The Rise</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>National Film Award – Best Actor</li>
        <li>Filmfare Award South – Best Actor (Telugu)</li>
        <li>SIIMA – Best Actor (Telugu)</li>
        <li>Santosham Film Award – Best Actor</li>
        <li>GAMA Award – Best Actor</li>
        <li>Sakshi Excellence Award – Most Popular Actor of the Year (Male)</li>
      </ul>
    </div>

    {/* Pushpa 2 */}
    <div className="rounded-2xl bg-zinc-900 p-7 border border-white/10">
      <h3 className="text-xl font-bold">15. Pushpa 2: The Rule</h3>
      <ul className="mt-4 space-y-2 text-sm text-zinc-400 list-disc list-inside">
        <li>Filmfare Award South – Best Actor (Telugu)</li>
        <li>SIIMA – Best Actor (Telugu)</li>
        <li>Gaddar Telangana Film Award – Best Actor</li>
        <li>Sakshi Excellence Award – Most Popular Actor of the Year (Male)</li>
      </ul>
    </div>

  </div>
</section>
 {/* SOCIAL MEDIA */}
        <section className="allu-special-section px-6 md:px-10 py-24 border-t border-white/10">

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