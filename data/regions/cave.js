const caveData = {
    items: {
        "grue tracks": {
            description: "Faint, unsettling impressions in the dirt. They look like three-toed claws, but they're too large to belong to any known animal."
        },
        "river water": {
            description: "The water is black and moves with a deceptive speed. It looks freezing cold and carries a faint metallic smell.",
            isVisible: () => true
        },
        "glowing moss": {
            description: "Patches of bioluminescent moss cling to the wet rocks, casting a faint, sickly green glow that doesn't provide much light.",
            isVisible: () => true
        },
        "wooden plank": {
            description: "A weathered wooden plank, possibly from a bridge or a raft, lies half-submerged in the mud.",
            isVisible: () => true
        },
        "basalt discs": {
            description: "Three heavy basalt discs: a Large, a Medium, and a Small one. They are etched with weeping eyes. They look like they could be moved between the pillars (e.g., 'move disc from 1 to 2').",
            isVisible: (state) => state.currentRoom === 'cave_riverCanyon'
        },
        "stone pillars": {
            description: "Three obsidian pillars rise from the rushing water. They are marked 1, 2, and 3. You can move the basalt discs between them using the command 'move disc from [number] to [number]'.",
            dynamicDescription: (state) => {
                const names = ["Large", "Medium", "Small"];
                let desc = "The pillars stand silently in the mist:\n";
                state.puzzlePillars.forEach((pillar, i) => {
                    const stack = pillar.length > 0 ? pillar.map(d => names[d-1]).join(", ") : "empty";
                    desc += "Pillar " + (i + 1) + ": [" + stack + "]\n";
                });
                desc += "\nTo move a disc, use: 'move disc from [1-3] to [1-3]'";
                return desc;
            }
        },
        "iron key": {
            description: "A heavy, rusted iron key. It looks like it could open a massive gate.",
            isVisible: (state) => state.riverPuzzleSolved && !state.inventory.includes('iron key')
        }
    },
    hints: {
        "cave_caveEntrance": (state) => state.flashlightOn ? "The cave goes deeper to the east. Watch out for grues!" : "It's pitch black! You really shouldn't be here without a flashlight turned on.",
        "cave_caveDeep": "You can hear rushing water to the east. That campsite looks like it was abandoned quickly.",
        "cave_riverBank": "The river flows east. If you can stay afloat, it might take you somewhere new.",
        "cave_riverMidstream": "The water is getting deeper. Keep heading east following the current.",
        "cave_riverCanyon": (state) => {
            if (!state.riverPuzzleSolved) {
                const steps = [
                    "Those obsidian pillars look like a puzzle. You need to move all the discs from Pillar 1 to Pillar 3. Remember: you can't put a larger disc on a smaller one.",
                    "First step: move disc from 1 to 3.",
                    "Second step: move disc from 1 to 2.",
                    "Third step: move disc from 3 to 2.",
                    "Fourth step: move disc from 1 to 3.",
                    "Fifth step: move disc from 2 to 1.",
                    "Sixth step: move disc from 2 to 3.",
                    "Seventh step: move disc from 1 to 3."
                ];
                
                const currentHint = steps[state.riverHintStep];
                if (state.riverHintStep < steps.length - 1) {
                    state.riverHintStep++;
                }
                return currentHint;
            } else if (!state.inventory.includes("iron key")) {
                return "You've solved the puzzle! Now, don't forget to take the iron key from the opened panel.";
            } else {
                return "You have the key. The river continues east.";
            }
        },
        "cave_riverDownstream": "The river curves north towards some natural light. Is that the way out?"
    },
    rooms: {
        cave_caveEntrance: {
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
                west: "forest_forestEast",
                east: "cave_caveDeep"
            }
        },
        cave_caveDeep: {
            name: "DEEP CAVE",
            typeOfRoom: "cave",
            description: () => {
                if (gameState.flashlightOn) {
                    return "You are in a large, damp chamber deep within the cave. The flashlight beam reflects off wet stalactites. In the corner, you see a small, abandoned campsite. To the east, you can hear the sound of rushing water. A path leads back west to the entrance.";
                }
                return "As you walk deeper into the cave, you feel a large presence leap toward you! You have been eaten by a grue.";
            },
            exits: {
                west: "cave_caveEntrance",
                east: "cave_riverBank"
            }
        },
        cave_riverBank: {
            name: "RIVER BANK",
            typeOfRoom: "river",
            objects: ["river water", "glowing moss"],
            description: () => {
                if (gameState.flashlightOn) {
                    return "You stand on the muddy bank of a wide underground river. The water rushes past with a low growl. Patches of glowing moss on the walls compete with your flashlight's beam. The river flows to the east, deeper into the earth. To the west, you can return to the cave.";
                }
                return "You stumble in the dark and fall into the cold, rushing water! You have been eaten by a grue.";
            },
            exits: {
                west: "cave_caveDeep",
                east: "cave_riverMidstream"
            }
        },
        cave_riverMidstream: {
            name: "MIDSTREAM RIVER",
            typeOfRoom: "river",
            objects: ["river water"],
            description: () => {
                if (gameState.flashlightOn) {
                    return "The river carries you further into the depths. The ceiling dips low here, and the air is thick with moisture. You are wading through waist-deep water. The river continues east and west.";
                }
                return "You lose your footing in the dark and are swept away! You have been eaten by a grue.";
            },
            exits: {
                west: "cave_riverBank",
                east: "cave_riverCanyon"
            }
        },
        cave_riverCanyon: {
            name: "RIVER CANYON",
            typeOfRoom: "river",
            objects: ["river water", "stone pillars", "basalt discs", "iron key"],
            description: () => {
                if (gameState.flashlightOn) {
                    let desc = "The cave opens up into a vast underground canyon. The river cuts a deep path through the stone. High above, you can see the faint glimmer of minerals in the rock. Three obsidian pillars rise from the rushing water.";
                    if (gameState.riverPuzzleSolved && !gameState.inventory.includes('iron key')) {
                        desc += " A small panel in the canyon wall is open, revealing a rusted iron key.";
                    }
                    desc += " The river flows east and west.";
                    return desc;
                }
                return "A grue snatches you from the darkness of the canyon! You have been eaten by a grue.";
            },
            exits: {
                west: "cave_riverMidstream",
                east: "cave_riverDownstream"
            }
        },
        cave_riverDownstream: {
            name: "DOWNSTREAM RIVER",
            typeOfRoom: "river",
            objects: ["river water", "wooden plank"],
            description: () => {
                if (gameState.flashlightOn) {
                    return "The cave walls narrow here, forcing the river through a tight passage. You are wading along a narrow ledge. Debris, like an old wooden plank, is snagged on the rocks. The river curves sharply to the north, and you can see a faint, natural light ahead. To the west, the river leads back upstream.";
                }
                return "The current pulls you under! You have been eaten by a grue.";
            },
            exits: {
                west: "cave_riverCanyon",
                north: "town_abandonedTownEntrance"
            }
        }
    }
};
