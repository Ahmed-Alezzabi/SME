import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { TrainingProgram, Participant, AuditLog } from "./src/types";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db_store.json");

app.use(express.json());

// Seed/Initial Data
const initialPrograms: TrainingProgram[] = [
  {
    id: "PRG-2026-001",
    programNumber: "TBC-2026-01",
    name: "دورة ريادة الأعمال وإدارة المشروعات الصغيرة",
    type: "حضورى",
    startDate: "2026-05-10",
    endDate: "2026-05-14",
    days: 5,
    hours: 20,
    location: "قاعة التدريب الرئيسية - مركز طرابلس",
    city: "طرابلس",
    trainer: "د. عبد السلام الترهوني",
    organization: "البرنامج الوطني لدعم المشروعات الصغرى والمتوسطة",
    targetGroup: "أصحاب المشاريع الناشئة والشباب المبادر",
    maxParticipants: 25,
    status: "completed",
    notes: "تمت الدورة بنجاح وحضور ممتاز من رواد الأعمال المبادرين."
  },
  {
    id: "PRG-2026-002",
    programNumber: "TBC-2026-02",
    name: "إعداد دراسات الجدوى الاقتصادية للمشروعات الصغرى",
    type: "حضورى",
    startDate: "2026-06-15",
    endDate: "2026-06-19",
    days: 5,
    hours: 25,
    location: "قاعة التميز - فرع طرابلس",
    city: "طرابلس",
    trainer: "أ. منال الورفلي",
    organization: "مركز أعمال طرابلس",
    targetGroup: "المستثمرين الشبان وأصحاب الأفكار الريادية",
    maxParticipants: 20,
    status: "active",
    notes: "الدورة جارية حالياً وهناك تفاعل ممتاز وتطوير عملي لنماذج مشاريع حقيقية."
  },
  {
    id: "PRG-2026-003",
    programNumber: "TBC-2026-03",
    name: "التسويق الرقمي وبناء الهوية التجارية الرقمية",
    type: "عن بعد",
    startDate: "2026-07-02",
    endDate: "2026-07-07",
    days: 6,
    hours: 24,
    location: "منصة تدريب مركز الأعمال الافتراضية",
    city: "مصراتة",
    trainer: "م. محمد بن لطيف",
    organization: "مركز أعمال طرابلس بالتعاون مع فرع مصراتة",
    targetGroup: "مسؤولي التسويق وملاك المحلات والخدمات الإلكترونية",
    maxParticipants: 30,
    status: "planning",
    notes: "التسجيل مفتوح عبر المنظومة الوطنية حالياً."
  },
  {
    id: "PRG-2026-004",
    programNumber: "TBC-2026-04",
    name: "التخطيط المالي والمحاسبة لغير المحاسبين في الشركات الناشئة",
    type: "هجين",
    startDate: "2026-04-12",
    endDate: "2026-04-16",
    days: 5,
    hours: 15,
    location: "قاعة الابتكار - فرع بنغازي",
    city: "بنغازي",
    trainer: "د. عمر الشيباني",
    organization: "البرنامج الوطني لدعم المشروعات الصغرى والمتوسطة",
    targetGroup: "أصحاب المشاريع القائمة الذين يواجهون مشاكل تنظيم مالي",
    maxParticipants: 18,
    status: "completed",
    notes: "تم تقديم المادة بأسلوب مالي مبسط مع توفير حقيبة إكسل محاسبية."
  },
  {
    id: "PRG-2026-005",
    programNumber: "TBC-2026-05",
    name: "مهارات العرض والإقناع وجذب المستثمرين والتمويل",
    type: "حضورى",
    startDate: "2026-03-01",
    endDate: "2026-03-04",
    days: 4,
    hours: 16,
    location: "مركز دراسات الاستثمار - طرابلس",
    city: "طرابلس",
    trainer: "أ. طارق الشريف",
    organization: "شراكة مع صندوق التسهيلات الائتمانية",
    targetGroup: "أصحاب الأفكار المسجلين بمسابقة التمويل السنوية",
    maxParticipants: 15,
    status: "archived",
    notes: "دورة مكثفة لمساعدة الرياديين على تقديم عروضهم أمام لجنة القروض والتمويل."
  }
];

