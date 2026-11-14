import Link from "next/link";
import { getHouse, getRooms, floorsTopDown } from "@/lib/content";
import { CopyButton } from "@/components/CopyPrompt";
import Gallery from "@/components/Gallery";

export const metadata = { title: "Design studio · Casa Muffoletto" };

export default function Studio() {
  const house = getHouse();
  const all = getRooms();
  const rooms = floorsTopDown(house).flatMap((f) => all.filter((r) => r.floor === f.id));
  const withPrompt = rooms.filter((r) => r.target?.renderPrompt);
  const isRender = (k?: string) => k === "render" || k === "target";
  const done = withPrompt.filter((r) => r.photos?.some((p) => isRender(p.kind)));
  const waiting = rooms.filter((r) => !r.target?.renderPrompt);

  return (
    <>
      <h1>Design studio</h1>
      <p className="lede">How every area should look when it's finished. Each room has its photo, a prompt written from what you've agreed, and the target image once it exists.</p>

      <div className="panel ask" style={{ margin: "18px 0" }}>
        <h3>How to make a visual</h3>
        <ol style={{ margin: 0, paddingLeft: "1.2em" }}>
          <li><strong>Download photo</strong> — saves that room's photo to your phone or computer.</li>
          <li><strong>Copy prompt</strong>, open ChatGPT, upload the photo and paste.</li>
          <li>Not right? Tell ChatGPT what to change. Happy? Send the image to Claude and it goes on this page as the target.</li>
        </ol>
        <p className="small muted" style={{ margin: "10px 0 0" }}>Image tools sometimes invent things — a window, panelling, a different floor. Check each result against the real room before a tradesperson works from it.</p>
      </div>

      <div className="chips" style={{ marginBottom: 8 }}>
        <span className="chip"><b>{done.length}</b> with a target image</span>
        <span className="chip"><b>{withPrompt.length - done.length}</b> ready for ChatGPT</span>
        {waiting.length > 0 && <span className="chip"><b>{waiting.length}</b> need photos first</span>}
      </div>

      {floorsTopDown(house).map((f) => {
        const list = withPrompt.filter((r) => r.floor === f.id);
        if (!list.length) return null;
        return (
          <section key={f.id} id={f.id}>
            <h2>{f.name}</h2>
            {list.map((r) => {
              const from = r.target!.renderFrom ?? r.photos?.[0]?.src;
              const now = r.photos?.find((p) => p.src === from);
              const renders = (r.photos ?? []).filter((p) => isRender(p.kind));
              const inspo = (r.photos ?? []).filter((p) => p.kind === "inspiration");
              return (
                <article className="studio" key={r.slug} id={r.slug}>
                  <div className="spread">
                    <h3 style={{ margin: 0, fontSize: "1.3rem" }}><Link href={`/rooms/${r.slug}`}>{r.name}</Link></h3>
                    <span className={`pill ${renders.length ? "done" : "designing"}`}>{renders.length ? "Target image done" : "Needs a visual"}</span>
                  </div>
                  {r.target?.concept && <p className="muted small" style={{ margin: "6px 0 12px", maxWidth: "90ch" }}>{r.target.concept}</p>}
                  <div className="studio-grid">
                    <div>
                      <div className="st-label">Now — upload this photo</div>
                      {now && <Gallery photos={[now]} min={240} />}
                      <div className="row" style={{ marginTop: 10 }}>
                        {from && <a className="btn ghost" href={from} download={`${r.slug}.jpg`}>Download photo</a>}
                        <CopyButton text={r.target!.renderPrompt!} />
                      </div>
                    </div>
                    <div>
                      <div className="st-label">{renders.length ? "Target" : "Target — not made yet"}</div>
                      {renders.length ? <Gallery photos={renders} min={240} /> : <div className="empty st-empty">Paste the prompt into ChatGPT with the photo, then send the result to Claude.</div>}
                      {inspo.length > 0 && (<><div className="st-label" style={{ marginTop: 10 }}>Inspiration</div><Gallery photos={inspo} min={160} /></>)}
                    </div>
                  </div>
                  <details style={{ marginTop: 10 }}><summary className="small">Read the prompt</summary><pre className="prompt">{r.target!.renderPrompt}</pre></details>
                </article>
              );
            })}
          </section>
        );
      })}

      {waiting.length > 0 && (
        <>
          <h2>Need photos first</h2>
          <ul>{waiting.map((r) => <li key={r.slug}><Link href={`/rooms/${r.slug}`}>{r.name}</Link></li>)}</ul>
        </>
      )}
    </>
  );
}
