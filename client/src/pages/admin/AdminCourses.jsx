import { useState } from "react";
import { 
  GraduationCap, Award, Search, Plus, BookOpen, 
  Check, Calendar, IndianRupee, Layers, Sparkles
} from "lucide-react";

export default function AdminCourses() {
  const [activeTab, setActiveTab] = useState("COURSES");
  const [search, setSearch] = useState("");

  const courses = [
    {
      id: "CRS-JEE-01",
      name: "JEE (Main + Advanced) 2-Year Classroom Program",
      targetExam: "JEE Advanced 2028",
      targetClass: "Class 11 Moving to 12",
      mode: "Classroom / Offline",
      avgFee: "₹1,45,000 - ₹1,80,000",
      activePartnerInstitutes: 18,
      scholarshipApplicable: true
    },
    {
      id: "CRS-NEET-02",
      name: "NEET Medical Achievers Comprehensive Course",
      targetExam: "NEET UG 2027",
      targetClass: "Class 12 Passed / Repeater",
      mode: "Classroom / Hybrid",
      avgFee: "₹1,25,000 - ₹1,55,000",
      activePartnerInstitutes: 24,
      scholarshipApplicable: true
    },
    {
      id: "CRS-FND-03",
      name: "Pre-Foundation Olympiad & NTSE Mastery",
      targetExam: "NSEJS / IMO / NTSE",
      targetClass: "Class 9 & 10",
      mode: "Classroom",
      avgFee: "₹75,000 - ₹95,000",
      activePartnerInstitutes: 12,
      scholarshipApplicable: false
    }
  ];

  const scholarships = [
    {
      id: "SCH-TALLENTEX-26",
      examName: "TALLENTEX 2026 (Allen)",
      registrationDeadline: "2026-11-20",
      examDate: "2026-12-05",
      maxScholarship: "Up to 90% Fee Waiver",
      cashRewardPool: "₹1.25 Crore",
      status: "ACTIVE"
    },
    {
      id: "SCH-ANTHE-26",
      examName: "ANTHE 2026 (Aakash BYJU'S)",
      registrationDeadline: "2026-10-31",
      examDate: "2026-11-12",
      maxScholarship: "100% Scholarship + NASA Trip",
      cashRewardPool: "₹50 Lakhs",
      status: "ACTIVE"
    },
    {
      id: "SCH-RESONET-26",
      examName: "ResoNET Scholarship Test",
      registrationDeadline: "2026-11-15",
      examDate: "Weekly Sunday Online/Offline",
      maxScholarship: "Up to 75% Waiver",
      cashRewardPool: "Direct Batch Allotment",
      status: "ACTIVE"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#124B38]/10 text-[#124B38] border border-[#124B38]/20">
            Academic Catalog Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Courses & Scholarship Exams
          </h1>
          <p className="text-xs text-[#5F6B64]">
            Maintain standardized JEE/NEET course categories and update national scholarship entrance test calendars.
          </p>
        </div>

        <button
          onClick={() => alert("Creating a new academic course listing")}
          className="px-4 py-2.5 bg-[#124B38] hover:bg-[#0D3A2C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E8E4DA] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("COURSES")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "COURSES"
              ? "bg-[#124B38] text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-slate-900 border border-[#E8E4DA]"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Catalog ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("SCHOLARSHIPS")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "SCHOLARSHIPS"
              ? "bg-[#124B38] text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-slate-900 border border-[#E8E4DA]"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Scholarship Tests ({scholarships.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === "COURSES" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {courses.map((crs) => (
            <div
              key={crs.id}
              className="bg-white border border-[#E8E4DA] rounded-3xl p-5 shadow-card space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {crs.id}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {crs.targetExam}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {crs.name}
                </h3>

                <div className="space-y-1.5 text-xs text-[#5F6B64] pt-2 border-t border-[#E8E4DA]">
                  <div className="flex justify-between">
                    <span>Target Cohort:</span>
                    <strong className="text-slate-800 font-bold">{crs.targetClass}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Mode:</span>
                    <strong className="text-slate-800 font-bold">{crs.mode}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee Bracket:</span>
                    <strong className="text-slate-900 font-bold">{crs.avgFee}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E4DA] flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-[#124B38]">
                  {crs.activePartnerInstitutes} institutes offer this
                </span>
                <button
                  onClick={() => alert(`Editing course ${crs.id}`)}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E8E4DA] rounded-3xl shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E4DA] text-[10px] font-black uppercase tracking-wider text-slate-700">
              <tr>
                <th className="py-3 px-4">Exam ID & Name</th>
                <th className="py-3 px-4">Registration Cutoff</th>
                <th className="py-3 px-4">Test Date</th>
                <th className="py-3 px-4">Maximum Scholarship</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DA]">
              {scholarships.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block font-bold">{sch.examName}</strong>
                    <span className="font-mono text-[10px] text-slate-500">{sch.id}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-rose-700">
                    {sch.registrationDeadline}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">
                    {sch.examDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#124B38] block">{sch.maxScholarship}</span>
                    <span className="text-[10px] text-slate-500">{sch.cashRewardPool}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {sch.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Editing scholarship test ${sch.examName}`)}
                      className="px-2.5 py-1 text-xs font-bold text-[#124B38] hover:bg-[#124B38]/10 rounded-lg cursor-pointer"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
