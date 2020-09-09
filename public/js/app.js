const userGrid = document.querySelector(".grid-user");
const computerGrid = document.querySelector(".grid-computer");
const displayGrid = document.querySelector(".grid-display");
const ships = document.querySelectorAll(".ship");
const destroyer = document.querySelector(".destroyer-container");
const submarine = document.querySelector(".submarine-container");
const cruiser = document.querySelector(".cruiser-container");
const battleship = document.querySelector(".battleship-container");
const carrier = document.querySelector(".carrier-container");
const startButton = document.querySelector("#start");
const rotateButton = document.querySelector("#rotate");
const turnDisplay = document.querySelector("#whose-go");
const infoDisplay = document.querySelector("#info");
const setupButtons = document.querySelector("#setup-buttons");
const userSquares = [];
const computerSquares = [];
let isHorizontal = true;
let isGameOver = false;
let currentPlayer = "user";
const WIDTH = 10;
const HEIGHT = 10;
let playerNum = 0;
let ready = false;
let enemyReady = false;
let allShipsPlaced = false;

//Ships
const shipArray = [
  {
    name: "destroyer",
    directions: [
      [0, 1],
      [0, WIDTH],
    ],
  },
  {
    name: "submarine",
    directions: [
      [0, 1, 2],
      [0, WIDTH, WIDTH * 2],
    ],
  },
  {
    name: "cruiser",
    directions: [
      [0, 1, 2],
      [0, WIDTH, WIDTH * 2],
    ],
  },
  {
    name: "battleship",
    directions: [
      [0, 1, 2, 3],
      [0, WIDTH, WIDTH * 2, WIDTH * 3],
    ],
  },
  {
    name: "carrier",
    directions: [
      [0, 1, 2, 3, 4],
      [0, WIDTH, WIDTH * 2, WIDTH * 3, WIDTH * 4],
    ],
  },
];

createBoard(userGrid, userSquares);
createBoard(computerGrid, computerSquares);

function fireOnSquare(e) {
  if (
    e.target.classList.contains("miss") ||
    e.target.classList.contains("boom")
  )
    return;
  const shotFired = e.target.dataset.id;
  revealSquare(e.target.classList, shotFired);
}

// Select Player Mode
if (gameMode === "singlePlayer") {
  turnDisplay.innerHTML = "Place your ships";
  startSinglePlayer();
} else {
  startMultiPlayer();
}

// Single Player
function startSinglePlayer() {
  generate(shipArray[0]);
  generate(shipArray[1]);
  generate(shipArray[2]);
  generate(shipArray[3]);
  generate(shipArray[4]);

  startButton.addEventListener("click", () => {
    if (allShipsPlaced) {
      setupButtons.style.display = "none";
      infoDisplay.innerHTML = "";
      computerGrid.childNodes.forEach((square) => {
        square.addEventListener("click", fireOnSquare);
      });
      playGameSingle();
    } else infoDisplay.innerHTML = "Please place all ships";
  });
}

function createBoard(grid, squares) {
  for (let y = 0; y < WIDTH; y++) {
    for (let x = 0; x < HEIGHT; x++) {
      const square = document.createElement("div");
      square.dataset.id = y * 10 + x;
      grid.appendChild(square);
      squares.push(square);
    }
  }
}

//Draw the computers ships in random locations
function generate(ship) {
  let direction;
  let randomDirection = Math.floor(Math.random() * ship.directions.length);
  let current = ship.directions[randomDirection];
  if (randomDirection === 0) direction = 1;
  if (randomDirection === 1) direction = 10;
  let randomStart = Math.abs(
    Math.floor(
      Math.random() * computerSquares.length -
        ship.directions[0].length * direction
    )
  );

  const isTaken = current.some((index) =>
    computerSquares[randomStart + index].classList.contains("taken")
  );
  const isAtRightEdge = current.some(
    (index) => (randomStart + index) % WIDTH === WIDTH - 1
  );
  const isAtLeftEdge = current.some(
    (index) => (randomStart + index) % WIDTH === 0
  );

  if (!isTaken && !isAtRightEdge && !isAtLeftEdge)
    current.forEach((index) =>
      computerSquares[randomStart + index].classList.add("taken", ship.name)
    );
  else generate(ship);
}

