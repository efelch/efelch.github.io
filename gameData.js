const headerElement = document.getElementById('site-header');
const headerText = headerElement ? headerElement.textContent.trim() + "\n\n" : "";

const itemData = {
    addressBook: {
        description: "EDWARD'S ADDRESS BOOK\n--------------------\nThe leather cover feels strangely warm, almost like skin. Inside, you can reach Edward at:\nEmail: contact@edwardfelch.com\nBusiness: Hanahan Personalization or Macabre and Mirthworks",
        isVisible: (state) => state.drawerOpen || state.inventory.includes('addressBook'),
        aliases: ["address book", "address", "book", "addressbook"]
    },
    leaflet: {
        description: "BUSINESS SITES:\n- Hanahan Personalization: [Link]\n- Macabre & Mirthworks: [Link]\n\nSOCIAL MEDIA:\n- LinkedIn: [Link]\n- Instagram: [Link]\n- Twitter: [Link]",
        isVisible: (state) => state.mailboxOpen || state.inventory.includes('leaflet')
    },
    resume: {
        description: "EDWARD FELCH - RESUME\n--------------------\nSOFTWARE ENGINEER & MAKER\n\nEXPERIENCE:\n- Co-founder, Hanahan Personalization\n- Co-founder, Macabre and Mirthworks\n- Senior Software Architect\n\nSKILLS:\n- Full-stack Development\n- Woodworking & Laser Engraving\n- System Architecture\n\nYou can view the full PDF version at: [Link to Resume PDF]",
        isVisible: (state) => state.filingCabinetOpen || state.inventory.includes('resume')
    },
    album: {
        description: "A DUSTY PHOTO ALBUM\n-------------------\nInside are photographs of beautifully engraved wooden signs and intricate laser-cut art. In every photo, there's a shadow that doesn't quite match the objects, and some of the faces in the background seem to have been scratched out.\n\nView the gallery at: [Link to Gallery/Instagram]",
        isVisible: (state) => state.cratesOpen || state.inventory.includes('album')
    },
    trophy: {
        description: "A small, golden trophy. The engraving reads: 'For Outstanding Achievement in Making Things'. It feels unnervingly heavy, and the gold is cold—colder than metal should be.",
        isVisible: (state) => state.cratesOpen || state.inventory.includes('trophy')
    },
    flashlight: {
        description: "A sturdy, black flashlight. It's surprisingly heavy and looks like it could illuminate even the darkest corners.",
        isVisible: (state) => state.trophyInCase && !state.inventory.includes('flashlight')
    },
    drawer: {
        description: "It's a small wooden drawer built into the kitchen counter.",
        isVisible: () => true, // Always visible as an object to examine/open
        dynamicDescription: (state) => state.drawerOpen ? "The drawer is open, revealing an address book." : "The drawer is closed."
    },
    "filing cabinet": {
        description: "A metal filing cabinet with two drawers. It looks slightly out of place in the living room.",
        isVisible: () => true,
        dynamicDescription: (state) => state.filingCabinetOpen ? "The filing cabinet is open, revealing a resume." : "The filing cabinet is closed."
    },
    mailbox: {
        description: "It's a small, slightly rusted mailbox, the kind you'd see in front of a white house. It has no name on it, and the red flag is bent at an unnatural angle."
    },
    banana: {
        description: "It's a perfectly ripe yellow banana. It looks delicious, but there's something slightly ominous about how perfect it is."
    },
    shrine: {
        description: "The shrine is a grotesque heap of bananas. Some are fresh, some are black and liquefying. It seems to pulse with a low-frequency hum."
    },
    window: {
        description: "The kitchen window is slightly ajar. The glass is smeared with what looks like old, greasy fingerprints on the *inside*."
    },
    table: {
        description: "It's a sturdy wooden kitchen table. Deep scratches mark the surface, as if someone—or something—was desperately clawing at it."
    },
    "trophy case": {
        description: "A glass-fronted trophy case. It's empty, save for some dust and the faint, copper smell of old blood.",
        dynamicDescription: (state) => {
            let desc = "A glass-fronted trophy case.";
            if (state.trophyInCase) {
                desc += " A golden trophy sits proudly inside, looking out of place in the gloom.";
                if (!state.inventory.includes('flashlight')) {
                    desc += " You can also see a flashlight in a small compartment at the back.";
                }
            } else {
                desc += " It's empty, save for some dust and the faint, copper smell of old blood.";
            }
            return desc;
        }
    },
    crates: {
        description: "The crates are old and covered in a thick layer of dust. They haven't been opened in years.",
        dynamicDescription: (state) => state.cratesOpen ? "The crates are open, revealing various packing materials, a photo album, and a golden trophy." : "The crates are closed and covered in dust."
    },
    "giant oak tree": {
        description: "It's an ancient oak tree. Its gnarled branches reach towards the sky like skeletal fingers, and the bark seems to form the distorted faces of people in pain."
    },
    "tangled brambles": {
        description: "The brambles are thick and thorny, making it impossible to pass through them. They seem to twitch occasionally."
    },
    trapdoor: {
        description: "A heavy wooden trapdoor is set into the floor. The iron ring is rusted, and the wood is damp and stained.",
        isVisible: (state) => state.rugMoved,
        dynamicDescription: (state) => state.trapdoorOpen ? "The trapdoor is open, leading down into a suffocating darkness." : "The trapdoor is closed."
    },
    rug: {
        description: "An old, faded rug covers the center of the living room floor. It's thick with dust.",
        isVisible: () => true,
        dynamicDescription: (state) => state.rugMoved ? "The rug has been pushed aside, revealing a trapdoor." : "The rug looks like it might be hiding something."
    },
    workbench: {
        description: "A sturdy but scarred workbench. It's covered in dried oil and mysterious stains.",
        isVisible: () => true
    },
    "rusty tools": {
        description: "A collection of rusted wrenches and hammers. They look like they haven't been used in decades.",
        isVisible: () => true
    },
    bed: {
        description: "A large bed with a moth-eaten canopy. The mattress is slumped and gray with dust.",
        isVisible: () => true
    },
    "vanity mirror": {
        description: "A cracked vanity mirror. Your reflection looks distorted and ghostly in the aged glass.",
        isVisible: () => true
    },
    "grue tracks": {
        description: "Faint, unsettling impressions in the dirt. They look like three-toed claws, but they're too large to belong to any known animal."
    }
};

