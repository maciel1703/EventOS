const btnAdd = document.getElementById("button-add");
const formulario = document.getElementById("form-evento");

const nomeEvento = document.getElementById("nome-evento");
const descricaoEvento = document.getElementById("descricao-evento");
const dataEvento = document.getElementById("data-evento");
const horarioEvento = document.getElementById("horario-evento");
const localEvento = document.getElementById("local-evento");
const categoriaEvento = document.getElementById("categoria-evento");
const statusEvento = document.getElementById("status-evento");
const capacidadeEvento = document.getElementById("capacidade-evento");
const precoEvento = document.getElementById("preco-evento");

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const scrim = document.getElementById("scrim");

const canvasEventos = document.getElementById("grafico-eventos");

const meses = ["jun", "jul", "ago", "set", "out", "nov"];

const contexto = canvasEventos.getContext("2d");

let largura = 0;
let altura = 0;

const dados = localStorage.getItem("eventflow-eventos");
const eventos = dados ? JSON.parse(dados) : [];

const listEvents = document.getElementById("lista-eventos");

const fecharForm = document.getElementById("fechar-form");
const cancelarForm = document.getElementById("cancelar-form");

const listaAtividades = document.getElementById("lista-atividades");

const statEventosAtivos =
    document.getElementById("stat-eventos-ativos");

const statEventosTotal =
    document.getElementById("stat-eventos-total");

const statParticipantes =
    document.getElementById("stat-participantes");

const statInscricoesAtivas =
    document.getElementById("stat-inscricoes-ativas");

const statOcupacaoMedia =
    document.getElementById("stat-ocupacao-media");


// ===============================
// CANVAS
// ===============================

function ajustarTamanhoCanvas() {

    const dpr = window.devicePixelRatio || 1;
    const rect = canvasEventos.getBoundingClientRect();

    canvasEventos.width = rect.width * dpr;
    canvasEventos.height = rect.height * dpr;

    contexto.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    largura = rect.width;
    altura = rect.height;
}


// ===============================
// BARRA ARREDONDADA
// ===============================

function desenharBarraArredondada(
    x,
    y,
    largura,
    altura,
    raio
) {

    contexto.beginPath();

    contexto.moveTo(
        x,
        y + altura
    );

    contexto.lineTo(
        x,
        y + raio
    );

    contexto.arcTo(
        x,
        y,
        x + raio,
        y,
        raio
    );

    contexto.lineTo(
        x + largura - raio,
        y
    );

    contexto.arcTo(
        x + largura,
        y,
        x + largura,
        y + raio,
        raio
    );

    contexto.lineTo(
        x + largura,
        y + altura
    );

    contexto.closePath();

    contexto.fill();
}


// ===============================
// GRÁFICO
// ===============================

function renderizarGrafico() {

    ajustarTamanhoCanvas();

    const quantidadeEventos = Array(6).fill(0);

    eventos.forEach(function (evento) {

        const partesData = evento.data.split("-");

        const indiceMes =
            Number(partesData[1]) - 6;

        if (
            indiceMes >= 0 &&
            indiceMes < 6
        ) {

            quantidadeEventos[indiceMes] =
                quantidadeEventos[indiceMes] + 1;
        }

    });

    contexto.clearRect(
        0,
        0,
        largura,
        altura
    );

    const maiorQuantidade =
        Math.max(
            ...quantidadeEventos,
            1
        );

    const alturaRotulos = 24;

    const alturaUtil =
        altura - alturaRotulos;

    const alturaMinima = 6;

    const espacamento = 24;

    const larguraColuna =
        largura / 6;

    const larguraBarra =
        larguraColuna - espacamento;


    for (let i = 0; i < 6; i++) {

        const quantidade =
            quantidadeEventos[i];

        const alturaBarra =
            quantidade > 0
                ? Math.max(
                    (quantidade / maiorQuantidade) *
                    alturaUtil,
                    alturaMinima
                )
                : alturaMinima;

        const x =
            i * larguraColuna +
            espacamento / 2;

        const y =
            alturaUtil - alturaBarra;


        contexto.fillStyle = "#f4653e";

        desenharBarraArredondada(
            x,
            y,
            larguraBarra,
            alturaBarra,
            6
        );


        contexto.fillStyle = "#9a9ba5";

        contexto.font =
            "12px sans-serif";

        contexto.textAlign =
            "center";

        contexto.fillText(
            meses[i],
            x + larguraBarra / 2,
            altura - 6
        );

    }
}


