// script.js (請建立一個 script.js 檔案並將以下內容放入)

document.addEventListener('DOMContentLoaded', () => {
    const birthdateInput = document.getElementById('birthdate');
    const weightCategorySelect = document.getElementById('weight-category');
    const calculateButton = document.getElementById('calculate-btn');
    const resultDisplay = document.getElementById('result-display');

    // 1. 根據附件圖片建立查表資料結構 (Lookup Table)
    // 鍵(key): 狗狗年齡 (月/年)；值(value): [小型犬, 中型犬, 大型犬] 的人類等效年齡 (歲)
    const AGE_TABLE = {
        // 月齡
        '0.25': [4, 4, 3],     // 3 個月
        '0.5': [7.5, 7.5, 6],  // 6 個月
        '0.75': [11, 11, 9],   // 9 個月
        // 足歲
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
        17: [84, 92, 120], // 大型犬>120
        19: [92, 100, 120], // 大型犬>120
        20: [100, 100, 120]  // 大型犬>120
    };

    // 2. 轉換體型代碼到表格索引
    const WEIGHT_MAP = {
        'small': 0, // 小型犬 (10公斤以下)
        'medium': 1, // 中型犬 (10~26公斤)
        'large': 2  // 大型犬 (26公斤以上)
    };

    /**
     * 計算狗狗的實際年齡 (年.月)
     * @param {Date} birthDate - 狗狗的出生日期
     * @returns {{years: number, months: number, totalYears: number}} - 包含總年齡的物件
     */
    function calculateDogAge(birthDate) {
        const today = new Date();
        const bd = new Date(birthDate);

        // 檢查輸入是否有效
        if (isNaN(bd.getTime())) {
            return null;
        }

        let years = today.getFullYear() - bd.getFullYear();
        let months = today.getMonth() - bd.getMonth();
        let days = today.getDate() - bd.getDate();

        // 調整月份和年份
        if (days < 0) {
            months--;
            // 找出前一個月的最後一天，計算天數差
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        // 狗狗總年齡 (以小數表示，更精確)
        const totalYears = years + (months / 12);

        return { years, months, totalYears };
    }

    /**
     * 使用查表法與線性插值法估算人類等效年齡
     * @param {number} dogYears - 狗狗的總年齡 (小數)
     * @param {string} category - 體型類別 ('small', 'medium', 'large')
     * @returns {number|string} - 人類等效年齡 (歲)
     */
    function getHumanAge(dogYears, category) {
        const dogAges = Object.keys(AGE_TABLE).map(Number).sort((a, b) => a - b);
        const categoryIndex = WEIGHT_MAP[category];

        if (dogYears <= 0) return 0;

        // 1. 處理極端值 (超過表格最大值 20 歲)
        if (dogYears >= 20) {
            const lastAge = AGE_TABLE[20][categoryIndex];
            // 粗略估算超過 20 歲的增長率
            const rate = (AGE_TABLE[20][categoryIndex] - AGE_TABLE[19][categoryIndex]) / (20 - 19);
            const extraYears = dogYears - 20;
            // 每年以 19-20 歲之間的平均值增長
            return Math.round(lastAge + extraYears * rate);
        }

        // 2. 查表或插值
        let lowerAge = dogAges[0];
        let upperAge = dogAges[dogAges.length - 1];

        // 找到最接近的上下界
        for (let i = 0; i < dogAges.length; i++) {
            if (dogAges[i] <= dogYears) {
                lowerAge = dogAges[i];
            }
            if (dogAges[i] >= dogYears) {
                upperAge = dogAges[i];
                break;
            }
        }
        
        // 如果剛好是表格中的值，則直接回傳
        if (dogYears === lowerAge) {
            return AGE_TABLE[lowerAge][categoryIndex];
        }

        // 進行線性插值 (Linear Interpolation)
        // Y = Y1 + ( (X - X1) * (Y2 - Y1) ) / (X2 - X1)
        const X1 = lowerAge;
        const Y1 = AGE_TABLE[lowerAge][categoryIndex];
        const X2 = upperAge;
        const Y2 = AGE_TABLE[upperAge][categoryIndex];
        const X = dogYears;

        if (X1 === X2) { // 預防除以零，雖然邏輯上不太可能發生
             return Y1;
        }

        const interpolatedAge = Y1 + ((X - X1) * (Y2 - Y1)) / (X2 - X1);
        
        // 確保精確度，四捨五入到最接近的整數
        return Math.round(interpolatedAge);
    }

    // 3. 按鈕點擊事件處理
    calculateButton.addEventListener('click', () => {
        const birthdateValue = birthdateInput.value;
        const categoryValue = weightCategorySelect.value;

        if (!birthdateValue) {
            resultDisplay.innerHTML = '<p style="color: red;">🚨 請輸入狗狗的出生日期！</p>';
            return;
        }

        const birthDate = new Date(birthdateValue);
        const ageResult = calculateDogAge(birthDate);

        if (!ageResult) {
            resultDisplay.innerHTML = '<p style="color: red;">🚨 日期格式錯誤，請檢查輸入！</p>';
            return;
        }

        const { years, months, totalYears } = ageResult;

        // 檢查日期是否在未來
        if (totalYears < 0) {
            resultDisplay.innerHTML = '<p style="color: red;">🕰️ 妙麗還沒出生喔！請檢查出生日期。</p>';
            return;
        }

        const humanAge = getHumanAge(totalYears, categoryValue);
        
        // 格式化輸出結果
        const dogAgeDisplay = years > 0 ? `${years} 歲 ${months} 個月` : `${months} 個月`;
        const categoryText = weightCategorySelect.options[weightCategorySelect.selectedIndex].text;

        let resultHTML = `
            <p><strong>體型選擇:</strong> ${categoryText}</p>
            <p>妙麗的實際年齡是: <span class="dog-age">${dogAgeDisplay}</span></p>
            <hr>
            <p>換算為人類等效年齡是: <span class="human-age">${humanAge} 歲</span></p>
        `;

        if (humanAge === 120 && categoryValue === 'large') {
             resultHTML += '<p style="font-size: 0.9em; color: gray;">* 大型犬超過 17 歲後，人類等效年齡將超過 120 歲。</p>';
        }

        resultDisplay.innerHTML = resultHTML;
    });

    // 額外功能：讓使用者一開始就能看到一個範例年齡 (可選)
    // 設置一個預設日期
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 3); // 預設 3 歲
    birthdateInput.valueAsDate = defaultDate;
    calculateButton.click(); // 首次載入即計算 3 歲的結果
});