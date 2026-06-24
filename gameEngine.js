"use strict";
const GAME_VERSION = "1.0.0";
// Tunable constants
const EVENT_CHANCE = 0.15;
const SAVE_DEBOUNCE_MS = 200;

// Safe localStorage wrapper (guards private modes and errors)
const safeStorage = (() => {
    const api = {
        available: false,
        get: (k) => null,
        set: (k, v) => {},
        remove: (k) => {}
    };
    try {
        const t = "__test__";
        localStorage.setItem(t, "1");
        localStorage.removeItem(t);
        api.available = true;
        api.get = (k) => {
            try { return localStorage.getItem(k); } catch (_) { return null; }
        };
        api.set = (k, v) => {
            try { localStorage.setItem(k, v); } catch (_) {}
        };
        api.remove = (k) => {
            try { localStorage.removeItem(k); } catch (_) {}
        };
    } catch (_) {
        // No-op fallbacks already defined
    }
    // expose globally for other modules
    try { window.safeStorage = api; } catch (_) {}
    return api;
})();

const gameState = {
    currentRoom: "personal_aboutMe",
    inventory: [],
    mailboxOpen: false,
    drawerOpen: false,
    filingCabinetOpen: false,
    cratesOpen: false,
    trophyInCase: false,
    flashlightOn: false,
    rugMoved: false,
    trapdoorOpen: false,
    isGameOver: false,
    turns: 0,
    score: 0,
    visitedRooms: ["personal_aboutMe"],
    puzzlePillars: [[3, 2, 1], [], []],
    riverPuzzleSolved: false,
    riverHintStep: 0
};

function saveGame() {
    const saveState = {
        gameState: gameState,
        version: GAME_VERSION
    };
    safeStorage.set('adventure_game_save', JSON.stringify(saveState));
}

// Debounced saver to reduce excessive writes to localStorage
// Usage: call save() after state-changing commands; it will batch within 200ms
const save = (() => {
    let t;
    return () => {
        try { clearTimeout(t); } catch (_) {}
        t = setTimeout(saveGame, SAVE_DEBOUNCE_MS);
    };
})();

function loadGame() {
    const savedData = safeStorage.get('adventure_game_save');
    if (!savedData) return false;

    try {
        const saveState = JSON.parse(savedData);
        // Basic version check - could be more complex if needed
        if (saveState.version === GAME_VERSION) {
            Object.assign(gameState, saveState.gameState);
            return true;
        }
    } catch (e) {
        console.error("Failed to load game:", e);
    }
    return false;
}

// --- Input parsing helpers and caches ---
const __STOP_WORDS = new Set([
    "the","a","an","to","of","in","on","at","with","and","or","from","into","up","down"
]);

function __normalizeText(s){
    return s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ') // strip punctuation
        .split(/\s+/)
        .filter(w => w && !__STOP_WORDS.has(w))
        .join(' ')
        .trim();
}

function __tokenize(s){
    const n = __normalizeText(s);
    return n ? n.split(' ') : [];
}

// Build alias lookup maps once itemData is available (gameEngine.js loads after gameData.js)
const __aliasLookup = (() => {
    const map = new Map(); // normalized alias/name -> canonical item key
    const nameTokens = new Map(); // item key -> tokens array
    if (typeof itemData === 'object' && itemData) {
        for (const key of Object.keys(itemData)) {
            const normName = __normalizeText(key);
            if (normName) map.set(normName, key);
            nameTokens.set(key, __tokenize(key));
            const aliases = (itemData[key] && itemData[key].aliases) || [];
            for (const alias of aliases) {
                const normAlias = __normalizeText(alias);
                if (normAlias) map.set(normAlias, key);
            }
        }
    }
    return { map, nameTokens };
})();

function findMatch(target, list) {
    if (!target || !list) return null;
    const query = __normalizeText(target);
    if (!query) return null;

    // Exact name hit within provided list
    for (const item of list) {
        if (__normalizeText(item) === query) return item;
    }

    // Alias/name lookup constrained to list
    const looked = __aliasLookup.map.get(query);
    if (looked && list.includes(looked)) return looked;

    // Token-based matching: query tokens subset of item tokens OR vice versa
    const qTokens = new Set(query.split(' '));
    let best = null;
    let bestScore = 0;
    for (const item of list) {
        const tokens = __aliasLookup.nameTokens.get(item) || __tokenize(item);
        const tSet = new Set(tokens);
        const qInItem = [...qTokens].every(t => tSet.has(t));
        const itemInQ = [...tSet].every(t => qTokens.has(t));
        if (qInItem || itemInQ) {
            const score = qInItem ? qTokens.size : tSet.size; // prefer more specific
            if (score > bestScore) { bestScore = score; best = item; }
        } else {
            // Partial contains as last resort (normalized string contains)
            const nItem = tokens.join(' ');
            if (nItem.includes(query) || query.includes(nItem)) {
                const score = Math.min(nItem.length, query.length);
                if (score > bestScore) { bestScore = score; best = item; }
            }
        }
    }
    return best;
}

