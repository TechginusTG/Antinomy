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

function applyThema(t) {
	body.style.backgroundColor = thema[t].bg;
	body.style.color = thema[t].text; // ← 추가
	const chatHeaders = chat.querySelectorAll("h2, h3, h4, h5, h6");
	chatHeaders.forEach((h) => (h.style.color = thema[t].text));
	bg.style.backgroundColor = thema[t].bg;
	chat.style.backgroundColor = thema[t].chat;
	btn.forEach((button) => {
		button.style.backgroundColor = thema[t].btn;
		button.style.color = thema[t].text; // 버튼 텍스트 색상 변경
	});
	setTheme(t);
}

applyThema(window.localStorage.getItem("thema"));

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
