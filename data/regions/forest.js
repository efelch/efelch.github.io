const forestData = {
    items: {
        leaflet: {
            description: "WELCOME TO THE ADVENTURE!\n\nThis is a classic text-based adventure game. You can navigate the world using cardinal directions (north, south, east, west) and interact with objects using commands like 'look', 'examine', 'take', and 'use'.\n\nYour goal is to explore the area, solve puzzles, and collect treasures.\n\nGood luck!",
            isVisible: (state) => state.mailboxOpen || state.inventory.includes('leaflet')
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
        "giant oak tree": {
            description: "It's an ancient oak tree. Its gnarled branches reach towards the sky like skeletal fingers, and the bark seems to form the distorted faces of people in pain."
        },
        "tangled brambles": {
            description: "The brambles are thick and thorny, making it impossible to pass through them. They seem to twitch occasionally."
        },
        "banana slug": {
            description: "A large, bright yellow slug, common to the damp forests of the Pacific Northwest. It's a vibrant reminder of your college days at UC Santa Cruz. It leaves a glistening trail of slime behind it as it slowly navigates the forest floor.",
            isVisible: () => true,
            aliases: ["slug", "banana slug"]
        }
    },
    hints: {
        "forest_westOfHouse": "Maybe you should check the mailbox for any interesting mail.",
        "forest_southOfHouse": "There's a faint path leading south to a strange clearing.",
        "forest_eastOfHouse": "The kitchen window is open. I wonder if you can 'enter window' or go 'in'?",
        "forest_southWestOfHouse": "From here you can head east to the south side of the house or north back to the west side.",
        "forest_southEastOfHouse": "From here you can go north to the east side of the house or west to the south side.",
        "forest_forestNorthOfShrine": "This is a good place to explore the woods. You can see the house to the south.",
        "forest_forestSouth": "The path south leads to a clearing with a strange shrine.",
        "forest_shrine": "That shrine is covered in bananas. Best not to touch them unless you're feeling very brave... or foolish.",
        "forest_forestEast": "A narrow path to the east leads into a dark cave. You'll probably need a light source if you go in there.",
        "forest_forestWest": "The forest continues here, but the house is back to the east."
    },
    rooms: {
        forest_westOfHouse: {
            name: "WEST OF HOUSE",
            typeOfRoom: "forest",
            items: ["leaflet"],
            objects: ["mailbox"],
            description: () => {
                let desc = "You are standing in an open field west of a white house. The windows are boarded up like eyes sewn shut. ";
                desc += gameState.mailboxOpen ? "There is an open mailbox here. " : "There is a small mailbox here. ";
                desc += "Paths lead west into the forest and south along the house. The door to the east is boarded shut.";
                return desc;
            },
            exits: {
                south: "forest_southWestOfHouse",
                west: "forest_forestWest",
                east: "The door is boarded and cannot be opened."
            }
        },
        forest_southOfHouse: {
            name: "SOUTH OF HOUSE",
            typeOfRoom: "forest",
            description: () => "You are at the south side of a white house. The paint is peeling like dead skin. You can move along the foundation to the west or east; the house blocks the way north.",
            exits: {
                // Only lateral movement along the south face
                west: "forest_southWestOfHouse",
                east: "forest_southEastOfHouse",
                // House wall blocks north
                north: "The house is solid here, and the paint is peeling."
            }
        },
        forest_eastOfHouse: {
            name: "EAST OF HOUSE",
            typeOfRoom: "forest",
            description: () => "You are behind the white house. A single kitchen window is open, like a gasping mouth. You could squeeze through the window to the west, head south along the house, or push east into the forest.",
            exits: {
                // Going west enters through the kitchen window
                west: "house_kitchen",
                // South heads to SOUTHEAST OF HOUSE
                south: "forest_southEastOfHouse",
                east: "forest_forestEast",
                "enter window": "house_kitchen",
                "in": "house_kitchen"
            }
        },
        // New room: SOUTHWEST OF HOUSE
        forest_southWestOfHouse: {
            name: "SOUTHWEST OF HOUSE",
            typeOfRoom: "forest",
            description: () => "You are standing southwest of the white house. The ground is uneven here, and the forest presses close from the west and south. You can go north to the west side of the house or east to the south side.",
            exits: {
                north: "forest_westOfHouse",
                east: "forest_southOfHouse"
            }
        },
        // New room: SOUTHEAST OF HOUSE
        forest_southEastOfHouse: {
            name: "SOUTHEAST OF HOUSE",
            typeOfRoom: "forest",
            description: () => "You are standing southeast of the white house. Vines creep along the foundation, and the forest thickens to the east and south. You can go north to the east side of the house or west to the south side.",
            exits: {
                north: "forest_eastOfHouse",
                west: "forest_southOfHouse"
            }
        },
        forest_forestNorthOfShrine: {
            name: "FOREST",
            typeOfRoom: "forest",
            objects: ["giant oak tree", "banana slug"],
            description: () => "This is a dimly lit forest, with large trees all around. A giant oak tree dominates this part of the woods, and a bright yellow banana slug crawls across the mossy floor. A faint path leads south to a strange clearing with a shrine; to the north the woods deepen.",
            exits: {
                north: "forest_forestSouth",
                south: "forest_shrine"
            }
        },
        forest_forestSouth: {
            name: "FOREST",
            typeOfRoom: "forest",
            objects: ["tangled brambles", "banana slug"],
            description: () => "This is a dimly lit forest, with large trees all around. Tangled brambles block any path to the north along the house line. A faint path leads south toward a strange clearing. A bright yellow banana slug makes its way across a nearby log. The forest continues east and west.",
            exits: {
                south: "forest_forestNorthOfShrine",
                east: "forest_forestEast",
                west: "forest_forestWest"
            }
        },
        forest_shrine: {
            name: "STRANGE CLEARING",
            typeOfRoom: "clearing",
            items: ["banana"],
            objects: ["shrine"],
            description: () => "You are in a quiet clearing. In the center stands an odd shrine: a massive pile of bananas in various stages of decomposition. The smell is sickly sweet and overwhelming. A faint path leads north back into the forest.",
            exits: {
                north: "forest_forestNorthOfShrine"
            }
        },
        forest_forestEast: {
            name: "FOREST",
            typeOfRoom: "forest",
            objects: ["banana slug"],
            description: () => "This is a dimly lit forest, with large trees all around. To the west, you can see a white house through the trees. A narrow path leads into a dark cave to the east. A bright yellow banana slug inches along a damp rock. The forest continues south.",
            exits: {
                west: "forest_eastOfHouse",
                east: "cave_caveEntrance",
                south: "forest_forestSouth"
            }
        },
        forest_forestWest: {
            name: "FOREST",
            typeOfRoom: "forest",
            objects: ["banana slug"],
            description: () => "This is a dimly lit forest, with large trees all around. To the east, you can see the west side of a white house. A bright yellow banana slug slowly crosses your path. The forest continues south.",
            exits: {
                east: "forest_westOfHouse",
                south: "forest_forestSouth"
            }
        }
    }
};
