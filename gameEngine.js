const gameState = {
    currentRoom: "westOfHouse",
    hasLeaflet: false,
    mailboxOpen: false,
    isGameOver: false,
    turns: 0,
    score: 0,
    visitedRooms: ["westOfHouse"]
};

function findMatch(target, list) {
    if (!target || !list) return null;
    target = target.toLowerCase().trim();
    
    // Exact match first
    if (list.includes(target)) return target;
    
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

const commands = {
    help: "Available commands: north, south, east, west, up, down, look, examine [object], inventory, open [object], take [item], read [item], about, contact, clear, restart",
    n: () => move("north"),
    north: () => move("north"),
    s: () => move("south"),
    south: () => move("south"),
    e: () => move("east"),
    east: () => move("east"),
    w: () => move("west"),
    west: () => move("west"),
    u: () => move("up"),
    up: () => move("up"),
    d: () => move("down"),
    down: () => move("down"),
    in: () => move("in"),
    out: () => move("out"),
    restart: () => {
        gameState.currentRoom = "westOfHouse";
        gameState.hasLeaflet = false;
        gameState.mailboxOpen = false;
        gameState.isGameOver = false;
        gameState.turns = 0;
        gameState.score = 0;
        gameState.visitedRooms = ["westOfHouse"];
        
        terminal.clear();
        if (window.innerWidth > 600) {
            terminal.print(headerText);
        }
        commands.look();
        updateStatusBar();
        terminal.print("\nGame restarted.");
        terminal.handleScrolling();
    },
    about: "Edward Felch - A craftsman and creator. Specializing in woodworking and laser engraving. Co-founder of Hanahan Personalization and Macabre and Mirthworks.",
    contact: "You can reach Edward at Hanahan Personalization or Macabre and Mirthworks. Email: contact@edwardfelch.com",
    look: (target) => {
        if (target) {
            return commands.read(target);
        }
        const room = rooms[gameState.currentRoom];
        let outputText = `${room.name}\n${room.description()}`;
        
        const possibleDirections = Object.keys(room.exits).filter(dir => 
            ["north", "south", "east", "west", "up", "down", "in", "out"].includes(dir)
        );
        
        if (possibleDirections.length > 0) {
            outputText += `\n\nPossible directions: ${possibleDirections.join(", ")}`;
        }

        const roomItems = (rooms[gameState.currentRoom].items || []).filter(itemId => {
            const item = itemData[itemId];
            return !item || !item.isVisible || item.isVisible(gameState);
        });
        const roomObjects = (rooms[gameState.currentRoom].objects || []).filter(objId => {
            const obj = itemData[objId];
            return !obj || !obj.isVisible || obj.isVisible(gameState);
        });
        const itemsToExamine = [...roomItems, ...roomObjects];

        if (itemsToExamine.length > 0) {
            outputText += `\nItems to examine: ${itemsToExamine.join(", ")}`;
        }
        
        terminal.print(outputText);
    },
    examine: (target) => commands.look(target),
    l: (target) => commands.look(target),
    x: (target) => commands.look(target),
    inventory: () => {
        if (gameState.hasLeaflet) {
            return "You are holding a leaflet.";
        } else {
            return "You are empty-handed.";
        }
    },
    i: () => commands.inventory(),
    open: (target) => {
        if (!target) {
            return "Open what?";
        }
        
        const roomObjects = rooms[gameState.currentRoom].objects || [];
        const matchedObject = findMatch(target, roomObjects);

        if (matchedObject === "mailbox") {
            if (gameState.currentRoom === "westOfHouse") {
                if (gameState.mailboxOpen) {
                    return "The mailbox is already open.";
                }
                gameState.mailboxOpen = true;
                return "Opening the small mailbox reveals a leaflet.";
            } else {
                return "You don't see that here.";
            }
        }
        return "You can't open that.";
    },
    take: (target) => {
        if (!target) {
            return "Take what?";
        }

        const roomItems = (rooms[gameState.currentRoom].items || []).filter(itemId => {
            const item = itemData[itemId];
            return !item || !item.isVisible || item.isVisible(gameState);
        });
        const roomObjects = (rooms[gameState.currentRoom].objects || []).filter(objId => {
            const obj = itemData[objId];
            return !obj || !obj.isVisible || obj.isVisible(gameState);
        });
        
        const inventoryItems = gameState.hasLeaflet ? ["leaflet"] : [];
        const matchedItem = findMatch(target, [...roomItems, ...roomObjects, ...inventoryItems]);

        if (matchedItem === "leaflet") {
            if (gameState.currentRoom === "westOfHouse" && gameState.mailboxOpen && !gameState.hasLeaflet) {
                gameState.hasLeaflet = true;
                gameState.score++;
                return "Taken.";
            } else if (gameState.hasLeaflet) {
                return "You already have it.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedItem === "banana" || matchedItem === "bananas") {
            if (gameState.currentRoom === "shrine") {
                gameState.isGameOver = true;
                return "As you reach for a banana, the air grows cold. A booming voice echoes through the clearing: 'YOU DARE TOUCH THE SACRED FRUIT?' The Banana God appears and peels you alive. You have died.";
            } else {
                return "You don't see any bananas here.";
            }
        }

        if (roomItems.includes(matchedItem)) {
            return `You can't take the ${matchedItem} yet.`;
        }

        if (roomObjects.includes(matchedItem)) {
            if (matchedItem === "mailbox") {
                return "The mailbox is securely bolted to the ground. Maybe try opening the mailbox?";
            }
            if (matchedItem === "shrine") {
                return "You try to lift the massive pile of rotting bananas. It's heavy, it's sticky, and it's definitely not going in your pocket. You could take a single banana.";
            }
            return "That is part of the scenery.";
        }

        return "You don't see that here.";
    },
    read: (target) => {
        if (!target) {
            return "Read what?";
        }

        const roomItems = (rooms[gameState.currentRoom].items || []).filter(itemId => {
            const item = itemData[itemId];
            return !item || !item.isVisible || item.isVisible(gameState);
        });
        const roomObjects = (rooms[gameState.currentRoom].objects || []).filter(objId => {
            const obj = itemData[objId];
            return !obj || !obj.isVisible || obj.isVisible(gameState);
        });
        const inventoryItems = gameState.hasLeaflet ? ["leaflet"] : [];
        
        const matchedItem = findMatch(target, [...roomItems, ...roomObjects, ...inventoryItems]);

        if (matchedItem) {
            if (itemData[matchedItem]) {
                return itemData[matchedItem].description;
            }
        }

        if (target.toLowerCase() === "leaflet" && !gameState.hasLeaflet) {
            return "You don't have the leaflet.";
        }

        return "You don't see that here.";
    },
    clear: () => {
        terminal.clear();
    }
};

function move(direction) {
    const room = rooms[gameState.currentRoom];
    const nextRoom = room.exits[direction];
    if (nextRoom) {
        if (rooms[nextRoom]) {
            gameState.currentRoom = nextRoom;
            if (!gameState.visitedRooms.includes(gameState.currentRoom)) {
                gameState.visitedRooms.push(gameState.currentRoom);
                gameState.score++;
            }
            if (gameState.currentRoom === "caveDeep") {
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