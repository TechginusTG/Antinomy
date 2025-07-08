const thema = {
    haru:{
        bg: '#fff3f5',
        chat: '#f9d5d3',
        btn: '#ffffff',
        text: '#9c5a65'
    },

    natsu:{
        bg: '#f3e9d2',
        chat: '#2a6f9e',
        btn: '#e7d9b9',
        text: '#2a6f9e'
    },

    aki:{
        bg: '#f7f1df',
        chat: '#d2b48c',
        btn: '#DEB887',
        text: '#f7f1df'
    },

    fuyu:{
        bg: '#F8F8FF',
        chat: '#8B0000',
        btn: '#006400',
        text: '#FFFFFF'
    },

 dark:{
        bg: '#273238',
        chat: '#394A54',
        btn: '#90A4AE',
        text: '#1E2D36',
    }






}

const bg=document.getElementById('diagram');
const chat =document.getElementById('chat');
const body =document.querySelector('body');
const btn =document.querySelectorAll('.btn');
let text =document.querySelector('html').style.color;



function applyThema(t){
    body.style.backgroundColor =thema[t].bg; 
    bg.style.backgroundColor =thema[t].bg; 
    chat.style.backgroundColor =thema[t].chat;
    btn.forEach((button) => {
        button.style.backgroundColor =thema[t].btn;
    }); 
    text=thema[t].text;
}


applyThema(window.localStorage.getItem('thema'));
