const houseData = {
    items: {
        "address book": {
            description: "EDWARD'S ADDRESS BOOK\n--------------------\nThe leather cover feels strangely warm, almost like skin. Inside, you can reach Edward at:\nEmail: contact@edwardfelch.com\nBusiness: Hanahan Personalization or Macabre and Mirthworks",
            isVisible: (state) => state.drawerOpen || state.inventory.includes('address book'),
            aliases: ["address", "book", "addressbook"]
        },
        album: {
            description: "A DUSTY PHOTO ALBUM\n-------------------\nInside are photographs of various personal projects and artisanal creations. In every photo, there's a shadow that doesn't quite match the objects, and some of the faces in the background seem to have been scratched out.",
            isVisible: (state) => state.cratesOpen || state.inventory.includes('album'),
            interactions: {
                take: (state) => {
                    if (state.currentRoom === "house_attic") {
                        if (!state.cratesOpen) return "The crates are closed.";
                        if (state.inventory.includes("album")) return "You already have it.";
                        state.inventory.push("album");
                        state.score++;
                        updateStatusBar();
                        return "Taken.";
                    } else {
                        return "You don't see that here.";
                    }
                }
            }
        },
        trophy: {
            description: "A small, golden trophy. The engraving reads: 'For Outstanding Achievement in Making Things'. It feels unnervingly heavy, and the gold is cold—colder than metal should be.",
            isVisible: (state) => state.cratesOpen || state.inventory.includes('trophy'),
            interactions: {
                take: (state) => {
                    if (state.currentRoom === "house_attic") {
                        if (!state.cratesOpen) return "The crates are closed.";
                        if (state.inventory.includes("trophy")) return "You already have it.";
                        state.inventory.push("trophy");
                        state.score++;
                        updateStatusBar();
                        return "Taken.";
                    } else {
                        return "You don't see that here.";
                    }
                }
            }
        },
        flashlight: {
            description: "A sturdy, black flashlight. It's surprisingly heavy and looks like it could illuminate even the darkest corners.",
            isVisible: (state) => state.trophyInCase && !state.inventory.includes('flashlight'),
            roomLine: (state) => (state.trophyInCase && !state.inventory.includes('flashlight')) ? "A sturdy flashlight waits in a back compartment of the trophy case." : "",
            interactions: {
                take: (state) => {
                    if (state.currentRoom === "house_livingRoom") {
                        if (!state.trophyInCase) return "You don't see a flashlight here.";
                        if (state.inventory.includes("flashlight")) return "You already have it.";
                        state.inventory.push("flashlight");
                        state.score++;
                        updateStatusBar();
                        return "Taken.";
                    } else {
                        return "You don't see that here.";
                    }
                },
                use: (state) => {
                    state.flashlightOn = !state.flashlightOn;
                    let response = state.flashlightOn ? "You turn on the flashlight. A bright beam of light cuts through the darkness." : "You turn off the flashlight.";

                    const room = rooms[state.currentRoom];
                    if (!state.flashlightOn && room.isDark && !state.caveTorchesLit) {
                        state.isGameOver = true;
                        response += "\n\nAs the light fades, you hear a low growl. A grue leaps from the shadows and eats you!";
                    }
                    return response;
                }
            }
        },
        lighter: {
            description: "A small butane lighter. The knurled wheel throws a tidy spark; the flame smells faintly of citrus when it catches.",
            isVisible: (state) => (state.drawerOpen || state.inventory.includes('lighter')),
            aliases: ["cigarette lighter", "bic", "butane lighter"],
            roomLine: (state) => state.drawerOpen ? "A small butane lighter rests in the open drawer." : "",
            interactions: {
                take: (state) => {
                    if (state.currentRoom === "house_kitchen") {
                        if (!state.drawerOpen) return "The drawer is closed.";
                        if (state.inventory.includes("lighter")) return "You already have it.";
                        state.inventory.push("lighter");
                        state.score++;
                        updateStatusBar();
                        return "Taken.";
                    } else {
                        return "You don't see that here.";
                    }
                }
            }
        },
        drawer: {
            description: "A small drawer built into the counter.",
            isVisible: () => true,
            dynamicDescription: (state) => state.drawerOpen ? "The drawer is open, but appears to be empty." : "The drawer is closed.",
            interactions: {
                open: (state) => {
                    if (state.currentRoom === "house_kitchen") {
                        if (state.drawerOpen) {
                            return "The drawer is already open.";
                        }
                        state.drawerOpen = true;
                        return "You open the drawer, but it appears to be empty.";
                    } else {
                        return "You don't see that here.";
                    }
                },
                close: (state) => {
                    if (state.currentRoom === "house_kitchen") {
                        if (!state.drawerOpen) {
                            return "The drawer is already closed.";
                        }
                        state.drawerOpen = false;
                        return "You close the drawer.";
                    } else {
                        return "You don't see that here.";
                    }
                }
            }
        },
        "filing cabinet": {
            description: "A metal filing cabinet with two drawers. It looks slightly out of place in the living room.",
            isVisible: () => true,
            dynamicDescription: (state) => state.filingCabinetOpen ? "The filing cabinet is open, but appears to be empty." : "The filing cabinet is closed.",
            interactions: {
                open: (state) => {
                    if (state.currentRoom === "house_livingRoom") {
                        if (state.filingCabinetOpen) {
                            return "The filing cabinet is already open.";
                        }
                        state.filingCabinetOpen = true;
                        return "You open the filing cabinet, but it appears to be empty.";
                    } else {
                        return "You don't see that here.";
                    }
                },
                close: (state) => {
                    if (state.currentRoom === "house_livingRoom") {
                        if (!state.filingCabinetOpen) {
                            return "The filing cabinet is already closed.";
                        }
                        state.filingCabinetOpen = false;
                        return "You close the filing cabinet.";
                    } else {
                        return "You don't see that here.";
                    }
                }
            }
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
                    desc += " It's empty, save for dust and a faint copper tang.";
                }
                return desc;
            },
            interactions: {
                "put trophy": (state) => {
                    if (state.currentRoom === "house_livingRoom") {
                        if (!state.inventory.includes("trophy")) return "You aren't carrying the trophy.";
                        state.inventory = state.inventory.filter(i => i !== "trophy");
                        state.trophyInCase = true;
                        state.score += 5;
                        updateStatusBar();
                        return "You carefully place the trophy in the trophy case. As it clicks into place, a hidden compartment at the back pops open, revealing a flashlight!";
                    }
                    return "You can't do that here.";
                }
            }
        },
        crates: {
            description: "The crates are old and covered in a thick layer of dust. They haven't been opened in years.",
            dynamicDescription: (state) => state.cratesOpen ? "The crates are open, revealing various packing materials, a photo album, and a golden trophy." : "The crates are closed and covered in dust.",
            interactions: {
                open: (state) => {
                    if (state.currentRoom === "house_attic") {
                        if (state.cratesOpen) {
                            return "The crates are already open.";
                        }
                        state.cratesOpen = true;
                        return "You pry open the dusty crates, revealing a photo album and a golden trophy.";
                    } else {
                        return "You don't see that here.";
                    }
                },
                close: (state) => {
                    if (state.currentRoom === "house_attic") {
                        if (!state.cratesOpen) {
                            return "The crates are already closed.";
                        }
                        state.cratesOpen = false;
                        return "You close the dusty crates.";
                    } else {
                        return "You don't see that here.";
                    }
                }
            }
        },
        trapdoor: {
            description: "A heavy wooden trapdoor is set into the floor. The iron ring is rusted, and the wood is damp and stained.",
            isVisible: (state) => state.rugMoved,
            dynamicDescription: (state) => state.trapdoorOpen ? "The trapdoor is open, leading down into a suffocating darkness." : "The trapdoor is closed.",
            interactions: {
                open: (state) => {
                    if (state.currentRoom === "house_livingRoom") {
                        if (!state.rugMoved) {
                            return "You don't see that here.";
                        }
                        if (state.trapdoorOpen) {
                            return "The trapdoor is already open.";
                        }
                        state.trapdoorOpen = true;
                        return "You pull on the heavy iron ring, and the trapdoor creaks open, revealing a dark ladder leading down.";
                    } else {
                        return "You don't see that here.";
                    }
                },
                close: (state) => {
                    if (state.currentRoom === "house_livingRoom") {
                        if (!state.rugMoved) {
                            return "You don't see that here.";
                        }
                        if (!state.trapdoorOpen) {
                            return "The trapdoor is already closed.";
                        }
                        state.trapdoorOpen = false;
                        return "You push the heavy trapdoor closed. It shuts with a dull thud.";
                    } else {
                        return "You don't see that here.";
                    }
                },
                pull: (state) => state.interactions.open(state)
            }
        },
        rug: {
            description: "An old, faded rug covers the center of the living room floor. It's thick with dust.",
            isVisible: () => true,
            dynamicDescription: (state) => state.rugMoved ? "The rug has been pushed aside, revealing a trapdoor." : "The rug looks like it might be hiding something.",
            interactions: {
                move: (state) => {
                    if (state.currentRoom === "house_livingRoom") {
                        if (state.rugMoved) {
                            return "The rug has already been moved.";
                        }
                        state.rugMoved = true;
                        return "You push the heavy rug aside, revealing a wooden trapdoor underneath!";
                    }
                    return "You can't move that.";
                }
            }
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
            isVisible: () => true,
            interactions: {
                examine: () => {
                    terminal.showJumpScare();
                    return "A cracked vanity mirror. Your reflection looks distorted and ghostly in the aged glass.";
                }
            }
        },
        "brass gear": {
            description: "A heavy brass gear etched with the 'Macabre and Mirthworks' logo. It feels unnaturally cold to the touch.",
            isVisible: (state) => state.currentRoom === 'house_cellar' && !state.inventory.includes('brass gear'),
            roomLine: () => "In the corner, a heavy brass gear catches the light.",
            interactions: {
                take: (state) => {
                    if (state.currentRoom === 'house_cellar') {
                        if (state.inventory.includes("brass gear")) return "You already have it.";
                        state.inventory.push("brass gear");
                        state.score += 5;
                        updateStatusBar();
                        return "Taken. The gear feels heavy and cold in your hand.";
                    } else {
                        return "You don't see that here.";
                    }
                }
            }
        }
    },
    hints: {
        "house_kitchen": (state) => state.drawerOpen ? "You've explored the kitchen. There are other rooms to the west, north, and south." : "That drawer in the counter might hold something useful.",
        "house_livingRoom": (state) => {
            if (!state.rugMoved) return "The rug in the center of the room seems to be hiding something. Maybe you should try to 'move' it?";
            if (!state.trapdoorOpen) return "You've found a trapdoor. You could open it.";
            if (!state.trophyInCase) return "The trophy case is empty. If you found a trophy, maybe it belongs in there?";
            if (!state.inventory.includes("flashlight")) return "The flashlight is visible in the back of the trophy case now.";
            return "The trapdoor leads down to the cellar, and the kitchen is to the east.";
        },
        "house_cellar": (state) => state.inventory.includes("brass gear") ? "It's damp and dark down here. The only way is back up." : "There's something metallic glinting in the corner of the cellar. Maybe you should 'examine' or 'take' it.",
        "house_bedroom": "The vanity mirror looks interesting, but your reflection might give you a fright.",
        "house_garage": "There are tools and a workbench here. Not much else to see for now.",
        "house_attic": (state) => state.cratesOpen ? "You've opened the crates. Have you taken the album and the trophy?" : "Those dusty crates look like they haven't been opened in a long time. Maybe you can 'open' them?"
    },
    rooms: {
        house_kitchen: {
            name: "KITCHEN",
            typeOfRoom: "house",
            objects: ["window", "table", "drawer"],
            items: ["lighter"],
            description: () => {
                let desc = "The kitchen is unnervingly clean, yet a faint smell of decay lingers. A table sits in the center. ";
                desc += gameState.drawerOpen ? "The drawer is open." : "The drawer is closed.";
                desc += " To the west is the living room, north leads to a bedroom, and south leads to a garage. The window leads out to the yard.";
                return desc;
            },
            exits: {
                east: "You have to go 'out' through the window.",
                west: "house_livingRoom",
                north: "house_bedroom",
                south: "house_garage",
                out: "forest_eastOfHouse"
            }
        },
        house_livingRoom: {
            name: "LIVING ROOM",
            typeOfRoom: "house",
            items: ["flashlight"],
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
                east: "house_kitchen",
                up: "house_attic",
                down: {
                    target: "house_cellar",
                    condition: () => gameState.rugMoved && gameState.trapdoorOpen,
                    message: () => {
                        if (!gameState.rugMoved) return "You can't go that way.";
                        if (!gameState.trapdoorOpen) return "The trapdoor is closed.";
                    }
                }
            }
        },
        house_cellar: {
            name: "CELLAR",
            typeOfRoom: "house",
            objects: ["brass gear"],
            items: ["brass gear"],
            description: () => "You are in a dark, damp cellar. The air is thick with the smell of wet earth and rot. A ladder leads up to the living room.",
            exits: {
                up: "house_livingRoom"
            }
        },
        house_bedroom: {
            name: "BEDROOM",
            typeOfRoom: "house",
            objects: ["bed", "vanity mirror"],
            description: () => "This bedroom feels like it was abandoned in a hurry. A moth-eaten bed stands against one wall, and a cracked mirror reflects the dim light. To the south is the kitchen.",
            exits: {
                south: "house_kitchen"
            }
        },
        house_garage: {
            name: "GARAGE",
            typeOfRoom: "house",
            objects: ["workbench", "rusty tools"],
            description: () => "The garage is cold and smells of grease and old exhaust. A workbench and some tools are scattered about. To the north is the kitchen.",
            exits: {
                north: "house_kitchen"
            }
        },
        house_attic: {
            name: "ATTIC",
            typeOfRoom: "house",
            items: ["album", "trophy"],
            objects: ["crates"],
            description: () => {
                let desc = "The attic is cramped and smells of mothballs. Dust motes dance in the slivers of light coming through the roof. ";
                desc += gameState.cratesOpen ? "Several open crates are scattered around." : "Several dusty crates are stacked in the corner.";
                desc += " A dark chimney leads down.";
                return desc;
            },
            exits: {
                down: "house_livingRoom"
            }
        }
    }
};
