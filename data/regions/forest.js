const forestData = {
    items: {
        leaflet: {
            description: "BUSINESS SITES:\n- Hanahan Personalization: [Link]\n- Macabre & Mirthworks: [Link]\n\nSOCIAL MEDIA:\n- LinkedIn: [Link]\n- Instagram: [Link]\n- Twitter: [Link]",
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
        "forest_northOfHouse": "The forest to the north looks dark, but maybe there's a way around the house.",
        "forest_southOfHouse": "There's a faint path leading south to a strange clearing.",
        "forest_eastOfHouse": "The kitchen window is open. I wonder if you can 'enter window' or go 'in'?",
        "forest_forestNorth": "This is a good place to explore the woods. You can see the house to the south.",
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
                desc += gameState.mailboxOpen ? "There is an open mailbox here." : "There is a small mailbox here.";
                return desc;
            },
            exits: {
                north: "forest_northOfHouse",
                south: "forest_southOfHouse",
                west: "forest_forestWest",
                east: "The door is boarded and cannot be opened."
            }
        },
        forest_northOfHouse: {
            name: "NORTH OF HOUSE",
            typeOfRoom: "forest",
            description: () => "You are facing the north side of a white house. There is no door here, and the windows are barred with heavy, rusted iron. To the north, the forest looms like a wall of shadows.",
            exits: {
                west: "forest_westOfHouse",
                north: "forest_forestNorth",
                east: "forest_eastOfHouse",
                south: "The house is solid here, and the windows are barred."
            }
        },
        forest_southOfHouse: {
            name: "SOUTH OF HOUSE",
            typeOfRoom: "forest",
            description: () => "You are facing the south side of a white house. The paint is peeling like dead skin. To the south, the forest seems to be slowly encroaching on the property.",
            exits: {
                west: "forest_westOfHouse",
                south: "forest_forestSouth",
                east: "forest_eastOfHouse",
                north: "The house is solid here, and the paint is peeling."
            }
        },
        forest_eastOfHouse: {
            name: "EAST OF HOUSE",
            typeOfRoom: "forest",
            description: () => "You are behind the white house. A single kitchen window is open, like a gasping mouth. To the east, the trees of the dense forest are packed so tightly they seem to be choking each other.",
            exits: {
                west: "The house is solid here, except for the window.",
                north: "forest_northOfHouse",
                south: "forest_southOfHouse",
                east: "forest_forestEast",
                "enter window": "house_kitchen",
                "in": "house_kitchen"
            }
        },
        forest_forestNorth: {
            name: "FOREST",
            typeOfRoom: "forest",
            objects: ["giant oak tree", "banana slug"],
            description: () => "This is a dimly lit forest, with large trees all around. A giant oak tree dominates this part of the woods. A bright yellow banana slug is slowly crawling across the mossy floor. To the south, you can see the north side of a white house. The forest continues east and west.",
            exits: {
                south: "forest_northOfHouse",
                east: "forest_forestEast",
                west: "forest_forestWest"
            }
        },
        forest_forestSouth: {
            name: "FOREST",
            typeOfRoom: "forest",
            objects: ["tangled brambles", "banana slug"],
            description: () => "This is a dimly lit forest, with large trees all around. Tangled brambles block any path further south, except for a faint path leading towards a strange clearing. A bright yellow banana slug is making its way across a nearby log. To the north, you can see the south side of a white house. The forest continues east and west.",
            exits: {
                north: "forest_southOfHouse",
                south: "forest_shrine",
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
                north: "forest_forestSouth"
            }
        },
        forest_forestEast: {
            name: "FOREST",
            typeOfRoom: "forest",
            objects: ["banana slug"],
            description: () => "This is a dimly lit forest, with large trees all around. To the west, you can see a white house through the trees. A narrow path leads into a dark cave to the east. A bright yellow banana slug is inching along a damp rock. The forest also continues north and south.",
            exits: {
                west: "forest_eastOfHouse",
                east: "cave_caveEntrance",
                north: "forest_forestNorth",
                south: "forest_forestSouth"
            }
        },
        forest_forestWest: {
            name: "FOREST",
            typeOfRoom: "forest",
            objects: ["banana slug"],
            description: () => "This is a dimly lit forest, with large trees all around. To the east, you can see the west side of a white house. A bright yellow banana slug is slowly crossing your path. The forest also continues north and south.",
            exits: {
                east: "forest_westOfHouse",
                north: "forest_forestNorth",
                south: "forest_forestSouth"
            }
        }
    }
};
