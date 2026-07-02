"use strict";
const commands = {
    help: () => {
        const room = rooms[gameState.currentRoom];
        if (!room) {
            return "Commands: look, inventory, hint, clear, restart";
        }

        // 1) Movement: list only directions/exits that actually go somewhere now
        const exits = room.exits || {};
        const directions = [];
        for (const key of Object.keys(exits)) {
            const val = exits[key];
            // String that names a valid room id
            if (typeof val === 'string' && rooms[val]) {
                directions.push(key);
                continue;
            }
            // Object with { target, condition?, message? }
            if (val && typeof val === 'object' && typeof val.target === 'string') {
                const allowed = !val.condition || !!val.condition();
                if (allowed && rooms[val.target]) directions.push(key);
                continue;
            }
            // Function/string messages are informational only; don’t include
        }

        // 2) Visible things in the room
        const isVisible = (id) => {
            const meta = itemData[id];
            return !meta || !meta.isVisible || meta.isVisible(gameState);
        };
        const roomItems = (room.items || []).filter(id => isVisible(id) && !gameState.inventory.includes(id));
        const roomObjects = (room.objects || []).filter(id => isVisible(id));

        // 3) Build contextual action verbs
        const actions = [];

        // Always useful
        actions.push('look');
        if (roomItems.length > 0 || roomObjects.length > 0 || gameState.inventory.length > 0) {
            actions.push('examine [thing]');
        }
        actions.push('inventory');
        actions.push('hint');
        actions.push('clear');
        if (gameState.isGameOver) actions.push('restart');

        // Take only if items present
        if (roomItems.length > 0) actions.push('take [item]');

        // Use only for items that actually do something now (flashlight only for now)
        if (gameState.inventory.includes('flashlight')) actions.push('use flashlight');

        // Open/Close based on visible openables
        const openables = ["mailbox", "drawer", "filing cabinet", "crates", "trapdoor", "sarcophagus"]
            .filter(id => roomObjects.includes(id));
        if (openables.length > 0) {
            // Show open if any are closed; close if any are open
            const anyClosed = openables.some(id => (
                (id === 'trapdoor' && !gameState.trapdoorOpen) ||
                (id === 'sarcophagus' && gameState.currentRoom === 'temple_sarcophagusChamber' && !gameState.templeSarcophagusOpened) ||
                (id === 'mailbox' && !gameState.mailboxOpen) ||
                (id === 'drawer' && !gameState.drawerOpen) ||
                (id === 'filing cabinet' && !gameState.filingCabinetOpen) ||
                (id === 'crates' && !gameState.cratesOpen)
            ));
            const anyOpen = openables.some(id => (
                (id === 'trapdoor' && gameState.trapdoorOpen) ||
                (id === 'sarcophagus' && gameState.currentRoom === 'temple_sarcophagusChamber' && gameState.templeSarcophagusOpened) ||
                (id === 'mailbox' && gameState.mailboxOpen) ||
                (id === 'drawer' && gameState.drawerOpen) ||
                (id === 'filing cabinet' && gameState.filingCabinetOpen) ||
                (id === 'crates' && gameState.cratesOpen)
            ));
            if (anyClosed) actions.push('open [object]');
            if (anyOpen) actions.push('close [object]');
        }

        // Move (objects), e.g., rug
        if (roomObjects.includes('rug') && !gameState.rugMoved) actions.push('move rug');

        // Pull (lever) if visible
        if (roomObjects.includes('lever') || roomObjects.includes('switch') || roomObjects.includes('handle')) {
            actions.push('pull lever');
        }

        // Light in the temple grid
        if (gameState.currentRoom && gameState.currentRoom.startsWith('temple_')) {
            actions.push('light torch');
        }

        // Canyon puzzle special move line
        if (gameState.currentRoom === 'cave_riverCanyon') {
            actions.push("move disc from [1-3] to [1-3]");
        }

        // Compose final help text
        let helpText = '';
        if (directions.length > 0) {
            helpText += "Directions: " + directions.join(', ');
        }
        if (actions.length > 0) {
            helpText += (helpText ? "\n" : "") + "Actions: " + actions.join(', ');
        }
        if (!helpText) {
            helpText = "No obvious actions present. Try look or hint.";
        }
        return helpText;
    },
    hint: () => {
        const hint = roomHints[gameState.currentRoom];
        if (!hint) return "I don't have any hints for this area.";
        
        if (typeof hint === 'function') {
            return hint(gameState);
        }
        return hint;
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
        
        const room = rooms[gameState.currentRoom];
        const roomItems = room.items || [];
        const roomObjects = room.objects || [];
        const inventory = gameState.inventory || [];
        
        const matchedId = findMatch(target, [...roomItems, ...roomObjects, ...inventory]);
        const item = itemData[matchedId];

        if (item && item.interactions && item.interactions.open) {
            return item.interactions.open(gameState);
        }

        return "You can't open that.";
    },
    close: (target) => {
        if (!target) {
            return "Close what?";
        }
        
        const room = rooms[gameState.currentRoom];
        const roomItems = room.items || [];
        const roomObjects = room.objects || [];
        const inventory = gameState.inventory || [];
        
        const matchedId = findMatch(target, [...roomItems, ...roomObjects, ...inventory]);
        const item = itemData[matchedId];

        if (item && item.interactions && item.interactions.close) {
            return item.interactions.close(gameState);
        }

        return "You can't close that.";
    },
    move: (target) => {
        if (!target) return "Move what?";
        
        const targetLower = target.toLowerCase();

        // Handle variations of the move command for the puzzle
        const movePatterns = [
            /disc from (\d) to (\d)/i,
            /disc (\d) to (\d)/i,
            /from (\d) to (\d)/i
        ];
        
        let match = null;
        for (const pattern of movePatterns) {
            match = target.match(pattern);
            if (match) break;
        }

        if (match && gameState.currentRoom === "cave_riverCanyon") {
            const from = parseInt(match[1]) - 1;
            const to = parseInt(match[2]) - 1;

            if (from < 0 || from > 2 || to < 0 || to > 2) return "Pillars are numbered 1, 2, and 3.";
            if (from === to) return "The disc is already there.";
            if (gameState.puzzlePillars[from].length === 0) return "That pillar has no discs.";

            const disc = gameState.puzzlePillars[from].slice(-1)[0];
            const targetPillar = gameState.puzzlePillars[to];

            if (targetPillar.length > 0 && targetPillar.slice(-1)[0] < disc) {
                return "A larger disc cannot be placed upon a smaller one. The pillars hum with a warning vibration.";
            }

            // Execute move
            gameState.puzzlePillars[from].pop();
            gameState.puzzlePillars[to].push(disc);
            
            // Check Win Condition
            if (gameState.puzzlePillars[2].length === 3 && !gameState.riverPuzzleSolved) {
                gameState.riverPuzzleSolved = true;
                gameState.score += 10;
                updateStatusBar();
                return "As the final disc settles on Pillar 3, the canyon walls groan. A small stone panel slides open, revealing a rusted iron key!";
            }

            return `You move the disc to Pillar ${to + 1}.`;
        }

        if (targetLower.includes("disc") && gameState.currentRoom === "cave_riverCanyon") {
            return "Try: 'move disc from [1-3] to [1-3]'.";
        }

        const room = rooms[gameState.currentRoom];
        const roomItems = room.items || [];
        const roomObjects = room.objects || [];
        const inventory = gameState.inventory || [];
        
        const matchedId = findMatch(target, [...roomItems, ...roomObjects, ...inventory]);
        const item = itemData[matchedId];

        if (item && item.interactions && item.interactions.move) {
            return item.interactions.move(gameState);
        }
        
        return "You can't move that.";
    },
    push: (target) => commands.move(target),
    pull: (target) => {
        if (!target) return "Pull what?";

        const room = rooms[gameState.currentRoom];
        const roomItems = room.items || [];
        const roomObjects = room.objects || [];
        const inventory = gameState.inventory || [];
        
        const matchedId = findMatch(target, [...roomItems, ...roomObjects, ...inventory]);
        const item = itemData[matchedId];

        if (item && item.interactions && item.interactions.pull) {
            return item.interactions.pull(gameState);
        }

        return "You can't pull that.";
    },
    light: (target) => {
        if (!target) return "Light what?";
        const room = rooms[gameState.currentRoom];
        const roomItems = room.items || [];
        const roomObjects = room.objects || [];
        const inventory = gameState.inventory || [];
        
        const matchedId = findMatch(target, [...roomItems, ...roomObjects, ...inventory]);
        const item = itemData[matchedId];

        if (item && item.interactions && item.interactions.light) {
            return item.interactions.light(gameState);
        }

        return "You can't light that.";
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

        const container = itemData[matchedContainer];
        if (container && container.interactions && container.interactions[`put ${matchedItem}`]) {
            return container.interactions[`put ${matchedItem}`](gameState);
        }
        
        return `You can't put the ${itemTarget} in the ${containerTarget}.`;
    },
    restart: () => {
        gameState.currentRoom = "forest_westOfHouse";
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
        gameState.lastAnnouncedScore = 0;
        gameState.visitedRooms = ["forest_westOfHouse"];
        gameState.puzzlePillars = [[3, 2, 1], [], []];
        gameState.riverPuzzleSolved = false;
        gameState.riverHintStep = 0;
        gameState.caveFootprintsSeen = false;
        gameState.caveLeverRevealed = false;
        gameState.caveHiddenDoorOpen = false;
        gameState.caveTorchesLit = false;
        gameState.templeSarcophagusOpened = false;
        gameState.templeTorches = [
            [false, false, false],
            [false, false, false],
            [false, false, false]
        ];
        gameState.templeStaircaseRevealed = false;
        
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
    look: (target) => {
        if (target) {
            return commands.read(target);
        }
        const room = rooms[gameState.currentRoom];
        // Use central builder so item presence lines are appended and auto-hide when taken
        let outputText = `<b>${room.name}</b>\n${buildRoomDescription(gameState.currentRoom)}`;
        
        const possibleDirections = Object.keys(room.exits).filter(dir => 
            ["north", "south", "east", "west", "up", "down", "in", "out"].includes(dir)
        );
        
        if (possibleDirections.length > 0) {
            const directionLinks = possibleDirections.map(dir => 
                `<span class="clickable" data-command="${dir}">${dir}</span>`
            );
            outputText += `\n\nDirections: ${directionLinks.join(", ")}`;
            
            const commonCommands = ["inventory", "hint", "clear"];
            if (gameState.isGameOver) {
                commonCommands.push("restart");
            }
            const commandLinks = commonCommands.map(cmd => 
                `<span class="clickable" data-command="${cmd}">${cmd}</span>`
            );
            outputText += `\nCommands: ${commandLinks.join(", ")}`;
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
        
        if (roomItems.length > 0 || roomObjects.length > 0) {
            const itemLinks = roomItems.map(itemId => {
                const displayName = itemId;
                return `<span class="clickable" data-command="examine ${itemId}">${displayName}</span> (<span class="clickable" data-command="take ${itemId}">take</span>)`;
            });
            
            const objectLinks = roomObjects.map(objId => {
                let link = `<span class="clickable" data-command="examine ${objId}">${objId}</span>`;
                const openable = ["mailbox", "drawer", "filing cabinet", "crates", "trapdoor", "sarcophagus"];
                const moveable = ["rug"];
                
                if (openable.includes(objId)) {
                    const isOpen = (objId === "trapdoor" && gameState.trapdoorOpen) || 
                                   (objId === "mailbox" && gameState.mailboxOpen) ||
                                   (objId === "drawer" && gameState.drawerOpen) ||
                                   (objId === "filing cabinet" && gameState.filingCabinetOpen) ||
                                   (objId === "crates" && gameState.cratesOpen) ||
                                   (objId === "sarcophagus" && gameState.currentRoom === 'temple_sarcophagusChamber' && gameState.templeSarcophagusOpened);
                    if (objId === 'sarcophagus') {
                        // Sarcophagus is open-only; don't render a close link
                        if (!isOpen) {
                            link += ` (<span class="clickable" data-command="open ${objId}">open</span>)`;
                        }
                    } else {
                        const action = isOpen ? "close" : "open";
                        link += ` (<span class="clickable" data-command="${action} ${objId}">${action}</span>)`;
                    }
                } else if (moveable.includes(objId)) {
                    link += ` (<span class="clickable" data-command="move ${objId}">move</span>)`;
                }
                
                // Add "put [item] in" link if player has a compatible item
                if (objId === "trophy case" && gameState.inventory.includes("trophy")) {
                    link += ` (<span class="clickable" data-command="put trophy in trophy case">put trophy in</span>)`;
                }
                
                return link;
            });
            
            outputText += `\nItems to examine: ${[...itemLinks, ...objectLinks].join(", ")}`;
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
                album: "a photo album",
                banana: "a banana",
                trophy: "a golden trophy",
                flashlight: "a flashlight",
                lighter: "a lighter",
                "green waystone shard": "a green waystone shard",
                "red waystone shard": "a red waystone shard",
                "iron key": "a rusted iron key",
                "brass gear": "a brass gear"
            };
            const invStrings = gameState.inventory.map(id => {
                const displayName = itemNames[id] || id;
                let link = `<span class="clickable" data-command="examine ${id}">${displayName}</span>`;
                
                // Add "put in" link if a container is present
                const roomObjects = rooms[gameState.currentRoom].objects || [];
                if (id === "trophy" && findMatch("trophy case", roomObjects)) {
                    link += ` (<span class="clickable" data-command="put trophy in trophy case">put in case</span>)`;
                }
                
                return link;
            });
            return "You are holding: " + invStrings.join(", ");
        }
    },
    i: () => commands.inventory(),
    use: (target) => {
        if (!target) {
            return "Use what?";
        }
        
        const matchedItem = findMatch(target, gameState.inventory);
        const item = itemData[matchedItem];

        if (item && item.interactions && item.interactions.use) {
            return item.interactions.use(gameState);
        }
        
        if (!matchedItem) {
            return "You aren't carrying that.";
        }
        
        return `You can't use the ${matchedItem}.`;
    },
    take: (target) => {
        if (!target) {
            return "Take what?";
        }
        
        const room = rooms[gameState.currentRoom];
        const roomItems = room.items || [];
        const roomObjects = room.objects || [];
        const inventory = gameState.inventory || [];
        
        const matchedId = findMatch(target, [...roomItems, ...roomObjects, ...inventory]);
        const item = itemData[matchedId];

        if (item && item.interactions && item.interactions.take) {
            return item.interactions.take(gameState);
        }

        if (inventory.includes(matchedId)) {
            return "You already have it.";
        }

        // Generic take logic for simple items
        if (roomItems.includes(matchedId)) {
            const meta = itemData[matchedId];
            if (meta && (meta.interactions === undefined || !meta.interactions.take)) {
                gameState.inventory.push(matchedId);
                gameState.score++;
                updateStatusBar();
                return "Taken.";
            }
            return `You can't take the ${matchedId} yet.`;
        }
        
        if (roomObjects.includes(matchedId)) {
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
            const item = itemData[matchedItem];
            if (item) {
                if (item.interactions && item.interactions.examine) {
                    return item.interactions.examine(gameState);
                }
                if (item.dynamicDescription) {
                    return item.dynamicDescription(gameState);
                }
                const desc = item.description;
                return (typeof desc === 'function') ? desc(gameState) : desc;
            }
        }
        
        if (target.toLowerCase() === "leaflet" && !gameState.inventory.includes("leaflet")) {
            return "You don't have the leaflet.";
        }
        
        return "You don't see that here.";
    },
    clear: () => {
        terminal.clear();
    },
    // Hidden developer helper: solves all puzzles, opens hidden doors, and grants all items
    cheat: () => {
        // 1) Puzzles and gates
        // House
        gameState.rugMoved = true;
        gameState.trapdoorOpen = true;
        gameState.mailboxOpen = true;
        gameState.drawerOpen = true;
        gameState.filingCabinetOpen = true;
        gameState.cratesOpen = true;
        gameState.trophyInCase = true;

        // Cave
        gameState.caveFootprintsSeen = true;
        gameState.caveLeverRevealed = true;
        gameState.caveHiddenDoorOpen = true;
        gameState.caveTorchesLit = true;
        gameState.riverPuzzleSolved = true;
        // Optional: reflect solved pillar state (all on pillar 3)
        gameState.puzzlePillars = [[], [], [3, 2, 1]];

        // Temple
        gameState.templeTorches = [
            [true, true, true],
            [true, true, true],
            [true, true, true]
        ];
        gameState.templeStaircaseRevealed = true;
        gameState.templeSarcophagusOpened = true;
        // Ensure red shard is discoverable if needed
        if (rooms && rooms["temple_sarcophagusChamber"]) {
            const chamber = rooms["temple_sarcophagusChamber"];
            chamber.items = chamber.items || [];
            if (!chamber.items.includes("red waystone shard")) chamber.items.push("red waystone shard");
        }

        // 2) Grant all meaningful inventory items (deduped)
        const grant = (id) => {
            if (!gameState.inventory.includes(id)) gameState.inventory.push(id);
        };
        // Known carriables
        [
            "leaflet",
            "album",
            "trophy",
            "flashlight",
            "lighter",
            "green waystone shard",
            "red waystone shard",
            "iron key",
            "brass gear"
        ].forEach(grant);

        // Light stays on for safety in dark areas
        gameState.flashlightOn = true;

        // Small score bump for each unique unlock (roughly)
        try {
            gameState.score += 50;
        } catch (_) { /* noop */ }

        updateStatusBar();
        if (typeof save === 'function') save();
        return "Cheat enabled: All puzzles solved, secret ways opened, and every item added to your inventory.";
    },
    // Aliases for convenience (hidden from help)
    "solve all": () => commands.cheat(),
    "give all": () => commands.cheat(),
    godmode: () => commands.cheat(),
    win: () => commands.cheat()
};