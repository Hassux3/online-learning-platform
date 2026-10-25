import { T } from "./theme";

// ══════════════════════════════════════════════════════════════════════════════
// UML DIAGRAMS — hand-drawn SVGs, redrawn against LearnPlatform's real schema
// (Instructor / Course / Module / Lesson / Student / StudentProfile / Enrollment)
// so every UML concept is shown once in theory, then once against our app.
// ══════════════════════════════════════════════════════════════════════════════

const F = T.sans,
  M = T.mono;

function ClassBox({ x, y, w, name, attrs = [], ops = [], color = T.accent }) {
  const rowH = 20,
    headH = 32,
    bodyH = attrs.length * rowH + 10,
    opH = ops.length * rowH + 10,
    h = headH + bodyH + opH;
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width={w} height={h} rx="8" fill={T.panel} stroke={color} strokeWidth="1.4" />
      <rect width={w} height={headH} rx="8" fill={color} opacity="0.14" />
      <line x1="0" y1={headH} x2={w} y2={headH} stroke={color} strokeWidth="1" opacity="0.5" />
      <text x={w / 2} y={headH / 2 + 5} textAnchor="middle" fontFamily={F} fontWeight="800" fontSize="14" fill={T.text}>
        {name}
      </text>
      {attrs.map((a, i) => (
        <text key={a} x="12" y={headH + 20 + i * rowH} fontFamily={M} fontSize="11.5" fill={T.text2}>
          {a}
        </text>
      ))}
      <line x1="0" y1={headH + bodyH} x2={w} y2={headH + bodyH} stroke={color} strokeWidth="1" opacity="0.3" />
      {ops.map((o, i) => (
        <text key={o} x="12" y={headH + bodyH + 20 + i * rowH} fontFamily={M} fontSize="11.5" fill={color}>
          {o}
        </text>
      ))}
      <title>{name}</title>
    </g>
  );
}

function Edge({ x1, y1, x2, y2, label, mA, mB, dashed, diamond, arrow, hollow }) {
  const mid = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.muted} strokeWidth="1.4" strokeDasharray={dashed ? "5,4" : "0"} />
      {diamond && (
        <polygon
          points={`${x1},${y1} ${x1 + 7},${y1 - 5} ${x1 + 14},${y1} ${x1 + 7},${y1 + 5}`}
          fill={diamond === "filled" ? T.purple : T.bg}
          stroke={T.purple}
          strokeWidth="1.3"
        />
      )}
      {hollow && (
        <polygon points={`${x2},${y2} ${x2 - 9},${y2 - 6} ${x2 - 9},${y2 + 6}`} fill={T.bg} stroke={T.blue} strokeWidth="1.4" />
      )}
      {arrow && !hollow && (
        <polygon points={`${x2},${y2} ${x2 - 8},${y2 - 4} ${x2 - 8},${y2 + 4}`} fill={T.muted} />
      )}
      {label && (
        <text x={mid.x} y={mid.y - 8} textAnchor="middle" fontFamily={M} fontSize="11" fill={T.amber}>
          {label}
        </text>
      )}
      {mA && (
        <text x={x1 + (x2 > x1 ? 10 : -10)} y={y1 - 6} fontFamily={M} fontSize="10.5" fill={T.muted} textAnchor={x2 > x1 ? "start" : "end"}>
          {mA}
        </text>
      )}
      {mB && (
        <text x={x2 - (x2 > x1 ? 10 : -10)} y={y2 - 6} fontFamily={M} fontSize="10.5" fill={T.muted} textAnchor={x2 > x1 ? "end" : "start"}>
          {mB}
        </text>
      )}
    </g>
  );
}

