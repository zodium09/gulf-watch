# Gulf Watch — อ่าวไทยตอนใน

เว็บ production: https://gulf-watch-rouge.vercel.app/

แดชบอร์ดสาธารณะภาษาไทย สำหรับเฝ้าระวังความขุ่นและแพลงก์ตอนบลูมเบื้องต้น พร้อมแผนที่สี สรุปพิกเซลระดับสูง แนวโน้ม 6 วัน ข้อมูลสถานีน้ำท่า CSV และ iframe ใช้ Next.js บน Vercel

## อัปเดตรายวัน

GitHub Actions ใน `.github/workflows/update-data.yml` ทำงานทุกวันประมาณ **07:15 น. Asia/Bangkok** (00:15 UTC) และสั่งรันเองได้ด้วย workflow_dispatch GitHub อาจเริ่มงานช้ากว่าเวลาที่กำหนด

1. Node.js 22 ดึงข้อมูลสาธารณะและคำนวณ ไม่ต้องติดตั้ง npm สำหรับงานข้อมูล
2. ตรวจวันที่ พื้นที่ ความครบถ้วน และคำนวณระดับเฝ้าระวังซ้ำก่อนเขียน `public/data/latest.json`
3. บันทึก `public/data/status.json` และ commit ผลด้วย GITHUB_TOKEN ที่ GitHub จัดให้ มีสิทธิ์ contents:write เฉพาะ repository นี้ ไม่ต้องตั้ง API key ส่วนตัว
4. `/api/forecast` บน Vercel อ่านไฟล์ล่าสุดจาก GitHub ทุกครั้งโดยไม่แคช จึงรับข้อมูลใหม่ได้แม้ไม่มีการ deploy ใหม่ UI ตรวจทุก 5 นาทีเมื่อหน้าเปิดอยู่
5. ถ้าดึงหรือคำนวณไม่สำเร็จ เก็บ snapshot สำเร็จครั้งก่อน รายงานสถานะ failed และให้งาน GitHub แสดงความล้มเหลว ถ้าอ่าน GitHub ไม่ได้ เว็บแสดงชุดสำรองจาก build และป้ายเตือน

ดูการรันที่ https://github.com/zodium09/gulf-watch/actions/workflows/update-data.yml และตั้ง notification ของ GitHub ตามต้องการ ไม่มีระบบส่งข้อความภายนอกเพิ่ม

## ข้อมูลและขอบเขต

- Copernicus Marine `OCEANCOLOUR_GLO_BGC_L3_NRT_009_101`: SPM และ chlorophyll-a ประมาณ 4 กม. มองย้อนหลังไม่เกิน 5 วัน แสดงวันสังเกตจริงทุกจุด
- Open-Meteo Marine: คลื่นและอุณหภูมิผิวน้ำ; Open-Meteo / NOAA GFS: ลม ฝน แสง บริการมีความละเอียดหยาบกว่าดาวเทียม
- Thaiwater/RID: สถานี K.55A, C.35 และ Kgt.3 เป็นอัตราการไหลเหนือน้ำ ณ เวลารายงาน **ยังไม่ใช่ยอดน้ำจืดสุทธิออกปากแม่น้ำ ไม่รวมสถานีเข้าด้วยกัน ไม่ใช้ Q คูณสีความเสี่ยง**
- Natural Earth 1:10 million สำหรับชายฝั่ง (ไม่ใช่ความละเอียด 10 เมตร)

สีเป็นการคัดกรอง **สัมพัทธ์ ความเชื่อมั่นต่ำ ยังไม่สอบเทียบ** แบ่งข้อมูลดาวเทียมเป็น quintile แล้วปรับ 1 ระดับตามสภาพแวดล้อม ไม่ใช่ NTU/FNU โอกาสเกิดเหตุเป็นเปอร์เซ็นต์ หรือการยืนยันชนิดแพลงก์ตอนอันตราย เปอร์เซ็นต์บนแดชบอร์ดคือสัดส่วนพิกเซลที่มีข้อมูล ไม่ใช่สัดส่วนพื้นที่เสียหาย

คงสภาพดาวเทียมตั้งต้นระหว่างพยากรณ์ ยังไม่จำลองการพาตะกอน ความเค็ม สารอาหาร หรือการเติบโตของแพลงก์ตอน เมฆและตะกอนรบกวน chlorophyll ใกล้ฝั่งได้ ข้อมูลขาดไม่แทนด้วยศูนย์

## พัฒนาและตรวจสอบ

```sh
npm ci
npm run dev
npm run update:data
npm test
npm run build
```

เปิด http://127.0.0.1:5174 ใช้ Node.js >=22.13 ไม่มี environment secrets ที่จำเป็นสำหรับ public read เชื่อม repository นี้กับ Vercel เลือก Next.js, production branch `main`, region Singapore ไม่ต้อง provision database

## ฝังในเว็บไซต์

ใช้ production URL เดิมได้ทุกวัน:

```html
<iframe src="https://gulf-watch-rouge.vercel.app/?embed=1" title="Gulf Watch — อ่าวไทยตอนใน" width="100%" height="1080" style="border:0;border-radius:16px" loading="lazy"></iframe>
```

มุมมอง embed มีวันที่ข้อมูลและระดับความเชื่อมั่น ไม่มี X-Frame-Options ที่ปิดการฝัง

## ใบอนุญาตข้อมูล

ข้อมูลสาธารณะยังอยู่ภายใต้เงื่อนไขผู้ให้บริการ ตรวจ Copernicus Marine, Open-Meteo, Thaiwater และ Natural Earth ก่อนใช้งานเชิงพาณิชย์ ฟอนต์ IBM Plex Sans Thai แนบ OFL ไว้ใน `public/fonts/OFL.txt`

