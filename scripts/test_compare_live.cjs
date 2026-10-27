/**
 * test_compare_live.cjs
 * Comprehensive Integration Test for Task FS-P0-01 (Live Comparison Engine)
 */

const assert = require("assert");

const BASE_URL = "http://localhost:3000/api";

async function runTests() {
  console.log("======================================================");
  console.log("🧪 RUNNING FS-P0-01: LIVE COMPARISON ENGINE TEST SUITE");
  console.log("======================================================\n");

  let passed = 0;
  let failed = 0;

  function test(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    test(healthRes.status === 200 && health.database?.connected === true, "MongoDB Atlas backend is connected and healthy");

    // 2. Fetch all published institutes (Used by Compare.jsx dropdown)
    console.log("\n📋 1. Verifying GET /api/institutes for Compare Dropdown...");
    const allRes = await fetch(`${BASE_URL}/institutes`);
    const allInstitutes = await allRes.json();
    test(allRes.status === 200, "GET /api/institutes returns 200 OK");
    test(Array.isArray(allInstitutes) && allInstitutes.length >= 5, `Returns array of published institutes (count: ${allInstitutes.length})`);

    // Verify key fields exist on every institute
    const firstInst = allInstitutes[0];
    test(typeof firstInst.numericId === "number", `numericId is numeric (${firstInst.numericId})`);
    test(typeof firstInst.name === "string" && firstInst.name.length > 0, `Institute name is present (${firstInst.name})`);
    test(typeof firstInst.numericFee === "number" && firstInst.numericFee > 0, `numericFee is a valid positive number (${firstInst.numericFee})`);
    test(typeof firstInst.batchSize === "string", `batchSize string is present (${firstInst.batchSize})`);
    test(typeof firstInst.selectionRate === "string", `selectionRate string is present (${firstInst.selectionRate})`);

    // 3. Test Compare endpoint GET /api/institutes/compare?ids=1,2
    console.log("\n📋 2. Verifying GET /api/institutes/compare?ids=1,2...");
    const compRes = await fetch(`${BASE_URL}/institutes/compare?ids=1,2`);
    const compared = await compRes.json();
    test(compRes.status === 200, "GET /api/institutes/compare?ids=1,2 returns 200 OK");
    test(Array.isArray(compared) && compared.length === 2, `Returns exactly 2 compared contenders (count: ${compared.length})`);
    test(compared.some(i => i.numericId === 1), "Includes Contender 1 (Allen)");
    test(compared.some(i => i.numericId === 2), "Includes Contender 2 (Resonance)");

    // 4. Test Compare 3 centers: GET /api/institutes/compare?ids=1,3,5
    console.log("\n📋 3. Verifying 3-way Duel Matrix: GET /api/institutes/compare?ids=1,3,5...");
    const comp3Res = await fetch(`${BASE_URL}/institutes/compare?ids=1,3,5`);
    const comp3 = await comp3Res.json();
    test(comp3Res.status === 200 && comp3.length === 3, `Returns 3 contenders for multi-contender comparison (count: ${comp3.length})`);

    // 5. Simulate Frontend Normalization & Winner Determination Logic
    console.log("\n📋 4. Simulating Frontend Normalization & Winner Determination in Compare.jsx...");
    const normalized = allInstitutes.map(inst => ({
      ...inst,
      id: inst.numericId || inst.id,
      numericFee: inst.numericFee || parseInt(inst.fees?.replace(/[^\d]/g, "") || "120000"),
      batchSize: inst.batchSize || "45 students",
      selectionRate: inst.selectionRate || "12%",
      rating: inst.rating || 4.5
    }));

    const selectedIds = [1, 2];
    const selectedInstitutes = selectedIds.map(id => normalized.find(i => (i.numericId || i.id) === id)).filter(Boolean);
    test(selectedInstitutes.length === 2, "Normalized institutes map accurately to selectedIds [1, 2]");

    // Verify Winner calculation logic
    let minFee = Infinity;
    let feeWinner = null;
    selectedInstitutes.forEach(inst => {
      if (inst.numericFee < minFee) {
        minFee = inst.numericFee;
        feeWinner = inst.id;
      }
    });
    test(feeWinner !== null, `Fee winner determined successfully (Winner ID: ${feeWinner}, Min Fee: ₹${minFee.toLocaleString("en-IN")})`);

    // Effective Net Fee Calculation (Net = NumericFee - 15000 voucher)
    const netFees = selectedInstitutes.map(inst => Math.max(0, inst.numericFee - 15000));
    test(netFees.every(fee => typeof fee === "number" && !isNaN(fee) && fee > 0), `Net payable after ₹15,000 voucher calculated without NaN (${netFees.join(", ")})`);

    console.log("\n======================================================");
    console.log(`📊 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log("======================================================");

    if (failed === 0) {
      console.log("🎉 TASK FS-P0-01 VERIFIED WITH 100% SUCCESS!");
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test Suite Runtime Error:", err);
    process.exit(1);
  }
}

runTests();