export function ClassDiagram() {
  return (
    <svg viewBox="0 0 1150 480" width="100%" height="100%">
      <ClassBox x={20} y={10} w={190} name="Instructor" attrs={["name: String", "email: String", "bio: String", "experience_years: int"]} ops={["+ getCourses()"]} color={T.purple} />
      <ClassBox x={300} y={60} w={200} name="Course" attrs={["title: String", "price: Number", "level: Enum", "instructor_id: FK"]} ops={["+ getModules()"]} color={T.blue} />
      <ClassBox x={600} y={10} w={190} name="Module" attrs={["title: String", "order_index: int", "course_id: FK"]} ops={["+ getLessons()"]} color={T.amber} />
      <ClassBox x={870} y={60} w={190} name="Lesson" attrs={["title: String", "content_type: Enum", "duration: int", "module_id: FK"]} color={T.pink} />
      <ClassBox x={300} y={300} w={190} name="Student" attrs={["name: String", "email: String"]} ops={["+ enroll()"]} color={T.accent} />
      <ClassBox x={20} y={300} w={210} name="StudentProfile" attrs={["phone: String", "address: String", "date_of_birth: Date", "student_id: FK (unique)"]} color={T.red} />
      <ClassBox x={600} y={300} w={210} name="Enrollment" attrs={["enrolled_at: Date", "status: Enum", "student_id: FK", "course_id: FK"]} color={T.purple} />

      <Edge x1={210} y1={70} x2={300} y2={95} mA="1" mB="0..*" label="teaches" arrow />
      <Edge x1={500} y1={95} x2={600} y2={70} mA="1" mB="0..*" diamond="filled" label="composition" />
      <Edge x1={790} y1={95} x2={870} y2={110} mA="1" mB="0..*" diamond="filled" label="composition" />
      <path d="M125,432 L125,452 L395,452 L395,412" fill="none" stroke={T.muted} strokeWidth="1.4" />
      <polygon points="395,412 391,422 399,422" fill={T.muted} />
      <text x={260} y={444} textAnchor="middle" fontFamily={M} fontSize="11" fill={T.amber}>association</text>
      <text x={140} y={448} fontFamily={M} fontSize="10.5" fill={T.muted}>1</text>
      <text x={372} y={408} fontFamily={M} fontSize="10.5" fill={T.muted}>0..1</text>
      <Edge x1={490} y1={340} x2={600} y2={340} mA="1" mB="0..*" label="enrolls via" arrow />
      <Edge x1={400} y1={300} x2={695} y2={160} dashed mA="0..*" mB="1" label="refers to" arrow />
    </svg>
  );
}

