import { Bullets, TwoCol, Card, TechChip, DiagramStage, StatRow } from "./content";
import {
  ClassDiagram,
  DeploymentDiagram,
  UseCaseDiagram,
  CommunicationDiagram,
  SequenceDiagram,
  ActivityDiagram,
  StateDiagram,
} from "./Diagrams";

// ══════════════════════════════════════════════════════════════════════════════
// TITLE / SECTION SLIDES (bare = custom full-bleed layout, no default chrome)
// ══════════════════════════════════════════════════════════════════════════════
function TitleSlide() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 100px" }}>
      <div className="s-pill" style={{ marginBottom: 26 }}>
        <span className="d" style={{ background: "#6ee7b7" }} />
        SOFTWARE ENGINEERING — MINI PROJECT
      </div>
      <h1 style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.08 }}>
        Online Learning Platform
      </h1>
      <p style={{ fontSize: 19, color: "var(--stext2)", marginTop: 16, maxWidth: 760 }}>
        A UML-driven, fully client-side Learning Management System — designed with
        seven UML diagrams, then built with React &amp; IndexedDB.
      </p>
      <div style={{ display: "flex", gap: 14, marginTop: 40 }}>
        <div className="s-card" style={{ padding: "14px 22px" }}>
          <div style={{ fontSize: 11.5, color: "var(--smuted)", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>Presented by</div>
          <div style={{ fontSize: 15.5, fontWeight: 700, marginTop: 4 }}>Ali Hassan Khan &amp; Ubaid Ullah Sabir</div>
        </div>
      </div>
    </div>
  );
}

function SectionSlide({ n, label, title, sub }) {
  return function Body() {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 100px" }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: "var(--saccent)", fontWeight: 700, letterSpacing: ".1em" }}>
          SECTION {n} — {label}
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginTop: 14, letterSpacing: "-.02em" }} dangerouslySetInnerHTML={{ __html: title }} />
        {sub && <p style={{ fontSize: 17, color: "var(--stext2)", marginTop: 16, maxWidth: 760 }}>{sub}</p>}
      </div>
    );
  };
}

function ThankYouSlide() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <h1 style={{ fontSize: 54, fontWeight: 800 }}>Thank You</h1>
      <p style={{ fontSize: 18, color: "var(--stext2)", marginTop: 14 }}>Questions &amp; Discussion</p>
      <div style={{ display: "flex", gap: 28, marginTop: 36 }}>
        <div className="s-pill">Ali Hassan Khan</div>
        <div className="s-pill">Ubaid Ullah Sabir</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE DECK
