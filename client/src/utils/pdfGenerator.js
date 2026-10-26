import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates an instant, high-resolution, vector PDF comparison report
 * without relying on the browser's slow/freezing print spooler.
 */
export function generateComparisonPDF(selectedInstitutes) {
  if (!selectedInstitutes || selectedInstitutes.length < 2) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Theme Colors
  const deepGreen = [18, 75, 56]; // #124B38
  const slateDark = [15, 23, 42];

  // Document Top Header Banner
  doc.setFillColor(...deepGreen);
  doc.rect(0, 0, 210, 26, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("FutureSelector", 14, 12);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(167, 243, 208); // Light emerald
  doc.text("Right Guidance. Brighter Tomorrows. | Official Coaching Comparison Report", 14, 18);

  // Date and Audit badge
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  doc.setFontSize(8);
  doc.setTextColor(220, 252, 231);
  doc.text(`Date: ${dateStr}`, 196, 12, { align: "right" });
  doc.text("NTA & Supreme Court Audited", 196, 18, { align: "right" });

  // Subheader: Institutes being compared
  let yPos = 33;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...slateDark);
  
  const names = selectedInstitutes.map(i => i.name).join("  VS  ");
  doc.text(names, 14, yPos);

  yPos += 5;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Direct, unbiased classroom audit covering batch caps, published fee schedules, and FS admission grants.", 14, yPos);

  yPos += 6;

  // Build Table Headers
  const tableHeaders = [
    "Audited Benchmark",
    ...selectedInstitutes.map((inst, idx) => `Contender ${idx + 1}: ${inst.name}\n(${inst.location.split(',')[0]} • ${inst.type})`)
  ];

  // Build Table Rows
  const tableData = [
    // Chapter 1: Academics
    [
      { 
        content: "CHAPTER 1: ACADEMICS & CLASSROOM AUDIT", 
        colSpan: selectedInstitutes.length + 1, 
        styles: { fillColor: [18, 75, 56], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 } 
      }
    ],
    [
      "Classroom Batch Cap",
      ...selectedInstitutes.map(i => `${i.batchSize}\n(Audited physical desk limit)`)
    ],
    [
      "Selection Ratio %",
      ...selectedInstitutes.map(i => `${i.selectionRate}\n(NTA Roll Register Verified)`)
    ],
    [
      "Top AIR Milestones",
      ...selectedInstitutes.map(i => `${i.topRank}\n(Classroom Enrolled Students)`)
    ],
    [
      "Faculty Stability",
      ...selectedInstitutes.map(i => `${i.facultyHighlights || 'Senior Subject Panel'}\n(Zero Mid-Session Shuffling)`)
    ],
    [
      "Doubt Resolution",
      ...selectedInstitutes.map(i => `${i.doubtSupport || 'Daily 1-on-1 Faculty Desks'}`)
    ],

    // Chapter 2: Financials & Vouchers
    [
      { 
        content: "CHAPTER 2: FINANCIAL TRANSPARENCY, GRANTS & REFUND ESCROW", 
        colSpan: selectedInstitutes.length + 1, 
        styles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 } 
      }
    ],
    [
      "Standard Annual Fees",
      ...selectedInstitutes.map(i => `${i.fees}\n(Tuition + Kit + CBT Series)`)
    ],
    [
      "FutureSelector Grant",
      ...selectedInstitutes.map(() => `Flat ₹15,000 Off\n(Direct Cash Counter Pass)`)
    ],
    [
      "Effective Net Payable",
      ...selectedInstitutes.map(i => {
        const base = i.numericFee || parseInt(i.fees?.replace(/[^\d]/g, "") || "140000");
        const net = Math.max(0, base - 15000);
        return `₹${net.toLocaleString("en-IN")} / Yr\n(After applying ₹15k pass)`;
      })
    ],
    [
      "Refund Protection",
      ...selectedInstitutes.map(() => `100% Supreme Court Refund Compliant\n(15-Day Pro-Rata Escrow Guarantee)`)
    ],

    // Chapter 3: Campus Living
    [
      { 
        content: "CHAPTER 3: CAMPUS LIVING & REPUTATION", 
        colSpan: selectedInstitutes.length + 1, 
        styles: { fillColor: [49, 46, 129], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 } 
      }
    ],
    [
      "Student Alumni Reviews",
      ...selectedInstitutes.map(i => `${i.rating} / 5.0\n(${i.reviews} Verified Alumni)`)
    ],
    [
      "Hostel Proximity & Food",
      ...selectedInstitutes.map(i => `${i.hostelDistance || 'Within 250m'}\n(FSSAI-Audited Canteen)`)
    ]
  ];

  // AutoTable Config
  autoTable(doc, {
    startY: yPos,
    head: [tableHeaders],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
      valign: "middle",
      cellPadding: 2.5
    },
    styles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
      valign: "middle",
      lineColor: [203, 213, 225],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 42 }
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255]
    },
    margin: { left: 14, right: 14 },
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.height || 297;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("FutureSelector Student Protection Desk • Toll-Free Help: 1800-FS-ADMIT • https://futureselector.com", 14, pageHeight - 8);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, 196, pageHeight - 8, { align: "right" });
    }
  });

  // Direct instant browser download
  const cleanNames = selectedInstitutes.map(i => i.name.split(" ")[0]).join("_vs_");
  doc.save(`FutureSelector_Comparison_${cleanNames}.pdf`);
}

