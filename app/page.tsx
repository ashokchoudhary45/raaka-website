"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

useEffect(() => {
  audioRef.current = new Audio("/sounds/tick.mp3");
  audioRef.current.volume = 0.35;
}, []);

  useEffect(() => {
    const targetDate = new Date("2028-01-26T00:00:00+05:30").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }
      if (audioRef.current) {
  audioRef.current.currentTime = 2;
  audioRef.current.play().catch(() => {});
}

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
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

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);
  return (
    <>
      {/* FULL WEBSITE RAAKA BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center animate-raaka-bg-1" style={{ backgroundImage: "url('/images/raakabg.jpg')" }} />
        <div className="absolute inset-0 bg-cover bg-center animate-raaka-bg-2" style={{ backgroundImage: "url('/images/raakabg1.jpg')" }} />
        <div className="absolute inset-0 bg-cover bg-center animate-raaka-bg-3" style={{ backgroundImage: "url('/images/raakabg2.jpg')" }} />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
      </div>

<div className="fixed top-6 right-6 z-50">

  {/* 3 LINE BUTTON */}
  <button
    onClick={() => setMenuOpen(!menuOpen)}
    className="w-12 h-12 rounded-full border border-white/30 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-1.5 hover:bg-white hover:text-black transition"
    aria-label="Open Menu"
  >
    <span
      className={`block w-5 h-0.5 bg-current transition ${
        menuOpen ? "rotate-45 translate-y-2" : ""
      }`}
    />
    <span
      className={`block w-5 h-0.5 bg-current transition ${
        menuOpen ? "opacity-0" : ""
      }`}
    />
    <span
      className={`block w-5 h-0.5 bg-current transition ${
        menuOpen ? "-rotate-45 -translate-y-2" : ""
      }`}
    />
  </button>
{/* MENU */}
{menuOpen && (
  <div className="absolute right-0 mt-3 w-[340px] rounded-2xl border border-white/20 bg-black/90 backdrop-blur-xl p-3 shadow-2xl">

    <a
      href="#cast"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
    >
      Cast
    </a>

    <a
      href="#crew"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
    >
      Crew
    </a>

    <a
      href="#posters"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
    >
      Posters
    </a>

    <a
      href="#announcements"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
    >
      Latest Announcements
    </a>

    <a
      href="#songs"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
    >
      Songs
    </a>
{/* TICKET BOOKING */}
<div className="mt-1 border-t border-white/15 pt-1">

  <div className="block px-4 py-3 rounded-xl hover:bg-white/10 transition">
    Book Tickets
  </div>

  <div className="flex items-start gap-3 px-4 pb-3">

    {/* BOOKMYSHOW */}
    <a
      href="https://in.bookmyshow.com/movies/raaka/ET00494565"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setMenuOpen(false)}
      className="group flex w-[100px] flex-col items-center"
      title="Book Raaka on BookMyShow"
    >
      <div className="flex h-[50px] w-[100px] items-center justify-center overflow-hidden rounded-xl transition duration-300 group-hover:scale-105">
        <Image
          src="/images/logo2.jpg"
          alt="BookMyShow"
          width={321}
          height={157}
          className="h-auto w-full object-contain"
        />
      </div>

      <span className="mt-1 text-xs font-semibold text-white/80 group-hover:text-white">
        BookMyShow
      </span>
    </a>

    {/* DISTRICT */}
    <a
      href="https://www.district.in/movies/raaka-movie-tickets-MV218847"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setMenuOpen(false)}
      className="group flex w-[100px] flex-col items-center"
      title="Book Raaka on District"
    >
      <div className="flex h-[50px] w-[100px] items-center justify-center overflow-hidden rounded-xl transition duration-300 group-hover:scale-105">
        <Image
          src="/images/logo1.jpg"
          alt="District"
          width={715}
          height={429}
          className="h-auto w-full object-contain"
        />
      </div>

      <span className="mt-1 text-xs font-semibold text-white/80 group-hover:text-white">
        District
      </span>
    </a>

  </div>
</div>
    <a
      href="#explore"
      onClick={() => setMenuOpen(false)}
      className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
    >
      Explore More
    </a>

  </div>
)}

