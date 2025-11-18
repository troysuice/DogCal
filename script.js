document.addEventListener('DOMContentLoaded', () => {
    const birthdateInput = document.getElementById('birthdate');
    const weightCategorySelect = document.getElementById('weight-category');
    const calculateButton = document.getElementById('calculate-btn');
    const resultDisplay = document.getElementById('result-display');

    // =========================
    // 🔐 localStorage KEY 設定
    // =========================
    const BIRTH_KEY = 'merly-birthdate';
    const WEIGHT_KEY = 'merly-weight';

    // =========================
    // 📥 讀取 localStorage
    // =========================
    const savedBirth = localStorage.getItem(BIRTH_KEY);
    const savedWeight = localStorage.getItem(WEIGHT_KEY);

    if (savedBirth) {
        birthdateInput.value = savedBirth;
    }

    if (savedWeight) {
        weightCategorySelect.value = savedWeight;
    }

    // =========================
    // 💾 自動存入 localStorage
    // =========================
    birthdateInput.addEventListener('change', () => {
        localStorage.setItem(BIRTH_KEY, birthdateInput.value);
    });

    weightCategorySelect.addEventListener('change', () => {
        localStorage.setItem(WEIGHT_KEY, weightCategorySelect.value);
    });

    // =========================
    // 🐶 年齡查表資料
    // =========================
    const AGE_TABLE = {
        '0.25': [4, 4, 3],
        '0.5': [7.5, 7.5, 6],
        '0.75': [11, 11, 9],
        1: [15, 15, 12],
        2: [24, 24, 19],
        3: [28, 28, 28],
        4: [32, 32, 32],
        5: [36, 36, 36],
        6: [40, 42, 45],
        7: [44, 47, 50],
        8: [48, 51, 55],
        9: [52, 56, 61],
        10: [56, 60, 66],
        11: [60, 65, 72],
        13: [68, 74, 82],
        15: [76, 83, 93],
        17: [84, 92, 120],
        19: [92, 100, 120],
        20: [100, 100, 120]
    };

    const WEIGHT_MAP = {
        'small': 0,
        'medium': 1,
        'large': 2
    };

    // =========================
    // 📘 計算狗狗實際年齡
    // =========================
    function calculateDogAge(birthDate) {
        const today = new Date();
        const bd = new Date(birthDate);

        if (isNaN(bd.getTime())) return null;

        let years = today.getFullYear() - bd.getFullYear();
        let months = today.getMonth() - bd.getMonth();
        let days = today.getDate() - bd.getDate();

        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        const totalYears = years + months / 12;
        return { years, months, totalYears };
    }

    // =========================
    // 📗 查表＋插值換算成年齡
    // =========================
    function getHumanAge(dogYears, category) {
        const dogAges = Object.keys(AGE_TABLE).map(Number).sort((a, b) => a - b);
        const index = WEIGHT_MAP[category];

        if (dogYears <= 0) return 0;

        if (dogYears >= 20) {
            const lastAge = AGE_TABLE[20][index];
            const rate = AGE_TABLE[20][index] - AGE_TABLE[19][index];
            return Math.round(lastAge + (dogYears - 20) * rate);
        }

        let lower = dogAges[0];
        let upper = dogAges[dogAges.length - 1];

        for (let i = 0; i < dogAges.length; i++) {
            if (dogAges[i] <= dogYears) lower = dogAges[i];
            if (dogAges[i] >= dogYears) {
                upper = dogAges[i];
                break;
            }
        }

        if (dogYears === lower) return AGE_TABLE[lower][index];

        const X1 = lower, X2 = upper;
        const Y1 = AGE_TABLE[lower][index];
        const Y2 = AGE_TABLE[upper][index];
        const X = dogYears;

        return Math.round(Y1 + ((X - X1) * (Y2 - Y1)) / (X2 - X1));
    }

    // =========================
    // 🖱️ 按鈕事件
    // =========================
    calculateButton.addEventListener('click', () => {
        const birthValue = birthdateInput.value;
        const categoryValue = weightCategorySelect.value;

        if (!birthValue) {
            resultDisplay.innerHTML = '<p style="color:red;">🚨 請輸入狗狗的出生日期！</p>';
            return;
        }

        const ageInfo = calculateDogAge(new Date(birthValue));
        if (!ageInfo) {
            resultDisplay.innerHTML = '<p style="color:red;">日期格式錯誤！</p>';
            return;
        }

        const { years, months, totalYears } = ageInfo;
        if (totalYears < 0) {
            resultDisplay.innerHTML = '<p style="color:red;">🕰️ 妙麗還沒出生喔！</p>';
            return;
        }

        const humanAge = getHumanAge(totalYears, categoryValue);
        const dogAgeDisplay = years > 0 ? `${years} 歲 ${months} 個月` : `${months} 個月`;
        const categoryText = weightCategorySelect.options[weightCategorySelect.selectedIndex].text;

        let html = `
            <p><strong>體型選擇:</strong> ${categoryText}</p>
            <p>妙麗的實際年齡是: <span class="dog-age">${dogAgeDisplay}</span></p>
            <hr>
            <p>換算為人類等效年齡是: <span class="human-age">${humanAge} 歲</span></p>
        `;

        if (humanAge === 120 && categoryValue === 'large') {
            html += '<p style="font-size:0.9em;color:gray;">* 大型犬 17 歲以上等效 > 120 歲。</p>';
        }

        resultDisplay.innerHTML = html;
    });

    // =========================
    // ⭐ 首次使用 → 設定預設 3 歲
    // =========================
    if (!savedBirth) {
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() - 3);
        birthdateInput.valueAsDate = defaultDate;
    }

    // 初次載入就直接跑計算
    calculateButton.click();
});
