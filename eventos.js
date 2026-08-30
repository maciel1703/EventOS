const btnAdd = document.getElementById("button-add");
const formulario = document.getElementById("form-evento");
const cancelForm = document.getElementById("cancelar-form");
const fecharForm = document.getElementById("fechar-form");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const scrim = document.getElementById("scrim");

const nomeEvento = document.getElementById("nome-evento");
const descricaoEvento = document.getElementById("descricao-evento");
const dataEvento = document.getElementById("data-evento");
const horarioEvento = document.getElementById("horario-evento");
const localEvento = document.getElementById("local-evento");
const categoriaEvento = document.getElementById("categoria-evento");
const statusEvento = document.getElementById("status-evento");
const capacidadeEvento = document.getElementById("capacidade-evento");
const precoEvento = document.getElementById("preco-evento");

const listEvents = document.getElementById("lista-eventos");

// Filtros do catálogo
const filtroCategoria = document.getElementById("categoria-card");
const filtroStatus = document.getElementById("status-card");
const filtroData = document.getElementById("data");

// Controla se o formulário está criando ou editando um evento
let eventoEditandoIndex = null;

// ===============================
// HELPERS
// ===============================

function normalizarChave(texto) {
    if (!texto) return "";
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function formatarData(dataISO) {
    if (!dataISO) return "Data não informada";
    const [ano, mes, dia] = dataISO.split("-");
    const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    return `${dia} de ${meses[Number(mes) - 1]} de ${ano}`;
}

function formatarPreco(preco) {
    return preco > 0
        ? `R$ ${Number(preco).toFixed(2).replace(".", ",")}`
        : "Gratuito";
}

function gerarCodigo() {
    return "#" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ===============================
// CARREGAR E CORRIGIR EVENTOS SALVOS
// ===============================

const dados = localStorage.getItem("eventflow-eventos");
let eventos = dados ? JSON.parse(dados) : [];

eventos = eventos.map(function (evento) {
    return {
        nome: evento.nome || "Evento sem nome",
        descricao: evento.descricao || "",
        data: evento.data || "",
        horario: evento.horario || "",
        local: evento.local || "",
        categoria: evento.categoria || "outros",
        status: evento.status || "proximo",
        capacidade: evento.capacidade || 0,
        preco: evento.preco || 0,
        inscritos: evento.inscritos || 0,
        codigo: evento.codigo || gerarCodigo(),
    };
});

localStorage.setItem("eventflow-eventos", JSON.stringify(eventos));

function salvarEventos() {
    localStorage.setItem("eventflow-eventos", JSON.stringify(eventos));
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
    eventoEditandoIndex = null;
}

fecharForm.addEventListener("click", fecharFormulario);
cancelForm.addEventListener("click", fecharFormulario);

formulario.addEventListener("click", function (event) {
    if (event.target === formulario) {
        fecharFormulario();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !formulario.classList.contains("hidden")) {
        fecharFormulario();
    }
});

btnAdd.addEventListener("click", function () {
    eventoEditandoIndex = null;
    formulario.reset();
    abrirFormulario();
});

// ===============================
// CRIAR / ATUALIZAR EVENTO
// ===============================

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const dadosFormulario = {
        nome: nomeEvento.value,
        descricao: descricaoEvento.value,
        data: dataEvento.value,
        horario: horarioEvento.value,
        local: localEvento.value,
        categoria: categoriaEvento.value,
        status: statusEvento.value,
        capacidade: Number(capacidadeEvento.value),
        preco: Number(precoEvento.value),
    };

    if (eventoEditandoIndex !== null) {
        // Atualiza mantendo inscritos e código originais
        const eventoOriginal = eventos[eventoEditandoIndex];
        eventos[eventoEditandoIndex] = Object.assign(
            {},
            eventoOriginal,
            dadosFormulario
        );
    } else {
        // Cria novo
        eventos.push(
            Object.assign({}, dadosFormulario, {
                inscritos: 0,
                codigo: gerarCodigo(),
            })
        );
    }

    salvarEventos();
    aplicarFiltros();

    formulario.reset();
    fecharFormulario();
});

