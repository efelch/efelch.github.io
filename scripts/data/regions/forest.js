const forestData = {
    items: {
        leaflet: {
            description: "Welcome to the adventure.\n\nUse cardinal directions (north, south, east, west) and verbs like 'look', 'examine', 'take', and 'use'. Explore, solve puzzles, collect treasures. Good luck.",
            isVisible: (state) => state.mailboxOpen || state.inventory.includes('leaflet'),
            roomLine: (state) => (state.mailboxOpen && !state.inventory.includes('leaflet')) ? "A folded leaflet peeks from the open mailbox." : "",
            interactions: {
                take: (state) => {
                    if (state.currentRoom === "forest_westOfHouse" && state.mailboxOpen) {
                        if (state.inventory.includes("leaflet")) return "You already have it.";
                        state.inventory.push("leaflet");
                        state.score++;
                        updateStatusBar();
                        return "Taken.";
                    } else {
                        return "You don't see that here.";
                    }
                }
            }
        },
        mailbox: {
            description: "It's a small, slightly rusted mailbox, the kind you'd see in front of a white house. It has no name on it, and the red flag is bent at an unnatural angle.",
            interactions: {
                open: (state) => {
                    if (state.currentRoom === "forest_westOfHouse") {
                        if (state.mailboxOpen) {
                            return "The mailbox is already open.";
                        }
                        state.mailboxOpen = true;
                        return "Opening the small mailbox reveals a leaflet with some notes about the game.";
                    } else {
                        return "You don't see that here.";
                    }
                },
                close: (state) => {
                    if (state.currentRoom === "forest_westOfHouse") {
                        if (!state.mailboxOpen) {
                            return "The mailbox is already closed.";
                        }
                        state.mailboxOpen = false;
                        return "You close the small mailbox.";
                    } else {
                        return "You don't see that here.";
                    }
                },
                take: () => "The mailbox is securely bolted to the ground. Maybe try opening the mailbox?"
            }
        },
        banana: {
            description: "A perfectly ripe yellow banana. Its peel bears no blemish at all, as if it were placed here moments ago.",
            interactions: {
                take: (state) => {
                    if (state.currentRoom === "forest_shrine") {
                        state.isGameOver = true;
                        return "As you reach for a banana, the air grows cold. A booming voice echoes through the clearing: 'YOU DARE TOUCH THE SACRED FRUIT?' The Banana God appears and peels you alive. You have died.";
                    } else {
                        return "You don't see any bananas here.";
                    }
                }
            }
        },
        shrine: {
            description: "A lopsided cairn of bananas—some fresh, some collapsed into dark syrup. When you look away, the pile seems a hair taller.",
            interactions: {
                take: () => "You try to lift the massive pile of rotting bananas. It's heavy, it's sticky, and it's definitely not going in your pocket. You could take a single banana."
            }
        },
        window: {
            description: "The kitchen window is slightly ajar. The glass is smeared with what looks like old, greasy fingerprints on the *inside*."
        },
        "giant oak tree": {
            description: "An ancient oak. Its branches knit the canopy into a ceiling, and the bark’s whorls suggest faces that vanish if you try to count them."
        },
        "tangled brambles": {
            description: "A wall of thorn and shadow. Every so often there’s the soft sound of something letting go, but nothing moves when you watch."
        },
        "banana slug": {
            description: "A large, bright yellow slug inching along the moss. Its trail gleams like a thin vein of mercury in the dim light.",
            isVisible: () => true,
            aliases: ["slug", "banana slug"],
            interactions: {
                take: () => "The banana slug is far too slimy and delicate to pick up. Besides, it seems quite happy where it is, leaving its glistening trail of slime."
            }
        },
        "green waystone shard": {
            description: () => "A palm-sized shard of smooth gray stone. Its carved runes glimmer a mossy <span class=\"rune-pulse rune-green\">green</span>, pulsing faintly as if something inside were breathing.",
            aliases: ["shard", "stone shard", "waystone", "rune shard", "green shard", "green waystone"],
            isVisible: () => true,
            roomLine: () => "Near the roots, a <span class=\"rune-pulse rune-green\">green waystone shard</span> rests as if left on purpose.",
            interactions: {
                take: (state) => {
                    if (state.currentRoom === "forest_forestNorthOfShrine") {
                        if (state.inventory.includes("green waystone shard")) return "You already have it.";
                        state.inventory.push("green waystone shard");
                        state.score++;
                        updateStatusBar();
                        return "Taken.";
                    } else {
                        return "You don't see that here.";
                    }
                }
            }
        }
    },
    hints: {
        "forest_westOfHouse": "The mailbox flag bends at an odd angle.",
        "forest_southOfHouse": "There's a faint path leading south to a strange clearing.",
        "forest_eastOfHouse": "The kitchen window gapes open. You could slip through it.",
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
                west: "The kitchen window is the only way inside here. Try enter window or in.",
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
            items: ["green waystone shard"],
            objects: ["giant oak tree", "banana slug"],
            description: () => "Dim light filters through old growth. The oak here commands the space without trying, and a yellow slug threads a silver line through the moss. A faint path leads south to a strange clearing with a shrine; to the north the woods darken by degrees.",
            exits: {
                north: "forest_forestSouth",
                south: "forest_shrine"
            }
        },
        forest_forestSouth: {
            name: "FOREST",
            typeOfRoom: "forest",
            objects: ["tangled brambles", "banana slug"],
            description: () => "The trees crowd closer here. A mat of bramble bars the way north along the house line. A narrow trace leads south toward a peculiar clearing. A yellow slug tests the slick of a fallen log. The forest continues east and west.",
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
            description: () => "A hush hangs over the clearing. In the center rises a shrine of bananas, some fresh, others sinking into dark sweetness. The air tastes faintly of sugar and damp paper. A faint path leads north back into the forest.",
            exits: {
                north: "forest_forestNorthOfShrine"
            }
        },
        forest_forestEast: {
            name: "FOREST",
            typeOfRoom: "forest",
            objects: ["banana slug"],
            description: () => "The forest thins just enough to glimpse a white house to the west. To the east, a cleft in the earth breathes cool air like a cave’s first whisper. A yellow slug studies a wet stone. The forest continues south.",
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
            description: () => "A dim stand of trees muffles sound. Through the trunks, the west wall of a white house slips in and out of view. A yellow slug makes an unhurried crossing. The forest continues south.",
            exits: {
                east: "forest_westOfHouse",
                south: "forest_forestSouth"
            }
        }
    }
};
