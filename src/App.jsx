import { useState, useEffect, useCallback } from "react";
import SlidesPage from "./slides/SlidesPage";

// ══════════════════════════════════════════════════════════════════════════════
// DATABASE LAYER
// The promise is stored on `window.__lpDB` so Webpack HMR module re-execution
// does NOT reset it. A module-level variable resets to null on every hot reload,
// causing a second indexedDB.open() to race before onupgradeneeded finishes on
// the first one — that is what causes "not a known object store name".
// ══════════════════════════════════════════════════════════════════════════════
const DB_NAME = "LearnPlatformDB",
  DB_VERSION = 1;

function openDB() {
  if (window.__lpDB) return window.__lpDB;

  window.__lpDB = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      const mk = (name, opts, indexes = []) => {
        if (d.objectStoreNames.contains(name)) return;
        const s = d.createObjectStore(name, opts);
        indexes.forEach(([k, u]) => s.createIndex(k, k, { unique: u }));
      };
      mk("instructors", { keyPath: "id", autoIncrement: true });
      mk("courses", { keyPath: "id", autoIncrement: true }, [
        ["instructor_id", false],
      ]);
      mk("modules", { keyPath: "id", autoIncrement: true }, [
        ["course_id", false],
      ]);
      mk("lessons", { keyPath: "id", autoIncrement: true }, [
        ["module_id", false],
      ]);
      mk("students", { keyPath: "id", autoIncrement: true });
      mk("student_profiles", { keyPath: "id", autoIncrement: true }, [
        ["student_id", true],
      ]);
      mk("enrollments", { keyPath: "id", autoIncrement: true }, [
        ["student_id", false],
        ["course_id", false],
      ]);
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => {
      window.__lpDB = null;
      reject(e.target.error);
    };
    req.onblocked = () => {
      window.__lpDB = null;
      reject(new Error("DB blocked — close other tabs using this origin"));
    };
  });

  return window.__lpDB;
}

const idb = {
  async getAll(store) {
    const d = await openDB();
    return new Promise((r, j) => {
      const q = d.transaction(store, "readonly").objectStore(store).getAll();
      q.onsuccess = () => r(q.result);
      q.onerror = () => j(q.error);
    });
  },
  async add(store, rec) {
    const d = await openDB();
    return new Promise((r, j) => {
      const q = d.transaction(store, "readwrite").objectStore(store).add(rec);
      q.onsuccess = () => r(q.result);
      q.onerror = () => j(q.error);
    });
  },
  async put(store, rec) {
    const d = await openDB();
    return new Promise((r, j) => {
      const q = d.transaction(store, "readwrite").objectStore(store).put(rec);
      q.onsuccess = () => r(q.result);
      q.onerror = () => j(q.error);
    });
  },
  async del(store, id) {
    const d = await openDB();
    return new Promise((r, j) => {
      const q = d.transaction(store, "readwrite").objectStore(store).delete(id);
      q.onsuccess = () => r();
      q.onerror = () => j(q.error);
    });
  },
  async count(store) {
    const d = await openDB();
    return new Promise((r, j) => {
      const q = d.transaction(store, "readonly").objectStore(store).count();
      q.onsuccess = () => r(q.result);
      q.onerror = () => j(q.error);
    });
  },
};