export function DeploymentDiagram() {
  return (
    <svg viewBox="0 0 1100 420" width="100%" height="100%">
      <g transform="translate(60,70)">
        <rect width="420" height="300" rx="10" fill="none" stroke={T.blue} strokeWidth="1.6" />
        <text x="210" y="-14" textAnchor="middle" fontFamily={M} fontSize="12.5" fill={T.blue}>«device»</text>
        <text x="210" y="24" textAnchor="middle" fontFamily={F} fontWeight="800" fontSize="16" fill={T.text}>Student / Instructor Computer</text>
        <rect x="24" y="48" width="372" height="220" rx="8" fill={T.panel2} stroke={T.purple} strokeWidth="1.4" />
        <text x="210" y="70" textAnchor="middle" fontFamily={M} fontSize="11.5" fill={T.purple}>«execution environment»</text>
        <text x="210" y="90" textAnchor="middle" fontFamily={F} fontWeight="700" fontSize="13.5" fill={T.text}>Web Browser Runtime</text>
        <rect x="44" y="108" width="155" height="68" rx="7" fill={T.bg2} stroke={T.accent} strokeWidth="1.3" />
        <text x="121" y="128" textAnchor="middle" fontFamily={M} fontSize="10.5" fill={T.accent}>«artifact»</text>
        <text x="121" y="150" textAnchor="middle" fontFamily={F} fontWeight="700" fontSize="12.5" fill={T.text}>React SPA</text>
        <text x="121" y="166" textAnchor="middle" fontFamily={M} fontSize="9.5" fill={T.muted}>App.jsx bundle</text>
        <rect x="216" y="108" width="155" height="68" rx="7" fill={T.bg2} stroke={T.amber} strokeWidth="1.3" />
        <text x="293" y="128" textAnchor="middle" fontFamily={M} fontSize="10.5" fill={T.amber}>«artifact»</text>
        <text x="293" y="150" textAnchor="middle" fontFamily={F} fontWeight="700" fontSize="12.5" fill={T.text}>IndexedDB</text>
        <text x="293" y="166" textAnchor="middle" fontFamily={M} fontSize="9.5" fill={T.muted}>LearnPlatformDB</text>
        <line x1="199" y1="142" x2="216" y2="142" stroke={T.text2} strokeWidth="1.4" />
        <text x="207" y="200" textAnchor="middle" fontFamily={M} fontSize="9.5" fill={T.muted}>async object stores</text>
      </g>
      <g transform="translate(560,180)">
        <text x="0" y="0" fontFamily={M} fontSize="11.5" fill={T.red}>✕ no application server</text>
        <text x="0" y="24" fontFamily={M} fontSize="11.5" fill={T.red}>✕ no network round-trip</text>
        <text x="0" y="48" fontFamily={M} fontSize="11.5" fill={T.red}>✕ no REST / database tier</text>
        <text x="0" y="82" fontFamily={F} fontSize="13" fill={T.text2} fontWeight="600">Everything the deployment diagram would</text>
        <text x="0" y="102" fontFamily={F} fontSize="13" fill={T.text2} fontWeight="600">normally show as separate nodes collapses</text>
        <text x="0" y="122" fontFamily={F} fontSize="13" fill={T.text2} fontWeight="600">into a single device — by design.</text>
      </g>
    </svg>
  );
}

function Actor({ x, y, label }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="0" cy="-28" r="9" fill="none" stroke={T.accent} strokeWidth="2" />
      <line x1="0" y1="-19" x2="0" y2="10" stroke={T.accent} strokeWidth="2" />
      <line x1="-16" y1="-4" x2="16" y2="-4" stroke={T.accent} strokeWidth="2" />
      <line x1="0" y1="10" x2="-13" y2="32" stroke={T.accent} strokeWidth="2" />
      <line x1="0" y1="10" x2="13" y2="32" stroke={T.accent} strokeWidth="2" />
      <text x="0" y="52" textAnchor="middle" fontFamily={F} fontWeight="700" fontSize="12.5" fill={T.text}>{label}</text>
    </g>
  );
}

function UseCase({ x, y, w, label }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={w / 2} cy="20" rx={w / 2} ry="20" fill={T.panel} stroke={T.blue} strokeWidth="1.4" />
      <text x={w / 2} y="24" textAnchor="middle" fontFamily={F} fontSize="12" fontWeight="600" fill={T.text}>{label}</text>
    </g>
  );
}

export function UseCaseDiagram() {
  const cases = [
    { l: "View Overview Dashboard", y: 20 },
    { l: "Browse All Tables", y: 80 },
    { l: "Create / Edit / Delete Record", y: 140 },
    { l: "View Schema & Relationships", y: 200 },
    { l: "View Interactive ERD", y: 260 },
    { l: "Present Slides (fullscreen)", y: 320 },
    { l: "Export Presentation as PDF", y: 380 },
  ];
  return (
    <svg viewBox="0 0 1100 440" width="100%" height="100%">
      <rect x="260" y="0" width="650" height="420" rx="14" fill="none" stroke={T.line2} strokeWidth="1" />
      <text x="585" y="-8" textAnchor="middle" fontFamily={M} fontSize="11.5" fill={T.muted}>LearnPlatform — system boundary</text>
      <Actor x={90} y={70} label="User" />
      {cases.map((c, i) => (
        <g key={c.l}>
          <line x1="104" y1="100" x2="300" y2={c.y + 20} stroke={T.muted} strokeWidth="1.2" />
          <UseCase x={300} y={c.y} w={300} label={c.l} />
        </g>
      ))}
      <UseCase x={680} y={140} w={190} label="Validate Form Input" />
      <line x1="600" y1="160" x2="680" y2="160" stroke={T.amber} strokeWidth="1.2" strokeDasharray="4,4" />
      <text x="640" y="152" textAnchor="middle" fontFamily={M} fontSize="10" fill={T.amber}>«include»</text>
    </svg>
  );
}

