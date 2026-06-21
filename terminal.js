const terminal = {
    output: document.getElementById('output'),
    input: document.getElementById('command-input'),
    
    print: function(text) {
        if (!text) return;
        const line = document.createElement('div');
        line.style.whiteSpace = 'pre-wrap';
        line.innerHTML = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    },
    
    clear: function() {
        this.output.innerHTML = '';
    },
    
    handleScrolling: function() {
        if (window.innerWidth > 600) {
            setTimeout(() => {
                this.input.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 100);
        } else {
            setTimeout(() => {
                window.scrollTo(0, 0);
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
            }, 50);
        }
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
        }

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
            terminal.input.value = '';
            return;
        }

        terminal.clear();
        if (window.innerWidth > 600) {
            terminal.print(headerText);
        }
        commands.look();
        updateStatusBar();

        if (gameState.isGameOver && (gameState.currentRoom === "caveEntrance" || gameState.currentRoom === "caveDeep" || gameState.currentRoom === "shrine")) {
            terminal.print("\nType 'restart' to start over.");
        }
        
        if (commandOutput) {
            terminal.print("\n" + commandOutput);
        }

        const eventMessage = getRandomEventMessage();
        if (eventMessage && !gameState.isGameOver) {
            terminal.print("\n" + eventMessage);
        }

        saveGame();
        terminal.handleScrolling();
        terminal.input.value = '';
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
    const loaded = loadGame();
    updateStatusBar();
    terminal.print(headerText);
    commands.look();
    if (loaded) {
        terminal.print("\nGame resumed from saved state.");
    }
    terminal.print("\n(Type 'help' for available commands)");
};