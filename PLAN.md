[MODE: developer]
โปรดดำเนินการแก้ไขข้อผิดพลาด ปรับปรุงระบบตามมาตรฐาน Data Provenance และแก้ปัญหาการดึงข้อมูลบน Production (Vercel / Netlify) ตามรายละเอียดด้านล่างนี้ โดยดำเนินการทีละขั้นตอนและตรวจสอบผลลัพธ์ให้ผ่านทุกคำสั่ง:

---

### 1. แก้ไขปัญหาการดึงข้อมูลบน Production ด้วย Local Snapshot Approach
1. สร้างไฟล์สคริปต์ `scripts/sync-iee.mjs` เพื่อดึงข้อมูลตำแหน่งงานของทั้ง 74 นายจ้างจาก `https://www.ieethailand.com/work_and_travel_2/{slug}/` โดยอ่านรายชื่อจาก `src/data/iee-listings-snapshot.json`
2. รันคำสั่ง `node scripts/sync-iee.mjs` เพื่อเซฟข้อมูลตำแหน่งงานทั้งหมดลงใน `src/data/iee-positions-snapshot.json`
3. แก้ไข `src/app/api/iee-jobs/[slug]/route.ts`:
   - พยายาม live fetch ก่อน (สำหรับ localhost)
   - หาก live fetch ล้มเหลว (เกิดบน Vercel/Netlify เพราะโดนบล็อก IP) ให้ fallback ไปอ่านข้อมูลตำแหน่งงานจริงของ slug นั้นจาก `src/data/iee-positions-snapshot.json` ทันที แทนการใช้ fallback position ปลอม

---

### 2. ปลดล็อก Blockers & ป้องกันการ Fabricate ข้อมูลการเงิน
1. ใน `src/lib/iee-real-jobs.ts`:
   - ลบตัวเลขสมมุติที่กุขึ้นเองออกทั้งหมด: ค่าตั๋วเครื่องบินให้กำหนด `amount: undefined`, ค่าใช้จ่ายรายสัปดาห์ (`weeklyCosts`) ให้เป็น `[]`, `refundableDepositsUSD: undefined`, `emergencyReserveUSD: undefined`
   - ลบคะแนนความปลอดภัยสมมุติ (4.1/5) ออก
2. ใน `src/components/IEEJobsBrowser.tsx`:
   - ใน `parseHourlyWage`: หาก parse ไม่ได้หรือไม่พบตัวเลขค่าจ้าง ให้คืนค่าเป็น `undefined` (ห้าม fallback เป็น 16.0)
   - ใน `makeJobOffer`: ห้าม auto-inject ตั๋วบิน 36,000 บ., ที่พัก $120, อาหาร $80, มัดจำ และสำรอง ให้คงเป็น `undefined` เพื่อให้ผู้ใช้กรอกตามจริง
3. ใน `src/app/page.tsx`:
   - หน้าแรกไม่ต้องบังคับโหลดงานจริงหรือข้อมูลสมมุติ ให้เริ่มต้นเป็นหน้าเปล่า (Empty State) เพื่อให้ผู้ใช้เลือกเพิ่มงานหรือกดโหลดงานจริงด้วยตนเอง

---

### 3. แก้ไข Major Issues (การแสดงผลตัวเลขและการผูก Config)
1. ใน `src/components/JobTableView.tsx` และ `src/components/JobDetailModal.tsx`:
   - ตรวจสอบ `ev?.isComplete` ก่อนแสดงผล "เงินเหลือสุทธิ" (Net Return) และ "เงินสดก่อนบิน"
   - ห้ามแสดงตัวเลขกำไรหากข้อมูลต้นทุนยังไม่ครบ (เช่น ยังไม่ได้ระบุค่าตั๋วบิน) โดยให้แสดงข้อความ "รอระบุเพิ่ม" แทน
2. ใน `src/components/FeeRulesModal.tsx`:
   - แก้ไขตารางเปรียบเทียบค่าธรรมเนียม 4 กลุ่มงาน ให้ดึงค่าจาก `feeConfig.groupTypes[key].fees` และ `knownFixedFeeSubtotalTHB` แบบ Dynamic แทนการพิมพ์ตัวเลข Hardcode ใน JSX

---

