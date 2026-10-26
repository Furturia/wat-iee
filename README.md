# WAT Worth It? — Vibe Coding Starter Pack

เว็บช่วยเปรียบเทียบงาน Work and Travel โดยดูเงินลงทุนทั้งหมด จุดคุ้มทุน ชั่วโมงทำงานที่ต้องได้ ค่าใช้จ่ายระหว่างอยู่ต่างประเทศ และความเสี่ยงก่อนตัดสินใจสมัคร

## Product direction

- เริ่มจาก personal decision tool สำหรับผู้ใช้ที่กำลังเลือกงาน Summer 2027
- MVP ต้องคำนวณและเปรียบเทียบงานได้จริงก่อน
- ดูรายการงานสาธารณะจาก IEE ได้ โดยจะดึงรายละเอียดเมื่อผู้ใช้เปิดดู
- รองรับการกรอกข้อมูลเองและเตรียมโครงสร้างให้เพิ่ม PDF import ภายหลัง
- ข้อมูลที่ยังไม่รู้ต้องแสดงว่า "ยังไม่ทราบ" ห้าม AI เดาค่าให้เป็นข้อเท็จจริง
- ทุกผลลัพธ์เป็นประมาณการตามสมมติฐาน ไม่ใช่การรับประกันรายได้หรือการคืนทุน

## Suggested stack

ใช้ stack ที่ AI coding tool สร้างและดูแลได้ง่าย:
- Next.js + TypeScript
- Tailwind CSS
- Local storage สำหรับ MVP แบบไม่ต้องมีบัญชีผู้ใช้
- ใช้ไลบรารีกราฟได้เมื่อจำเป็น แต่ห้ามทำกราฟแทนตัวเลขสำคัญ
- ยังไม่ต้องมี backend/database จนกว่าจะมีความจำเป็นจริง

ถ้า repository มี stack อยู่แล้ว ให้ตรวจของเดิมก่อน ห้ามเปลี่ยน stack โดยไม่จำเป็น

## Run locally

1. ติดตั้ง Node.js รุ่น LTS
2. ติดตั้ง dependencies ตาม package manager ของโปรเจกต์
3. รัน development server ตามคำสั่งใน package.json

คำสั่งที่มักใช้กับ Next.js:
```bash
npm install
npm run dev
```

## Build order

1. Dashboard / job comparison
2. Add-edit job form
3. Cost breakdown and currency assumptions
4. Break-even calculator and scenarios
5. Save/reload data locally
6. Import/export JSON
7. PDF import (later)
8. City safety data (later)

## Included files

- `project.md`: product source of truth
- `design.md`: UI/UX principles
- `calculation-spec.md`: calculation definitions and edge cases
- `data-model.md`: suggested TypeScript data model
- `implementation-plan.md`: staged build plan and acceptance criteria
- `AGENTS.md`: instructions for AI coding agents
- `sample-jobs.json`: clearly fictional demo data
- `config/iee-fees-promotions.json`: editable fee, promotion-window, eligibility, and discount rule configuration
- `prompts/first-build-prompt.md`: first prompt to give your coding assistant
# IEE job listings

The dashboard includes an optional browser for public Work & Travel listings from
[IEE Thailand](https://www.ieethailand.com/work-and-travel-new/). Employer listings
are fetched through the app server and refreshed at most every six hours; job
positions and descriptions load when an employer is opened. The app does not
persist the full scraped catalog. A job is saved to the user's local comparison
data only after they choose **เพิ่มเปรียบเทียบ**.

Availability, work dates, hours, and costs are not inferred from the listing.
Ambiguous wage ranges are shown as published but are not entered as a numeric
hourly wage. Always check the linked IEE source before relying on a listing.
The browser requires the deployed app server to be able to reach
`www.ieethailand.com`.