// ══════════════════════════════════════════════════════════════════════════════
export const SLIDES = [
  { id: "title", bare: true, Body: TitleSlide, nav: "Title" },

  {
    id: "agenda",
    kicker: "Agenda",
    title: "What we'll cover today",
    nav: "Agenda",
    Body: () => (
      <Bullets
        items={[
          "<b>The problem</b> — why we built an Online Learning Platform, and what it needs to model.",
          "<b>UML foundations</b> — what UML is, why we designed before we coded.",
          "<b>Seven UML diagrams</b> — the theory, then the same diagram redrawn against our own schema.",
          "<b>Architecture &amp; tech stack</b> — how the app actually runs, and why each tool was chosen.",
          "<b>Live demo</b> — Dashboard → CRUD Manager → Schema → ERD → this Slides feature.",
          "<b>Challenges, learnings &amp; what's next.</b>",
        ]}
      />
    ),
  },

  {
    id: "problem",
    kicker: "The Problem",
    title: "Modeling a real, relational domain",
    sub: "We needed a project substantial enough to exercise every major UML diagram — not a toy CRUD app with one table.",
    nav: "Problem",
    Body: () => (
      <TwoCol
        left={
          <Bullets
            items={[
              "An online learning platform naturally has <b>seven related entities</b>: Instructor, Course, Module, Lesson, Student, StudentProfile, Enrollment.",
              "It has <b>one-to-many</b>, <b>one-to-one</b>, and <b>many-to-many (via a join entity)</b> relationships — enough variety to justify a full class diagram.",
              "It has real <b>workflows</b> (enrolling, authoring a course) worth tracing through sequence, communication, activity and state diagrams.",
            ]}
          />
        }
        right={
          <StatRow
            stats={[
              { l: "Entities", v: "7", c: "#6ee7b7" },
              { l: "Relationships", v: "5", c: "#5aa6ff" },
              { l: "CRUD Screens", v: "7", c: "#b79bff" },
              { l: "UML Diagrams", v: "7", c: "#ffc26e" },
            ]}
          />
        }
      />
    ),
  },

  {
    id: "what-is-uml",
    kicker: "UML Foundations",
    title: "What is the <span class='hl'>Unified Modeling Language</span>?",
    sub: "UML is a standard visual language for designing, understanding, and documenting software — the same way architects use blueprints before builders break ground.",
    nav: "What is UML",
    Body: () => (
      <TwoCol
        left={
          <Card title="Four main uses of UML" color="#5aa6ff">
            <b>Visualize</b> the structure &amp; behavior of a system · <b>Specify</b> its requirements and design clearly · <b>Construct</b> a shared blueprint developers can build from · <b>Document</b> the design for future maintenance.
          </Card>
        }
        right={
          <Card title="Why we modeled before we coded" color="#6ee7b7">
            Every entity, relationship, and workflow in LearnPlatform was drawn as a diagram <i>first</i>. The app's own <b>Schema &amp; Relationships</b> and <b>ERD</b> pages are, in effect, that documentation made interactive.
          </Card>
        }
      />
    ),
  },

  {
    id: "uml-history",
    kicker: "UML Foundations",
    title: "A brief history, and the 7 diagrams we used",
    nav: "History",
    Body: () => (
      <TwoCol
        left={
          <Bullets
            items={[
              "Mid-1990s — <b>Grady Booch</b>, <b>James Rumbaugh</b> and <b>Ivar Jacobson</b> (\"The Three Amigos\") merged competing modeling methods into one language.",
              "1997 — UML 1.0 submitted to, then adopted by, the <b>Object Management Group (OMG)</b> as UML 1.1.",
              "Later — UML evolved into <b>UML 2.0</b>, the version whose notation we use throughout this deck.",
            ]}
          />
        }
        right={
          <div className="chip-row">
            {["Class", "Deployment", "Use Case", "Sequence", "Communication", "Activity", "State"].map((d, i) => (
              <div key={d} className="s-pill" style={{ padding: "10px 16px" }}>
                <span className="d" style={{ background: ["#6ee7b7", "#5aa6ff", "#b79bff", "#ffc26e", "#ff8fc2", "#34d6a8", "#ff7a7a"][i] }} />
                {d} Diagram
              </div>
            ))}
          </div>
        }
      />
    ),
  },

  // ── SECTION: CLASS DIAGRAM ──────────────────────────────────────────────
  { id: "s-class", bare: true, Body: SectionSlide({ n: 1, label: "STRUCTURE", title: "Class Diagram", sub: "The static blueprint of the system — classes, attributes, operations, and how they relate." }), nav: "§ Class Diagram" },

  {
    id: "class-theory",
    kicker: "Class Diagram — Theory",
    title: "Classes, visibility, and relationships",
    nav: "Class — Theory",
    Body: () => (
      <TwoCol
        left={
          <Bullets
            items={[
              "A class box has 3 sections: <b>name</b>, <b>attributes</b>, <b>operations</b>. Visibility: <code>+</code> public, <code>-</code> private, <code>#</code> protected, <code>~</code> package.",
              "<b>Generalization</b> (hollow triangle) = inheritance. <b>Association</b> (plain line) = structural link, often with multiplicity (<code>1</code>, <code>0..1</code>, <code>*</code>, <code>1..*</code>).",
              "<b>Aggregation</b> (hollow diamond) = weak whole-part. <b>Composition</b> (filled diamond) = strong whole-part — the part's lifecycle belongs to the whole.",
              "<b>Dependency</b> (dashed arrow) = one class uses another; a change downstream may ripple upstream.",
            ]}
          />
        }
        right={
          <Card title="Rule of thumb" color="#b79bff">
            If the diagram omits a detail, that doesn't mean the system lacks it — UML diagrams are deliberately selective to stay readable.
          </Card>
        }
      />
    ),
  },

  {
    id: "class-applied",
    kicker: "Class Diagram — Applied to LearnPlatform",
    title: "Our actual schema, redrawn as UML",
    sub: "Course → Module → Lesson is composition (a lesson has no meaning without its module). Student ↔ Course is many-to-many, resolved through the Enrollment association entity.",
    nav: "Class — Applied",
    Body: () => (
      <DiagramStage>
        <ClassDiagram />
      </DiagramStage>
    ),
  },

  // ── SECTION: DEPLOYMENT DIAGRAM ─────────────────────────────────────────
  { id: "s-deploy", bare: true, Body: SectionSlide({ n: 2, label: "PHYSICAL TOPOLOGY", title: "Deployment Diagram", sub: "Where the software actually runs, and how the pieces are wired together." }), nav: "§ Deployment" },

  {
    id: "deploy-theory",
    kicker: "Deployment Diagram — Theory",
    title: "Devices, artifacts, execution environments",
    nav: "Deployment — Theory",
    Body: () => (
      <Bullets
        items={[
          "A <b>«device»</b> is physical hardware the software runs on (computer, server, phone).",
          "A <b>communication path</b> is a connection between devices, often labelled with a protocol (HTTP, TCP/IP).",
          "An <b>«artifact»</b> is the actual deployed file — an app bundle, an executable, a package.",
          "An <b>«execution environment»</b> hosts other software — an OS, a JVM, a browser runtime.",
          "<b>Tagged values</b> attach extra facts to a node, e.g. <code>{os=Linux}</code>, <code>{ram=16GB}</code>.",
        ]}
      />
    ),
  },

  {
    id: "deploy-applied",
    kicker: "Deployment Diagram — Applied to LearnPlatform",
    title: "One device. No server. By design.",
    sub: "Everything lives inside the user's own browser — the React bundle and IndexedDB are both artifacts on the same machine.",
    nav: "Deployment — Applied",
    Body: () => (
      <DiagramStage>
        <DeploymentDiagram />
      </DiagramStage>
    ),
  },

  // ── SECTION: USE CASE DIAGRAM ───────────────────────────────────────────
  { id: "s-usecase", bare: true, Body: SectionSlide({ n: 3, label: "USER PERSPECTIVE", title: "Use Case Diagram", sub: "What the user can actually do with the system, described without any implementation detail." }), nav: "§ Use Case" },

  {
    id: "usecase-theory",
    kicker: "Use Case Diagram — Theory",
    title: "Actors, use cases, and «include»",
    nav: "Use Case — Theory",
    Body: () => (
      <Bullets
        items={[
          "An <b>actor</b> (stick figure) is a person, role, or external system interacting with the software.",
          "A <b>use case</b> (oval) is a goal the user wants to accomplish — e.g. “Download Music”, “Burn CD”.",
          "An <b>association</b> line connects an actor to the use cases it triggers.",
          "The <b>«include»</b> relationship factors out steps shared by multiple use cases, so they aren't duplicated in the diagram.",
          "The diagram gives the overview; the <i>detailed</i> step-by-step flow is written separately as a textual use-case description.",
        ]}
      />
    ),
  },

  {
    id: "usecase-applied",
    kicker: "Use Case Diagram — Applied to LearnPlatform",
    title: "Everything a user can do in the app",
    nav: "Use Case — Applied",
    Body: () => (
      <DiagramStage>
        <UseCaseDiagram />
      </DiagramStage>
    ),
  },

  // ── SECTION: COMMUNICATION DIAGRAM ──────────────────────────────────────
  { id: "s-comm", bare: true, Body: SectionSlide({ n: 4, label: "OBJECT COLLABORATION", title: "Communication Diagram", sub: "Who talks to whom — object relationships first, message order second." }), nav: "§ Communication" },

  {
    id: "comm-theory",
    kicker: "Communication Diagram — Theory",
    title: "Objects, links, and numbered messages",
    nav: "Communication — Theory",
    Body: () => (
      <Bullets
        items={[
          "Objects are boxes; the lines between them are <b>associations</b> that can carry messages — the same two objects a sequence diagram would show as lifelines.",
          "Where a <b>sequence diagram</b> emphasizes <i>time</i>, a communication diagram emphasizes the <i>relationships</i> between objects.",
          "Each message is <b>numbered</b> (1, 2, 3…) to show order, and nested calls get dotted numbers — <code>1.1</code>, <code>1.1.1</code> — to show depth.",
          "Known as a <b>collaboration diagram</b> in UML 1.x; renamed in UML 2.0.",
        ]}
      />
    ),
  },

  {
    id: "comm-applied",
    kicker: "Communication Diagram — Applied to LearnPlatform",
    title: "Saving a new Course from the CRUD Manager",
    nav: "Communication — Applied",
    Body: () => (
      <DiagramStage>
        <CommunicationDiagram />
      </DiagramStage>
    ),
  },

  // ── SECTION: SEQUENCE DIAGRAM ───────────────────────────────────────────
  { id: "s-seq", bare: true, Body: SectionSlide({ n: 5, label: "TIME-ORDERED FLOW", title: "Sequence Diagram", sub: "The exact order of messages between objects while a use case plays out." }), nav: "§ Sequence" },

  {
    id: "seq-theory",
    kicker: "Sequence Diagram — Theory",
    title: "Lifelines, activations, and frames",
    nav: "Sequence — Theory",
    Body: () => (
      <Bullets
        items={[
          "Objects sit at the top; a <b>lifeline</b> (dashed vertical line) traces each object's existence top-to-bottom as time passes.",
          "An <b>activation bar</b> marks when an object is actively executing a method; messages are horizontal arrows between lifelines.",
          "<b>Synchronous</b> calls (solid arrowhead) block the caller; <b>asynchronous</b> calls (stick arrowhead) don't. A <b>return message</b> is a dashed arrow back.",
          "<b>Interaction frames</b> — <code>loop</code>, <code>alt</code>, <code>opt</code> — box up repetition, branching, and optional steps.",
        ]}
      />
    ),
  },

  {
    id: "seq-applied",
    kicker: "Sequence Diagram — Applied to LearnPlatform",
    title: "A student enrolling in a course",
    nav: "Sequence — Applied",
    Body: () => (
      <DiagramStage h={520}>
        <SequenceDiagram />
      </DiagramStage>
    ),
  },

  // ── SECTION: ACTIVITY DIAGRAM ───────────────────────────────────────────
  { id: "s-act", bare: true, Body: SectionSlide({ n: 6, label: "WORKFLOW", title: "Activity Diagram", sub: "What happens first, what happens next, what can happen in parallel, and who's responsible." }), nav: "§ Activity" },

  {
    id: "act-theory",
    kicker: "Activity Diagram — Theory",
    title: "Flowcharts that support concurrency",
    nav: "Activity — Theory",
    Body: () => (
      <Bullets
        items={[
          "A rounded-rectangle <b>action</b> is a task; a solid dot is the <b>initial node</b>, a ringed dot the <b>final node</b>.",
          "A <b>fork</b> (bar, one in / many out) splits into concurrent flows; a <b>join</b> (bar, many in / one out) waits for all of them before continuing.",
          "A <b>decision</b> node (diamond) branches on a condition written in <code>[brackets]</code>.",
          "<b>Swimlanes</b> partition the diagram by who performs each action — a person, a role, or “the system”.",
        ]}
      />
    ),
  },

  {
    id: "act-applied",
    kicker: "Activity Diagram — Applied to LearnPlatform",
    title: "Instructor adds a new course",
    nav: "Activity — Applied",
    Body: () => (
      <DiagramStage>
        <ActivityDiagram />
      </DiagramStage>
    ),
  },

  // ── SECTION: STATE DIAGRAM ──────────────────────────────────────────────
  { id: "s-state", bare: true, Body: SectionSlide({ n: 7, label: "OBJECT LIFECYCLE", title: "State Diagram", sub: "The states one object can be in, and what event moves it from one to the next." }), nav: "§ State" },

  {
    id: "state-theory",
    kicker: "State Diagram — Theory",
    title: "States, transitions, and trigger events",
    nav: "State — Theory",
    Body: () => (
      <Bullets
        items={[
          "A <b>state</b> (rounded rectangle) is a condition the object is currently in.",
          "The <b>initial pseudostate</b> (solid dot) points to the starting state — it isn't itself a real state.",
          "A <b>transition</b> (arrow) moves the object between states, usually fired by a <b>trigger event</b>.",
          "A <b>final state</b> marks where the object's lifecycle, for this diagram's purposes, ends.",
        ]}
      />
    ),
  },

  {
    id: "state-applied",
    kicker: "State Diagram — Applied to LearnPlatform",
    title: "The lifecycle of an Enrollment",
    sub: "Taken directly from our schema — enrollments.status is the enum active / completed / dropped.",
    nav: "State — Applied",
    Body: () => (
      <DiagramStage h={320}>
        <StateDiagram />
      </DiagramStage>
    ),
  },

  // ── SECTION: THE APP ─────────────────────────────────────────────────────
  { id: "s-app", bare: true, Body: SectionSlide({ n: 8, label: "FROM DIAGRAMS TO CODE", title: "Inside LearnPlatform", sub: "How the seven diagrams we just walked through became a working application." }), nav: "§ The App" },

  {
    id: "app-features",
    kicker: "The App",
    title: "What you can actually do in LearnPlatform",
    nav: "Features",
    Body: () => (
      <div className="chip-row">
        <TechChip icon="📊" name="Overview Dashboard" why="Live counts across all 7 tables, pulled straight from IndexedDB." color="#6ee7b7" />
        <TechChip icon="🗂️" name="Browse Tables" why="Inspect every record in every entity with FK columns called out." color="#5aa6ff" />
        <TechChip icon="✏️" name="CRUD Manager" why="One generic, config-driven form/table engine reused for all 7 entities." color="#b79bff" />
        <TechChip icon="🔗" name="Schema & Relationships" why="Interactive, textual documentation of every FK and multiplicity." color="#ffc26e" />
        <TechChip icon="🧭" name="Interactive ERD" why="The class-diagram relationships, rendered live in the browser." color="#ff8fc2" />
        <TechChip icon="🎞️" name="Slides (new)" why="This presentation, fullscreen, keyboard-driven, exportable to PDF." color="#34d6a8" />
      </div>
    ),
  },

  {
    id: "data-model",
    kicker: "The App",
    title: "Data model recap",
    sub: "Full ERD — 7 tables, 5 relationships, implemented in IndexedDB.",
    nav: "Data Model",
    Body: () => (
      <StatRow
        stats={[
          { l: "Instructor → Course", v: "1 : N", c: "#b79bff" },
          { l: "Course → Module", v: "1 : N", c: "#5aa6ff" },
          { l: "Module → Lesson", v: "1 : N", c: "#ffc26e" },
          { l: "Student → Profile", v: "1 : 1", c: "#ff7a7a" },
          { l: "Student ↔ Course", v: "N : N", c: "#6ee7b7" },
        ]}
      />
    ),
  },

  {
    id: "architecture",
    kicker: "Architecture",
    title: "A deliberately backend-less SPA",
    nav: "Architecture",
    Body: () => (
      <Bullets
        items={[
          "<b>Presentation layer</b> — React function components (Sidebar, Overview, Tables, CrudPage, Schema, ERD, Slides), all driven by one <code>page</code> state variable instead of a router.",
          "<b>Data-access layer</b> — a tiny <code>idb</code> wrapper (<code>getAll / add / put / del / count</code>) that turns IndexedDB's callback API into Promises.",
          "<b>Storage layer</b> — the browser's own <b>IndexedDB</b>, seeded once on first run, persisted thereafter — no server, no network call, no database to host.",
          "The DB connection promise is cached on <code>window.__lpDB</code> specifically so React Fast Refresh (HMR) can't race a second <code>indexedDB.open()</code> against the first.",
        ]}
      />
    ),
  },

  {
    id: "stack",
    kicker: "Tech Stack",
    title: "What we used, and why",
    nav: "Tech Stack",
    Body: () => (
      <div className="chip-row">
        <TechChip icon="⚛️" name="React 19" why="Component model + hooks were enough structure for 7 CRUD screens without a framework tax." color="#5aa6ff" />
        <TechChip icon="🗄️" name="IndexedDB" why="A real async, transactional, relational-ish store — built into every browser, zero server to run." color="#ffc26e" />
        <TechChip icon="🎨" name="Hand-rolled CSS" why="One injected stylesheet with CSS variables — full control over the design system, no utility-class bloat." color="#b79bff" />
        <TechChip icon="🧩" name="Inline SVG icons" why="No icon-font or icon-library runtime cost; every icon is a 4-line component." color="#ff8fc2" />
        <TechChip icon="🎬" name="Framer Motion" why="Powers the slide transitions in this very presentation module." color="#34d6a8" />
        <TechChip icon="📄" name="jsPDF + html2canvas" why="Renders every slide to canvas and stitches them into a downloadable PDF." color="#ff7a7a" />
      </div>
    ),
  },

  {
    id: "decisions",
    kicker: "Engineering Decisions",
    title: "Patterns that kept one big file sane",
    nav: "Decisions",
    Body: () => (
      <Bullets
        items={[
          "<b>Config-driven CRUD</b> — a single <code>TCONF</code> object describes every table's fields, types and foreign keys; one <code>CrudPage</code> component renders all 7 tables.",
          "<b>Centralized cell formatting</b> — a single <code>Cell()</code> renderer decides how a price, status, FK, or date column is displayed everywhere it appears.",
          "<b>Idempotent seeding</b> — <code>seedDB()</code> checks the instructor count before inserting demo data, so reloads never duplicate records.",
          "<b>HMR-safe singletons</b> — the DB promise and the seed promise are both cached on <code>window</code>, not module scope, surviving hot reloads during development.",
        ]}
      />
    ),
  },

  { id: "s-demo", bare: true, Body: SectionSlide({ n: 9, label: "LIVE", title: "Demo Time", sub: "Dashboard → Browse Tables → Add / Edit / Delete a record → Schema → ERD → this Slides feature, fullscreen." }), nav: "§ Live Demo" },

  {
    id: "challenges",
    kicker: "Reflection",
    title: "Challenges we ran into",
    nav: "Challenges",
    Body: () => (
      <Bullets
        items={[
          "<b>IndexedDB's async, versioned API</b> has no query language — every lookup is a manual transaction, and schema changes need an <code>onupgradeneeded</code> migration.",
          "<b>Modeling the many-to-many</b> between Student and Course meant introducing Enrollment as a first-class association entity, not just a join table.",
          "<b>Keeping ~3,800 lines in one file</b> readable required strict sectioning and a consistent naming convention for every table and component.",
          "<b>Drawing UML by hand</b> for fork/join, swimlanes and nested message numbering forced us to actually understand the notation, not just copy it.",
        ]}
      />
    ),
  },

  {
    id: "learnings",
    kicker: "Reflection",
    title: "What we learned",
    nav: "Learnings",
    Body: () => (
      <Bullets
        items={[
          "Diagramming first <b>surfaced the many-to-many relationship</b> (and the need for Enrollment) before a single line of code was written.",
          "A <b>client-only architecture</b> trades scalability and multi-device sync for zero infrastructure — the right trade for a course project, not for production.",
          "<b>Documentation diagrams pay for themselves</b> the moment a teammate who didn't write the code needs to understand it.",
        ]}
      />
    ),
  },

  {
    id: "future",
    kicker: "Future Work",
    title: "Where we'd take it next",
    nav: "Future Work",
    Body: () => (
      <Bullets
        items={[
          "<b>Auth &amp; roles</b> — separate Student / Instructor permissions instead of one open interface.",
          "<b>A real backend</b> — swap the IndexedDB layer for an API so data syncs across devices.",
          "<b>Analytics</b> — enrollment trends and revenue charts on the Overview dashboard.",
          "<b>Import / export</b> — backup and restore the whole database as JSON.",
        ]}
      />
    ),
  },

  {
    id: "team",
    kicker: "Team",
    title: "Who built what",
    nav: "Team",
    Body: () => (
      <TwoCol
        left={
          <Card title="Ali Hassan Khan" color="#6ee7b7">
            IndexedDB data-access layer, the generic CRUD engine (<code>TCONF</code>-driven), Schema/ERD pages, and this Slides presentation module.
          </Card>
        }
        right={
          <Card title="Ubaid Ullah Sabir" color="#5aa6ff">
            UML diagram design across all 7 notations, schema &amp; relationship documentation, and presentation delivery.
          </Card>
        }
      />
    ),
  },

  { id: "thanks", bare: true, Body: ThankYouSlide, nav: "Thank You" },
];