//Rotate the ships
function rotate() {
  if (isHorizontal) {
    destroyer.classList.toggle("destroyer-container-vertical");
    submarine.classList.toggle("submarine-container-vertical");
    cruiser.classList.toggle("cruiser-container-vertical");
    battleship.classList.toggle("battleship-container-vertical");
    carrier.classList.toggle("carrier-container-vertical");
    isHorizontal = false;
    return;
  }
  if (!isHorizontal) {
    destroyer.classList.toggle("destroyer-container-vertical");
    submarine.classList.toggle("submarine-container-vertical");
    cruiser.classList.toggle("cruiser-container-vertical");
    battleship.classList.toggle("battleship-container-vertical");
    carrier.classList.toggle("carrier-container-vertical");
    isHorizontal = true;
    return;
  }
}
rotateButton.addEventListener("click", rotate);

//move around user ship
ships.forEach((ship) => ship.addEventListener("dragstart", dragStart));
userSquares.forEach((square) =>
  square.addEventListener("dragstart", dragStart)
);
userSquares.forEach((square) => square.addEventListener("dragover", dragOver));
userSquares.forEach((square) =>
  square.addEventListener("dragenter", dragEnter)
);
userSquares.forEach((square) => square.addEventListener("drop", dragDrop));
userSquares.forEach((square) => square.addEventListener("dragend", dragEnd));

let selectedShipIndex;
let draggedShip;
let draggedShipLength;

ships.forEach((ship) =>
  ship.addEventListener("mousedown", (e) => {
    selectedShipIndex = parseInt(e.target.id.substr(-1));
  })
);

function dragStart() {
  draggedShip = this;
  draggedShipLength = this.childNodes.length;
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
}

function dragEnd() {
  // console.log('dragend')
}

function dragDrop() {
  let shipNameWithLastId = draggedShip.lastChild.id;
  let shipClass = shipNameWithLastId.slice(0, -2);
  let lastShipIndex = parseInt(shipNameWithLastId.substr(-1));
  let shipLastId =
    lastShipIndex + parseInt(this.dataset.id) - selectedShipIndex;
  let shipFirstId = parseInt(this.dataset.id) - selectedShipIndex;
  if (!isHorizontal) {
    shipLastId =
      (lastShipIndex - selectedShipIndex) * HEIGHT + parseInt(this.dataset.id);
    shipFirstId = parseInt(this.dataset.id) - selectedShipIndex * HEIGHT;
  }
  // prettier-ignore
  const notAllowedHorizontal = [0,10,20,30,40,50,60,70,80,90,1,11,21,31,41,51,61,71,81,91,2,22,32,42,52,62,72,82,92,3,13,23,33,43,53,63,73,83,93]
  // prettier-ignore
  let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 10 * lastShipIndex);

  if (
    isHorizontal &&
    !newNotAllowedHorizontal.includes(shipLastId) &&
    shipLastId < 100 &&
    checkForShip(shipFirstId, shipLastId)
  ) {
    for (let i = 0; i < draggedShipLength; i++) {
      let directionClass;
      if (i === 0) directionClass = "start";
      if (i === draggedShipLength - 1) directionClass = "end";
      userSquares[
        parseInt(this.dataset.id) - selectedShipIndex + i
      ].classList.add("taken", "horizontal", directionClass, shipClass);
    }
    //As long as the index of the ship you are dragging is not in the newNotAllowedVertical array! This means that sometimes if you drag the ship by its
    //index-1 , index-2 and so on, the ship will rebound back to the displayGrid.
  } else if (
    !isHorizontal &&
    shipLastId < 100 &&
    shipFirstId >= 0 &&
    checkForShip(shipFirstId, shipLastId)
  ) {
    for (let i = 0; i < draggedShipLength; i++) {
      let directionClass;
      if (i === 0) directionClass = "start";
      if (i === draggedShipLength - 1) directionClass = "end";
      userSquares[
        parseInt(this.dataset.id) - selectedShipIndex * WIDTH + WIDTH * i
      ].classList.add("taken", "vertical", directionClass, shipClass);
    }
  } else return;

  displayGrid.removeChild(draggedShip);
  if (!displayGrid.querySelector(".ship")) {
    allShipsPlaced = true;
  }
}

