import React, { useState } from "react";
import { Participant, TrainingProgram } from "../types";
import { 
  ShieldCheck, 
  Search, 
  Award, 
  User, 
  MapPin, 
  Calendar, 
  Check, 
  X, 
  AlertTriangle
} from "lucide-react";

interface QRVerifyProps {
  participants: Participant[];
  programs: TrainingProgram[];
}

export default function QRVerify({ participants, programs }: QRVerifyProps) {
  const [certIdQuery, setCertIdQuery] = useState("");
  const [nationalIdQuery, setNationalIdQuery] = useState("");
  const [resultTrainee, setResultTrainee] = useState<Participant | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);

    const found = participants.find(p => {
      const matchCert = p.certificateId && p.certificateId.trim().toLowerCase() === certIdQuery.trim().toLowerCase();
      const matchNat = p.nationalId.trim() === nationalIdQuery.trim();
      return matchCert && matchNat;
    });

    if (found) {
      setResultTrainee(found);
    } else {
      setResultTrainee(null);
    }
  };

  const getProgramDetails = (progId: string) => {
    return programs.find(p => p.id === progId);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-8 px-4" id="qr-verify-module">
      
      {/* Verification Logo */}
      <div className="text-center space-y-3">
        <div className="inline-flex bg-blue-50 text-blue-800 p-4 rounded-full border border-blue-100 shadow-sm">
          <ShieldCheck size={48} className="animate-bounce" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-blue-800">البرنامج الوطني لدعم المشروعات الصغرى والمتوسطة</p>
          <h2 className="text-xl font-extrabold text-slate-800">بوابة التحقق الإلكتروني الموحدة لمركز أعمال طرابلس</h2>
          <p className="text-xs text-slate-500">تحقق فوري من صحة ومصداقية شهادات خريجي البرامج التدريبية وعقود التمويل.</p>
        </div>
      </div>

      {/* Verification Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-50">
          أدخل بيانات الشهادة والمطابقة
        </h3>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رمز الشهادة (مثال: CERT-2026-...) *</label>
              <input 
                type="text" 
                required
                placeholder="CERT-2026-..."
                value={certIdQuery}
                onChange={(e) => setCertIdQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-center"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الوطني للمطابقة لرباعي الاسم *</label>
              <input 
                type="text" 
                required
                maxLength={12}
                placeholder="رقم وطني فريد للمتدرب"
                value={nationalIdQuery}
                onChange={(e) => setNationalIdQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-center"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition"
          >
            تأكيد والتحقق من صحة وصلاحية الشهادة التدريبية
          </button>
        </form>
      </div>

      {/* VERIFICATION REPORT PANEL */}
      {searched && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 animate-fade-in">
          {resultTrainee ? (() => {
            const prog = getProgramDetails(resultTrainee.programId);
            return (
              <div className="space-y-6">
                {/* Visual verified state banner */}
                <div className="bg-blue-50 text-blue-950 p-4 rounded-xl border border-blue-100 flex items-center gap-3.5">
                  <div className="bg-blue-600 text-white p-2 rounded-full">
                    <Check size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs">تم فحص الشهادة بنجاح - الشهادة صالحة ومعتمدة ✓</h4>
                    <p className="text-[10px] text-blue-800 mt-0.5">مطابقة 100% لسجلات البرنامج الوطني لدعم المشروعات الصغرى والمتوسطة لعام 2026.</p>
                  </div>
                </div>

                {/* Trainee Details list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-500">اسم المتدرب المعتمد:</span>
                    <span className="text-slate-900 font-extrabold">{resultTrainee.name}</span>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-500">الرقم الوطني للمطابقة:</span>
                    <span className="text-slate-900 font-mono font-bold">{resultTrainee.nationalId}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center sm:col-span-2">
                    <span className="text-slate-500">البرنامج التدريبي المنجز:</span>
                    <span className="text-blue-950 font-extrabold text-left">{prog ? prog.name : "دورة عامة لرواد الأعمال"}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-500">تاريخ إصدار واعتماد الشهادة:</span>
                    <span className="text-slate-900 font-mono">{resultTrainee.certificateDate || "2026-06-21"}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-500 font-normal">عدد الساعات المعتمدة:</span>
                    <span className="text-slate-900 font-bold">{prog ? prog.hours : 25} ساعة تدريبية</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-500">المدرب المشرف:</span>
                    <span className="text-slate-900">{prog ? prog.trainer : "مدربي فرع أعمال طرابلس"}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-500">جهة التنفيذ وموقع المنظومة:</span>
                    <span className="text-slate-900">{prog ? prog.organization : "مركز أعمال طرابلس"}</span>
                  </div>
                </div>

                {/* Additional advice disclaimer */}
                <div className="text-[10px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed text-right md:-mx-4 md:-mb-4">
                  * تم توثيق والتحقق من صحة هذه الشهادة الإلكترونية آلياً بالاعتماد على التوقيع ومصادقة قاعدة الداتا لفرع طرابلس. الجهة الرسمية المعتمدة هي البرنامج الوطني لدعم المشروعات الصغرى والمتوسطة.
                </div>
              </div>
            );
          })() : (
            <div className="text-center py-6 space-y-3">
              <div className="inline-flex bg-red-50 text-red-800 p-3 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-red-900">فشل التحقق - الشهادة غير مطابقة!</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  لم يتم العثور على أية شهادة تدريبية تطابق الكود أو الرقم الوطني المدخل في سجلات مركز أعمال طرابلس الحالية. يرجى التحقق من المدخلات والمحاولة مرة أخرى.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
