# Empira: Teacher Demo Guide (8-sinf Fizika)

The demo runs at **https://test.empira.uz** on any laptop or phone with internet.

- **Content:** the real 8-sinf Fizika textbook (2019): 5 chapters, 60 topics, and **10 interactive 3D labs**, one for every lab work and practical in the book.
- **Scanning:** **real**. The photo goes to Gemini, which reads the page, and Empira opens the matching topic and lab. This needs the Gemini key to be set (see §9).

---

## 1. What you need

- A laptop with **Chrome or Edge**, connected to the projector at 100 % zoom.
- The **8-sinf Fizika textbook**, opened at **61-bet** (19-§ «Laboratoriya ishi. Om qonunini o‘rganish»).
- *(Backup)* A clear photo of that page saved on the laptop.
- *(Optional)* A phone with internet.

## 2. Before the teachers arrive (10 minutes)

1. Open **test.empira.uz** and do a private rehearsal: run the whole script once, and allow camera access when Chrome asks.
2. **Test one scan** of page 61. It should show *19-§ · Om qonunini o‘rganish*.
3. Go back to Home, put the window on the projector, and press F11 for full screen if you like.

## 3. The demo script (about 4 minutes)

| # | You do | Teachers see / you say |
|---|---|---|
| 1 | Show **Home** | "Ikki yo‘l bor: sinfni tanlash yoki kitobni skanerlash." (Two ways in: choose a class or scan the book.) |
| 2 | Tap **8-sinf** | The real annual plan from the textbook: 5 chapters, 60 topics, 10 with a 3D lab. **Fizika** is already selected. |
| 3 | Point to the **"Shu hafta"** row | "Bu haftaning mavzusi: Om qonunini o‘rganish." (This week's topic: studying Ohm's law.) |
| 4 | Tap it, then **"3D laboratoriyani ochish"** | "Laboratoriya yuklanmoqda…" (Loading the lab…), then the Ohm's law circuit: power supply, switch, milliammeter, resistor, voltmeter |
| 5 | **Kalitni ulash** (Close the switch) at 4 V → move U to 6, 8, 10 V → **Kalitni ulash** each time | I = 20 → 30 → 40 → 50 mA, R = 200 Ω every time. After 4 voltages, **Rₒ‘ᵣₜ** (average R) appears. "Kuchlanish ortsa, tok ham ortadi — qarshilik o‘zgarmaydi." (Voltage up, current up; resistance stays the same.) |
| 6 | Tap **"Keyingi mavzu"** at the bottom of the panel | 20-§ Reostat practical. Optionally open its lab too. |
| 7 | **←** back, then the **Empira logo** | Home |
| 8 | Tap **"Kitobni skanerlash"** → **"Kamera orqali skanerlash"**. Hold page 61 flat, about 30 cm from the webcam, and press **"Suratga olish"** (Take photo). | "Sahifa aniqlanmoqda…" (Identifying the page…), then **Mavzu topildi**: 8-sinf · Fizika · Om qonunini o‘rganish |
| 9 | Tap **"3D laboratoriyani ochish"** | The same lab opens. "Kitobdan to‘g‘ridan-to‘g‘ri laboratoriyaga." (Straight from the book to the lab.) |

**Webcam backup:** if the camera doesn't open, tap **"Rasm yuklash"** (Upload a photo) and choose the saved photo.

**Other good pages to scan** (each opens a lab):

| Page | Lab |
|---|---|
| 24 | Elektr shamoli (6-§) |
| 46 | Zanjir yig‘ish (14-§) |
| 63 | Reostat (20-§) |
| 71 | Tok manbalarini ulash (23-§) |
| 72–74 | Ketma-ket / parallel ulash (24-§). Shows both labs. |
| 96 | Lampochka quvvati (33-§) |
| 142 | Magnitlar ta’siri (49-§) |
| 161 | Elektromagnit (58-§) |

Any other page of the book opens its topic, marked "Tez orada" (Coming soon).

## 4. The 10 labs

| § | Lab | What to show |
|---|---|---|
| 6 | Elektr shamolini kuzatish | Turn the electrophore machine; the candle flame bends away from the point. Closer and faster mean more bending. |
| 14 | Zanjir yig‘ish | Move the ammeter: I stays the same. Voltmeter on L₁, L₂ and both: U = U₁ + U₂. |
| 19 | Om qonuni | 4 → 10 V: I grows, R = U/I stays 200 Ω. |
| 20 | Reostat | Slider positions 1–4: current 0,31 → 1,00 A. |
| 23 | Tok manbalarini ulash | Each cell is about 1,5 V; three in series give 4,52 V. |
| 24 | Ketma-ket ulash | Same current everywhere; U₁ + U₂ = Uᴬᴮ. |
| 24 | Parallel ulash | Same voltage; I₁ + I₂ = I. |
| 33 | Lampochka quvvati | P = I·U, stopwatch, W = I·U·t, 3 repeats → Pₒ‘ᵣₜ ≈ the lamp's rating "3,5 V; 0,26 A". |
| 49 | Magnitlar ta’siri | Dynamometer: attraction vs repulsion, and the force grows as the distance shrinks. |
| 58 | Elektromagnit | Compass deflection grows with current and an iron core, and falls with distance. |

## 5. Running it on a phone

Open **test.empira.uz** in the phone browser. On the scanner, **"Kamera orqali skanerlash"** opens the phone's own camera: shoot the page and confirm.

## 6. Presenter scan mode (backup only)

Use this only if live scanning fails, for example because of no internet or a missing key.

1. Open `test.empira.uz/design-prototype/scan/index.html?taqdimot=1` **before projecting**.
2. A chooser with the 9 lab topics appears under the scan buttons. Tap one, or press **1–9** on the keyboard. The next scans "find" that topic without calling Gemini.
3. To turn it off: open the same address with `?taqdimot=0`, or close the window.

> ⚠️ The chooser is visible on the scanner screen while presenter mode is on.

## 7. If something goes wrong

| Problem | Do this |
|---|---|
| Lab stays on "Laboratoriya yuklanmoqda…" for more than 5 s | Reload (⌘R / Ctrl+R) |
| "Kamera ochilmadi" (Camera didn't open) | **"Rasm yuklash"** + the saved photo |
| "Mavzu topilmadi" (Topic not found) | Hold the page flat and in good light, with the page number and heading fully in frame. Then **Qayta skanerlash** (Scan again). |
| "Skanerlash xizmati hozir javob bermadi" (The scanning service didn't respond) | No internet, or the key isn't set. Use presenter mode (§6) or choose by class. |
| No internet at all | Open `Desktop/empira/design-prototype/home/index.html` on the laptop. Labs work offline; scanning is then simulated. |

## 8. What not to promise

- Only **8-sinf Fizika** is complete. The other grades are not ready yet.
- 10 of 60 topics have a 3D lab; the rest are "Tez orada".
- "Shu hafta" is a demo setting (week 10), not the school calendar yet.
- Weeks in the annual plan are approximate (2 lessons a week) until the official yearly plan is added.

## 9. One-time setup: the Gemini key (developer)

In Vercel → project **empiratest** → **Settings → Environment Variables**, add:
- `GEMINI_API_KEY` = your Google AI Studio key (Production + Preview)
- *(optional)* `GEMINI_MODEL` = the Gemini model to use (default `gemini-2.5-flash`)

Then redeploy. Until the key is set, live scans show "Skanerlash xizmati hozir javob bermadi".
