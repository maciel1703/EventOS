// ===============================
// ELEMENTOS
// ===============================
const buttonAdd = document.getElementById("button-add");
const formulario = document.getElementById("form-participante");
const cancelar = document.getElementById("cancelar-form-participante");
const fecharForm = document.getElementById("fechar-form-participante");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const scrim = document.getElementById("scrim");

const nomeParticipante = document.getElementById("nome-participante");
const emailParticipante = document.getElementById("email-participante");
const telefoneParticipante = document.getElementById("telefone-participante");

const listParticipantes = document.getElementById("participantsList");

let participantes = [];
let participanteEditando = null;

// ===============================
// FUNÇÕES DE APOIO (avatar)
// ===============================
function iniciais(nome) {
    return nome
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join("");
}

// ===============================
// ABRIR / FECHAR FORMULÁRIO
// ===============================
function abrirFormulario() {
    formulario.classList.remove("hidden");
    formulario.classList.add("flex");
}

function fecharFormulario() {
    formulario.classList.add("hidden");
    formulario.classList.remove("flex");
    formulario.reset();
    participanteEditando = null;
}

fecharForm.addEventListener("click", fecharFormulario);
cancelar.addEventListener("click", fecharFormulario);

formulario.addEventListener("click", function (participante) {
    if (participante.target === formulario) {
        fecharFormulario();
    }
});

document.addEventListener("keydown", function (participante) {
    if (participante.key === "Escape" && !formulario.classList.contains("hidden")) {
        fecharFormulario();
    }
});

buttonAdd.addEventListener("click", function () {
    participanteEditando = null;
    formulario.reset();
    abrirFormulario();
});

// ===============================
// CRIAR / ATUALIZAR PARTICIPANTE
// ===============================
formulario.addEventListener("submit", function (participante) {
    participante.preventDefault();

    const dadosFormulario = {
        nome: nomeParticipante.value,
        email: emailParticipante.value,
        telefone: telefoneParticipante.value,
    };

    if (participanteEditando !== null) {
        participantes[participanteEditando] = dadosFormulario;
    } else {
        participantes.push(dadosFormulario);
    }

    salvarParticipantes();
    renderizarParticipantes();

    formulario.reset();
    fecharFormulario();
});

// ===============================
// EXCLUIR PARTICIPANTE
// ===============================
function excluirParticipante(index) {
    const participante = participantes[index];

    if (!participante) return;

    const confirmar = confirm(`Excluir o participante "${participante.nome}"?`);

    if (!confirmar) return;

    participantes.splice(index, 1);

    salvarParticipantes();
    renderizarParticipantes();
}

// ===============================
// CARREGAR PARTICIPANTES
// ===============================
function carregarParticipantes() {
    const dados = localStorage.getItem("participantes");

    participantes = dados ? JSON.parse(dados) : [];

    renderizarParticipantes();
}

// ===============================
// SALVAR PARTICIPANTES
// ===============================
function salvarParticipantes() {
    localStorage.setItem("participantes", JSON.stringify(participantes));
}

// ===============================
// RENDERIZAR PARTICIPANTES
// ===============================
function renderizarParticipantes() {
    listParticipantes.innerHTML = "";

    participantes.forEach(function (participante, index) {

        const card = document.createElement("div");

        card.className =
            "group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-surface p-4 mb-3 shadow-sm transition hover:border-accent/30 hover:shadow-md";

        listParticipantes.appendChild(card);

        card.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-base font-semibold ring-2 ring-white shadow-sm bg-accent text-white">
                    ${iniciais(participante.nome)}
                </span>

                <div class="flex flex-col gap-0.5">
                    <p class="font-display text-base font-semibold text-ink">${participante.nome}</p>
                    <p class="font-body text-sm text-muted">${participante.email}</p>
                </div>
            </div>

            <div class="flex items-center justify-between gap-4 w-full sm:w-auto">
                <span class="flex items-center gap-1.5 rounded-full bg-bg-soft px-3 py-1.5 font-mono text-xs text-muted">
                    📞 ${participante.telefone}
                </span>

                <div class="flex items-center gap-1 opacity-100 sm:opacity-60 transition group-hover:opacity-100">
                    <button
                        class="editar-participante flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-bg-soft"
                        data-index="${index}"
                        aria-label="Editar participante"
                        title="Editar"
                    >
                        ✎
                    </button>

                    <button
                        class="excluir-participante flex h-9 w-9 items-center justify-center rounded-full text-danger transition hover:bg-danger-soft"
                        data-index="${index}"
                        aria-label="Excluir participante"
                        title="Excluir"
                    >
                        🗑
                    </button>
                </div>
            </div>
        `;
    });

    document.querySelectorAll(".excluir-participante").forEach(function (botao) {
        botao.addEventListener("click", function () {
            const index = Number(botao.dataset.index);
            excluirParticipante(index);
        });
    });

    document.querySelectorAll(".editar-participante").forEach(function (botao) {
        botao.addEventListener("click", function () {
            const index = Number(botao.dataset.index);
            const participante = participantes[index];

            participanteEditando = index;

            nomeParticipante.value = participante.nome;
            emailParticipante.value = participante.email;
            telefoneParticipante.value = participante.telefone;

            abrirFormulario();
        });
    });
}

carregarParticipantes();

// ===============================
// BUSCA
// ===============================
const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("input", function () {
        const termo = searchInput.value.toLowerCase();

        const filtrados = participantes.filter(function (p) {
            return (
                p.nome.toLowerCase().includes(termo) ||
                p.email.toLowerCase().includes(termo)
            );
        });

        const listaCompleta = participantes;
        participantes = filtrados;
        renderizarParticipantes();
        participantes = listaCompleta;
    });
}

// ===============================
// MENU MOBILE (SIDEBAR)
// ===============================
function abrirSidebar() {
    sidebar.classList.add("open");
    scrim.classList.add("active");
}

function fecharSidebar() {
    sidebar.classList.remove("open");
    scrim.classList.remove("active");
}

menuToggle.addEventListener("click", abrirSidebar);
scrim.addEventListener("click", fecharSidebar);
// ===============================
// TEMA CLARO / ESCURO
// ===============================
const themeToggle = document.getElementById("theme-toggle");
const temaSalvo = localStorage.getItem("eventflow-tema");

function atualizarIconeTema() {
    const icone = themeToggle.querySelector("i");
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    icone.textContent = isDark ? "☀️" : "🌙";
}

if (temaSalvo === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
}

atualizarIconeTema();

themeToggle.addEventListener("click", function () {
    const temaAtual = document.documentElement.getAttribute("data-theme");

    if (temaAtual === "dark") {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("eventflow-tema", "light");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("eventflow-tema", "dark");
    }

    atualizarIconeTema();
});