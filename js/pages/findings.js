import { h, num } from "../ui/dom.js";
import { cite, cites, fold, pageHead, section, tag } from "../ui/kit.js";
import { FINDINGS, QUESTIONS } from "../../data/findings.js";
import { CHECKS, IDEAS, EVIDENCE } from "../../data/context.js";
import { DISTRICT_TABLES } from "../../data/district-scenarios.js";
import { CLASS_SIZE_DEFAULT, capacity, makePlan, pathB, tableLoads } from "../model/index.js";
import { PAIRS } from "../../data/district-scenarios.js";
import { SCHOOLS } from "../../data/schools.js";
import { ref } from "../../data/sources.js";

const WEIGHT = { major: "Could change the decision", moderate: "Worth an answer", minor: "Minor" };

export default {
  title: "What we checked",
  render(el) {
    const shown = FINDINGS.filter((f) => !f.pending);
    const questions = QUESTIONS.filter((q) => shown.some((f) => f.id === q.id));
    const copyBtn = h("button", { type: "button", class: "wonk-btn no-print" }, "Copy the questions");
    copyBtn.addEventListener("click", async () => {
      const text = questions.map((q, i) => `${i + 1}. ${q.text}`).join("\n");
      try {
        await navigator.clipboard.writeText(text);
        window.wonk?.toast("Questions copied", "ok");
      } catch {
        window.wonk?.toast("Copy did not work in this browser. Select the list and copy it instead.", "warn");
      }
    });

    el.append(
      pageHead({
        kicker: "What we checked",
        title: "We re-did the district's arithmetic. Most of it adds up. Here is what does not, and what is missing.",
        lede: "We checked the October 14 and October 28 presentations against each other and against the district's own reports. Each item shows what the slides say, what we found, and a question you can ask.",
      }),

      h(
        "nav",
        { class: "wonk-card glance", "aria-label": "Findings at a glance" },
        h("p", { class: "wonk-label" }, "At a glance"),
        h(
          "ol",
          {},
          shown.map((f) =>
            h(
              "li",
              {},
              h(
                "button",
                {
                  type: "button",
                  class: "glance-link",
                  onclick: () => {
                    const target = document.getElementById(`finding-${f.id}`);
                    target?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
                    target?.querySelector("h3")?.setAttribute("tabindex", "-1");
                    target?.querySelector("h3")?.focus({ preventScroll: true });
                  },
                },
                f.title
              ),
              h("span", { class: `weight weight--${f.weight}` }, ` · ${WEIGHT[f.weight]}`)
            )
          )
        ),
        h("p", { class: "small" }, h("button", { type: "button", class: "glance-link", onclick: () => document.getElementById("questions")?.scrollIntoView({ block: "start" }) }, "Jump to the questions to ask"))
      ),

      section(
        { id: "adds-up", title: "What checks out" },
        h("ul", { class: "checks" }, CHECKS.map((c) => h("li", {}, h("span", { class: "check-mark", "aria-hidden": "true" }, "✓"), h("span", {}, c.text, " ", c.ref ? cite(c.ref) : null))))
      ),

      section(
        { id: "items", title: "What we found", intro: `${shown.length} items, most important first.` },
        h("div", { class: "finding-list" }, shown.map(findingCard))
      ),

      section(
        { id: "questions", title: "Questions to bring to the board" },
        h("ol", { class: "prose question-list" }, questions.map((q) => h("li", {}, q.text))),
        h("div", { class: "btn-row" }, copyBtn, h("button", { type: "button", class: "wonk-btn wonk-btn--quiet no-print", onclick: () => window.print() }, "Print this page"))
      ),

      section(
        { id: "ideas", title: "Other ideas already on the record", intro: "Options residents and board members have raised. We list them as reported, without ranking them. You can try several on the Build a plan page." },
        h(
          "div",
          { class: "idea-list" },
          IDEAS.map((idea) =>
            h(
              "article",
              { class: "wonk-card idea" },
              h("h3", {}, idea.title),
              h("p", {}, idea.text),
              idea.record ? h("p", { class: "small" }, h("strong", {}, "On the record: "), idea.record, " ", idea.ref ? cite(idea.ref, idea.refLabel) : null) : null,
              idea.build ? h("p", { class: "small" }, h("a", { href: idea.build }, "Try it on Build a plan")) : null
            )
          )
        )
      ),

      section(
        { id: "research", title: "What research says about changing schools", intro: "A summary of published studies, for and against. Most are from other places; none tests HUUSD's exact plan." },
        h(
          "div",
          { class: "evidence" },
          EVIDENCE.map((group) =>
            h(
              "div",
              { class: "evidence-group" },
              h("h3", {}, group.topic),
              h("p", {}, group.summary),
              fold(
                `${group.studies.length} studies`,
                h(
                  "ul",
                  { class: "study-list" },
                  group.studies.map((st) => h("li", {}, h("strong", {}, st.cite), ` (${st.where}). `, st.finding, " ", st.url ? h("a", { href: st.url, target: "_blank", rel: "noopener", class: "cite" }, "Study") : null))
                )
              )
            )
          )
        )
      ),

      section(
        { id: "how", title: "How we checked" },
        h(
          "div",
          { class: "prose" },
          h("p", {}, "We copied every table and number from the district's presentations and reports into the data files behind this site, then had the computer re-add every row and column. Where two documents disagree, we show both. Where a number is ours rather than the district's, it is marked ", tag("derived"), " or ", tag("estimate"), "."),
          h("p", {}, "Facts from news reports, state law, and research were each checked against the original source by a second reviewer. The code and data are public, so anyone can check our work. ", h("a", { href: "#/sources" }, "Sources and method"))
        )
      )
    );
  },
};

