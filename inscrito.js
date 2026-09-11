

const btnAdd = document.getElementById("button-add");
const formulario = document.getElementById("form-inscricao");
const cancelForm = document.getElementById("cancelar-form-inscricao");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const scrim = document.getElementById("scrim");

const participanteInscricao = document.getElementById("participante-inscricao");
const statusInscricao = document.getElementById("status-inscricao");
const eventoInscricao = document.getElementById("evento-inscricao");

const listaInscricoes = document.getElementById("lista-inscricoes");
const statusCard = document.getElementById("status-card");
const categoriaCard = document.getElementById("categoria-card");


// ===============================
// HELPERS DO CARD DE INSCRIÇÃO
// ===============================

function normalizarChave(texto) {
    return (texto || "")
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

const CORES_STATUS_INSCRICAO = {
    confirmada: "bg-teal-soft text-teal",
    pendente: "bg-amber-soft text-amber",
    cancelada: "bg-danger-soft text-danger"
};

const STATUS_LABEL_INSCRICAO = {
    confirmada: "Confirmada",
    pendente: "Pendente",
    cancelada: "Cancelada"
};

const CORES_AVATAR = [
    "bg-accent",
    "bg-teal",
    "bg-amber",
    "bg-purple-500",
    "bg-pink-500"
];

function corAvatarPorNome(nome) {
    const texto = nome || "";

    const soma = texto
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return CORES_AVATAR[soma % CORES_AVATAR.length];
}

function iniciaisPorNome(nome) {
    return (nome || "")
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0].toUpperCase())
        .join("");
}

function formatarDataHora(dataISO) {
    if (!dataISO) return "—";

    const data = new Date(dataISO);

    const dataFmt = data.toLocaleDateString("pt-BR");

    const horaFmt = data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });

    return `${dataFmt} às ${horaFmt}`;
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
}

cancelForm.addEventListener("click", fecharFormulario);

formulario.addEventListener("click", function (event) {
    if (event.target === formulario) {
        fecharFormulario();
    }
});

document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        !formulario.classList.contains("hidden")
    ) {
        fecharFormulario();
    }
});

btnAdd.addEventListener("click", function () {
    formulario.reset();
    abrirFormulario();
});


// ===============================
// SELECT E OPTION
// ===============================

const dados = localStorage.getItem("eventflow-eventos");
const eventos = dados ? JSON.parse(dados) : [];


// Select do formulário
eventos.forEach(function (evento) {
    const option = document.createElement("option");

    option.value = evento.nome;
    option.textContent = evento.nome;

    eventoInscricao.appendChild(option);
});


// Select do filtro de eventos
eventos.forEach(function (evento) {
    const option = document.createElement("option");

    option.value = evento.nome;
    option.textContent = evento.nome;

    categoriaCard.appendChild(option);
});


// Select do filtro de status
const statusFiltro = ["confirmada", "pendente", "cancelada"];

statusFiltro.forEach(function (status) {
    const option = document.createElement("option");

    option.value = status;
    option.textContent = STATUS_LABEL_INSCRICAO[status];

    statusCard.appendChild(option);
});


// Participantes
const dadosParticipantes = localStorage.getItem("participantes");
const participantes = dadosParticipantes
    ? JSON.parse(dadosParticipantes)
    : [];

participantes.forEach(function (participante) {
    const option = document.createElement("option");

    option.value = participante.nome;
    option.textContent = participante.nome;

    participanteInscricao.appendChild(option);
});


// ===============================
// INSCRIÇÕES
// ===============================

const dadosInscricoes = localStorage.getItem("inscricoes");

const inscricoes = dadosInscricoes
    ? JSON.parse(dadosInscricoes)
    : [];


// ===============================
// CRIAR LINHA DE INSCRIÇÃO
// ===============================

function criarLinhaInscricao(inscricao, indexReal) {

    const statusKey = normalizarChave(inscricao.status);

    const corStatus =
        CORES_STATUS_INSCRICAO[statusKey] ||
        "bg-bg-soft text-muted";

    const statusLabel =
        STATUS_LABEL_INSCRICAO[statusKey] ||
        inscricao.status;

    const dataFormatada =
        formatarDataHora(inscricao.dataInscricao);

    const linha = document.createElement("tr");

    linha.className =
        "border-b border-ink/10 transition hover:bg-bg-soft";

    linha.innerHTML = `
        <td class="flex items-center gap-2 px-2 py-3">

            <span class="flex h-8 w-8 items-center justify-center rounded-full font-body text-xs font-semibold text-white ${corAvatarPorNome(inscricao.participante)}">
                ${iniciaisPorNome(inscricao.participante)}
            </span>

            <span class="font-body text-sm font-medium text-ink">
                ${inscricao.participante}
            </span>

        </td>

        <td class="px-2 py-3 font-body text-sm text-ink/80">
            ${inscricao.evento}
        </td>

        <td class="px-2 py-3 font-body text-sm text-muted">
            ${dataFormatada}
        </td>

        <td class="px-2 py-3">

            <select
                class="select-status rounded-full border-none px-3 py-1 font-body text-xs font-semibold outline-none ${corStatus}"
            >
                ${Object.keys(STATUS_LABEL_INSCRICAO)
                    .map(key => `
                        <option
                            value="${key}"
                            ${key === statusKey ? "selected" : ""}
                        >
                            ${STATUS_LABEL_INSCRICAO[key]}
                        </option>
                    `)
                    .join("")}
            </select>

        </td>

        <td class="px-2 py-3">

            ${
                inscricao.presente
                    ? `
                        <span class="rounded-full border border-ink/10 px-3 py-1.5 font-body text-xs font-semibold text-ink/70">
                            ✓ Presente
                        </span>
                    `
                    : `
                        <button
                            type="button"
                            class="btn-checkin rounded-full bg-accent px-3 py-1.5 font-body text-xs font-semibold text-accent-ink transition hover:opacity-90"
                        >
                            Marcar presença
                        </button>
                    `
            }

        </td>

        <td class="px-2 py-3 text-right">

            <button
                type="button"
                class="btn-excluir-inscricao flex h-8 w-8 items-center justify-center rounded-full text-danger transition hover:bg-danger-soft"
            >
                🗑
            </button>

        </td>
    `;


    // Trocar status
    linha
        .querySelector(".select-status")
        .addEventListener("change", function (event) {

            alterarStatusInscricao(
                indexReal,
                event.target.value
            );

        });


    // Marcar presença
    const btnCheckin =
        linha.querySelector(".btn-checkin");

    if (btnCheckin) {

        btnCheckin.addEventListener("click", function () {

            marcarPresenca(indexReal);

        });

    }


    // Excluir
    linha
        .querySelector(".btn-excluir-inscricao")
        .addEventListener("click", function () {

            excluirInscricao(indexReal);

        });


    return linha;
}