const initialParticipants: Participant[] = [
  {
    id: "1",
    name: "أحمد مصطفى عمر الزعابي",
    nationalId: "119950284721",
    birthDate: "1995-04-12",
    gender: "male",
    education: "بكالوريوس",
    specialization: "هندسة برمجيات",
    jobTitle: "مطور تطبيقات مستقل",
    employer: "عمل حر",
    city: "طرابلس",
    phone: "0912345678",
    email: "ahmed.zaabi@gmail.com",
    programId: "PRG-2026-001",
    attendanceStatus: "present",
    attendanceRate: 100,
    evaluation: 94,
    passStatus: "passed",
    certificateId: "CERT-2026-00101",
    certificateDate: "2026-05-14",
    notes: "مشارك متميز وقدم فكرة مشروع رائدة لتطبيق إدارة عيادات طبية."
  },
  {
    id: "2",
    name: "سارة عادل عبد السلام السويحلي",
    nationalId: "219960384628",
    birthDate: "1996-08-22",
    gender: "female",
    education: "ماجستير",
    specialization: "إدارة أعمال",
    jobTitle: "مؤسسة شركة تجارة إلكترونية",
    employer: "متجر السويحلي للورود",
    city: "طرابلس",
    phone: "0921122334",
    email: "sara.sw@outlook.com",
    programId: "PRG-2026-001",
    attendanceStatus: "present",
    attendanceRate: 90,
    evaluation: 88,
    passStatus: "passed",
    certificateId: "CERT-2026-00102",
    certificateDate: "2026-05-14",
    notes: "التزام كامل برياضة الأعمال والخطط الاستراتيجية وتعتزم التوسع في مدن أخرى."
  },
  {
    id: "3",
    name: "عبد الرحمن صالح بن سعيد",
    nationalId: "119900481234",
    birthDate: "1990-01-15",
    gender: "male",
    education: "دبلوم عالي",
    specialization: "تقنية معلومات",
    jobTitle: "فني شبكات",
    employer: "شركة النور للاتصالات",
    city: "بنغازي",
    phone: "0915678901",
    email: "abdo.said@telecom.ly",
    programId: "PRG-2026-004",
    attendanceStatus: "present",
    attendanceRate: 95,
    evaluation: 91,
    passStatus: "passed",
    certificateId: "CERT-2026-00401",
    certificateDate: "2026-04-16",
    notes: "اجتاز الدورة بأداء دراسي رائع واكتسب مهارات إدارة الموازنات التشغيلية."
  },
  {
    id: "4",
    name: "عمر محمد امحمد القرقني",
    nationalId: "119980594833",
    birthDate: "1998-11-05",
    gender: "male",
    education: "بكالوريوس",
    specialization: "محاسبة وتمويل",
    jobTitle: "مستشار مالي مساعد",
    employer: "مكتب الميزانية لتدقيق الحسابات",
    city: "طرابلس",
    phone: "0926543210",
    email: "omar.qarg@audit.ly",
    programId: "PRG-2026-002",
    attendanceStatus: "present",
    attendanceRate: 100,
    evaluation: 85,
    passStatus: "pending",
    certificateId: null,
    notes: "الملف قيد المراجعة للفرز النهائي للعلامات العملية لمشروع التخرج."
  },
  {
    id: "5",
    name: "مريم خالد مسعود الفيتوري",
    nationalId: "220000483759",
    birthDate: "2000-03-30",
    gender: "female",
    education: "ثانوي",
    specialization: "علمي",
    jobTitle: "خبيرة تجميل ومصممة",
    employer: "عمل خاص - صالون ميم",
    city: "طرابلس",
    phone: "0941234567",
    email: "mim.beauty@gmail.com",
    programId: "PRG-2026-002",
    attendanceStatus: "present",
    attendanceRate: 95,
    evaluation: 75,
    passStatus: "pending",
    certificateId: null,
    notes: "نشطة للغاية وتعمل على خطة تسويق ودراسة جدوى لصالون كبير لتدريب التجميل."
  },
  {
    id: "6",
    name: "علي حسن فرج الصادق",
    nationalId: "119930985521",
    birthDate: "1993-02-14",
    gender: "male",
    education: "بكالوريوس",
    specialization: "تجارة دولية",
    jobTitle: "مدير مخازن",
    employer: "الجمعية الليبية للاستيراد والتصدير",
    city: "مصراتة",
    phone: "0919988776",
    email: "ali.sadiq@misrata.ly",
    programId: "PRG-2026-003",
    attendanceStatus: "pending",
    attendanceRate: 0,
    evaluation: 0,
    passStatus: "pending",
    certificateId: null,
    notes: "مسجل بالبرنامج ومتبقي أسبوعين على الإطلاق."
  }
];

const initialLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2026-06-21T10:00:00Z",
    user: "أحمد بن زابور (أدمن)",
    role: "admin",
    action: "تهيئة النظام",
    category: "system",
    details: "تم تشغيل منظومة مركز أعمال طرابلس بنجاح وتأمين خطوط الاتصال والتحقق من الهوية."
  },
  {
    id: "2",
    timestamp: "2026-06-21T10:15:00Z",
    user: "منى الشريف (تسجيل)",
    role: "registrar",
    action: "تنسيق تسجيل مشاركين",
    category: "participants",
    details: "تم التحقق وإتمام تسجيل " + initialParticipants.length + " مشاركين فى البرامج التدريبية المعتمدة."
  },
  {
    id: "3",
    timestamp: "2026-06-21T10:20:00Z",
    user: "سفيان محمود (شهادات)",
    role: "certificates",
    action: "إصدار شهادات",
    category: "certificates",
    details: "توليد شهادات مبرمجة برمز QR للمشاركين المجتازين لدورة ريادة الأعمال رقم PRG-2026-001."
  }
];

// Read from memory / file
let dbStore: {
  programs: TrainingProgram[];
  participants: Participant[];
  logs: AuditLog[];
} = {
  programs: initialPrograms,
  participants: initialParticipants,
  logs: initialLogs
};

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      dbStore = JSON.parse(content);
    } else {
      writeDb();
    }
  } catch (e) {
    console.warn("DB file reading issue, falling back to memory database.", e);
  }
}

function writeDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbStore, null, 2), "utf-8");
  } catch (e) {
    console.error("DB file write issue", e);
  }
}

// Initialize database reading on launch
readDb();

// Audit helper
function appendLog(user: string, role: string, action: string, category: any, details: string) {
  const newLog: AuditLog = {
    id: String(Date.now()),
    timestamp: new Date().toISOString(),
    user,
    role: role as any,
    action,
    category,
    details
  };
  dbStore.logs.unshift(newLog);
  writeDb();
}

// API Endpoints
// Auth Mock
app.post("/api/auth/login", (req, res) => {
  const { username, role } = req.body;
  appendLog(username || "مستخدم مجهول", role || "readonly", "تسجيل دخول", "system", "تم تسجيل دخول مستخدم بالدور المنصوص عليه للصلاحيات.");
  res.json({ success: true, user: { username, role } });
});

// Programs
app.get("/api/programs", (req, res) => {
  res.json(dbStore.programs);
});

app.post("/api/programs", (req, res) => {
  const { program, user, role } = req.body;
  const newProgram: TrainingProgram = {
    ...program,
    id: program.id || `PRG-2026-0${dbStore.programs.length + 10}`,
    createdAt: new Date().toISOString()
  };
  dbStore.programs.unshift(newProgram);
  writeDb();
  appendLog(user || "موظف التدريب", role || "trainer", "إضافة برنامج تدريبي", "programs", `تمت إضافة برنامج تدريبي جديد: [${newProgram.programNumber}] ${newProgram.name}`);
  res.status(201).json(newProgram);
});

app.put("/api/programs/:id", (req, res) => {
  const { id } = req.params;
  const { program, user, role } = req.body;
  const idx = dbStore.programs.findIndex(p => p.id === id);
  if (idx !== -1) {
    dbStore.programs[idx] = { ...dbStore.programs[idx], ...program };
    writeDb();
    appendLog(user || "موظف التدريب", role || "trainer", "تعديل برنامج تدريبي", "programs", `تعديل بيانات البرنامج التدريبي: ${program.name}`);
    res.json(dbStore.programs[idx]);
  } else {
    res.status(404).json({ error: "البرنامج غير موجود" });
  }
});

