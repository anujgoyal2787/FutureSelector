/**
 * FutureSelector - Dynamic Aspirant Pass Card Texture Generator
 * Generates ultra-crisp 1024x1440 PNG Data URLs via HTML5 Canvas
 * Handles both Guest (Not Logged In) and Verified Student states.
 */

// Helper to draw rounded rectangle on Canvas
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generate Front Face of Aspirant Pass
 * @param {Object|null} user - Current authenticated user or null
 * @returns {string} PNG Data URL (1024 x 1440)
 */
export function generateCardFront(user) {
  if (typeof document === 'undefined') return '/card-front.png';

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '/card-front.png';

  const isVerified = !!user;

  // 1. Base Card Background (Warm Ivory)
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(0, 0, 1024, 1440);

  // Outer border accent
  ctx.strokeStyle = '#E8E4DA';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 24, 24, 976, 1392, 40);
  ctx.stroke();

  // 2. Top Header Banner
  const headerGrad = ctx.createLinearGradient(0, 0, 1024, 280);
  if (isVerified) {
    headerGrad.addColorStop(0, '#0D3A2C');
    headerGrad.addColorStop(1, '#124B38');
  } else {
    headerGrad.addColorStop(0, '#0D3A2C');
    headerGrad.addColorStop(1, '#18382B');
  }
  ctx.fillStyle = headerGrad;
  ctx.beginPath();
  ctx.moveTo(24, 64);
  ctx.quadraticCurveTo(24, 24, 64, 24);
  ctx.lineTo(960, 24);
  ctx.quadraticCurveTo(1000, 24, 1000, 64);
  ctx.lineTo(1000, 270);
  ctx.lineTo(24, 270);
  ctx.closePath();
  ctx.fill();

  // Top header text (leaving clearance for lanyard slot at y: 60-150)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px Inter, system-ui, sans-serif';
  ctx.fillText('FUTURESELECTOR', 512, 195);

  ctx.fillStyle = '#C5A059';
  ctx.font = 'bold 15px Inter, system-ui, sans-serif';
  ctx.fillText('NATIONAL COACHING DISCOVERY & ADMISSION PLATFORM', 512, 235);

  // 3. Status Pill across header seam
  const pillY = 250;
  const pillW = 380;
  const pillH = 46;
  const pillX = 512 - pillW / 2;

  if (isVerified) {
    ctx.fillStyle = '#D1FAE5';
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 23);
    ctx.fill();
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 18px Inter, system-ui, sans-serif';
    ctx.fillText('✓  VERIFIED ASPIRANT PASS 2026', 512, pillY + 29);
  } else {
    ctx.fillStyle = '#FEF3C7';
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 23);
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#B45309';
    ctx.font = 'bold 18px Inter, system-ui, sans-serif';
    ctx.fillText('🔒  PROVISIONAL PASS • UNVERIFIED', 512, pillY + 29);
  }

  // 4. Student Avatar / Silhouette
  const avatarY = 410;
  ctx.save();
  ctx.beginPath();
  ctx.arc(512, avatarY, 82, 0, Math.PI * 2);
  ctx.fillStyle = '#E2E8F0';
  ctx.fill();
  ctx.strokeStyle = isVerified ? '#10B981' : '#F59E0B';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.clip();

  // Draw avatar head
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(512, avatarY - 15, 34, 0, Math.PI * 2);
  ctx.fill();

  // Draw avatar shoulders
  ctx.beginPath();
  ctx.arc(512, avatarY + 75, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Badge on avatar
  ctx.beginPath();
  ctx.arc(575, avatarY + 55, 22, 0, Math.PI * 2);
  ctx.fillStyle = isVerified ? '#10B981' : '#F59E0B';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px Inter, system-ui, sans-serif';
  ctx.fillText(isVerified ? '✓' : '🔒', 575, avatarY + 61);

  // 5. Name and Target Details
  ctx.textAlign = 'center';
  ctx.fillStyle = isVerified ? '#0D3A2C' : '#1C201D';
  ctx.font = '800 36px Inter, system-ui, sans-serif';
  const displayName = isVerified ? (user.name || 'Aryan Sharma').toUpperCase() : 'GUEST ASPIRANT';
  ctx.fillText(displayName, 512, 535);

  ctx.fillStyle = isVerified ? '#124B38' : '#B45309';
  ctx.font = 'bold 16px Inter, system-ui, sans-serif';
  const idText = isVerified 
    ? `OFFICIAL ID: FS-PASS-${(user.name || 'STU').slice(0, 3).toUpperCase()}-9420` 
    : 'PASS STATUS: LOGIN REQUIRED TO ACTIVATE';
  ctx.fillText(idText, 512, 568);

  ctx.fillStyle = '#5F6B64';
  ctx.font = '600 16px Inter, system-ui, sans-serif';
  const examText = isVerified ? `TARGET EXAM: ${(user.exam || 'JEE Advanced 2026').toUpperCase()}` : 'TARGET: JEE & NEET ASPIRANTS';
  ctx.fillText(examText, 512, 598);

  // 6. Highlight Center Box
  const boxX = 72;
  const boxY = 635;
  const boxW = 880;
  const boxH = 410;

  if (!isVerified) {
    // --- GUEST STATE: CLEAR LOGIN TO VERIFY CALLOUT ---
    ctx.fillStyle = '#FFFDF7';
    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 28);
    ctx.fill();
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Box Header Pill
    const tagW = 540;
    const tagH = 42;
    ctx.fillStyle = '#FEF3C7';
    drawRoundedRect(ctx, 512 - tagW / 2, boxY + 22, tagW, tagH, 12);
    ctx.fill();
    ctx.fillStyle = '#92400E';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.fillText('⚡ VERIFICATION REQUIRED FOR STUDENT BENEFITS', 512, boxY + 49);

    // Main Big Callout in Hindi + English as user requested
    ctx.fillStyle = '#124B38';
    ctx.font = '900 32px Inter, system-ui, sans-serif';
    ctx.fillText('Verified Card Ke Liye Login Karein', 512, boxY + 115);

    ctx.fillStyle = '#64748B';
    ctx.font = '500 17px Inter, system-ui, sans-serif';
    ctx.fillText('Sign in to activate your official verified pass and direct vouchers', 512, boxY + 150);

    // Divider line
    ctx.strokeStyle = '#FDE68A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(boxX + 40, boxY + 175);
    ctx.lineTo(boxX + boxW - 40, boxY + 175);
    ctx.stroke();

    // Benefits list
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 18px Inter, system-ui, sans-serif';

    const bullets = [
      '✓  Direct ₹15,000 Coaching Fee Waiver Voucher',
      '✓  Audited Real Batch Sizes & Verified Selection Ratios',
      '✓  1-on-1 Free Academic Counselling & Institute Selection'
    ];

    bullets.forEach((bullet, idx) => {
      ctx.fillText(bullet, boxX + 60, boxY + 215 + idx * 36);
    });

    // Action button shape
    ctx.textAlign = 'center';
    const btnW = 520;
    const btnH = 54;
    const btnX = 512 - btnW / 2;
    const btnY = boxY + 332;

    ctx.fillStyle = '#124B38';
    drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 16);
    ctx.fill();
    ctx.strokeStyle = '#C5A059';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Inter, system-ui, sans-serif';
    ctx.fillText('🔒  CLICK HERE TO LOGIN & VERIFY PASS', 512, btnY + 34);

  } else {
    // --- VERIFIED STATE: ACCREDITED STUDENT PASS ---
    ctx.fillStyle = '#F0FDF4';
    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 28);
    ctx.fill();
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Box Header Pill
    const tagW = 460;
    const tagH = 42;
    ctx.fillStyle = '#DCFCE7';
    drawRoundedRect(ctx, 512 - tagW / 2, boxY + 22, tagW, tagH, 12);
    ctx.fill();
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.fillText('✓ ALL INDIA ACCREDITED ASPIRANT PASS', 512, boxY + 49);

    // Main Big Callout
    ctx.fillStyle = '#065F46';
    ctx.font = '900 32px Inter, system-ui, sans-serif';
    ctx.fillText('Verified Aspirant Pass Active', 512, boxY + 115);

    ctx.fillStyle = '#475569';
    ctx.font = '500 17px Inter, system-ui, sans-serif';
    ctx.fillText('Accredited identity token recognized across verified coaching centers', 512, boxY + 150);

    // Divider line
    ctx.strokeStyle = '#BBF7D0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(boxX + 40, boxY + 175);
    ctx.lineTo(boxX + boxW - 40, boxY + 175);
    ctx.stroke();

    // Benefits list
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 18px Inter, system-ui, sans-serif';

    const bullets = [
      '•  Fee Waiver Voucher: ₹15,000 ACTIVE (Applicable on admissions)',
      `•  Preferred Coaching Hub: ${user.city || 'Pan-India Hubs'}`,
      `•  Registered Student: ${user.phone || '+91 Verified Aspirant'}`
    ];

    bullets.forEach((bullet, idx) => {
      ctx.fillText(bullet, boxX + 60, boxY + 215 + idx * 36);
    });

    // Active Badge button shape
    ctx.textAlign = 'center';
    const btnW = 480;
    const btnH = 52;
    const btnX = 512 - btnW / 2;
    const btnY = boxY + 332;

    ctx.fillStyle = '#059669';
    drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 16);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Inter, system-ui, sans-serif';
    ctx.fillText('✓  VERIFIED ADMISSION TOKEN ACTIVE', 512, btnY + 33);
  }

  // 7. Security Barcode & Seal
  ctx.fillStyle = '#334155';
  const barcodeY = 1075;
  const barcodeH = 110;
  const barcodeW = 820;
  const startX = 512 - barcodeW / 2;

  // Draw clean barcode lines
  for (let x = 0; x < barcodeW; x += 11) {
    const isThick = (x * 7) % 19 > 9;
    const width = isThick ? 5 : 2;
    ctx.fillRect(startX + x, barcodeY, width, barcodeH);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = isVerified ? '#124B38' : '#D97706';
  ctx.font = 'bold 16px Inter, system-ui, sans-serif';
  const bottomSecurity = isVerified
    ? '★ OFFICIAL ACCREDITED FUTURESELECTOR PASS • SESSION 2026-27 ★'
    : '★ PROVISIONAL GUEST PASS • LOGIN TO UNLOCK OFFICIAL QR VERIFICATION ★';
  ctx.fillText(bottomSecurity, 512, 1225);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 13px Inter, system-ui, sans-serif';
  ctx.fillText('SECURE ASPIRANT VERIFICATION • FUTURESELECTOR.COM', 512, 1260);

  return canvas.toDataURL('image/png');
}