</div>
   <main className="relative z-10 min-h-screen bg-transparent text-white">

      {/* HERO */}
      <section className="relative min-h-screen flex items-end overflow-hidden">

       <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-20">

          <p className="text-sm uppercase tracking-[0.4em] text-zinc-400 mb-4">
            The World of
          </p>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            RAAKA
          </h1>

          <p className="mt-5 max-w-xl text-zinc-300 text-lg">
            Explore the world of Raaka — posters, teasers, trailers,
            glimpses, songs, cast, characters and everything about the movie.
          </p>

          <div className="flex gap-4 mt-8 flex-wrap">

            <a
              href="#announcements"
              className="rounded-full bg-white text-black px-7 py-3 font-semibold hover:bg-zinc-200"
            >
              Watch Videos
            </a>

            <a
              href="#cast"
              className="rounded-full border border-white/30 px-7 py-3 font-semibold hover:bg-white/10"
            >
              Explore Cast
            </a>

          </div>

        </div>
      </section>


      {/* MOVIE */}
      <section className="max-w-7xl mx-auto px-6 py-24">

        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          The Movie
        </p>

        <h2 className="text-4xl md:text-5xl font-bold mt-3">
          About Raaka
        </h2>

        <div className="grid md:grid-cols-2 gap-12 mt-10">

          {/* Poster */}
          <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">

            <Image
              src="/images/RAAKAFL.jpg"
              alt="Raaka First Look"
              width={800}
              height={1200}
              className="w-full h-full object-cover"
            />

          </div>


          {/* Movie Details */}
          <div className="flex flex-col justify-center">

            <p className="text-zinc-300 text-lg leading-8">
              Welcome to the World of Raaka. This website brings together
              everything related to the movie in one place.
            </p>


            {/* Movie Info */}
            <div className="grid grid-cols-2 gap-4 mt-10">

              {/* Language */}
              <div className="bg-zinc-900 rounded-xl p-5">

                <p className="text-zinc-500 text-sm">
                  Language
                </p>

                <p className="font-semibold mt-1">
                  Telugu
                </p>

              </div>


              {/* Genre */}
              <div className="bg-zinc-900 rounded-xl p-5">

                <p className="text-zinc-500 text-sm">
                  Genre
                </p>

                <p className="font-semibold mt-1">
                  Movie
                </p>

              </div>


              {/* Director */}
              <div className="bg-zinc-900 rounded-xl p-5">

                <p className="text-zinc-500 text-sm">
                  Director
                </p>

                <p className="font-semibold mt-1">
                  Atlee Kumar
                </p>

              </div>


              {/* Release */}
              <div className="bg-zinc-900 rounded-xl p-5">

                <p className="text-zinc-500 text-sm">
                  Release
                </p>

                <p className="font-semibold mt-1">
                  Coming Soon
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>
    {/* RELEASE COUNTDOWN */}
<section
  id="countdown"
  className="relative max-w-7xl mx-auto px-6 py-28 overflow-hidden"
