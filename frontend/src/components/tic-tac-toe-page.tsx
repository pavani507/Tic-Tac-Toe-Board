import React, { useState } from 'react';

type CellValue = 'X' | 'O' | null;
type BoardState = CellValue[];
type GameMode = 'two-player' | 'computer';

interface MoveRecord {
    moveNumber: number;
    player: 'X' | 'O';
    positionLabel: string;
}

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
    // Game Setup States
    const [gameMode, setGameMode] = useState<GameMode>('two-player');
    const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState<boolean>(true);
    const [scores, setScores] = useState<Scoreboard>({ x: 0, o: 0, draws: 0 });

    const [history, setHistory] = useState<BoardState[]>([Array(9).fill(null)]);
    const [moveList, setMoveList] = useState<MoveRecord[]>([]);


    const winningLines: number[][] = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];


    // Helper to map index parameters into Row/Column labels
    const getPositionLabel = (index: number): string => {
        const row = Math.floor(index / 3) + 1;
        const col = (index % 3) + 1;
        return `Row ${row}, Column ${col}`;
    };

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
    const isGameOver = !!winner || isDraw;

    
    const makeComputerMove = (currentBoard: BoardState) => {
        const emptyIndices = currentBoard.map((val, idx) => (val === null ? idx : null)).filter((val) => val !== null) as number[];
        if (emptyIndices.length === 0) return;

        
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const nextBoard = [...currentBoard];
        nextBoard[randomIndex] = 'O';

        setBoard(nextBoard);
        setHistory((prev) => [...prev, nextBoard]);
        setMoveList((prev) => [
            ...prev,
            {
                moveNumber: prev.length + 1,
                player: 'O',
                positionLabel: getPositionLabel(randomIndex)
            }
        ]);

        const result = calculateResult(nextBoard);
        if (result.winner) {
            setScores((prev) => ({ ...prev, o: prev.o + 1 }));
        } else if (result.isDraw) {
            setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
        } else {
            setIsXNext(true);
        }
    };

    const handleClick = (index: number): void => {
        if (isGameOver || board[index]) return;

        const currentTurnPlayer: 'X' | 'O' = isXNext ? 'X' : 'O';
        const nextBoard = [...board];
        nextBoard[index] = currentTurnPlayer;

        const newHistory = [...history, nextBoard];
        const newMoveRecord: MoveRecord = {
            moveNumber: moveList.length + 1,
            player: currentTurnPlayer,
            positionLabel: getPositionLabel(index)
        };
        const newMoveList = [...moveList, newMoveRecord];

        setBoard(nextBoard);
        setHistory(newHistory);
        setMoveList(newMoveList);

        const result = calculateResult(nextBoard);
        if (result.winner) {
            const scoreKey = currentTurnPlayer.toLowerCase() as keyof Scoreboard;
            setScores((prev) => ({ ...prev, [scoreKey]: prev[scoreKey] + 1 }));
        } else if (result.isDraw) {
            setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
        } else {
            if (gameMode === 'computer') {
                setIsXNext(false);
               
                setTimeout(() => makeComputerMove(nextBoard), 400);
            } else {
                setIsXNext(!isXNext);
            }
        }
    };

    
    const handleUndo = (): void => {
        if (history.length <= 1) return;

        let targetSteps = 1;

        if (gameMode === 'computer' && history.length > 2) {
            targetSteps = 2;
        }

        const updatedHistory = history.slice(0, -targetSteps);
        const updatedMoveList = moveList.slice(0, -targetSteps);
        const targetBoardState = updatedHistory[updatedHistory.length - 1];

        setHistory(updatedHistory);
        setMoveList(updatedMoveList);
        setBoard(targetBoardState);

        console.log(targetBoardState, updatedMoveList, updatedHistory,targetSteps);

        if (gameMode === 'computer') {
            setIsXNext(true);
        } else {
            setIsXNext(updatedMoveList.length % 2 === 0);
        }
    };

    const resetGame = (): void => {
        setBoard(Array(9).fill(null));
        setHistory([Array(9).fill(null)]);
        setMoveList([]);
        setIsXNext(true);
    };