// ===============================
// PREENCHER FORMULÁRIO PARA EDIÇÃO
// ===============================

function editarEvento(index) {
    const evento = eventos[index];
    if (!evento) return;

    eventoEditandoIndex = index;

    nomeEvento.value = evento.nome;
    descricaoEvento.value = evento.descricao;
    dataEvento.value = evento.data;
    horarioEvento.value = evento.horario;
    localEvento.value = evento.local;
    categoriaEvento.value = evento.categoria;
    statusEvento.value = evento.status;
    capacidadeEvento.value = evento.capacidade;
    precoEvento.value = evento.preco;

    abrirFormulario();
}

// ===============================
// EXCLUIR EVENTO
// ===============================

function excluirEvento(index) {
    const evento = eventos[index];
    if (!evento) return;

    const confirmar = confirm(`Excluir o evento "${evento.nome}"?`);
    if (!confirmar) return;

    eventos.splice(index, 1);
    salvarEventos();
    aplicarFiltros();
}

// ===============================
// CORES / ESTILO DOS CARDS
// ===============================

const CORES_CATEGORIA = {
    tecnologia: "bg-indigo-100 text-indigo-700",
    negocios: "bg-amber-soft text-amber",
    arte: "bg-danger-soft text-danger",
    educacao: "bg-teal-soft text-teal",
    esportes: "bg-teal-soft text-teal",
    comunidade: "bg-blue-100 text-blue-700",
    outros: "bg-bg-soft text-muted",
};

const CORES_STATUS = {
    proximo: "bg-teal-soft text-teal",
    andamento: "bg-amber-soft text-amber",
    encerrado: "bg-bg-soft text-muted",
    concluido: "bg-bg-soft text-muted",
    cancelado: "bg-danger-soft text-danger",
};

const STATUS_LABEL = {
    proximo: "Próximo",
    andamento: "Em andamento",
    encerrado: "Encerrado",
};

// ===============================
// CRIAR CARD
// ===============================

