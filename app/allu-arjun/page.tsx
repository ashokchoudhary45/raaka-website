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

        {/* PREMIUM NAVIGATION */}
        <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex h-16 items-center justify-between border-b border-white/15 px-1">
              <a href="#home" className="group flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-[10px] font-bold tracking-[0.15em] transition group-hover:bg-white group-hover:text-black">
                  AA
                </span>
                <span className="hidden sm:block text-[9px] uppercase tracking-[0.35em] text-white/55">
                  Allu Arjun
                </span>
              </a>

              <nav className="hidden lg:flex items-center gap-8">
                <a href="#home" className="premium-nav">Home</a>
                <a href="#about" className="premium-nav">About</a>
                <a href="#filmography" className="premium-nav">Filmography</a>
                <a href="#awards" className="premium-nav">Awards</a>
                <a href="#birthday" className="premium-nav">Birthday</a>
                <a href="#gallery" className="premium-nav">Gallery</a>
                <a href="#social" className="premium-nav">Connect</a>
              </nav>

              <a
                href="#contact"
                className="rounded-full border border-white/25 px-4 md:px-5 py-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-black"
              >
                Contact
              </a>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section id="home" className="relative min-h-screen w-full overflow-hidden">

          {/* MOBILE / DESKTOP HERO IMAGE */}
          <div className="absolute inset-0 w-full h-full">

            <Image
              src="/images/actor1b.jpg"
              alt="Allu Arjun"
              fill
              priority
              sizes="100vw"
              className="allu-hero-image object-cover object-center scale-[1.03] motion-safe:animate-[heroZoom_14s_ease-out_infinite_alternate]"
            />

          </div>

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/25" />

          {/* LEFT GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent" />

          {/* BOTTOM GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

          {/* HERO CONTENT */}
          <div className="relative z-10 min-h-screen flex items-end">

            <div className="max-w-7xl mx-auto w-full px-6 md:px-10 pb-12 md:pb-20">

              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-white/50" />
                <p className="text-[10px] md:text-xs uppercase tracking-[0.42em] text-white/65">
                  Icon Star
                </p>
              </div>

              <h1 className="max-w-5xl text-6xl sm:text-7xl md:text-9xl lg:text-[10rem] font-black tracking-[-0.06em] leading-[0.78]">
                ALLU<br />
                <span className="text-white/90">ARJUN</span>
              </h1>

              <p className="mt-7 max-w-xl text-sm md:text-base leading-7 text-white/65">
                A cinematic journey of style, performance and a career that
                continues to shape Indian popular culture.
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



        {/* ABOUT / PROFILE */}
        <section id="about" className="premium-section border-t border-white/10 px-6 md:px-10 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] items-start">
              <div>
                <p className="premium-kicker">Profile</p>
                <h2 className="mt-5 text-5xl md:text-7xl font-black tracking-[-0.05em] leading-[0.86]">
                  A career<br />
                  <span className="text-white/35">in motion.</span>
                </h2>
              </div>

              <div>
                <p className="max-w-2xl text-base md:text-xl leading-8 text-white/65">
                  Allu Arjun's screen journey spans multiple eras of Telugu cinema,
                  with performances, style and cultural moments that have built a
                  distinctive identity across Indian popular culture.
                </p>

                <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                  <div className="bg-black/70 p-6 md:p-8">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">Profession</p>
                    <p className="mt-3 text-lg font-semibold">Actor & Performer</p>
                  </div>
                  <div className="bg-black/70 p-6 md:p-8">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">Industry</p>
                    <p className="mt-3 text-lg font-semibold">Indian Cinema</p>
                  </div>
                  <div className="bg-black/70 p-6 md:p-8">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">Debut</p>
                    <p className="mt-3 text-lg font-semibold">Gangotri · 2003</p>
                  </div>
                  <div className="bg-black/70 p-6 md:p-8">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">Known For</p>
                    <p className="mt-3 text-lg font-semibold">Film · Dance · Style</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EDITORIAL INTRO */}
        <section className="relative border-t border-white/10 bg-black/70 px-6 md:px-10 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.2fr_0.8fr] items-end">
            <div>
              <p className="premium-kicker">The Icon</p>
              <h2 className="mt-4 max-w-4xl text-4xl md:text-6xl font-semibold tracking-[-0.035em] leading-[0.95]">
                More than a screen presence.
                <br />
                <span className="text-white/45">A visual identity.</span>
              </h2>
            </div>
            <div className="border-l border-white/10 pl-6 md:pl-8">
              <p className="text-sm md:text-base leading-7 text-white/55">
                Explore the work, milestones and moments that define Allu Arjun —
                presented through a modern, editorial-style digital experience.
              </p>
            </div>
          </div>
        </section>

        {/* FILMOGRAPHY */}
        <section
          id="filmography"
          data-design-section="filmography"
          className="premium-section px-6 md:px-10 py-24 md:py-32 border-t border-white/10"
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
        <section className="premium-section allu-special-section px-6 md:px-10 py-24 md:py-32 border-t border-white/10">

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
        <section className="premium-section allu-special-section px-6 md:px-10 py-24 md:py-32 border-t border-white/10">

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
          className="relative overflow-hidden border-t border-white/10 bg-black px-6 md:px-10 py-24 md:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] items-end">
              <div>
                <p className="premium-kicker">8 April · Birthday</p>
                <h2 className="mt-5 text-5xl md:text-7xl font-black tracking-[-0.055em] leading-[0.86]">
                  Birthday
                  <br />
                  <span className="text-white/30">Countdown.</span>
                </h2>
                <p className="mt-6 max-w-md text-sm md:text-base leading-7 text-white/45">
                  Counting down to Allu Arjun's next birthday.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-white/10 bg-white/10 overflow-hidden">
                {[
                  ["Days", birthdayTime.days],
                  ["Hours", birthdayTime.hours],
                  ["Minutes", birthdayTime.minutes],
                  ["Seconds", birthdayTime.seconds],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-white/[0.025] px-5 py-7 md:px-7 md:py-9"
                  >
                    <p className="text-4xl md:text-6xl font-black tracking-[-0.05em] leading-none tabular-nums">
                      {String(value).padStart(2, "0")}
                    </p>
                    <p className="mt-4 text-[9px] uppercase tracking-[0.28em] text-white/30">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

<section id="awards" className="awards-premium border-t border-white/10 px-6 md:px-10 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] items-end">
              <div>
                <p className="premium-kicker">Achievements</p>
                <h2 className="mt-5 text-5xl md:text-7xl font-black tracking-[-0.055em] leading-[0.86]">
                  Awards<br />
                  <span className="text-white/30">& Recognition.</span>
                </h2>
              </div>

              <div className="lg:pb-2">
                <p className="max-w-2xl text-sm md:text-base leading-7 text-white/45">
                  A film-by-film archive of major awards and recognitions associated
                  with Allu Arjun's career.
                </p>

                <div className="mt-8 flex gap-10">
                  <div>
                    <p className="text-3xl md:text-4xl font-black">15</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-white/30">Featured Films</p>
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-black">2023</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-white/30">National Film Award</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 grid md:grid-cols-2 gap-px border border-white/10 bg-white/10 overflow-hidden">
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">01</span>
                  <span className="award-line" />
                  <span className="award-count">3 awards</span>
                </div>
                <h3>1. Gangotri</h3>
                <ul>
                    <li>CineMAA Award – Best Male Debut</li>
                    <li>Nandi Award – Special Jury Award</li>
                    <li>Santosham Film Award – Best Male Debut</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">02</span>
                  <span className="award-line" />
                  <span className="award-count">3 awards</span>
                </div>
                <h3>2. Arya</h3>
                <ul>
                    <li>CineMAA Award – Best Actor (Jury)</li>
                    <li>Nandi Award – Special Jury Award</li>
                    <li>Santosham Film Award – Best Young Performer</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">03</span>
                  <span className="award-line" />
                  <span className="award-count">1 award</span>
                </div>
                <h3>3. Bunny</h3>
                <ul>
                    <li>Santosham Film Award – Best Young Performer</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">04</span>
                  <span className="award-line" />
                  <span className="award-count">1 award</span>
                </div>
                <h3>4. Desamuduru</h3>
                <ul>
                    <li>CineMAA Award – Best Actor (Jury)</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">05</span>
                  <span className="award-line" />
                  <span className="award-count">4 awards</span>
                </div>
                <h3>5. Parugu</h3>
                <ul>
                    <li>Filmfare Award South – Best Actor (Telugu)</li>
                    <li>CineMAA Award – Best Actor</li>
                    <li>Nandi Award – Special Jury Award</li>
                    <li>South Scope Lifestyle Award – Best Actor</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">06</span>
                  <span className="award-line" />
                  <span className="award-count">1 award</span>
                </div>
                <h3>6. Arya 2</h3>
                <ul>
                    <li>South Scope Lifestyle Award – Best Stylish Actor</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">07</span>
                  <span className="award-line" />
                  <span className="award-count">3 awards</span>
                </div>
                <h3>7. Vedam</h3>
                <ul>
                    <li>Filmfare Award South – Best Actor (Telugu)</li>
                    <li>Nandi Award – Special Jury Award</li>
                    <li>South Scope Lifestyle Award – Best Actor</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">08</span>
                  <span className="award-line" />
                  <span className="award-count">5 awards</span>
                </div>
                <h3>8. Race Gurram</h3>
                <ul>
                    <li>Filmfare Award South – Best Actor (Telugu)</li>
                    <li>CineMAA Award – Best Actor</li>
                    <li>Mirchi Music Award South – Youth Icon of the Year</li>
                    <li>TSR–TV9 National Film Award – Best Hero</li>
                    <li>SIIMA – Stylish Youth Icon of South Indian Cinema (Male)</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">09</span>
                  <span className="award-line" />
                  <span className="award-count">6 awards</span>
                </div>
                <h3>9. Rudhramadevi</h3>
                <ul>
                    <li>Filmfare Award South – Best Supporting Actor (Telugu)</li>
                    <li>CineMAA Award – Best Actor (Jury)</li>
                    <li>Nandi Award – Best Character Actor</li>
                    <li>IIFA Utsavam – Performance in a Supporting Role (Male)</li>
                    <li>SIIMA – Best Actor (Critics – Telugu)</li>
                    <li>TSR–TV9 National Film Award – Best Outstanding Performance</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">10</span>
                  <span className="award-line" />
                  <span className="award-count">1 award</span>
                </div>
                <h3>10. S/O Satyamurthy</h3>
                <ul>
                    <li>TSR–TV9 National Film Award – Best Hero</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">11</span>
                  <span className="award-line" />
                  <span className="award-count">2 awards</span>
                </div>
                <h3>11. Sarrainodu</h3>
                <ul>
                    <li>Filmfare Critics Award South – Best Actor (Telugu)</li>
                    <li>Sakshi Excellence Award – Most Popular Actor of the Year (Male)</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">12</span>
                  <span className="award-line" />
                  <span className="award-count">1 award</span>
                </div>
                <h3>12. DJ: Duvvada Jagannadham</h3>
                <ul>
                    <li>Zee Cine Awards Telugu – Favourite Actor</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">13</span>
                  <span className="award-line" />
                  <span className="award-count">2 awards</span>
                </div>
                <h3>13. Ala Vaikunthapurramuloo</h3>
                <ul>
                    <li>Sakshi Excellence Award – Most Popular Actor of the Year (Male)</li>
                    <li>SIIMA – Best Actor (Telugu)</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">14</span>
                  <span className="award-line" />
                  <span className="award-count">6 awards</span>
                </div>
                <h3>14. Pushpa: The Rise</h3>
                <ul>
                    <li>National Film Award – Best Actor</li>
                    <li>Filmfare Award South – Best Actor (Telugu)</li>
                    <li>SIIMA – Best Actor (Telugu)</li>
                    <li>Santosham Film Award – Best Actor</li>
                    <li>GAMA Award – Best Actor</li>
                    <li>Sakshi Excellence Award – Most Popular Actor of the Year (Male)</li>
                </ul>
              </article>
              <article className="award-card">
                <div className="award-card-top">
                  <span className="award-index">15</span>
                  <span className="award-line" />
                  <span className="award-count">4 awards</span>
                </div>
                <h3>15. Pushpa 2: The Rule</h3>
                <ul>
                    <li>Filmfare Award South – Best Actor (Telugu)</li>
                    <li>SIIMA – Best Actor (Telugu)</li>
                    <li>Gaddar Telangana Film Award – Best Actor</li>
                    <li>Sakshi Excellence Award – Most Popular Actor of the Year (Male)</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

 {/* SOCIAL MEDIA */}
        <section id="social" className="premium-section allu-special-section px-6 md:px-10 py-24 md:py-32 border-t border-white/10">

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



        {/* VISUAL ARCHIVE */}
        <section id="gallery" className="premium-section border-t border-white/10 px-6 md:px-10 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="premium-kicker">Visual Archive</p>
                <h2 className="mt-4 text-5xl md:text-7xl font-black tracking-[-0.055em] leading-[0.86]">Gallery</h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-white/35">
                Selected portraits, performances and career-defining moments.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              <figure className="editorial-photo">
                <div className="editorial-photo-media">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Allu_Arjun_National_Award.jpg" alt="Allu Arjun at the National Film Awards" loading="lazy" />
                </div>
                <figcaption><span>01</span> National Film Awards</figcaption>
              </figure>

              <figure className="editorial-photo">
                <div className="editorial-photo-media">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Icon_Star_AA.jpg" alt="Allu Arjun portrait" loading="lazy" />
                </div>
                <figcaption><span>02</span> Portrait</figcaption>
              </figure>

              <figure className="editorial-photo">
                <div className="editorial-photo-media">
                  <img src="https://i.pinimg.com/originals/78/cf/ed/78cfed6d511c83b10896d888adc1a519.jpg" alt="Allu Arjun in Pushpa" loading="lazy" />
                </div>
                <figcaption><span>03</span> Pushpa</figcaption>
              </figure>

              <figure className="editorial-photo">
                <div className="editorial-photo-media">
                  <img src="https://media.assettype.com/gulfnews/import/2021/12/16/Pushpa--The-Rise_17dc32f5a09_large.jpg?auto=format%2Ccompress&enlarge=true&fit=max&h=675&w=1200" alt="Allu Arjun as Pushpa Raj" loading="lazy" />
                </div>
                <figcaption><span>04</span> Pushpa Raj</figcaption>
              </figure>

              <figure className="editorial-photo">
                <div className="editorial-photo-media">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Ek_Niranjan_Audio_Release_Function_%28168%29.jpg" alt="Allu Arjun at an early film event" loading="lazy" />
                </div>
                <figcaption><span>05</span> Archive</figcaption>
              </figure>

              <figure className="editorial-photo">
                <div className="editorial-photo-media">
                  <img src="/images/movie13.jpg" alt="Race Gurram" loading="lazy" />
                </div>
                <figcaption><span>06</span> Race Gurram</figcaption>
              </figure>

              <figure className="editorial-photo">
                <div className="editorial-photo-media">
                  <img src="/images/movie16.jpg" alt="Sarrainodu" loading="lazy" />
                </div>
                <figcaption><span>07</span> Sarrainodu</figcaption>
              </figure>

              <figure className="editorial-photo">
                <div className="editorial-photo-media">
                  <img src="/images/movie20.jpg" alt="Pushpa: The Rise" loading="lazy" />
                </div>
                <figcaption><span>08</span> Pushpa: The Rise</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* LATEST / FEATURED */}
        <section id="latest" className="premium-section border-t border-white/10 px-6 md:px-10 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="premium-kicker">Selected Work</p>
                <h2 className="mt-4 text-5xl md:text-7xl font-black tracking-[-0.05em]">Latest Chapters</h2>
              </div>
              <a href="#filmography" className="hidden md:block text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-white transition">
                View filmography →
              </a>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              <a href="#filmography" className="chapter-card">
                <div className="chapter-media"><img src="/images/movie21.jpg" alt="Pushpa 2: The Rule" /></div>
                <div className="chapter-meta"><span>2024</span><strong>Pushpa 2: The Rule</strong></div>
              </a>
              <a href="#filmography" className="chapter-card">
                <div className="chapter-media"><img src="/images/movie20.jpg" alt="Pushpa: The Rise" /></div>
                <div className="chapter-meta"><span>2021</span><strong>Pushpa: The Rise</strong></div>
              </a>
              <a href="#filmography" className="chapter-card">
                <div className="chapter-media"><img src="/images/movie19.jpg" alt="Ala Vaikunthapurramuloo" /></div>
                <div className="chapter-meta"><span>2020</span><strong>Ala Vaikunthapurramuloo</strong></div>
              </a>
              <a href="#filmography" className="chapter-card">
                <div className="chapter-media"><img src="/images/movie16.jpg" alt="Sarrainodu" /></div>
                <div className="chapter-meta"><span>2016</span><strong>Sarrainodu</strong></div>
              </a>
            </div>
          </div>
        </section>

        {/* PREMIUM CTA */}
        <section className="relative overflow-hidden border-t border-white/10 bg-white/[0.025] px-6 md:px-10 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 md:p-16">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/[0.06] blur-3xl" />
              <div className="relative max-w-3xl">
                <p className="premium-kicker">Stay Connected</p>
                <h2 className="mt-4 text-4xl md:text-7xl font-black tracking-[-0.04em] leading-[0.9]">
                  The journey
                  <br />
                  continues.
                </h2>
                <p className="mt-6 max-w-xl text-sm md:text-base leading-7 text-white/55">
                  Follow the latest moments, appearances and updates from the
                  world of Allu Arjun.
                </p>
                <a
                  href="#social"
                  className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-black transition hover:bg-zinc-200"
                >
                  Follow the Journey
                </a>
              </div>
            </div>
          </div>
        </section>


        {/* CONTACT */}
        <section id="contact" className="border-t border-white/10 bg-black px-6 md:px-10 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="premium-kicker">Contact</p>
                <h2 className="mt-4 text-4xl md:text-6xl font-black tracking-[-0.04em]">
                  Get in touch.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-white/45">
                  For website feedback, corrections, collaborations or general enquiries,
                  use the contact details below.
                </p>
              </div>

              <div className="grid gap-3">
              <a
  href="https://x.com/cricvizanalys"
  target="_blank"
  rel="noopener noreferrer"
  className="contact-row"
>
  <span>General Enquiries</span>
  <span>www.x.com/cricvizanalys ↗</span>
</a>
                <a href="mailto:press@allu-arjun.com" className="contact-row">
                  <span>Contact</span>
                  <span>worldofraakaverse@gmail.com ↗</span>
                </a>
                <a href="#social" className="contact-row">
                  <span>AA Social Channels</span>
                  <span>View Social ↗</span>
                </a>
              </div>
            </div>

            <div className="mt-20 border-t border-white/10 pt-7">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">Disclaimer</p>
              <p className="mt-3 max-w-4xl text-[11px] leading-6 text-white/30">
                This is an independent fan-made website created for informational and
                entertainment purposes. It is not the official website of Allu Arjun,
                his management, production companies, or any associated organization.
                All trademarks, names, photographs and copyrighted materials belong to
                their respective owners. No official affiliation or endorsement is claimed.
              </p>
            </div>
          </div>
        </section>

        {/* SITE FOOTER */}
        <footer className="border-t border-white/10 bg-black px-6 md:px-10 py-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
                Allu Arjun
              </p>
              <p className="mt-2 text-[10px] text-white/25">
                An independent fan-made digital archive.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-[9px] uppercase tracking-[0.2em] text-white/35">
              <a href="#home" className="hover:text-white transition">Top</a>
              <a href="#about" className="hover:text-white transition">About</a>
              <a href="#filmography" className="hover:text-white transition">Filmography</a>
              <a href="#contact" className="hover:text-white transition">Contact</a>
            </div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-white/20">
              © {new Date().getFullYear()} · Fan Project
            </p>
          </div>
        </footer>

      </div>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        ::selection {
          background: rgba(255, 255, 255, 0.18);
          color: white;
        }

        .premium-nav {
          position: relative;
          color: rgba(255,255,255,.55);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .18em;
          text-transform: uppercase;
          transition: color .3s ease;
        }

        .premium-nav:hover {
          color: white;
        }

        .premium-nav::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -7px;
          height: 1px;
          transform: scaleX(0);
          transform-origin: center;
          background: rgba(255,255,255,.8);
          transition: transform .3s ease;
        }

        .premium-nav:hover::after {
          transform: scaleX(1);
        }

        .premium-kicker {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .38em;
          text-transform: uppercase;
          color: rgba(255,255,255,.42);
        }

        .premium-section {
          position: relative;
          background:
            radial-gradient(circle at 85% 15%, rgba(255,255,255,.045), transparent 28%),
            linear-gradient(to bottom, rgba(0,0,0,.72), rgba(0,0,0,.88));
        }

        .premium-section::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: linear-gradient(
            rgba(255,255,255,.018) 1px,
            transparent 1px
          );
          background-size: 100% 72px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
        }

        .allu-site h2,
        .allu-site h1 {
          text-wrap: balance;
        }

        .allu-site a,
        .allu-site button {
          -webkit-tap-highlight-color: transparent;
        }



        .photo-frame {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.10);
          background: #090909;
        }

        .photo-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 1s cubic-bezier(.2,.7,.2,1), filter .7s ease;
          filter: saturate(.82) contrast(1.02);
        }

        .photo-frame:hover img {
          transform: scale(1.045);
          filter: saturate(1) contrast(1.04);
        }

        .photo-frame figcaption {
          position: absolute;
          left: 1rem;
          bottom: 1rem;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: .2em;
          color: rgba(255,255,255,.72);
          text-shadow: 0 2px 15px rgba(0,0,0,.8);
        }

        .feature-tile {
          position: relative;
          display: block;
          overflow: hidden;
          min-height: 420px;
          background: #080808;
          border: 1px solid rgba(255,255,255,.10);
        }

        .feature-tile img {
          width: 100%;
          height: 100%;
          min-height: 420px;
          object-fit: cover;
          display: block;
          transition: transform 1s cubic-bezier(.2,.7,.2,1);
        }

        .feature-tile:hover img {
          transform: scale(1.04);
        }

        .feature-overlay {
          position: absolute;
          inset: auto 0 0;
          padding: 2rem;
          background: linear-gradient(to top, rgba(0,0,0,.9), transparent);
        }

        .feature-overlay span {
          display: block;
          font-size: 9px;
          letter-spacing: .25em;
          text-transform: uppercase;
          color: rgba(255,255,255,.5);
        }

        .feature-overlay strong {
          display: block;
          margin-top: .5rem;
          font-size: clamp(1.5rem, 4vw, 3rem);
          letter-spacing: -.04em;
          line-height: .95;
        }

        .editorial-photo { min-width: 0; }
        .editorial-photo-media {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.10);
          background: #0a0a0a;
        }
        .editorial-photo-media img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          transition: transform .65s cubic-bezier(.2,.7,.2,1), filter .5s ease;
          filter: saturate(.78) contrast(1.02);
        }
        .editorial-photo:hover .editorial-photo-media img {
          transform: scale(1.035);
          filter: saturate(1) contrast(1.04);
        }
        .editorial-photo figcaption {
          display: flex;
          align-items: center;
          gap: .65rem;
          padding-top: .75rem;
          color: rgba(255,255,255,.48);
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .17em;
        }
        .editorial-photo figcaption span { color: rgba(255,255,255,.22); }

        .chapter-card { min-width: 0; display: block; }
        .chapter-media {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.10);
          background: #090909;
        }
        .chapter-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .65s cubic-bezier(.2,.7,.2,1), filter .5s ease;
          filter: saturate(.82);
        }
        .chapter-card:hover .chapter-media img {
          transform: scale(1.035);
          filter: saturate(1);
        }
        .chapter-meta { padding-top: .8rem; }
        .chapter-meta span {
          display: block;
          font-size: 8px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: rgba(255,255,255,.28);
        }
        .chapter-meta strong {
          display: block;
          margin-top: .4rem;
          font-size: clamp(.85rem,1.4vw,1rem);
          line-height: 1.15;
          font-weight: 600;
          color: rgba(255,255,255,.82);
        }

        .awards-premium {
          position: relative;
          background:
            radial-gradient(circle at 10% 10%, rgba(255,255,255,.035), transparent 28%),
            #050505;
        }
        .award-card {
          min-width: 0;
          padding: 1.75rem;
          background: rgba(7,7,7,.96);
          transition: background .35s ease;
        }
        .award-card:hover { background: rgba(18,18,18,.98); }
        .award-card-top { display: flex; align-items: center; gap: .7rem; }
        .award-index {
          font-size: 9px;
          letter-spacing: .2em;
          color: rgba(255,255,255,.25);
        }
        .award-line {
          height: 1px;
          flex: 1;
          background: rgba(255,255,255,.10);
        }
        .award-count {
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: .16em;
          color: rgba(255,255,255,.24);
        }
        .award-card h3 {
          margin-top: 2rem;
          font-size: clamp(1.2rem,2.2vw,1.7rem);
          line-height: 1;
          letter-spacing: -.025em;
          font-weight: 700;
          color: rgba(255,255,255,.92);
        }
        .award-card ul {
          margin-top: 1.25rem;
          padding: 0;
          list-style: none;
          display: grid;
          gap: .7rem;
        }
        .award-card li {
          position: relative;
          padding-left: 1rem;
          font-size: .76rem;
          line-height: 1.45;
          color: rgba(255,255,255,.42);
        }
        .award-card li::before {
          content: "";
          position: absolute;
          left: 0;
          top: .55em;
          width: 3px;
          height: 3px;
          border-radius: 999px;
          background: rgba(255,255,255,.38);
        }
        @media (max-width: 767px) {
          .award-card { padding: 1.35rem; }
        }

        .gallery-card {
          position: relative;
          overflow: hidden;
          border-radius: 1.25rem;
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.025);
        }

        .gallery-card img {
          transition: transform .8s cubic-bezier(.2,.7,.2,1), filter .5s ease;
          filter: saturate(.8);
        }

        .gallery-card:hover img {
          transform: scale(1.06);
          filter: saturate(1);
        }

        .contact-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.25rem 0;
          border-bottom: 1px solid rgba(255,255,255,.10);
          color: rgba(255,255,255,.62);
          font-size: .8rem;
          transition: color .3s ease, padding .3s ease;
        }

        .contact-row:hover {
          color: white;
          padding-left: .5rem;
          padding-right: .5rem;
        }

        @media (max-width: 640px) {
          .contact-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }


        @keyframes heroZoom {
          from { transform: scale(1.03); }
          to { transform: scale(1.09); }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .allu-hero-image {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

    </main>
  );
}