app.delete("/api/programs/:id", (req, res) => {
  const { id } = req.params;
  const { user, role } = req.body || {};
  const program = dbStore.programs.find(p => p.id === id);
  if (program) {
    dbStore.programs = dbStore.programs.filter(p => p.id !== id);
    writeDb();
    appendLog(user || "مدير النظام", role || "admin", "حذف برنامج تدريبي", "programs", `حذف البرنامج التدريبي بالكامل: ${program.name}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "البرنامج غير موجود" });
  }
});

// Participants
app.get("/api/participants", (req, res) => {
  res.json(dbStore.participants);
});

app.post("/api/participants", (req, res) => {
  const { participant, user, role } = req.body;
  const newPart: Participant = {
    ...participant,
    id: participant.id || String(dbStore.participants.length + 11),
    createdAt: new Date().toISOString()
  };
  dbStore.participants.unshift(newPart);
  writeDb();
  appendLog(user || "موظف التسجيل", role || "registrar", "تسجيل مشارك", "participants", `تسجيل المتدرب(ة) الجديد: ${newPart.name} في كود البرنامج ${newPart.programId}`);
  res.status(201).json(newPart);
});

app.put("/api/participants/:id", (req, res) => {
  const { id } = req.params;
  const { participant, user, role } = req.body;
  const idx = dbStore.participants.findIndex(p => p.id === id);
  if (idx !== -1) {
    dbStore.participants[idx] = { ...dbStore.participants[idx], ...participant };
    writeDb();
    appendLog(user || "موظف التسجيل", role || "registrar", "تحديث بيانات متدرب", "participants", `تم تحديث بيانات المتدرب(ة) ${participant.name || dbStore.participants[idx].name}`);
    res.json(dbStore.participants[idx]);
  } else {
    res.status(404).json({ error: "المتدرب غير موجود" });
  }
});

app.delete("/api/participants/:id", (req, res) => {
  const { id } = req.params;
  const { user, role } = req.body || {};
  const part = dbStore.participants.find(p => p.id === id);
  if (part) {
    dbStore.participants = dbStore.participants.filter(p => p.id !== id);
    writeDb();
    appendLog(user || "موظف التسجيل", role || "registrar", "حذف متدرب", "participants", `إلغاء وحذف متدرب بالكامل: ${part.name}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "المتدرب غير موجود" });
  }
});

// Batch Import API with preview / duplicate detection / options to merge or ignore
app.post("/api/import", (req, res) => {
  const { list, user, role, duplicateResolution } = req.body; // resolution: "merge" | "ignore" | "overwrite"
  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const item of list) {
    if (!item.nationalId || !item.name) {
      skippedCount++;
      continue;
    }
    // Check if national id already exists in this program or general
    const existingIdx = dbStore.participants.findIndex(p => p.nationalId === item.nationalId);
    if (existingIdx !== -1) {
      if (duplicateResolution === "overwrite") {
        dbStore.participants[existingIdx] = { ...dbStore.participants[existingIdx], ...item };
        updatedCount++;
      } else if (duplicateResolution === "merge") {
        dbStore.participants[existingIdx] = { ...dbStore.participants[existingIdx], ...item, notes: `${dbStore.participants[existingIdx].notes || ''} [مدمج من استيراد: ${new Date().toLocaleDateString()}]` };
        updatedCount++;
      } else {
        skippedCount++;
      }
    } else {
      const generatedId = String(dbStore.participants.length + 101 + addedCount);
      dbStore.participants.push({
        ...item,
        id: generatedId,
        attendanceStatus: item.attendanceStatus || "pending",
        attendanceRate: item.attendanceRate || 0,
        evaluation: item.evaluation || 0,
        passStatus: item.passStatus || "pending",
        createdAt: new Date().toISOString()
      });
      addedCount++;
    }
  }

  writeDb();
  appendLog(user || "مسؤول النظام", role || "admin", "استيراد ملف إكسل", "import", `إجراء استيراد خارجي ذكي: إضافة ${addedCount} متدرب، تحديث ${updatedCount} متدرب، تخطي ${skippedCount} متدرب.`);
  res.json({ success: true, addedCount, updatedCount, skippedCount });
});

// Audit Logs Endpoint
app.get("/api/logs", (req, res) => {
  res.json(dbStore.logs);
});

app.post("/api/logs", (req, res) => {
  const { user, role, action, category, details } = req.body;
  appendLog(user, role, action, category, details);
  res.json({ status: "logged" });
});

// Database schema generator endpoint & reset DB to initial state
app.post("/api/system/reset", (req, res) => {
  const { user, role } = req.body;
  dbStore = {
    programs: JSON.parse(JSON.stringify(initialPrograms)),
    participants: JSON.parse(JSON.stringify(initialParticipants)),
    logs: JSON.parse(JSON.stringify(initialLogs))
  };
  writeDb();
  appendLog(user || "مدير النظام", role || "admin", "إعادة ضبط قاعدة البيانات", "system", "تم تصدير أمر إعادة التشغيل الافتراضي ومسح المدخلات اليدوية.");
  res.json({ success: true });
});

// System Stats
app.get("/api/stats", (req, res) => {
  const totalPrograms = dbStore.programs.length;
  const totalParticipants = dbStore.participants.length;
  const totalGraduates = dbStore.participants.filter(p => p.passStatus === "passed").length;
  const totalCertificates = dbStore.participants.filter(p => p.certificateId !== null && p.certificateId !== "").length;

  res.json({
    totalPrograms,
    totalParticipants,
    totalGraduates,
    totalCertificates
  });
});

// Start express server & integrate Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
