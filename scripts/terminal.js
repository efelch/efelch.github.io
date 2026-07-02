"use strict";
const terminal = {
    output: document.getElementById('output'),
    input: document.getElementById('command-input'),
    wrapper: document.getElementById('output-wrapper'),
    history: [],
    historyIndex: -1,
    tempInput: '',
    
    print: function(text) {
        if (!text) return;
        const line = document.createElement('div');
        line.style.whiteSpace = 'pre-wrap';
        line.innerHTML = text;
        this.output.appendChild(line);
        this.handleScrolling();
    },
    
    clear: function() {
        this.output.innerHTML = '';
    },
    
    handleScrolling: function() {
        // Ensure the input is visible and scroll to bottom of wrapper
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
            this.wrapper.scrollTop = this.wrapper.scrollHeight;
        });
    },
    
    showJumpScare: function() {
        const overlay = document.getElementById('jumpscare-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 250); // Display quickly
        }
    }
};

terminal.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const cmd = terminal.input.value.toLowerCase().trim();
        
        if (cmd !== '') {
            gameState.turns++;
            // Add to history if not same as last command
            if (terminal.history.length === 0 || terminal.history[terminal.history.length - 1] !== cmd) {
                terminal.history.push(cmd);
            }
        }
        terminal.historyIndex = -1;
        terminal.tempInput = '';

        let commandOutput = "";
        const [action, ...args] = cmd.split(' ');
        const arg = args.join(' ');

        if (gameState.isGameOver && cmd !== 'restart') {
            commandOutput = "The game is over. Type 'restart' to play again.";
        } else if (commands[cmd]) {
            if (typeof commands[cmd] === 'function') {
                const result = commands[cmd]();
                if (result) commandOutput = result;
            } else {
                commandOutput = commands[cmd];
            }
        } else if (commands[action] && typeof commands[action] === 'function') {
            const result = commands[action](arg);
            if (result) commandOutput = result;
        } else if (!gameState.isGameOver && (rooms[gameState.currentRoom].exits[cmd] || rooms[gameState.currentRoom].exits[directionAliases[cmd]])) {
            commandOutput = move(cmd);
        } else if (cmd !== '') {
            commandOutput = gameState.isGameOver ? "The game is over. Type 'restart' to play again." : `Unknown command: ${cmd}. Type 'help' for help.`;
        }

        if (cmd === 'restart') {
            if (window.safeStorage && typeof window.safeStorage.remove === 'function') {
                window.safeStorage.remove('adventure_game_save');
            } else {
                try { localStorage.removeItem('adventure_game_save'); } catch(_) {}
            }
            location.reload();
            return;
        }

        terminal.clear();
        if (window.innerWidth > 600) {
            terminal.print(headerText);
        }
        commands.look();
        updateStatusBar();

        if (gameState.isGameOver) {
            terminal.print("\nType 'restart' to start over.");
        }
        
        if (commandOutput) {
            terminal.print("\n" + commandOutput);
            // Announce for screen readers
            if (typeof window.announce === 'function') {
                window.announce(commandOutput);
            }
        }

        const eventMessage = getRandomEventMessage();
        if (eventMessage && !gameState.isGameOver) {
            terminal.print("\n" + eventMessage);
            if (typeof window.announce === 'function') {
                window.announce(eventMessage);
            }
        }

        // Use debounced save to avoid excessive localStorage writes
        if (typeof save === 'function') {
            save();
        } else {
            saveGame();
        }
        terminal.handleScrolling();
        terminal.input.value = '';
        // Keep keyboard focus in the input after updates
        terminal.input.focus();
    } else if (e.key === 'ArrowUp') {
        if (terminal.history.length > 0) {
            if (terminal.historyIndex === -1) {
                terminal.tempInput = terminal.input.value;
            }
            
            if (terminal.historyIndex < terminal.history.length - 1) {
                terminal.historyIndex++;
                terminal.input.value = terminal.history[terminal.history.length - 1 - terminal.historyIndex];
                // Ensure cursor is at the end
                setTimeout(() => {
                    terminal.input.selectionStart = terminal.input.selectionEnd = terminal.input.value.length;
                }, 0);
            }
        }
        e.preventDefault();
    } else if (e.key === 'ArrowDown') {
        if (terminal.historyIndex > -1) {
            terminal.historyIndex--;
            if (terminal.historyIndex === -1) {
                terminal.input.value = terminal.tempInput;
            } else {
                terminal.input.value = terminal.history[terminal.history.length - 1 - terminal.historyIndex];
            }
            // Ensure cursor is at the end
            setTimeout(() => {
                terminal.input.selectionStart = terminal.input.selectionEnd = terminal.input.value.length;
            }, 0);
        }
        e.preventDefault();
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const value = terminal.input.value;
        const parts = value.split(' ');
        
        if (parts.length === 1) {
            // Complete commands
            const search = parts[0].toLowerCase();
            const availableCommands = Object.keys(commands).filter(cmd => cmd.length > 1 || ['n', 's', 'e', 'w', 'u', 'd'].includes(cmd));
            const matches = availableCommands.filter(cmd => cmd.startsWith(search));
            
            if (matches.length === 1) {
                terminal.input.value = matches[0] + ' ';
            } else if (matches.length > 1) {
                terminal.print("\nPossible commands: " + matches.join(', '));
                terminal.handleScrolling();
            }
        } else {
            // Complete targets (inventory or room objects)
            const action = parts[0].toLowerCase();
            const search = parts.slice(1).join(' ').toLowerCase();
            
            // Get all possible targets
            const room = rooms[gameState.currentRoom];
            const roomItems = (room.items || []).filter(item => {
                const itemObj = itemData[item];
                return itemObj && (itemObj.isVisible ? itemObj.isVisible(gameState) : true);
            });
            const roomObjects = room.objects || [];
            const inventory = gameState.inventory || [];
            
            const allTargets = [...new Set([...roomItems, ...roomObjects, ...inventory])];
            const matches = allTargets.filter(target => target.toLowerCase().startsWith(search));
            
            if (matches.length === 1) {
                terminal.input.value = action + ' ' + matches[0];
            } else if (matches.length > 1) {
                terminal.print("\nPossible targets: " + matches.join(', '));
                terminal.handleScrolling();
            }
        }
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('clickable')) {
        const cmd = e.target.getAttribute('data-command');
        if (cmd) {
            terminal.input.value = cmd;
            const event = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                which: 13,
                keyCode: 13,
                bubbles: true
            });
            terminal.input.dispatchEvent(event);
        }
    } else {
        terminal.input.focus();
    }
});

// Initial greeting
window.onload = () => {
    const validationErrors = validateWorld();
    displayValidationErrors(validationErrors);

    const loaded = loadGame();
    // If starting a fresh game (no save), randomize the temple torch puzzle
    if (!loaded && typeof window.randomizeTempleTorches === 'function') {
        try { window.randomizeTempleTorches(); } catch (_) {}
    }
    updateStatusBar();
    terminal.print(headerText);
    commands.look();
    if (loaded) {
        terminal.print("\nGame resumed from saved state.");
    }
    terminal.print("\n(Type 'help' for available commands)");
    // Announce initial room
    if (typeof window.announce === 'function') {
        try { window.announce(rooms[gameState.currentRoom].name + ' loaded'); } catch(_) {}
    }
};

// Keyboard shortcut to focus the input quickly
document.addEventListener('keydown', (e) => {
    if ((e.key === '/' || e.key === '.') && e.target !== terminal.input && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        terminal.input.focus();
    }
});