/**
 * Generate Back Face of Aspirant Pass
 * @param {Object|null} user - Current authenticated user or null
 * @returns {string} PNG Data URL (1024 x 1440)
 */
export function generateCardBack(user) {
  if (typeof document === 'undefined') return '/card-back.png';

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '/card-back.png';

  const isVerified = !!user;

  // 1. Sleek Deep Green Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1440);
  bgGrad.addColorStop(0, '#091A14');
  bgGrad.addColorStop(1, '#0F2E22');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1440);

  // Outer gold accent line
  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 2.5;
  drawRoundedRect(ctx, 36, 36, 952, 1368, 36);
  ctx.stroke();

  // 2. Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px Inter, system-ui, sans-serif';
  ctx.fillText('FUTURESELECTOR', 512, 220);

  ctx.fillStyle = '#C5A059';
  ctx.font = 'bold 16px Inter, system-ui, sans-serif';
  ctx.fillText('OFFICIAL ASPIRANT IDENTITY & VERIFICATION PASS', 512, 260);

  // 3. Terms & Guidelines
  ctx.textAlign = 'left';
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '500 18px Inter, system-ui, sans-serif';

  const rules = isVerified ? [
    '1. Valid for direct verification at accredited coaching centers across India.',
    '2. Non-transferable admission identity token for JEE & NEET aspirants.',
    '3. Unlocks audited batch selection ratios and institutional fee waivers.',
    '4. Student helpline & verification desk: 1800-123-4567.'
  ] : [
    '1. Provisional pass. Login to activate your verified student credentials.',
    '2. Applicable for JEE & NEET coaching centers across India.',
    '3. Verified passes grant access to institutional fee waivers & audit reports.',
    '4. Student helpline & consultation desk: 1800-123-4567.'
  ];

  rules.forEach((rule, idx) => {
    ctx.fillText(rule, 120, 340 + idx * 56);
  });

  // 4. Center QR Code Frame
  const qrBoxX = 337;
  const qrBoxY = 620;
  const qrBoxSize = 350;

  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
  ctx.fill();

  // Draw simulated QR matrix
  ctx.fillStyle = '#0F172A';
  const qrPadding = 30;
  const qrInnerSize = qrBoxSize - qrPadding * 2;
  const matrixCount = 19;
  const cellSize = qrInnerSize / matrixCount;

  // Corner finder patterns
  const drawFinder = (fx, fy) => {
    ctx.fillRect(fx, fy, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(fx + cellSize, fy + cellSize, cellSize * 3, cellSize * 3);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(fx + cellSize * 1.5, fy + cellSize * 1.5, cellSize * 2, cellSize * 2);
  };

  const qx = qrBoxX + qrPadding;
  const qy = qrBoxY + qrPadding;

  drawFinder(qx, qy);
  drawFinder(qx + cellSize * 14, qy);
  drawFinder(qx, qy + cellSize * 14);

  // Decorative dots
  for (let r = 0; r < matrixCount; r++) {
    for (let c = 0; c < matrixCount; c++) {
      if ((r < 6 && c < 6) || (r < 6 && c > 12) || (r > 12 && c < 6)) continue;
      if ((r * 13 + c * 7 + (isVerified ? 3 : 9)) % 3 === 0) {
        ctx.fillRect(qx + c * cellSize, qy + r * cellSize, cellSize * 0.9, cellSize * 0.9);
      }
    }
  }

  // Center QR Badge
  const badgeSize = 74;
  const bx = qrBoxX + qrBoxSize / 2 - badgeSize / 2;
  const by = qrBoxY + qrBoxSize / 2 - badgeSize / 2;

  ctx.fillStyle = isVerified ? '#059669' : '#D97706';
  drawRoundedRect(ctx, bx, by, badgeSize, badgeSize, 16);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px Inter, system-ui, sans-serif';
  ctx.fillText(isVerified ? '✓' : '🔒', 512, by + 47);

  // Text below QR
  ctx.fillStyle = isVerified ? '#A7F3D0' : '#FDE68A';
  ctx.font = 'bold 18px Inter, system-ui, sans-serif';
  ctx.fillText(
    isVerified ? 'SCAN TO VERIFY ACCREDITED CREDENTIALS' : 'LOGIN TO ACTIVATE VERIFIED QR PASS',
    512,
    qrBoxY + qrBoxSize + 45
  );

  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.fillText('Encrypted Aspirant Identity Token • FutureSelector Network', 512, qrBoxY + qrBoxSize + 80);

  // Bottom Notice
  ctx.fillStyle = '#64748B';
  ctx.font = '13px Inter, system-ui, sans-serif';
  ctx.fillText('© 2026 FutureSelector • Fair & Transparent Coaching Admissions', 512, 1310);

  return canvas.toDataURL('image/png');
}