export function CommunicationDiagram() {
  const nodes = [
    { l: "UI : CrudForm", x: 40, y: 40 },
    { l: "CrudPage", x: 330, y: 40 },
    { l: "idb : DataAccess", x: 620, y: 40 },
    { l: "IndexedDB", x: 900, y: 40 },
    { l: "Toast", x: 620, y: 290 },
  ];
  return (
    <svg viewBox="0 0 1050 360" width="100%" height="100%">
      {nodes.map((n) => (
        <g key={n.l} transform={`translate(${n.x},${n.y})`}>
          <rect width="160" height="48" rx="8" fill={T.panel} stroke={T.blue} strokeWidth="1.4" />
          <text x="80" y="30" textAnchor="middle" fontFamily={M} fontSize="12" fill={T.text}>{n.l}</text>
        </g>
      ))}
      <line x1="200" y1="64" x2="330" y2="64" stroke={T.muted} strokeWidth="1.3" />
      <text x="265" y="54" textAnchor="middle" fontFamily={M} fontSize="11" fill={T.amber}>1: onSubmit(values)</text>
      <line x1="490" y1="64" x2="620" y2="64" stroke={T.muted} strokeWidth="1.3" />
      <text x="555" y="54" textAnchor="middle" fontFamily={M} fontSize="11" fill={T.amber}>1.1: add("courses", rec)</text>
      <line x1="780" y1="64" x2="900" y2="64" stroke={T.muted} strokeWidth="1.3" />
      <text x="840" y="54" textAnchor="middle" fontFamily={M} fontSize="11" fill={T.amber}>1.1.1: IDBObjectStore.add()</text>
      <line x1="700" y1="88" x2="700" y2="290" stroke={T.muted} strokeWidth="1.3" />
      <text x="712" y="190" fontFamily={M} fontSize="11" fill={T.amber}>1.2: toast("Saved ✓")</text>
    </svg>
  );
}

function Lifeline({ x, label }) {
  return (
    <g>
      <rect x={x - 70} y="0" width="140" height="36" rx="7" fill={T.panel} stroke={T.blue} strokeWidth="1.3" />
      <text x={x} y="23" textAnchor="middle" fontFamily={M} fontSize="11.5" fill={T.text}>{label}</text>
      <line x1={x} y1="36" x2={x} y2="520" stroke={T.muted} strokeWidth="1.2" strokeDasharray="4,4" />
    </g>
  );
}

