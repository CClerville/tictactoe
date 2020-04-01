(function(window){

  // Default game initialize settings
  let GAME_SETTINGS = {
    container: document.getElementsByTagName('body')[0],
    boardWidth: 600,
    boardHeight: 600,
    gameTitle: 'Tic Tac Toe'
  };

  window.TicTacToeGame = {
    initialize: (options = {}) => {
      GAME_SETTINGS = {
        ...GAME_SETTINGS,
        ...options
      };

      renderGame();
    }
  };

  const HUMAN_PLAYER = 'X';
  const AI_PLAYER = 'O';
  let IS_HUMAN_TURN = true;

  // All possible winning combinations
  const WIN_COMBINATIONS = [
    [0, 1, 2], // horizontal row 1
    [3, 4, 5], // horizontal row 2
    [6, 7, 8], // horizontal row 3
    [0, 3, 6], // vertical col 1
    [1, 4, 7], // vertical col 2
    [2, 5, 8], // vertical col 3
    [0, 4, 8], // diagonal from top left
    [6, 4, 2]  // diagonal from bottom left
  ];

  // Default Game Board
  const GAME_BOARD = [
    '', '', '',
    '', '', '',
    '', '', ''
  ];

  let GAME_RESULTS = {
    draw: false,
    winner: null
  };

  const GameContainerInnerWrapper = GameContainerInnerWrapperComponent();
  const GameBoardContainer = GameBoardContainerComponent();
  const GameEndOverlay = GameEndOverlayComponent();
  const ResetButton = ResetButtonComponent();
  let GameTitle;

  /**
   * Draw game
   */
  function renderGame() {
    const {container} = GAME_SETTINGS;
    let gameContainer = container;

    // If a container is specified on initialized, it will be used as the games parent container
    if(!(container instanceof HTMLElement)) {
      if(typeof container  === 'string') {
        const containerNode = document.getElementById(container);
        if(containerNode) {
          gameContainer = containerNode;
        }
      }
    }

    appendTo(gameContainer, GameContainerInnerWrapper);
    renderTitle();
    renderBoard();
  }

  /**
   * Human player's move
   */
  function handleCellClick(e) {
    if (!IS_HUMAN_TURN) return;

    if(!e.target.innerText.length) {
      const cellIdx = e.target.dataset.cellnum;
      e.target.innerText = HUMAN_PLAYER;
      GAME_BOARD[cellIdx] = HUMAN_PLAYER;
      toggleTurn();
      
      if (isWinner(HUMAN_PLAYER) || isGameDraw()) {
        endGame();
        return;
      }

      makeAiMove();
    }
  }

  /**
   * Simulate computer's move
   */
  function makeAiMove() {
    const aiMove = minimax(GAME_BOARD, AI_PLAYER).cellPosition;
    GAME_BOARD[aiMove] = AI_PLAYER;
    const cell = document.querySelector(`[data-cellnum="${aiMove}"]`);
    cell.innerText = AI_PLAYER;
    
    if (isWinner(AI_PLAYER) || isGameDraw()) {
      endGame();
      return;
    }

    toggleTurn();
  }

  /**
   * Determine if there is a winner
   */
  function isWinner(player, gameboard = GAME_BOARD) {
    const playerMoves = gameboard.reduce((acc, curr, idx) => {
      return curr === player ? acc.concat(idx) : acc; 
    }, []);

    let winCombinationFound;
    for(let i = 0 ; i < WIN_COMBINATIONS.length ; i++) {
      const combination = WIN_COMBINATIONS[i];
      winCombinationFound = true;
      
      combination.map(c => {
        if (playerMoves.indexOf(c) === -1) {
          winCombinationFound = false;
        }
      });
      
      if (winCombinationFound) {
        GAME_RESULTS = {
          draw: false,
          winner: player
        };

        break;
      }
    }

    return winCombinationFound;
  }

  /**
   * Determine is there is a draw
   */
  function isGameDraw() {
    const isBoardFull = getEmptyCells().length === 0;
    
    if (isBoardFull) {
      GAME_RESULTS = {
        draw: true,
        winner: null
      };

      return true;
    }

    return false;
  }

  function toggleTurn() {
    IS_HUMAN_TURN = !IS_HUMAN_TURN;
  }

  function endGame() {
    GameEndOverlay.style.display = 'flex';
    GameEndOverlay.querySelector('.GameEndText').innerText = getGameResults();
  }

  function getGameResults() {
    if (GAME_RESULTS.draw) {
      return 'Game Draw!';
    }

    return GAME_RESULTS.winner === HUMAN_PLAYER ? 'You Win! :)' : 'You Lose :(';
  }


  /**
   * Refresh the game board
   */
  function resetGame() {
    const cells = document.querySelectorAll('.Cell');
    
    [...Array(9)].map((_, index) => {
      // Clear each cell
      cells[index].innerText = '';
      // Reset GAME_BOARD
      GAME_BOARD[index] = '';
    });

    GAME_RESULTS = {
      draw: false,
      winner : null
    };

    IS_HUMAN_TURN = true;

    GameEndOverlay.style.display = 'none';
    GameEndOverlay.querySelector('.GameEndText').innerText = '';
  }

  /**
   * Return all the empty cells left on the game board 
   */
  function getEmptyCells(gameBoard = GAME_BOARD) {
    return gameBoard.reduce((acc, curr, idx) => {
      return curr === '' ? acc.concat(idx) : acc;
    }, []);
  }

  /**
   * The Minimax algorithm is used to simulate the AI_PLAYER's move. This causes the AI_PLAYER
   * to never lose.
   * 
   * Further reading: https://en.wikipedia.org/wiki/Minimax
   * 
   * Minimax Algorithm implemented with the help of the source below
   * source: https://github.com/CodeExplainedRepo/Tic-Tac-Toe-JavaScript/blob/master/TIC%20TAC%20TOE%20-%20FINAL%20CODE/game.js#L133
   */
  function minimax(gameBoard, player){

    // LOOK FOR EMTY SPACES
    let availableCells = getEmptyCells(gameBoard);

    // BASE
    if( isWinner(AI_PLAYER, gameBoard) ) return { evaluation : +10 };
    if( isWinner(HUMAN_PLAYER, gameBoard)) return { evaluation : -10 };
    // There is a draw
    if( availableCells.length === 0) return { evaluation : 0 };

    // SAVE ALL MOVES AND THEIR EVALUATIONS
    let moves = [];

    // LOOP OVER THE EMPTY SPACES TO EVALUATE THEM
    for( let i = 0; i < availableCells.length; i++){
      // GET EMPTY CELL INDEX POSITION
      const cellPosition = availableCells[i];

      // BACK UP THE SPACE
      const backup = gameBoard[cellPosition];

      // SAVE THE MOVE'S ID AND EVALUATION
      const move = {};
      move.cellPosition = cellPosition;

      // MAKE THE MOVE FOR THE PLAYER
      gameBoard[cellPosition] = player;

      // THE MOVE EVALUATION
      if (player === AI_PLAYER){
        move.evaluation = minimax(gameBoard, HUMAN_PLAYER).evaluation;
      } else {
        move.evaluation = minimax(gameBoard, AI_PLAYER).evaluation;
      }

      // RESTORE SPACE
      gameBoard[cellPosition] = backup;

      // SAVE MOVE TO MOVES ARRAY
      moves.push(move);
    }

    // MINIMAX ALGORITHM
    let bestMove;

    if(player === AI_PLAYER){
      // MAXIMIZER
      let bestEvaluation = -Infinity;
      for(let i = 0; i < moves.length; i++){
        if( moves[i].evaluation > bestEvaluation ){
          bestEvaluation = moves[i].evaluation;
          bestMove = moves[i];
        }
      }
    } else {
      // MINIMIZER
      let bestEvaluation = +Infinity;
      for(let i = 0; i < moves.length; i++){
        if( moves[i].evaluation < bestEvaluation ){
          bestEvaluation = moves[i].evaluation;
          bestMove = moves[i];
        }
      }
    }

    return bestMove;
  }


  /**
   * Render the game Title
  */
  function renderTitle() {
    GameTitle = GameTitleComponent();
    appendTo(GameContainerInnerWrapper, GameTitle);
  }

  /**
   * Render the Game board
  */
  function renderBoard() {    
    let cellNum = 0;
    for(let r = 0 ; r < 3 ; r++) {
      const currentRow = RowComponent();
      for(let c = 0 ; c < 3 ; c++) {
        const currentCell = CellComponent();
        currentCell.dataset['cellnum'] = cellNum++;
        currentCell.addEventListener('click', handleCellClick);
        appendTo(currentRow, currentCell);
      }
      appendTo(GameBoardContainer, currentRow);
    }

    appendTo(GameEndOverlay, ResetButton);
    appendTo(GameBoardContainer, GameEndOverlay);
    appendTo(GameContainerInnerWrapper, GameBoardContainer);
  }

  function GameContainerInnerWrapperComponent() {
    const styles = {
      'width': '100%',
      'height': '100%',
      'display': 'flex',
      'justify-content': 'center',
      'font-family': 'monospace',
      'flex-direction': 'column',
      'align-items':'center',
      'margin': '20px'
    };

    return new Component('div', 'GameContainerInnerWrapper', styles).getEl();
  }

  /**
   * Create game title
   */
  function GameTitleComponent() {
    const {gameTitle} = GAME_SETTINGS;
    const styles = {
      'font-size': '24px',
      'font-weight': '700'
    };

    const el = new Component('div', 'GameTitle', styles).getEl();
    el.innerText = gameTitle;

    return el;
  }

  /**
   * Create the game board container
   */
  function GameBoardContainerComponent() {
    const {boardWidth, boardHeight} = GAME_SETTINGS;
    const styles = {
      'height': `${boardHeight}px`,
      'width': `${boardWidth}px`,
      'position': 'relative'
    };

    return new Component('div', 'GameBoardContainer', styles).getEl();
  }

  /**
   * Create a reset button to start a new game
   */
  function ResetButtonComponent() {
    const styles = {
      'font-size': '20px',
      'padding': '20px',
      'margin-top': '15px',
      'cursor': 'pointer'
    };

    const eventListeners = {
      'click': function handleResetButtonClick(e) {
        resetGame();
      }
    };

    const el = new Component('button', 'ResetButton', styles, eventListeners).getEl();
    el.innerText = 'Reset Game';

    return el;
  }

  /** 
   * Create a row for game board
  * */
  function RowComponent() {
    const styles = {
      'height': '33.33%',
      'width': '100%',
      'display': 'flex'
    };

    return new Component('div', 'Row', styles).getEl();
  }

  /** 
   * Create a cell for game board
  * */
  function CellComponent() {
    const styles = {
      'height': '100%',
      'width': '33.33%',
      'border': '1px solid black',
      'display': 'flex',
      'justify-content': 'center',
      'align-items': 'center',
      'font-size': '30px',
      'font-weight': '600',
      'box-sizing': 'border-box'
    };
    const eventListeners = {
      'mouseover': function handleCellMouseOver(e) {
        if (e.target.innerText.length){
          this.style.cursor = 'not-allowed';
        } else {
          this.style.backgroundColor = 'lightgray';
          this.style.cursor = 'pointer';
        }
      },
      'mouseleave': function handleCellMouseLeave(e) {
        this.style.removeProperty('background-color');
        this.style.cursor = 'default';
      }
    };

    return new Component('div', 'Cell', styles, eventListeners).getEl();
  }

  /**
   * Create an overlay to be displated when the game ends
   */
  function GameEndOverlayComponent() {
    const styles = {
      'display': 'none',
      'background-color': 'black',
      'opacity': '0.9',
      'justify-content': 'center',
      'align-items': 'center',
      'position': 'absolute',
      'height': '600px',
      'width': '600px',
      'top': '0',
      'left': '0',
      'right': '0',
      'bottom': '0',
      'color': 'white',
      'font-size': '30px',
      'flex-direction': 'column'
    };

    const el  = new Component('div', 'GameEndOverlay', styles).getEl();
    const gameEndText = new Component('div', 'GameEndText', {
      'font-size': '20px',
      'color':'white',
      'font-weight': '500'
    }).getEl();

    appendTo(el,  gameEndText);

    return el;
  }

  /**
   * Creates element (Component) that is instantiated per the arguments
   */
  function Component(elStr, className, stylesObj = {}, eventListeners = {}) {
    const me  = this;
    me.el = createEl(elStr);
    me.el.classList.add(className);
    applyStyles(me.el, stylesObj);

    if (eventListeners) {
      Object.keys(eventListeners).map(e => {
        me.el.addEventListener(e, eventListeners[e].bind(me.el));
      });
    }

    me.getEl = () => me.el;
  }

  /**
   * Create element Node
   */
  function createEl(elStr) {
    return document.createElement(elStr);
  }

  /**
   *  Append append to an element
   */
  function appendTo(el, elToAppend) {
    el.appendChild(elToAppend);
  }


  /**
   * Apply styles to an element
   */
  function applyStyles(el, styles) {
    for (const prop in styles) {
      el.style.setProperty(prop, styles[prop]);
    }
  }

})(window);
