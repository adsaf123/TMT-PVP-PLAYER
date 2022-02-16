
const SERVERINFO = {
    SERVERIP: "https://TMTPVPServer.adsaf123.repl.co",
    PLAYERSETNICK: "playerSetNick",
    PLAYERJOINGAME: "playerJoinGame",
    PLAYERHOSTGAME: "playerHostGame",
    HOSTKICKPLAYER: "hostKickPlayer",
    HOSTSTARTGAME: "hostStartGame",
    PLAYERDOSOMETHING: "playerDoSomething",
    PLAYERGETGAMESLIST: "playerGetGamesList",
    SERVERSENDGAMESLIST: "serverSendGamesList",
    SERVERSENDGAMEINFO: "serverSendGameInfo",
    PLAYERGETGAMEINFO: "playerGetGameInfo"
}

const socket = io(SERVERINFO.SERVERIP)

var gamesList = {}
var currentGame = -1
var currentGameData = {}

var startGame = function () {
    socket.emit(SERVERINFO.HOSTSTARTGAME)
}

var getGameData = function () {
    socket.emit(SERVERINFO.PLAYERGETGAMEINFO)
}

socket.on(SERVERINFO.SERVERSENDGAMEINFO, (data) => {
    currentGameData = data
    if (!(tmp?.c?.gainExp instanceof Decimal) || tmp?.c?.gainExp == undefined) return
    fix(currentGameData?.gameState?.playersStates[currentGameData.playerID], player)
    fix(currentGameData?.gameState?.playersTmps[currentGameData.playerID], tmp)
    fix(currentGameData?.gameState?.layers, layers)
    fix(currentGameData?.gameState?.funcs, funcs)
})

var hostGame = function () {
    socket.emit(SERVERINFO.PLAYERHOSTGAME, {
        tree: player["host-game"].selectedTree,
        maxPlayers: player["host-game"].maxPlayers
    })
}

var getGamesFromServer = function () {
    socket.emit(SERVERINFO.PLAYERGETGAMESLIST)
}

socket.on(SERVERINFO.SERVERSENDGAMESLIST, (data) => {
    gamesList = data
})

var sendNickToServer = function () {
    socket.emit(SERVERINFO.PLAYERSETNICK, player["main-menu"].nick)
}

var generateGamesList = function () {
    var list = ["column", []]
    for (const [k, v] of Object.entries(gamesList)) {
        list[1].push(["row", []])
        list[1][list[1].length - 1][1].push(["display-text", v.hostNick])
        list[1][list[1].length - 1][1].push("blank")
        list[1][list[1].length - 1][1].push(["display-text", v.tree])
        list[1][list[1].length - 1][1].push("blank")
        list[1][list[1].length - 1][1].push(["display-text", `${v.players.length}/${v.maxPlayers}`])
        list[1][list[1].length - 1][1].push(["clickable", `jg${k}`])
    }
    return list
}

var generateGamesClickables = function () {
    var clickables = {}
    for (const [k, v] of Object.entries(gamesList)) {
        clickables[`jg${k}`] = {}
        clickables[`jg${k}`].id = `jg${k}`
        clickables[`jg${k}`].layer = "games-list"
        clickables[`jg${k}`].unlocked = function () { return true }
        clickables[`jg${k}`].display = function () { return "join" }
        clickables[`jg${k}`].canClick = function () { return true }
        clickables[`jg${k}`].onClick = function () { if (v.maxPlayers !== v.players.lenght) { joinGame(k); showNavTab("game-lobby") } }
        clickables[`jg${k}`].style = { "width": "30px", "height": "30px", "min-height": "30px" }

    }
    return clickables
}

var generateKickClickables = function () {
    var clickables = {}
    if (currentGameData.players == undefined) return clickables
    let i = 0
    for (const k of currentGameData.players) {
        clickables[`kp${k.ip}`] = {}
        clickables[`kp${k.ip}`].id = `kp${i}`
        clickables[`kp${k.ip}`].layer = "game-lobby"
        clickables[`kp${k.ip}`].style = { "width": "30px", "height": "30px", "min-height": "30px" }
        clickables[`kp${k.ip}`].unlocked = function () { return true }
        clickables[`kp${k.ip}`].display = function () { return "kick" }
        clickables[`kp${k.ip}`].canClick = function () { return k.ip != currentGameData.host }
        clickables[`kp${k.ip}`].onClick = function () { sendDataToServer({ type: SERVERINFO.HOSTKICKPLAYER, playerID: k.ip }) }
        i++
    }
    clickables["return"] = {
        display() { return "return to menu" },
        canClick() { return true },
        onClick() { showNavTab("games-list") },
        unlocked() { return true },
        id: "return",
        layer: "game-lobby",
    }
    return clickables
}

var joinGame = function (gameID) {
    socket.emit(SERVERINFO.PLAYERJOINGAME, gameID)
}

var loadGame = function () {
    for (const layer in maps[currentGameData.gameState.tree].layers) {
        lateAddLayer(layer, maps[currentGameData.gameState.tree].layers[layer])
    }
    canGenPoints = maps[currentGameData.gameState.tree].canGenPoints
    isEndgame = maps[currentGameData.gameState.tree].isEndgame
    getStartPoints = maps[currentGameData.gameState.tree].getStartPoints
    getPointGen = maps[currentGameData.gameState.tree].getPointGen
    showNavTab("tree-tab")
}

var fix = function (newData, oldData) {
    for (item in newData) {
        if (oldData[item] instanceof Decimal) {
            oldData[item] = new Decimal(newData[item])
        } else if (oldData[item] instanceof Object) {
            fix(newData[item], oldData[item])
        } else {
            oldData[item] = newData[item]
        }
    }
}