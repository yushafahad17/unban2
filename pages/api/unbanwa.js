import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import PhoneNumber from "awesome-phonenumber";

export default async function handler(req, res) {
  const { nomor } = req.query;

  if (!nomor) return res.status(400).json({ status: false, message: "Nomor tidak ditemukan." });

  const num = nomor.replace(/[^0-9]/g, "");
  const nomorFix = num.startsWith("08") ? num.replace("08", "62") : num;

  let phone = new PhoneNumber("+" + nomorFix);
  if (!phone.isValid())
    return res.status(400).json({ status: false, message: "Nomor tidak valid secara internasional." });

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto("https://www.whatsapp.com/contact/noclient/", { waitUntil: 'domcontentloaded' });

    const jazoest = await page.$eval('input[name="jazoest"]', el => el.value);
    const lsd = await page.$eval('input[name="lsd"]', el => el.value);
    const action = await page.$eval('form', form => form.action);

    const email = "aetherscode@gmail.com";
    const internationalNumber = phone.getNumber("international");

    const alasan = [
      `Halo tim WhatsApp, nomor saya ${internationalNumber} tidak bisa digunakan. Saya yakin tidak melanggar kebijakan manapun. Mohon dipulihkan.`,
      `Nomor saya ${internationalNumber} tiba-tiba diblokir, padahal tidak digunakan untuk spam atau pelanggaran. Mohon bantuannya.`,
      `Saya pengguna aktif WhatsApp. Nomor saya ${internationalNumber} diblokir secara tiba-tiba. Mohon untuk dikaji ulang dan diaktifkan kembali.`,
      `Saya tidak sengaja melanggar ketentuan. Mohon buka blokir untuk nomor ${internationalNumber}. Saya tidak akan mengulanginya lagi.`,
    ];

    const formData = new URLSearchParams();
    formData.append("jazoest", jazoest);
    formData.append("lsd", lsd);
    formData.append("step", "submit");
    formData.append("country_selector", "INDONESIA");
    formData.append("phone_number", internationalNumber);
    formData.append("email", email);
    formData.append("email_confirm", email);
    formData.append("platform", "ANDROID");
    formData.append("your_message", alasan[Math.floor(Math.random() * alasan.length)]);

    const response = await page.evaluate(async (url, body) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
      return await res.text();
    }, action, formData.toString());

    await browser.close();

    if (response.includes("Kami telah menerima pesan Anda") || response.includes('"payload":true')) {
      res.json({ status: true, message: "Permintaan unban berhasil dikirim. Tunggu 1-3 hari kerja." });
    } else {
      res.json({ status: false, message: "Gagal mengirim permintaan. Struktur mungkin berubah." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
  }
}