const roomTypes = {
    forest: [
        "You hear the sound of branches breaking nearby.",
        "Something large rustles in the bushes behind you.",
        "A cold breeze whistles through the trees.",
        "An owl hoots in the distance."
    ],
    cave: [
        "Water drips from the ceiling with a rhythmic thud.",
        "You hear the sound of something moving in the darkness.",
        "A faint echo of your own footsteps returns to you.",
        "The air feels suddenly colder."
    ],
    house: [
        "The house settles with a loud creak.",
        "A door slams shut somewhere in the distance.",
        "You hear a faint scratching sound from within the walls.",
        "The floorboards groan under your weight."
    ],
    clearing: [
        "The silence here is unsettlingly deep.",
        "A swarm of flies buzzes around the rotting fruit.",
        "You feel as though you are being watched from the trees."
    ]
};

const directionAliases = {
    'n': 'north',
    's': 'south',
    'e': 'east',
    'w': 'west',
    'u': 'up',
    'd': 'down'
};

const rooms = {
    westOfHouse: {
        name: "WEST OF HOUSE",
        typeOfRoom: "forest",
        items: ["leaflet"],
        objects: ["mailbox"],
        description: () => {
            let desc = "You are standing in an open field west of a white house. The windows are boarded up like eyes sewn shut. ";
            desc += gameState.mailboxOpen ? "There is an open mailbox here." : "There is a small mailbox here.";
            return desc;
        },
        exits: {
            north: "northOfHouse",
            south: "southOfHouse",
            west: "forestWest",
            east: "The door is boarded and cannot be opened."
        }
    },
    northOfHouse: {
        name: "NORTH OF HOUSE",
        typeOfRoom: "forest",
        description: () => "You are facing the north side of a white house. There is no door here, and the windows are barred with heavy, rusted iron. To the north, the forest looms like a wall of shadows.",
        exits: {
            west: "westOfHouse",
            north: "forestNorth",
            east: "eastOfHouse",
            south: "The house is solid here, and the windows are barred."
        }
    },
    southOfHouse: {
        name: "SOUTH OF HOUSE",
        typeOfRoom: "forest",
        description: () => "You are facing the south side of a white house. The paint is peeling like dead skin. To the south, the forest seems to be slowly encroaching on the property.",
        exits: {
            west: "westOfHouse",
            south: "forestSouth",
            east: "eastOfHouse",
            north: "The house is solid here, and the paint is peeling."
        }
    },
    eastOfHouse: {
        name: "EAST OF HOUSE",
        typeOfRoom: "forest",
        description: () => "You are behind the white house. A single kitchen window is open, like a gasping mouth. To the east, the trees of the dense forest are packed so tightly they seem to be choking each other.",
        exits: {
            west: "The house is solid here, except for the window.",
            north: "northOfHouse",
            south: "southOfHouse",
            east: "forestEast",
            "enter window": "kitchen",
            "in": "kitchen"
        }
    },
    forestNorth: {
        name: "FOREST",
        typeOfRoom: "forest",
        objects: ["giant oak tree"],
        description: () => "This is a dimly lit forest, with large trees all around. A giant oak tree dominates this part of the woods. To the south, you can see the north side of a white house. The forest continues east and west.",
        exits: {
            south: "northOfHouse",
            east: "forestEast",
            west: "forestWest"
        }
    },
    forestSouth: {
        name: "FOREST",
        typeOfRoom: "forest",
        objects: ["tangled brambles"],
        description: () => "This is a dimly lit forest, with large trees all around. Tangled brambles block any path further south, except for a faint path leading towards a strange clearing. To the north, you can see the south side of a white house. The forest continues east and west.",
        exits: {
            north: "southOfHouse",
            south: "shrine",
            east: "forestEast",
            west: "forestWest"
        }
    },
    shrine: {
        name: "STRANGE CLEARING",
        typeOfRoom: "clearing",
        items: ["banana"],
        objects: ["shrine"],
        description: () => "You are in a quiet clearing. In the center stands an odd shrine: a massive pile of bananas in various stages of decomposition. The smell is sickly sweet and overwhelming. A faint path leads north back into the forest.",
        exits: {
            north: "forestSouth"
        }
    },
    forestEast: {
        name: "FOREST",
        typeOfRoom: "forest",
        description: () => "This is a dimly lit forest, with large trees all around. To the west, you can see a white house through the trees. A narrow path leads into a dark cave to the east. The forest also continues north and south.",
        exits: {
            west: "eastOfHouse",
            east: "caveEntrance",
            north: "forestNorth",
            south: "forestSouth"
        }
    },
    forestWest: {
        name: "FOREST",
        typeOfRoom: "forest",
        description: () => "This is a dimly lit forest, with large trees all around. To the east, you can see the west side of a white house. The forest also continues north and south.",
        exits: {
            east: "westOfHouse",
            north: "forestNorth",
            south: "forestSouth"
        }
    },
    caveEntrance: {
        name: "CAVE ENTRANCE",
        typeOfRoom: "cave",
        objects: ["grue tracks"],
        description: () => {
            if (gameState.flashlightOn) {
                return "The beam of your flashlight reveals a jagged cave entrance. The air is damp and cool. You can see the cave floor is covered in loose stones and more of those unsettling grue tracks leading deeper inside. To the west is the forest.";
            }
            return "It is pitch black. You can see some faint grue tracks on the ground near the entrance. You are likely to be eaten by a grue.";
        },
        exits: {
            west: "forestEast",
            east: "caveDeep"
        }
    },
    caveDeep: {
        name: "DEEP CAVE",
        typeOfRoom: "cave",
        description: () => {
            if (gameState.flashlightOn) {
                return "You are in a large, damp chamber deep within the cave. The flashlight beam reflects off wet stalactites. In the corner, you see a small, abandoned campsite. A path leads back west to the entrance.";
            }
            return "As you walk deeper into the cave, you feel a large presence leap toward you! You have been eaten by a grue.";
        },
        exits: {
            west: "caveEntrance"
        }
    },
    kitchen: {
        name: "KITCHEN",
        typeOfRoom: "house",
        items: ["addressBook"],
        objects: ["window", "table", "drawer"],
        description: () => {
            let desc = "The kitchen is unnervingly clean, yet a faint smell of decay lingers. A table sits in the center. ";
            desc += gameState.drawerOpen ? "The drawer is open." : "The drawer is closed.";
            desc += " To the west is the living room, north leads to a bedroom, and south leads to a garage. The window leads out to the yard.";
            return desc;
        },
        exits: {
            east: "You have to go 'out' through the window.",
            west: "livingRoom",
            north: "bedroom",
            south: "garage",
            out: "eastOfHouse"
        }
    },
    livingRoom: {
        name: "LIVING ROOM",
        typeOfRoom: "house",
        items: ["resume", "flashlight"],
        objects: ["trophy case", "filing cabinet", "rug", "trapdoor"],
        description: () => {
            let desc = "The living room is filled with long, flickering shadows. ";
            desc += gameState.filingCabinetOpen ? "An open filing cabinet sits in the corner like a gaping wound. " : "A closed filing cabinet sits in the corner. ";
            if (gameState.rugMoved) {
                desc += "An old rug has been pushed aside, revealing a trapdoor in the floor. ";
                desc += gameState.trapdoorOpen ? "The trapdoor is open." : "The trapdoor is closed.";
            } else {
                desc += "There is a faint, rhythmic thumping coming from under an old, dusty rug in the center of the room.";
            }
            desc += " To the east is the kitchen, and a dark chimney leads up.";
            return desc;
        },
        exits: {
            east: "kitchen",
            up: "attic",
            down: () => {
                if (!gameState.rugMoved) return "You can't go that way.";
                if (!gameState.trapdoorOpen) return "The trapdoor is closed.";
                return "cellar";
            }
        }
    },
    cellar: {
        name: "CELLAR",
        typeOfRoom: "house",
        description: () => "You are in a dark, damp cellar. The air is thick with the smell of wet earth and rot. A ladder leads up to the living room.",
        exits: {
            up: "livingRoom"
        }
    },
    bedroom: {
        name: "BEDROOM",
        typeOfRoom: "house",
        objects: ["bed", "vanity mirror"],
        description: () => "This bedroom feels like it was abandoned in a hurry. A moth-eaten bed stands against one wall, and a cracked mirror reflects the dim light. To the south is the kitchen.",
        exits: {
            south: "kitchen"
        }
    },
    garage: {
        name: "GARAGE",
        typeOfRoom: "house",
        objects: ["workbench", "rusty tools"],
        description: () => "The garage is cold and smells of old gasoline. Shadows stretch long across the oil-stained floor. A workbench sits against the far wall. To the north is the kitchen.",
        exits: {
            north: "kitchen"
        }
    },
    attic: {
        name: "ATTIC",
        typeOfRoom: "house",
        items: ["album", "trophy"],
        objects: ["crates"],
        description: () => {
            let desc = "The attic is cramped and the air is stale, thick with the smell of mothballs and old secrets. ";
            desc += gameState.cratesOpen ? "The crates are open, revealing their unsettling contents." : "The crates are closed and covered in dust.";
            return desc;
        },
        exits: {
            down: "livingRoom"
        }
    }
};