function criarCardEvento(evento, indexReal) {
    const inscritos = evento.inscritos || 0;
    const ocupacao = evento.capacidade
        ? Math.round((inscritos / evento.capacidade) * 100)
        : 0;

    const catKey = normalizarChave(evento.categoria);
    const statusKey = normalizarChave(evento.status);

    const corCategoria = CORES_CATEGORIA[catKey] || "bg-bg-soft text-muted";
    const corStatus = CORES_STATUS[statusKey] || "bg-bg-soft text-muted";
    const statusLabel = STATUS_LABEL[statusKey] || evento.status;

    const dataFormatada = formatarData(evento.data);
    const precoFormatado = formatarPreco(evento.preco);

    const card = document.createElement("div");
    card.className =
        "flex flex-col gap-3 rounded-event border border-ink/10 bg-surface p-5 transition hover:-translate-y-0.5";
    card.style.boxShadow = "var(--color-shadow)";

    card.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="rounded-event-sm px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide ${corCategoria}">
                ${evento.categoria}
            </span>
            <span class="rounded-full px-2.5 py-1 font-body text-xs font-medium ${corStatus}">
                ${statusLabel}
            </span>
        </div>

        <div>
            <h3 class="font-display text-lg font-semibold text-ink">${evento.nome}</h3>
            <p class="mt-1 font-body text-sm text-muted">${evento.descricao}</p>
        </div>

        <div class="flex flex-col gap-1 font-body text-sm text-ink/80">
            <span>📅 ${dataFormatada} · ${evento.horario}</span>
            <span>📍 ${evento.local}</span>
            <span>👥 ${inscritos} / ${evento.capacidade} inscritos</span>
        </div>

        <div>
            <div class="mb-1 flex justify-between font-body text-xs text-muted">
                <span>Ocupação:</span><span>${ocupacao}%</span>
            </div>
            <div class="h-1.5 w-full rounded-full bg-bg-soft">
                <div class="h-1.5 rounded-full bg-accent" style="width:${ocupacao}%"></div>
            </div>
        </div>

        <div class="flex items-center justify-between border-t border-ink/10 pt-3">
            <div>
                <p class="font-mono text-xs text-muted">${evento.codigo}</p>
                <p class="font-display text-base font-bold text-accent">${precoFormatado}</p>
            </div>
            <div class="flex gap-1">
                <button type="button" class="btn-editar flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-bg-soft hover:text-ink">
                    ✎
                </button>
                <button type="button" class="btn-excluir flex h-8 w-8 items-center justify-center rounded-full text-danger transition hover:bg-danger-soft">
                    🗑
                </button>
            </div>
        </div>
    `;

    card.querySelector(".btn-editar").addEventListener("click", function () {
        editarEvento(indexReal);
    });

    card.querySelector(".btn-excluir").addEventListener("click", function () {
        excluirEvento(indexReal);
    });

    return card;
}

// ===============================
// FILTROS E ORDENAÇÃO
// ===============================

function aplicarFiltros() {
    const categoriaSelecionada = filtroCategoria.value;
    const statusSelecionado = filtroStatus.value;
    const ordenacao = filtroData.value;

    // Mantém o índice real de cada evento (necessário pra editar/excluir certo)
    let eventosComIndice = eventos.map(function (evento, index) {
        return { evento: evento, index: index };
    });

    // Filtro de categoria
    if (categoriaSelecionada && categoriaSelecionada !== "todas") {
        eventosComIndice = eventosComIndice.filter(function (item) {
            return normalizarChave(item.evento.categoria) === normalizarChave(categoriaSelecionada);
        });
    }

    // Filtro de status
    if (statusSelecionado && statusSelecionado !== "todos") {
        eventosComIndice = eventosComIndice.filter(function (item) {
            return normalizarChave(item.evento.status) === normalizarChave(statusSelecionado);
        });
    }

    // Ordenação
    eventosComIndice.sort(function (a, b) {
        if (ordenacao === "proxima") {
            return new Date(a.evento.data) - new Date(b.evento.data);
        }
        if (ordenacao === "distante") {
            return new Date(b.evento.data) - new Date(a.evento.data);
        }
        if (ordenacao === "nome") {
            return a.evento.nome.localeCompare(b.evento.nome);
        }
        if (ordenacao === "ocupacao") {
            const ocupA = a.evento.capacidade ? a.evento.inscritos / a.evento.capacidade : 0;
            const ocupB = b.evento.capacidade ? b.evento.inscritos / b.evento.capacidade : 0;
            return ocupB - ocupA;
        }
        return 0;
    });

    renderizarLista(eventosComIndice);
}

filtroCategoria.addEventListener("change", aplicarFiltros);
filtroStatus.addEventListener("change", aplicarFiltros);
filtroData.addEventListener("change", aplicarFiltros);

// ===============================
// RENDERIZAR LISTA
// ===============================

function renderizarLista(eventosComIndice) {
    listEvents.innerHTML = "";
    listEvents.className =
        "mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5";

    if (eventosComIndice.length === 0) {
        listEvents.className = "mt-6";
        listEvents.innerHTML = `
            <p class="font-body text-sm text-muted">
                Nenhum evento encontrado com esses filtros.
            </p>
        `;
        return;
    }

    eventosComIndice.forEach(function (item) {
        const card = criarCardEvento(item.evento, item.index);
        listEvents.appendChild(card);
    });
}

// ===============================
// MENU MOBILE (sidebar off-canvas)
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

// Fecha o menu ao clicar em qualquer link/botão da navegação (mobile)
document.querySelectorAll("#navList .nav-item").forEach(function (item) {
    item.addEventListener("click", fecharSidebar);
});

// ===============================
// RENDERIZAÇÃO INICIAL
// ===============================

aplicarFiltros();