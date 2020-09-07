// Multiplayer

// Game Logic for MultiPlayer
function playGameMulti(socket) {
  setupButtons.style.display = "none";
  if (isGameOver) return;
  if (!ready) {
    socket.emit("player-ready");
    ready = true;
    playerReady(playerNum);
  }

  if (enemyReady) {
    if (currentPlayer === "user") {
      turnDisplay.innerHTML = "Your Go";
    }
    if (currentPlayer === "enemy") {
      turnDisplay.innerHTML = "Enemy's Go";
    }
  }
}

function playerReady(num) {
  let player = `.p${parseInt(num) + 1}`;
  document.querySelector(`${player} .ready`).classList.toggle("active");
}

function startMultiPlayer() {
  const socket = io();

  // Get your player number
  socket.on("player-number", (num) => {
    if (num === -1) {
      infoDisplay.innerHTML = "Sorry, the server is full";
    } else {
      playerNum = parseInt(num);
      if (playerNum === 1) currentPlayer = "enemy";

      console.log(playerNum);

      // Get other player status
      socket.emit("check-players");
    }
  });

  // Another player has connected or disconnected
  socket.on("player-connection", (num) => {
    console.log(`Player number ${num} has connected or disconnected`);
    playerConnectedOrDisconnected(num);
  });

  // On enemy ready
  socket.on("enemy-ready", (num) => {
    enemyReady = true;
    playerReady(num);
    if (ready) {
      playGameMulti(socket);
      setupButtons.style.display = "none";
    }
  });

  // Check player status
  socket.on("check-players", (players) => {
    players.forEach((p, i) => {
      if (p.connected) playerConnectedOrDisconnected(i);
      if (p.ready) {
        playerReady(i);
        if (i !== playerReady) enemyReady = true;
      }
    });
  });

  // On Timeout
  socket.on("timeout", () => {
    infoDisplay.innerHTML = "You have reached the 10 minute limit";
  });

  // Ready button click
  startButton.addEventListener("click", () => {
    if (allShipsPlaced) playGameMulti(socket);
    else infoDisplay.innerHTML = "Please place all ships";
  });

  // Setup event listeners for firing
  computerSquares.forEach((square) => {
    square.addEventListener("click", () => {
      if (currentPlayer === "user" && ready && enemyReady) {
        const shotFired = square.dataset.id;
        socket.emit("fire", shotFired);
      }
    });
  });

  // On Fire Received
  socket.on("fire", (id) => {
    enemyGo(id);
    const square = userSquares[id];
    socket.emit("fire-reply", square.classList);
    playGameMulti(socket);
  });

  // On Fire Reply Received
  socket.on("fire-reply", (classList) => {
    revealSquare(classList);
    playGameMulti(socket);
  });

  function playerConnectedOrDisconnected(num) {
    let player = `.p${parseInt(num) + 1}`;
    document.querySelector(`${player} .connected`).classList.toggle("active");
    if (parseInt(num) === playerNum)
      document.querySelector(player).style.fontWeight = "bold";
  }
}
