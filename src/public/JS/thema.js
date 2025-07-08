const thema = {
	haru: {
		bg: "#fff3f5",
		chat: "#f9d5d3",
		btn: "#ffffff",
		text: "#9c5a6B",
	},

	natsu: {
		bg: "#f3e9d2",
		chat: "#2a6f9e",
		btn: "#e7d9b9",
		text: "#FFFFFF",
	},

	aki: {
		bg: "#f7f1df",
		chat: "#d2b48c",
		btn: "#DEB887",
		text: "#f7f1df",
	},

	fuyu: {
		bg: "#F8F8FF",
		chat: "#8B0000",
		btn: "#006400",
		text: "#FFFFFF",
	},

	dark: {
		bg: "#273238",
		chat: "#394A54",
		btn: "#90A4AE",
		text: "#f1f1f1",
	},
};

const bg = document.getElementById("diagram");
const chat = document.getElementById("chat");
const body = document.querySelector("body");
const btn = document.querySelectorAll(".btn");

// 쿠키 저장 함수
function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
}

// 쿠키 읽기 함수
function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function applyThema(t) {
    if (!t || !thema[t]) t = 'dark'; // 존재하는 테마로 기본값 변경
    body.style.backgroundColor = thema[t].bg;
    body.style.color = thema[t].text;
    const chatHeaders = chat.querySelectorAll('h2, h3, h4, h5, h6');
    chatHeaders.forEach((h) => (h.style.color = thema[t].text));
    bg.style.backgroundColor = thema[t].bg;
    chat.style.backgroundColor = thema[t].chat;
    btn.forEach((button) => {
        button.style.backgroundColor = thema[t].btn;
        button.style.color = thema[t].text;
    });
    setTheme(t);
}

// 페이지 로드 시 쿠키에서 테마 읽기
const savedThema = getCookie('thema') || 'dark';
applyThema(savedThema);

// 테마 변경 함수 예시 (이벤트 핸들러에서 호출)
function changeThema(t) {
    setCookie('thema', t, 365); // 테마 변경 시에만 쿠키 저장
    applyThema(t);
}

function setTheme(theme) {
	currentTheme = theme;

	const goalIcon = document.getElementById("goalIcon");
	switch (theme) {
		case "dark":
			goalIcon.textContent = "🎯";
			break;
		case "light":
			goalIcon.textContent = "🎯";
			break;
		case "haru":
			goalIcon.textContent = "🌸";
			break;
		case "natsu":
			goalIcon.textContent = "🌊";
			break;
		case "aki":
			goalIcon.textContent = "🍁";
			break;
		case "fuyu":
			goalIcon.textContent = "🎁";
			break;
	}

	document.body.setAttribute("data-theme", theme);
}
