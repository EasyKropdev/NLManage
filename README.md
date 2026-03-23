# NewLifeManage 📋

Командний PWA-менеджер заходів з Google Sign-In та реальною синхронізацією.

---

## 📁 Структура файлів

```
NewLifeManage/
├── index.html            — основна сторінка
├── style.css             — стилі (темна тема)
├── app.js                — логіка + Firebase
├── manifest.json         — PWA маніфест
├── firebase.json         — конфіг Firebase Hosting
├── database.rules.json   — правила безпеки БД
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

---

## 🚀 Налаштування — крок за кроком

### Крок 1 — Створити проєкт Firebase

1. Відкрий [console.firebase.google.com](https://console.firebase.google.com)
2. **Add project** → введи назву (напр. `newlife-manage`) → Continue
3. Google Analytics — можна вимкнути → **Create project**

---

### Крок 2 — Увімкнути Google Sign-In

1. Зліва: **Build → Authentication → Get started**
2. Вкладка **Sign-in method** → натисни **Google**
3. Увімкни toggle → вкажи email підтримки → **Save**

---

### Крок 3 — Створити Realtime Database

1. Зліва: **Build → Realtime Database → Create database**
2. Вибери регіон (europe-west1 найближчий)
3. **Start in test mode** → Enable
4. Правила безпеки встановляться автоматично при деплої

---

### Крок 4 — Отримати Firebase конфіг

1. ⚙️ (Settings) → **Project Settings**
2. Прокрути вниз → **Your apps** → натисни `</>` (Web)
3. Введи назву додатку → **Register app**
4. Скопіюй блок `firebaseConfig`

---

### Крок 5 — Вставити конфіг в app.js

Відкрий `app.js` і замінити блок на початку:

```js
const firebaseConfig = {
  apiKey:            "твій_ключ",
  authDomain:        "твій-проект.firebaseapp.com",
  databaseURL:       "https://твій-проект-default-rtdb.firebaseio.com",
  projectId:         "твій-проект",
  storageBucket:     "твій-проект.appspot.com",
  messagingSenderId: "твій_id",
  appId:             "твій_app_id"
};
```

---

### Крок 6 — Додати іконки

Поклади два файли в папку `icons/`:
- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

> Згенеруй на [favicon.io](https://favicon.io) або [realfavicongenerator.net](https://realfavicongenerator.net)

---

### Крок 7 — Завантажити в GitHub

```bash
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/твій-нік/newlife-manage.git
git push -u origin main
```

---

### Крок 8 — Деплой на Firebase Hosting

```bash
# Встанови Firebase CLI (один раз)
npm install -g firebase-tools

# Увійди в акаунт
firebase login

# Підключи проєкт
firebase use --add
# Вибери свій проєкт зі списку

# Деплой (одна команда!)
firebase deploy
```

Після деплою отримаєш посилання:
`https://твій-проект.web.app`

> ♻️ Щоразу при змінах просто запускай `firebase deploy`

---

### Крок 9 — Налаштувати авторизований домен

1. Firebase Console → **Authentication → Settings**
2. Вкладка **Authorized domains**
3. Переконайся що `твій-проект.web.app` є в списку (додається автоматично)

---

### Крок 10 — Встановити на телефон

**iPhone (Safari):**
Відкрий посилання → кнопка "Поділитися" → "На початковий екран"

**Android (Chrome):**
Відкрий посилання → три крапки → "Додати на головний екран"

---

## 🔐 Безпека

| Що захищає | Як |
|---|---|
| Дані в БД | Тільки авторизовані користувачі можуть читати/писати |
| Google Sign-In | Google відповідає за паролі, ти їх не бачиш |
| Авторизовані домени | Тільки твій домен може використовувати конфіг |
| HTTPS | Firebase Hosting надає SSL автоматично |

**Файл `database.rules.json`** містить правила — вони деплояться разом з кодом командою `firebase deploy`.

---

## ✨ Функціонал

- 🔐 Вхід через Google (одна кнопка)
- 🥧 Кругова / 📊 лінійна діаграма
- ✏️ Додавання та редагування частин заходу
- 👥 Управління командою з ролями
- 🔄 Реальна синхронізація між усіма пристроями
- 📱 PWA — встановлюється як нативний додаток

---

Зроблено з ❤️ для команди NewLife
