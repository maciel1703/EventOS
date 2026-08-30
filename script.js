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


// ===============================
// CANVAS
// ===============================

function ajustarTamanhoCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasEventos.getBoundingClientRect();

    canvasEventos.width = rect.width * dpr;
    canvasEventos.height = rect.height * dpr;

    contexto.setTransform(dpr, 0, 0, dpr, 0, 0);

    largura = rect.width;
    altura = rect.height;
}


function desenharBarraArredondada(x, y, largura, altura, raio) {
    contexto.beginPath();

    contexto.moveTo(x, y + altura);

    contexto.lineTo(x, y + raio);

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

    eventos.forEach(function(evento) {

        const partesData = evento.data.split("-");

        const indiceMes = Number(partesData[1]) - 6;

        if (indiceMes >= 0 && indiceMes < 6) {

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
        Math.max(...quantidadeEventos, 1);

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
                    (quantidade / maiorQuantidade) * alturaUtil,
                    alturaMinima
                )
                : alturaMinima;

        const x =
            i * larguraColuna + espacamento / 2;

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

        contexto.font = "12px sans-serif";

        contexto.textAlign = "center";

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

}


fecharForm.addEventListener(
    "click",
    fecharFormulario
);


cancelarForm.addEventListener(
    "click",
    fecharFormulario
);


formulario.addEventListener(
    "click",
    function(event) {

        if (event.target === formulario) {

            fecharFormulario();

        }

    }
);


document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            !formulario.classList.contains("hidden")
        ) {

            fecharFormulario();

        }

    }
);


btnAdd.addEventListener(
    "click",
    function() {

        formulario.classList.remove("hidden");

        formulario.classList.add("flex");

    }
);


// ===============================
// CRIAR EVENTO
// ===============================

formulario.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const evento = {

            nome: nomeEvento.value,

            descricao: descricaoEvento.value,

            data: dataEvento.value,

            horario: horarioEvento.value,

            local: localEvento.value,

            categoria: categoriaEvento.value,

            status: statusEvento.value,

            capacidade: Number(capacidadeEvento.value),

            preco: Number(precoEvento.value)

        };


        eventos.push(evento);


        localStorage.setItem(
            "eventflow-eventos",
            JSON.stringify(eventos)
        );


        rendenizarEventos();

        renderizarGrafico();


        formulario.reset();

        fecharFormulario();

    }
);


// ===============================
// LISTA DE EVENTOS
// ===============================

function rendenizarEventos() {

    listEvents.innerHTML = "";


    eventos.forEach(function(evento) {

        const partesData =
            evento.data.split("-");


        const newEvent =
            document.createElement("div");


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


        listEvents.appendChild(newEvent);

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

document.querySelectorAll("#navList .nav-item").forEach(function (item) {
    item.addEventListener("click", fecharSidebar);
});


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