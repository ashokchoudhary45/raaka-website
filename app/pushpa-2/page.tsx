import React from "react";

const languages = [
  ["Telugu", "Original"],
  ["Hindi", "Dubbed"],
  ["Tamil", "Dubbed"],
  ["Kannada", "Dubbed"],
  ["Malayalam", "Dubbed"],
];

const territories = [
  "Andhra Pradesh",
  "Telangana",
  "AP + Telangana",
  "Karnataka",
  "Tamil Nadu",
  "Kerala",
  "Rest of India",
  "India Total",
];

const overseas = [
  "USA / Canada",
  "UK / Ireland",
  "Australia / New Zealand",
  "UAE / GCC",
  "Malaysia / Singapore",
  "Rest of World",
  "Overseas Total",
];

const days = Array.from({ length: 10 }, (_, i) => i + 1);

export default function Page() {
  return (
    <>
      <style>{`
        .p2-page{
          min-height:100vh;
          background:
            radial-gradient(circle at 50% -15%, rgba(117,107,83,.10), transparent 34%),
            linear-gradient(180deg,#030507 0%,#020304 100%);
          color:#eeeae2;
          font-family:Inter,Arial,sans-serif;
          padding:0 0 50px;
        }
        .p2-page *{box-sizing:border-box}
        .p2-grain{
          position:fixed;inset:0;pointer-events:none;z-index:40;opacity:.026;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")
        }
        .p2-container{width:min(1080px,calc(100% - 42px));margin:0 auto}
        .p2-hero{text-align:center;padding:76px 0 37px}
        .p2-overline{font-size:8px;letter-spacing:.38em;color:#c7ad78;font-weight:700;text-transform:uppercase;margin-bottom:10px}
        .p2-film-title{
          margin:0;
          font-family:"Georgia","Times New Roman",serif;
          font-size:clamp(42px,5vw,70px);
          line-height:1.02;
          letter-spacing:-.035em;
          text-transform:uppercase;
          color:#e5dfd4;
        }
        .p2-box-office{
          margin-top:12px;
          font-size:9px;
          letter-spacing:.34em;
          color:#a79778;
          font-weight:700;
          text-transform:uppercase;
        }
        .p2-subtitle{color:#747875;font-size:10px;margin-top:11px}
        .p2-line{height:1px;width:52px;background:#b99f70;opacity:.68;margin:22px auto 0}
        .p2-stats{
          display:grid;grid-template-columns:repeat(3,1fr);
          border:1px solid #20252b;border-radius:10px;overflow:hidden;background:rgba(9,12,15,.78);
          box-shadow:0 15px 45px rgba(0,0,0,.25)
        }
        .p2-stat{padding:19px 22px 17px;min-height:98px;border-right:1px solid #20252b}
        .p2-stat:last-child{border-right:0}
        .p2-label{font-size:7px;letter-spacing:.23em;text-transform:uppercase;color:#8e876f;font-weight:700}
        .p2-money{
          display:flex;align-items:center;gap:10px;margin-top:10px;
          font-family:"Georgia","Times New Roman",serif;font-size:29px;font-weight:800;letter-spacing:-.02em
        }
        .p2-currency{font-family:Inter,Arial,sans-serif;font-size:18px;color:#a9a59d;font-weight:400}
        .p2-muted{font-size:7px;color:#555b5d;letter-spacing:.13em;text-transform:uppercase;margin-top:6px}
        .p2-section{margin-top:38px}
        .p2-kicker{font-size:7px;color:#b9a06f;letter-spacing:.30em;text-transform:uppercase;font-weight:700}
        .p2-section-title{
          font-family:"Georgia","Times New Roman",serif;
          font-size:18px;margin:6px 0 15px;color:#e7e2d9;letter-spacing:-.01em
        }
        .p2-language-list{border-top:1px solid #20252b}
        .p2-language{
          min-height:43px;border-bottom:1px solid #15191e;display:grid;grid-template-columns:1fr auto;align-items:center
        }
        .p2-lang-name{font-size:10px;font-weight:600;color:#ddd9d0}
        .p2-lang-tag{margin-left:9px;font-size:6px;letter-spacing:.08em;text-transform:uppercase;color:#777875}
        .p2-lang-value{font-family:"Georgia","Times New Roman",serif;font-size:16px;font-weight:800;color:#ded9cf}
        .p2-tba{font-size:6px;letter-spacing:.13em;color:#666a68;margin-right:3px;text-transform:uppercase}
        .p2-quick{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-top:31px}
        .p2-quick-card{
          border:1px solid #20252b;border-radius:9px;background:linear-gradient(145deg,#0a0d11,#07090c);
          padding:16px 14px 14px;min-height:86px
        }
        .p2-quick-label{font-size:6px;letter-spacing:.2em;color:#77756d;text-transform:uppercase}
        .p2-quick-value{font-family:"Georgia","Times New Roman",serif;font-weight:800;font-size:17px;margin-top:9px}
        .p2-divider{height:1px;background:linear-gradient(90deg,transparent,#20252b,transparent);margin:43px 0}
        .p2-detail{margin-top:46px}
        .p2-detail-head{display:flex;align-items:end;justify-content:space-between;margin-bottom:15px}
        .p2-detail-number{font-family:"Georgia","Times New Roman",serif;font-size:11px;color:#514d43}
        .p2-table-wrap{overflow-x:auto;border-top:1px solid #20252b}
        .p2-table{width:100%;border-collapse:collapse;min-width:720px}
        .p2-table th,.p2-table td{padding:13px 12px;border-bottom:1px solid #15191e;font-size:9px}
        .p2-table th{
          color:#6d6d68;font-size:6px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;text-align:right
        }
        .p2-table th:first-child,.p2-table td:first-child{text-align:left}
        .p2-table td{color:#b7b4ad;text-align:right}
        .p2-table td:first-child{font-weight:600;color:#d4d0c8}
        .p2-days{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
        .p2-day{
          border:1px solid #20252b;background:#080b0e;border-radius:7px;padding:15px;transition:.2s
        }
        .p2-day:hover{border-color:#71634e;transform:translateY(-2px)}
        .p2-day-no{font-size:7px;color:#bca473;letter-spacing:.18em}
        .p2-day-value{font-family:"Georgia","Times New Roman",serif;font-size:22px;font-weight:800;margin-top:15px}
        .p2-day-label{font-size:6px;color:#626866;text-transform:uppercase;letter-spacing:.10em;margin-top:5px}
        .p2-final{
          margin:62px 0 0;padding:48px 0 50px;border-top:1px solid #20252b;border-bottom:1px solid #20252b;text-align:center
        }
        .p2-final-label{font-size:7px;letter-spacing:.28em;color:#bda674;text-transform:uppercase}
        .p2-final h2{font-family:"Georgia","Times New Roman",serif;font-size:31px;margin:9px 0 22px;color:#ddd5c8}
        .p2-final-big{
          font-family:"Georgia","Times New Roman",serif;font-size:clamp(60px,9vw,105px);
          font-weight:800;color:#c8b17d;line-height:.8
        }
        .p2-footer{text-align:center;color:#4e5352;font-size:7px;letter-spacing:.2em;text-transform:uppercase;padding:25px 0 20px}
        @media(max-width:700px){
          .p2-container{width:min(100% - 28px,1080px)}
          .p2-stats{grid-template-columns:1fr}
          .p2-stat{border-right:0;border-bottom:1px solid #20252b}
          .p2-stat:last-child{border-bottom:0}
          .p2-quick{grid-template-columns:1fr 1fr}
          .p2-days{grid-template-columns:1fr 1fr}
        }
        @media(max-width:430px){
          .p2-film-title{font-size:38px}
          .p2-quick{grid-template-columns:1fr}
          .p2-days{grid-template-columns:1fr 1fr}
        }
      `}</style>

      <div className="p2-page">
        <div className="p2-grain" />

        <header className="p2-hero p2-container">
          <div className="p2-overline">Theatrical Performance</div>
          <h1 className="p2-film-title">Pushpa 2: The Rule</h1>
          <div className="p2-box-office">Box Office Collection</div>
          <div className="p2-subtitle">Worldwide theatrical box office performance</div>
          <div className="p2-line" />
        </header>

        <div className="p2-container">
          <section className="p2-stats">
            {["Worldwide Gross", "India Gross", "Overseas Gross"].map((title) => (
              <div className="p2-stat" key={title}>
                <div className="p2-label">{title}</div>
                <div className="p2-money"><span className="p2-currency">₹</span>TBA</div>
                <div className="p2-muted">Collection</div>
              </div>
            ))}
          </section>

          <section className="p2-section">
            <div className="p2-kicker">Language Wise</div>
            <h2 className="p2-section-title">Collection</h2>
            <div className="p2-language-list">
              {languages.map(([name, tag]) => (
                <div className="p2-language" key={name}>
                  <div>
                    <span className="p2-lang-name">{name}</span>
                    <span className="p2-lang-tag">{tag}</span>
                  </div>
                  <div className="p2-lang-value"><span className="p2-tba">₹</span>TBA</div>
                </div>
              ))}
            </div>
          </section>

          <section className="p2-quick">
            {["Opening Day", "First Weekend", "India Net", "Highest Day"].map((title) => (
              <div className="p2-quick-card" key={title}>
                <div className="p2-quick-label">{title}</div>
                <div className="p2-quick-value">₹ TBA</div>
              </div>
            ))}
          </section>

          <div className="p2-divider" />

          <section id="day1" className="p2-detail">
            <div className="p2-detail-head">
              <div>
                <div className="p2-kicker">Opening Day</div>
                <h2 className="p2-section-title">Day 1 — Worldwide</h2>
              </div>
              <div className="p2-detail-number">01</div>
            </div>
            <div className="p2-table-wrap">
              <table className="p2-table">
                <thead><tr><th>Market</th><th>Net</th><th>Gross</th><th>Share</th></tr></thead>
                <tbody>
                  {["India", "Overseas", "Worldwide"].map((row) => (
                    <tr key={row}><td>{row}</td><td>—</td><td>—</td><td>—</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="territory" className="p2-detail">
            <div className="p2-detail-head">
              <div><div className="p2-kicker">India Market</div><h2 className="p2-section-title">Territory Wise</h2></div>
              <div className="p2-detail-number">IN</div>
            </div>
            <div className="p2-table-wrap">
              <table className="p2-table">
                <thead><tr><th>Territory</th><th>Net</th><th>Gross</th></tr></thead>
                <tbody>{territories.map((x) => <tr key={x}><td>{x}</td><td>—</td><td>—</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section id="days" className="p2-detail">
            <div className="p2-detail-head">
              <div><div className="p2-kicker">Opening Run</div><h2 className="p2-section-title">Day 01 — Day 10</h2></div>
              <div className="p2-detail-number">10D</div>
            </div>
            <div className="p2-days">
              {days.map((i) => (
                <div className="p2-day" key={i}>
                  <div className="p2-day-no">DAY {String(i).padStart(2, "0")}</div>
                  <div className="p2-day-value">₹ TBA</div>
                  <div className="p2-day-label">Worldwide Gross</div>
                </div>
              ))}
            </div>
            <div style={{height:18}} />
            <div className="p2-table-wrap">
              <table className="p2-table">
                <thead><tr><th>Day</th><th>India Net</th><th>India Gross</th><th>Overseas</th><th>Worldwide</th><th>Cumulative</th></tr></thead>
                <tbody>{days.map((i) => <tr key={i}><td>Day {String(i).padStart(2, "0")}</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section id="weekend" className="p2-detail">
            <div className="p2-detail-head">
              <div><div className="p2-kicker">Milestone</div><h2 className="p2-section-title">First Weekend</h2></div>
              <div className="p2-detail-number">W/E</div>
            </div>
            <div className="p2-stats">
              {["India Gross", "Overseas Gross", "Worldwide Gross"].map((title) => (
                <div className="p2-stat" key={title}>
                  <div className="p2-label">{title}</div>
                  <div className="p2-money"><span className="p2-currency">₹</span>TBA</div>
                </div>
              ))}
            </div>
          </section>

          <section id="overseas" className="p2-detail">
            <div className="p2-detail-head">
              <div><div className="p2-kicker">Global Market</div><h2 className="p2-section-title">Overseas Collection</h2></div>
              <div className="p2-detail-number">WW</div>
            </div>
            <div className="p2-table-wrap">
              <table className="p2-table">
                <thead><tr><th>Market</th><th>Gross</th><th>Share</th></tr></thead>
                <tbody>{overseas.map((x) => <tr key={x}><td>{x}</td><td>—</td><td>—</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section id="lifetime" className="p2-detail">
            <div className="p2-detail-head">
              <div><div className="p2-kicker">Final Theatrical Run</div><h2 className="p2-section-title">Lifetime Collection</h2></div>
              <div className="p2-detail-number">∞</div>
            </div>

            <section className="p2-stats" style={{margin:0}}>
              {["India Net", "India Gross", "Overseas Gross"].map((title) => (
                <div className="p2-stat" key={title}>
                  <div className="p2-label">{title}</div>
                  <div className="p2-money"><span className="p2-currency">₹</span>TBA</div>
                </div>
              ))}
            </section>

            <div className="p2-section">
              <div className="p2-kicker">Final Breakdown</div>
              <h2 className="p2-section-title">Language Wise</h2>
              <div className="p2-table-wrap">
                <table className="p2-table">
                  <thead><tr><th>Language</th><th>India Net</th><th>India Gross</th><th>Share</th></tr></thead>
                  <tbody>
                    {[...languages.map((x) => x[0]), "Other / Combined", "India Total"].map((x) => (
                      <tr key={x}><td>{x}</td><td>—</td><td>—</td><td>—</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p2-section">
              <div className="p2-kicker">Final Breakdown</div>
              <h2 className="p2-section-title">Territory Wise</h2>
              <div className="p2-table-wrap">
                <table className="p2-table">
                  <thead><tr><th>Territory</th><th>Net</th><th>Gross</th></tr></thead>
                  <tbody>{territories.map((x) => <tr key={x}><td>{x}</td><td>—</td><td>—</td></tr>)}</tbody>
                </table>
              </div>
            </div>

            <div className="p2-section">
              <div className="p2-kicker">Final Breakdown</div>
              <h2 className="p2-section-title">Overseas Wise</h2>
              <div className="p2-table-wrap">
                <table className="p2-table">
                  <thead><tr><th>Market</th><th>Lifetime Gross</th><th>Share / Note</th></tr></thead>
                  <tbody>{overseas.map((x) => <tr key={x}><td>{x}</td><td>—</td><td>—</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="p2-final">
            <div className="p2-final-label">Worldwide Lifetime</div>
            <h2>Pushpa 2: The Rule</h2>
            <div className="p2-final-big">₹ TBA</div>
          </section>
        </div>

        <footer className="p2-footer">Pushpa 2 Office • Box Office Collection</footer>
      </div>
    </>
  );
}
