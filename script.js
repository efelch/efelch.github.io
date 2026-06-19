const output = document.getElementById('output');
const input = document.getElementById('command-input');
const statusBar = document.getElementById('status-bar');

let currentRoom = "westOfHouse";
let hasLeaflet = false;
let mailboxOpen = false;
let isGameOver = false;
let turns = 0;
let score = 0;
let visitedRooms = ["westOfHouse"];

const rooms = {
    westOfHouse: {
        name: "WEST OF HOUSE",
        items: ["leaflet"],
        objects: ["mailbox"],
        description: () => {
            let desc = "You are standing in an open field west of a white house, with a boarded front door. ";
            desc += mailboxOpen ? "There is an open mailbox here." : "There is a small mailbox here.";
            return desc;
        },
        exits: {
            north: "northOfHouse",
            south: "southOfHouse",
            west: "forestWest",
            east: "The door is boarded and cannot be opened.",
            n: "northOfHouse",
            s: "southOfHouse",
            w: "forestWest",
            e: "The door is boarded and cannot be opened."
        }
    },
    northOfHouse: {
        name: "NORTH OF HOUSE",
        description: () => "You are facing the north side of a white house. There is no door here, and all the windows are barred. To the north is a dark forest.",
        exits: {
            south: "westOfHouse",
            north: "forestNorth",
            east: "eastOfHouse",
            s: "westOfHouse",
            n: "forestNorth",
            e: "eastOfHouse"
        }
    },
    southOfHouse: {
        name: "SOUTH OF HOUSE",
        description: () => "You are facing the south side of a white house. There is no door here, and all the windows are barred. To the south is a dark forest.",
        exits: {
            north: "westOfHouse",
            south: "forestSouth",
            east: "eastOfHouse",
            n: "westOfHouse",
            s: "forestSouth",
            e: "eastOfHouse"
        }
    },
    eastOfHouse: {
        name: "EAST OF HOUSE",
        description: () => "You are behind the white house. A kitchen window is open. To the east is a dense forest.",
        exits: {
            west: "The house is solid here, except for the window.",
            north: "northOfHouse",
            south: "southOfHouse",
            east: "forestEast",
            "enter window": "kitchen",
            "in": "kitchen",
            w: "The house is solid here, except for the window.",
            n: "northOfHouse",
            s: "southOfHouse",
            e: "forestEast"
        }
    },
    forestNorth: {
        name: "FOREST",
        description: () => "This is a dimly lit forest, with large trees all around. To the south, you can see the north side of a white house. The forest continues east and west.",
        exits: {
            south: "northOfHouse",
            east: "forestEast",
            west: "forestWest",
            s: "northOfHouse",
            e: "forestEast",
            w: "forestWest"
        }
    },
    forestSouth: {
        name: "FOREST",
        description: () => "This is a dimly lit forest, with large trees all around. To the north, you can see the south side of a white house. To the south, a faint path leads towards a strange clearing. The forest continues east and west.",
        exits: {
            north: "southOfHouse",
            south: "shrine",
            east: "forestEast",
            west: "forestWest",
            n: "southOfHouse",
            s: "shrine",
            e: "forestEast",
            w: "forestWest"
        }
    },
    shrine: {
        name: "STRANGE CLEARING",
        items: ["banana"],
        objects: ["shrine"],
        description: () => "You are in a quiet clearing. In the center stands an odd shrine: a massive pile of bananas in various stages of decomposition. The smell is sickly sweet and overwhelming. A faint path leads north back into the forest.",
        exits: {
            north: "forestSouth",
            n: "forestSouth"
        }
    },
    forestEast: {
        name: "FOREST",
        description: () => "This is a dimly lit forest, with large trees all around. To the west, you can see a white house through the trees. A narrow path leads into a dark cave to the east. The forest also continues north and south.",
        exits: {
            west: "eastOfHouse",
            east: "caveEntrance",
            north: "forestNorth",
            south: "forestSouth",
            w: "eastOfHouse",
            e: "caveEntrance",
            n: "forestNorth",
            s: "forestSouth"
        }
    },
    forestWest: {
        name: "FOREST",
        description: () => "This is a dimly lit forest, with large trees all around. To the east, you can see the west side of a white house. The forest also continues north and south.",
        exits: {
            east: "westOfHouse",
            north: "forestNorth",
            south: "forestSouth",
            e: "westOfHouse",
            n: "forestNorth",
            s: "forestSouth"
        }
    },
    caveEntrance: {
        name: "CAVE ENTRANCE",
        description: () => "It is pitch black. You are likely to be eaten by a grue.",
        exits: {
            west: "forestEast",
            east: "caveDeep",
            w: "forestEast",
            e: "caveDeep"
        }
    },
    caveDeep: {
        name: "DEEP CAVE",
        description: () => "You have been eaten by a grue.",
        exits: {}
    },
    kitchen: {
        name: "KITCHEN",
        description: () => "You are in the kitchen of the white house. A table sits in the center. On the table is a trophy case. To the west is a living room, and a door leads east out to the yard.",
        exits: {
            east: "eastOfHouse",
            west: "livingRoom",
            out: "eastOfHouse",
            e: "eastOfHouse",
            w: "livingRoom"
        }
    },
    livingRoom: {
        name: "LIVING ROOM",
        description: () => "You are in the living room. There is a trophy case here. To the east is the kitchen, and a dark chimney leads up.",
        exits: {
            east: "kitchen",
            up: "attic",
            e: "kitchen",
            u: "attic"
        }
    },
    attic: {
        name: "ATTIC",
        description: () => "This is the attic. The only exit is a chimney leading down. The room is filled with dusty crates and the smell of old wood.",
        exits: {
            down: "livingRoom",
            d: "livingRoom"
        }
    }
};

