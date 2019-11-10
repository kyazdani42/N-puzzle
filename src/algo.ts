import {
  wrongMove,
  switcher,
  badMoves,
  getCreateNode,
  getGetter,
  findEmptyBlock,
  Queue,
  initNode
} from './utils';
import { config } from './config';

interface Props {
  puzzle: Puzzle;
  heuristic: Heuristic;
  search: searchStyle;
  solvedId: string;
}

interface Return {
  node: sNode;
  createdNodes: number;
  nbStudiedNodes: number;
  maxNumNodes: number;
}

export const astar = ({
  puzzle,
  heuristic,
  search,
  solvedId
}: Props): Return => {
  const createNode = getCreateNode[search](heuristic);

  const [x, y] = findEmptyBlock(puzzle);
  const startHeuristic = heuristic(puzzle);
  const firstNode = initNode(startHeuristic, puzzle, x, y);

  const toStudy = new Queue(firstNode, search);
  const studied: Set<string> = new Set();

  let createdNodes = 1;
  let allCurrentNodes = 1;
  let nbStudiedNodes = 0;
  let maxNumNodes = 1;

  // its true here because we know the puzzle we got from above is solvable
  while (true) {
    maxNumNodes = Math.max(allCurrentNodes, maxNumNodes);

    const currentNode = toStudy.pop();
    allCurrentNodes--;

    if (currentNode.id === solvedId) {
      return {
        node: currentNode,
        createdNodes,
        nbStudiedNodes,
        maxNumNodes
      };
    }

    if (studied.has(currentNode.id)) continue;

    studied.add(currentNode.id);
    nbStudiedNodes++;

    const {
      path: prevPath,
      level: prevLevel,
      x: prevX,
      y: prevY,
      puzzle: prevPuzzle
    } = currentNode;

    const lastMove: Move = prevPath[prevPath.length - 1];

    (['up', 'left', 'right', 'down'] as Move[]).forEach(move => {
      const badMove = badMoves.has(`${lastMove}|${move}`);
      const shouldNotMove = wrongMove[move](prevX, prevY, config.size);
      if (badMove || shouldNotMove) return;

      const newPuzzle = prevPuzzle.map(l => l.slice());
      const [newX, newY] = switcher[move](newPuzzle, prevX, prevY);
      const newNode = createNode(
        newPuzzle,
        newX,
        newY,
        prevPath,
        move,
        prevLevel
      );

      createdNodes++;
      allCurrentNodes++;

      toStudy.insert(newNode);
    });
  }
};

export const idastar = ({
  puzzle,
  heuristic,
  search,
  solvedId
}: Props): Return => {
  const createNode = getCreateNode[search](heuristic);

  const [x, y] = findEmptyBlock(puzzle);
  const startHeuristic = heuristic(puzzle);
  let parentNode = initNode(startHeuristic, puzzle, x, y);
  const getValue = getGetter[search];

  let maxDepth = getValue(parentNode);

  // data
  let createdNodes = 1;
  let nbStudiedNodes = 0;
  let maxNumNodes = 1;

  while (true) {
    // when we are going back to this loop, the maxDepth will have the value of nextMaxDepth
    let nextMaxDepth: number = Infinity;
    const toStudy: sNode[] = [parentNode];
    const studied: { [id: string]: number } = {};

    while (toStudy.length) {
      // get the last node created and go as deep as we can
      const currentNode = toStudy.pop() as sNode;

      maxNumNodes = Math.max(toStudy.length, maxNumNodes);

      nbStudiedNodes += 1;

      if (currentNode.id === solvedId) {
        return {
          node: currentNode,
          createdNodes,
          nbStudiedNodes,
          maxNumNodes
        };
      }

      // we put the current node inside the studied pool
      studied[currentNode.id] = getValue(currentNode);

      const {
        path: prevPath,
        level: prevLevel,
        x: prevX,
        y: prevY,
        puzzle: prevPuzzle
      } = currentNode;

      const lastMove: Move = prevPath[prevPath.length - 1];

      const newNodes = ((['up', 'left', 'right', 'down'] as Move[])
        .map(move => {
          const badMove = badMoves.has(`${lastMove}|${move}`);
          const shouldNotMove = wrongMove[move](prevX, prevY, config.size);
          if (badMove || shouldNotMove) return null;

          const newPuzzle = prevPuzzle.map(l => l.slice());
          const [newX, newY] = switcher[move](newPuzzle, prevX, prevY);
          const newNode = createNode(
            newPuzzle,
            newX,
            newY,
            prevPath,
            move,
            prevLevel
          );

          createdNodes += 1;

          const value = getValue(newNode);
          if (value <= maxDepth) {
            if (studied[newNode.id] && studied[newNode.id] <= value)
              return null;
            return newNode;
          }
          nextMaxDepth = Math.min(nextMaxDepth, value);
          return null;
        })
        .filter(Boolean) as sNode[]).sort((a, b) => getValue(b) - getValue(a));

      toStudy.push(...newNodes);
    }
    maxDepth = nextMaxDepth;
  }
};
