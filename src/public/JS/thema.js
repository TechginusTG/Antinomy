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
		text: "#2a3240",
	},

	aki: {
		bg: "#f7f1df",
		chat: "#d2b48c",
		btn: "#DEB887",
		text: "#5C1A0D",
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

        light: {
		bg: "#white",
		chat: "#FFFFFF",
		btn: "#2563eb",
		text: "#000000",
	},
};

const bg = document.getElementById("diagram");
const chat = document.getElementById("chat");
const body = document.querySelector("body");
const btn = document.querySelectorAll(".btn");
const cssL = document.querySelector('.cssT');

function applyThema(t) {
    if (!thema[t]) t = "haru"; // 기본값
    body.style.backgroundColor = thema[t].bg;
    body.style.color = thema[t].text;
    const chatHeaders = chat.querySelectorAll("h2, h3, h4, h5, h6");
    chatHeaders.forEach((h) => (h.style.color = thema[t].text));
    bg.style.backgroundColor = thema[t].bg;
    chat.style.backgroundColor = thema[t].chat;
    btn.forEach((button) => {
        button.style.backgroundColor = thema[t].btn;
        button.style.color = thema[t].text;
    });
    setTheme(t);
}

function setTheme(theme) {
    currentTheme = theme;
    const goalIcon = document.getElementById("goalIcon");
    switch (theme) {
        case "dark":
            goalIcon.textContent = "🎯";
            if (cssL) cssL.href = ""; // 다크모드 별도 CSS 없으면 비움
            break;
        case "light":
            goalIcon.textContent = "🎯";
            if (cssL) cssL.href = ""; // 라이트모드 별도 CSS 없으면 비움
            break;
        case "haru":
            goalIcon.textContent = "🌸";
            if (cssL) cssL.href = "/css/haru.css";
            break;
        case "natsu":
            goalIcon.textContent = "🌊";
            if (cssL) cssL.href = "/css/natsu.css";
            break;
        case "aki":
            goalIcon.textContent = "🍁";
            if (cssL) cssL.href = "/css/aki.css";
            break;
        case "fuyu":
            goalIcon.textContent = "🎁";
            if (cssL) cssL.href = "/css/fuyu.css";
            break;
    }
    document.body.setAttribute("data-theme", theme);
}

// 페이지 로드 시 테마 적용
applyThema(window.localStorage.getItem("thema"));