function findingCard(f) {
  const body = [
    f.says ? h("div", { class: "f-part" }, h("p", { class: "wonk-label" }, "What the slides say"), h("p", {}, f.says)) : null,
    h("div", { class: "f-part" }, h("p", { class: "wonk-label" }, f.says ? "What we found" : "Details"), h("ul", {}, f.found.map((x) => h("li", {}, x)))),
    f.table === "fw" ? fwTable() : null,
    f.table === "k6" ? k6Table() : null,
    f.table === "permits" ? permitsTable() : null,
    f.why ? h("div", { class: "f-part" }, h("p", { class: "wonk-label" }, "Why it matters"), h("p", {}, f.why)) : null,
    f.ask ? h("div", { class: "f-part f-ask" }, h("p", { class: "wonk-label" }, "Question to ask"), h("p", {}, h("strong", {}, f.ask))) : null,
    h("p", { class: "small f-src" }, "Sources: ", cites(f.refs), f.link ? [" · ", h("a", { href: f.link.href }, f.link.label)] : null),
  ];
  return h(
    "article",
    { class: `wonk-card finding finding--${f.weight}`, id: `finding-${f.id}`, "aria-labelledby": `fh-${f.id}` },
    h("div", { class: "f-head" }, h("span", { class: `weight weight--${f.weight}` }, WEIGHT[f.weight]), h("h3", { id: `fh-${f.id}` }, f.title)),
    ...body
  );
}

function verdict(c) {
  return c.overPeople.length ? `✕ Over at ${c.overPeople.map((id) => SCHOOLS[id].short).join(", ")}` : "✓ Fits";
}