function move(direction) {
    const room = rooms[gameState.currentRoom];
    const targetDirection = directionAliases[direction] || direction;
    let nextRoom = room.exits[targetDirection];

    if (typeof nextRoom === 'function') {
        nextRoom = nextRoom();
    }

    if (nextRoom) {
        if (typeof nextRoom === 'object' && nextRoom.target) {
            if (nextRoom.condition && !nextRoom.condition()) {
                return typeof nextRoom.message === 'function' ? nextRoom.message() : nextRoom.message;
            }
            nextRoom = nextRoom.target;
        }

        if (rooms[nextRoom]) {
            gameState.currentRoom = nextRoom;
            if (!gameState.visitedRooms.includes(gameState.currentRoom)) {
                gameState.visitedRooms.push(gameState.currentRoom);
                gameState.score++;
            }
            // Grue danger zones: entering the deep cave and beyond without a flashlight is fatal.
            // The cave entrance itself should be safe (no instant death).
            const grueRooms = ["cave_caveDeep", "cave_riverBank", "cave_riverMidstream", "cave_riverCanyon", "cave_riverDownstream"];
            if (grueRooms.includes(gameState.currentRoom) && !gameState.flashlightOn) {
                gameState.isGameOver = true;
                updateStatusBar();
                const descProp = rooms[gameState.currentRoom].description;
                return typeof descProp === 'function' ? descProp() : descProp;
            }
            updateStatusBar();
            // Announce room change for screen readers
            try {
                const rn = rooms[gameState.currentRoom].name;
                announce(rn + ' loaded');
            } catch (_) {}
            return ""; 
        } else {
            return nextRoom;
        }
    } else {
        return "You can't go that way.";
    }
}

function updateStatusBar() {
    const statusBar = document.getElementById('status-bar');
    const roomName = rooms[gameState.currentRoom].name;
    const maxScore = calculateMaxScore();
    const a11yOn = document.body && document.body.classList.contains('a11y-mode');
    statusBar.innerHTML = `<div class="status-inner"><span>${roomName}</span><span>Score: ${gameState.score}/${maxScore}</span><span>Turns: ${gameState.turns}</span><button id="a11y-toggle" class="clickable" type="button" aria-pressed="${a11yOn}">${a11yOn ? 'A11Y On' : 'A11Y Off'}</button></div>`;

    // Sync main heading
    const roomHeading = document.getElementById('room-name');
    if (roomHeading) roomHeading.textContent = roomName;

    // Update document title and meta description for SEO
    try { updateDocumentMeta(gameState.currentRoom); } catch(_) {}

    // Wire up toggle each render
    const btn = document.getElementById('a11y-toggle');
    if (btn) {
        btn.onclick = () => setA11yMode(!(document.body && document.body.classList.contains('a11y-mode')));
    }
}

function calculateMaxScore() {
    // 1 point for each room visited
    let totalScore = Object.keys(rooms).length;

    // Puzzle and item points
    totalScore += 10; // riverPuzzleSolved
    totalScore += 5;  // trophyInCase
    totalScore += 1;  // take album
    totalScore += 1;  // take trophy
    totalScore += 1;  // take flashlight
    totalScore += 5;  // take iron key
    totalScore += 5;  // take brass gear

    return totalScore;
}

// --- Accessibility helpers ---
function setA11yMode(enabled, persist = true) {
    const body = document.body;
    if (!body) return;
    body.classList.toggle('a11y-mode', !!enabled);
    if (persist) {
        try { safeStorage.set('a11y_mode', enabled ? '1' : '0'); } catch (_) {}
    }
    // Re-render status bar to reflect button label/state
    updateStatusBar();
}

// Screen reader announcements live region updater
function announce(text) {
    const r = document.getElementById('sr-updates');
    if (!r) return;
    try {
        r.textContent = '';
        setTimeout(() => { r.textContent = String(text || ''); }, 0);
    } catch (_) {}
}

// Initialize a11y mode from storage on script load (if DOM is ready it will apply immediately)
try {
    if (safeStorage.get('a11y_mode') === '1') {
        setA11yMode(true, false);
    }
} catch (_) {}

// --- SEO helpers: dynamic title and description ---
function updateDocumentMeta(roomId) {
    const defaultTitle = 'Edward Felch | Software Engineer, Maker & Artisan';
    const defaultDesc = 'Explore the interactive terminal portfolio of Edward Felch — Software Engineer and artisan in woodworking and laser engraving.';
    const meta = {
        personal_aboutMe: {
            title: 'About — Edward Felch | Interactive Portfolio',
            desc: 'About Edward Felch: software engineer and maker. Learn who I am and what I build.'
        },
        personal_resume: {
            title: 'Experience — Edward Felch | Interactive Portfolio',
            desc: 'Experience: Full‑stack software engineering (Java/Spring focus), systems architecture, and team enablement.'
        },
        personal_photos: {
            title: 'Photos — Edward Felch | Interactive Portfolio',
            desc: 'Photo albums featuring projects and builds: woodworking, props, and personal highlights.'
        },
        personal_links: {
            title: 'Links — Edward Felch | Interactive Portfolio',
            desc: 'Connect with Edward Felch: LinkedIn, businesses, and social links.'
        },
        personal_gateway: {
            title: 'Gateway — Edward Felch | Interactive Portfolio',
            desc: 'Enter the gateway to the full text‑adventure experience.'
        }
    };

    const data = meta[roomId] || {};
    const title = data.title || defaultTitle;
    const desc = data.desc || defaultDesc;
    try { document.title = title; } catch(_) {}
    try {
        let tag = document.querySelector('meta[name="description"]');
        if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute('name', 'description');
            document.head.appendChild(tag);
        }
        tag.setAttribute('content', desc);
    } catch(_) {}
}

function getRandomEventMessage() {
    if (Math.random() < EVENT_CHANCE) {
        const room = rooms[gameState.currentRoom];
        if (room && room.typeOfRoom && roomTypes[room.typeOfRoom]) {
            const messages = roomTypes[room.typeOfRoom];
            const randomIndex = Math.floor(Math.random() * messages.length);
            return messages[randomIndex];
        }
    }
    return null;
}