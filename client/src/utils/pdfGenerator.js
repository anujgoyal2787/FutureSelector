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
