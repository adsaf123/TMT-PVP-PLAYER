var ticksAfterDonwloadingData = 0

addLayer("main-menu", {
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            nick: "example"
        }
    },

    type: "none",
    row: "none",

    tabFormat: [
        ["display-text", "Set your username"],
        ["text-input", "nick"],
        ["clickable", "confirm-nick"]
    ],

    clickables: {
        "confirm-nick": {
            display() { return "Confirm" },
            canClick() { return true },
            onClick() { sendNickToServer(); showNavTab("games-list") }
        }
    }
})

addLayer("games-list", {
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0)
        }
    },

    row: "none",
    type: "none",

    tabFormat: [
        ["display-text", "Games list:"],
        "blank",
        generateGamesList,
        "blank",
        ["buyable", "createServer"]
    ],

    clickables: generateGamesClickables,

    buyables: {
        "createServer": {
            cost() { return new Decimal(0) },
            canAfford() { return true },
            display() { return "Host your own game" },
            buy() { showNavTab("host-game") }
        }
    },

    update(diff) {
        if (player.navTab == "games-list")
            getGamesFromServer()
    }
})

addLayer("host-game", {
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0),
            maxPlayers: 0,
            selectedTree: ""
        }
    },

    row: "none",
    type: "none",

    tabFormat: [
        ["display-text", "Host your game"],
        "blank",
        ["clickable", "TPT"],
        "blank",
        ["display-text", "Number of players:"],
        ["text-input", "maxPlayers"],
        "blank",
        ["clickable", "host"]
    ],

    clickables: {
        "TPT": {
            display() { return "The Prestige Tree" },
            canClick() { return player[this.layer].selectedTree != "TPT" },
            onClick() { player[this.layer].selectedTree = "TPT" }
        },

        "host": {
            display() { return "Host Game" },
            canClick() { return player[this.layer].selectedTree != "" },
            onClick() { hostGame(); showNavTab("game-lobby") }
        }
    }
})

addLayer("game-lobby", {
    startData() {
        return {
            unlocked: true,
            points: new Decimal(0)
        }
    },

    row: "none",
    type: "none",

    tabFormat: [
        ["display-text", "Lobby"],
        "blank",
        function () {
            if (currentGameData.id == -1) return [["display-text", "waiting for data from server"]]
            if (currentGameData.id == -2) return [["display-text", "you've been kicked"], ["clickable", "return"]]
            var list = ["column", []]
            
            if (currentGameData.players == undefined) return [["display-text", "something's wrong"]]

            let i = 0
            for (const player of currentGameData.players) {
                list[1].push(["row", []])
                list[1][list[1].length - 1][1].push(["display-text", player.nick])
                list[1][list[1].length - 1][1].push("blank")
                list[1][list[1].length - 1][1].push(["display-text", player.ip == currentGameData.host ? "HOST" : ""])
                list[1][list[1].length - 1][1].push("blank")
                list[1][list[1].length - 1][1].push(["clickable", `kp${i}`])
                i++
            }
        
            return list
        },
        ["buyable", "start"]
    ],

    clickables: generateKickClickables,

    buyables: {
        "start": {
            display: "Start Game",
            cost() { return new Decimal(0) },
            canAfford() { return true },
            buy() { startGame() }
        }
    },

    update(diff) {
        if (player.navTab == "game-lobby") {
            getGameData()
        }

        ticksAfterDonwloadingData++
        if (player.navTab == "tree-tab" && ticksAfterDonwloadingData >= 20 * 5) {
            getGameData()
            ticksAfterDonwloadingData = 0
        }

        if (currentGameData.playerID && player.navTab == "game-lobby")
            loadGame()

        //console.log(layers?.b?.milestones)
        if (currentGameData.playerID && layersNeededToLoad.length == 0) {
            if (player.navTab != "tree-tab") showNavTab("tree-tab")
        }
    }
})