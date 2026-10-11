# Empira: Teacher Demo Guide

The demo runs at **https://test.empira.uz** on any laptop or phone with internet. Scanning is **simulated**: a fresh browser window always "detects" **Nyutonning ikkinchi qonuni** on the first scan. The demo uses that: you open Newton's 2nd law from the annual plan, then scan the same topic's textbook page and Empira finds that same topic and lab, as the MVP plan's ideal demo describes.

---

## 1. What you need

- A laptop with **Chrome or Edge**, connected to the projector at 100 % zoom.
- The 8-sinf Fizika textbook, open at the **Nyutonning ikkinchi qonuni** page.
- *(Backup)* A photo of that same page saved on the laptop desktop.
- *(Optional)* A phone with internet (see §5).
- **Internet** to open test.empira.uz. *(No internet? Use the offline backup in §7.)*

## 2. Before the teachers arrive (10 minutes)

1. Do a **private rehearsal** in one window: run the whole script once. Allow camera access when Chrome asks.
2. **Close that window completely.** Each scan moves the mock to the next topic, so the real demo must start fresh.
3. Open a **new window** and go to **test.empira.uz**. It opens Home automatically.
4. Put the window on the projector. Press F11 for full screen if you like.
5. Don't open any other Empira tabs. Use this one window for the whole demo.

## 3. The demo script (about 3 minutes)

| # | You do | Teachers see / you say |
|---|---|---|
| 1 | Show **Home** | "Ikki yo‘l bor: sinfni tanlash yoki kitobni skanerlash." (Two ways in: choose a class or scan the book.) |
| 2 | Tap **8-sinf** | The annual plan. **Fizika** is already selected. |
| 3 | Point to the **"Shu hafta"** row at the top | "Bu haftaning mavzusi shu yerda turadi." (This week's topic is right here.) |
| 4 | Tap the **Shu hafta** row | Topic page: short explanation, formula F = m·a, lab card |
| 5 | Tap **"3D laboratoriyani ochish"** | A short "Laboratoriya yuklanmoqda…" (Loading the lab…), then the cart lab |
| 6 | Move **Kuch, F** to 1,0 → **Boshlash** → move F to 2,0 → **Boshlash** | Measurements: a = 1,0 → 2,0 m/s². "Kuch 2 marta oshdi — tezlanish ham 2 marta oshdi." (Force doubled, so acceleration doubled.) |
| 7 | **←** (top left), then the **Empira logo** | Back to the topic, then Home |
| 8 | Tap **"Kitobni skanerlash"** | The scanner |
| 9 | Laptop: tap the big **"Kamera orqali skanerlash"** tile. Hold the page flat, about 30 cm from the webcam, and press **"Suratga olish"** (Take photo). | "Sahifa aniqlanmoqda…" (Identifying the page…), then **Mavzu topildi**: 8-sinf · Fizika · Nyutonning ikkinchi qonuni · Aravachaning tezlanishi |
| 10 | Tap **"3D laboratoriyani ochish"** | The same cart lab opens. "Kitobdan to‘g‘ridan-to‘g‘ri laboratoriyaga." (Straight from the book to the lab.) |

**Webcam backup:** if the camera doesn't open, tap **"Rasm yuklash"** (Upload a photo) and choose the saved photo of the page. The result is the same.

## 4. Rules that keep the demo correct

- **Scan only once per window.** Scans cycle Newton → Guk → Om. A second scan in the same window will "find" Guk qonuni. To scan again, close the window and open a fresh one.
- **Stay in 8-sinf.** The other grades show "Bu sinfning yillik rejasi prototipda hali yo‘q" (This grade's plan isn't in the prototype yet), which is honest but breaks the flow.
- Topics marked **"Tez orada"** (Coming soon) open a simple "laboratoriya hali mavjud emas" (lab not available yet) page. Showing one is fine, and it shows Empira is honest.
- In a lab, **"Keyingi mavzu"** (Next topic) at the bottom of the right panel goes to the next topic in the plan.

## 5. Running it on a phone (optional)

1. On the phone, open a **new tab** and go to **test.empira.uz**.
2. On the scanner, **"Kamera orqali skanerlash"** opens the phone's own camera: shoot the page and confirm.
3. The same rule applies: one scan per fresh tab.

## 6. Presenter scan mode (private backup only)

Use this only if you want to scan a **different** prepared page: Guk qonuni or Om qonuni.

1. **Before projecting**, open `test.empira.uz/design-prototype/scan/index.html?taqdimot=1` in the demo window.
2. A small chooser appears under the scan buttons: **1 Nyutonning ikkinchi qonuni · 2 Guk qonuni · 3 Om qonuni**. Tap one, or press **1 / 2 / 3** on the laptop keyboard. Every following scan in that window "finds" that topic.
3. To turn it off: open `test.empira.uz/design-prototype/scan/index.html?taqdimot=0`, or close the window.

> ⚠️ **The chooser stays on the scanner screen while presenter mode is on.** It was measured as visible at every screen size, from 375×667 phones to 1080p projectors. Teachers will see it whenever the scanner is on screen. If you can't hide the scanner screen, use the default method in §3 (scan the Newton page in a fresh window) instead.

## 7. If something goes wrong

| Problem | Do this |
|---|---|
| Lab stays on "Laboratoriya yuklanmoqda…" for more than 5 s | Press reload (⌘R / Ctrl+R) |
| "Kamera ochilmadi" (Camera didn't open) | Tap **"Rasm yuklash"** and choose the saved photo |
| Scanner found the wrong topic | You've scanned before in this window. Close it, open a fresh window, start from Home. |
| Chooser visible on the scanner | Presenter mode is on. Open `test.empira.uz/design-prototype/scan/index.html?taqdimot=0` (off-screen if possible). |
| **No internet / test.empira.uz won't load** | **Offline backup:** on the laptop, open `Desktop/empira/design-prototype/home/index.html` (drag it into Chrome). Everything works offline, including the 3D; only the font changes to the system font. Phones can't use this backup. |

## 8. What not to promise

- Scanning is a mock. Real page recognition isn't built yet.
- 3 demo labs exist: Nyutonning ikkinchi qonuni, Om qonuni and Guk qonuni. Everything else is "Tez orada".
- Only 8-sinf Fizika has a prepared plan. The "Shu hafta" week is a demo setting, not a real calendar.