// Returns true if there is not any ships in the squares
function checkForShip(shipFirstId, shipLastId) {
  let mod = isHorizontal ? 1 : 10;
  for (let i = shipFirstId; i <= shipLastId; i += mod) {
    if (userSquares[i].classList.contains("taken")) return false;
  }
  return true;
}

// Game Logic for Single Player
function playGameSingle() {
  if (isGameOver) return;
  if (currentPlayer === "user") {
    turnDisplay.innerHTML = "Your Go";
  }
  if (currentPlayer === "enemy") {
    turnDisplay.innerHTML = "Computers Go";
    setTimeout(enemyGo, 1000);
  }
}

let destroyerCount = 0;
let submarineCount = 0;
let cruiserCount = 0;
let battleshipCount = 0;
let carrierCount = 0;

// When a user clicks on a square, this code is run
function revealSquare(classList, shotFired) {
  // Get the square that was clicked, and all the classes that are on it
  const enemySquare = computerGrid.querySelector(`div[data-id='${shotFired}']`);
  const obj = Object.values(classList);

  // If the square has not been hit
  if (
    !enemySquare.classList.contains("boom") &&
    currentPlayer === "user" &&
    !isGameOver
  ) {
    // And if it has one of these classes, then we up the count
    if (obj.includes("destroyer")) destroyerCount++;
    if (obj.includes("submarine")) submarineCount++;
    if (obj.includes("cruiser")) cruiserCount++;
    if (obj.includes("battleship")) battleshipCount++;
    if (obj.includes("carrier")) carrierCount++;
  }
  // Add the boom class if there was a ship
  if (obj.includes("taken")) {
    enemySquare.classList.add("boom");
  } else {
    // Add the miss class if there was not
    enemySquare.classList.add("miss");
  }
  checkForWins();
  currentPlayer = "enemy";
  if (gameMode === "singlePlayer") playGameSingle();
}

let cpuDestroyerCount = 0;
let cpuSubmarineCount = 0;
let cpuCruiserCount = 0;
let cpuBattleshipCount = 0;
let cpuCarrierCount = 0;

// Tracks if the computer's recent guess was a hit
let recentlyHit = false;
let previousHit = false;
let intitialHitLocation = 0;
let previousHitLocation = 0;
let guessesSincePreviousHit = 0;
let directions = [1, 10, -1, -10];
let guessDirection = directions[0];
// Function for the computer to make their move, or another player
function enemyGo() {
  let square;
  // Crude ai that can actually win games, though can be improved
  if (gameMode === "singlePlayer") {
    if (!recentlyHit) {
      console.log("recentlyHit is false so I am picking a random square");
      square = Math.floor(Math.random() * userSquares.length);
    } else {
      console.log("recently hit is true");
      if (
        previousHitLocation + guessDirection > 99 ||
        previousHitLocation + guessDirection < 0
      ) {
        console.log(
          "The guess is gonna go out of bounds... Lets try this again..."
        );
        guessesSincePreviousHit++;
        guessDirection = directions[guessesSincePreviousHit];
        previousHit = false;
        enemyGo();
      } else {
        if (previousHit) {
          console.log(
            "My last guess was a hit so lets keep going in that direction"
          );
          square = previousHitLocation + guessDirection;
        } else {
          console.log(
            "My previous guess missed but I know theres a ship here somewhere..."
          );
          square = intitialHitLocation + guessDirection;
        }
      }
    }
  }
  // If the square has never been targeted
  if (
    !userSquares[square].classList.contains("boom") &&
    !userSquares[square].classList.contains("miss")
  ) {
    const hit = userSquares[square].classList.contains("taken");
    if (hit) {
      if (!recentlyHit) {
        intitialHitLocation = square;
      }
      recentlyHit = true;
      previousHit = true;
      previousHitLocation = parseInt(userSquares[square].dataset.id);
      guessesSincePreviousHit = 0;
    } else if (recentlyHit) {
      guessesSincePreviousHit++;
      guessDirection = directions[guessesSincePreviousHit];
      previousHit = false;
    }
    userSquares[square].classList.add(hit ? "boom" : "miss");
    if (userSquares[square].classList.contains("destroyer"))
      cpuDestroyerCount++;
    if (userSquares[square].classList.contains("submarine"))
      cpuSubmarineCount++;
    if (userSquares[square].classList.contains("cruiser")) cpuCruiserCount++;
    if (userSquares[square].classList.contains("battleship"))
      cpuBattleshipCount++;
    if (userSquares[square].classList.contains("carrier")) cpuCarrierCount++;
    checkForWins();
  }
  // If the computer rolled a square that has already been hit, then it will guess again
  else if (gameMode === "singlePlayer") {
    if (recentlyHit) {
      guessesSincePreviousHit++;
      guessDirection = directions[guessesSincePreviousHit];
      previousHit = false;
    }
    enemyGo();
  }

  if (guessesSincePreviousHit >= 4) {
    recentlyHit = false;
    guessesSincePreviousHit = 0;
  }

  currentPlayer = "user";

  if (gameMode === "singlePlayer") playGameSingle();
}