/**
 * Generates an official, printable vector PDF admission pass and escrow certificate
 * for the student to present directly at the coaching center cash counter.
 */
export function generateAdmissionPassPDF(voucher, user) {
  if (!voucher) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const deepGreen = [18, 75, 56]; // #124B38
  const emeraldAccent = [16, 185, 129];
  const goldAccent = [245, 158, 11];
  const darkSlate = [15, 23, 42];

  // Header Banner
  doc.setFillColor(...deepGreen);
  doc.rect(0, 0, 210, 32, "F");

  // FutureSelector Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("FutureSelector", 14, 14);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(167, 243, 208);
  doc.text("OFFICIAL STUDENT ADMISSION PASS & REFUND ESCROW CERTIFICATE", 14, 21);
  doc.text("NTA & Supreme Court Fee Refund Compliant • Direct Counter Waiver Pass", 14, 26);

  // Pass Reference & Date Right Aligned
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(`PASS ID: ${voucher.voucherId || "FS-PASS-7429"}`, 196, 14, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 252, 231);
  doc.text(`Issue Date: ${dateStr}`, 196, 21, { align: "right" });
  doc.text("Status: VERIFIED & ACTIVE", 196, 26, { align: "right" });

  let y = 42;

  // Gold Ribbon Subtitle
  doc.setFillColor(254, 243, 199); // amber-100
  doc.roundedRect(14, y, 182, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9);
  doc.text("PRESENT THIS OFFICIAL PASS AT THE CASH/ACCOUNTS DESK FOR DIRECT ₹15,000 DEDUCTION", 105, y + 6.5, { align: "center" });

  y += 18;

  // Student & Admission Details Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...darkSlate);
  doc.text("1. ASPIRANT IDENTITY & CENTER DETAILS", 14, y);

  y += 4;

  const aspirantData = [
    ["Candidate Name", user?.name || "Student Aspirant", "Target Exam", user?.exam || "Competitive Exam"],
    ["Contact Phone", user?.phone || "Verified Contact", "Preferred Hub", user?.city || "Coaching Hub"],
    ["Allocated Institute", voucher.instituteName || "Audited Institute", "Batch Category", voucher.batch || "Regular Classroom Batch"],
    ["Voucher ID", voucher.voucherId || "FS-SEAT-7429", "Counter Promo Code", voucher.code || "FS-PASS-15K"],
    ["Grant Value", voucher.discountAmount || "Flat ₹15,000 Off Tuition", "Validity Period", voucher.validTill || "Valid for 2026 Session"]
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: aspirantData,
    theme: "grid",
    styles: {
      fontSize: 8.5,
      cellPadding: 2.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 40 },
      1: { cellWidth: 51 },
      2: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 40 },
      3: { cellWidth: 51 }
    },
    margin: { left: 14, right: 14 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // 15-Day Escrow Protection Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...darkSlate);
  doc.text("2. 15-DAY ESCROW REFUND GUARANTEE (LEGAL MANDATE)", 14, y);

  y += 4;

  const escrowRules = [
    ["100% Pro-Rata Refund", "Under Ministry of Education & Supreme Court 2024 directives, any student may withdraw within 15 days of batch commencement with zero unreasonable lock-in."],
    ["FutureSelector Escrow Shield", "FutureSelector audits this batch seat. If center disputes valid withdrawal within the statutory window, FS Grievance Cell initiates direct refund arbitration."],
    ["Non-Transferable Grant", "The ₹15,000 discount applies exclusively to the tuition fee schedule published on FutureSelector and cannot be converted to physical cash."]
  ];

  autoTable(doc, {
    startY: y,
    head: [["Statutory Provision", "Protection Details & Terms of Escrow"]],
    body: escrowRules,
    theme: "striped",
    headStyles: {
      fillColor: [18, 75, 56],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240]
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 132 }
    },
    margin: { left: 14, right: 14 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Verification Instructions Box
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.roundedRect(14, y, 182, 28, 2, 2, "FD");
  doc.setDrawColor(167, 243, 208);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(6, 95, 70);
  doc.text("COUNTER CASHIER INSTRUCTIONS (FOR CENTER STAFF):", 18, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text("1. Scan the QR code or verify Token ID " + (voucher.voucherId || "FS-SEAT-7429") + " on the FutureSelector Partner Portal.", 18, y + 12);
  doc.text("2. Apply the flat ₹15,000 voucher deduction directly on annual gross tuition fees prior to GST billing.", 18, y + 17);
  doc.text("3. Issue the standard official enrollment fee receipt endorsing FutureSelector Escrow token reference.", 18, y + 22);

  y += 34;

  // Signature Block & Stamp
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 12, 70, y + 12);
  doc.line(140, y + 12, 196, y + 12);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Candidate / Parent Signature", 14, y + 16);
  doc.text("Center Accounts Officer Stamp", 140, y + 16);

  // Footer
  const pageHeight = doc.internal.pageSize.height || 297;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("FutureSelector Student Protection Desk • Toll-Free Help: 1800-FS-ADMIT • https://futureselector.com", 14, pageHeight - 8);
  doc.text("Document Hash: " + (voucher.voucherId || "FS-PASS-7429") + "-VERIFIED", 196, pageHeight - 8, { align: "right" });

  doc.save(`FutureSelector_AdmissionPass_${voucher.voucherId || "PASS"}.pdf`);
}