const handleModeChange = (mode: GameMode): void => {
    setGameMode(mode);
    setBoard(Array(9).fill(null));
    setHistory([Array(9).fill(null)]);
    setMoveList([]);
    setIsXNext(true);
};

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Tic-Tac-Toe</h1>
            <div style={styles.modeContainer}>
        <button 
          onClick={() => handleModeChange('two-player')} 
          style={{...styles.toggleBtn, ...(gameMode === 'two-player' ? styles.activeToggle : {})}}
        >
           Two Player Mode
        </button>
        <button 
          onClick={() => handleModeChange('computer')} 
          style={{...styles.toggleBtn, ...(gameMode === 'computer' ? styles.activeToggle : {})}}
        >
           Computer Mode
        </button>
      </div>

           <div style={styles.mainLayout}>
            

                <div style={styles.gameArea}>
                    <div style={styles.status}>
                        {winner && <span style={styles.winnerText}>Winner: Player {winner}! </span>}
                        {isDraw && <span style={styles.drawText}>Game Ended in a Draw! </span>}
                        {!isGameOver && `Current Turn: Player ${isXNext ? 'X' : 'O'}`}
                    </div>

                    <div style={styles.grid}>
                        {board.map((value: CellValue, index: number) => {
                            const isWinningCell = winningLine.includes(index);
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleClick(index)}
                                    disabled={isGameOver || !!value || (!isXNext && gameMode === 'computer')}
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

                    <div style={styles.controlRow}>
                        <button
                            onClick={handleUndo}
                            disabled={history.length <= 1 || (!isXNext && gameMode === 'computer')}
                            style={{ ...styles.btn, ...styles.undoBtn }}
                        >
                            Undo Move
                        </button>
                        <button onClick={resetGame} style={{ ...styles.btn, ...styles.resetBtn }}>
                            Reset Board
                        </button>

                    </div>
                </div>

               
                <div style={styles.historyPanel}>
                    <h3 style={styles.historyTitle}>Move History</h3>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thRow}>
                                    <th style={styles.th}>Move</th>
                                    <th style={styles.th}>Player</th>
                                    <th style={styles.th}>Position</th>
                                </tr>
                            </thead>
                            <tbody>
                                {moveList.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} style={styles.emptyTableText}>No moves logged yet</td>
                                    </tr>
                                ) : (
                                    moveList.map((record) => (
                                        <tr key={record.moveNumber} style={styles.tr}>
                                            <td style={styles.td}>{record.moveNumber}</td>
                                            <td style={styles.td}>
                                                <span style={record.player === 'X' ? styles.badgeX : styles.badgeO}>
                                                    {record.player}
                                                </span>
                                            </td>
                                            <td style={styles.td}>{record.positionLabel}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}



// Inline CSS style definitions typing safely with React.CSSProperties
const styles: Record<string, React.CSSProperties> = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px', color: '#333' },
    title: { margin: '0 0 10px 0', fontSize: '2.5rem' },
    modeContainer: { display: 'flex', gap: '10px', marginBottom: '20px' },
    toggleBtn: { padding: '8px 16px', fontSize: '0.95rem', cursor: 'pointer', background: '#fff', border: '1px solid #ccc', borderRadius: '20px', fontWeight: '500', transition: 'all 0.2s' },
    activeToggle: { background: '#1976d2', color: '#fff', borderColor: '#1976d2' },
    scoreboard: { display: 'flex', gap: '25px', background: '#f5f5f5', padding: '12px 30px', borderRadius: '30px', marginBottom: '20px', border: '1px solid #eaeaea' },
    scoreItem: { minWidth: '110px', textAlign: 'center', fontSize: '1.05rem' },
    mainLayout: { display: 'flex', gap: '40px', justifyContent: 'center', width: '100%', flexWrap: 'wrap', marginTop: '10px' },
    gameArea: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    status: { fontSize: '1.2rem', fontWeight: '600', height: '30px', marginBottom: '15px', color: '#444' },
    winnerText: { color: '#2e7d32', background: '#e8f5e9', padding: '4px 12px', borderRadius: '4px' },
    drawText: { color: '#ef6c00', background: '#fff3e0', padding: '4px 12px', borderRadius: '4px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 95px)', gridTemplateRows: 'repeat(3, 95px)', gap: '10px', marginBottom: '20px' },
    cell: { fontSize: '2.3rem', fontWeight: 'bold', border: '2px solid #ddd', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' },
    emptyCell: { background: '#fff' },
    lockedCell: { background: '#fcfcfc', cursor: 'not-allowed', color: '#555' },
    winningCell: { background: '#a5d6a7', color: '#1b5e20', borderColor: '#66bb6a' },
    controlRow: { display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '320px' },
    btn: { padding: '10px 16px', fontSize: '0.9rem', fontWeight: '600', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' },
    undoBtn: { background: '#ff9800', color: '#fff' },
    resetBtn: { background: '#1976d2', color: '#fff' },
    clearScoreBtn: { background: '#d32f2f', color: '#fff', width: '100%', marginTop: '4px' },
    historyPanel: { width: '320px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', maxHeight: '375px' },
    historyTitle: { margin: '0 0 12px 0', fontSize: '1.15rem', color: '#424242', borderBottom: '2px solid #eee', paddingBottom: '6px' },
    tableWrapper: { overflowY: 'auto', flexGrow: 1 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
    thRow: { background: '#f5f5f5', textAlign: 'left' },
    th: { padding: '8px', fontWeight: '600', color: '#616161', borderBottom: '1px solid #e0e0e0' },
    tr: { borderBottom: '1px solid #f0f0f0' },
    td: { padding: '8px', color: '#424242' },
    emptyTableText: { textAlign: 'center', color: '#9e9e9e', padding: '20px' },
    badgeX: { background: '#e3f2fd', color: '#0d47a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' },
    badgeO: { background: '#fbe9e7', color: '#d84315', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }

};