const commands = {
    help: "Available commands: north, south, east, west, up, down, look, inventory, open [object], take [item], read [item], about, contact, clear, restart",
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
        currentRoom = "westOfHouse";
        hasLeaflet = false;
        mailboxOpen = false;
        isGameOver = false;
        turns = 0;
        score = 0;
        visitedRooms = ["westOfHouse"];
        output.innerHTML = '';
        if (window.innerWidth > 600) {
            printToTerminal(headerText);
        }
        commands.look();
        updateStatusBar();
        printToTerminal("\nGame restarted.");
        handleScrolling();
    },
    about: "Edward Felch - A craftsman and creator. Specializing in woodworking and laser engraving. Co-founder of Hanahan Personalization and Macabre and Mirthworks.",
    contact: "You can reach Edward at Hanahan Personalization or Macabre and Mirthworks. Email: contact@edwardfelch.com",
    look: (target) => {
        if (target) {
            return commands.read(target);
        }
        const room = rooms[currentRoom];
        let outputText = `${room.name}\n${room.description()}`;
        
        const possibleDirections = Object.keys(room.exits).filter(dir => 
            ["north", "south", "east", "west", "up", "down", "in", "out"].includes(dir)
        );
        
        if (possibleDirections.length > 0) {
            outputText += `\n\nPossible directions: ${possibleDirections.join(", ")}`;
        }
        
        printToTerminal(outputText);
    },
    l: (target) => commands.look(target),
    inventory: () => {
        if (hasLeaflet) {
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
        if (target === "mailbox") {
            if (currentRoom === "westOfHouse") {
                if (mailboxOpen) {
                    return "The mailbox is already open.";
                }
                mailboxOpen = true;
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

        const roomItems = rooms[currentRoom].items || [];
        const roomObjects = rooms[currentRoom].objects || [];
        
        if (target === "leaflet") {
            if (currentRoom === "westOfHouse" && mailboxOpen && !hasLeaflet) {
                hasLeaflet = true;
                score++;
                return "Taken.";
            } else if (hasLeaflet) {
                return "You already have it.";
            } else {
                return "You don't see that here.";
            }
        }

        if (target === "banana" || target === "bananas") {
            if (currentRoom === "shrine") {
                isGameOver = true;
                return "As you reach for a banana, the air grows cold. A booming voice echoes through the clearing: 'YOU DARE TOUCH THE SACRED FRUIT?' The Banana God appears and peels you alive. You have died.";
            } else {
                return "You don't see any bananas here.";
            }
        }

        if (roomItems.includes(target)) {
            return `You can't take the ${target} yet.`; // Placeholder for other items
        }

        if (roomObjects.includes(target)) {
            if (target === "mailbox") {
                return "The mailbox is securely bolted to the ground. Maybe try opening the mailbox?";
            }
            if (target === "shrine") {
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
        if (target === "leaflet") {
            if (hasLeaflet) {
                return "WELCOME TO THE PERSONAL SITE OF EDWARD FELCH! Edward is a maker of things, a dreamer of dreams, and a frequent dweller in the digital realm. Commands like 'about' and 'contact' will reveal more secrets.";
            } else {
                return "You don't have the leaflet.";
            }
        }
        return "You don't see that here.";
    },
    clear: () => {
        output.innerHTML = '';
    }
};

function move(direction) {
    const room = rooms[currentRoom];
    const nextRoom = room.exits[direction];
    if (nextRoom) {
        if (rooms[nextRoom]) {
            currentRoom = nextRoom;
            if (!visitedRooms.includes(currentRoom)) {
                visitedRooms.push(currentRoom);
                score++;
            }
            if (currentRoom === "caveDeep") {
                isGameOver = true;
            }
            updateStatusBar();
            return ""; // Success, no extra message needed as look() will be called
        } else {
            return nextRoom;
        }
    } else {
        return "You can't go that way.";
    }
}

function updateStatusBar() {
    const roomName = rooms[currentRoom].name;
    statusBar.innerHTML = `<span>${roomName}</span><span>Score: ${score}</span><span>Turns: ${turns}</span>`;
}

function handleScrolling() {
    // Handle scrolling after all content is printed
    if (window.innerWidth > 600) {
        setTimeout(() => {
            input.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    } else {
        // On mobile, scroll to top so they see the room description
        // Use setTimeout to ensure DOM is updated and keyboard state is stable
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 50);
    }
}

const headerText = `EDWARD FELCH: The Artisan's Portfolio
Personal interactive fiction - a maker's story
Copyright (c) 2024, 2025, 2026
Edward Felch, Inc. All rights reserved.
Hanahan Personalization, All rights reserved.
Macabre and Mirthworks, All rights reserved.
Release 15 / Serial number 20260618


`;

function printToTerminal(text) {
    if (!text) return;
    const line = document.createElement('div');
    line.style.whiteSpace = 'pre-wrap';
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const cmd = input.value.toLowerCase().trim();
        
        if (cmd !== '') {
            turns++;
        }

        // Execute command
        let commandOutput = "";
        
        const [action, ...args] = cmd.split(' ');
        const arg = args.join(' ');

        if (isGameOver && cmd !== 'restart') {
            commandOutput = "The game is over. Type 'restart' to play again.";
        } else if (commands[cmd]) {
            if (typeof commands[cmd] === 'function') {
                const result = commands[cmd]();
                if (result) commandOutput = result;
            } else {
                commandOutput = commands[cmd];
            }
        } else if (commands[action] && typeof commands[action] === 'function') {
            const result = commands[action](arg);
            if (result) commandOutput = result;
        } else if (!isGameOver && rooms[currentRoom].exits[cmd]) {
            commandOutput = move(cmd);
        } else if (cmd !== '') {
            commandOutput = isGameOver ? "The game is over. Type 'restart' to play again." : `Unknown command: ${cmd}. Type 'help' for help.`;
        }

        if (cmd === 'restart') {
            input.value = '';
            return;
        }

        // Clear and refresh screen
        output.innerHTML = '';
        if (window.innerWidth > 600) {
            printToTerminal(headerText);
        }
        commands.look();
        updateStatusBar();

        if (isGameOver && (currentRoom === "caveDeep" || currentRoom === "shrine")) {
            printToTerminal("\nType 'restart' to start over.");
        }
        
        if (commandOutput) {
            printToTerminal("\n" + commandOutput);
        }

        handleScrolling();
        
        input.value = '';
    }
});

// Focus input on any click
document.addEventListener('click', () => {
    input.focus();
});

// Initial greeting
updateStatusBar();
printToTerminal(headerText);
commands.look();
printToTerminal("\n(Type 'help' for available commands)");
