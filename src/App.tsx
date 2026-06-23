import React, { useState, useEffect } from "react";
import { TrainingProgram, Participant, SystemStats, AuditLog, UserRole } from "./types";
import Dashboard from "./components/Dashboard";
import ProgramsList from "./components/ProgramsList";
import ParticipantsList from "./components/ParticipantsList";
import CertificatesModule from "./components/CertificatesModule";
import Calendar from "./components/Calendar";
import ReportsModule from "./components/ReportsModule";
import AuditLogsModule from "./components/AuditLogsModule";
import QRVerify from "./components/QRVerify";
// @ts-ignore
import npsmeLogo from "./assets/images/Logo-01.png";
import { 
  Award, 
  Calendar as CalendarIcon, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  FileSpreadsheet, 
  ShieldCheck, 
  LogOut,
  ChevronDown,
  Lock,
  Loader,
  HelpCircle
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [userRole, setUserRole] = useState<UserRole>("admin");
  const [username, setUsername] = useState("الموظف الحالي");
  
  // Data State
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalPrograms: 0,
    totalParticipants: 0,
    totalGraduates: 0,
    totalCertificates: 0
  });

  const [loading, setLoading] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [appUrl, setAppUrl] = useState("https://sme.gov.ly");

  // Dashboard modal triggers
  const [addProgramTrigger, setAddProgramTrigger] = useState(0);
  const [importParticipantsTrigger, setImportParticipantsTrigger] = useState(0);

  // Fetch data
  const fetchData = async () => {
    try {
      const [programsRes, participantsRes, logsRes, statsRes] = await Promise.all([
        fetch("/api/programs"),
        fetch("/api/participants"),
        fetch("/api/logs"),
        fetch("/api/stats")
      ]);

      const programsData = await programsRes.json();
      const participantsData = await participantsRes.json();
      const logsData = await logsRes.json();
      const statsData = await statsRes.json();

      setPrograms(programsData);
      setParticipants(participantsData);
      setLogs(logsData);
      setStats(statsData);
    } catch (e) {
      console.error("Error synchronized data from training server", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Post changes helper
  const updateServerData = async (url: string, method: string, body: any) => {
    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, user: username, role: userRole })
      });
      await fetchData(); // Synchronize layout stats
    } catch (e) {
      console.error("Error communicating with express backend server", e);
    }
  };

  // PROGRAM OPERATIONS
  const handleAddProgram = (newPrg: Omit<TrainingProgram, "id">) => {
    updateServerData("/api/programs", "POST", { program: newPrg });
  };

  const handleUpdateProgram = (id: string, updatedFields: Partial<TrainingProgram>) => {
    updateServerData(`/api/programs/${id}`, "PUT", { program: updatedFields });
  };

  const handleDeleteProgram = (id: string) => {
    updateServerData(`/api/programs/${id}`, "DELETE", {});
  };

  // PARTICIPANTS OPERATIONS
  const handleAddParticipant = (newPart: Omit<Participant, "id">) => {
    updateServerData("/api/participants", "POST", { participant: newPart });
  };

  const handleUpdateParticipant = (id: string, updatedFields: Partial<Participant>) => {
    updateServerData(`/api/participants/${id}`, "PUT", { participant: updatedFields });
  };

  const handleDeleteParticipant = (id: string) => {
    updateServerData(`/api/participants/${id}`, "DELETE", {});
  };

  const handleBatchImport = (list: any[], resolution: "merge" | "ignore" | "overwrite") => {
    updateServerData("/api/import", "POST", { list, duplicateResolution: resolution });
  };

  // SYSTEM RESET
  const handleSystemReset = () => {
    updateServerData("/api/system/reset", "POST", {});
  };

  // Navigation callbacks
  const handleOpenAddProgramModel = () => {
    setActiveTab("programs");
    setAddProgramTrigger(prev => prev + 1);
  };

  const handleOpenImportModel = () => {
    setActiveTab("participants");
    setImportParticipantsTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="training-management-app">
      
      {/* 1. Official Header Row (Tripoli Business Center branding matching sme.gov.ly) */}
      <header className="bg-gradient-to-r from-sme-navy-dark via-sme-navy to-sme-navy-dark text-white shadow-md border-b-4 border-sme-gold no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <img
              src={npsmeLogo}
              alt="مركز أعمال طرابلس"
              className="w-14 h-14 object-contain"
            />
            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-xs font-semibold text-sme-gold tracking-wide block">البرنامج الوطني للمشروعات الصغرى والمتوسطة</span>
              <h1 className="text-sm sm:text-lg font-black tracking-tight flex items-center gap-1.5 leading-none">
                 مركز أعمال طرابلس 
              </h1>
            </div>
          </div>

            <div className="h-6 w-px bg-white/25 hidden md:block"></div>

            {/* Quick action: QR check portal */}
            <button 
              onClick={() => setActiveTab("verify")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition ${activeTab === 'verify' ? 'bg-sme-gold text-sme-navy-dark' : 'bg-sme-navy-light/40 text-sme-gold border border-sme-gold/20 hover:bg-sme-navy-light/80'}`}
            >
              <ShieldCheck size={14} />  التحقق من الشهادة
            </button>

            {/* Active User session selector */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 bg-sme-navy-light/60 hover:bg-sme-navy border border-sme-navy-light/60 p-1.5 px-3 rounded-xl transition text-right"
              >
                <div className="space-y-0.5 hidden sm:block">
                  <div className="text-xs font-bold text-slate-100">{username}</div>
                  <div className="text-[9px] text-sme-gold font-semibold uppercase font-mono leading-none">صلاحية: {userRole}</div>
                </div>
                <ChevronDown size={14} className="text-slate-300" />
                <div className="bg-sme-gold w-7 h-7 rounded-full flex items-center justify-center text-sme-navy-dark font-black text-xs shrink-0">
                  {username.charAt(0)}
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 text-slate-800 animate-fade-in text-right">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold">الموظف الحالي</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{username}</p>
                    <span className="inline-block text-[9px] bg-sme-navy-soft text-sme-navy font-bold px-1.5 py-0.5 rounded mt-1">
                       الصلاحيات: {userRole}
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      setActiveTab("security");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-2"
                  >
                    <Lock size={12} className="text-slate-400" />
                     تبدل الموظف
                  </button>

                  
                </div>
              )}
            </div>

          </div>
      </header>

      {/* 2. Primary Layout Framework: Sidebar + Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Navigation Sidebar Row */}
        <aside className="w-full md:w-64 space-y-4 shrink-0 no-print">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-2 border-b border-slate-50">أقسام المنظومة الموحدة</h4>
            
            <nav className="space-y-1">
              
              <button 
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'dashboard' ? 'bg-sme-navy text-white shadow-md shadow-sme-navy/10 border-r-4 border-sme-gold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <LayoutDashboard size={16} className={activeTab === 'dashboard' ? 'text-sme-gold' : 'text-slate-400'} /> لوحة التحكم الإحصائية
              </button>

              <button 
                onClick={() => setActiveTab("programs")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'programs' ? 'bg-sme-navy text-white shadow-md border-r-4 border-sme-gold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <span className="flex items-center gap-3">
                  <BookOpen size={16} className={activeTab === 'programs' ? 'text-sme-gold' : 'text-slate-400'} /> إدارة البرامج التدريبية
                </span>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'programs' ? 'bg-sme-navy-light text-sme-gold' : 'bg-slate-100 text-slate-600'}`}>
                  {programs.length}
                </span>
              </button>

              <button 
                onClick={() => setActiveTab("participants")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'participants' ? 'bg-sme-navy text-white shadow-md border-r-4 border-sme-gold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <span className="flex items-center gap-3">
                  <Users size={16} className={activeTab === 'participants' ? 'text-sme-gold' : 'text-slate-400'} /> سجل بيانات المشاركين
                </span>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'participants' ? 'bg-sme-navy-light text-sme-gold' : 'bg-slate-100 text-slate-600'}`}>
                  {participants.length}
                </span>
              </button>

              <button 
                onClick={() => setActiveTab("certificates")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'certificates' ? 'bg-sme-navy text-white shadow-md border-r-4 border-sme-gold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <span className="flex items-center gap-3">
                  <Award size={16} className={activeTab === 'certificates' ? 'text-sme-gold' : 'text-slate-400'} /> كشوفات وإصدار الشهادات
                </span>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'certificates' ? 'bg-sme-navy-light text-sme-gold' : 'bg-sme-gold-light text-sme-gold border border-sme-gold/10'}`}>
                  {participants.filter(p => p.certificateId).length}
                </span>
              </button>

              <button 
                onClick={() => setActiveTab("calendar")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'calendar' ? 'bg-sme-navy text-white shadow-md border-r-4 border-sme-gold animate-fade-in' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <CalendarIcon size={16} className={activeTab === 'calendar' ? 'text-sme-gold' : 'text-slate-400'} /> أجندة وتقويم الدورات
              </button>

              <button 
                onClick={() => setActiveTab("reports")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'reports' ? 'bg-sme-navy text-white shadow-md border-r-4 border-sme-gold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <FileSpreadsheet size={16} className={activeTab === 'reports' ? 'text-sme-gold' : 'text-slate-400'} /> التقارير والبيانات الفنية
              </button>

            </nav>
          </div>

          {/* Secure / Audit & simulations access */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-1.5 no-print">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pb-2 border-b border-slate-50">الأمان وخطوط الرقابة</h4>
            
            <button 
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'security' ? 'bg-sme-navy text-white border-r-4 border-sme-gold shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <ShieldCheck size={16} className={activeTab === 'security' ? 'text-sme-gold' : 'text-sme-gold'} />
              صلاحيات الموظفين والتدقيق
            </button>
          </div>

          {/* Institutional Contact footer */}
          <div className="bg-gradient-to-tr from-sme-navy-dark to-sme-navy text-slate-100 p-4 rounded-2xl space-y-2 text-center text-[10px] leading-relaxed shadow-sm">
            <p className="font-bold text-sme-gold">موقع البرنامج الوطني للمشروعات</p>
            <p>التواصل المباشر مع لجنة الفحص والتمويل متوفر عبر المراسلة التلقائية.</p>
            <a 
              href="https://sme.gov.ly" 
              target="_blank" 
              rel="noreferrer" 
              className="text-white hover:text-sme-gold hover:underline block font-mono text-[11px] font-bold transition"
            >
              HTTPS://SME.GOV.LY
            </a>
          </div>
        </aside>

        {/* WORKSPACE AREA ROUTER */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader className="animate-spin text-blue-600" size={32} />
              <p className="text-xs font-bold">جاري تحميل المنظومة وتأمين مصادقة الجلسة...</p>
            </div>
          ) : (
            <>
              {/* Tabs distribution */}
              {activeTab === "dashboard" && (
                <Dashboard 
                  programs={programs}
                  participants={participants}
                  stats={stats}
                  onNavigate={setActiveTab}
                  onOpenAddProgram={handleOpenAddProgramModel}
                  onOpenImport={handleOpenImportModel}
                />
              )}

              {activeTab === "programs" && (
                <ProgramsList 
                  programs={programs}
                  userRole={userRole}
                  onAddProgram={handleAddProgram}
                  onUpdateProgram={handleUpdateProgram}
                  onDeleteProgram={handleDeleteProgram}
                />
              )}

              {activeTab === "participants" && (
                <ParticipantsList 
                  participants={participants}
                  programs={programs}
                  userRole={userRole}
                  onAddParticipant={handleAddParticipant}
                  onUpdateParticipant={handleUpdateParticipant}
                  onDeleteParticipant={handleDeleteParticipant}
                  onBatchImport={handleBatchImport}
                />
              )}

              {activeTab === "certificates" && (
                <CertificatesModule 
                  participants={participants}
                  programs={programs}
                  userRole={userRole}
                  onUpdateParticipant={handleUpdateParticipant}
                  appUrl={appUrl}
                />
              )}

              {activeTab === "calendar" && (
                <Calendar 
                  programs={programs}
                />
              )}

              {activeTab === "reports" && (
                <ReportsModule 
                  participants={participants}
                  programs={programs}
                />
              )}

              {activeTab === "security" && (
                <AuditLogsModule 
                  logs={logs}
                  userRole={userRole}
                  currentUser={username}
                  onRoleChange={setUserRole}
                  onSystemReset={handleSystemReset}
                />
              )}

              {activeTab === "verify" && (
                <QRVerify 
                  participants={participants}
                  programs={programs}
                />
              )}
            </>
          )}
        </main>

      </div>

      {/* 3. Official Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-right">
          <div className="space-y-1">
            <p className="font-bold text-slate-300">حقوق الطبع محفوظة © 2026 مركز أعمال طرابلس</p>
            <p className="text-[10px] text-slate-500">البرنامج الوطني للمشروعات الصغرى والمتوسطة - وزارة الحكم المحلي - ليبيا</p>
          </div>
          
          <div className="flex items-center justify-center sm:justify-start gap-4 text-[10px] font-mono">
            <span className="text-slate-600">|</span>
            <a href="https://sme.gov.ly" target="_blank" rel="noreferrer" className="hover:text-white transition">الموقع الرسمي للمؤسسة</a>
            <span className="text-slate-600">|</span>
            <span>بوابة التدريب والفرز الالكتروني المعتمدة</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
