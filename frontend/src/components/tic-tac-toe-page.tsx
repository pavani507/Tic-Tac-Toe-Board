import React, { useState } from 'react';


type CellValue = 'X' | 'O' | null;
type BoardState = CellValue[];

interface Scoreboard {
  x: number;
  o: number;
  draws: number;
}

interface GameResult {
  winner: CellValue;
  line: number[];
  isDraw: boolean;
}

export default function App(): React.JSX.Element {
  
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [scores, setScores] = useState<Scoreboard>({ x: 0, o: 0, draws: 0 });

  // Define the 8 possible winning combinations
  const winningLines: number[][] = [[0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];


  const calculateResult = (squares: BoardState): GameResult => {
    for (let i = 0; i < winningLines.length; i++) {
      const [a, b, c] = winningLines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: winningLines[i], isDraw: false };
      }
    }
    const isDraw = squares.every((square) => square !== null);
    return { winner: null, line: [], isDraw };
  };

  const { winner, line: winningLine, isDraw } = calculateResult(board);
  const isGameOver: boolean = !!winner || isDraw;

  
  const handleClick = (index: number): void => {
    if (isGameOver || board[index]) return;

    const newBoard: BoardState = [...board];
    const currentPlayer: 'X' | 'O' = isXNext ? 'X' : 'O';
    newBoard[index] = currentPlayer;
    
    setBoard(newBoard);

    const nextResult = calculateResult(newBoard);
    if (nextResult.winner) {
      const scoreKey = currentPlayer.toLowerCase() as keyof Scoreboard;
      setScores((prev) => ({ ...prev, [scoreKey]: prev[scoreKey] + 1 }));
    } else if (nextResult.isDraw) {
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
    } else {
     
      setIsXNext(!isXNext);
    }
  };

  
  const resetGame = (): void => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Tic-Tac-Toe</h1>

     
      <div style={styles.scoreboard}>
        <div style={styles.scoreItem}>Player X: <strong>{scores.x}</strong></div>
        <div style={styles.scoreItem}>Draws: <strong>{scores.draws}</strong></div>
        <div style={styles.scoreItem}>Player O: <strong>{scores.o}</strong></div>
      </div>

      {/* Status Bar */}
      <div style={styles.status}>
        {winner && <span style={styles.winnerText}>Winner: Player {winner}! 🎉</span>}
        {isDraw && <span style={styles.drawText}>Game Ended in a Draw! 🤝</span>}
        {!isGameOver && `Current Turn: Player ${isXNext ? 'X' : 'O'}`}
      </div>

      {/* 3x3 Game Board Grid */}
      <div style={styles.grid}>
        {board.map((value: CellValue, index: number) => {
          const isWinningCell = winningLine.includes(index);
          return (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={isGameOver || !!value}
              style={{
                ...styles.cell,
                ...(isWinningCell ? styles.winningCell : {}),
                ...(value ? styles.lockedCell : styles.emptyCell)
              }}
            >
              {value}
            </button>
          );
        })}
      </div>

      {/* Control Button */}
      <button onClick={resetGame} style={styles.resetButton}>
        Reset Game
      </button>
    </div>
  );
}

// Inline CSS style definitions typing safely with React.CSSProperties
const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px', color: '#333' },
  title: { margin: '0 0 10px 0', fontSize: '2.5rem' },
  scoreboard: { display: 'flex', gap: '20px', background: '#f0f2f5', padding: '10px 20px', borderRadius: '8px', marginBottom: '20px', fontSize: '1.1rem' },
  scoreItem: { minWidth: '100px', textAlign: 'center' },
  status: { fontSize: '1.3rem', fontWeight: '600', height: '35px', marginBottom: '15px' },
  winnerText: { color: '#2e7d32' },
  drawText: { color: '#ef6c00' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gridTemplateRows: 'repeat(3, 100px)', gap: '10px', marginBottom: '25px' },
  cell: { fontSize: '2.5rem', fontWeight: 'bold', border: '2px solid #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' },
  emptyCell: { background: '#fff' },
  lockedCell: { background: '#fafafa', cursor: 'not-allowed' },
  winningCell: { background: '#c8e6c9', color: '#2e7d32', borderColor: '#81c784' },
  resetButton: { padding: '12px 24px', fontSize: '1rem', fontWeight: '600', color: '#fff', background: '#1976d2', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }
};