// ── Seeding guard stored on window so HMR re-runs never trigger a second seed ─
async function seedDB() {
  if (window.__lpSeed) return window.__lpSeed;
  window.__lpSeed = (async () => {
    // Check instructors count — if any data exists, skip entirely
    const existing = await idb.count("instructors");
    if (existing > 0) return;

    // Pakistani / Arabic instructors
    const i1 = await idb.add("instructors", {
      name: "Dr. Fatima Malik",
      email: "fatima@learnhub.pk",
      password: "pass123",
      bio: "Expert in ML & Data Science, 12 years of research at NUST and COMSATS.",
      experience_years: 12,
      created_at: "2022-01-15",
    });
    const i2 = await idb.add("instructors", {
      name: "Tariq Hussain",
      email: "tariq@learnhub.pk",
      password: "pass456",
      bio: "Full-stack developer & open-source advocate. Built 3 SaaS products in Lahore.",
      experience_years: 8,
      created_at: "2022-03-10",
    });
    const i3 = await idb.add("instructors", {
      name: "Noor Zaman",
      email: "noor@learnhub.pk",
      password: "pass789",
      bio: "UX/UI designer turned educator. Worked with top Pakistani tech firms.",
      experience_years: 6,
      created_at: "2022-06-05",
    });

    // Courses
    const c1 = await idb.add("courses", {
      title: "Machine Learning Fundamentals",
      description:
        "Core ML algorithms — regression to neural networks. Hands-on Python projects.",
      price: 7999,
      level: "Intermediate",
      instructor_id: i1,
      created_at: "2022-02-01",
    });
    const c2 = await idb.add("courses", {
      title: "React & Modern Web Dev",
      description:
        "Production-grade apps with React, hooks, context, and modern tooling.",
      price: 5999,
      level: "Beginner",
      instructor_id: i2,
      created_at: "2022-04-01",
    });
    const c3 = await idb.add("courses", {
      title: "UX Design Mastery",
      description:
        "User research, wireframing, prototyping, and scalable design systems.",
      price: 6999,
      level: "Intermediate",
      instructor_id: i3,
      created_at: "2022-07-01",
    });
    const c4 = await idb.add("courses", {
      title: "Deep Learning with Python",
      description:
        "CNNs, RNNs, transformers, and practical DL projects using PyTorch.",
      price: 9999,
      level: "Advanced",
      instructor_id: i1,
      created_at: "2023-01-10",
    });

    // Modules & Lessons
    const m1 = await idb.add("modules", {
      title: "Introduction to ML",
      order_index: 1,
      course_id: c1,
    });
    await idb.add("lessons", {
      title: "What is Machine Learning?",
      content_type: "video",
      duration: 15,
      module_id: m1,
    });
    await idb.add("lessons", {
      title: "Types of Learning",
      content_type: "video",
      duration: 20,
      module_id: m1,
    });
    await idb.add("lessons", {
      title: "Setting Up Python",
      content_type: "text",
      duration: 10,
      module_id: m1,
    });
    const m2 = await idb.add("modules", {
      title: "Supervised Learning",
      order_index: 2,
      course_id: c1,
    });
    await idb.add("lessons", {
      title: "Linear Regression",
      content_type: "video",
      duration: 35,
      module_id: m2,
    });
    await idb.add("lessons", {
      title: "Classification Algorithms",
      content_type: "video",
      duration: 40,
      module_id: m2,
    });
    const m3 = await idb.add("modules", {
      title: "React Foundations",
      order_index: 1,
      course_id: c2,
    });
    await idb.add("lessons", {
      title: "JSX and Components",
      content_type: "video",
      duration: 25,
      module_id: m3,
    });
    await idb.add("lessons", {
      title: "Props and State",
      content_type: "video",
      duration: 30,
      module_id: m3,
    });
    const m4 = await idb.add("modules", {
      title: "React Hooks",
      order_index: 2,
      course_id: c2,
    });
    await idb.add("lessons", {
      title: "useState & useEffect",
      content_type: "video",
      duration: 35,
      module_id: m4,
    });
    await idb.add("lessons", {
      title: "Custom Hooks",
      content_type: "text",
      duration: 20,
      module_id: m4,
    });
    const m5 = await idb.add("modules", {
      title: "UX Research",
      order_index: 1,
      course_id: c3,
    });
    await idb.add("lessons", {
      title: "User Interviews",
      content_type: "video",
      duration: 28,
      module_id: m5,
    });
    await idb.add("lessons", {
      title: "Affinity Mapping",
      content_type: "video",
      duration: 22,
      module_id: m5,
    });
    const m6 = await idb.add("modules", {
      title: "Deep Learning Basics",
      order_index: 1,
      course_id: c4,
    });
    await idb.add("lessons", {
      title: "Neural Network Architecture",
      content_type: "video",
      duration: 45,
      module_id: m6,
    });

    // Pakistani students
    const s1 = await idb.add("students", {
      name: "Maryam Iqbal",
      email: "maryam@student.pk",
      password: "stu123",
      created_at: "2022-09-01",
    });
    const s2 = await idb.add("students", {
      name: "Ibrahim Qureshi",
      email: "ibrahim@student.pk",
      password: "stu456",
      created_at: "2022-10-15",
    });
    const s3 = await idb.add("students", {
      name: "Khadija Siddiqui",
      email: "khadija@student.pk",
      password: "stu789",
      created_at: "2023-01-20",
    });
    const s4 = await idb.add("students", {
      name: "Zaid Farooq",
      email: "zaid@student.pk",
      password: "stu000",
      created_at: "2023-03-05",
    });

    // Profiles
    await idb.add("student_profiles", {
      phone: "+92-300-1234567",
      address: "House 14, Gulberg III, Lahore, PK",
      date_of_birth: "1998-04-12",
      student_id: s1,
    });
    await idb.add("student_profiles", {
      phone: "+92-321-9876543",
      address: "Block B, Satellite Town, Rawalpindi, PK",
      date_of_birth: "1996-08-25",
      student_id: s2,
    });
    await idb.add("student_profiles", {
      phone: "+92-333-5556677",
      address: "F-8/2, Islamabad, PK",
      date_of_birth: "2000-01-30",
      student_id: s3,
    });
    await idb.add("student_profiles", {
      phone: "+92-345-1112233",
      address: "North Nazimabad, Karachi, PK",
      date_of_birth: "1999-11-07",
      student_id: s4,
    });

    // Enrollments
    await idb.add("enrollments", {
      enrolled_at: "2022-09-05",
      status: "active",
      student_id: s1,
      course_id: c1,
    });
    await idb.add("enrollments", {
      enrolled_at: "2022-09-10",
      status: "completed",
      student_id: s1,
      course_id: c2,
    });
    await idb.add("enrollments", {
      enrolled_at: "2022-10-20",
      status: "active",
      student_id: s2,
      course_id: c2,
    });
    await idb.add("enrollments", {
      enrolled_at: "2022-11-01",
      status: "active",
      student_id: s2,
      course_id: c3,
    });
    await idb.add("enrollments", {
      enrolled_at: "2023-01-25",
      status: "active",
      student_id: s3,
      course_id: c1,
    });
    await idb.add("enrollments", {
      enrolled_at: "2023-01-28",
      status: "active",
      student_id: s3,
      course_id: c4,
    });
    await idb.add("enrollments", {
      enrolled_at: "2023-03-10",
      status: "active",
      student_id: s4,
      course_id: c2,
    });
    await idb.add("enrollments", {
      enrolled_at: "2023-03-12",
      status: "active",
      student_id: s4,
      course_id: c3,
    });
  })();
  return window.__lpSeed;
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ══════════════════════════════════════════════════════════════════════════════
const G = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f0ede8;--surface:#ffffff;--s2:#f7f5f1;--ink:#161410;--ink2:#4a4640;
  --muted:#9a9590;--border:#e4e0d8;--b2:#ccc8c0;
  --green:#1a6b5a;--green-bg:#e8f4f1;
  --red:#c84b2f;--red-bg:#faeae6;
  --yellow:#a87000;--yellow-bg:#fdf4dc;
  --blue:#0563a8;--blue-bg:#e0f2fe;
  --violet:#5b3fa6;--violet-bg:#eeebf8;
  --orange:#b45309;--orange-bg:#fef3c7;
  --pink:#be185d;--pink-bg:#fce7f3;
  --FD:'Plus Jakarta Sans',sans-serif;--FM:'JetBrains Mono',monospace;
  --r:10px;--rl:14px;
  --sh:0 1px 3px rgba(22,20,16,.06),0 4px 16px rgba(22,20,16,.04);
  --shm:0 4px 12px rgba(22,20,16,.08),0 1px 4px rgba(22,20,16,.05);
  --shl:0 12px 32px rgba(22,20,16,.10),0 2px 8px rgba(22,20,16,.06);
  --sw:236px;
}
body{font-family:var(--FD);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
button,input,select,textarea{font-family:var(--FD)}
button{cursor:pointer;border:none;background:none}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:3px}
.app{display:flex;min-height:100vh}
.main{margin-left:var(--sw);flex:1;min-height:100vh;transition:margin-left .28s}
.main.coll{margin-left:54px}
.sb{width:var(--sw);position:fixed;top:0;left:0;bottom:0;z-index:200;background:var(--ink);display:flex;flex-direction:column;transition:width .28s;overflow:hidden}
.sb.coll{width:54px}
.sb-logo{display:flex;align-items:center;gap:9px;padding:14px 12px;border-bottom:1px solid rgba(255,255,255,.07);min-height:54px;flex-shrink:0}
.sb-mark{width:28px;height:28px;border-radius:8px;background:var(--green);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sb-wordmark{font-size:14px;font-weight:800;color:#fff;white-space:nowrap;flex:1;letter-spacing:-.3px}
.sb-wordmark span{color:#6ee7b7}
.sb-tog{color:rgba(255,255,255,.3);width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:5px;flex-shrink:0;transition:all .15s}
.sb-tog:hover{color:rgba(255,255,255,.7);background:rgba(255,255,255,.07)}
.sb-nav{flex:1;padding:10px 8px;overflow-y:auto;display:flex;flex-direction:column;gap:1px}
.mob-ham{display:none}
.sb-backdrop{display:none}
@media (max-width:760px){
  .sb{width:252px;transform:translateX(-100%);transition:transform .28s ease;box-shadow:0 0 44px rgba(0,0,0,.4)}
  .sb.coll{width:252px;transform:translateX(-100%)}
  .sb:not(.coll){transform:translateX(0)}
  .main,.main.coll{margin-left:0!important}
  .mob-ham{display:flex;position:fixed;top:14px;left:14px;z-index:150;width:40px;height:40px;border-radius:10px;background:var(--ink);color:#fff;align-items:center;justify-content:center;box-shadow:var(--shm);border:none}
  .sb-backdrop{display:block;position:fixed;inset:0;background:rgba(15,13,10,.5);z-index:199;opacity:0;pointer-events:none;transition:opacity .28s}
  .sb-backdrop.show{opacity:1;pointer-events:auto}
}
.sb-sec{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.2);padding:10px 8px 4px;white-space:nowrap}
.sb-div{height:1px;background:rgba(255,255,255,.06);margin:6px 4px}
.sbi{display:flex;align-items:center;gap:9px;padding:8px 9px;border-radius:7px;font-size:13px;font-weight:500;color:rgba(255,255,255,.45);width:100%;text-align:left;transition:all .15s;white-space:nowrap}
.sbi svg{flex-shrink:0;opacity:.65}
.sbi:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.8)}
.sbi.act{background:rgba(255,255,255,.11);color:#fff;font-weight:600}
.sbi.act svg{opacity:1}
.sb-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sb-row{display:flex;align-items:center;justify-content:space-between;flex:1;gap:6px}
.sb-cnt{background:rgba(255,255,255,.1);color:rgba(255,255,255,.35);font-size:10.5px;font-weight:600;padding:1px 6px;border-radius:100px;font-family:var(--FM)}
.sb-foot{padding:12px 14px;border-top:1px solid rgba(255,255,255,.06);font-size:11px;color:rgba(255,255,255,.18);display:flex;align-items:center;gap:6px;white-space:nowrap}
.btn{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;padding:8px 15px;border-radius:8px;transition:all .16s;border:none;white-space:nowrap}
.btn-p{background:var(--ink);color:#fff}.btn-p:hover{background:#2d2a24}
.btn-g{background:var(--green);color:#fff}.btn-g:hover{background:#155847}
.btn-out{background:transparent;color:var(--ink2);border:1.5px solid var(--border)}.btn-out:hover{background:var(--s2);border-color:var(--b2)}
.btn-del{background:var(--red-bg);color:var(--red);border:1px solid #f0bfb4}.btn-del:hover{background:#f5d0c5}
.btn-sm{font-size:12px;padding:5px 11px;border-radius:7px;gap:5px}
.btn-ico{width:30px;height:30px;padding:0;justify-content:center;border-radius:7px}
.btn:disabled{opacity:.5;cursor:not-allowed}
.p{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;padding:2px 9px;border-radius:100px}
.p-g{background:var(--green-bg);color:var(--green)}
.p-r{background:var(--red-bg);color:var(--red)}
.p-y{background:var(--yellow-bg);color:var(--yellow)}
.p-v{background:var(--violet-bg);color:var(--violet)}
.p-b{background:var(--blue-bg);color:var(--blue)}
.p-k{background:var(--ink);color:#fff}
.p-0{background:var(--s2);color:var(--ink2)}
.p-o{background:var(--orange-bg);color:var(--orange)}
.p-pk{background:var(--pink-bg);color:var(--pink)}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--rl);box-shadow:var(--sh)}
.card-s{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--sh)}
.fg{display:flex;flex-direction:column;gap:5px}
.fl{font-size:11.5px;font-weight:700;color:var(--ink2);letter-spacing:.4px;text-transform:uppercase}
.fi{background:var(--surface);border:1.5px solid var(--border);border-radius:8px;padding:8px 11px;font-size:13.5px;color:var(--ink);outline:none;transition:border-color .14s;width:100%}
.fi:focus{border-color:var(--green)}
.fi.err{border-color:var(--red)}
.fi-sel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg width='11' height='7' viewBox='0 0 11 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='%239a9590' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 11px center}
.ferr{font-size:11px;color:var(--red)}
.dt-wrap{overflow-x:auto}
.dt{width:100%;border-collapse:collapse}
.dt thead tr{background:var(--s2)}
.dt th{padding:9px 13px;text-align:left;font-size:10.5px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--muted);white-space:nowrap;border-bottom:1px solid var(--border)}
.dt td{padding:11px 13px;font-size:13px;border-bottom:1px solid var(--border);vertical-align:middle;color:var(--ink2)}
.dt tr:last-child td{border-bottom:none}
.dt tr:hover td{background:var(--s2)}
.td-pk{font-family:var(--FM);font-size:11.5px;color:var(--muted);font-weight:500}
.td-fk{font-family:var(--FM);font-size:11.5px;color:var(--violet);font-weight:700}
.th-t{display:inline-block;font-size:9px;font-weight:700;letter-spacing:.5px;padding:1px 5px;border-radius:3px;margin-left:5px;background:var(--green-bg);color:var(--green)}
.th-tf{background:var(--violet-bg);color:var(--violet)}
.mo{position:fixed;inset:0;background:rgba(22,20,16,.4);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(3px);animation:moIn .16s ease}
.mb{background:var(--surface);border-radius:var(--rl);box-shadow:var(--shl);width:100%;max-width:520px;max-height:90vh;overflow-y:auto;animation:mbIn .2s ease}
@keyframes moIn{from{opacity:0}to{opacity:1}}
@keyframes mbIn{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
.mh{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--border)}
.mt{font-size:15px;font-weight:700;letter-spacing:-.2px}
.my{padding:22px}
.mf{padding:14px 22px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px}
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fg2 .fw{grid-column:1/-1}
.ta{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:7px;z-index:2000}
.tos{display:flex;align-items:center;gap:9px;background:var(--ink);color:#fff;padding:11px 16px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:var(--shl);animation:tosIn .2s ease}
.tos.ok::before{content:'✓';color:#6ee7b7;font-weight:800}
.tos.er::before{content:'✕';color:#fca5a5;font-weight:800}
@keyframes tosIn{from{transform:translateX(50px);opacity:0}to{transform:translateX(0);opacity:1}}
.ring{width:32px;height:32px;border:2.5px solid var(--border);border-top-color:var(--green);border-radius:50%;animation:spin .7s linear infinite}
.ring-sm{width:14px;height:14px;border-width:2px}
@keyframes spin{to{transform:rotate(360deg)}}
.srch{display:flex;align-items:center;gap:7px;background:var(--s2);border:1.5px solid var(--border);border-radius:8px;padding:6px 10px}
.srch input{border:none;background:none;outline:none;font-size:13px;color:var(--ink);width:160px}
.srch input::placeholder{color:var(--muted)}
`;

// ══════════════════════════════════════════════════════════════════════════════
// ICONS
// ══════════════════════════════════════════════════════════════════════════════
const Ic = {
  Home: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),
  Grid: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  Db: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  Schema: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <line x1="12" y1="7" x2="5" y2="17" />
      <line x1="12" y1="7" x2="19" y2="17" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  X: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Save: () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </svg>
  ),
  Srch: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ color: "var(--muted)" }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Menu: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Link: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Slides: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <polygon points="10,8 16,10.5 10,13" fill="currentColor" stroke="none" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
};

// ══════════════════════════════════════════════════════════════════════════════
// TOAST HOOK
// ══════════════════════════════════════════════════════════════════════════════
function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "ok") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);
  return { toasts, toast };
}

// ══════════════════════════════════════════════════════════════════════════════
// TABLE CONFIG
// ══════════════════════════════════════════════════════════════════════════════
const TCONF = {
  instructors: {
    label: "Instructors",
    dot: "#9333ea",
    fields: [
      { k: "name", l: "Full Name", t: "text", r: 1 },
      { k: "email", l: "Email", t: "email", r: 1 },
      { k: "password", l: "Password", t: "text", r: 1 },
      { k: "bio", l: "Bio", t: "textarea" },
      { k: "experience_years", l: "Experience (years)", t: "number", r: 1 },
      { k: "created_at", l: "Created At", t: "date", r: 1 },
    ],
  },
  courses: {
    label: "Courses",
    dot: "#0284c7",
    fields: [
      { k: "title", l: "Title", t: "text", r: 1 },
      { k: "description", l: "Description", t: "textarea" },
      { k: "price", l: "Price (PKR)", t: "number", r: 1 },
      {
        k: "level",
        l: "Level",
        t: "select",
        opts: ["Beginner", "Intermediate", "Advanced"],
        r: 1,
      },
      {
        k: "instructor_id",
        l: "Instructor",
        t: "fk",
        store: "instructors",
        r: 1,
      },
      { k: "created_at", l: "Created At", t: "date", r: 1 },
    ],
  },
  modules: {
    label: "Modules",
    dot: "#d97706",
    fields: [
      { k: "title", l: "Title", t: "text", r: 1 },
      { k: "order_index", l: "Order Index", t: "number", r: 1 },
      { k: "course_id", l: "Course", t: "fk", store: "courses", r: 1 },
    ],
  },
  lessons: {
    label: "Lessons",
    dot: "#db2777",
    fields: [
      { k: "title", l: "Title", t: "text", r: 1 },
      {
        k: "content_type",
        l: "Content Type",
        t: "select",
        opts: ["video", "text"],
        r: 1,
      },
      { k: "duration", l: "Duration (min)", t: "number", r: 1 },
      { k: "module_id", l: "Module", t: "fk", store: "modules", r: 1 },
    ],
  },
  students: {
    label: "Students",
    dot: "#16a34a",
    fields: [
      { k: "name", l: "Full Name", t: "text", r: 1 },
      { k: "email", l: "Email", t: "email", r: 1 },
      { k: "password", l: "Password", t: "text", r: 1 },
      { k: "created_at", l: "Created At", t: "date", r: 1 },
    ],
  },
  student_profiles: {
    label: "Student Profiles",
    dot: "#ef4444",
    fields: [
      { k: "phone", l: "Phone", t: "text" },
      { k: "address", l: "Address", t: "text" },
      { k: "date_of_birth", l: "Date of Birth", t: "date" },
      { k: "student_id", l: "Student", t: "fk", store: "students", r: 1 },
    ],
  },
  enrollments: {
    label: "Enrollments",
    dot: "#7c3aed",
    fields: [
      { k: "enrolled_at", l: "Enrolled At", t: "date", r: 1 },
      {
        k: "status",
        l: "Status",
        t: "select",
        opts: ["active", "completed", "dropped"],
        r: 1,
      },
      { k: "student_id", l: "Student", t: "fk", store: "students", r: 1 },
      { k: "course_id", l: "Course", t: "fk", store: "courses", r: 1 },
    ],
  },
};
const TKEYS = Object.keys(TCONF);
const TCOLS = {
  instructors: ["id", "name", "email", "experience_years", "created_at"],
  courses: ["id", "title", "price", "level", "instructor_id", "created_at"],
  modules: ["id", "title", "order_index", "course_id"],
  lessons: ["id", "title", "content_type", "duration", "module_id"],
  students: ["id", "name", "email", "created_at"],
  student_profiles: ["id", "phone", "address", "date_of_birth", "student_id"],
  enrollments: ["id", "enrolled_at", "status", "student_id", "course_id"],
};
const FKS = ["instructor_id", "course_id", "module_id", "student_id"];
const AC = [
  "#9333ea",
  "#0284c7",
  "#16a34a",
  "#db2777",
  "#d97706",
  "#0d9488",
  "#dc2626",
];
const ini = (n) =>
  n
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2) || "?";

// ══════════════════════════════════════════════════════════════════════════════
// CELL RENDERER
// ══════════════════════════════════════════════════════════════════════════════
function Cell({ v, col }) {
  if (col === "id") return <span className="td-pk">#{v}</span>;
  if (FKS.includes(col)) return <span className="td-fk">→ #{v}</span>;
  if (col === "price")
    return (
      <b style={{ color: "var(--green)" }}>PKR {Number(v).toLocaleString()}</b>
    );
  if (col === "duration") return `${v}m`;
  if (col === "experience_years") return `${v}y`;
  if (col === "status")
    return (
      <span
        className={`p ${v === "completed" ? "p-g" : v === "active" ? "p-y" : "p-0"}`}
      >
        {v}
      </span>
    );
  if (col === "level")
    return (
      <span
        className={`p ${v === "Beginner" ? "p-g" : v === "Intermediate" ? "p-o" : "p-r"}`}
      >
        {v}
      </span>
    );
  if (col === "content_type")
    return <span className={`p ${v === "video" ? "p-pk" : "p-y"}`}>{v}</span>;
  if (typeof v === "string" && v.length > 42)
    return <span title={v}>{v.slice(0, 39)}…</span>;
  return v ?? <span style={{ color: "var(--muted)" }}>—</span>;
}

// ══════════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════════════════════════
function Sidebar({ page, setPage, open, setOpen, data, goCrud, crudTable }) {
  const navTables = [
    { k: "instructors", dot: "#9333ea" },
    { k: "courses", dot: "#0284c7" },
    { k: "modules", dot: "#d97706" },
    { k: "lessons", dot: "#db2777" },
    { k: "students", dot: "#16a34a" },
    { k: "student_profiles", dot: "#ef4444" },
    { k: "enrollments", dot: "#7c3aed" },
  ];
  const cnt = (k) =>
    data ? (data[k === "student_profiles" ? "profiles" : k] || []).length : 0;
  // On mobile the sidebar is an overlay drawer — close it after navigating
  // so picking a page doesn't leave the backdrop covering the new content.
  const closeOnMobile = () => {
    if (window.innerWidth <= 760) setOpen(false);
  };
  const navTo = (k) => {
    setPage(k);
    closeOnMobile();
  };
  const navCrud = (k) => {
    goCrud(k);
    closeOnMobile();
  };
  return (
    <aside className={`sb${open ? "" : " coll"}`}>
      <div className="sb-logo">
        <button
          className="sb-mark"
          onClick={() => !open && setOpen(true)}
          style={{
            border: "none",
            cursor: open ? "default" : "pointer",
            flexShrink: 0,
          }}
          title={!open ? "Expand sidebar" : undefined}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {open && (
          <div className="sb-wordmark">
            <span>Learn</span>Platform
          </div>
        )}
        {open && (
          <button
            className="sb-tog"
            onClick={() => setOpen(false)}
            title="Collapse sidebar"
          >
            <Ic.Menu />
          </button>
        )}
      </div>
      <nav className="sb-nav">
        {open && <div className="sb-sec">Platform</div>}
        {[
          { k: "overview", l: "Overview", I: Ic.Home },
          { k: "tables", l: "Browse Tables", I: Ic.Grid },
          { k: "schema", l: "Schema & Relationships", I: Ic.Schema },
          { k: "erd", l: "ERD", I: Ic.Db },
          { k: "slides", l: "Slides", I: Ic.Slides },
        ].map((n) => (
          <button
            key={n.k}
            className={`sbi${page === n.k ? " act" : ""}`}
            onClick={() => navTo(n.k)}
            title={!open ? n.l : undefined}
          >
            <n.I />
            {open && <span>{n.l}</span>}
          </button>
        ))}
        {open ? (
          <div className="sb-sec" style={{ marginTop: 6 }}>
            CRUD Manager
          </div>
        ) : (
          <div className="sb-div" />
        )}
        {navTables.map((t) => (
          <button
            key={t.k}
            className={`sbi${page === "crud" && crudTable === t.k ? " act" : ""}`}
            onClick={() => navCrud(t.k)}
            title={!open ? TCONF[t.k].label : undefined}
          >
            <span className="sb-dot" style={{ background: t.dot }} />
            {open && (
              <div className="sb-row">
                <span>{TCONF[t.k].label}</span>
                <span className="sb-cnt">{cnt(t.k)}</span>
              </div>
            )}
          </button>
        ))}
      </nav>
      {open && <div className="sb-foot">Build with ☕ & {"</>"} by Hassan</div>}
    </aside>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW PAGE
// ══════════════════════════════════════════════════════════════════════════════
function OverviewPage({ data, setPage, goCrud }) {
  const {
    instructors,
    courses,
    students,
    enrollments,
    modules,
    lessons,
    profiles,
  } = data;
  const stats = [
    {
      l: "Instructors",
      v: instructors.length,
      bg: "#f3e8ff",
      c: "#9333ea",
      tbl: "instructors",
    },
    {
      l: "Courses",
      v: courses.length,
      bg: "#e0f2fe",
      c: "#0284c7",
      tbl: "courses",
    },
    {
      l: "Students",
      v: students.length,
      bg: "#dcfce7",
      c: "#16a34a",
      tbl: "students",
    },
    {
      l: "Enrollments",
      v: enrollments.length,
      bg: "#ede9fe",
      c: "#7c3aed",
      tbl: "enrollments",
    },
    {
      l: "Modules",
      v: modules.length,
      bg: "#fef3c7",
      c: "#d97706",
      tbl: "modules",
    },
    {
      l: "Lessons",
      v: lessons.length,
      bg: "#fce7f3",
      c: "#db2777",
      tbl: "lessons",
    },
  ];
  const LV = {
    Beginner: ["#16a34a", "#dcfce7"],
    Intermediate: ["#a87000", "#fdf4dc"],
    Advanced: ["#c84b2f", "#faeae6"],
  };
  return (
    <div style={{ padding: "28px 32px", maxWidth: 1140 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ marginBottom: 10 }}>
            <span className="p p-g" style={{ fontSize: 12 }}>
              ● IndexedDB Live
            </span>
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-.5px",
              marginBottom: 7,
            }}
          >
            Online Learning Platform
          </h1>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--muted)",
              maxWidth: 500,
              lineHeight: 1.7,
            }}
          >
            A fully relational database demo — instructors create courses,
            students enroll, profiles extend records. All stored locally in your
            browser.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 14,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "var(--muted)",
                letterSpacing: ".5px",
                textTransform: "uppercase",
              }}
            >
              Contributors
            </span>
            {["Ubaid Ullah Sabir", "Ali Hassan Khan", "Salman Khan"].map(
              (name, i) => (
                <span
                  key={name}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 100,
                    padding: "4px 12px 4px 6px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--ink2)",
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: ["#1a6b5a", "#5b3fa6", "#c84b2f"][i],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9.5,
                      fontWeight: 800,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  {name}
                </span>
              ),
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, paddingTop: 4 }}>
          <button
            className="btn btn-out btn-sm"
            onClick={() => setPage("schema")}
          >
            <Ic.Schema /> Schema
          </button>
          <button
            className="btn btn-p btn-sm"
            onClick={() => setPage("tables")}
          >
            <Ic.Grid /> Browse Tables
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6,1fr)",
          gap: 11,
          marginBottom: 20,
        }}
      >
        {stats.map((s) => (
          <button
            key={s.l}
            onClick={() => goCrud(s.tbl)}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r)",
              padding: "14px 12px",
              textAlign: "left",
              transition: "all .16s",
              cursor: "pointer",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shm)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "";
              e.currentTarget.style.transform = "";
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 17 }}>
                {s.tbl === "instructors"
                  ? "👩‍🏫"
                  : s.tbl === "courses"
                    ? "📚"
                    : s.tbl === "students"
                      ? "👨‍🎓"
                      : s.tbl === "enrollments"
                        ? "🔗"
                        : s.tbl === "modules"
                          ? "📋"
                          : "▶"}
              </span>
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-.4px",
                color: "var(--ink)",
                lineHeight: 1,
              }}
            >
              {s.v}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
              {s.l}
            </div>
            <span
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontSize: 13,
                color: "var(--border)",
              }}
            >
              →
            </span>
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <div className="card" style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700 }}>Instructors</span>
            <button
              className="btn btn-out btn-sm"
              onClick={() => goCrud("instructors")}
            >
              Manage →
            </button>
          </div>
          {instructors.map((ins, i) => {
            const cc = courses.filter((c) => c.instructor_id === ins.id).length;
            return (
              <div
                key={ins.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "10px 18px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: AC[i % AC.length],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {ini(ins.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--ink)",
                    }}
                  >
                    {ins.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {ins.email}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <span className="p p-v">{cc} courses</span>
                  <span className="p p-0">{ins.experience_years}y</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700 }}>
              Recent Enrollments
            </span>
            <button
              className="btn btn-out btn-sm"
              onClick={() => goCrud("enrollments")}
            >
              Manage →
            </button>
          </div>
          {[...enrollments]
            .reverse()
            .slice(0, 6)
            .map((en) => {
              const stu = students.find((s) => s.id === en.student_id);
              const crs = courses.find((c) => c.id === en.course_id);
              return (
                <div
                  key={en.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 18px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--ink)",
                      }}
                    >
                      {stu?.name || "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {crs?.title || "—"}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 3,
                    }}
                  >
                    <span
                      className={`p ${en.status === "completed" ? "p-g" : en.status === "active" ? "p-y" : "p-0"}`}
                    >
                      {en.status}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {en.enrolled_at}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden", marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700 }}>Course Catalog</span>
          <button
            className="btn btn-out btn-sm"
            onClick={() => goCrud("courses")}
          >
            Manage →
          </button>
        </div>
        {courses.map((c) => {
          const ins = instructors.find((i) => i.id === c.instructor_id);
          const mc = modules.filter((m) => m.course_id === c.id).length;
          const ec = enrollments.filter((e) => e.course_id === c.id).length;
          const [tc, bg] = LV[c.level] || ["#64748b", "#f1f5f9"];
          return (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 14,
                padding: "13px 18px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
                  {c.title}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--muted)",
                    marginBottom: 8,
                    lineHeight: 1.5,
                  }}
                >
                  {c.description}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="p" style={{ background: bg, color: tc }}>
                    {c.level}
                  </span>
                  <span className="p p-0">{mc} modules</span>
                  <span className="p p-0">{ec} enrolled</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--green)",
                  }}
                >
                  PKR {Number(c.price).toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  by {ins?.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700 }}>Students</span>
          <button
            className="btn btn-out btn-sm"
            onClick={() => goCrud("students")}
          >
            Manage →
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
          }}
        >
          {students.map((s, i) => {
            const ec = enrollments.filter((e) => e.student_id === s.id).length;
            const pf = profiles.find((p) => p.student_id === s.id);
            return (
              <div
                key={s.id}
                style={{
                  padding: "16px 14px",
                  textAlign: "center",
                  borderRight: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: AC[(i + 3) % AC.length],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#fff",
                    margin: "0 auto 10px",
                  }}
                >
                  {ini(s.name)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginBottom: 8,
                  }}
                >
                  {s.email}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span className="p p-g">{ec} courses</span>
                  {pf && <span className="p p-0">Profile ✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TABLES PAGE
// ══════════════════════════════════════════════════════════════════════════════
function TablesPage({ data, goCrud }) {
  const [active, setActive] = useState("instructors");
  const [q, setQ] = useState("");
  const TDEFS = [
    {
      k: "instructors",
      dot: "#9333ea",
      data: data.instructors,
      cols: TCOLS.instructors,
    },
    { k: "courses", dot: "#0284c7", data: data.courses, cols: TCOLS.courses },
    { k: "modules", dot: "#d97706", data: data.modules, cols: TCOLS.modules },
    { k: "lessons", dot: "#db2777", data: data.lessons, cols: TCOLS.lessons },
    {
      k: "students",
      dot: "#16a34a",
      data: data.students,
      cols: TCOLS.students,
    },
    {
      k: "student_profiles",
      dot: "#ef4444",
      data: data.profiles,
      cols: TCOLS.student_profiles,
    },
    {
      k: "enrollments",
      dot: "#7c3aed",
      data: data.enrollments,
      cols: TCOLS.enrollments,
    },
  ];
  const cur = TDEFS.find((t) => t.k === active);
  const filtered = cur
    ? cur.data.filter((r) =>
        Object.values(r).some((v) =>
          String(v).toLowerCase().includes(q.toLowerCase()),
        ),
      )
    : [];
  return (
    <div style={{ padding: "28px 32px", maxWidth: 1140 }}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "-.4px",
            marginBottom: 5,
          }}
        >
          Database Tables
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
          Browse all records. Click "Manage" to add, edit, or delete.
        </p>
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          marginBottom: 14,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: 5,
          borderRadius: "var(--r)",
          width: "fit-content",
        }}
      >
        {TDEFS.map((t) => (
          <button
            key={t.k}
            onClick={() => {
              setActive(t.k);
              setQ("");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 13px",
              borderRadius: 7,
              fontSize: 12.5,
              fontWeight: 600,
              transition: "all .15s",
              background: active === t.k ? "var(--ink)" : "transparent",
              color: active === t.k ? "#fff" : "var(--ink2)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: t.dot,
                display: "inline-block",
              }}
            />
            {TCONF[t.k].label}
            <span
              style={{
                background:
                  active === t.k ? "rgba(255,255,255,.15)" : "var(--s2)",
                color: active === t.k ? "rgba(255,255,255,.6)" : "var(--muted)",
                fontSize: 10.5,
                padding: "1px 6px",
                borderRadius: 100,
                fontFamily: "var(--FM)",
              }}
            >
              {t.data.length}
            </span>
          </button>
        ))}
      </div>
      {cur && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "13px 16px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: cur.dot,
                  display: "inline-block",
                }}
              />
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                {TCONF[active].label}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  fontFamily: "var(--FM)",
                }}
              >
                {filtered.length}/{cur.data.length}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="srch">
                <Ic.Srch />
                <input
                  placeholder="Search…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <button
                className="btn btn-p btn-sm"
                onClick={() => goCrud(active)}
              >
                <Ic.Edit /> Manage
              </button>
            </div>
          </div>
          <div className="dt-wrap">
            <table className="dt">
              <thead>
                <tr>
                  {cur.cols.map((c) => (
                    <th key={c}>
                      {c.replace(/_/g, " ")}
                      {c === "id" && <span className="th-t">PK</span>}
                      {FKS.includes(c) && (
                        <span className="th-t th-tf">FK</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={cur.cols.length}
                      style={{
                        textAlign: "center",
                        padding: 36,
                        color: "var(--muted)",
                      }}
                    >
                      No records
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id}>
                      {cur.cols.map((c) => (
                        <td key={c}>
                          <Cell v={row[c]} col={c} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CRUD PAGE
// ══════════════════════════════════════════════════════════════════════════════
function CrudPage({ table, parentData, refresh }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { toasts, toast } = useToast();
  const [fkData, setFkData] = useState({});

  const cfg = TCONF[table] || TCONF.instructors;
  const cols = TCOLS[table] || ["id"];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRecords(await idb.getAll(table));
    } catch {
      toast("Load failed", "er");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  useEffect(() => {
    load();
    setQ("");
  }, [load]);

  useEffect(() => {
    const fkFields = cfg.fields.filter((f) => f.t === "fk");
    Promise.all(
      fkFields.map((f) => idb.getAll(f.store).then((rows) => [f.store, rows])),
    ).then((pairs) => {
      const map = {};
      pairs.forEach(([store, rows]) => {
        map[store] = rows;
      });
      setFkData(map);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const filtered = records.filter((r) =>
    Object.values(r).some((v) =>
      String(v).toLowerCase().includes(q.toLowerCase()),
    ),
  );

  const getFkOptions = (f) => {
    const rows = fkData[f.store] || [];
    const nk = rows[0]
      ? rows[0].name
        ? "name"
        : rows[0].title
          ? "title"
          : "id"
      : "id";
    return rows.map((r) => ({ v: r.id, l: `#${r.id} — ${r[nk]}` }));
  };

  const validate = (fd) => {
    const e = {};
    cfg.fields.forEach((f) => {
      if (f.r && (fd[f.k] === undefined || fd[f.k] === "")) e[f.k] = "Required";
    });
    return e;
  };

  const openAdd = () => {
    setForm({});
    setErrors({});
    setModal({ mode: "add" });
  };
  const openEdit = (r) => {
    setForm({ ...r });
    setErrors({});
    setModal({ mode: "edit", rec: r });
  };
  const openDel = (r) => setModal({ mode: "del", rec: r });

  const save = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      cfg.fields.forEach((f) => {
        if ((f.t === "number" || f.t === "fk") && payload[f.k] !== "")
          payload[f.k] = Number(payload[f.k]);
      });
      if (modal.mode === "add") {
        delete payload.id;
        await idb.add(table, payload);
        toast(`Added to ${cfg.label}`);
      } else {
        payload.id = modal.rec.id;
        await idb.put(table, payload);
        toast("Record updated");
      }
      await load();
      await refresh();
      setModal(null);
    } catch (e) {
      toast(e.message || "Save failed", "er");
    }
    setSaving(false);
  };

  const del = async () => {
    setSaving(true);
    try {
      await idb.del(table, modal.rec.id);
      toast("Deleted");
      await load();
      await refresh();
      setModal(null);
    } catch {
      toast("Delete failed", "er");
    }
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ flex: 1, padding: "28px 28px", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: cfg.dot,
                display: "inline-block",
              }}
            />
            <h2
              style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.3px" }}
            >
              {cfg.label}
            </h2>
            <span
              style={{
                fontSize: 12,
                color: "var(--muted)",
                fontFamily: "var(--FM)",
              }}
            >
              {records.length} records
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div className="srch">
              <Ic.Srch />
              <input
                placeholder="Search…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button className="btn btn-g" onClick={openAdd}>
              <Ic.Plus /> Add Record
            </button>
          </div>
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          {loading ? (
            <div
              style={{ display: "flex", justifyContent: "center", padding: 36 }}
            >
              <div className="ring" />
            </div>
          ) : (
            <div className="dt-wrap">
              <table className="dt">
                <thead>
                  <tr>
                    {cols.map((c) => (
                      <th key={c}>
                        {c.replace(/_/g, " ")}
                        {c === "id" && <span className="th-t">PK</span>}
                        {FKS.includes(c) && (
                          <span className="th-t th-tf">FK</span>
                        )}
                      </th>
                    ))}
                    <th style={{ textAlign: "right", width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={cols.length + 1}
                        style={{
                          textAlign: "center",
                          padding: 36,
                          color: "var(--muted)",
                        }}
                      >
                        {records.length === 0
                          ? "No records yet. Add one!"
                          : "No matches."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr key={row.id}>
                        {cols.map((c) => (
                          <td key={c}>
                            <Cell v={row[c]} col={c} />
                          </td>
                        ))}
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              className="btn btn-out btn-sm btn-ico"
                              title="Edit"
                              onClick={() => openEdit(row)}
                            >
                              <Ic.Edit />
                            </button>
                            <button
                              className="btn btn-del btn-sm btn-ico"
                              title="Delete"
                              onClick={() => openDel(row)}
                            >
                              <Ic.Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 14,
            padding: "11px 14px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r)",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
            fontSize: 12,
          }}
        >
          <span style={{ fontWeight: 700, color: cfg.dot, marginRight: 4 }}>
            Schema:
          </span>
          {cfg.fields.map((f) => (
            <span
              key={f.k}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                background: "var(--s2)",
                border: "1px solid var(--border)",
                padding: "2px 8px",
                borderRadius: 6,
                fontFamily: "var(--FM)",
                fontSize: 11.5,
                color: "var(--ink2)",
              }}
            >
              {f.k}
              <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                {" "}
                {f.t}
                {f.store ? ` → ${f.store}` : ""}
                {f.r ? " *" : ""}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && modal.mode !== "del" && (
        <div
          className="mo"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="mb">
            <div className="mh">
              <div className="mt">
                {modal.mode === "add"
                  ? `Add ${cfg.label} Record`
                  : `Edit Record #${modal.rec?.id}`}
              </div>
              <button
                className="btn btn-out btn-sm btn-ico"
                onClick={() => setModal(null)}
              >
                <Ic.X />
              </button>
            </div>
            <div className="my">
              <div className="fg2">
                {cfg.fields.map((f) => {
                  const opts = f.t === "fk" ? getFkOptions(f) : null;
                  const isErr = !!errors[f.k];
                  const cls = `fi${f.t === "select" || f.t === "fk" ? " fi-sel" : ""}${isErr ? " err" : ""}`;
                  return (
                    <div
                      key={f.k}
                      className={`fg${f.t === "textarea" ? " fw" : ""}`}
                    >
                      <label className="fl">
                        {f.l}
                        {f.r && (
                          <span style={{ color: "var(--red)", marginLeft: 3 }}>
                            *
                          </span>
                        )}
                      </label>
                      {f.t === "textarea" ? (
                        <textarea
                          className={`fi${isErr ? " err" : ""}`}
                          rows={3}
                          value={form[f.k] || ""}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, [f.k]: e.target.value }));
                            setErrors((e2) => ({ ...e2, [f.k]: null }));
                          }}
                          style={{ resize: "vertical", minHeight: 64 }}
                        />
                      ) : f.t === "select" ? (
                        <select
                          className={cls}
                          value={form[f.k] || ""}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, [f.k]: e.target.value }));
                            setErrors((e2) => ({ ...e2, [f.k]: null }));
                          }}
                        >
                          <option value="">Select…</option>
                          {f.opts.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : f.t === "fk" ? (
                        <select
                          className={cls}
                          value={form[f.k] || ""}
                          onChange={(e) => {
                            setForm((p) => ({
                              ...p,
                              [f.k]: Number(e.target.value),
                            }));
                            setErrors((e2) => ({ ...e2, [f.k]: null }));
                          }}
                        >
                          <option value="">Select {f.store}…</option>
                          {(opts || []).map((o) => (
                            <option key={o.v} value={o.v}>
                              {o.l}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.t}
                          className={cls}
                          value={form[f.k] ?? ""}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, [f.k]: e.target.value }));
                            setErrors((e2) => ({ ...e2, [f.k]: null }));
                          }}
                        />
                      )}
                      {isErr && <span className="ferr">{errors[f.k]}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mf">
              <button className="btn btn-out" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="btn btn-g" onClick={save} disabled={saving}>
                {saving ? <div className="ring ring-sm" /> : <Ic.Save />}
                {modal.mode === "add" ? "Add Record" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal && modal.mode === "del" && (
        <div
          className="mo"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="mb" style={{ maxWidth: 400 }}>
            <div className="mh">
              <div className="mt" style={{ color: "var(--red)" }}>
                Delete Record
              </div>
              <button
                className="btn btn-out btn-sm btn-ico"
                onClick={() => setModal(null)}
              >
                <Ic.X />
              </button>
            </div>
            <div className="my" style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "var(--red-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  color: "var(--red)",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3,6 5,6 21,6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </div>
              <p style={{ fontSize: 14, color: "var(--ink)" }}>
                Delete <strong>record #{modal.rec?.id}</strong> from{" "}
                <strong>{cfg.label}</strong>?
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  marginTop: 7,
                  lineHeight: 1.6,
                }}
              >
                This cannot be undone. Dependent records may become orphaned.
              </p>
            </div>
            <div className="mf">
              <button className="btn btn-out" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="btn btn-del" onClick={del} disabled={saving}>
                {saving ? "Deleting…" : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ta">
        {toasts.map((t) => (
          <div key={t.id} className={`tos ${t.type}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCHEMA PAGE
// ══════════════════════════════════════════════════════════════════════════════
function SchemaPage() {
  const entities = [
    {
      name: "INSTRUCTOR",
      dot: "#9333ea",
      fields: [
        { n: "id", t: "int", tag: "PK" },
        { n: "name", t: "string" },
        { n: "email", t: "string" },
        { n: "password", t: "string" },
        { n: "bio", t: "string" },
        { n: "experience_years", t: "int" },
        { n: "created_at", t: "datetime" },
      ],
      desc: "Educators who create and manage course content.",
    },
    {
      name: "COURSE",
      dot: "#0284c7",
      fields: [
        { n: "id", t: "int", tag: "PK" },
        { n: "title", t: "string" },
        { n: "description", t: "string" },
        { n: "price", t: "float" },
        { n: "level", t: "enum" },
        { n: "instructor_id", t: "int", tag: "FK" },
        { n: "created_at", t: "datetime" },
      ],
      desc: "Educational product organized into modules.",
    },
    {
      name: "MODULE",
      dot: "#d97706",
      fields: [
        { n: "id", t: "int", tag: "PK" },
        { n: "title", t: "string" },
        { n: "order_index", t: "int" },
        { n: "course_id", t: "int", tag: "FK" },
      ],
      desc: "Logical section of a course. Ordered. Contains lessons.",
    },
    {
      name: "LESSON",
      dot: "#db2777",
      fields: [
        { n: "id", t: "int", tag: "PK" },
        { n: "title", t: "string" },
        { n: "content_type", t: "enum" },
        { n: "duration", t: "int" },
        { n: "module_id", t: "int", tag: "FK" },
      ],
      desc: "Individual video or text content unit inside a module.",
    },
    {
      name: "STUDENT",
      dot: "#16a34a",
      fields: [
        { n: "id", t: "int", tag: "PK" },
        { n: "name", t: "string" },
        { n: "email", t: "string" },
        { n: "password", t: "string" },
        { n: "created_at", t: "datetime" },
      ],
      desc: "Registered learner. Can enroll in multiple courses.",
    },
    {
      name: "STUDENT_PROFILE",
      dot: "#ef4444",
      fields: [
        { n: "id", t: "int", tag: "PK" },
        { n: "phone", t: "string" },
        { n: "address", t: "string" },
        { n: "date_of_birth", t: "date" },
        { n: "student_id", t: "int", tag: "FK (unique)" },
      ],
      desc: "Extended personal info. Strict 1-to-1 with STUDENT.",
    },
    {
      name: "ENROLLMENT",
      dot: "#7c3aed",
      fields: [
        { n: "id", t: "int", tag: "PK" },
        { n: "enrolled_at", t: "datetime" },
        { n: "status", t: "enum" },
        { n: "student_id", t: "int", tag: "FK" },
        { n: "course_id", t: "int", tag: "FK" },
      ],
      desc: "Junction table. Links Students ↔ Courses.",
    },
  ];
  const rels = [
    {
      a: "INSTRUCTOR",
      b: "COURSE",
      type: "1 : N",
      via: "creates",
      dot: "#0284c7",
      desc: "One instructor creates many courses.",
      rule: "instructor.id → course.instructor_id",
    },
    {
      a: "COURSE",
      b: "MODULE",
      type: "1 : N",
      via: "has",
      dot: "#d97706",
      desc: "A course contains multiple ordered modules.",
      rule: "course.id → module.course_id",
    },
    {
      a: "MODULE",
      b: "LESSON",
      type: "1 : N",
      via: "contains",
      dot: "#db2777",
      desc: "Every module holds multiple lessons.",
      rule: "module.id → lesson.module_id",
    },
    {
      a: "STUDENT",
      b: "STUDENT_PROFILE",
      type: "1 : 1",
      via: "has",
      dot: "#ef4444",
      desc: "Each student has exactly one profile. Enforced by unique index.",
      rule: "student.id → student_profile.student_id (UNIQUE)",
    },
    {
      a: "STUDENT",
      b: "COURSE",
      type: "N : M",
      via: "via ENROLLMENT",
      dot: "#7c3aed",
      desc: "Students enroll in many courses; courses have many students.",
      rule: "student.id → enrollment.student_id + course.id → enrollment.course_id",
    },
  ];
  const TK = {
    PK: ["#1a6b5a", "#e8f4f1"],
    FK: ["#5b3fa6", "#eeebf8"],
    "FK (unique)": ["#c84b2f", "#faeae6"],
  };
  return (
    <div style={{ padding: "28px 32px", maxWidth: 1140 }}>
      <div style={{ marginBottom: 26 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "-.4px",
            marginBottom: 5,
          }}
        >
          Schema & Relationships
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
          Full ERD — 7 tables, 5 relationships, implemented in IndexedDB.
        </p>
      </div>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 12,
        }}
      >
        Entity Tables
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {entities.map((e) => (
          <div key={e.name} className="card" style={{ overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 14px",
                borderBottom: "1px solid var(--border)",
                borderTop: `3px solid ${e.dot}`,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: e.dot,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--FM)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {e.name}
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                padding: "9px 14px",
                borderBottom: "1px solid var(--border)",
                lineHeight: 1.5,
              }}
            >
              {e.desc}
            </div>
            {e.fields.map((f) => (
              <div
                key={f.n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "5px 14px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--FM)",
                    fontSize: 12,
                    color: "var(--ink2)",
                  }}
                >
                  {f.n}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      color: "var(--muted)",
                      fontFamily: "var(--FM)",
                    }}
                  >
                    {f.t}
                  </span>
                  {f.tag &&
                    (() => {
                      const [tc, bg] = TK[f.tag] || ["#64748b", "#f1f5f9"];
                      return (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: 3,
                            background: bg,
                            color: tc,
                            letterSpacing: 0.3,
                          }}
                        >
                          {f.tag}
                        </span>
                      );
                    })()}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 12,
        }}
      >
        Relationships
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 32,
        }}
      >
        {rels.map((r) => (
          <div
            key={r.a + r.b}
            className="card-s"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 14,
              padding: "16px 18px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 7,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--FM)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  {r.a}
                </span>
                <span
                  style={{
                    fontFamily: "var(--FM)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: r.dot,
                    letterSpacing: 1,
                  }}
                >
                  {r.type}
                </span>
                <span
                  style={{
                    fontFamily: "var(--FM)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  {r.b}
                </span>
                <span className="p p-k" style={{ fontSize: 11 }}>
                  {r.via}
                </span>
              </div>
              <p
                style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.6 }}
              >
                {r.desc}
              </p>
            </div>
            <div style={{ flexShrink: 0, width: 260 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 5,
                }}
              >
                Constraint
              </div>
              <code
                style={{
                  fontFamily: "var(--FM)",
                  fontSize: 11.5,
                  color: "var(--green)",
                  background: "var(--green-bg)",
                  padding: "7px 10px",
                  borderRadius: 7,
                  display: "block",
                  lineHeight: 1.7,
                }}
              >
                {r.rule}
              </code>
            </div>
          </div>
        ))}
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {[
            { v: "7", t: "Object Stores", d: "One per entity table" },
            { v: "8", t: "DB Indexes", d: "FK & unique indexes" },
            { v: "40+", t: "Seed Records", d: "Pre-loaded on first run" },
            { v: "100%", t: "Browser Storage", d: "No server required" },
          ].map((i) => (
            <div
              key={i.t}
              style={{
                padding: "18px 20px",
                borderRight: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-.4px",
                  marginBottom: 2,
                }}
              >
                {i.v}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--ink2)",
                  marginBottom: 2,
                }}
              >
                {i.t}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{i.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ERD PAGE
// ══════════════════════════════════════════════════════════════════════════════
function ErdPage() {
  const entities = [
    {
      id: "instructor",
      label: "INSTRUCTOR",
      x: 320,
      y: 20,
      dot: "#9333ea",
      border: "#9333ea",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "name", t: "VARCHAR" },
        { n: "email", t: "VARCHAR" },
        { n: "password", t: "VARCHAR" },
        { n: "bio", t: "TEXT" },
        { n: "experience_years", t: "INT" },
        { n: "created_at", t: "DATETIME" },
      ],
    },
    {
      id: "course",
      label: "COURSE",
      x: 680,
      y: 20,
      dot: "#0284c7",
      border: "#0284c7",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "title", t: "VARCHAR" },
        { n: "description", t: "TEXT" },
        { n: "price", t: "FLOAT" },
        { n: "level", t: "ENUM" },
        { n: "instructor_id", t: "INT", fk: "INSTRUCTOR" },
        { n: "created_at", t: "DATETIME" },
      ],
    },
    {
      id: "module",
      label: "MODULE",
      x: 680,
      y: 310,
      dot: "#d97706",
      border: "#d97706",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "title", t: "VARCHAR" },
        { n: "order_index", t: "INT" },
        { n: "course_id", t: "INT", fk: "COURSE" },
      ],
    },
    {
      id: "lesson",
      label: "LESSON",
      x: 680,
      y: 530,
      dot: "#db2777",
      border: "#db2777",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "title", t: "VARCHAR" },
        { n: "content_type", t: "ENUM" },
        { n: "duration", t: "INT" },
        { n: "module_id", t: "INT", fk: "MODULE" },
      ],
    },
    {
      id: "student",
      label: "STUDENT",
      x: 20,
      y: 20,
      dot: "#16a34a",
      border: "#16a34a",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "name", t: "VARCHAR" },
        { n: "email", t: "VARCHAR" },
        { n: "password", t: "VARCHAR" },
        { n: "created_at", t: "DATETIME" },
      ],
    },
    {
      id: "profile",
      label: "STUDENT_PROFILE",
      x: 20,
      y: 280,
      dot: "#ef4444",
      border: "#ef4444",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "phone", t: "VARCHAR" },
        { n: "address", t: "VARCHAR" },
        { n: "date_of_birth", t: "DATE" },
        { n: "student_id", t: "INT", fk: "STUDENT", unique: true },
      ],
    },
    {
      id: "enrollment",
      label: "ENROLLMENT",
      x: 340,
      y: 310,
      dot: "#7c3aed",
      border: "#7c3aed",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "enrolled_at", t: "DATETIME" },
        { n: "status", t: "ENUM" },
        { n: "student_id", t: "INT", fk: "STUDENT" },
        { n: "course_id", t: "INT", fk: "COURSE" },
      ],
    },
  ];
  const BOX_W = 210,
    ROW_H = 24,
    HEADER_H = 34;
  const getBoxH = (e) => HEADER_H + e.fields.length * ROW_H;
  const connections = [
    {
      fromId: "instructor",
      fromSide: "right",
      fromY: (e) => HEADER_H + ROW_H * 0 + ROW_H / 2,
      toId: "course",
      toSide: "left",
      toY: (e) => HEADER_H + ROW_H * 5 + ROW_H / 2,
      label: "creates",
      type: "1N",
      color: "#0284c7",
    },
    {
      fromId: "course",
      fromSide: "bottom",
      fromY: null,
      toId: "module",
      toSide: "top",
      toY: null,
      label: "has",
      type: "1N",
      color: "#d97706",
    },
    {
      fromId: "module",
      fromSide: "bottom",
      fromY: null,
      toId: "lesson",
      toSide: "top",
      toY: null,
      label: "contains",
      type: "1N",
      color: "#db2777",
    },
    {
      fromId: "student",
      fromSide: "bottom",
      fromY: null,
      toId: "profile",
      toSide: "top",
      toY: null,
      label: "has (1:1)",
      type: "11",
      color: "#ef4444",
    },
    {
      fromId: "student",
      fromSide: "right",
      fromY: (e) => HEADER_H + ROW_H * 0 + ROW_H / 2,
      toId: "enrollment",
      toSide: "left",
      toY: (e) => HEADER_H + ROW_H * 3 + ROW_H / 2,
      label: "enrolls",
      type: "NM",
      color: "#7c3aed",
    },
    {
      fromId: "course",
      fromSide: "left",
      fromY: (e) => HEADER_H + ROW_H * 0 + ROW_H / 2,
      toId: "enrollment",
      toSide: "right",
      toY: (e) => HEADER_H + ROW_H * 4 + ROW_H / 2,
      label: "included in",
      type: "NM",
      color: "#7c3aed",
    },
  ];
  const getEntity = (id) => entities.find((e) => e.id === id);
  const getPoint = (eid, side, yFn) => {
    const e = getEntity(eid);
    const bh = getBoxH(e);
    switch (side) {
      case "right":
        return { x: e.x + BOX_W, y: e.y + (yFn ? yFn(e) : bh / 2) };
      case "left":
        return { x: e.x, y: e.y + (yFn ? yFn(e) : bh / 2) };
      case "bottom":
        return { x: e.x + BOX_W / 2, y: e.y + bh };
      case "top":
        return { x: e.x + BOX_W / 2, y: e.y };
      default:
        return { x: e.x, y: e.y };
    }
  };
  const CrowMany = ({ x, y, dir }) => {
    const d = dir === "left" ? -1 : dir === "right" ? 1 : 0;
    if (d !== 0)
      return (
        <g>
          <line
            x1={x}
            y1={y - 7}
            x2={x + d * 10}
            y2={y}
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1={x}
            y1={y + 7}
            x2={x + d * 10}
            y2={y}
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1={x}
            y1={y - 7}
            x2={x}
            y2={y + 7}
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </g>
      );
    return (
      <g>
        <line
          x1={x - 7}
          y1={y}
          x2={x}
          y2={y + (dir === "up" ? -1 : 1) * 10}
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1={x + 7}
          y1={y}
          x2={x}
          y2={y + (dir === "up" ? -1 : 1) * 10}
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1={x - 7}
          y1={y}
          x2={x + 7}
          y2={y}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </g>
    );
  };
  const CrowOne = ({ x, y, dir }) => {
    const d = dir === "left" ? -1 : dir === "right" ? 1 : 0;
    if (d !== 0)
      return (
        <g>
          <line
            x1={x}
            y1={y - 6}
            x2={x}
            y2={y + 6}
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1={x + d * 6}
            y1={y - 6}
            x2={x + d * 6}
            y2={y + 6}
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </g>
      );
    return (
      <g>
        <line
          x1={x - 6}
          y1={y}
          x2={x + 6}
          y2={y}
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1={x - 6}
          y1={y + (dir === "up" ? -1 : 1) * 6}
          x2={x + 6}
          y2={y + (dir === "up" ? -1 : 1) * 6}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </g>
    );
  };
  const SVG_W = 920,
    SVG_H = 760;
  return (
    <div style={{ padding: "28px 32px", maxWidth: 1140 }}>
      <div style={{ marginBottom: 22 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "-.4px",
            marginBottom: 5,
          }}
        >
          Entity Relationship Diagram
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
          Visual ERD — all 7 entities and their relationships.
        </p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 18,
          padding: "10px 16px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "var(--muted)",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Legend
        </span>
        {[
          { label: "PK — Primary Key", color: "#1a6b5a", bg: "#e8f4f1" },
          { label: "FK — Foreign Key", color: "#5b3fa6", bg: "#eeebf8" },
          {
            label: "1 : N — One to Many",
            line: true,
            dash: false,
            color: "#0284c7",
          },
          {
            label: "1 : 1 — One to One",
            line: true,
            dash: true,
            color: "#ef4444",
          },
          {
            label: "N : M — Many to Many",
            line: true,
            dash: false,
            color: "#7c3aed",
          },
        ].map((l) => (
          <div
            key={l.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--ink2)",
            }}
          >
            {l.bg ? (
              <span
                style={{
                  background: l.bg,
                  color: l.color,
                  fontFamily: "var(--FM)",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: 3,
                }}
              >
                {l.label.slice(0, 2)}
              </span>
            ) : (
              <svg width="28" height="10">
                <line
                  x1="0"
                  y1="5"
                  x2="28"
                  y2="5"
                  stroke={l.color}
                  strokeWidth="1.8"
                  strokeDasharray={l.dash ? "4,3" : undefined}
                />
              </svg>
            )}
            <span>{l.label}</span>
          </div>
        ))}
      </div>
      <div className="card" style={{ overflow: "auto", padding: 0 }}>
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display: "block", minWidth: SVG_W }}
        >
          {connections.map((conn, ci) => {
            const fp = getPoint(conn.fromId, conn.fromSide, conn.fromY);
            const tp = getPoint(conn.toId, conn.toSide, conn.toY);
            const isV = conn.fromSide === "bottom" || conn.fromSide === "top";
            let d;
            if (isV) {
              const my = (fp.y + tp.y) / 2;
              d = `M${fp.x},${fp.y} C${fp.x},${my} ${tp.x},${my} ${tp.x},${tp.y}`;
            } else {
              const mx = (fp.x + tp.x) / 2;
              d = `M${fp.x},${fp.y} C${mx},${fp.y} ${mx},${tp.y} ${tp.x},${tp.y}`;
            }
            const dash = conn.type === "11" ? "5,3" : undefined;
            const lx = (fp.x + tp.x) / 2,
              ly = (fp.y + tp.y) / 2;
            const toDir =
              conn.toSide === "left"
                ? "left"
                : conn.toSide === "right"
                  ? "right"
                  : conn.toSide === "top"
                    ? "up"
                    : "down";
            const fromDir =
              conn.fromSide === "left"
                ? "right"
                : conn.fromSide === "right"
                  ? "left"
                  : conn.fromSide === "top"
                    ? "down"
                    : "up";
            return (
              <g key={ci} color={conn.color}>
                <path
                  d={d}
                  fill="none"
                  stroke={conn.color}
                  strokeWidth="1.6"
                  strokeDasharray={dash}
                  opacity="0.85"
                />
                {(conn.type === "1N" || conn.type === "NM") && (
                  <CrowMany x={tp.x} y={tp.y} dir={toDir} />
                )}
                {conn.type === "11" && (
                  <CrowOne x={tp.x} y={tp.y} dir={toDir} />
                )}
                {conn.type === "1N" && (
                  <CrowOne x={fp.x} y={fp.y} dir={fromDir} />
                )}
                {conn.type === "NM" && (
                  <CrowMany x={fp.x} y={fp.y} dir={fromDir} />
                )}
                {conn.type === "11" && (
                  <CrowOne x={fp.x} y={fp.y} dir={fromDir} />
                )}
                <rect
                  x={lx - 28}
                  y={ly - 9}
                  width={56}
                  height={16}
                  rx={4}
                  fill="white"
                  opacity="0.9"
                />
                <text
                  x={lx}
                  y={ly + 3}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill={conn.color}
                  fontFamily="var(--FM)"
                >
                  {conn.label}
                </text>
              </g>
            );
          })}
          {entities.map((e) => {
            const bh = getBoxH(e);
            return (
              <g key={e.id}>
                <rect
                  x={e.x + 2}
                  y={e.y + 2}
                  width={BOX_W}
                  height={bh}
                  rx={8}
                  fill="rgba(22,20,16,0.07)"
                />
                <rect
                  x={e.x}
                  y={e.y}
                  width={BOX_W}
                  height={bh}
                  rx={8}
                  fill="white"
                  stroke={e.border}
                  strokeWidth="1.8"
                />
                <rect
                  x={e.x}
                  y={e.y}
                  width={BOX_W}
                  height={HEADER_H}
                  rx={8}
                  fill={e.dot}
                />
                <rect
                  x={e.x}
                  y={e.y + HEADER_H - 8}
                  width={BOX_W}
                  height={8}
                  fill={e.dot}
                />
                <text
                  x={e.x + BOX_W / 2}
                  y={e.y + HEADER_H / 2 + 5}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="800"
                  fill="white"
                  fontFamily="var(--FM)"
                  letterSpacing="0.5"
                >
                  {e.label}
                </text>
                {e.fields.map((f, fi) => {
                  const fy = e.y + HEADER_H + fi * ROW_H;
                  const isLast = fi === e.fields.length - 1;
                  const bgFill = f.pk
                    ? "#e8f4f1"
                    : f.fk
                      ? "#eeebf8"
                      : fi % 2 === 0
                        ? "#fafaf9"
                        : "white";
                  return (
                    <g key={f.n}>
                      <rect
                        x={e.x + 1}
                        y={fy}
                        width={BOX_W - 2}
                        height={ROW_H}
                        fill={bgFill}
                      />
                      {!isLast && (
                        <line
                          x1={e.x + 1}
                          y1={fy + ROW_H}
                          x2={e.x + BOX_W - 1}
                          y2={fy + ROW_H}
                          stroke="#e4e0d8"
                          strokeWidth="0.8"
                        />
                      )}
                      {f.pk && (
                        <>
                          <rect
                            x={e.x + 6}
                            y={fy + 5}
                            width={18}
                            height={13}
                            rx={2}
                            fill="#1a6b5a"
                          />
                          <text
                            x={e.x + 15}
                            y={fy + 15}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="800"
                            fill="white"
                            fontFamily="var(--FM)"
                          >
                            PK
                          </text>
                        </>
                      )}
                      {f.fk && (
                        <>
                          <rect
                            x={e.x + 6}
                            y={fy + 5}
                            width={16}
                            height={13}
                            rx={2}
                            fill="#5b3fa6"
                          />
                          <text
                            x={e.x + 14}
                            y={fy + 15}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="800"
                            fill="white"
                            fontFamily="var(--FM)"
                          >
                            FK
                          </text>
                        </>
                      )}
                      {f.unique && (
                        <>
                          <rect
                            x={e.x + 24}
                            y={fy + 5}
                            width={16}
                            height={13}
                            rx={2}
                            fill="#c84b2f"
                          />
                          <text
                            x={e.x + 32}
                            y={fy + 15}
                            textAnchor="middle"
                            fontSize="7.5"
                            fontWeight="800"
                            fill="white"
                            fontFamily="var(--FM)"
                          >
                            UQ
                          </text>
                        </>
                      )}
                      <text
                        x={e.x + (f.pk || f.fk ? 30 : 10)}
                        y={fy + 16}
                        fontSize="11"
                        fill={f.pk ? "#1a6b5a" : f.fk ? "#5b3fa6" : "#4a4640"}
                        fontFamily="var(--FM)"
                        fontWeight={f.pk || f.fk ? "700" : "400"}
                      >
                        {f.n}
                      </text>
                      <text
                        x={e.x + BOX_W - 8}
                        y={fy + 16}
                        textAnchor="end"
                        fontSize="9.5"
                        fill="#9a9590"
                        fontFamily="var(--FM)"
                      >
                        {f.t}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="card" style={{ overflow: "hidden", marginTop: 16 }}>
        <div
          style={{
            padding: "13px 18px",
            borderBottom: "1px solid var(--border)",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Relationship Summary
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>From</th>
              <th>Relationship</th>
              <th>To</th>
              <th>Type</th>
              <th>FK Column</th>
              <th>Constraint</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                from: "INSTRUCTOR",
                rel: "creates",
                to: "COURSE",
                type: "1 : N",
                fk: "course.instructor_id",
                note: "Each course has one instructor",
              },
              {
                from: "COURSE",
                rel: "has",
                to: "MODULE",
                type: "1 : N",
                fk: "module.course_id",
                note: "Modules ordered by index",
              },
              {
                from: "MODULE",
                rel: "contains",
                to: "LESSON",
                type: "1 : N",
                fk: "lesson.module_id",
                note: "Each lesson in one module",
              },
              {
                from: "STUDENT",
                rel: "has",
                to: "STUDENT_PROFILE",
                type: "1 : 1",
                fk: "student_profile.student_id",
                note: "UNIQUE index enforced",
              },
              {
                from: "STUDENT",
                rel: "enrolls via",
                to: "ENROLLMENT",
                type: "N : M",
                fk: "enrollment.student_id",
                note: "Junction table",
              },
              {
                from: "COURSE",
                rel: "included in",
                to: "ENROLLMENT",
                type: "N : M",
                fk: "enrollment.course_id",
                note: "Junction table",
              },
            ].map((r, i) => (
              <tr key={i}>
                <td>
                  <span
                    style={{
                      fontFamily: "var(--FM)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--ink)",
                    }}
                  >
                    {r.from}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      fontStyle: "italic",
                    }}
                  >
                    {r.rel}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontFamily: "var(--FM)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--ink)",
                    }}
                  >
                    {r.to}
                  </span>
                </td>
                <td>
                  <span
                    className={`p ${r.type === "1 : 1" ? "p-r" : r.type === "N : M" ? "p-v" : "p-b"}`}
                    style={{ fontSize: 11 }}
                  >
                    {r.type}
                  </span>
                </td>
                <td>
                  <code
                    style={{
                      fontFamily: "var(--FM)",
                      fontSize: 11,
                      color: "var(--green)",
                      background: "var(--green-bg)",
                      padding: "1px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {r.fk}
                  </code>
                </td>
                <td style={{ fontSize: 12, color: "var(--muted)" }}>
                  {r.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// INIT POPUP
// ══════════════════════════════════════════════════════════════════════════════
function InitPopup({ onInit }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInit = async () => {
    setLoading(true);
    setError(null);
    try {
      await openDB();
      await seedDB();
      localStorage.setItem("lpInitialized", "1");
      onInit();
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(22,20,16,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--rl)",
          boxShadow: "var(--shl)",
          width: "100%",
          maxWidth: 440,
          padding: "36px 36px 28px",
          textAlign: "center",
          animation: "mbIn .22s ease",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "var(--green-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 26,
          }}
        >
          🗄️
        </div>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "-.3px",
            marginBottom: 10,
            color: "var(--ink)",
          }}
        >
          Initialize Database
        </h2>
        <p
          style={{
            fontSize: 13.5,
            color: "var(--muted)",
            lineHeight: 1.75,
            marginBottom: 24,
          }}
        >
          To use <strong style={{ color: "var(--ink)" }}>LearnPlatform</strong>,
          the local IndexedDB database needs to be set up with seed data first.
          <br />
          This only happens{" "}
          <strong style={{ color: "var(--ink)" }}>once</strong> — after that,
          the app opens instantly every time.
        </p>

        {error && (
          <div
            style={{
              background: "var(--red-bg)",
              border: "1px solid #f0bfb4",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--red)",
              marginBottom: 16,
              textAlign: "left",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleInit}
          disabled={loading}
          style={{
            width: "100%",
            background: "var(--green)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 0",
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {loading ? (
            <>
              <div
                className="ring ring-sm"
                style={{
                  borderTopColor: "#fff",
                  borderColor: "rgba(255,255,255,.3)",
                }}
              />{" "}
              Initializing…
            </>
          ) : (
            <>
              {" "}
              <span>⚡</span> Initialize Now
            </>
          )}
        </button>

        <p style={{ fontSize: 11.5, color: "var(--muted)" }}>
          All data is stored locally in your browser. No server or internet
          required.
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("overview");
  const [crudTable, setCrudTable] = useState("instructors");
  const [data, setData] = useState(null);
  const [appReady, setAppReady] = useState(false);
  const [showInit, setShowInit] = useState(false);
  const [sbOpen, setSbOpen] = useState(() => window.innerWidth > 760);

  // Lock background scroll while the sidebar drawer covers the screen on mobile.
  useEffect(() => {
    if (window.innerWidth <= 760) {
      document.body.style.overflow = sbOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sbOpen]);

  const loadData = useCallback(async () => {
    const [
      instructors,
      courses,
      modules,
      lessons,
      students,
      profiles,
      enrollments,
    ] = await Promise.all([
      idb.getAll("instructors"),
      idb.getAll("courses"),
      idb.getAll("modules"),
      idb.getAll("lessons"),
      idb.getAll("students"),
      idb.getAll("student_profiles"),
      idb.getAll("enrollments"),
    ]);
    setData({
      instructors,
      courses,
      modules,
      lessons,
      students,
      profiles,
      enrollments,
    });
    setAppReady(true);
  }, []);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    const initialized = localStorage.getItem("lpInitialized");
    if (initialized) {
      // DB already set up — open it and load straight away
      openDB()
        .then(() => loadData())
        .catch(() => {
          // DB might have been cleared — show init popup again
          localStorage.removeItem("lpInitialized");
          setShowInit(true);
        });
    } else {
      // First visit — show the popup
      setShowInit(true);
    }
  }, [loadData]);

  const handleInitDone = useCallback(() => {
    setShowInit(false);
    loadData();
  }, [loadData]);

  const goCrud = (tbl) => {
    const k = TKEYS.includes(tbl) ? tbl : "instructors";
    setCrudTable(k);
    setPage("crud");
  };

  return (
    <>
      <style>{G}</style>
      {showInit && <InitPopup onInit={handleInitDone} />}
      <button
        className="mob-ham"
        onClick={() => setSbOpen(true)}
        aria-label="Open menu"
        style={{ display: sbOpen ? "none" : undefined }}
      >
        <Ic.Menu />
      </button>
      <div
        className={`sb-backdrop${sbOpen ? " show" : ""}`}
        onClick={() => setSbOpen(false)}
      />
      <div className="app">
        <Sidebar
          page={page}
          setPage={setPage}
          open={sbOpen}
          setOpen={setSbOpen}
          data={data}
          goCrud={goCrud}
          crudTable={crudTable}
        />
        <div className={`main${sbOpen ? "" : " coll"}`}>
          {!appReady ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div className="ring" />
              <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
                Loading data…
              </p>
            </div>
          ) : (
            <>
              {page === "overview" && (
                <OverviewPage data={data} setPage={setPage} goCrud={goCrud} />
              )}
              {page === "tables" && <TablesPage data={data} goCrud={goCrud} />}
              {page === "crud" && (
                <CrudPage
                  table={crudTable}
                  parentData={data}
                  refresh={refresh}
                />
              )}
              {page === "schema" && <SchemaPage />}
              {page === "erd" && <ErdPage />}
              {page === "slides" && <SlidesPage />}
            </>
          )}
        </div>
      </div>
    </>
  );
}