>
  <div className="relative min-h-[720px] md:min-h-[780px] overflow-hidden rounded-[2rem] border border-white/10 bg-black">

    {/* ANIMATED RAAKA PHOTO */}
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="/images/raakabg2.jpg"
        alt="Raaka"
        fill
        priority
        className="raaka-countdown-photo object-cover object-center"
      />
    </div>

    {/* DARK CINEMATIC OVERLAY */}
    <div className="absolute inset-0 bg-black/55" />

    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/75" />

    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />

    {/* GOLD ATMOSPHERIC GLOW */}
    <div className="raaka-countdown-glow pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-amber-500/10 blur-[120px]" />

    {/* CONTENT */}
    <div className="relative z-10 flex min-h-[720px] md:min-h-[780px] flex-col items-center justify-center px-5 py-16 text-center">

      {/* TOP TEXT */}
      <p className="mb-7 text-[10px] md:text-xs uppercase tracking-[0.55em] text-amber-100/70">
        The Countdown Begins
      </p>

      {/* OFFICIAL RAAKA LOGO */}
      <div className="relative w-[280px] md:w-[500px]">
        <Image
          src="/images/logo2.png"
          alt="RAAKA"
          width={1200}
          height={350}
          priority
          className="h-auto w-full object-contain drop-shadow-[0_0_25px_rgba(255,180,70,0.25)]"
        />
      </div>

      {/* RELEASE DATE */}
      <div className="mt-7 flex items-center justify-center gap-4">
        <span className="h-px w-10 md:w-20 bg-amber-100/40" />

        <p className="text-sm md:text-lg uppercase tracking-[0.35em] text-amber-50/90">
          26 January 2028
        </p>

        <span className="h-px w-10 md:w-20 bg-amber-100/40" />
      </div>

      {/* COUNTDOWN */}
      <div className="mt-14 md:mt-20 w-full max-w-5xl">

        <div className="grid grid-cols-2 md:grid-cols-4">

         {/* DAYS */}
<div className="relative px-4 py-7 md:px-8 md:py-10 border border-white/10 bg-black/35 backdrop-blur-sm">

  <p
    key={timeLeft.days}
    className="raaka-timer-number text-5xl sm:text-6xl md:text-8xl font-black tracking-tight tabular-nums text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]"
  >
    {String(timeLeft.days).padStart(3, "0")}
  </p>

  <p className="mt-3 text-[9px] md:text-xs uppercase tracking-[0.4em] text-amber-100/60">
    Days
  </p>
</div>

{/* HOURS */}
<div className="relative px-4 py-7 md:px-8 md:py-10 border border-white/10 bg-black/35 backdrop-blur-sm">

  <p
    key={timeLeft.hours}
    className="raaka-timer-number text-5xl sm:text-6xl md:text-8xl font-black tracking-tight tabular-nums text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]"
  >
    {String(timeLeft.hours).padStart(2, "0")}
  </p>

  <p className="mt-3 text-[9px] md:text-xs uppercase tracking-[0.4em] text-amber-100/60">
    Hours
  </p>
</div>

{/* MINUTES */}
<div className="relative px-4 py-7 md:px-8 md:py-10 border border-white/10 bg-black/35 backdrop-blur-sm">

  <p
    key={timeLeft.minutes}
    className="raaka-timer-number text-5xl sm:text-6xl md:text-8xl font-black tracking-tight tabular-nums text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]"
  >
    {String(timeLeft.minutes).padStart(2, "0")}
  </p>

  <p className="mt-3 text-[9px] md:text-xs uppercase tracking-[0.4em] text-amber-100/60">
    Minutes
  </p>
</div>

{/* SECONDS */}
<div className="relative px-4 py-7 md:px-8 md:py-10 border border-amber-100/20 bg-black/40 backdrop-blur-sm">

  <p
    key={timeLeft.seconds}
    className="raaka-timer-number text-5xl sm:text-6xl md:text-8xl font-black tracking-tight tabular-nums text-white drop-shadow-[0_4px_20px_rgba(255,180,70,0.35)]"
  >
    {String(timeLeft.seconds).padStart(2, "0")}
  </p>

  <p className="mt-3 text-[9px] md:text-xs uppercase tracking-[0.4em] text-amber-100/70">
    Seconds
  </p>
</div>

     </div>

{/* BOTTOM TEXT */}
<div className="mt-14 md:mt-20 flex items-center justify-center gap-4">
  <span className="h-px w-8 md:w-16 bg-amber-100/30" />

  <p className="text-[10px] md:text-sm uppercase tracking-[0.45em] text-amber-50/80">
    The Wait Is Almost Over
  </p>

  <span className="h-px w-8 md:w-16 bg-amber-100/30" />
</div>

