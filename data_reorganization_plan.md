# Data Reorganization Proposal: Modular Region-Based Files

To improve the maintainability and scalability of the "Macabre and Mirthworks" game, this document outlines a strategy to move from a monolithic `gameData.js` to a modular, region-based file structure.

## 1. Proposed Directory Structure

We will create a `data/` directory to house all game content, subdivided by region:

```text
Website-Personal/
├── index.html
├── gameEngine.js
├── commands.js
└── data/
    ├── regions/
    │   ├── house.js
    │   ├── forest.js
    │   ├── cave.js
    │   └── town.js
    ├── core/
    │   ├── roomTypes.js
    │   └── navigation.js
    └── gameData.js (Loader/Aggregator)
```

## 2. File Responsibilities

### Region Files (`data/regions/*.js`)
Each region file will contain all data specific to that area, including rooms, items, and hints.

**Example: `data/regions/forest.js`**
```javascript
const forestData = {
    rooms: {
        forest_westOfHouse: { /* ... */ },
        forest_forestNorth: { /* ... */ }
    },
    items: {
        mailbox: { /* ... */ },
        banana_slug: { /* ... */ }
    },
    hints: {
        forest_westOfHouse: "Check the mailbox."
    }
};
```

### Core Files (`data/core/*.js`)
- `roomTypes.js`: Environment messages (sounds/atmosphere) grouped by type.
- `navigation.js`: Direction aliases (n, s, e, w).

### Data Aggregator (`gameData.js`)
This file will serve as the central point that combines all modules into the global objects used by `gameEngine.js`.

```javascript
// Example aggregator logic
const rooms = {
    ...houseData.rooms,
    ...forestData.rooms,
    ...caveData.rooms
};

const itemData = {
    ...houseData.items,
    ...forestData.items
};
```

## 3. Implementation Strategy

We have two primary options for loading these files in a web environment:

### Option A: Standard Script Tags (Simple)
Add each file to `index.html`. Files must be loaded in order of dependency.

```html
<!-- Load Region Data First -->
<script src="data/regions/house.js"></script>
<script src="data/regions/forest.js"></script>
<script src="data/regions/cave.js"></script>

<!-- Load Core Data -->
<script src="data/core/roomTypes.js"></script>

<!-- Finally, Load the Aggregator and Engine -->
<script src="gameData.js"></script>
<script src="gameEngine.js"></script>
```

### Option B: ES Modules (Modern & Scalable)
Convert files to use `export/import`. This is cleaner but requires a local server to run (to avoid CORS issues).

**Example `forest.js`:**
```javascript
export const forestRooms = { ... };
export const forestItems = { ... };
```

**Example `gameData.js`:**
```javascript
import { forestRooms, forestItems } from './regions/forest.js';
// ... merge and export
```

## 4. Benefits
- **Developer Focus:** Work on the `cave.js` file without accidentally breaking logic in the `house.js` file.
- **Organization:** Environment messages and hints are kept close to the rooms they describe.
- **Scalability:** Adding a new region (e.g., `the_mines.js`) is as simple as creating one file and adding it to the aggregator.