// ===============================
// RENDERIZAR INSCRIÇÕES
// ===============================

function renderizarLista(lista) {

    listaInscricoes.innerHTML = "";

    if (lista.length === 0) {
        return;
    }

    lista.forEach(function (inscricao) {
    const indexReal = inscricoes.indexOf(inscricao);
    const linha = criarLinhaInscricao(inscricao, indexReal);
    listaInscricoes.appendChild(linha);
});
}

renderizarLista(inscricoes);


// ===============================
// AÇÕES DA LINHA
// ===============================

function alterarStatusInscricao(indexReal, novoStatus) {

    inscricoes[indexReal].status = novoStatus;

    localStorage.setItem(
        "inscricoes",
        JSON.stringify(inscricoes)
    );

    renderizarLista(inscricoes);
}


function marcarPresenca(indexReal) {

    inscricoes[indexReal].presente = true;

    localStorage.setItem(
        "inscricoes",
        JSON.stringify(inscricoes)
    );

    renderizarLista(inscricoes);
}


function excluirInscricao(indexReal) {

    inscricoes.splice(indexReal, 1);

    localStorage.setItem(
        "inscricoes",
        JSON.stringify(inscricoes)
    );

    renderizarLista(inscricoes);
}


// ===============================
// NOVA INSCRIÇÃO
// ===============================

formulario.addEventListener("submit", function (event) {

    event.preventDefault();

    

    const eventoEscolhido =
        eventoInscricao.value;

    const participanteEscolhido =
        participanteInscricao.value;

    const statusEscolhido =
        statusInscricao.value;


    const novaInscricao = {

        evento: eventoEscolhido,

        participante: participanteEscolhido,

        status: statusEscolhido,

        dataInscricao:
            new Date().toISOString(),

        presente: false

    };


    inscricoes.push(novaInscricao);


    localStorage.setItem(
        "inscricoes",
        JSON.stringify(inscricoes)
    );


    renderizarLista(inscricoes);

    fecharFormulario();

});


// ===============================
// FILTROS
// ===============================

function aplicarFiltros() {

    const statusEscolhido =
        statusCard.value;

    const eventoEscolhido =
        categoriaCard.value;


    const inscricoesFiltradas =
        inscricoes.filter(function (inscricao) {

            const filtroStatus =
                statusEscolhido === "todos" ||
                inscricao.status === statusEscolhido;


            const filtroEvento =
                eventoEscolhido === "todas" ||
                inscricao.evento === eventoEscolhido;


            return filtroStatus && filtroEvento;

        });


    renderizarLista(inscricoesFiltradas);
}


statusCard.addEventListener(
    "change",
    aplicarFiltros
);

categoriaCard.addEventListener(
    "change",
    aplicarFiltros
);


// ===============================
// MENU MOBILE
// ===============================

function abrirSidebar() {

    sidebar.classList.add("open");

    scrim.classList.add("active");

}

function fecharSidebar() {

    sidebar.classList.remove("open");

    scrim.classList.remove("active");

}

menuToggle.addEventListener(
    "click",
    abrirSidebar
);

scrim.addEventListener(
    "click",
    fecharSidebar
);


document
    .querySelectorAll("#navList .nav-item")
    .forEach(function (item) {

        item.addEventListener(
            "click",
            fecharSidebar
        );

    });


// ===============================
// TEMA CLARO / ESCURO
// ===============================

const themeToggle =
    document.getElementById("theme-toggle");

const temaSalvo =
    localStorage.getItem("eventflow-tema");


function atualizarIconeTema() {

    const icone =
        themeToggle.querySelector("i");

    const isDark =
        document.documentElement.getAttribute(
            "data-theme"
        ) === "dark";

    icone.textContent =
        isDark ? "☀️" : "🌙";
}


if (temaSalvo === "dark") {

    document.documentElement.setAttribute(
        "data-theme",
        "dark"
    );

}

atualizarIconeTema();


themeToggle.addEventListener(
    "click",
    function () {

        const temaAtual =
            document.documentElement.getAttribute(
                "data-theme"
            );


        if (temaAtual === "dark") {

            document.documentElement.removeAttribute(
                "data-theme"
            );

            localStorage.setItem(
                "eventflow-tema",
                "light"
            );

        } else {

            document.documentElement.setAttribute(
                "data-theme",
                "dark"
            );

            localStorage.setItem(
                "eventflow-tema",
                "dark"
            );

        }


        atualizarIconeTema();

    }
);