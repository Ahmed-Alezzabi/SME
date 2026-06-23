import React, { useState, useRef } from "react";
import { Participant, TrainingProgram } from "../types";
import SmeLogo from "./SmeLogo";
// @ts-ignore
import certTemplateBg from "../assets/images/cert_template_gold_1782124839343.jpg";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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
  QrCode, 
  Flame, 
  Sliders,
  Calendar,
  Layers,
  Save,
  FileDown
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
  const [previewZoom, setPreviewZoom] = useState<number>(0.65);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  // Download certificate as high-quality PNG image using html2canvas
  const handleDownloadCertificate = async (participantName: string) => {
    const element = document.getElementById("printable-certificate");
    if (!element) return;
    
    setIsDownloading(true);
    try {
      // Create canvas with CORS enabled and scale=2.5 for pristine high-resolution quality (A4 print density)
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2.5,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      const sanitizedName = participantName.replace(/\s+/g, "_");
      downloadLink.download = `شهادة_تدريب_${sanitizedName}.png`;
      downloadLink.href = imgData;
      downloadLink.click();
    } catch (err) {
      console.error("Failed to export certificate image:", err);
      alert("عذراً، حدث خطأ أثناء معالجة الصورة الفورية للشهادة. يرجى تجربة استخدام طباعة المتصفح مباشرة.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Download certificate as high-fidelity PDF using html2canvas + jsPDF
  const handleDownloadCertificatePDF = async (participantName: string) => {
    const element = document.getElementById("printable-certificate");
    if (!element) return;
    
    setIsDownloadingPdf(true);
    try {
      // High-quality canvas scaling
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2.5,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      
      // Initialize Landscape A4 PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, 297, 210, undefined, "FAST");
      const sanitizedName = participantName.replace(/\s+/g, "_");
      pdf.save(`شهادة_تدريب_${sanitizedName}.pdf`);
    } catch (err) {
      console.error("Failed to export certificate PDF:", err);
      alert("عذراً، حدث خطأ أثناء معالجة ملف الـ PDF. يرجى تجربة الطباعة المباشرة.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Persistence handler for template styling & custom tuning coordinates
  const handleSaveCurrentSettings = () => {
    try {
      localStorage.setItem("sme_cert_overlay_config_v2", JSON.stringify(overlayConfig));
      localStorage.setItem("sme_cert_bg_url_v2", backgroundUrl);
      localStorage.setItem("sme_cert_template_type", templateType);
      
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 3000);
    } catch (e) {
      console.error("Failed to save certificate layout preset:", e);
      alert("عذراً، فشل تخزين الإعدادات في ذاكرة المتصفح المحلية.");
    }
  };

  // States for certificate template styling & custom tuning coordinates
  const [templateType, setTemplateType] = useState<"default" | "uploaded">(() => {
    return (localStorage.getItem("sme_cert_template_type") as "default" | "uploaded") || "uploaded";
  });

  const [backgroundUrl, setBackgroundUrl] = useState<string>(() => {
    return localStorage.getItem("sme_cert_bg_url_v2") || certTemplateBg;
  });

  // Load custom overlay settings or use defaults tailored for the uploaded template
  const [overlayConfig, setOverlayConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("sme_cert_overlay_config_v2");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      nameY: 44,          // Y position in percentage (e.g. 44% from top)
      nameX: 0,           // Shift center X
      nameSize: 28,       // Font size in px
      nameColor: "#0f2b47",
      nameBold: true,
      
      programY: 55,       // Y position in percentage (e.g. 55% from top)
      programX: 0,
      programSize: 14,    // Font size in px
      programColor: "#1e293b",
      programLineHeight: 1.8,
      
      qrX: 12,            // % from left or right edge
      qrY: 74,            // % from top edge
      qrSize: 85,         // width in px
      qrAlign: "left",    // left edge vs right edge alignment

      certMetaX: 12,      // % from edge
      certMetaY: 74,      // % from top
      certMetaSize: 11,   // px
      certMetaColor: "#334155",
      certMetaAlign: "right", // left vs right edge column
      
      showDefaultHeader: false, // headers
      showSignatures: false,    // signatures
      showSeal: false,          // seal/markings
      showBorders: false,       // classical borders
    };
  });

  const updateOverlayConfig = (key: string, value: any) => {
    setOverlayConfig(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem("sme_cert_overlay_config_v2", JSON.stringify(updated));
      return updated;
    });
  };

  const handleTemplateTypeChange = (type: "default" | "uploaded") => {
    setTemplateType(type);
    localStorage.setItem("sme_cert_template_type", type);
    
    // Auto toggle default elements depending on choice
    const isDefault = type === "default";
    setOverlayConfig(prev => {
      const updated = {
        ...prev,
        showDefaultHeader: isDefault,
        showSignatures: isDefault,
        showSeal: isDefault,
        showBorders: isDefault,
        // Reset positions if default is turned on
        nameY: isDefault ? 42 : prev.nameY,
        programY: isDefault ? 53 : prev.programY,
      };
      localStorage.setItem("sme_cert_overlay_config_v2", JSON.stringify(updated));
      return updated;
    });
  };

  const handleBackgroundUrlChange = (url: string) => {
    setBackgroundUrl(url);
    localStorage.setItem("sme_cert_bg_url_v2", url);
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Url = event.target.result as string;
          setBackgroundUrl(base64Url);
          localStorage.setItem("sme_cert_bg_url_v2", base64Url);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetOverlayConfig = () => {
    const defaults = {
      nameY: 44,
      nameX: 0,
      nameSize: 28,
      nameColor: "#0f2b47",
      nameBold: true,
      
      programY: 55,
      programX: 0,
      programSize: 14,
      programColor: "#1e293b",
      programLineHeight: 1.8,
      
      qrX: 12,
      qrY: 74,
      qrSize: 85,
      qrAlign: "left",

      certMetaX: 12,
      certMetaY: 74,
      certMetaSize: 11,
      certMetaColor: "#334155",
      certMetaAlign: "right",
      
      showDefaultHeader: templateType === "default",
      showSignatures: templateType === "default",
      showSeal: templateType === "default",
      showBorders: templateType === "default",
    };
    setOverlayConfig(defaults);
    localStorage.setItem("sme_cert_overlay_config_v2", JSON.stringify(defaults));
  };

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
            className="w-full pr-9 pl-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
          />
        </div>

        <div>
          <select 
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-sans"
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
                      <td className="p-4 font-mono font-bold text-blue-800">
                        {isIssued ? p.certificateId : <span className="text-slate-400">لم تصدر بعد</span>}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isIssued ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
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
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded shadow-sm transition"
                            >
                              إصدار الشهادة
                            </button>
                          ) : (
                            <button 
                              onClick={() => handlePreviewCertificate(p)}
                              className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold text-[10px] rounded transition flex items-center gap-1"
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

      {/* MODAL: FULLSCREEN PRINT VIEW, CUSTOM DOWNTREND REGULAR CUSTOMIZER & FINE-TUNING OVERLAYS */}
      {activeCertificate && (() => {
        const prog = programs.find(pr => pr.id === activeCertificate.programId);
        
        // Formulate correct verification link
        const validationUrl = `${appUrl || window.location.origin || "https://sme.gov.ly"}/verify?certId=${activeCertificate.certificateId}&nationalId=${activeCertificate.nationalId}`;
        const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(validationUrl)}`;

        return (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-0 overflow-hidden no-print animate-fade-in">
            <div className="bg-white w-screen h-screen shadow-2xl border-none overflow-hidden flex flex-col md:flex-row">
              
              {/* Right Column (Sidebar): Fine-Tuning Control panel - HUD panel */}
              <div className="w-full md:w-[450px] border-l border-slate-200 bg-slate-50 p-6 overflow-y-auto text-right flex flex-col justify-between shrink-0 no-print/90 scrollbar-thin">
                <div className="space-y-5">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="text-sm font-black text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sme-navy text-base">
                        <Sliders size={16} className="text-amber-500" />
                        لوحة ضبط وإدماج القوالب (واجهة مكبرة)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-semibold">
                      قم بتهيئة وحفظ مواقع العناصر والباركود بدقة عالية لتناسب خلفية الشهادة.
                    </p>
                  </div>

                  {/* Zoom Control section */}
                  <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/50 space-y-2">
                    <div className="flex justify-between items-center text-xs font-black text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Layers size={14} className="text-amber-600" />
                        حجم المعاينة للشاشة (زووم):
                      </span>
                      <span className="font-mono text-sme-navy text-sm font-black px-2 py-0.5 bg-white rounded border border-amber-200">{(previewZoom * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="1.2"
                      step="0.05"
                      value={previewZoom}
                      onChange={(e) => setPreviewZoom(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-[8px] text-slate-500 font-extrabold">
                      <span>تصغير (30%)</span>
                      <span>الحجم الكامل (120%)</span>
                    </div>
                  </div>

                  {/* Template selector tabs */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-700 block">خيارات تصميم الشهادة:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleTemplateTypeChange("uploaded")}
                        className={`py-2 px-3 text-xs font-black rounded-lg transition ${
                          templateType === "uploaded"
                            ? "bg-sme-navy text-white shadow-md scale-[1.01]"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        قالب الوزارة المرفق
                      </button>
                      <button
                        onClick={() => handleTemplateTypeChange("default")}
                        className={`py-2 px-3 text-xs font-black rounded-lg transition ${
                          templateType === "default"
                            ? "bg-sme-navy text-white shadow-md scale-[1.01]"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        القالب التلقائي المدمج
                      </button>
                    </div>
                  </div>

                  {/* Canvas Background Image Controller */}
                  {templateType === "uploaded" && (
                    <div className="space-y-3 bg-slate-100 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700">رابط صورة القالب:</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded font-black border border-emerald-200">نشط</span>
                      </div>
                      <input
                        type="text"
                        value={backgroundUrl}
                        onChange={(e) => handleBackgroundUrlChange(e.target.value)}
                        placeholder="أدخل رابط خلفية الشهادة..."
                        className="w-full text-left font-mono text-xs px-3 py-2.5 border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-sme-navy text-slate-800"
                      />
                      
                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-bold text-slate-500 block">أو اختر صورة من جهازك كقالب:</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLocalImageUpload}
                          className="w-full text-xs font-bold text-slate-600 file:ml-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Overlay placement sliders & numbers tuning inputs */}
                  <div className="space-y-4 pt-1">
                    <span className="text-xs font-black text-slate-800 block border-b border-dashed border-slate-200 pb-2">إعدادات المحاذاة والتحكم الدقيق في الأبعاد (%):</span>

                    {/* Trainee Name Position Overlay */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/85 shadow-sm space-y-2.5">
                      <div className="flex justify-between text-xs font-black text-slate-700">
                        <span>موقع اسم المتدرب العمودي (Y):</span>
                        <span className="font-mono text-sme-navy bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs font-black">{overlayConfig.nameY}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={overlayConfig.nameY}
                        onChange={(e) => updateOverlayConfig("nameY", parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sme-navy"
                      />
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block mb-1">حجم خط الاسم:</span>
                          <input
                            type="number"
                            min="14"
                            max="50"
                            value={overlayConfig.nameSize}
                            onChange={(e) => updateOverlayConfig("nameSize", parseInt(e.target.value))}
                            className="w-full text-center py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-sme-navy focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block mb-1">لون الخط:</span>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={overlayConfig.nameColor}
                              onChange={(e) => updateOverlayConfig("nameColor", e.target.value)}
                              className="w-8 h-8 border-0 p-0 rounded-lg cursor-pointer shrink-0"
                            />
                            <input
                              type="text"
                              value={overlayConfig.nameColor}
                              onChange={(e) => updateOverlayConfig("nameColor", e.target.value)}
                              className="w-full text-center text-xs font-mono border border-slate-300 rounded-lg uppercase bg-slate-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Train Program Position overlay */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/85 shadow-sm space-y-2.5">
                      <div className="flex justify-between text-xs font-black text-slate-700">
                        <span>موقع نص تفاصيل الدورة (Y):</span>
                        <span className="font-mono text-sme-navy bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs font-black">{overlayConfig.programY}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="95"
                        value={overlayConfig.programY}
                        onChange={(e) => updateOverlayConfig("programY", parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sme-navy"
                      />
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block mb-1">حجم الخط (px):</span>
                          <input
                            type="number"
                            min="10"
                            max="22"
                            value={overlayConfig.programSize}
                            onChange={(e) => updateOverlayConfig("programSize", parseInt(e.target.value))}
                            className="w-full text-center py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-sme-navy focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block mb-1">تباعد الأسطر:</span>
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="3"
                            value={overlayConfig.programLineHeight}
                            onChange={(e) => updateOverlayConfig("programLineHeight", parseFloat(e.target.value))}
                            className="w-full text-center py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-sme-navy focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* QR Code absolute controllers */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/85 shadow-sm space-y-2.5">
                      <span className="text-xs font-black text-slate-700 block border-b border-slate-100 pb-1.5">إعدادات باركود QR للتحقق:</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-550 font-bold block mb-1">الموقع الأفقي X%:</span>
                          <input
                            type="range"
                            min="2"
                            max="50"
                            value={overlayConfig.qrX}
                            onChange={(e) => updateOverlayConfig("qrX", parseInt(e.target.value))}
                            className="w-full accent-sme-gold h-1.5"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-555 font-bold block mb-1">الموقع العمودي Y%:</span>
                          <input
                            type="range"
                            min="20"
                            max="95"
                            value={overlayConfig.qrY}
                            onChange={(e) => updateOverlayConfig("qrY", parseInt(e.target.value))}
                            className="w-full accent-sme-gold h-1.5"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block mb-1">عرض وحجم الرمز:</span>
                          <input
                            type="number"
                            min="40"
                            max="200"
                            value={overlayConfig.qrSize}
                            onChange={(e) => updateOverlayConfig("qrSize", parseInt(e.target.value))}
                            className="w-full text-center py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-sme-navy focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block mb-1">وجهة التموضع:</span>
                          <select
                            value={overlayConfig.qrAlign}
                            onChange={(e) => updateOverlayConfig("qrAlign", e.target.value)}
                            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg font-sans font-black text-xs cursor-pointer focus:ring-2 focus:ring-sme-navy focus:outline-none"
                          >
                            <option value="left">اليسار</option>
                            <option value="right">اليمين</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Serial overlay alignment coordinates */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/85 shadow-sm space-y-2.5">
                      <span className="text-xs font-black text-slate-700 block border-b border-slate-100 pb-1.5">رقم الشهادة والتواريخ الفنية:</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-550 font-bold block mb-1">الموقع الأفقي X%:</span>
                          <input
                            type="range"
                            min="2"
                            max="80"
                            value={overlayConfig.certMetaX}
                            onChange={(e) => updateOverlayConfig("certMetaX", parseInt(e.target.value))}
                            className="w-full accent-blue-900 h-1.5"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-550 font-bold block mb-1">الموقع العمودي Y%:</span>
                          <input
                            type="range"
                            min="10"
                            max="95"
                            value={overlayConfig.certMetaY}
                            onChange={(e) => updateOverlayConfig("certMetaY", parseInt(e.target.value))}
                            className="w-full accent-blue-900 h-1.5"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div>
                          <span className="text-[10px] text-slate-550 font-bold block mb-1">حجم الخط (px):</span>
                          <input
                            type="number"
                            min="8"
                            max="20"
                            value={overlayConfig.certMetaSize}
                            onChange={(e) => updateOverlayConfig("certMetaSize", parseInt(e.target.value))}
                            className="w-full text-center py-1.5 text-xs border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-sme-navy focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-555 font-bold block mb-1">خط المحاذاة:</span>
                          <select
                            value={overlayConfig.certMetaAlign}
                            onChange={(e) => updateOverlayConfig("certMetaAlign", e.target.value)}
                            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg font-sans font-black text-xs cursor-pointer focus:ring-2 focus:ring-sme-navy focus:outline-none"
                          >
                            <option value="right">اليمين</option>
                            <option value="left">اليسار</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Interactive structural toggle overlays */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/85 shadow-sm space-y-2.5">
                      <span className="text-xs font-black text-slate-700 block border-b border-slate-100 pb-1.5">طبقات الزخرفة والنصوص الافتراضية:</span>
                      <div className="space-y-2 text-right">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-bold py-1">
                          <input
                            type="checkbox"
                            checked={overlayConfig.showDefaultHeader}
                            onChange={(e) => updateOverlayConfig("showDefaultHeader", e.target.checked)}
                            className="rounded text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer shrink-0"
                          />
                          <span>رسم ترويسة الوزارة وشعار البرنامج</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-bold py-1">
                          <input
                            type="checkbox"
                            checked={overlayConfig.showSignatures}
                            onChange={(e) => updateOverlayConfig("showSignatures", e.target.checked)}
                            className="rounded text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer shrink-0"
                          />
                          <span>رسم مربع التوقيع والمدير بالأسفل</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-bold py-1">
                          <input
                            type="checkbox"
                            checked={overlayConfig.showSeal}
                            onChange={(e) => updateOverlayConfig("showSeal", e.target.checked)}
                            className="rounded text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer shrink-0"
                          />
                          <span>رسم ختم التحقق وختم المركز</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-bold py-1">
                          <input
                            type="checkbox"
                            checked={overlayConfig.showBorders}
                            onChange={(e) => updateOverlayConfig("showBorders", e.target.checked)}
                            className="rounded text-green-600 focus:ring-green-500 w-4 h-4 cursor-pointer shrink-0"
                          />
                          <span>رسم الإطار الكلاسيكي الداخلي</span>
                        </label>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2.5">
                  <button
                    onClick={handleSaveCurrentSettings}
                    className="w-full text-center text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Save size={15} />
                    حفظ ومزامنة التعديلات الحالية
                  </button>

                  {showSavedFeedback && (
                    <div className="bg-emerald-50 text-emerald-800 text-xs font-black p-3 rounded-xl border border-emerald-200 text-center animate-pulse">
                      ✓ تم حفظ الإحداثيات والتعديلات كقالب افتراضي بنجاح!
                    </div>
                  )}

                  <button
                    onClick={resetOverlayConfig}
                    className="w-full text-center text-xs font-black text-slate-600 bg-slate-200 hover:bg-slate-300 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    استعادة الإحداثيات الافتراضية
                  </button>
                </div>
              </div>

              {/* Left Column (Main): Live Landscape Web A4 canvas preview area */}
              <div className="flex-1 flex flex-col min-w-0 bg-slate-100 overflow-hidden h-full">
                
                {/* Embedded actions bar inside modal top */}
                <div className="bg-sme-navy px-5 py-3.5 text-white flex items-center justify-between no-print border-b border-sme-navy-light shrink-0">
                  <div className="flex items-center gap-2">
                    <Award className="text-sme-gold" size={18} />
                    <span className="text-xs font-extrabold font-sans">البوابة الفورية لتوليد وطباعة الشهادات المعتمدة لـ {participants.filter(pt => pt.id === activeCertificate.id)[0]?.name || activeCertificate.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDownloadCertificate(activeCertificate.name)}
                      disabled={isDownloading || isDownloadingPdf}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-500 text-white font-extrabold text-xs py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <Download size={13} />
                      )}
                      {isDownloading ? "جاري الحفظ..." : "تحميل كصورة (PNG)"}
                    </button>

                    <button 
                      onClick={() => handleDownloadCertificatePDF(activeCertificate.name)}
                      disabled={isDownloading || isDownloadingPdf}
                      className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-500 text-white font-extrabold text-xs py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isDownloadingPdf ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <FileDown size={13} />
                      )}
                      {isDownloadingPdf ? "جاري توليد PDF..." : "تحميل كملف (PDF)"}
                    </button>

                    <button 
                      onClick={handleDirectPrint}
                      className="bg-sme-gold hover:bg-sme-gold-hover text-sme-navy-dark font-black text-xs py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <Printer size={13} /> طباعة ورقية (A4 عريض)
                    </button>

                    <button 
                      onClick={() => setActiveCertificate(null)}
                      className="bg-sme-navy-light text-slate-300 hover:text-white p-1.5 rounded-lg border border-sme-navy-soft/10 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Scaled down preview container */}
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100">
                  <div 
                    className="relative overflow-visible transition-all duration-150 ease-out border border-slate-300 shadow-xl bg-white rounded-xl shrink-0"
                    style={{
                      width: `${297 * previewZoom}mm`,
                      height: `${210 * previewZoom}mm`,
                    }}
                  >
                    <div 
                      style={{
                        transform: `scale(${previewZoom})`,
                        transformOrigin: "top left",
                        width: "297mm",
                        height: "210mm",
                      }}
                      className="absolute top-0 left-0"
                    >
                      <div 
                        ref={printContainerRef}
                        id="printable-certificate"
                        className="w-[297mm] h-[210mm] bg-white relative text-slate-800 p-8 flex flex-col justify-between shadow-2xl overflow-hidden print-card-landscape select-none"
                        style={{
                          boxSizing: 'border-box',
                          backgroundImage: templateType === "uploaded" ? `url(${backgroundUrl})` : undefined,
                          backgroundSize: '100% 100%',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          border: overlayConfig.showBorders ? '14px border-solid border-[#0e2b47]' : 'none',
                          printColorAdjust: 'exact',
                          WebkitPrintColorAdjust: 'exact',
                        }}
                      >
                      
                      {/* Subtle Arabesque Watermark Center Background */}
                      {overlayConfig.showBorders && (
                        <div className="absolute inset-4 border border-amber-600/30 pointer-events-none flex items-center justify-center">
                          <div className="absolute top-2 right-2 bottom-2 left-2 border-[2px] border-amber-600/10 opacity-30"></div>
                        </div>
                      )}

                      {templateType === "default" && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
                          <Award size={400} className="text-slate-900" />
                        </div>
                      )}

                      {/* Top Header Block: Ministries Logos */}
                      {overlayConfig.showDefaultHeader ? (
                        <div className="relative z-10 flex items-center justify-between px-6 mt-1">
                          {/* Right text: Enterprise Details */}
                          <div className="text-right space-y-0.5">
                            <p className="text-xs font-bold text-sme-navy">البرنامج الوطني للمشروعات الصغرى والمتوسطة</p>
                            <h4 className="text-xs font-black text-slate-700">وزارة الحكم المحلي - حكومة الوحدة الوطنية</h4>
                            <p className="text-[10px] font-semibold text-sme-gold">فرع مركز أعمال طرابلس (Tripoli Business Center)</p>
                          </div>

                          {/* Center: Institutional Emblem */}
                          <div className="flex flex-col items-center justify-center space-y-0.5">
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-1.5 shadow-sm overflow-hidden">
                              <SmeLogo size="100%" className="object-contain" />
                            </div>
                            <span className="text-[8px] font-bold text-slate-500 font-mono tracking-tight">SME.GOV.LY</span>
                          </div>

                          {/* Left details: Cert date & Serial */}
                          <div className="text-left text-[11px] space-y-0.5 font-semibold font-mono">
                            <p className="text-slate-600">رقم الشهادة: <span className="text-blue-900 font-bold">{activeCertificate.certificateId}</span></p>
                            <p className="text-slate-600">الرقم الوطني: {activeCertificate.nationalId}</p>
                            <p className="text-slate-600">تاريخ الإصدار: {activeCertificate.certificateDate}</p>
                          </div>
                        </div>
                      ) : (
                        /* If headers are pre-printed but we still want small safety metadata printed, render it on extreme top left */
                        <div className="absolute top-5 left-5 text-left text-[9px] font-semibold font-mono opacity-80 bg-white/40 px-2 py-0.5 rounded shadow-sm z-20 no-print">
                          <p className="text-slate-600">الشهادة: {activeCertificate.certificateId}</p>
                          <p className="text-slate-600">التاريخ: {activeCertificate.certificateDate}</p>
                        </div>
                      )}

                      {/* Main core credentials dynamic overlay - Title layer */}
                      {templateType === "default" && (
                        <div className="relative z-10 text-center space-y-2 mt-4">
                          <h1 className="text-3xl font-black text-amber-600 tracking-wider font-sans">شهادة اجتياز معتمدة</h1>
                          <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent w-80 mx-auto"></div>
                          <p className="text-xs text-slate-500 font-medium">يشهد مركز أعمال طرابلس للتدريب وريادة الأعمال بأن المتدرب(ة):</p>
                        </div>
                      )}

                      {/* Overlaid Trainee Name Layer */}
                      <div 
                        className="absolute left-0 right-0 text-center select-none"
                        style={{ 
                          top: `${overlayConfig.nameY}%`, 
                          fontSize: `${overlayConfig.nameSize}px`, 
                          color: overlayConfig.nameColor, 
                          fontWeight: overlayConfig.nameBold ? '900' : 'normal',
                          transform: `translateX(${overlayConfig.nameX}px)`,
                          fontFamily: 'Cairo, sans-serif'
                        }}
                      >
                        {activeCertificate.name}
                      </div>

                      {/* Overlaid Program details sentence content text */}
                      <div 
                        className="absolute left-10 right-10 text-center select-none tracking-normal"
                        style={{ 
                          top: `${overlayConfig.programY}%`, 
                          fontSize: `${overlayConfig.programSize}px`, 
                          color: overlayConfig.programColor,
                          lineHeight: overlayConfig.programLineHeight,
                          transform: `translateX(${overlayConfig.programX}px)`,
                          fontFamily: 'Cairo, sans-serif'
                        }}
                      >
                        قد اجتاز(ت) بنجاح الدورة التدريبية المتخصصة المعنونة بـ: <br />
                        <span className="text-base font-black text-sme-navy-light block my-1">
                          « {prog ? prog.name : "برنامج المهارات الريادية ودراسة المشروعات"} »
                        </span>
                        التي نظمها مركز أعمال طرابلس بمدينة <span className="underline decoration-dotted font-bold">{prog ? prog.city : "طرابلس"}</span> للفترة <span className="font-mono bg-slate-100/50 px-1.5 py-0.5 rounded text-amber-800 font-bold">{prog ? prog.startDate : "2026-06-15"}</span> إلى <span className="font-mono bg-slate-100/50 px-1.5 py-0.5 rounded text-amber-800 font-bold">{prog ? prog.endDate : "2026-06-19"}</span> بعدد <span className="font-bold underline text-blue-900 font-mono text-[13px]">{prog ? prog.hours : 25}</span> ساعة تدريبية معتمدة ومسجلة رسمياً بالوزارة.
                      </div>

                      {/* Overlaid QR Code dynamically positioned */}
                      <div 
                        className="absolute select-none bg-white p-1 border border-slate-200 rounded shadow-sm z-10"
                        style={{ 
                          top: `${overlayConfig.qrY}%`, 
                          [overlayConfig.qrAlign === 'left' ? 'left' : 'right']: `${overlayConfig.qrX}%`,
                          width: `${overlayConfig.qrSize}px`,
                          height: `${overlayConfig.qrSize}px`,
                        }}
                      >
                        <img 
                          src={qrCodeImageUrl} 
                          alt="Verification QR code" 
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Overlaid Certificate Technical Metadata */}
                      <div 
                        className="absolute select-none font-mono text-right z-10"
                        style={{ 
                          top: `${overlayConfig.certMetaY}%`, 
                          [overlayConfig.certMetaAlign === 'left' ? 'left' : 'right']: `${overlayConfig.certMetaX}%`,
                          fontSize: `${overlayConfig.certMetaSize}px`,
                          color: overlayConfig.certMetaColor,
                          direction: 'rtl'
                        }}
                      >
                        <p className="font-black">رقم الشهادة: <span className="text-sme-navy font-bold">{activeCertificate.certificateId}</span></p>
                        <p className="opacity-90">الرقم الوطني للمتدرب: {activeCertificate.nationalId}</p>
                        <p className="opacity-90">رمز التحقق الإلكتروني آمن ومفعل ومطبوع</p>
                      </div>

                      {/* Conditional Stamps and Seal block */}
                      {overlayConfig.showSeal && (
                        <div className="absolute top-[65%] left-[45%] opacity-15 pointer-events-none select-none z-10">
                          <div className="text-[9px] font-mono text-amber-800 font-extrabold border-2 border-amber-600/40 px-2 py-1 rounded bg-slate-100/50 rotate-12">
                            OFFICIAL VERIFICATION CO-RUN SEAL
                          </div>
                          <span className="text-[8px] text-center text-slate-500 font-bold block mt-1">مركز أعمال طرابلس</span>
                        </div>
                      )}

                      {/* Bottom signatures block (Classic computer template) */}
                      {overlayConfig.showSignatures && (
                        <div className="relative z-10 flex items-end justify-between px-8 pt-2 border-t border-slate-100">
                          <div className="w-48 text-right text-[10px] space-y-0.5">
                            <span className="text-slate-400 font-bold block">موقع البوابة الإلكترونية للوزارة:</span>
                            <span className="text-[9px] text-[#0e2b47] font-bold font-mono tracking-tighter">WWW.SME.GOV.LY</span>
                          </div>

                          <div className="text-center w-52 space-y-0.5">
                            <p className="text-[11px] font-extrabold text-slate-700">مدير عام البرنامج الوطني للمشروعات</p>
                            <div className="h-5 flex items-center justify-center">
                              <div className="w-24 border-b border-dashed border-slate-300"></div>
                            </div>
                            <span className="text-[9px] font-black text-slate-500">أ. أمحمد إبراهيم المبروك</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>

                {/* Advice bar */}
                <div className="bg-amber-50 p-3 border-t border-slate-200 text-slate-800 font-bold text-[11px] flex gap-2 items-center text-right shrink-0 no-print">
                  <ShieldCheck size={18} className="text-blue-600 shrink-0" />
                  <span>
                    الشهادات تدعم رمز الاستجابة السريعة المؤمن. أي محاولة تزوير لبيانات الشهادة الخارجية ستنكشف في بوابة الموائمة الإلكترونية التابعة لوزارة الحكم المحلي بليبيا فوراً.
                  </span>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
