import React, { useState, useRef } from "react";
import { Participant, TrainingProgram } from "../types";
import { 
  Award, 
  Search, 
  Printer, 
  Check, 
  X, 
  Download, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Building, 
  QrCode, 
  Flame, 
  Sliders,
  Calendar,
  Layers
} from "lucide-react";

interface CertificatesModuleProps {
  participants: Participant[];
  programs: TrainingProgram[];
  userRole: string;
  onUpdateParticipant: (id: string, participant: Partial<Participant>) => void;
  appUrl: string;
}

export default function CertificatesModule({
  participants,
  programs,
  userRole,
  onUpdateParticipant,
  appUrl
}: CertificatesModuleProps) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [activeCertificate, setActiveCertificate] = useState<Participant | null>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Filter participants who are marked as passed
  const passedParticipants = participants.filter(p => {
    const matchSearch = p.name.includes(searchTerm) || p.nationalId.includes(searchTerm);
    const matchProg = selectedProgramId ? p.programId === selectedProgramId : true;
    return p.passStatus === "passed" && matchSearch && matchProg;
  });

  // Issue unique Certificate ID if not exist
  const handleIssueCertificate = (participant: Participant) => {
    if (participant.certificateId) return;

    const prog = programs.find(p => p.id === participant.programId);
    const progNum = prog ? prog.programNumber.replace(/[^a-zA-Z0-9]/g, "") : "GEN";
    const uniqueId = `CERT-2026-${progNum}-${participant.nationalId.slice(-4)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    onUpdateParticipant(participant.id, {
      certificateId: uniqueId,
      certificateDate: todayStr
    });
  };

  // Batch Issue Certificates for the entire selected program at once
  const handleBatchIssue = () => {
    if (!selectedProgramId) {
      alert("الرجاء اختيار برنامج محدد أولاً لإصدار الشهادات الجماعية.");
      return;
    }

    const unissuedPassed = participants.filter(p => p.programId === selectedProgramId && p.passStatus === "passed" && !p.certificateId);
    if (unissuedPassed.length === 0) {
      alert("لا يوجد متدربين مجتازين غير صادرة لهم شهادات في هذا البرنامج المختار.");
      return;
    }

    if (confirm(`هل ترغب في إصدار شهادات جماعية معتمدة لعدد ${unissuedPassed.length} متدربين الآن؟`)) {
      unissuedPassed.forEach(p => {
        handleIssueCertificate(p);
      });
      alert("تم توليد وإصدار الشهادات بنجاح لكافة المتدربين المسجلين بالدورة.");
    }
  };

  // Preview Certificate
  const handlePreviewCertificate = (p: Participant) => {
    // Generate cert ID on-the-fly dynamically if clicked for preview and doesn't exist
    if (!p.certificateId) {
      handleIssueCertificate(p);
    }
    // Set as active cert showing in popup modal
    setActiveCertificate(p);
  };

  // Elegant direct print layout
  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" id="certificate-issuance-module">
      
      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="text-amber-600 animate-pulse" size={24} />
            إصدار واعتماد الشهادات التدريبية الإلكترونية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            صياغة وتوليد شهادات مبرمجة مع نظام رمز الاستجابة السريعة (QR ID) للتحقق الإلكتروني والطباعة الفورية بجودة عالية عريضة.
          </p>
        </div>

        {userRole !== 'readonly' && (
          <button 
            onClick={handleBatchIssue}
            disabled={!selectedProgramId}
            className={`text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition ${
              selectedProgramId 
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Users size={15} /> إصدار جماعي لجميع المجتازين
          </button>
        )}
      </div>

      {/* Program Selection and Search Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute right-3 top-3 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="البحث باسم المتدرب الناجح أو رقمه الوطني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
          />
        </div>

        <div>
          <select 
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50 font-sans"
          >
            <option value="">تصفية بحسب البرنامج المنجز</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>[{p.programNumber}] {p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center text-xs text-amber-900 bg-amber-50 rounded-lg px-3 border border-amber-100/50 justify-between">
          <span className="font-bold">المؤهلون للشهادة:</span>
          <span className="font-mono bg-amber-100/80 px-2 py-0.5 rounded-full font-extrabold text-amber-800">
            {passedParticipants.length} متدرب معتمد
          </span>
        </div>
      </div>

      {/* Passed Trainees List for issuance */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {passedParticipants.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Award className="mx-auto mb-3 text-slate-300" size={32} />
            <p className="font-semibold text-sm">لا يتوفر متدربون مجتازون ومستحقون للشهادات ضمن خيارات التصفية حالياً</p>
            <p className="text-xs text-slate-400 mt-1">تأكد أولاً من رصد نتائج وتحديث حالة الاجتياز في قسم المشاركين وإعطاء علامة ناجح.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-600">
                  <th className="p-4">الاسم والبيانات الوطنية</th>
                  <th className="p-4">البرنامج التدريبي</th>
                  <th className="p-4">رقم الساعات</th>
                  <th className="p-4">رمز الشهادة</th>
                  <th className="p-4 text-center">حالة الإصدار الدائم</th>
                  <th className="p-4 text-center">الشهادة والتوثيق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {passedParticipants.map((p) => {
                  const prog = programs.find(pr => pr.id === p.programId);
                  const isIssued = p.certificateId !== null && p.certificateId !== undefined && p.certificateId !== "";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      {/* Name */}
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">الرقم الوطني: {p.nationalId}</p>
                      </td>

                      {/* Training program */}
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{prog ? prog.name : "دورة عامة"}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{prog ? prog.programNumber : ""}</p>
                      </td>

                      {/* Hours */}
                      <td className="p-4">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                          {prog ? prog.hours : 20} ساعة
                        </span>
                      </td>

                      {/* Certificate code */}
                      <td className="p-4 font-mono font-bold text-emerald-800">
                        {isIssued ? p.certificateId : <span className="text-slate-400">لم تصدر بعد</span>}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isIssued ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isIssued ? <CheckCircle2 size={11} /> : null}
                          {isIssued ? 'صادرة ومعتمدة' : 'معلقة للتعبئة'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="inline-flex gap-1.5 justify-center">
                          {!isIssued ? (
                            <button 
                              onClick={() => handleIssueCertificate(p)}
                              className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[10px] rounded shadow-sm transition"
                            >
                              إصدار الشهادة
                            </button>
                          ) : (
                            <button 
                              onClick={() => handlePreviewCertificate(p)}
                              className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-[10px] rounded transition flex items-center gap-1"
                            >
                              <Printer size={10} /> معاينة / طباعة
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: FULLSCREEN PRINT VIEW & ARABESQUE VISUAL LAYOUT (A4 Landscape) */}
      {activeCertificate && (() => {
        const prog = programs.find(pr => pr.id === activeCertificate.programId);
        
        // Formulate correct verification link
        const validationUrl = `${appUrl || "https://sme.gov.ly"}/verify?certId=${activeCertificate.certificateId}&nationalId=${activeCertificate.nationalId}`;
        const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(validationUrl)}`;

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in flex flex-col">
              
              {/* Active modal controls header bar */}
              <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between no-print">
                <div className="flex items-center gap-2">
                  <Award className="text-amber-500" size={18} />
                  <span className="text-xs font-bold font-sans">معاينة الشهادة الإلكترونية المعتمدة للطباعة واستخراج PDF</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDirectPrint}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] py-1.5 px-3.5 rounded-lg flex items-center gap-1 transition"
                  >
                    <Printer size={12} /> طباعة الشهادة مباشرة (A4 عريض)
                  </button>
                  <button 
                    onClick={() => setActiveCertificate(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-white/80 hover:text-white p-1.5 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Landscape Web Graphic Certificate Core */}
              <div className="p-4 overflow-x-auto flex justify-center bg-slate-100">
                <div 
                  ref={printContainerRef}
                  id="printable-certificate"
                  className="w-[297mm] h-[210mm] bg-white relative text-slate-800 p-8 flex flex-col justify-between border-[14px] border-emerald-900 shadow-xl overflow-hidden print-card-landscape select-none"
                  style={{
                    boxSizing: 'border-box'
                  }}
                >
                  
                  {/* Subtle Arabesque Watermark Center Background */}
                  <div className="absolute inset-4 border border-amber-600/50 pointer-events-none flex items-center justify-center">
                    <div className="absolute top-2 right-2 bottom-2 left-2 border-[2px] border-amber-600/30 opacity-40"></div>
                  </div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                    <Award size={400} className="text-slate-900" />
                  </div>

                  {/* Top Header Block: Ministries Logos */}
                  <div className="relative z-10 flex items-center justify-between px-6">
                    {/* Right text: Enterprise Details */}
                    <div className="text-right space-y-1">
                      <p className="text-xs font-bold text-emerald-950">البرنامج الوطني لدعم المشروعات الصغرى والمتوسطة</p>
                      <h4 className="text-sm font-extrabold text-slate-700">وزارة الاقتصاد والتجارة - حكومة الوحدة الوطنية</h4>
                      <p className="text-[11px] font-semibold text-emerald-800">فرع مركز أعمال طرابلس (Tripoli Business Center)</p>
                    </div>

                    {/* Center: Institutional Emblem (Logo mock placeholder) */}
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="w-16 h-16 bg-gradient-to-tr from-emerald-800 via-teal-700 to-amber-600 rounded-full flex items-center justify-center p-1.5 shadow-sm">
                        <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                          <Building className="text-teal-900" size={24} />
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 font-mono tracking-tight">SME.GOV.LY</span>
                    </div>

                    {/* Left details: Cert date & Serial */}
                    <div className="text-left text-xs space-y-0.5 font-semibold font-mono">
                      <p className="text-slate-600">رقم الشهادة: <span className="text-emerald-900 font-bold">{activeCertificate.certificateId}</span></p>
                      <p className="text-slate-600">الرقم الوطني: {activeCertificate.nationalId}</p>
                      <p className="text-slate-600">تاريخ الإصدار: {activeCertificate.certificateDate}</p>
                    </div>
                  </div>

                  {/* Main core credentials */}
                  <div className="relative z-10 text-center space-y-6 px-16 my-auto">
                    <div>
                      <h1 className="text-4xl font-extrabold text-amber-600 tracking-wider font-serif">شهادة اجتياز وتفوق</h1>
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent w-96 mx-auto mt-2"></div>
                    </div>

                    <p className="text-base text-slate-600 font-medium">يشهد مركز أعمال طرابلس التابع للبرنامج الوطني لدعم المشروعات الصغرى والمتوسطة بأن المتدرب(ة):</p>
                    
                    {/* Trainee Name */}
                    <h2 className="text-3xl font-black text-slate-900 tracking-wide font-sans underline decoration-amber-600/30 decoration-4 underline-offset-8">
                      {activeCertificate.name}
                    </h2>

                    {/* Program details content text */}
                    <p className="text-sm text-slate-700 leading-8 max-w-3xl mx-auto font-medium">
                      قد اجتاز بنجاح الدورة التدريبية المكثفة المعنونة بـ: <br />
                      <span className="text-lg font-bold text-emerald-950 font-sans">
                        [ {prog ? prog.name : "برنامج المهارات الريادية ودراسة المشروعات"} ]
                      </span> <br />
                      التي عقدت في مدينة <span className="font-bold underline decoration-dotted">{prog ? prog.city : "طرابلس"}</span> للفترة من <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{prog ? prog.startDate : "2026-06-15"}</span> إلى <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{prog ? prog.endDate : "2026-06-19"}</span> بعدد <span className="font-bold font-mono text-emerald-800 text-base">{prog ? prog.hours : 25}</span> ساعة تدريبية معتمدة.
                    </p>
                  </div>

                  {/* Bottom Footer block: Signatures, Stamps, & QR Code */}
                  <div className="relative z-10 flex items-end justify-between px-8 border-t border-slate-100 pt-5">
                    
                    {/* Stamp and QR Code */}
                    <div className="flex items-center gap-4">
                      {/* Interactive Verification QR code */}
                      <div className="bg-white p-1.5 border border-slate-200 rounded-lg shadow-sm">
                        <img 
                          src={qrCodeImageUrl} 
                          alt="Verification QR code" 
                          className="w-20 h-20"
                        />
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-bold text-slate-500">التحقق الإلكتروني السريع</p>
                        <p className="text-[9px] text-slate-400 font-semibold max-w-[140px] leading-tight">
                          امسح رمز QR أعلاه للتحقق من صحة وصلاحية هذه الشهادة عبر البوابة الموحدة.
                        </p>
                      </div>
                    </div>

                    {/* Centered certification seals */}
                    <div className="flex flex-col items-center justify-center space-y-0.5 my-auto">
                      <div className="text-[10px] font-mono text-amber-700 font-extrabold border-2 border-amber-600/40 px-2 py-1 rounded bg-slate-50/50">
                        OFFICIAL CO-RUN VALIDATION SEAL
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold block">منظومة تدريب طرابلس الموحدة</span>
                    </div>

                    {/* Official Signatures column */}
                    <div className="text-center w-64 space-y-1.5">
                      <p className="text-xs font-extrabold text-slate-700">مدير عام البرنامج الوطني لدعم المشروعات</p>
                      <div className="h-6 flex items-center justify-center">
                        {/* Decorative simulated calligraphy signature line */}
                        <div className="w-28 border-b-2 border-dashed border-slate-300"></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">أ. أمحمد إبراهيم المبروك</span>
                    </div>

                  </div>

                </div>
              </div>

              {/* Informational advice */}
              <div className="bg-amber-50 p-4 border-t border-slate-200 text-slate-800 font-semibold text-xs flex gap-2 items-center text-right no-print">
                <ShieldCheck size={20} className="text-emerald-700 shrink-0" />
                <span>
                  نظام الأمان الإلكتروني لمركز أعمال طرابلس مفعل بالكامل. أي تعديل يدوي على بيانات الشهادة بدون تطابق الرقم الوطني مع رمز QR سيفشل في فحص المصداقية فوراً.
                </span>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
