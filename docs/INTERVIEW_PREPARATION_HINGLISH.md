# FutureSelector — SDE & Full-Stack Developer Interview Preparation Guide

> **Document Version:** 1.0.0  
> **Target Audience:** CSE Students, Junior-to-Mid SDE Aspirants, Pair Programming Engineers  
> **Language:** Professional Technical Hinglish (Simple, Natural, Interview-Ready)  

---

## 1. The 60-Second Elevator Pitch (Interview Intro)

> *"FutureSelector ek full-stack MERN platform hai jo Indian competitive exam aspirants (JEE & NEET) ko transparent coaching discovery, verified fee comparison, aur ₹15,000 direct admission assistance provide karta hai.*  
>  
> *Is project me maine teen interconnected user roles develop kiye hain: Student, Coaching Partner, aur Super Admin.*  
>  
> *Technically, is platform me 4 standout features hain:*  
> *1. **Privacy Shield Architecture**: Student ka mobile number coaching center ko tab tak visible nahi hota jab tak wo explicit digital consent na de.*  
> *2. **Razorpay Live Payment Integration**: 1-on-1 Kota counseling booking with cryptographic HMAC SHA256 signature verification.*  
> *3. **3-Way Grievance Redressal (RMS)**: State machine loop connecting Student, Center Manager, aur Super Admin.*  
> *4. **B2B Escrow Commission Ledger**: 4-point offline admission verification jo duplicate claims ko block karti hai aur 15 din ka escrow lock enforce karti hai.*  
>  
> *Backend Express 5.2 aur Mongoose 9.11 par built hai connected to MongoDB Atlas, aur frontend React 19, TailwindCSS aur Framer Motion par based hai."*

---

## 2. Technical Architecture & Design Decisions Explained

### Q1: "Aapne authentication kaise architect kiya hai? Teen roles me session collision kaise prevent kiya?"
**Answer in Hinglish**:
- *"Maine client aur server dono levels par strict role segregation follow kiya hai.*
- *Standard single-token applications me problem aati hai ki agar ek admin same browser me student portal test karta hai, toh admin token student session ko overwrite kar deta hai.*
- *Maine `localStorage` me teen isolated keys rakhi hain:*
  - *Student: `fs_token`*
  - *Partner: `fs_partner_token`*
  - *Super Admin: `fs_admin_token`*
- *Hamara frontend API client (`api.js`) request interceptor use karta hai. Agar URL `/api/partner` se shuru hota hai, toh wo automatically partner token lagata hai; agar `/api/admin` hai, toh admin token bhejta hai.*
- *Backend par teen distinct Express middlewares hain (`studentAuth.js`, `partnerAuth.js`, `adminAuth.js`). Har middleware JWT signature verify karne ke sath role claim aur status check karta hai. For example, agar admin ne institute ko suspend kar diya, toh `partnerAuth` middleware database query karke active token ko bhi immediately 403 Forbidden return kar deta hai."*

---

### Q2: "Privacy Shield aur IDOR Protection ko explain karo."
**Answer in Hinglish**:
- *"Indian coaching ecosystem me sabse badi complaint hoti hai spam calls. Student form bharta hai aur 10 centers usse call karne lagte hain.*
- *FutureSelector me student jab inquiry submit karta hai, toh `Lead` document create hota hai with `status: 'PENDING_CONFIRMATION'` aur `releasedToInstitute: false`.*
- *Partner portal API endpoint (`GET /api/partner/leads`) database me query lagata hai:*
  ```javascript
  Lead.find({
    instituteNumericId: req.partner.instituteNumericId,
    releasedToInstitute: true
  });
  ```
- *Isse do baatein guarantee hoti hain:*
  1. **Consent Gate**: Student ka phone number coaching partner ko tab tak nahi dikhta jab tak wo seat lock karte waqt explicit consent checkbox check na kare. Jab wo consent deta hai, hum client ka IP address, timestamp aur consent text version database me log karte hain.
  2. **IDOR (Insecure Direct Object Reference) Immunity**: Partner token me institute ID cryptographically signed hoti hai. Ek coaching center (jaise Allen) doosri coaching (jaise Resonance ya Apex) ke student leads ko kabhi access nahi kar sakta kyunki query automatically partner ke center ID par scope ho jati hai."*

---