function k6Table() {
  const name = (id) => SCHOOLS[id].short;
  const rows = PAIRS.map((pair) => {
    const base = pathB(pair, 6);
    const slides = capacity(base);
    const permits = capacity(base, { reading: "permits" });
    const units = {};
    for (const s of slides.schools) if (s.overConsultant) units[s.id] = Math.ceil((s.total - s.consultantCapacity) / 40);
    return { pair, slides, permits, units };
  });
  return h(
    "div",
    { class: "table-scroll" },
    h(
      "table",
      { class: "wonk-table" },
      h("caption", {}, "Grades 5-6 in the valley (K-6 versions): the wastewater test read two ways, and the portable units needed to reach the consultant's classroom capacity"),
      h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Schools that stay open"), h("th", { scope: "col" }, "Wastewater, as on the slides"), h("th", { scope: "col" }, "Wastewater, as the permits read"), h("th", { scope: "col" }, "Portable units for classrooms"))),
      h(
        "tbody",
        {},
        rows.map((r) =>
          h(
            "tr",
            { class: r.slides.overPeople.length && r.permits.overPeople.length ? "is-muted" : "" },
            h("th", { scope: "row" }, r.pair.map(name).join(" + ")),
            h("td", {}, verdict(r.slides)),
            h("td", {}, verdict(r.permits)),
            h("td", {}, Object.keys(r.units).length ? Object.entries(r.units).map(([id, n]) => `${name(id)} ${n}`).join(", ") : "None")
          )
        )
      )
    ),
    h("p", { class: "small" }, "Student counts from the district's tables with corrected totals ", tag("district"), ". The permit reading counts staff where the permit does, using our staff estimate ", tag("estimate"), ". Portable units hold two classrooms of 20 ", tag("estimate"), ".")
  );
}

function permitsTable() {
  const rows = [
    ["WES", "230", "300 students (revised permit, 1991)"],
    ["FES", "250 (240 on October 14)", "235 students and staff (1992)"],
    ["MES", "235", "2,820 gallons a day (2015); about 235 to 282 people, staff included"],
    ["WRN", "237", "237 students and staff, full-time equivalent (2000)"],
  ];
  const refs = { WES: ref("permitWES", "condition 1.2"), FES: ref("permitFES", "project description"), MES: ref("permitMES", "condition 3.3"), WRN: ref("permitWRN", "project description") };
  return h(
    "div",
    { class: "table-scroll" },
    h(
      "table",
      { class: "wonk-table" },
      h("caption", {}, "Wastewater limits: what the slides use and what the state permits say"),
      h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "School"), h("th", { scope: "col" }, "On the slides (students)"), h("th", { scope: "col" }, "In the state permit"), h("th", { scope: "col" }, "Permit"))),
      h("tbody", {}, rows.map(([id, slide, permit]) => h("tr", {}, h("th", { scope: "row" }, SCHOOLS[id].short), h("td", {}, slide), h("td", {}, permit), h("td", {}, cite(refs[id], "Read it")))))
    )
  );
}

function fwTable() {
  const tables = DISTRICT_TABLES.filter((t) => t.pair.includes("FES") && t.pair.includes("WRN"));
  return h(
    "div",
    { class: "table-scroll" },
    h(
      "table",
      { class: "wonk-table" },
      h("caption", {}, "Fayston + Warren: printed totals vs. the sum of each column's own rows"),
      h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Table"), h("th", { scope: "col" }, "Building"), h("th", { scope: "col", class: "num" }, "Printed total"), h("th", { scope: "col", class: "num" }, "Rows add to"), h("th", { scope: "col", class: "num" }, "Limit"))),
      h(
        "tbody",
        {},
        tables.flatMap((t) => {
          const loads = tableLoads(t);
          return ["FES", "WRN", "BPS"].map((id) => {
            const rows = Object.values(loads[id]).reduce((a, b) => a + b, 0);
            const limit = { FES: 250, WRN: 237, BPS: 480 }[id];
            return h(
              "tr",
              { class: rows !== t.printedTotal[id] ? "is-wrong" : "" },
              h("th", { scope: "row" }, `Slide ${t.slide}, ${t.config === "K6" ? "K-6" : "Pre-K to 4"}`),
              h("td", {}, { FES: "Fayston", WRN: "Warren", BPS: "Brookside" }[id]),
              h("td", { class: "num" }, h("span", { class: "strike" }, num(t.printedTotal[id]))),
              h("td", { class: "num" }, h("strong", {}, num(rows))),
              h("td", { class: "num" }, num(limit))
            );
          });
        })
      )
    )
  );
}
