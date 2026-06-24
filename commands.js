"use strict";
const commands = {
    help: () => {
        let helpText = "Game commands: north, south, east, west, up, down, look, examine [object], inventory, take [item], use [item], read [item], open [object], close [object], move [object], hint, clear, restart";
        if (gameState.currentRoom === "cave_riverCanyon") {
            helpText += "\nIn this canyon, you can use: move disc from [1-3] to [1-3]";
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
        
        const roomObjects = rooms[gameState.currentRoom].objects || [];
        const matchedObject = findMatch(target, roomObjects);

        if (matchedObject === "mailbox") {
            if (gameState.currentRoom === "forest_westOfHouse") {
                if (gameState.mailboxOpen) {
                    return "The mailbox is already open.";
                }
                gameState.mailboxOpen = true;
                return "Opening the small mailbox reveals a leaflet with some notes about the game.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedObject === "drawer") {
            if (gameState.currentRoom === "house_kitchen") {
                if (gameState.drawerOpen) {
                    return "The drawer is already open.";
                }
                gameState.drawerOpen = true;
                return "You open the drawer, but it appears to be empty.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedObject === "filing cabinet") {
            if (gameState.currentRoom === "house_livingRoom") {
                if (gameState.filingCabinetOpen) {
                    return "The filing cabinet is already open.";
                }
                gameState.filingCabinetOpen = true;
                return "You open the filing cabinet, but it appears to be empty.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedObject === "crates") {
            if (gameState.currentRoom === "house_attic") {
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
            if (gameState.currentRoom === "house_livingRoom") {
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
            if (gameState.currentRoom === "forest_westOfHouse") {
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
            if (gameState.currentRoom === "house_kitchen") {
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
            if (gameState.currentRoom === "house_livingRoom") {
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
            if (gameState.currentRoom === "house_attic") {
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
            if (gameState.currentRoom === "house_livingRoom") {
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

        const roomObjects = rooms[gameState.currentRoom].objects || [];
        const matchedObject = findMatch(target, roomObjects);
        
        if (matchedObject === "rug") {
            if (gameState.currentRoom === "house_livingRoom") {
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
            if (gameState.currentRoom === "house_livingRoom") {
                gameState.inventory = gameState.inventory.filter(i => i !== "trophy");
                gameState.trophyInCase = true;
                gameState.score += 5;
                updateStatusBar();
                return "You carefully place the trophy in the trophy case. As it clicks into place, a hidden compartment at the back pops open, revealing a flashlight!";
            }
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
        gameState.visitedRooms = ["forest_westOfHouse"];
        gameState.puzzlePillars = [[3, 2, 1], [], []];
        gameState.riverPuzzleSolved = false;
        gameState.riverHintStep = 0;
        
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
        let outputText = `<b>${room.name}</b>\n${room.description()}`;
        
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
                const openable = ["mailbox", "drawer", "filing cabinet", "crates", "trapdoor"];
                const moveable = ["rug"];
                
                if (openable.includes(objId)) {
                    const isOpen = (objId === "trapdoor" && gameState.trapdoorOpen) || 
                                   (objId === "mailbox" && gameState.mailboxOpen) ||
                                   (objId === "drawer" && gameState.drawerOpen) ||
                                   (objId === "filing cabinet" && gameState.filingCabinetOpen) ||
                                   (objId === "crates" && gameState.cratesOpen);
                    const action = isOpen ? "close" : "open";
                    link += ` (<span class="clickable" data-command="${action} ${objId}">${action}</span>)`;
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
        
        if (!matchedItem) {
            return "You aren't carrying that.";
        }
        
        if (matchedItem === "flashlight") {
            gameState.flashlightOn = !gameState.flashlightOn;
            let response = gameState.flashlightOn ? "You turn on the flashlight. A bright beam of light cuts through the darkness." : "You turn off the flashlight.";
            
            if (!gameState.flashlightOn && (gameState.currentRoom === "cave_caveEntrance" || gameState.currentRoom === "cave_caveDeep" || gameState.currentRoom === "cave_riverBank" || gameState.currentRoom === "cave_riverMidstream" || gameState.currentRoom === "cave_riverCanyon" || gameState.currentRoom === "cave_riverDownstream")) {
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
            if (gameState.currentRoom === "forest_westOfHouse" && gameState.mailboxOpen) {
                gameState.inventory.push("leaflet");
                gameState.score++;
                updateStatusBar();
                return "Taken.";
            } else {
                return "You don't see that here.";
            }
        }
        
        if (matchedItem === "album") {
            if (gameState.currentRoom === "house_attic") {
                if (!gameState.cratesOpen) {
                    return "The crates are closed.";
                }
                gameState.inventory.push("album");
                gameState.score++;
                updateStatusBar();
                return "Taken.";
            } else {
                return "You don't see that here.";
            }
        }
        
        if (matchedItem === "trophy") {
            if (gameState.currentRoom === "house_attic") {
                if (!gameState.cratesOpen) {
                    return "The crates are closed.";
                }
                gameState.inventory.push("trophy");
                gameState.score++;
                updateStatusBar();
                return "Taken.";
            } else {
                return "You don't see that here.";
            }
        }
        
        if (matchedItem === "flashlight") {
            if (gameState.currentRoom === "house_livingRoom") {
                if (!gameState.trophyInCase) {
                    return "You don't see a flashlight here.";
                }
                gameState.inventory.push("flashlight");
                gameState.score++;
                updateStatusBar();
                return "Taken.";
            } else {
                return "You don't see that here.";
            }
        }
        
        if (matchedItem === "iron key") {
            if (gameState.currentRoom === "cave_riverCanyon") {
                if (!gameState.riverPuzzleSolved) {
                    return "You don't see that here.";
                }
                gameState.inventory.push("iron key");
                gameState.score += 5;
                updateStatusBar();
                return "Taken.";
            } else {
                return "You don't see that here.";
            }
        }

        if (matchedItem === "brass gear") {
            if (gameState.currentRoom === "house_cellar") {
                gameState.inventory.push("brass gear");
                gameState.score += 5;
                updateStatusBar();
                return "Taken. The gear feels heavy and cold in your hand.";
            } else {
                return "You don't see that here.";
            }
        }
        
        if (matchedItem === "banana" || matchedItem === "bananas") {
            if (gameState.currentRoom === "forest_shrine") {
                gameState.isGameOver = true;
                return "As you reach for a banana, the air grows cold. A booming voice echoes through the clearing: 'YOU DARE TOUCH THE SACRED FRUIT?' The Banana God appears and peels you alive. You have died.";
            } else {
                return "You don't see any bananas here.";
            }
        }
        
        if (matchedItem === "basalt discs" || matchedItem === "discs") {
            if (gameState.currentRoom === "cave_riverCanyon") {
                return "The discs are far too heavy to carry. You can move them between the pillars using the 'move' command (e.g., 'move disc from 1 to 2').";
            }
        }
        
        if (matchedItem === "banana slug" || matchedItem === "slug") {
            return "The banana slug is far too slimy and delicate to pick up. Besides, it seems quite happy where it is, leaving its glistening trail of slime.";
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