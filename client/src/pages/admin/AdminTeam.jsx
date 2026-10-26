import { useState } from "react";
import { 
  ShieldAlert, UserPlus, Shield, Check, X, Mail, 
  Phone, Lock, AlertCircle, KeyRound, UserCheck
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminTeam() {
  const { adminUser } = useAdminAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [teamMembers, setTeamMembers] = useState([
    {
      id: "ADM-001",
      name: "Master Super Admin",
      email: "admin@futureselector.com",
      role: "SUPER_ADMIN",
      department: "Executive Leadership",
      status: "ACTIVE",
      lastLogin: "Just now (Active)",
      permissions: ["MANAGE_TEAM", "APPROVE_SENSITIVE_CHANGES", "MANAGE_FINANCE", "EXPORT_DATA", "VERIFY_ADMISSIONS"]
    },
    {
      id: "ADM-002",
      name: "Kunal Verma",
      email: "kunal.ops@futureselector.com",
      role: "OPERATIONS_MANAGER",
      department: "Partner Operations",
      status: "ACTIVE",
      lastLogin: "2 hours ago",
      permissions: ["APPROVE_SENSITIVE_CHANGES", "VERIFY_ADMISSIONS", "MANAGE_INSTITUTES"]
    },
    {
      id: "ADM-003",
      name: "Pooja Hegde",
      email: "pooja.counsellor@futureselector.com",
      role: "COUNSELLOR",
      department: "Student Guidance & Admissions",
      status: "ACTIVE",
      lastLogin: "Today, 11:30 AM",
      permissions: ["VIEW_LEADS", "CALL_STUDENTS", "ISSUE_PASSES"]
    },
    {
      id: "ADM-004",
      name: "Siddharth Mehra",
      email: "siddharth.fin@futureselector.com",
      role: "FINANCE_MANAGER",
      department: "Finance & Accounts",
      status: "ACTIVE",
      lastLogin: "Yesterday",
      permissions: ["MANAGE_FINANCE", "EXPORT_DATA", "RECONCILE_PAYOUTS"]
    }
  ]);

  const getRoleBadge = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-rose-100 text-rose-900 border-rose-300";
      case "OPERATIONS_MANAGER":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "FINANCE_MANAGER":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "COUNSELLOR":
        return "bg-blue-100 text-blue-900 border-blue-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-900 border border-purple-400/20">
            Role-Based Access Control (RBAC)
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Team & Operational Permissions
          </h1>
          <p className="text-xs text-[#5F6B64]">
            Enforce role boundaries. Each operational staff member has strictly segregated authorization levels.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 bg-[#124B38] hover:bg-[#0D3A2C] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* RBAC Overview Matrix */}
      <div className="bg-white border border-[#E8E4DA] rounded-3xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#E8E4DA] flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Active Administrative Staff ({teamMembers.length})</h3>
          <span className="text-xs text-[#5F6B64]">Zero-trust session tracking active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E4DA] text-[10px] font-black uppercase tracking-wider text-slate-700">
              <tr>
                <th className="py-3 px-4">Member Name & Email</th>
                <th className="py-3 px-4">Role Badge</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Granted Permissions</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DA]">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block font-bold">{member.name}</strong>
                    <span className="text-[11px] font-mono text-[#5F6B64]">{member.email}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getRoleBadge(member.role)}`}>
                      {member.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {member.department}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {member.permissions.map((perm, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-mono font-medium">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {member.lastLogin}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Configuring permissions for ${member.name}`)}
                      className="text-xs font-bold text-[#124B38] hover:underline cursor-pointer"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal Preview */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-[#E8E4DA] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <h3 className="text-base font-black text-slate-900">Provision Staff Account</h3>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <input type="text" placeholder="e.g. Ramesh Chandra" className="w-full px-3 py-2 border rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Official Email Address</label>
                <input type="email" placeholder="name@futureselector.com" className="w-full px-3 py-2 border rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">RBAC Role Assignment</label>
                <select className="w-full px-3 py-2 border rounded-xl outline-none font-bold">
                  <option value="OPERATIONS_MANAGER">Operations Manager</option>
                  <option value="COUNSELLOR">Student Counsellor</option>
                  <option value="FINANCE_MANAGER">Finance Manager</option>
                  <option value="SUPPORT_EXECUTIVE">Support Executive</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 border border-[#E8E4DA] rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Invitation link generated and dispatched.");
                  setShowInviteModal(false);
                }}
                className="px-4 py-2 bg-[#124B38] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
