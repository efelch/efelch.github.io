const townData = {
    items: {
        "town gate": {
            description: "A massive, rusted iron gate that stands slightly ajar. Beyond it, the skeletal remains of buildings loom in the twilight.",
            isVisible: () => true
        }
    },
    hints: {
        "town_abandonedTownEntrance": (state) => state.inventory.includes("iron key") ? "The gate is locked, but that iron key you found might fit." : "The gate is locked tight. You'll need to find a key somewhere back in the cave."
    },
    rooms: {
        town_abandonedTownEntrance: {
            name: "ABANDONED TOWN ENTRANCE",
            typeOfRoom: "clearing",
            objects: ["town gate"],
            description: () => "The river finally emerges from the earth, spilling out into a wide, stagnant pool. You scramble out of the water onto a cobble-stone path. Before you lies an abandoned town, its buildings sagging and broken under a perpetual twilight sky. A rusted iron gate stands before you. To the south, the river disappears back into the cave.",
            exits: {
                south: "cave_riverDownstream",
                north: () => {
                    if (gameState.inventory.includes("iron key")) {
                        return "The gate is locked, but the rusted iron key fits perfectly. With a groan of metal, the gate swings open... (Town area to be expanded)";
                    }
                    return "The gate is heavy and rusted. It's locked tight and seems to require a key.";
                }
            }
        }
    }
};