// ===============================
// ABRIR / FECHAR FORMULÁRIO
// ===============================

function fecharFormulario() {

    formulario.classList.add("hidden");

    formulario.classList.remove("flex");

    formulario.style.display = "none";

}


if (fecharForm) {

    fecharForm.addEventListener(
        "click",
        fecharFormulario
    );

}


if (cancelarForm) {

    cancelarForm.addEventListener(
        "click",
        fecharFormulario
    );

}


formulario.addEventListener(
    "click",
    function (event) {

        if (
            event.target === formulario
        ) {

            fecharFormulario();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            formulario.style.display === "flex"
        ) {

            fecharFormulario();

        }

    }
);


// ===============================
// BOTÃO NOVO EVENTO
// ===============================

btnAdd.addEventListener(
    "click",
    function () {

        formulario.classList.remove("hidden");

        formulario.classList.add("flex");

        formulario.style.display = "flex";

       

    }
);


// ===============================
// CRIAR EVENTO
// ===============================

formulario.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const evento = {

            nome: nomeEvento.value,

            descricao: descricaoEvento.value,

            data: dataEvento.value,

            horario: horarioEvento.value,

            local: localEvento.value,

            categoria: categoriaEvento.value,

            status: statusEvento.value,

            capacidade:
                Number(capacidadeEvento.value),

            preco:
                Number(precoEvento.value)

        };


        eventos.push(evento);


        localStorage.setItem(
            "eventflow-eventos",
            JSON.stringify(eventos)
        );


        rendenizarEventos();

        renderizarGrafico();

        atualizarVisaoGeral();


        formulario.reset();

        fecharFormulario();

    }
);


// ===============================
// VISÃO GERAL
// ===============================