// Function that checks if someone won (duh)
function checkForWins() {
  let enemy = "computer";
  if (gameMode === "multiPlayer") enemy = "enemy";
  if (destroyerCount === 2) {
    infoDisplay.innerHTML = `You sunk the ${enemy}'s destroyer`;
    destroyerCount = 10;
  }
  if (submarineCount === 3) {
    infoDisplay.innerHTML = `You sunk the ${enemy}'s submarine`;
    submarineCount = 10;
  }
  if (cruiserCount === 3) {
    infoDisplay.innerHTML = `You sunk the ${enemy}'s cruiser`;
    cruiserCount = 10;
  }
  if (battleshipCount === 4) {
    infoDisplay.innerHTML = `You sunk the ${enemy}'s battleship`;
    battleshipCount = 10;
  }
  if (carrierCount === 5) {
    infoDisplay.innerHTML = `You sunk the ${enemy}'s carrier`;
    carrierCount = 10;
  }
  if (cpuDestroyerCount === 2) {
    infoDisplay.innerHTML = `${enemy} sunk your destroyer`;
    cpuDestroyerCount = 10;
    resetComputerGuesses();
  }
  if (cpuSubmarineCount === 3) {
    infoDisplay.innerHTML = `${enemy} sunk your submarine`;
    cpuSubmarineCount = 10;
    resetComputerGuesses();
  }
  if (cpuCruiserCount === 3) {
    infoDisplay.innerHTML = `${enemy} sunk your cruiser`;
    cpuCruiserCount = 10;
    resetComputerGuesses();
  }
  if (cpuBattleshipCount === 4) {
    infoDisplay.innerHTML = `${enemy} sunk your battleship`;
    cpuBattleshipCount = 10;
    resetComputerGuesses();
  }
  if (cpuCarrierCount === 5) {
    infoDisplay.innerHTML = `${enemy} sunk your carrier`;
    cpuCarrierCount = 10;
    resetComputerGuesses();
  }

  if (
    destroyerCount +
      submarineCount +
      cruiserCount +
      battleshipCount +
      carrierCount ===
    50
  ) {
    infoDisplay.innerHTML = "YOU WIN";
    gameOver();
  }
  if (
    cpuDestroyerCount +
      cpuSubmarineCount +
      cpuCruiserCount +
      cpuBattleshipCount +
      cpuCarrierCount ===
    50
  ) {
    infoDisplay.innerHTML = `${enemy.toUpperCase()} WINS
`;
    gameOver();
  }
}

function resetComputerGuesses() {
  recentlyHit = false;
  previousHit = false;
  intitialHitLocation = 0;
  previousHitLocation = 0;
  guessesSincePreviousHit = 0;
  directions = [1, 10, -1, -10];
  guessDirection = directions[0];
}

function gameOver() {
  isGameOver = true;
}
