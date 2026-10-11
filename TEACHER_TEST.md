# Empira: Teacher Usability Test (5–10 teachers)

**Goal:** find out whether a teacher can use Empira **with no explanation**.
**Length:** about 15 minutes per teacher (10 min tasks + 5 min form).
**Roles:** one observer per teacher. The observer only watches and writes; they never help.

---

## 1. Before each teacher (observer only)

1. Open a **new browser window** and go to **test.empira.uz** (it opens Home). Use a new window for every teacher, because the mock scanner gives the right result only on the first scan in a fresh window. *(No internet: open `design-prototype/home/index.html` from the laptop instead.)*
2. Leave the screen on **Home**. Do not open any other page.
3. Have the 8-sinf Fizika textbook ready, open at the **Nyutonning ikkinchi qonuni** page.
4. Use the **same device type for every teacher** (all laptop or all phone), so the times are comparable.
5. Do **not** use presenter mode (`?taqdimot=1`). Its chooser would be visible to the teacher.
6. Start a stopwatch per task, or record the screen if the teacher agrees.

## 2. What to say (the only introduction)

> "Bu yangi dastur. Biz dasturni sinayapmiz, sizni emas. Xato qilishingizdan qo‘rqmang. Iltimos, o‘ylayotganingizni ovoz chiqarib ayting. Men yordam bera olmayman — faqat kuzataman."
>
> (This is a new program. We're testing the program, not you. Don't worry about mistakes. Please think out loud. I can't help you; I'm only watching.)

**Do NOT:** explain Empira, show where anything is, point, nod at the right button, or say what "Shu hafta" or "Tez orada" means.

**If the teacher asks you something,** reply only with: *"Siz nima qilgan bo‘lardingiz?"* (What would you do?) Write the question down.

**Stop a task** when it's done, when the teacher gives up, or after **3 minutes** (this counts as a failure). Then read the next task.

---

## 3. Tasks (read exactly as written, one at a time)

| # | Read to the teacher | Starts on | Success = |
|---|---|---|---|
| **1** | *"8-sinfdagi bugungi fizika mavzusini toping va 3D laboratoriyani oching."* | Home | The **Aravachaning tezlanishi** lab is open (Nyutonning ikkinchi qonuni) |
| **2** | *"Mana shu darslik sahifasini Empira orqali skaner qilib, laboratoriyani oching."* (hand over the book open at Nyutonning ikkinchi qonuni) | Observer returns the screen to **Home** (neutral reset; say nothing) | The scan result is shown **and** the lab opened from it |
| **3** | *"Keyingi mavzuga o‘ting."* | The lab the teacher opened in Task 2 (don't reset) | The **Nyutonning uchinchi qonuni** topic page is open (it's marked "Tez orada") |

**Shortest paths** (for the observer only; never show them):
- **Task 1:** 8-sinf → "Shu hafta" row → "3D laboratoriyani ochish". 3 taps.
- **Task 2:** "Kitobni skanerlash" → "Kamera orqali skanerlash" → take photo → "3D laboratoriyani ochish". About 4 taps.
- **Task 3:** "Keyingi mavzu" at the end of the lab panel. 1 tap. (Back → "Keyingi mavzu" on the Topic page also counts.)

---

## 4. Observer recording sheet (one per teacher)

Teacher #: ___ Subject/grades taught: ___ Device: laptop / phone Date: ___

| | Task 1 | Task 2 | Task 3 |
|---|---|---|---|
| **Result** (✅ done / ⚠️ done after a long struggle / ❌ failed or > 3 min) | | | |
| **Time** (seconds, from the end of reading the task to success) | | | |
| **Wrong clicks** (number + where, e.g. "tapped Fizika pill", "opened 7-sinf", "tapped a chapter heading") | | | |
| **Hesitation** (pauses over 5 s without acting, or the cursor wandering; where?) | | | |
| **Questions asked** (exact words) | | | |
| **Confusing words / screens** (e.g. "Shu hafta", "Tez orada", "Mavzuni tanlash", "Keyingi mavzu", 3D controls) | | | |

**Also note:** did the teacher notice the **"Shu hafta"** row before scrolling the list? (yes / no) In Task 3, did she look for "next" **inside the lab** or leave it? (inside / left)

---

## 5. Feedback form (give it after the 3 tasks)

**Empira haqida fikringiz** (Your opinion of Empira)

1. **Empira’dan foydalanish qanchalik oson bo‘ldi?** (How easy was Empira to use?)
   ☐ 1 — juda qiyin ☐ 2 ☐ 3 ☐ 4 ☐ 5 — juda oson

2. **Qaysi joyda ikkilandingiz yoki nima qilishni bilmay qoldingiz?** (Where did you hesitate or not know what to do?)
   ______________________________________

3. **Qaysi so‘z, tugma yoki ekran tushunarsiz bo‘ldi?** (Which word, button or screen was unclear?)
   ______________________________________

4. **Ertaga darsingizda Empira’dan foydalanasizmi?** (Would you use Empira in your lesson tomorrow?)
   ☐ Ha ☐ Balki ☐ Yo‘q Nega? (Why?) ____________________

5. **Qaysi mavzular uchun 3D laboratoriya sizga eng kerak?** (Which topics do you most need a 3D lab for?)
   ______________________________________

6. **Empira’da bitta narsani o‘zgartira olsangiz, nimani o‘zgartirgan bo‘lardingiz?** (If you could change one thing in Empira, what would it be?)
   ______________________________________

---

## 6. After each teacher (debrief, 1 minute)

Thank the teacher. Then tell them honestly that **scanning in this version is a demonstration**: real page recognition is still being built, and only three demo labs exist so far.

## 7. After all teachers: summary for the team

| Task | Completed (x / n) | Median time | Most common wrong click | Most common confusing word |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

- **Target:** at least 80 % of teachers complete each task **without help**. Task 1 under 30 s, Task 2 under 60 s, Task 3 under 20 s.
- Any word that confused **2 or more teachers** goes on the fix list.
- Copy every answer to Q5 (most-needed labs) into the lab priority list. This is a Week 1 success criterion in the MVP plan.