function normalizarChaveDashboard(texto) {

    return (texto || "")
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


function atualizarVisaoGeral() {

    const dadosParticipantes =
        localStorage.getItem(
            "participantes"
        );

    const participantes =
        dadosParticipantes
            ? JSON.parse(dadosParticipantes)
            : [];


    const dadosInscricoes =
        localStorage.getItem(
            "inscricoes"
        );

    const inscricoes =
        dadosInscricoes
            ? JSON.parse(dadosInscricoes)
            : [];


    const totalEventos =
        eventos.length;


    const eventosAtivos =
        eventos.filter(
            function (evento) {

                return (
                    normalizarChaveDashboard(
                        evento.status
                    ) !== "encerrado"
                );

            }
        ).length;


    const inscricoesAtivas =
        inscricoes.filter(
            function (inscricao) {

                const status =
                    normalizarChaveDashboard(
                        inscricao.status
                    );

                return (
                    status === "confirmada" ||
                    inscricao.presente
                );

            }
        ).length;


    const eventosComCapacidade =
        eventos.filter(
            function (evento) {

                return (
                    Number(evento.capacidade) > 0
                );

            }
        );


    let ocupacaoMedia = 0;


    if (
        eventosComCapacidade.length > 0
    ) {

        const somaOcupacao =
            eventosComCapacidade.reduce(
                function (acc, evento) {

                    const inscritosDoEvento =
                        inscricoes.filter(
                            function (inscricao) {

                                const status =
                                    normalizarChaveDashboard(
                                        inscricao.status
                                    );

                                return (
                                    inscricao.evento ===
                                    evento.nome &&
                                    (
                                        status ===
                                        "confirmada" ||
                                        inscricao.presente
                                    )
                                );

                            }
                        ).length;


                    return (
                        acc +
                        Math.min(
                            inscritosDoEvento /
                            Number(evento.capacidade),
                            1
                        )
                    );

                },
                0
            );


        ocupacaoMedia =
            Math.round(
                (
                    somaOcupacao /
                    eventosComCapacidade.length
                ) * 100
            );

    }


    if (statEventosAtivos) {
        statEventosAtivos.textContent =
            eventosAtivos;
    }


    if (statEventosTotal) {
        statEventosTotal.textContent =
            `de ${totalEventos} no total`;
    }


    if (statParticipantes) {
        statParticipantes.textContent =
            participantes.length;
    }


    if (statInscricoesAtivas) {
        statInscricoesAtivas.textContent =
            inscricoesAtivas;
    }


    if (statOcupacaoMedia) {
        statOcupacaoMedia.textContent =
            `${ocupacaoMedia}%`;
    }


    renderizarAtividadesRecentes(
        inscricoes
    );

}


// ===============================
// ATIVIDADES RECENTES
// ===============================

function renderizarAtividadesRecentes(
    inscricoes
) {

    if (!listaAtividades) {
        return;
    }


    listaAtividades.innerHTML = "";


    if (inscricoes.length === 0) {

        listaAtividades.innerHTML = `
            <p class="font-body text-sm text-muted">
                Nenhuma atividade recente ainda.
            </p>
        `;

        return;

    }


    const recentes =
        inscricoes
            .slice()
            .sort(
                function (a, b) {

                    return (
                        new Date(
                            b.dataInscricao
                        ) -
                        new Date(
                            a.dataInscricao
                        )
                    );

                }
            )
            .slice(0, 6);


    recentes.forEach(
        function (inscricao) {

            const data =
                inscricao.dataInscricao
                    ? new Date(
                        inscricao.dataInscricao
                    )
                    : null;


            const dataFormatada =
                data
                    ? `${data.toLocaleDateString(
                        "pt-BR"
                    )} às ${data.toLocaleTimeString(
                        "pt-BR",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    )}`
                    : "—";


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "flex gap-3";


            item.innerHTML = `
                <span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent"></span>

                <div class="flex flex-col gap-2">

                    <p class="font-body">

                        <span class="font-semibold">
                            ${inscricao.participante}
                        </span>

                        se inscreveu em
                        ${inscricao.evento}

                    </p>

                    <span class="font-body text-sm text-muted">
                        ${dataFormatada}
                    </span>

                </div>
            `;


            listaAtividades.appendChild(
                item
            );

        }
    );

}


// ===============================
// LISTA DE EVENTOS
// ===============================

function rendenizarEventos() {

    listEvents.innerHTML = "";


    eventos.forEach(
        function (evento) {

            const partesData =
                evento.data.split("-");


            const newEvent =
                document.createElement(
                    "div"
                );


            newEvent.classList.add(
                "items-center",
                "flex",
                "gap-3"
            );


            newEvent.innerHTML = `

                <div class="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-accent/10 font-mono">

                    <span class="text-[10px] font-medium text-accent lowercase">
                        ${partesData[1]}
                    </span>

                    <span class="text-[15px] font-bold text-ink">
                        ${partesData[2]}
                    </span>

                </div>


                <div class="flex flex-col">

                    <p class="font-body font-semibold text-ink leading-tight">
                        ${evento.nome}
                    </p>

                    <p class="font-body text-sm text-muted">
                        ${evento.horario} · ${evento.local}
                    </p>

                </div>

            `;


            listEvents.appendChild(
                newEvent
            );

        }
    );

}


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
    .querySelectorAll(
        "#navList .nav-item"
    )
    .forEach(
        function (item) {

            item.addEventListener(
                "click",
                fecharSidebar
            );

        }
    );


// ===============================
// TEMA CLARO / ESCURO
// ===============================

const themeToggle =
    document.getElementById(
        "theme-toggle"
    );


const temaSalvo =
    localStorage.getItem(
        "eventflow-tema"
    );


function atualizarIconeTema() {

    const icone =
        themeToggle.querySelector("i");


    const isDark =
        document.documentElement
            .getAttribute(
                "data-theme"
            ) === "dark";


    icone.textContent =
        isDark
            ? "☀️"
            : "🌙";

}


if (temaSalvo === "dark") {

    document.documentElement
        .setAttribute(
            "data-theme",
            "dark"
        );

}


atualizarIconeTema();


themeToggle.addEventListener(
    "click",
    function () {

        const temaAtual =
            document.documentElement
                .getAttribute(
                    "data-theme"
                );


        if (temaAtual === "dark") {

            document.documentElement
                .removeAttribute(
                    "data-theme"
                );

            localStorage.setItem(
                "eventflow-tema",
                "light"
            );

        } else {

            document.documentElement
                .setAttribute(
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


// ===============================
// ANIMAÇÃO
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const main =
            document.querySelector(
                "main.animate-fade-in"
            );


        if (main) {

            main.style.animation = "none";

            void main.offsetWidth;

            main.style.animation = "";

        }

    }
);


// ===============================
// REDIMENSIONAMENTO
// ===============================

window.addEventListener(
    "resize",
    renderizarGrafico
);


// ===============================
// INICIALIZAÇÃO
// ===============================

rendenizarEventos();

renderizarGrafico();

atualizarVisaoGeral();