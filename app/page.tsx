{/* FULL WEBSITE RAAKA BACKGROUND */}
<div className="fixed inset-0 -z-10 overflow-hidden bg-black">

  <div
    className="absolute inset-0 bg-cover bg-center animate-raaka-bg-1"
    style={{
      backgroundImage: "url('/images/raakabg.jpg')",
    }}
  />

  <div
    className="absolute inset-0 bg-cover bg-center animate-raaka-bg-2"
    style={{
      backgroundImage: "url('/images/raakabg1.jpg')",
    }}
  />

  <div
    className="absolute inset-0 bg-cover bg-center animate-raaka-bg-3"
    style={{
      backgroundImage: "url('/images/raakabg2.jpg')",
    }}
  />

  {/* Cinematic darkness */}
  <div className="absolute inset-0 bg-black/45" />

  {/* Bottom atmospheric fade */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

</div>
import Image from "next/image";

export default function Home() {
  return (
   <main className="min-h-screen bg-transparent text-white">

      {/* HERO */}
      <section className="relative min-h-screen flex items-end overflow-hidden">

       {/* Animated Backgrounds */}
<div className="absolute inset-0 overflow-hidden bg-black">

  {/* RAAKA Background 1 */}
  <div
    className="absolute inset-0 bg-cover bg-center animate-raaka-bg-1"
    style={{
      backgroundImage: "url('/images/raakabg.jpg')",
    }}
  />

  {/* RAAKA Background 2 */}
  <div
    className="absolute inset-0 bg-cover bg-center animate-raaka-bg-2"
    style={{
      backgroundImage: "url('/images/raakabg1.jpg')",
    }}
  />

  {/* RAAKA Background 3 */}
  <div
    className="absolute inset-0 bg-cover bg-center animate-raaka-bg-3"
    style={{
      backgroundImage: "url('/images/raakabg2.jpg')",
    }}
  />

  {/* Cinematic Overlay */}
  <div className="absolute inset-0 bg-black/40" />

  {/* Bottom Fade */}
  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />

</div>

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
              href="#videos"
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
              src="/images/RAAKAFL.jfif"
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
                  src="/images/actor2.jfif"
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
      <section className="px-6 md:px-10 py-24">

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
                  src="/images/crew2.jfif"
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
                  src="/images/crew3.jfif"
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
      <section className="px-6 md:px-10 py-24">

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
                  src="/images/RAAKAFL.jfif"
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
        id="videos"
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

                <video
                  src="/video/raaka1.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
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

                <video
                  src="/video/raaka2.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
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

                <video
                  src="/video/raaka3.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
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


      {/* EXTRA */}
      <section className="max-w-7xl mx-auto px-6 py-24">

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
  );
}
