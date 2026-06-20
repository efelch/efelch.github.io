const headerElement = document.getElementById('site-header');
const headerText = headerElement ? headerElement.textContent.trim() + "\n\n" : "";

const itemData = {
    leaflet: {
        description: "WELCOME TO THE PERSONAL SITE OF EDWARD FELCH! Edward is a maker of things, a dreamer of dreams, and a frequent dweller in the digital realm. Commands like 'about' and 'contact' will reveal more secrets.",
        isVisible: (state) => state.mailboxOpen || state.hasLeaflet
    },
    mailbox: {
        description: "It's a small, slightly rusted mailbox, the kind you'd see in front of a white house. It has no name on it."
    },
    banana: {
        description: "It's a perfectly ripe yellow banana. It looks delicious, but there's something slightly ominous about how perfect it is."
    },
    shrine: {
        description: "The shrine is a grotesque heap of bananas. Some are fresh, some are black and liquefying. It seems to pulse with a low-frequency hum."
    },
    window: {
        description: "The kitchen window is slightly ajar. It looks like you could climb through it."
    },
    table: {
        description: "It's a sturdy wooden kitchen table. It looks like it was handmade."
    },
    "trophy case": {
        description: "A glass-fronted trophy case. It's empty, save for some dust and the faint smell of old leather."
    },
    crates: {
        description: "The crates are old and covered in a thick layer of dust. They haven't been opened in years."
    },
    "giant oak tree": {
        description: "It's an ancient oak tree, its gnarled branches reaching towards the sky like skeletal fingers."
    },
    "tangled brambles": {
        description: "The brambles are thick and thorny, making it impossible to pass through them. They seem to twitch occasionally."
    },
    "grue tracks": {
        description: "Faint, unsettling impressions in the dirt. They look like three-toed claws, but they're too large to belong to any known animal."
    }
};

const rooms = {
    westOfHouse: {
        name: "WEST OF HOUSE",
        items: ["leaflet"],
        objects: ["mailbox"],
        description: () => {
            let desc = "You are standing in an open field west of a white house, with a boarded front door. ";
            desc += gameState.mailboxOpen ? "There is an open mailbox here." : "There is a small mailbox here.";
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
        objects: ["giant oak tree"],
        description: () => "This is a dimly lit forest, with large trees all around. A giant oak tree dominates this part of the woods. To the south, you can see the north side of a white house. The forest continues east and west.",
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
        objects: ["tangled brambles"],
        description: () => "This is a dimly lit forest, with large trees all around. Tangled brambles block any path further south, except for a faint path leading towards a strange clearing. To the north, you can see the south side of a white house. The forest continues east and west.",
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
        objects: ["grue tracks"],
        description: () => "It is pitch black. You can see some faint grue tracks on the ground near the entrance. You are likely to be eaten by a grue.",
        exits: {
            west: "forestEast",
            east: "caveDeep",
            w: "forestEast",
            e: "caveDeep"
        }
    },
    caveDeep: {
        name: "DEEP CAVE",
        description: () => "As you walk deeper into the cave, you feel a large presence leap toward you! You have been eaten by a grue.",
        exits: {}
    },
    kitchen: {
        name: "KITCHEN",
        objects: ["window", "table", "trophy case"],
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
        objects: ["trophy case"],
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
        objects: ["crates"],
        description: () => "This is the attic. The only exit is a chimney leading down. The room is filled with dusty crates and the smell of old wood.",
        exits: {
            down: "livingRoom",
            d: "livingRoom"
        }
    }
};