### Q3: "Razorpay Payment Gateway ka flow technical depth me samjhao."
**Answer in Hinglish**:
- *"Hamara counseling booking flow two-step cryptographic verification model use karta hai:*
  1. **Order Creation (`POST /api/counselling/create-order`)**:
     - Student jab slot select karta hai, client server ko request bhejta hai.
     - Server Razorpay SDK ke through server-side order create karta hai (`razorpay.orders.create({ amount: 1100, currency: 'INR' })`).
     - Server response me client ko `order_id` aur public `key_id` bhejta hai.
  2. **Client Checkout**:
     - Client browser me official Razorpay Checkout modal khulta hai. Student UPI/Card se ₹11 pay karta hai.
  3. **Payment Verification (`POST /api/counselling/verify-payment`)**:
     - Razorpay modal success callback me teen parameters return karta hai: `razorpay_order_id`, `razorpay_payment_id`, aur `razorpay_signature`.
     - Client ye credentials hamare backend endpoint par bhejta hai.
     - **HMAC SHA256 Signature Verification**: Server Node.js `crypto` module use karke generated signature calculate karta hai:
       ```javascript
       const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
       hmac.update(orderId + "|" + paymentId);
       const generatedSignature = hmac.digest("hex");
       ```
     - Agar `generatedSignature === razorpay_signature`, tabhi payment authentic mani jati hai.
     - Iske baad MongoDB me `Counselling` booking record banta hai with status `COMPLETED`, aur Nodemailer background me student aur academic desk ko confirmation email dispatch karta hai."*

---

### Q4: "4-Point Admission Verification aur 15-Day Escrow Commission Ledger kya hai?"
**Answer in Hinglish**:
- *"FutureSelector ka B2B revenue model offline coaching admissions par commission earn karna hai.*
- *Problem: Coaching center bol sakta hai ki student pass lekar nahi aaya, ya duplicate commission claim kar sakta hai.*
- *Solution: Maine ek 4-point verification state engine design kiya:*
  1. **Voucher Validation**: Student admission counter par voucher ID (e.g. `FS-SEAT-8492`) deta hai.
  2. **Partner Reporting**: Center receptionist partner portal se admission report karti hai with fee receipt number (`REC-APEX-1049`), receipt amount, aur date.
  3. **Super Admin 4-Point Audit**: Super Admin receipt aur bank transaction match karta hai.
  4. **Ledger & Escrow**: Jaise hi admin verify karta hai, system automatically `CommissionLedger` document create karta hai. Commission status immediately `PAID` nahi hota—wo **`ESCROW_LOCKED`** status me chala jata hai for 15 days.
  - 15 din ka escrow isliye zaroori hai kyunki Kota coaching me 15-day refund policy hoti hai. Agar student batch pasand na aane par refund le leta hai, toh commission cancel ho jata hai. Agar 15 din tak koi grievance raise nahi hoti, toh commission `ELIGIBLE_FOR_PAYOUT` ban jata hai aur Admin payout authorize karta hai.
  - System me duplicate check implemented hai: agar same voucher code par dubara verification attempt ho, toh system HTTP 400 return karke double commission creation ko block kar deta hai."*

---

### Q5: "Aapne relational DB (PostgreSQL) ke bajaye MongoDB (NoSQL) kyun choose kiya?"
**Answer in Hinglish**:
- *"Do main reasons the:*
  1. **Flexible Coaching Data Hierarchy**: Har coaching center ka data structure alag hota hai. Kuch centers me hostel integrated hota hai, kuch me nahi hota; batches me alag-alag scholarship tiers hote hain; faculties ki detailed history hoti hai. MongoDB ke document model me hum nested arrays (jaise `batches`, `faculties`, `feeStructure`) ko single query me read kar sakte hain without expensive multi-table SQL joins.
  2. **Speed of Prototyping & JSON Alignment**: Client SPA React 19 me build hai. MongoDB ka native BSON format Express ke JSON responses ke sath 1-to-1 seamlessly align hota hai.
- **Trade-off Acknowledgement**: MongoDB me relational integrity enforce karne ke liye hume application layer par constraints (unique compound indexes aur transactional middleware) build karne pade, jaise unique index on `{ phone: 1 }`, `{ voucherId: 1 }`, aur `{ numericId: 1 }`."*

---

### Q6: "System ko 100,000 Daily Active Users (DAU) par scale karne ke liye aap kya changes karenge?"
**Answer in Hinglish**:
- *"Current monolithic Node.js backend ko scale karne ke liye 4 immediate improvements karunga:*
  1. **Redis Caching Layer**: Coaching search (`GET /api/institutes`) aur comparison queries mostly read-heavy hoti hain. Inhe Redis me 15-minute TTL ke sath cache karenge taaki MongoDB par read load 80% kam ho jaye.
  2. **Message Queue for Async Tasks (BullMQ / RabbitMQ)**: Email sending (Nodemailer), SMS dispatch, aur audit logging ko asynchronous background workers me move karenge taaki HTTP request-response cycle fast rahe (<50ms).
  3. **Database Read Replicas**: MongoDB Atlas cluster me read-write split implement karenge—write operations primary node par jayenge aur search/filter queries read secondaries par distribute hongi.
  4. **Horizontal Scaling with Load Balancer**: Stateless Express instances ko Docker containerize karke AWS ECS ya Kubernetes par deploy karenge with an Nginx / AWS ALB load balancer."*
