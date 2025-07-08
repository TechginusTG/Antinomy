// 다국어 텍스트 정의
const translations = {
	ko: {
		title: "설정",
		labelLanguage: "언어 설정",
		labelTheme: "테마 선택",
		labelLight: "라이트",
		labelDark: "다크",
		labelSpring: "봄",
		labelSummer: "여름",
		labelAutmn: "가을",
		labelWinter: "겨울",
		labelBg: "배경 색상",
		labelText: "텍스트 색상",
		labelBtn: "버튼 색상",
		saveBtn: "저장",
		alert: (lang, theme) => `설정이 저장되었습니다.\n언어: ${lang}\n테마: ${theme}`,
	},
};

// 라벨 갱신 함수
function updateLabels(lang) {
	const t = translations[lang];
	if (!t) return;

	document.getElementById("title").textContent = t.title;
	document.getElementById("label-language").textContent = t.labelLanguage;
	document.getElementById("label-theme").textContent = t.labelTheme;
	document.getElementById("label-light").textContent = t.labelLight;
	document.getElementById("label-dark").textContent = t.labelDark;
	document.getElementById("label-Sprig").textContent = t.labelSpring;
	document.getElementById("label-Summer").textContent = t.labelSummer;
	document.getElementById("label-Autumn").textContent = t.labelAutumn;
	document.getElementById("label-Winter").textContent = t.labelWinter;
	//document.getElementById("label-custom").textContent = t.labelCustom;
	document.getElementById("label-bg").textContent = t.labelBg;
	document.getElementById("label-text").textContent = t.labelText;
	document.getElementById("label-btn").textContent = t.labelBtn;
	document.getElementById("saveBtn").textContent = t.saveBtn;
}

// 사용자 정의 테마 라디오 선택 시 입력창 표시
document.querySelectorAll('input[name="theme"]').forEach((radio) => {
	radio.addEventListener("change", () => {
		const isCustom = document.querySelector('input[name="theme"]:checked').value === "custom";
		document.getElementById("customThemeInputs").style.display = isCustom ? "block" : "none";
	});
});

// 언어 선택 시 라벨 변경
document.getElementById("language").addEventListener("change", (e) => {
	const selectedLang = e.target.value;
	window.localStorage.setItem("lang", selectedLang);
	updateLabels(selectedLang);
});

function applySettings() {
	const language = document.getElementById("language").value;
	const theme = document.querySelector('input[name="theme"]:checked').value;

	const body = document.body;
	const settingsBox = document.getElementById("settingsBox");

	if (theme === "light") {
		window.localStorage.setItem("thema", "light");
	} else if (theme === "dark") {
		window.localStorage.setItem("thema", "dark");
	} else if (theme === "haru") {
		window.localStorage.setItem("thema", "haru");
	} else if (theme === "natsu") {
		window.localStorage.setItem("thema", "natsu");
	} else if (theme === "aki") {
		window.localStorage.setItem("thema", "aki");
	} else if (theme === "fuyu") {
		window.localStorage.setItem("thema", "fuyu");
	}

	window.location.href =window.opener.location.reload("/");
window.close("/settings");
	
}
// 초기 라벨 설정
updateLabels(document.getElementById("language").value);

// 현재 선택된 테마를 radio에 반영
let savedTheme = window.localStorage.getItem("thema") || "light";
document.querySelectorAll('input[name="theme"]').forEach((radio) => {
	radio.checked = false; // 모두 해제
});
let themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
if (themeRadio) {
	themeRadio.checked = true;
}
