import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RAAKA & Rākā — The Full Moon Connection | World of Raaka",
  description:
    "Exploring the ancient Sanskrit and Vedic meaning of Rākā, its connection with the full moon, and the mystery surrounding RAAKA.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#080808] text-[#eee]">
      <article className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:py-20">
        {/* Header */}
        <header className="border-b border-white/10 pb-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
            WORLD OF RAAKA · MYTHOLOGY
          </p>

          <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            RAAKA &amp; Rākā:
            <span className="block text-amber-400">
              The Full Moon Connection
            </span>
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65 sm:text-xl">
            The name RAAKA carries an ancient Sanskrit and Vedic association
            with the full moon. Could that meaning become an important part of
            the mythology of RAAKA?
          </p>

          <div className="mt-7 flex flex-wrap gap-3 text-xs uppercase tracking-widest text-white/45">
            <span className="rounded-full border border-white/10 px-4 py-2">
              Mythology
            </span>
            <span className="rounded-full border border-white/10 px-4 py-2">
              Rākā
            </span>
            <span className="rounded-full border border-white/10 px-4 py-2">
              Full Moon
            </span>
            <span className="rounded-full border border-white/10 px-4 py-2">
              RAAKA
            </span>
          </div>
        </header>

        {/* Hero visual */}
        <section className="relative my-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#17120b] via-[#0d0d0d] to-[#090909] p-8 sm:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-red-700/10 blur-3xl" />

          <div className="relative grid gap-10 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Ancient meaning
              </p>
              <p className="mt-3 text-3xl font-bold">Rākā</p>
              <p className="mt-2 leading-7 text-white/60">
                A Sanskrit term associated with the full-moon day and its
                personification in ancient tradition.
              </p>
            </div>

            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border border-amber-300/30 bg-gradient-to-br from-amber-100 via-amber-300 to-amber-500 text-6xl text-black shadow-[0_0_80px_rgba(245,158,11,0.18)]">
              ☾
            </div>

            <div className="md:text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Film mystery
              </p>
              <p className="mt-3 text-3xl font-bold">RAAKA</p>
              <p className="mt-2 leading-7 text-white/60">
                A title surrounded by King, beast and mysterious visual
                imagery.
              </p>
            </div>
          </div>
        </section>

        {/* Main article */}
        <div className="space-y-12 text-[17px] leading-8 text-white/75">
          <section>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Rākā कौन हैं?
            </h2>
            <p className="mt-4">
              <strong className="text-white">Rākā</strong> का प्राचीन संस्कृत
              संदर्भ पूर्णिमा से जुड़ा हुआ है। Sanskrit dictionary references
              में इसका अर्थ full-moon day या full moon से संबंधित मिलता है और
              वैदिक परंपरा में Rākā को पूर्णिमा के दिन की personification के
              रूप में भी वर्णित किया गया है।
            </p>
            <p className="mt-4">
              इसका अर्थ केवल “चाँद” कहना पर्याप्त नहीं है। पूर्णिमा अपने आप
              में <strong className="text-white">पूर्णता, परिपक्वता और
              culmination</strong> का प्रतीक बनती है। इसी वजह से Rākā नाम
              mythology के स्तर पर एक powerful symbolic meaning रखता है।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              🌕 Full Moon का symbolism
            </h2>
            <p className="mt-4">
              Lunar cycle में चंद्रमा लगातार बदलता है—अंधकार से दिखाई देने
              वाली crescent अवस्था, फिर बढ़ता हुआ moon, और अंततः पूर्णिमा।
              Full Moon इस cycle की visually पूर्ण अवस्था है।
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {[
                ["01", "Waxing", "शक्ति का बढ़ना"],
                ["02", "Gibbous", "चरम की ओर"],
                ["03", "Rākā", "पूर्णिमा / पूर्णता"],
                ["04", "Waning", "अगले cycle की ओर"],
              ].map(([n, title, text]) => (
                <div
                  key={n}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <span className="text-xs text-amber-400">{n}</span>
                  <h3 className="mt-2 font-bold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/50">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              🐾 RAAKA और Allu Arjun का Beast-like First Look
            </h2>
            <p className="mt-4">
              RAAKA के first look में Allu Arjun को सामान्य royal character की
              तरह नहीं, बल्कि एक बेहद animalistic और supernatural visual
              language में प्रस्तुत किया गया। Fur, claws और intense physical
              styling ने character के बारे में mystery को और बढ़ाया।
            </p>
            <p className="mt-4">
              अगर फिल्म में lunar mythology वास्तव में कहानी का हिस्सा है, तो
              यह visual एक possible transformation या supernatural state की
              ओर संकेत कर सकता है। <strong className="text-amber-300">
              लेकिन यह अभी officially confirmed नहीं है।
              </strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              👑 “Make Way For The King”
            </h2>
            <p className="mt-4">
              RAAKA के title-announcement campaign में{" "}
              <strong className="text-white">“Make Way For The King”</strong>{" "}
              जैसी royal imagery इस्तेमाल की गई। इससे character के साथ
              throne, crown, power और rulership की visual language जुड़ती है।
            </p>
            <p className="mt-4">
              जब इसे Rākā के “fullness” symbolism और first look के beast imagery
              के साथ देखा जाता है, तो एक intriguing combination बनता है:
            </p>

            <div className="mt-6 rounded-3xl border border-amber-400/20 bg-amber-400/[0.04] p-6 sm:p-8">
              <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-center sm:gap-5">
                <span className="text-xl font-bold">RĀKĀ</span>
                <span className="text-amber-400">→</span>
                <span className="text-xl font-bold">FULL MOON</span>
                <span className="text-amber-400">→</span>
                <span className="text-xl font-bold">POWER / FULLNESS</span>
                <span className="text-amber-400">→</span>
                <span className="text-xl font-bold">KING</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              ✋ The Hand Gesture
            </h2>
            <p className="mt-4">
              RAAKA campaign में दिखाई देने वाला distinctive hand gesture भी
              character identity का हिस्सा प्रतीत होता है। हालांकि उसके exact
              mythological meaning को makers ने अभी officially explain नहीं
              किया है।
            </p>
            <p className="mt-4">
              इसलिए इसे किसी specific ancient mudra, demon sigil या occult
              symbol के रूप में identify करना अभी उचित नहीं होगा। इसका meaning
              फिल्म के future reveals से ही स्पष्ट होगा।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              👸 Queen और RAAKA की mythology
            </h2>
            <p className="mt-4">
              Deepika Padukone के introduction campaign में makers ने
              <strong className="text-white"> “The Queen marches to
              conquer”</strong> जैसी wording इस्तेमाल की। इससे promotional
              mythology में King–Queen dynamic का संकेत मिलता है।
            </p>
            <p className="mt-4">
              लेकिन इससे यह निष्कर्ष निकालना अभी संभव नहीं है कि Deepika का
              character स्वयं Rākā देवी है। वह connection अभी officially
              स्थापित नहीं किया गया है।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              🔢 और फिर आता है — 37
            </h2>
            <p className="mt-4">
              RAAKA campaign में cryptic{" "}
              <strong className="text-amber-300">“37”</strong> ने mystery को
              और बढ़ाया है। वर्तमान में इसका official explanation उपलब्ध नहीं
              है।
            </p>
            <p className="mt-4">
              इसलिए 37 को किसी particular demon, lunar day, character number
              या mythology से जोड़ना अभी speculation होगा। इसे फिलहाल एक
              <strong className="text-white"> intentionally unexplained clue
              </strong> के रूप में देखना सबसे सुरक्षित है।
            </p>
          </section>

          {/* Evidence box */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white">
              What is confirmed vs what remains a mystery?
            </h2>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-[1fr_auto] border-b border-white/10 bg-white/[0.04] px-5 py-4 text-xs uppercase tracking-widest text-white/45">
                <span>Clue</span>
                <span>Status</span>
              </div>

              {[
                ["Rākā is associated with the full moon", "CONFIRMED"],
                ["RAAKA is the film title", "CONFIRMED"],
                ["Allu Arjun has beast-like visual styling", "CONFIRMED"],
                ["King imagery is used in the campaign", "CONFIRMED"],
                ["Distinctive hand gesture", "CONFIRMED"],
                ["Lunar cycle drives the plot", "UNKNOWN"],
                ["Full Moon triggers transformation", "UNKNOWN"],
                ["37 has a lunar meaning", "UNKNOWN"],
              ].map(([clue, status]) => (
                <div
                  key={clue}
                  className="grid grid-cols-[1fr_auto] gap-5 border-b border-white/10 px-5 py-4 last:border-0"
                >
                  <span className="text-sm text-white/65">{clue}</span>
                  <span
                    className={`text-[10px] font-bold tracking-widest ${
                      status === "CONFIRMED"
                        ? "text-emerald-400"
                        : "text-amber-300"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              The Mystery Continues
            </h2>
            <p className="mt-4">
              Rākā का ancient full-moon connection वास्तविक है। लेकिन RAAKA
              फिल्म उस mythology को किस रूप में इस्तेमाल कर रही है—एक देवी,
              शक्ति, cosmic event, transformation, kingdom या किसी बिल्कुल
              नए fictional mythology के रूप में—यह अभी सामने नहीं आया है।
            </p>
            <p className="mt-4">
              यही इस title को इतना intriguing बनाता है:{" "}
              <strong className="text-white">
                Full Moon, King, Beast, Queen, mysterious hand gesture और 37
              </strong>{" "}
              सभी clues एक बड़े world-building puzzle का हिस्सा दिखाई देते
              हैं, लेकिन उसका पूरा उत्तर अभी फिल्म के पास है।
            </p>
          </section>
        </div>

        {/* Footer note */}
        <footer className="mt-14 border-t border-white/10 pt-8">
          <p className="text-xs leading-6 text-white/35">
            Editorial note: This article separates established Sanskrit/Vedic
            meanings and officially released RAAKA material from interpretations
            about the film&apos;s unrevealed mythology. Any unconfirmed
            connection is intentionally presented as unknown rather than fact.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-amber-400/70">
            WORLD OF RAAKA · THE WORLD IS ONLY BEGINNING
          </p>
        </footer>
      </article>
    </main>
  );
}