### 4. ลบ Default Values ทางการเงินในฟอร์ม (`src/components/JobModal.tsx`)
1. ใน `QuickAddForm`:
   - เปลี่ยนค่าเริ่มต้นของ State: `hourlyWage`, `expectedHours`, `airfareTHB`, `housingUSD`, `foodUSD` ให้เป็นค่าว่าง `""` ทั้งหมด
2. ใน `DetailedForm`:
   - เปลี่ยนค่าเริ่มต้น: `hourlyWageUSD`, `expectedHours`, `depositsUSD`, `reserveUSD` ให้เป็น `""`
   - ค่า `weeklyCosts` ให้เริ่มต้นเป็นอาเรย์ว่าง `[]` แทนการใส่ housing $120 และ food $80

---

### 5. จัดการ Scope Creep (ถอด Safety Score ออก)
1. ใน `src/types/index.ts`:
   - ถอด `SafetyLevel`, `SafetyAssessment` (คะแนน 1–5 ดาว) และถอด `"safety_desc"` ออกจาก `SortMetric`
   - ใน `JobOffer`: ให้มีเฉพาะ `citySafetyNotes?: string` (สำหรับเก็บข้อความ Textarea)
2. ใน `src/app/page.tsx`, `src/components/JobCard.tsx`, `src/components/JobTableView.tsx`, `src/components/GlobalControls.tsx`:
   - ถอด Badge และ Dropdown เรียงลำดับตามความปลอดภัยออก
   - เหลือไว้เพียงส่วนแสดงข้อความบันทึกความปลอดภัยของเมืองหากมีการระบุไว้
3. ใน `src/lib/formatters.ts`: ลบฟังก์ชัน `getSafetyBadge` ออก

---

### 6. เพิ่ม Schema Validation สำหรับการ Import JSON
1. ใน `src/components/ExportImportModal.tsx`:
   - สร้างฟังก์ชัน `validateImportedJobs(jobs: any[])` ตรวจสอบความถูกต้องของแต่ละเรคคอร์ดก่อน Import
   - ต้องตรวจสอบว่ามี `id`, `employerName`, `jobTitle`, `jobGroupType`, `availabilityStatus` และมี `oneTimeCosts`, `weeklyCosts` เป็น Array ที่ถูกต้อง
   - หากข้อมูลผิดพลาด ให้ปฏิเสธการ Import และแสดงข้อความแจ้งเตือนที่ชัดเจน

---

### 7. เพิ่ม Unit Test Edge Cases (`src/lib/calculations.test.mjs`)
เพิ่มเทสต์เคสครอบคลุมกรณีผิดปกติ:
1. `calculateDateDuration`: วันเริ่มงานเท่ากับวันสิ้นสุดงาน (`startDate === endDate`) ต้องได้ 1 วัน, `isValid: true`
2. `calculateDateDuration`: สตริงวันที่ผิดรูปแบบ ต้องได้ `isValid: false`
3. `evaluateJobOffer`: ค่าจ้างเป็น 0 หรือติดลบ ต้องรายงานว่าข้อมูลไม่ครบ (`isComplete: false`)
4. `evaluateJobOffer`: ชั่วโมงทำงานเป็น 0 หรือไม่ระบุ ต้องได้ `isComplete: false`
5. `evaluateJobOffer`: อัตราหักภาษีเกิน 1.0 หรือติดลบ ต้องถูก clamp ให้อยู่ในช่วง 0.0 - 1.0
6. `evaluateJobOffer`: ทดสอบการคำนวณสถานการณ์จำลอง (Scenarios: low, expected, high)

---

### 8. Clean up Code
- ค้นหาและลบคำสั่ง `console.log` ที่หลงเหลือทั้งหมดใน `src/components/IEEJobsBrowser.tsx`, `src/app/api/iee-jobs/route.ts`, `src/app/api/iee-jobs/[slug]/route.ts` และ `src/app/page.tsx`

---

### 9. การตรวจสอบผลลัพธ์ (Verification)
เมื่อแก้ไขเสร็จสิ้น ให้รันคำสั่งตรวจสอบ:
1. `node --test` — เพื่อยืนยันว่าทุก Unit Test ผ่าน 100%
2. `npm run lint` — เพื่อยืนยันว่าไม่มี Lint errors และ TypeScript Type errors หลงเหลือ
3. รายงานสรุปรายการไฟล์ที่แก้ไขและผลการรันคำสั่งทั้งหมด