</div>
</div>
</div>
</section>
      {/* CAST */}
      <section
        id="cast"
        className="px-6 md:px-10 py-24"
      >

        <div className="max-w-6xl mx-auto">

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
            The Cast
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            Cast & Characters
          </h2>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            {/* Allu Arjun */}
            <div className="group">

              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                <Image
                  src="/images/actor1.jpg"
                  alt="Allu Arjun"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <h3 className="text-lg font-semibold mt-4">
                Allu Arjun
              </h3>

            </div>


            {/* Deepika Padukone */}
            <div className="group">

              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                <Image
                  src="/images/actor2.jpg"
                  alt="Deepika Padukone"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <h3 className="text-lg font-semibold mt-4">
                Deepika Padukone
              </h3>

            </div>

          </div>

        </div>

      </section>


      {/* CREW */}
      <section id="crew" className="px-6 md:px-10 py-24">

        <div className="max-w-6xl mx-auto">

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
            Behind The World
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            Crew
          </h2>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            {/* Atlee Kumar */}
            <div className="group">

              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                <Image
                  src="/images/crew1.jpg"
                  alt="Atlee Kumar"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <h3 className="text-xl md:text-2xl font-semibold mt-4">
                Atlee Kumar
              </h3>

              <p className="text-zinc-400 text-lg mt-1">
                Director
              </p>

            </div>


            {/* Sai Abhyankar */}
            <div className="group">

              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                <Image
                  src="/images/crew2.jpg"
                  alt="Sai Abhyankar"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <h3 className="text-xl md:text-2xl font-semibold mt-4">
                Sai Abhyankar
              </h3>

              <p className="text-zinc-400 text-lg mt-1">
                Musician
              </p>

            </div>


            {/* Kalanithi Maran */}
            <div className="group">

              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                <Image
                  src="/images/crew3.jpg"
                  alt="Kalanithi Maran"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <h3 className="text-xl md:text-2xl font-semibold mt-4">
                Kalanithi Maran
              </h3>

              <p className="text-zinc-400 text-lg mt-1">
                Producer
              </p>

            </div>


            {/* Sun Picture */}
            <div className="group">

              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                <Image
                  src="/images/crew4.jpg"
                  alt="Sun Picture"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <h3 className="text-xl md:text-2xl font-semibold mt-4">
                Sun Picture
              </h3>

              <p className="text-zinc-400 text-lg mt-1">
                Producer
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* POSTERS */}
      <section id="posters" className="px-6 md:px-10 py-24">

        <div className="max-w-6xl mx-auto">

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
            Gallery
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            Posters & First Looks
          </h2>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            {/* RAAKA First Look */}
            <div className="group">

              <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                <Image
                  src="/images/RAAKAFL.jpg"
                  alt="RAAKA First Look"
                  width={800}
                  height={1200}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <h3 className="text-xl font-semibold mt-4">
                RAAKA First Look
              </h3>

              <p className="text-zinc-400 mt-1">
                First Look
              </p>

            </div>

          </div>

        </div>

      </section>


     {/* ANNOUNCEMENT VIDEOS */}
<section
  id="announcements"
  className="px-6 md:px-10 py-24"
>
  <div className="max-w-6xl mx-auto">

    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
      Announcements
    </p>

    <h2 className="text-4xl md:text-5xl font-bold mb-12">
      Latest Announcements
    </h2>

    <div className="grid md:grid-cols-2 gap-8">

      {/* GEAR UP for RAAKA */}
      <div>

        <div className="aspect-video overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/SI_PhNII7Mc"
            title="GEAR UP for RAAKA"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

        </div>

        <h3 className="text-xl md:text-2xl font-semibold mt-5">
          GEAR UP for RAAKA
        </h3>

        <p className="text-zinc-400 mt-1">
          Announcement
        </p>

      </div>


      {/* Welcome on board Deepika Padukone */}
      <div>

        <div className="aspect-video overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/jlmT4apm1oI"
            title="Welcome on board Deepika Padukone"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

        </div>

        <h3 className="text-xl md:text-2xl font-semibold mt-5">
          Welcome on board Deepika Padukone
        </h3>

        <p className="text-zinc-400 mt-1">
          Announcement
        </p>

      </div>

    </div>

  </div>
