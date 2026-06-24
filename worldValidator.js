function validateWorld() {
    const errors = [];
    const allRoomIds = Object.keys(rooms);
    const linkedRoomIds = new Set();
    
    // The starting room is implicitly linked
    linkedRoomIds.add(gameState.currentRoom);
    
    allRoomIds.forEach(roomId => {
        const room = rooms[roomId];
        if (!room.exits) return;
        
        Object.entries(room.exits).forEach(([direction, targetRoomId]) => {
            // Some exits might be functions or special access objects
            let resolvedTarget = targetRoomId;
            if (typeof targetRoomId === 'function') {
                try {
                    resolvedTarget = targetRoomId();
                } catch (e) {
                    errors.push(`Error resolving exit function in room "${roomId}" (direction: "${direction}")`);
                    return;
                }
            } else if (typeof targetRoomId === 'object' && targetRoomId !== null && targetRoomId.target) {
                resolvedTarget = targetRoomId.target;
            }
            
            // Check if target exists
            if (resolvedTarget && !rooms[resolvedTarget]) {
                // If it's a string that doesn't look like a room ID (e.g., a message), skip
                // In this game engine, move() handles non-room targets as messages, 
                // but the prompt specifically says "if a room links to another room id that doesn't exist"
                // Usually room IDs are strings with underscores or starting with region names.
                if (typeof resolvedTarget === 'string' && resolvedTarget.length > 0 && resolvedTarget.includes('_')) {
                     errors.push(`Room "${roomId}" has a broken link: "${direction}" leads to non-existent room "${resolvedTarget}"`);
                }
            } else if (resolvedTarget) {
                linkedRoomIds.add(resolvedTarget);
            }
        });
    });
    
    // Check for orphans
    allRoomIds.forEach(roomId => {
        if (!linkedRoomIds.has(roomId)) {
            errors.push(`Orphan room detected: "${roomId}" is not linked to from any other room.`);
        }
    });
    
    return errors;
}

function displayValidationErrors(errors) {
    if (errors.length === 0) return;
    
    console.error("World validation failed!", errors);

    const header = document.getElementById('site-header');
    if (header) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'validation-errors';
        errorDiv.style.color = '#ff5555';
        errorDiv.style.border = '1px solid #ff5555';
        errorDiv.style.padding = '10px';
        errorDiv.style.marginTop = '10px';
        errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        errorDiv.style.whiteSpace = 'pre-wrap';
        errorDiv.style.fontFamily = 'monospace';
        
        errorDiv.innerHTML = `<strong>WORLD VALIDATION ERRORS DETECTED:</strong>\n${errors.join('\n')}`;
        header.appendChild(errorDiv);
        header.style.display = 'block'; // Ensure header is visible if there are errors
    }
}
