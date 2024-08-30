const app = document.querySelector('.app'),
    mode = document.querySelector('#mode'),
    chats = document.querySelector('.chats'),
    add_chats = document.querySelector('#add-chat'),
    clear = document.querySelector('#delete'),
    qna = document.querySelector('.qna'),
    input = document.querySelector('.request input'),
    send = document.querySelector('#send');

// API key baru
const API_KEY_GEMINI = "AIzaSyBZYr6Sc-z7gy7qjrmy34YN5L31CIt5YbE";
const url = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

mode.addEventListener('click', toggleMode);
add_chats.addEventListener('click', addNewChat);
send.addEventListener('click', getAnswer);
input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        getAnswer();
    }
});

clear.addEventListener('click', () => chats.innerHTML = '');

// Fungsi dark mode & light mode
function toggleMode() {
    console.log('clicked');
    const light_mode = app.classList.contains('light');
    app.classList.toggle('light', !light_mode);

    mode.innerHTML = `<iconify-icon icon="bi:${light_mode ? 'brightness-high' : 'moon'}" class="icon"></iconify-icon> ${light_mode ? 'light mode' : 'dark mode'}`;
}

// Fungsi menambahkan chat baru
function addNewChat() {
    chats.innerHTML += `
        <!-- Tambahkan konten chat baru di sini -->
    `;
}

// Hapus chat
const removeChat = (el) => el.parentElement.parentElement.remove();
const updateChatTitle = (el) => el.parentElement.previousElementSibling.lastElementChild.focus();

// Fungsi menampilkan user question & bot answer
async function getAnswer() {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': API_KEY_GEMINI // API key Gemini yang baru
        },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: input.value }]
                }
            ]
        })
    };

    try {
        const question = input.value.trim();
        if (!question) return; // Jangan lanjutkan jika input kosong

        const id = generateId();
        qna.innerHTML += createChat(question, id);

        const p = document.getElementById(id);

        const res = await fetch(url, options);

        if (res.ok) {
            const data = await res.json();
            console.log(data);

            if (data.candidates && data.candidates.length > 0) {
                const candidateContent = data.candidates[0].content;

                const msg = candidateContent.parts ? candidateContent.parts.map(part => part.text).join(' ') : 'No content found';

                p.innerHTML = ""; // Hapus placeholder
                typeWriter(p, msg);
            } else {
                console.error("No candidates found in the response");
            }
        } else {
            console.error("API Error:", res.status, res.statusText);
        }

        input.value = '';
    } catch (err) {
        console.error("An error occurred:", err);
    }
}

function createChat(question, id) {
    return `
    <div class="result">
        <div class="question">
            <iconify-icon icon="bi:person-fill-gear" class="icon blue"></iconify-icon>
            <h3>${question}</h3>
        </div>
        <div class="answer">
            <iconify-icon icon="bi:robot" class="icon green"></iconify-icon>
            <p id="${id}"><img src="images/loading.gif" class='loading'></p>
        </div>
    </div>
    `;
}

// Fungsi generate id
function generateId() {
    const id = Math.random().toString(16) + Date.now();
    return id.substr(2, id.length - 2);
}

// Efek type writer
function typeWriter(el, ans) {
    let i = 0;
    const interval = setInterval(() => {
        qna.scrollTop = qna.scrollHeight;
        if (i < ans.length) {
            el.innerHTML += ans.charAt(i);
            i++;
        } else {
            clearInterval(interval);
        }
    }, 13);
}
