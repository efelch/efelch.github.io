const GAME_VERSION = "1.0.0";
const EVENT_CHANCE = 0.15;

const gameState = {
    currentRoom: "westOfHouse",
    inventory: [],
    mailboxOpen: false,
    drawerOpen: false,
    filingCabinetOpen: false,
    cratesOpen: false,
    trophyInCase: false,
    flashlightOn: false,
    rugMoved: false,
    trapdoorOpen: false,
    isGameOver: false,
    turns: 0,
    score: 0,
    visitedRooms: ["westOfHouse"]
};

function saveGame() {
    const saveState = {
        gameState: gameState,
        version: GAME_VERSION
    };
    localStorage.setItem('adventure_game_save', JSON.stringify(saveState));
}

function loadGame() {
    const savedData = localStorage.getItem('adventure_game_save');
    if (!savedData) return false;

    try {
        const saveState = JSON.parse(savedData);
        // Basic version check - could be more complex if needed
        if (saveState.version === GAME_VERSION) {
            Object.assign(gameState, saveState.gameState);
            return true;
        }
    } catch (e) {
        console.error("Failed to load game:", e);
    }
    return false;
}

function findMatch(target, list) {
    if (!target || !list) return null;
    target = target.toLowerCase().trim();
    
    // Exact match first
    if (list.includes(target)) return target;
    
    // Check aliases in itemData
    for (const item of list) {
        if (itemData[item] && itemData[item].aliases) {
            if (itemData[item].aliases.some(alias => alias.toLowerCase() === target)) {
                return item;
            }
        }
    }

    // Fuzzy match: check if target matches any word in the object names
    for (const item of list) {
        const words = item.toLowerCase().split(' ');
        if (words.includes(target)) return item;
    }
    
    // Partial match: check if target is part of the name (e.g., "oak tree" matches "giant oak tree")
    for (const item of list) {
        if (item.toLowerCase().includes(target)) return item;
    }
    
    return null;
}

function move(direction) {
    const room = rooms[gameState.currentRoom];
    const targetDirection = directionAliases[direction] || direction;
    let nextRoom = room.exits[targetDirection];

    if (typeof nextRoom === 'function') {
        nextRoom = nextRoom();
    }

    if (nextRoom) {
        if (rooms[nextRoom]) {
            gameState.currentRoom = nextRoom;
            if (!gameState.visitedRooms.includes(gameState.currentRoom)) {
                gameState.visitedRooms.push(gameState.currentRoom);
                gameState.score++;
            }
            if ((gameState.currentRoom === "caveEntrance" || gameState.currentRoom === "caveDeep") && !gameState.flashlightOn) {
                gameState.isGameOver = true;
            }
            updateStatusBar();
            return ""; 
        } else {
            return nextRoom;
        }
    } else {
        return "You can't go that way.";
    }
}

function updateStatusBar() {
    const statusBar = document.getElementById('status-bar');
    const roomName = rooms[gameState.currentRoom].name;
    statusBar.innerHTML = `<span>${roomName}</span><span>Score: ${gameState.score}</span><span>Turns: ${gameState.turns}</span>`;
}

function getRandomEventMessage() {
    if (Math.random() < EVENT_CHANCE) {
        const room = rooms[gameState.currentRoom];
        if (room && room.typeOfRoom && roomTypes[room.typeOfRoom]) {
            const messages = roomTypes[room.typeOfRoom];
            const randomIndex = Math.floor(Math.random() * messages.length);
            return messages[randomIndex];
        }
    }
    return null;
}