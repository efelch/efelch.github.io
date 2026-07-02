const templeData = {
    items: {
        "torch": {
            description: (state) => {
                const m = state.currentRoom.match(/temple_r(\d)c(\d)/);
                if (!m) return "A soot-blackened torch in a stone sconce.";
                const r = parseInt(m[1]) - 1;
                const c = parseInt(m[2]) - 1;
                const on = state.templeTorches[r][c];
                return on ? "The torch burns with a steady, unnatural flame that throws no smoke." : "A cold torch rests in the sconce, wick thirsty for flame.";
            },
            aliases: ["sconce", "brazer", "brazier"],
            interactions: {
                light: (state) => {
                    if (state.currentRoom && state.currentRoom.startsWith('temple_')) {
                        // Require a flame source
                        if (!state.inventory.includes('lighter')) {
                            return "You cup your hands, ready to coax a flame—but you have nothing to light it with. A lighter would help.";
                        }
                        // Parse room index from id temple_r{r}c{c}
                        const m = state.currentRoom.match(/temple_r(\d)c(\d)/);
                        if (!m) return "Nothing here answers to that.";
                        const r = parseInt(m[1]) - 1;
                        const c = parseInt(m[2]) - 1;
                        // Apply puzzle rule via module (pure function)
                        if (window.templeTorches && typeof window.templeTorches.applyMove === 'function') {
                            state.templeTorches = window.templeTorches.applyMove(state.templeTorches, r, c);
                        } else {
                            // Fallback inline behavior if module missing
                            const flip = (rr, cc) => {
                                if (rr < 0 || rr > 2 || cc < 0 || cc > 2) return;
                                state.templeTorches[rr][cc] = !state.templeTorches[rr][cc];
                            };
                            flip(r, c);
                            flip(r-1, c);
                            flip(r+1, c);
                            flip(r, c-1);
                            flip(r, c+1);
                        }
                        // Check win condition
                        const allOn = (window.templeTorches && typeof window.templeTorches.isSolved === 'function')
                            ? window.templeTorches.isSolved(state.templeTorches)
                            : state.templeTorches.every(row => row.every(x => x));
                        if (allOn && !state.templeStaircaseRevealed) {
                            state.templeStaircaseRevealed = true;
                            state.score += 10;
                            updateStatusBar();
                            return "As the last torch flares bright, the chamber exhales. Panels withdraw and a stone staircase reveals itself, descending into deeper dark. You sense you could go down now.";
                        }
                        return "The lighter clicks; your torch flares. Other flames sputter and change in sympathy.";
                    }
                    return "You can't light that.";
                }
            }
        },
        "stone staircase": {
            description: "Wide steps descend into a square of deeper dark, edges worn by congregations you hope never to meet.",
            isVisible: (state) => state.templeStaircaseRevealed
        },
        "sarcophagus": {
            description: (state) => {
                const open = !!state.templeSarcophagusOpened;
                if (open) {
                    return "The lid lists to one side like a jaw unhinged. The cavity inside is shallow, long, and wrong—built around the idea of bones that were never arranged like yours.";
                }
                return "A stone sarcophagus pinched thin at the middle, as if built for something articulated differently than a person. Its lid is carved with a face that refuses symmetry. Hairline seams breathe dust.";
            },
            aliases: ["stone coffin", "coffin"],
            interactions: {
                open: (state) => {
                    if (state.currentRoom === "temple_sarcophagusChamber") {
                        if (state.templeSarcophagusOpened) {
                            return "The lid already stands askew. Inside, only a soft drift of gray dust remains.";
                        }
                        state.templeSarcophagusOpened = true;
                        // Reveal the red shard in this room if not already listed
                        const room = rooms[state.currentRoom];
                        room.items = room.items || [];
                        if (!room.items.includes("red waystone shard") && !state.inventory.includes("red waystone shard")) {
                            room.items.push("red waystone shard");
                        }
                        state.score += 5;
                        updateStatusBar();
                        return "With a breath that isn’t yours, the stone lid slides. A smell like hot coins exhales from within. The shape inside was never built for a human spine—just a shallow bed of ancient dust... and something red that should not gleam in the dark.";
                    } else {
                        return "You don't see that here.";
                    }
                }
            }
        },
        "red waystone shard": {
            description: () => "A palm-sized fragment of gray stone. Its runes throb with a dull <span class=\"rune-pulse rune-red\">red</span> light, pulsing like a slowed heartbeat that is not yours.",
            aliases: ["shard", "stone shard", "waystone", "rune shard", "red shard", "red waystone"],
            isVisible: () => true,
            roomLine: () => "Amid the sifted remains, a <span class=\"rune-pulse rune-red\">red waystone shard</span> rests where something once lay.",
            interactions: {
                take: (state) => {
                    if (state.currentRoom === "temple_sarcophagusChamber" && state.templeSarcophagusOpened) {
                        if (state.inventory.includes("red waystone shard")) return "You already have it.";
                        state.inventory.push("red waystone shard");
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
        "temple_r1c1": "Each torch affects itself and the torches in adjoining rooms. Try to make them all burn at once.",
        "temple_r1c2": "Lighting here flips this torch and any that touch it—north, south, east, or west.",
        "temple_r1c3": "Patterns repeat. Consider symmetry.",
        "temple_r2c1": "Sometimes turning one off is a step toward turning all on.",
        "temple_r2c2": "This center point touches four others. Plan around it.",
        "temple_r2c3": "If you're stuck, try sweeping row by row.",
        "temple_r3c1": "You are close. Keep an eye on the corners.",
        "temple_r3c2": "Every action ripples. Think of neighbors.",
        "temple_r3c3": (state) => state.templeStaircaseRevealed ? "You can go down now." : "All torches burning together will wake the stairs."
    },
    rooms: (() => {
        const rooms = {};
        const nameFor = (r, c) => `TEMPLE CHAMBER (${r},${c})`;
        for (let r = 1; r <= 3; r++) {
            for (let c = 1; c <= 3; c++) {
                const id = `temple_r${r}c${c}`;
                rooms[id] = {
                    name: nameFor(r, c),
                    typeOfRoom: "temple",
                    isDark: true,
                    objects: ["torch", "stone staircase"],
                    description: () => {
                        const on = gameState.templeTorches[r-1][c-1];
                        let d = "Cyclopean stones lean close, carved in languages that resent being seen. Each chamber holds a single torch in a stone sconce.";
                        d += on ? " This torch burns with a pale, unwavering light." : " This torch is unlit, its wick dark and accusing.";
                        if (gameState.templeStaircaseRevealed) {
                            d += " From somewhere nearby, stone has rearranged itself into a descending stair.";
                        }
                        return d;
                    },
                    exits: {
                        north: r > 1 ? `temple_r${r-1}c${c}` : undefined,
                        south: r < 3 ? `temple_r${r+1}c${c}` : undefined,
                        west: c > 1 ? `temple_r${r}c${c-1}` : undefined,
                        east: c < 3 ? `temple_r${r}c${c+1}` : undefined,
                        out: r === 1 && c === 1 ? "cave_caveDeep" : undefined,
                        // The 'down' exit should only exist in the center room (2,2) and only after the puzzle is solved.
                        down: (r === 2 && c === 2) ? {
                            target: "temple_lowerStairs",
                            condition: () => gameState.templeStaircaseRevealed,
                            message: () => "The floor is seamless here—for now. All torches must burn together."
                        } : undefined
                    }
                };
                // Clean undefined exits
                Object.keys(rooms[id].exits).forEach(k => { if (!rooms[id].exits[k]) delete rooms[id].exits[k]; });
            }
        }
        // Add deeper descent rooms reached after solving the torch puzzle
        rooms["temple_lowerStairs"] = {
            name: "LOWER STAIRS",
            typeOfRoom: "temple",
            isDark: true,
            description: () =>
                "The stairwell opens into a narrow throat of stone. The torchlight here seems reluctant, as if smothered by the dark itself. Something in the dust suggests many feet once hurried downward—never upward.",
            exits: {
                up: "temple_r2c2",
                down: "temple_descent1"
            }
        };

        rooms["temple_descent1"] = {
            name: "DESCENT I",
            typeOfRoom: "temple",
            isDark: true,
            description: () =>
                "Moist air kisses the back of your neck. The walls here do not meet cleanly; stone bulges like muscle beneath skin. A single red bead forms in a crack above you and trails a thin line down the mortar before vanishing where the floor refuses to be level.",
            exits: {
                up: "temple_lowerStairs",
                down: "temple_descent2"
            }
        };

        rooms["temple_descent2"] = {
            name: "DESCENT II",
            typeOfRoom: "temple",
            isDark: true,
            description: () =>
                "The carvings abandon language and become gouges—long, raking scores that curve as if made by a patient hand with far too many knuckles. Your footsteps do not come back as echoes; instead, something a heartbeat late answers from below.",
            exits: {
                up: "temple_descent1",
                down: "temple_descent3"
            }
        };

        rooms["temple_descent3"] = {
            name: "DESCENT III",
            typeOfRoom: "temple",
            isDark: true,
            description: () =>
                "Water—or what wishes to be water—sweats from the stone in dark skeins. It smells of warm iron. A hush lives here, thick and listening. From somewhere deeper, a wet cadence counts time without you. You can go up. You are not sure you should go down again, even if the earth would allow it.",
            exits: {
                up: "temple_descent2",
                down: "temple_sarcophagusChamber"
            }
        };

        rooms["temple_sarcophagusChamber"] = {
            name: "SARCOPHAGUS CHAMBER",
            typeOfRoom: "temple",
            isDark: true,
            objects: ["sarcophagus"],
            // Items array starts empty; the shard appears when the sarcophagus is opened.
            items: [],
            description: () =>
                "The passage narrows until it becomes a wound in the earth, opening at last into a low chamber. The ceiling drools a slow thread that never quite falls. In the center reclines a stone box with proportions that offend your eyes. The carvings around it spiral inward and never meet.",
            exits: {
                up: "temple_descent3"
            }
        };
        return rooms;
    })()
};