export function SequenceDiagram() {
  const cols = [
    { x: 100, l: "Student : UI" },
    { x: 330, l: ": CrudPage" },
    { x: 560, l: "idb : DAO" },
    { x: 790, l: ": IndexedDB" },
  ];
  const msgs = [
    { y: 112, from: 0, to: 1, l: "submitEnrollment(form)", sync: true },
    { y: 170, from: 1, to: 1, self: true, l: "validate(form)" },
    { y: 235, from: 1, to: 2, l: "add('enrollments', rec)", sync: true },
    { y: 295, from: 2, to: 3, l: "IDBObjectStore.add()", sync: true },
    { y: 355, from: 3, to: 2, l: "onsuccess(id)", ret: true },
    { y: 410, from: 2, to: 1, l: "resolve(id)", ret: true },
    { y: 465, from: 1, to: 0, l: "refresh() → re-render", ret: true },
  ];
  return (
    <svg viewBox="0 0 900 540" width="100%" height="100%">
      {cols.map((c) => <Lifeline key={c.l} x={c.x} label={c.l} />)}
      <rect x="55" y="68" width="690" height="440" rx="8" fill="none" stroke={T.amber} strokeWidth="1" strokeDasharray="5,4" />
      <text x="70" y="56" fontFamily={M} fontSize="10.5" fill={T.amber}>alt [valid] / [invalid → show error]</text>
      {msgs.map((m, i) => {
        const x1 = cols[m.from].x,
          x2 = m.self ? x1 + 70 : cols[m.to].x;
        if (m.self) {
          return (
            <g key={i}>
              <path d={`M ${x1} ${m.y} C ${x1 + 60} ${m.y - 6}, ${x1 + 60} ${m.y + 26}, ${x1} ${m.y + 20}`} fill="none" stroke={T.muted} strokeWidth="1.3" />
              <polygon points={`${x1},${m.y + 20} ${x1 + 8},${m.y + 15} ${x1 + 8},${m.y + 25}`} fill={T.muted} />
              <text x={x1 + 14} y={m.y - 10} fontFamily={M} fontSize="10.5" fill={T.text2}>{m.l}</text>
            </g>
          );
        }
        return (
          <g key={i}>
            <line x1={x1} y1={m.y} x2={x2} y2={m.y} stroke={m.ret ? T.purple : T.muted} strokeWidth="1.3" strokeDasharray={m.ret ? "5,4" : "0"} />
            <polygon points={`${x2},${m.y} ${x2 + (x2 > x1 ? -8 : 8)},${m.y - 4} ${x2 + (x2 > x1 ? -8 : 8)},${m.y + 4}`} fill={m.ret ? T.purple : T.muted} />
            <text x={(x1 + x2) / 2} y={m.y - 8} textAnchor="middle" fontFamily={M} fontSize="10.5" fill={m.ret ? T.purple : T.text2}>{m.l}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Act({ x, y, w, label, color = T.blue }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width={w} height="46" rx="20" fill={T.panel} stroke={color} strokeWidth="1.4" />
      <text x={w / 2} y="28" textAnchor="middle" fontFamily={F} fontSize="12.5" fontWeight="600" fill={T.text}>{label}</text>
    </g>
  );
}

export function ActivityDiagram() {
  return (
    <svg viewBox="0 0 1000 480" width="100%" height="100%">
      <text x="40" y="20" fontFamily={M} fontSize="11" fill={T.muted}>Swimlane: Instructor</text>
      <line x1="0" y1="34" x2="1000" y2="34" stroke={T.line2} strokeWidth="1" />
      <circle cx="60" cy="70" r="9" fill={T.accent} />
      <Act x={110} y={48} w={160} label="Open CRUD Manager" />
      <Act x={320} y={48} w={160} label="Click “Add Course”" />
      <Act x={530} y={48} w={160} label="Fill course form" color={T.purple} />
      <polygon points="800,48 870,71 800,94 730,71" fill={T.panel} stroke={T.amber} strokeWidth="1.4" />
      <text x="800" y="75" textAnchor="middle" fontFamily={F} fontSize="11.5" fill={T.text}>Valid?</text>

      <text x="40" y="150" fontFamily={M} fontSize="11" fill={T.muted}>Swimlane: System</text>
      <line x1="0" y1="164" x2="1000" y2="164" stroke={T.line2} strokeWidth="1" />
      <Act x={620} y={180} w={200} label="Show inline error" color={T.red} />
      <text x="720" y="172" textAnchor="middle" fontFamily={M} fontSize="10" fill={T.red}>[no]</text>
      <Act x={320} y={180} w={200} label="idb.add('courses', rec)" color={T.accent2} />
      <text x="420" y="172" textAnchor="middle" fontFamily={M} fontSize="10" fill={T.accent2}>[yes]</text>
      <rect x="320" y="250" width="12" height="40" fill={T.text2} />
      <Act x={210} y={320} w={190} label="Refresh table list" color={T.blue} />
      <Act x={430} y={320} w={190} label="Show success toast" color={T.blue} />
      <rect x="320" y="376" width="12" height="40" fill={T.text2} />
      <circle cx="326" cy="440" r="11" fill="none" stroke={T.accent} strokeWidth="2" />
      <circle cx="326" cy="440" r="5" fill={T.accent} />

      <line x1="69" y1="70" x2="110" y2="70" stroke={T.muted} strokeWidth="1.3" markerEnd="url(#ah)" />
      <line x1="270" y1="70" x2="320" y2="70" stroke={T.muted} strokeWidth="1.3" />
      <line x1="480" y1="70" x2="530" y2="70" stroke={T.muted} strokeWidth="1.3" />
      <line x1="690" y1="70" x2="730" y2="70" stroke={T.muted} strokeWidth="1.3" />
      {/* decision branches: left edge of the diamond → idb.add (yes), bottom vertex → error box (no) */}
      <line x1="765" y1="82" x2="420" y2="180" stroke={T.accent2} strokeWidth="1.3" />
      <line x1="800" y1="94" x2="720" y2="180" stroke={T.red} strokeWidth="1.3" />
      <line x1="326" y1="290" x2="305" y2="320" stroke={T.muted} strokeWidth="1.3" />
      <line x1="326" y1="290" x2="525" y2="320" stroke={T.muted} strokeWidth="1.3" />
      <line x1="305" y1="366" x2="326" y2="376" stroke={T.muted} strokeWidth="1.3" />
      <line x1="525" y1="366" x2="326" y2="376" stroke={T.muted} strokeWidth="1.3" />
      <line x1="326" y1="416" x2="326" y2="429" stroke={T.muted} strokeWidth="1.3" />
      <defs>
        <marker id="ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={T.muted} />
        </marker>
      </defs>
      <text x="320" y="310" fontFamily={M} fontSize="10" fill={T.text2}>fork</text>
      <text x="320" y="368" fontFamily={M} fontSize="10" fill={T.text2}>join</text>
    </svg>
  );
}

function StBox({ x, y, label, color = T.blue }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width="150" height="50" rx="22" fill={T.panel} stroke={color} strokeWidth="1.6" />
      <text x="75" y="31" textAnchor="middle" fontFamily={F} fontSize="13" fontWeight="700" fill={T.text}>{label}</text>
    </g>
  );
}

export function StateDiagram() {
  return (
    <svg viewBox="0 0 900 260" width="100%" height="100%">
      <circle cx="40" cy="65" r="9" fill={T.accent} />
      <line x1="49" y1="65" x2="90" y2="65" stroke={T.muted} strokeWidth="1.3" />
      <StBox x={90} y={40} label="active" color={T.accent2} />
      <line x1="240" y1="55" x2="320" y2="35" stroke={T.muted} strokeWidth="1.3" />
      <StBox x={320} y={0} label="completed" color={T.blue} />
      <line x1="240" y1="75" x2="320" y2="130" stroke={T.muted} strokeWidth="1.3" />
      <StBox x={320} y={110} label="dropped" color={T.red} />
      <text x="255" y="30" fontFamily={M} fontSize="11" fill={T.amber}>course finished</text>
      <text x="255" y="110" fontFamily={M} fontSize="11" fill={T.amber}>student unenrolls</text>
      <circle cx="560" cy="30" r="10" fill="none" stroke={T.blue} strokeWidth="2" />
      <circle cx="560" cy="30" r="4" fill={T.blue} />
      <text x="580" y="34" fontFamily={M} fontSize="11" fill={T.muted}>final state ({"completed / dropped"})</text>
      <text x="0" y="170" fontFamily={M} fontSize="11.5" fill={T.muted}>field: enrollments.status — our actual enum: "active" | "completed" | "dropped"</text>
    </svg>
  );
}
