const caveData = {
    items: {
        "ground": {
            description: (state) => {
                if (!state.caveFootprintsSeen) {
                    state.caveFootprintsSeen = true;
                    return "The mud here is a shade darker, tamped smooth by many small decisions. As you study it, a pattern resolves: footprints—sharp at the toes—go straight into the wall, but none come back out.";
                }
                return "Scuffed mud. The footprints clearly go into the wall and simply stop.";
            },
            aliases: ["floor", "mud", "dirt"]
        },
        "footprints": {
            description: "Three-toed impressions lead directly into the stone. Something found a way through.",
            isVisible: (state) => state.caveFootprintsSeen
        },
        "lever": {
            description: (state) => state.caveHiddenDoorOpen
                ? "The stone lever is down. Somewhere nearby, mechanisms rest after moving."
                : "A narrow stone lever sits almost flush with the wall. A thin crescent of clean rock outlines it.",
            isVisible: (state) => state.caveFootprintsSeen,
            aliases: ["switch", "handle"],
            interactions: {
                pull: (state) => {
                    if (state.currentRoom === "cave_caveDeep") {
                        if (!state.caveFootprintsSeen) {
                            return "Your hands slide over rough stone. If there’s a mechanism, you haven’t found it yet.";
                        }
                        if (state.caveHiddenDoorOpen) {
                            return "The lever is already thrown. The hidden door stands open.";
                        }
                        state.caveHiddenDoorOpen = true;
                        state.caveLeverRevealed = true;
                        state.score += 5;
                        updateStatusBar();
                        return "You pull the narrow lever. Deep in the wall, something unlatches. Stone grinds against stone as a disguised slab slides aside—revealing a passage to the south.";
                    } else {
                        return "You don't see that here.";
                    }
                }
            }
        },
        "hidden door": {
            description: (state) => state.caveHiddenDoorOpen
                ? "A slab of stone has slid aside, revealing a black passage that breathes cold and old incense."
                : "You can't quite see it, but the wall seems too perfect here—like a seam waiting on a decision.",
            isVisible: (state) => state.caveFootprintsSeen
        },
        "grue tracks": {
            description: "Faint, three-toed impressions stitched into the grit. Too wide for any animal you know, and spaced like something that doesn’t hurry."
        },
        "river water": {
            description: "Black water sliding by with practiced silence. Cold lifts from it in sheets, and the air tastes faintly metallic.",
            isVisible: () => true
        },
        "glowing moss": {
            description: "Patches of bioluminescent moss cling to wet stone, giving off a thin, uncertain green that never quite reaches the corners.",
            isVisible: () => true
        },
        "wooden plank": {
            description: "A waterlogged plank, its grain raised and soft. It looks like it drifted a long time before deciding to stop here.",
            isVisible: () => true
        },
        "basalt discs": {
            description: "Three heavy basalt discs—large, medium, small—etched with weeping eyes. They look meant to be moved.",
            isVisible: (state) => state.currentRoom === 'cave_riverCanyon',
            interactions: {
                take: () => "The discs are far too heavy to carry. You can move them between the pillars using the 'move' command (e.g., 'move disc from 1 to 2')."
            }
        },
        "stone pillars": {
            description: "Three obsidian pillars rise from the rushing water. They are marked 1, 2, and 3. You can move discs between pillars (e.g., 'move disc from 1 to 2').",
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
            isVisible: (state) => state.riverPuzzleSolved && !state.inventory.includes('iron key'),
            // Presence line appears only when the pillar puzzle has been solved
            roomLine: (state, roomId) => {
                if (roomId === 'cave_riverCanyon' && state.riverPuzzleSolved && !state.inventory.includes('iron key')) {
                    return "A small panel in the canyon wall is open, revealing a rusted iron key.";
                }
                return "";
            },
            interactions: {
                take: (state) => {
                    if (state.currentRoom === "cave_riverCanyon" && state.riverPuzzleSolved) {
                        if (state.inventory.includes("iron key")) return "You already have it.";
                        state.inventory.push("iron key");
                        state.score += 5;
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
        "cave_caveEntrance": (state) => state.flashlightOn ? "The cave goes deeper to the east. Watch out for grues!" : "It's pitch black! You really shouldn't be here without a flashlight turned on.",
        "cave_caveDeep": (state) => state.caveHiddenDoorOpen
            ? "The hidden door stands open to the south."
            : "You can hear rushing water to the east. The ground here looks disturbed in places... maybe examine the ground?",
        "cave_riverBank": "The river flows east. If you can stay afloat, it might take you somewhere new.",
        "cave_riverMidstream": "The water is getting deeper. Keep heading east following the current.",
        "cave_riverCanyon": (state) => {
            if (!state.riverPuzzleSolved) {
                const nudges = [
                    "Move one disc at a time; never set a larger on a smaller.",
                    "Start by freeing the smallest disc.",
                    "Think in cycles: the smallest moves most often.",
                    "Your goal is all discs from pillar 1 to pillar 3."
                ];
                const idx = Math.min(state.riverHintStep, nudges.length - 1);
                if (state.riverHintStep < nudges.length - 1) state.riverHintStep++;
                return nudges[idx];
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
            isDark: true,
            objects: ["grue tracks"],
            description: () => {
                if (gameState.flashlightOn || gameState.caveTorchesLit) {
                    return "Your beam slides over a jagged mouth in the rock. The air is cool enough to tighten your throat. Loose stones and those three-toed tracks drift inward, as if drawn. To the west is the forest.";
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
            isDark: true,
            objects: ["ground", "hidden door", "lever"],
            description: () => {
                if (gameState.flashlightOn || gameState.caveTorchesLit) {
                    let base = "A broad, damp chamber receives your light and gives little back. Wet stalactites tick like slow clocks. In one corner, a campsite seems to have exhaled and gone still. To the east, water insists on being heard. West returns to the entrance.";
                    // First safe entry: trigger pressure‑stone that lights torches permanently
                    if (!gameState.caveTorchesLit) {
                        gameState.caveTorchesLit = true;
                        base += "\n\nYour boot finds a stone that yields with a soft clunk. All at once, orange light blooms along hidden channels—torches gutter to life throughout the cave. The darkness here recedes for good.";
                    }
                    if (gameState.caveFootprintsSeen && !gameState.caveHiddenDoorOpen) {
                        base += " Scuffs on the ground suggest a traffic that ends at a particular stretch of wall.";
                    }
                    if (gameState.caveHiddenDoorOpen) {
                        base += " A slab of stone has slid aside to the south, exhaling a colder dark.";
                    }
                    return base;
                }
                return "As you walk deeper into the cave, you feel a large presence leap toward you! You have been eaten by a grue.";
            },
            exits: {
                west: "cave_caveEntrance",
                east: "cave_riverBank",
                south: {
                    target: "temple_r1c1",
                    condition: () => gameState.caveHiddenDoorOpen,
                    message: () => "Your hands find only cold stone. Perhaps there is a mechanism—something to pull."
                }
            }
        },
        cave_riverBank: {
            name: "RIVER BANK",
            typeOfRoom: "river",
            isDark: true,
            objects: ["river water", "glowing moss"],
            description: () => {
                if (gameState.flashlightOn || gameState.caveTorchesLit) {
                    return "You stand on a muddy shelf beside an underground river. The current keeps its own counsel. Glowing moss rivals your beam and almost wins. The river pulls east into darker stone; west returns to the cave.";
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
            isDark: true,
            objects: ["river water"],
            description: () => {
                if (gameState.flashlightOn || gameState.caveTorchesLit) {
                    return "The river shoulders you along. The ceiling stoops here, collecting breath and drip. Water climbs to your waist. The current remembers east and west.";
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
            isDark: true,
            objects: ["river water", "stone pillars", "basalt discs", "iron key"],
            items: ["iron key"],
            description: () => {
                if (gameState.flashlightOn || gameState.caveTorchesLit) {
                    let desc = "The cave yawns into a hushed canyon. The river has been working here for a very long time. High above, minerals catch light like distant windows. Three obsidian pillars rise from the rushing water.";
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
            isDark: true,
            objects: ["river water", "wooden plank"],
            description: () => {
                if (gameState.flashlightOn || gameState.caveTorchesLit) {
                    return "The walls press closer, pinching the river into a hurried throat. You inch along a narrow ledge. Debris—an old plank among it—has chosen the rocks for a final rest. The river hooks north toward a tired light. West leads back upstream.";
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
