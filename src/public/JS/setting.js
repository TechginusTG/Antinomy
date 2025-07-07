// 다국어 텍스트 정의
const translations = {
  ko: {
    title: '설정',
    labelLanguage: '언어 설정',
    labelTheme: '테마 선택',
    labelLight: '라이트',
    labelDark: '다크',
    labelCustom: '사용자 정의',
    labelBg: '배경 색상',
    labelText: '텍스트 색상',
    labelBtn: '버튼 색상',
    saveBtn: '저장',
    alert: (lang, theme) => `설정이 저장되었습니다.\n언어: ${lang}\n테마: ${theme}`
  },
  en: {
    title: 'Settings',
    labelLanguage: 'Language',
    labelTheme: 'Theme',
    labelLight: 'Light',
    labelDark: 'Dark',
    labelCustom: 'Custom',
    labelBg: 'Background Color',
    labelText: 'Text Color',
    labelBtn: 'Button Color',
    saveBtn: 'Save',
    alert: (lang, theme) => `Settings saved.\nLanguage: ${lang}\nTheme: ${theme}`
  }
};

// 라벨 갱신 함수
function updateLabels(lang) {
  const t = translations[lang];
  if (!t) return;

  document.getElementById('title').textContent = t.title;
  document.getElementById('label-language').textContent = t.labelLanguage;
  document.getElementById('label-theme').textContent = t.labelTheme;
  document.getElementById('label-light').textContent = t.labelLight;
  document.getElementById('label-dark').textContent = t.labelDark;
  document.getElementById('label-custom').textContent = t.labelCustom;
  document.getElementById('label-bg').textContent = t.labelBg;
  document.getElementById('label-text').textContent = t.labelText;
  document.getElementById('label-btn').textContent = t.labelBtn;
  document.getElementById('saveBtn').textContent = t.saveBtn;
}

// 사용자 정의 테마 라디오 선택 시 입력창 표시
document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const isCustom = document.querySelector('input[name="theme"]:checked').value === 'custom';
    document.getElementById('customThemeInputs').style.display = isCustom ? 'block' : 'none';
  });
});

// 언어 선택 시 라벨 변경
document.getElementById('language').addEventListener('change', (e) => {
  const selectedLang = e.target.value;
  updateLabels(selectedLang);
});

function applySettings() {
  const language = document.getElementById('language').value;
  const theme = document.querySelector('input[name="theme"]:checked').value;

  const body = document.body;
  const settingsBox = document.getElementById('settingsBox');

  if (theme === 'light') {
    body.className = '';
    body.style.backgroundColor = '#ffffff';
    body.style.color = '#000000';
    document.documentElement.style.setProperty('--btn-color', '#4CAF50');
  } else if (theme === 'dark') {
    body.className = '';
    body.style.backgroundColor = '#1a1a1a';
    body.style.color = '#f0f0f0';
    document.documentElement.style.setProperty('--btn-color', '#008cba');
  } else if (theme === 'custom') {
    const bg = document.getElementById('bgColor').value;
    const text = document.getElementById('textColor').value;
    const btn = document.getElementById('btnColor').value;

    body.className = 'custom-theme';
    settingsBox.className = 'settings-box custom-theme';

    document.documentElement.style.setProperty('--bg-color', bg);
    document.documentElement.style.setProperty('--text-color', text);
    document.documentElement.style.setProperty('--btn-color', btn);
  }

  alert(translations[language].alert(language === 'ko' ? '한국어' : 'English', theme));
}

// 초기 라벨 설정
updateLabels(document.getElementById('language').value);