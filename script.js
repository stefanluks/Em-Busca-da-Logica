// ==================== GAME LOGIC ====================
// Este arquivo contém toda a lógica do jogo "Em Busca da Lógica"
// Um jogo educativo que ensina programação e lógica através de puzzles

// ========== ESTADO DO JOGO ==========
// Objeto que armazena o estado atual do jogo
// currentLevel: qual fase o jogador está (1-5)
// sequence: array com os comandos que o jogador adicionou
// executing: booleano que indica se os comandos estão sendo executados
// executing_index: qual comando está sendo executado no momento
const gameState = {
    currentLevel: 1,
    sequence: [],
    executing: false,
    executing_index: 0,
};

// ========== DEFINIÇÃO DAS FASES ==========
// Objeto contendo as configurações de cada fase (1 a 5)
// Cada fase tem: nome, descrição, configuração do grid, posição inicial do robô,
// posição do objetivo, paredes, comandos permitidos e limites
const levels = {
    1: {
        name: "Sequência Simples",
        description: "Aprenda a executar comandos em sequência",
        grid: 8,                          // Grid de 8x8
        tileSize: 60,                      // Cada célula tem 60px
        startX: 1,                         // Posição X inicial do robô
        startY: 1,                         // Posição Y inicial do robô
        startDir: 0,                       // Direção inicial: 0=direita, 1=baixo, 2=esquerda, 3=cima
        goalX: 6,                          // Posição X do objetivo
        goalY: 1,                          // Posição Y do objetivo
        walls: [],                         // Sem paredes nesta fase
        allowedCommands: ['forward', 'left', 'right'],  // Comandos disponíveis
        commandLimit: null,                // Sem limite de comandos
        minimalCommands: 5,                // Melhor solução usa 5 comandos
    },
    2: {
        name: "Otimização",
        description: "Atinja o objetivo com limite de 5 comandos",
        grid: 8,
        tileSize: 60,
        startX: 1,
        startY: 3,
        startDir: 0,
        goalX: 4,
        goalY: 1,
        walls: [
            // Paredes que formam um padrão em "Z"
            // Paredes superiores - bloqueiam o topo
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
            // Paredes laterais esquerda - bloqueiam a esquerda
            { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 0, y: 7 },
            // Paredes laterais direita - bloqueiam a direita
            { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 },
            // Paredes inferiores - bloqueiam o fundo
            { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 },
            // Paredes bloqueando caminhos não desejados (forçam o padrão em Z)
            { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 2 },
            { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 3 },
            { x: 2, y: 4 }, { x: 2, y: 5 }, { x: 2, y: 6 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 },
            { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 },
        ],
        allowedCommands: ['forward', 'left', 'right'],
        commandLimit: 7,
        minimalCommands: 6,
    },
    3: {
        name: "Laço de Repetição",
        description: "Domine o comando Repetir",
        grid: 10,
        tileSize: 50,
        startX: 1,
        startY: 4,
        startDir: 0,
        goalX: 8,
        goalY: 4,
        walls: [],
        allowedCommands: ['forward', 'left', 'right', 'repeat'],
        commandLimit: 3,
        minimalCommands: 2,
    },
    4: {
        name: "Condições Lógicas",
        description: "Use decisões para resolver o puzzle",
        grid: 8,
        tileSize: 60,
        startX: 1,
        startY: 6,
        startDir: 0,
        goalX: 6,
        goalY: 2,
        walls: [
            // Paredes superiores
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
            // Paredes laterais esquerda
            { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 0, y: 7 },
            // Paredes laterais direita
            { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 },
            // Paredes inferiores
            { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 },
            // Bloqueando tudo exceto o caminho em degraus
            // Linha y=6
            { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 },
            // Linha y=5
            { x: 1, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 },
            // Linha y=4
            { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
            // Linha y=3
            { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 6, y: 3 },
            // Linha y=2
            { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
            // Linha y=1
            { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
            // Linha y=0
            { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
        ],
        allowedCommands: ['forward', 'left', 'right', 'repeat'],
        commandLimit: 8,
        minimalCommands: 6,
    },
    5: {
        name: "Algoritmo Complexo",
        description: "Siga o caminho em forma de L até o objetivo",
        grid: 8,
        tileSize: 60,
        startX: 7,
        startY: 6,
        startDir: 3,  // Virado para cima
        goalX: 1,
        goalY: 4,
        walls: [
            // Bloqueio superior
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
            // Bloqueio lateral esquerdo
            { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 0, y: 7 },
            // Bloqueio lateral direito
            { x: 7, y: 0 }, { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 7 },
            // Bloqueio inferior
            { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 },

            // Paredes bloqueando todas as outras áreas EXCETO o caminho em L invertido
            // Caminho livre: (7,6) → (7,5) → (7,4) → (6,4) → (5,4) → (4,4) → (3,4) → (2,4) → (1,4)

            // Linha y=6: bloquear exceto x=7
            { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 },

            // Linha y=5: bloquear exceto x=7
            { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 },

            // Linha y=4: bloquear exceto x=1,2,3,4,5,6 (o caminho horizontal)
            // Caminho horizontal está em y=4, então nada para bloquear aqui que já não esteja

            // Linha y=3: bloquear todas
            { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },

            // Linha y=2: bloquear todas
            { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 },

            // Linha y=1: bloquear todas
            { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 },
        ],
        allowedCommands: ['forward', 'left', 'repeat'],
        commandLimit: 6,
        minimalCommands: 4,
    }
};

// Robot State
// Objeto que armazena a posição e estado atual do robô
// x, y: coordenadas do robô no grid
// dir: direção que o robô está olhando (0=direita, 1=baixo, 2=esquerda, 3=cima)
// trail: array com o histórico de posições visitadas (para desenhar o caminho)
let robot = {
    x: 0,
    y: 0,
    dir: 0,
    trail: [],
};

let currentLevel = null;    // Fase atual carregada
let draggedItem = null;     // Item que está sendo arrastado no drag-and-drop

// ==================== FUNÇÕES DE INTERFACE ==========
// Estas funções controlam a mudança entre telas do jogo

// Função para alternar entre telas (Menu, Jogo, Vitória, etc)
// Remove a classe 'active' de todas as telas e adiciona à tela especificada
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goToLevelSelect() {
    switchScreen('levelSelectScreen');
}

function backToMenu() {
    switchScreen('menuScreen');
}

function backToLevelSelect() {
    switchScreen('levelSelectScreen');
}

function showInstructions() {
    switchScreen('instructionsScreen');
}

function startLevel(levelNum) {
    gameState.currentLevel = levelNum;
    currentLevel = levels[levelNum];
    initializeLevel();
    switchScreen('gameScreen');
}

function nextLevel() {
    if (gameState.currentLevel < 6) {
        startLevel(gameState.currentLevel + 1);
    } else {
        switchScreen('menuScreen');
    }
}

// ==================== INICIALIZAÇÃO DE FASES ====================
// Função chamada quando o jogador seleciona uma fase
// Prepara tudo para começar: reseta sequência, posiciona robô, atualiza interface
function initializeLevel() {
    // RESETAR A SEQUÊNCIA DE COMANDOS
    // Limpa todos os comandos anteriores e reseta índices de execução
    gameState.sequence = [];          // Array vazio de comandos
    gameState.executing = false;      // Não está executando
    gameState.executing_index = 0;    // Começa no comando 0
    gameState.executing_stack = [];   // Stack para loops aninhados

    // INICIALIZAR POSIÇÃO DO ROBÔ
    // Posiciona o robô na posição inicial definida na fase
    robot = {
        x: currentLevel.startX,        // Coordenada X inicial
        y: currentLevel.startY,        // Coordenada Y inicial
        dir: currentLevel.startDir,    // Direção inicial (0-3)
        trail: [],                     // Limpar histórico de movimento
    };

    // ATUALIZAR INTERFACE DO JOGO
    // Mostra o nome e descrição da fase na tela
    document.getElementById('levelTitle').textContent = `Fase ${gameState.currentLevel} - ${currentLevel.name}`;
    document.getElementById('levelDesc').textContent = currentLevel.description;
    document.getElementById('commandLimit').textContent = currentLevel.commandLimit || '∞';  // Mostra limite de comandos
    document.getElementById('commandCount').textContent = '0';  // Zera contador de comandos usados

    // MOSTRAR/ESCONDER BOTÕES DE COMANDO
    // Apenas os comandos permitidos pela fase aparecem como botões
    document.getElementById('repeatBtn').style.display =
        currentLevel.allowedCommands.includes('repeat') ? 'block' : 'none';  // Mostrar se fase permite Repetir
    document.getElementById('ifBtn').style.display =
        currentLevel.allowedCommands.includes('if') ? 'block' : 'none';  // Mostrar se fase permite Se Livre

    // LIMPAR ÁREA DE SEQUÊNCIA
    // Remove todos os blocos de comando adicionados pelo jogador
    clearSequence();

    // DESENHAR CANVAS
    // Renderiza o mapa com paredes, robô e objetivo
    draw();
}

// ==================== SISTEMA DE ARRASTAR E SOLTAR (DRAG & DROP) ====================
// Permite que o jogador arraste blocos de comando para a área de execução

// Função chamada quando um bloco é arrastado
// Armazena qual tipo de comando está sendo arrastado
function dragStart(e, commandType) {
    draggedItem = commandType;  // Salva o tipo de comando sendo arrastado
    e.dataTransfer.effectAllowed = 'copy';  // Permite copiar o item
}

// Função chamada quando o mouse passa sobre a área de drop
// Permite que a área receba o item arrastado
function allowDrop(e) {
    e.preventDefault();  // Permite o drop
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('drag-over');  // Muda visual da área
}

// Função chamada quando o item é solto na área de comandos
// Adiciona o comando à sequência do jogador
function drop(e) {
    e.preventDefault();  // Previne comportamento padrão
    e.currentTarget.classList.remove('drag-over');  // Remove visual especial

    if (!draggedItem) return;

    // Check command limit
    if (currentLevel.commandLimit && gameState.sequence.length >= currentLevel.commandLimit) {
        alert(`Limite de ${currentLevel.commandLimit} comandos atingido!`);
        return;
    }

    let repeatValue = 2;  // Valor padrão para repetições (será perguntado ao usuário)

    // COMANDO REPETIR - PEDIR QUANTIDADE DE VEZES
    // Se o comando for "repetir", pergunta quantas vezes repetir (1-10)
    if (draggedItem === 'repeat') {
        const input = prompt('Quantas vezes repetir? (1-10)', '2');
        if (input === null) return;  // Usuário cancelou
        repeatValue = parseInt(input);  // Converte para número
        if (isNaN(repeatValue) || repeatValue < 1 || repeatValue > 10) {
            alert('Por favor, digite um número entre 1 e 10');  // Validação
            return;
        }
    }

    // ADICIONAR COMANDO À SEQUÊNCIA
    // Cria um objeto com o tipo de comando e seu valor (se houver)
    const commandText = getCommandText(draggedItem);
    gameState.sequence.push({
        type: draggedItem,                                      // Tipo do comando
        value: draggedItem === 'repeat' ? repeatValue : null,  // Valor de repetição (ou null)
    });

    // ATUALIZAR VISUAL DA SEQUÊNCIA
    renderSequence();  // Redesenha os blocos de comando na tela
    draggedItem = null;  // Limpa o item arrastado
}

// Função que converte tipo de comando em texto legível
// Usada para exibir o comando com ícones e descrição
function getCommandText(type, value) {
    const texts = {
        'forward': '→ Andar',           // Seta direita + texto "Andar"
        'left': '↶ Esquerda',          // Seta curva + texto "Esquerda"
        'right': '↷ Direita',          // Seta curva + texto "Direita"
        'repeat': `⟲ Repetir ${value || 2}x`,  // Seta dupla + número de repetições
        'if': '? Se Livre',            // Interrogação + texto "Se Livre"
    };
    return texts[type] || type;  // Retorna o texto correspondente ou o tipo se não encontrado
}

// ==================== GERENCIAMENTO DE SEQUÊNCIA DE COMANDOS ====================
// Funções que controlam a exibição, remoção e execução dos blocos de comando

// Função que desenha os blocos de comando na área de sequência
// Mostra visualmente todos os comandos que o jogador adicionou
function renderSequence() {
    const sequenceArea = document.getElementById('sequenceArea');  // Área onde aparecem os blocos

    // SE NÃO HÁ COMANDOS, MOSTRAR MENSAGEM DE VAZIO
    if (gameState.sequence.length === 0) {
        sequenceArea.innerHTML = '<p class="placeholder">Arraste comandos aqui</p>';  // Mostra placeholder
        return;
    }

    // CONSTRUIR HTML PARA CADA COMANDO
    let html = '';
    gameState.sequence.forEach((cmd, index) => {
        // Define classe CSS especial para comandos Repetir e Se Livre
        const classNames = cmd.type === 'repeat' ? 'repeat-block' : cmd.type === 'if' ? 'if-block' : '';
        html += `
            <div class="command-block ${classNames}">
                <span class="block-content">${getCommandText(cmd.type, cmd.value)}</span>
                <button class="block-remove" onclick="removeCommand(${index})">✕</button>
            </div>
        `;
    });

    // COLOCAR HTML NA PÁGINA E ATUALIZAR CONTADOR
    sequenceArea.innerHTML = html;
    document.getElementById('commandCount').textContent = gameState.sequence.length;  // Atualiza contador de comandos
}

// Remove um comando específico da sequência pelo índice
// Usado quando o jogador clica no X de um bloco
function removeCommand(index) {
    gameState.sequence.splice(index, 1);  // Remove o comando na posição 'index'
    renderSequence();  // Redesenha os blocos
}

// Limpa todos os comandos da sequência
// Usado quando o jogador clica em "Limpar"
function clearSequence() {
    gameState.sequence = [];  // Esvazia array de comandos
    renderSequence();  // Redesenha (mostra placeholder vazio)
}

// ==================== EXECUÇÃO DOS COMANDOS ====================
// Estas funções controlam como os comandos são executados no robô

// Função principal que inicia a execução dos comandos
// Verificas se há comandos, "achata" repetições e começa a executar
function executeSequence() {
    if (gameState.sequence.length === 0) {
        alert('Adicione comandos à sequência!');  // Aviso se nenhum comando foi adicionado
        return;
    }

    gameState.executing = true;        // Marca como em execução
    gameState.executing_index = 0;     // Começa no primeiro comando
    robot.trail = [];                  // Limpa rastro anterior

    // ACHATAR REPETIÇÕES EM SEQUÊNCIA LINEAR
    // Converte comandos Repetir em múltiplas cópias do comando
    // Exemplo: Repetir(2) [Andar, Esquerda] → [Andar, Esquerda, Andar, Esquerda]
    const flattenedSequence = flattenCommands(gameState.sequence);
    console.log('Sequência achatada:', flattenedSequence.map(c => c.type).join(' → '));

    // Começa a executar o primeiro comando
    executeNextCommand(flattenedSequence, 0);
}

// Função que expande comandos Repetir em uma sequência linear
// Recursiva para suportar Repetir aninhado
function flattenCommands(commands, depth = 0) {
    let flattened = [];

    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];

        if (cmd.type === 'repeat') {
            let repeatCount = cmd.value || 2;
            // Collect commands to repeat (until end or another repeat)
            let repeatCommands = [];
            let j = i + 1;
            while (j < commands.length && commands[j].type !== 'repeat') {
                repeatCommands.push(commands[j]);
                j++;
            }

            // Only process if there are commands to repeat
            if (repeatCommands.length > 0) {
                for (let r = 0; r < repeatCount; r++) {
                    flattened = flattened.concat(flattenCommands(repeatCommands, depth + 1));
                }
                i += repeatCommands.length;
            }
        } else if (cmd.type !== 'if') {
            flattened.push(cmd);
        } else {
            // Handle 'if' command
            flattened.push(cmd);
        }
    }

    return flattened;
}

function executeNextCommand(commands, index) {
    if (!gameState.executing) return;

    if (index >= commands.length) {
        // Finished all commands
        gameState.executing = false;
        console.log(`✓ Execução concluída! Robô em (${robot.x}, ${robot.y}), Objetivo: (${currentLevel.goalX}, ${currentLevel.goalY})`);
        checkVictory();
        draw();
        return;
    }

    const cmd = commands[index];
    console.log(`Passo ${index + 1}/${commands.length}: ${cmd.type}`);

    // Handle if condition
    if (cmd.type === 'if') {
        const canMove = canMoveForward();
        console.log(`  → Condição "se caminho livre": ${canMove ? 'SIM' : 'NÃO'}`);
        if (!canMove) {
            // Condition false, skip next command
            console.log(`    → Pulando próximo comando`);
            // Only skip if there's a next command
            const nextIndex = index + 2;
            if (nextIndex < commands.length) {
                setTimeout(() => executeNextCommand(commands, nextIndex), 300);
            } else {
                // No more commands, finish execution
                gameState.executing = false;
                checkVictory();
                draw();
            }
            return;
        }
        // If true, execute next command
        console.log(`    → Executando próximo comando`);
        setTimeout(() => executeNextCommand(commands, index + 1), 300);
        return;
    }

    // Execute regular command
    const success = executeCommand(cmd.type);
    draw();

    if (!success) {
        // Collision occurred
        return;
    }

    setTimeout(() => executeNextCommand(commands, index + 1), 300);
}

function executeCommand(type) {
    const dirs = [
        { x: 1, y: 0 },   // right
        { x: 0, y: 1 },   // down
        { x: -1, y: 0 },  // left
        { x: 0, y: -1 },  // up
    ];

    if (type === 'forward') {
        const dir = dirs[robot.dir];
        const newX = robot.x + dir.x;
        const newY = robot.y + dir.y;

        // Check boundaries and walls
        const outOfBounds = newX < 0 || newX >= currentLevel.grid || newY < 0 || newY >= currentLevel.grid;
        const hitWall = isWall(newX, newY);

        if (!outOfBounds && !hitWall) {
            robot.x = newX;  // Atualiza coordenada X
            robot.y = newY;  // Atualiza coordenada Y
            robot.trail.push({ x: robot.x, y: robot.y });  // Registra posição no rastro
            console.log(`  ✓ Movido para (${robot.x}, ${robot.y})`);
            return true;  // Movimento bem-sucedido
        } else {
            // COLISÃO DETECTADA
            // Robô tentou sair do mapa ou bateu em uma parede
            gameState.executing = false;  // Para a execução
            const message = outOfBounds ? 'Bit saiu do mapa!' : 'Bit colidiu com um obstáculo!';
            console.error(`  ✗ ${message}`);
            showDefeat(message);  // Mostra tela de derrota
            return false;  // Movimento falhou
        }
    } else if (type === 'left') {
        // COMANDO: VIRAR PARA A ESQUERDA
        // Rotaciona a direção do robô em 90° para a esquerda
        // Usa módulo 4 porque há 4 direções (0-3)
        // +3 equivale a -1 no módulo 4 (virar para esquerda)
        robot.dir = (robot.dir + 3) % 4;
        console.log(`  ✓ Virou para esquerda (direção: ${robot.dir})`);
        return true;
    } else if (type === 'right') {
        // COMANDO: VIRAR PARA A DIREITA
        // Rotaciona a direção do robô em 90° para a direita
        // +1 significa próxima direção (sentido horário)
        robot.dir = (robot.dir + 1) % 4;
        console.log(`  ✓ Virou para direita (direção: ${robot.dir})`);
        return true;
    }

    return true;
}

// Função que verifica se o robô pode se mover para frente
// Retorna true se há espaço livre, false se há parede ou obstáculo
function canMoveForward() {
    // Array com direções: [0]=direita, [1]=baixo, [2]=esquerda, [3]=cima
    const dirs = [
        { x: 1, y: 0 },    // Direita: +X
        { x: 0, y: 1 },    // Baixo: +Y
        { x: -1, y: 0 },   // Esquerda: -X
        { x: 0, y: -1 },   // Cima: -Y
    ];

    // Calcula a próxima posição baseada na direção atual
    const dir = dirs[robot.dir];
    const newX = robot.x + dir.x;
    const newY = robot.y + dir.y;

    // Verifica se a próxima posição é válida (não é parede, não sai do mapa)
    return !isWall(newX, newY) && newX >= 0 && newX < currentLevel.grid && newY >= 0 && newY < currentLevel.grid;
}

// Função que verifica se há uma parede em uma coordenada específica
// Busca nos paredes da fase atual
function isWall(x, y) {
    return currentLevel.walls.some(w => w.x === x && w.y === y);
}

// Reinicia a fase
// Reseta o robô e comandos para o estado inicial
function resetLevel() {
    initializeLevel();
    switchScreen('gameScreen');
}

// ==================== VITÓRIA E DERROTA ====================
// Funções que verificam se o jogador venceu ou perdeu

// Verifica se o robô chegou ao objetivo
// Compara posição do robô com posição do objetivo
function checkVictory() {
    if (robot.x === currentLevel.goalX && robot.y === currentLevel.goalY) {
        showVictory();  // Mostrar tela de vitória
    } else {
        showDefeat('Bit não chegou ao objetivo!');  // Mostrar tela de derrota
    }
}

// Mostra a tela de vitória com estatísticas
function showVictory() {
    // Mostra quantidade de comandos usados
    document.getElementById('finalCommandCount').textContent = gameState.sequence.length;

    // Mostra quantidade mínima de comandos (solução ótima)
    document.getElementById('optimalCommandCount').textContent = currentLevel.minimalCommands;

    switchScreen('victoryScreen');  // Mostra tela de vitória
}

// Mostra a tela de derrota com mensagem de erro
function showDefeat(message) {
    document.getElementById('defeatMessage').textContent = message;
    switchScreen('defeatScreen');  // Mostra tela de derrota
}

// ==================== RENDERIZAÇÃO NO CANVAS ====================
// Estas funções desenham o jogo no canvas HTML5

const canvas = document.getElementById('gameCanvas');  // Elemento canvas do HTML
const ctx = canvas.getContext('2d');  // Contexto 2D para desenhar

function draw() {
    const tileSize = currentLevel.tileSize;
    const gridWidth = currentLevel.grid;

    // LIMPAR CANVAS
    // Desenha fundo cinzento para apagar tudo que estava antes
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // DESENHAR GRID (linhas do tabuleiro)
    // Linhas horizontais e verticais para criar as células
    ctx.strokeStyle = '#ddd';  // Cor cinza claro
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridWidth; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, gridWidth * tileSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(gridWidth * tileSize, i * tileSize);
        ctx.stroke();
    }

    // DESENHAR PAREDES (OBSTÁCULOS)
    // As paredes são armazenadas no array currentLevel.walls
    // Cada parede é um objeto {x, y} que representa a posição na grade
    // Preenchemos cada parede com cor escura para torná-la visível
    ctx.fillStyle = '#333';  // Cor cinza escuro para as paredes
    currentLevel.walls.forEach(wall => {
        // Multiplica por tileSize para converter da grade (0-7) para pixels
        ctx.fillRect(wall.x * tileSize, wall.y * tileSize, tileSize, tileSize);
    });

    // DESENHAR RASTRO (caminho percorrido pelo robô)
    // O rastro mostra visualmente por onde o robô andou
    // Usa uma cor semi-transparente (rgba com 0.3 de opacidade = 30% de transparência)
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';  // Azul semi-transparente
    ctx.lineWidth = 3;  // Espessura da linha
    if (robot.trail.length > 0) {
        // Começa a desenhar uma linha conectada
        ctx.beginPath();
        // Começa do centro da célula atual do robô (0.5 = centro da célula)
        ctx.moveTo((robot.x + 0.5) * tileSize, (robot.y + 0.5) * tileSize);
        // Para cada posição no rastro, desenha uma linha até essa posição
        robot.trail.forEach(pos => {
            ctx.lineTo((pos.x + 0.5) * tileSize, (pos.y + 0.5) * tileSize);
        });
        ctx.stroke();  // Finaliza e desenha a linha
    }

    // DESENHAR OBJETIVO (META DO NÍVEL)
    // O objetivo é representado como um círculo dourado onde o robô deve chegar
    ctx.fillStyle = '#FFD700';  // Cor dourada
    ctx.beginPath();
    // Desenha um círculo (arc) na posição do objetivo
    // Parâmetros: (x do centro, y do centro, raio, ângulo inicial, ângulo final, sentido)
    // Math.PI * 2 = 360 graus (círculo completo)
    ctx.arc(
        (currentLevel.goalX + 0.5) * tileSize,  // Centro X
        (currentLevel.goalY + 0.5) * tileSize,  // Centro Y
        tileSize * 0.3,  // Raio = 30% do tamanho da célula
        0,  // Começar em 0 radianos
        Math.PI * 2  // Acabar em 360 graus (2π radianos)
    );
    ctx.fill();  // Preenche o círculo com a cor definida

    // DESENHAR ROBÔ
    // Chama a função drawRobot para desenhar o robô no canvas
    // Passa: posição X, posição Y, direção (0=direita, 1=baixo, 2=esquerda, 3=cima), tamanho
    drawRobot(robot.x, robot.y, robot.dir, tileSize);
}

// ==================== FUNÇÃO: DESENHAR ROBÔ ====================
// Esta função desenha o robô no canvas como um quadrado azul com um indicador de direção dourado
// Parâmetros:
//   x: posição horizontal do robô na grade (0-7 ou 0-9)
//   y: posição vertical do robô na grade (0-7 ou 0-9)
//   dir: direção para a qual o robô está apontando (0=direita, 1=baixo, 2=esquerda, 3=cima)
//   tileSize: tamanho de cada célula em pixels (50, 60, etc)
function drawRobot(x, y, dir, tileSize) {
    // Calcula o centro da célula onde o robô está
    // Multiplica (x + 0.5) para obter o centro horizontal, não o canto esquerdo
    const centerX = (x + 0.5) * tileSize;
    const centerY = (y + 0.5) * tileSize;

    // Define o tamanho do corpo do robô como 60% do tamanho da célula
    const robotSize = tileSize * 0.6;

    // DESENHAR CORPO DO ROBÔ
    // O corpo é um quadrado azul centralizado na célula
    ctx.fillStyle = '#0088FF';  // Azul para o corpo
    ctx.fillRect(
        centerX - robotSize / 2,  // X do canto superior esquerdo
        centerY - robotSize / 2,  // Y do canto superior esquerdo
        robotSize,  // Largura
        robotSize   // Altura
    );

    // DESENHAR CABEÇA DO ROBÔ (INDICADOR DE DIREÇÃO)
    // A cabeça é um pequeno quadrado dourado que mostra para qual direção o robô está virado
    // Diferentes direções colocam a cabeça em diferentes posições do corpo
    ctx.fillStyle = '#FFD700';  // Dourado para a cabeça
    const headSize = robotSize * 0.3;  // Cabeça tem 30% do tamanho do corpo

    // Define as posições da cabeça para cada direção possível
    // São deslocamentos relativos ao centro do robô
    const dirOffsets = [
        { x: robotSize / 2 - headSize / 2, y: -headSize / 2 },      // 0 = direita (cabeça à direita)
        { x: -headSize / 2, y: robotSize / 2 - headSize / 2 },      // 1 = baixo (cabeça para baixo)
        { x: -robotSize / 2 + headSize / 2, y: -headSize / 2 },     // 2 = esquerda (cabeça à esquerda)
        { x: -headSize / 2, y: -robotSize / 2 + headSize / 2 },     // 3 = cima (cabeça para cima)
    ];

    // Pega o deslocamento correto baseado na direção atual
    const offset = dirOffsets[dir];
    // Desenha a cabeça na posição correta conforme a direção
    ctx.fillRect(
        centerX + offset.x,  // Posição X da cabeça
        centerY + offset.y,  // Posição Y da cabeça
        headSize,  // Largura
        headSize   // Altura
    );
}

// ==================== INICIALIZAÇÃO DO JOGO ====================
// Este evento dispara quando a página HTML foi completamente carregada
// Aqui configuramos os listeners de eventos e iniciamos o jogo no menu principal
window.addEventListener('load', () => {
    // Mostra a tela do menu quando o jogo é carregado
    switchScreen('menuScreen');

    // CONFIGURAR DRAG & DROP NA ÁREA DE SEQUÊNCIA
    // O usuário pode arrastar blocos de comando para a área de sequência

    // Quando o usuário arrasta algo SOBRE a área de sequência
    document.getElementById('sequenceArea').addEventListener('dragover', (e) => {
        // Chama allowDrop para permitir que o item seja solto aqui
        allowDrop(e);
    });

    // Quando o usuário sai da área de sequência SEM soltar o item
    document.getElementById('sequenceArea').addEventListener('dragleave', (e) => {
        // Remove a classe visual que destacava a área como zona de queda
        e.currentTarget.classList.remove('drag-over');
    });
});
