import Fase from './fase.modelo.js';

window.onload = () => {
    let fase = new Fase("nova", "nova fase");
    const canvas = document.getElementById("canvas-editor");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let quadros = [];

    const gridInput = document.getElementById("grid");
    gridInput.addEventListener("change", () => {
        fase.grid = parseInt(gridInput.value);
        console.log(fase);
        Start();
    });

    const tileSizeInput = document.getElementById("tileSize");
    tileSizeInput.addEventListener("change", () => {
        fase.tileSize = parseInt(tileSizeInput.value);
        console.log(fase);
        Start();
    });

    const startX = document.getElementById("startX");
    startX.addEventListener("change", () => {
        fase.startX = parseInt(startX.value);
        AtualizaPosInicial();
    });

    const startY = document.getElementById("startY");
    startY.addEventListener("change", () => {
        fase.startY = parseInt(startY.value);
        AtualizaPosInicial();
    });

    let limite = document.getElementById("limite");
    limite.addEventListener("change", () => {
        fase.commandLimit = parseInt(limite.value);
        if(limite.value == "0") fase.commandLimit = null;
    });
    
    let minimo = document.getElementById("minimo");
    minimo.addEventListener("change", () => {
        fase.minimalCommands = parseInt(minimo.value);
        if(minimo.value == "0") fase.minimalCommands = null;
    });

    const goalX = document.getElementById("goalX");
    goalX.addEventListener("change", () => {
        fase.goalX = parseInt(goalX.value);
        AtualizaObjetivo();
    });

    const goalY = document.getElementById("goalY");
    goalY.addEventListener("change", () => {
        fase.goalY = parseInt(goalY.value);
        AtualizaObjetivo();
    });

    function AtualizarFase(){
        fase.name = document.getElementById("nome").value;
        fase.description = document.getElementById("descricao").value;
        fase.grid = parseInt(gridInput.value);
        fase.tileSize = parseInt(tileSizeInput.value);
        fase.setStart(parseInt(startX.value),parseInt(startY.value));
        fase.setGoal(parseInt(goalX.value),parseInt(goalY.value));
        quadros.forEach(q => {
            if(q.parede) fase.walls.push({x:q.x, y:q.y});
        });
    }

    let comandos = document.getElementById("comandos");
    comandos.addEventListener("change", () => {
        fase.allowedCommands = [];
        Array.from(comandos.selectedOptions).forEach(op => {
            fase.allowedCommands.push(op.value);
        });
    });

    document.getElementById("btn-salvar-obj").addEventListener("click", () => {
        AtualizarFase()
        let saidaModal = document.getElementById("saida-modal");
        saidaModal.style.top = "50%";
        document.getElementById("saida").innerHTML = `<i id="btn-copy" class="bi bi-copy"></i>`+fase.getObj();
        document.getElementById("btn-copy").addEventListener("click", () => {
            navigator.clipboard.writeText(document.getElementById("saida").textContent);
            alert("Objeto copiado!")
        });
    });

    document.getElementById("btn-close-saida").addEventListener("click", () => {
        document.getElementById("saida-modal").style.top = "-100%";
    });

    document.getElementById("btn-salvar-json").addEventListener("click", () => {
        AtualizarFase()
        let saidaModal = document.getElementById("saida-modal");
        saidaModal.style.top = "50%";
        document.getElementById("saida").innerHTML = `<i id="btn-copy" class="bi bi-copy"></i>`+fase.json();
        document.getElementById("btn-copy").addEventListener("click", () => {
            navigator.clipboard.writeText(document.getElementById("saida").textContent);
            alert("Json copiado!")
        });
    });


    canvas.addEventListener("mousemove", e => {
        let m = {x: e.offsetX, y: e.offsetY};
        quadros.forEach(quadro => {
            let px = quadro.x * (fase.tileSize + 2) + 2;
            let py = quadro.y * (fase.tileSize + 2) + 2;

            if (
                m.x >= px &&
                m.x <= px + quadro.w &&
                m.y >= py &&
                m.y <= py + quadro.h
            ) {
                quadro.cor = "#ff0000"; // mouse em cima
            } else {
                quadro.cor = "#e3e3e3";
            }
        })
    });

    canvas.addEventListener("mousedown", e => {
        let m = {x: e.offsetX, y: e.offsetY};
        quadros.forEach(quadro => {
            let px = quadro.x * (fase.tileSize + 2) + 2;
            let py = quadro.y * (fase.tileSize + 2) + 2;
            
            if (
                m.x >= px &&
                m.x <= px + quadro.w &&
                m.y >= py &&
                m.y <= py + quadro.h
            ) {
                quadro.parede = true;
            }
        })
    });

    function AtualizaPosInicial(){
        quadros.forEach(quadro => {
            if(fase.startX == quadro.x && fase.startY == quadro.y) quadro.robo = true;
            else quadro.robo = false;
        })
    }
    
    function AtualizaObjetivo(){
        quadros.forEach(quadro => {
            if(fase.goalX == quadro.x && fase.goalY == quadro.y) quadro.objetivo = true;
            else quadro.objetivo = false;
        })
    }

    Start();
    function Start(){
        quadros = [];
        for(let i=0; i < fase.grid; i++){
            for(let x=0; x < fase.grid; x++){
                let robo = false;
                let objetivo = false;
                if(fase.startX == x && fase.startY == i) robo = true;
                if(fase.goalX == x && fase.goalY == i) objetivo = true;
                quadros.push({
                    x: x,
                    y: i,
                    cor: "#e3e3e3",
                    w: fase.tileSize,
                    h: fase.tileSize,
                    parede: false,
                    robo,
                    objetivo,
                })
            }
        }
    }

    Update();

    function Update(){
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        quadros.forEach(quadro => {
            ctx.fillStyle = quadro.cor;
            if(quadro.parede) ctx.fillStyle = "black";
            if(quadro.robo) ctx.fillStyle = "yellow";
            if(quadro.objetivo) ctx.fillStyle = "green";
            ctx.fillRect(quadro.x*(fase.tileSize+2)+2, quadro.y*(fase.tileSize+2)+2, quadro.w, quadro.h)
        });
        requestAnimationFrame(Update);
    }
}