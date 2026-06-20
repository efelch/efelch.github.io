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

const commands = {
    help: () => {
        const gameCommands = "Game commands: north, south, east, west, up, down, look, examine [object], inventory, take [item], use [item], read [item], open [object], close [object], move [object], clear, restart";
        const personalCommands = "About Edward: about, bio, resume, links, photos, contact";
        return `${gameCommands}\n${personalCommands}`;
    },
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

        if (matchedObject === "drawer") {
            if (gameState.currentRoom === "kitchen") {
                if (gameState.drawerOpen) {
                    return "The drawer is already open.";
                }
                gameState.drawerOpen = true;
                return "You open the drawer, revealing an address book.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedObject === "filing cabinet") {
            if (gameState.currentRoom === "livingRoom") {
                if (gameState.filingCabinetOpen) {
                    return "The filing cabinet is already open.";
                }
                gameState.filingCabinetOpen = true;
                return "You open the filing cabinet, revealing a resume.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedObject === "crates") {
            if (gameState.currentRoom === "attic") {
                if (gameState.cratesOpen) {
                    return "The crates are already open.";
                }
                gameState.cratesOpen = true;
                return "You pry open the dusty crates, revealing a photo album and a golden trophy.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedObject === "trapdoor") {
            if (gameState.currentRoom === "livingRoom") {
                if (!gameState.rugMoved) {
                    return "You don't see that here.";
                }
                if (gameState.trapdoorOpen) {
                    return "The trapdoor is already open.";
                }
                gameState.trapdoorOpen = true;
                return "You pull on the heavy iron ring, and the trapdoor creaks open, revealing a dark ladder leading down.";
            } else {
                return "You don't see that here.";
            }
        }
        return "You can't open that.";
    },
    close: (target) => {
        if (!target) {
            return "Close what?";
        }
        
        const roomObjects = rooms[gameState.currentRoom].objects || [];
        const matchedObject = findMatch(target, roomObjects);

        if (matchedObject === "mailbox") {
            if (gameState.currentRoom === "westOfHouse") {
                if (!gameState.mailboxOpen) {
                    return "The mailbox is already closed.";
                }
                gameState.mailboxOpen = false;
                return "You close the small mailbox.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedObject === "drawer") {
            if (gameState.currentRoom === "kitchen") {
                if (!gameState.drawerOpen) {
                    return "The drawer is already closed.";
                }
                gameState.drawerOpen = false;
                return "You close the drawer.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedObject === "filing cabinet") {
            if (gameState.currentRoom === "livingRoom") {
                if (!gameState.filingCabinetOpen) {
                    return "The filing cabinet is already closed.";
                }
                gameState.filingCabinetOpen = false;
                return "You close the filing cabinet.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedObject === "crates") {
            if (gameState.currentRoom === "attic") {
                if (!gameState.cratesOpen) {
                    return "The crates are already closed.";
                }
                gameState.cratesOpen = false;
                return "You close the dusty crates.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedObject === "trapdoor") {
            if (gameState.currentRoom === "livingRoom") {
                if (!gameState.rugMoved) {
                    return "You don't see that here.";
                }
                if (!gameState.trapdoorOpen) {
                    return "The trapdoor is already closed.";
                }
                gameState.trapdoorOpen = false;
                return "You push the heavy trapdoor closed. It shuts with a dull thud.";
            } else {
                return "You don't see that here.";
            }
        }
        return "You can't close that.";
    },
    move: (target) => {
        if (!target) return "Move what?";
        
        const roomObjects = rooms[gameState.currentRoom].objects || [];
        const matchedObject = findMatch(target, roomObjects);
        
        if (matchedObject === "rug") {
            if (gameState.currentRoom === "livingRoom") {
                if (gameState.rugMoved) {
                    return "The rug has already been moved.";
                }
                gameState.rugMoved = true;
                return "You push the heavy rug aside, revealing a wooden trapdoor underneath!";
            }
        }
        
        return "You can't move that.";
    },
    push: (target) => commands.move(target),
    pull: (target) => {
        if (!target) return "Pull what?";
        if (target.toLowerCase() === "trapdoor") return commands.open("trapdoor");
        return "You can't pull that.";
    },
    put: (target) => {
        if (!target) return "Put what where?";
        
        const words = target.toLowerCase().split(' ');
        const inIndex = words.indexOf('in');
        
        if (inIndex === -1) return "Put what where? (e.g., 'put trophy in case')";
        
        const itemTarget = words.slice(0, inIndex).join(' ');
        const containerTarget = words.slice(inIndex + 1).join(' ');
        
        const matchedItem = findMatch(itemTarget, gameState.inventory);
        const roomObjects = rooms[gameState.currentRoom].objects || [];
        const matchedContainer = findMatch(containerTarget, roomObjects);
        
        if (!matchedItem) return "You aren't carrying that.";
        if (!matchedContainer) return "You don't see that container here.";
        
        if (matchedItem === "trophy" && matchedContainer === "trophy case") {
            if (gameState.currentRoom === "livingRoom") {
                gameState.inventory = gameState.inventory.filter(i => i !== "trophy");
                gameState.trophyInCase = true;
                gameState.score += 5;
                return "You carefully place the trophy in the trophy case. As it clicks into place, a hidden compartment at the back pops open, revealing a flashlight!";
            }
        }
        
        return `You can't put the ${itemTarget} in the ${containerTarget}.`;
    },
    restart: () => {
        gameState.currentRoom = "westOfHouse";
        gameState.inventory = [];
        gameState.mailboxOpen = false;
        gameState.drawerOpen = false;
        gameState.filingCabinetOpen = false;
        gameState.cratesOpen = false;
        gameState.trophyInCase = false;
        gameState.flashlightOn = false;
        gameState.rugMoved = false;
        gameState.trapdoorOpen = false;
        gameState.isGameOver = false;
        gameState.turns = 0;
        gameState.score = 0;
        gameState.visitedRooms = ["westOfHouse"];
        
        localStorage.removeItem('adventure_game_save');
        
        terminal.clear();
        if (window.innerWidth > 600) {
            terminal.print(headerText);
        }
        commands.look();
        updateStatusBar();
        terminal.print("\nGame restarted.");
        terminal.handleScrolling();
    },
    about: "WELCOME TO THE PERSONAL SITE OF EDWARD FELCH!\n\nEdward is a maker of things, a software engineer, and a craftsman. This site is an interactive portfolio where you can explore his work and history.\n\nTry these commands to find more information:\n- 'about' or 'bio' for his story\n- 'resume' to see his professional background\n- 'links' for business and social media\n- 'photos' to see his creations\n\nThere are secrets hidden throughout the house and forest. Happy hunting!",
    bio: () => {
        return "Edward is a software engineer and maker with a passion for artisan crafts. He enjoys creating things both in the digital world and the physical one.";
    },
    resume: () => {
        if (gameState.visitedRooms.includes("livingRoom")) {
            return itemData.resume.description;
        }
        return "Edward's resume is currently stored in the trophy case in the living room.";
    },
    links: () => {
        if (gameState.inventory.includes("leaflet")) {
            return itemData.leaflet.description;
        }
        return "You remember seeing some links on a leaflet. Maybe it's in the mailbox?";
    },
    photos: () => {
        if (gameState.visitedRooms.includes("attic")) {
            return itemData.album.description;
        }
        return "You remember seeing a photo album somewhere in the house. Maybe the attic?";
    },
    contact: () => {
        if (gameState.inventory.includes("addressBook")) {
            return itemData.addressBook.description;
        }
        return "You don't have Edward's contact information. Perhaps there's an address book in the kitchen?";
    },
    look: (target) => {
        if (target) {
            const roomItems = rooms[gameState.currentRoom].items || [];
            const roomObjects = rooms[gameState.currentRoom].objects || [];
            const inventoryItems = gameState.inventory;
            const matchedItem = findMatch(target, [...roomItems, ...roomObjects, ...inventoryItems]);
            
            if (matchedItem === "vanity mirror") {
                terminal.showJumpScare();
            }
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
            const isVisible = !item || !item.isVisible || item.isVisible(gameState);
            return isVisible && !gameState.inventory.includes(itemId);
        });
        const roomObjects = (rooms[gameState.currentRoom].objects || []).filter(objId => {
            const obj = itemData[objId];
            const isVisible = !obj || !obj.isVisible || obj.isVisible(gameState);
            return isVisible && !gameState.inventory.includes(objId);
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
        if (gameState.inventory.length === 0) {
            return "You are empty-handed.";
        } else {
            const itemNames = {
                leaflet: "a leaflet",
                resume: "a resume",
                album: "a photo album",
                addressBook: "an address book",
                banana: "a banana",
                trophy: "a golden trophy",
                flashlight: "a flashlight"
            };
            const invStrings = gameState.inventory.map(id => itemNames[id] || id);
            return "You are holding: " + invStrings.join(", ");
        }
    },
    i: () => commands.inventory(),
    use: (target) => {
        if (!target) {
            return "Use what?";
        }

        const matchedItem = findMatch(target, gameState.inventory);

        if (!matchedItem) {
            return "You aren't carrying that.";
        }

        if (matchedItem === "flashlight") {
            gameState.flashlightOn = !gameState.flashlightOn;
            let response = gameState.flashlightOn ? "You turn on the flashlight. A bright beam of light cuts through the darkness." : "You turn off the flashlight.";
            
            if (!gameState.flashlightOn && (gameState.currentRoom === "caveEntrance" || gameState.currentRoom === "caveDeep")) {
                gameState.isGameOver = true;
                response += "\n\nAs the light fades, you hear a low growl. A grue leaps from the shadows and eats you!";
            }
            return response;
        }

        return `You can't use the ${matchedItem}.`;
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
        
        const inventoryItems = gameState.inventory;

        const matchedItem = findMatch(target, [...roomItems, ...roomObjects, ...inventoryItems]);

        if (inventoryItems.includes(matchedItem)) {
            return "You already have it.";
        }

        if (matchedItem === "leaflet") {
            if (gameState.currentRoom === "westOfHouse" && gameState.mailboxOpen) {
                gameState.inventory.push("leaflet");
                gameState.score++;
                return "Taken.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedItem === "resume") {
            if (gameState.currentRoom === "livingRoom") {
                if (!gameState.filingCabinetOpen) {
                    return "The filing cabinet is closed.";
                }
                gameState.inventory.push("resume");
                gameState.score++;
                return "Taken.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedItem === "album") {
            if (gameState.currentRoom === "attic") {
                if (!gameState.cratesOpen) {
                    return "The crates are closed.";
                }
                gameState.inventory.push("album");
                gameState.score++;
                return "Taken.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedItem === "trophy") {
            if (gameState.currentRoom === "attic") {
                if (!gameState.cratesOpen) {
                    return "The crates are closed.";
                }
                gameState.inventory.push("trophy");
                gameState.score++;
                return "Taken.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedItem === "flashlight") {
            if (gameState.currentRoom === "livingRoom") {
                if (!gameState.trophyInCase) {
                    return "You don't see a flashlight here.";
                }
                gameState.inventory.push("flashlight");
                gameState.score++;
                return "Taken.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedItem === "addressBook") {
            if (gameState.currentRoom === "kitchen") {
                if (!gameState.drawerOpen) {
                    return "The drawer is closed.";
                }
                gameState.inventory.push("addressBook");
                gameState.score++;
                return "Taken.";
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
        const inventoryItems = gameState.inventory;
        
        const matchedItem = findMatch(target, [...roomItems, ...roomObjects, ...inventoryItems]);

        if (matchedItem) {
            if (itemData[matchedItem]) {
                if (itemData[matchedItem].dynamicDescription) {
                    return itemData[matchedItem].dynamicDescription(gameState);
                }
                return itemData[matchedItem].description;
            }
        }

        if (target.toLowerCase() === "leaflet" && !gameState.inventory.includes("leaflet")) {
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
    let nextRoom = room.exits[direction];

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