</section>


{/* SONGS */}
<section
  id="songs"
  className="px-6 md:px-10 py-24"
>
  <div className="max-w-6xl mx-auto">

    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
      The Soundtrack
    </p>

    <h2 className="text-4xl md:text-5xl font-bold mb-12">
      Songs
    </h2>

    <div className="grid md:grid-cols-2 gap-8">

      {/* Make Way For The King */}
      <div>

        <div className="aspect-video overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/3UKmHZOGon4"
            title="Make Way For The King"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

        </div>

        <h3 className="text-xl md:text-2xl font-semibold mt-5">
          Make Way For The King
        </h3>

        <p className="text-zinc-400 mt-1">
          Song
        </p>

      </div>

    </div>

  </div>
</section>
<a
      
  href="#countdown"
  onClick={() => setMenuOpen(false)}
  className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
>
  Release Countdown
</a>

  {/* TICKET BOOKING */}
<div className="mt-4 border-t border-white/15 pt-5">
  <p className="px-24 mb-4 text-base uppercase tracking-[0.25em] text-zinc-500">
    Book Tickets
  </p>

  <div className="flex items-start gap-7 px-24">
    {/* BOOKMYSHOW */}
    <a
      href="https://in.bookmyshow.com/movies/raaka/ET00494565"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setMenuOpen(false)}
      className="group flex w-[135px] flex-col items-center"
      title="Book Raaka on BookMyShow"
    >
      <div className="flex h-[80px] w-[135px] items-center justify-center overflow-hidden rounded-xl transition duration-300 group-hover:scale-105">
        <Image
          src="/images/logo2.jpg"
          alt="BookMyShow"
          width={321}
          height={157}
          className="h-auto w-full object-contain"
        />
      </div>

      <span className="mt-2 text-xs font-semibold text-white/80 group-hover:text-white">
        BookMyShow
      </span>
    </a>

    {/* DISTRICT */}
    <a
      href="https://www.district.in/movies/raaka-movie-tickets-MV218847"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setMenuOpen(false)}
      className="group flex w-[135px] flex-col items-center"
      title="Book Raaka on District"
    >
      <div className="flex h-[80px] w-[135px] items-center justify-center overflow-hidden rounded-xl transition duration-300 group-hover:scale-105">
        <Image
          src="/images/logo1.jpg"
          alt="District"
          width={715}
          height={429}
          className="h-auto w-full object-contain"
        />
      </div>

      <span className="mt-2 text-xs font-semibold text-white/80 group-hover:text-white">
        District
      </span>
    </a>
  </div>
</div>
        
       {/* EXTRA */}
      <section id="explore" className="max-w-7xl mx-auto px-6 py-24">

        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          More
        </p>

        <h2 className="text-4xl md:text-5xl font-bold mt-3">
          Explore More
        </h2>


        <div className="grid md:grid-cols-3 gap-5 mt-10">

          {/* News */}
          <div className="rounded-2xl bg-zinc-900 p-8 border border-white/10">

            <h3 className="text-xl font-bold">
              News & Updates
            </h3>

            <p className="text-zinc-500 mt-3">
              Latest announcements and updates about Raaka.
            </p>

          </div>


          {/* Characters */}
          <div className="rounded-2xl bg-zinc-900 p-8 border border-white/10">

            <h3 className="text-xl font-bold">
              Characters
            </h3>

            <p className="text-zinc-500 mt-3">
              Discover the characters and their roles.
            </p>

          </div>


          {/* Music */}
          <div className="rounded-2xl bg-zinc-900 p-8 border border-white/10">

            <h3 className="text-xl font-bold">
              Music
            </h3>

            <p className="text-zinc-500 mt-3">
              Songs, lyrical videos and music updates.
            </p>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10">

        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-2xl font-bold">
            WORLD OF RAAKA
          </h2>

          <p className="text-zinc-500 text-sm mt-2">
            Everything about Raaka in one place.
          </p>

        </div>

      </footer>

          
    </main>
    </>
  );
}
