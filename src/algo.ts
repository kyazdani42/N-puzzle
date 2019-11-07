import {
  wrongMove,
  switcher,
  getMinFromPool,
  badMoves,
  getCreateNode,
  findEmptyBlock
} from './utils';
import { config } from './config';

interface Props {
  puzzle: Puzzle;
  heuristic: Heuristic;
  search: searchStyle;
}

interface Return {
  node: sNode;
  createdNodes: number;
  numNodes: number;
  maxNumNodes: number;
}

export const astar = ({ puzzle, heuristic, search }: Props): Return => {
  const createNode = getCreateNode(heuristic);

  const getKey = getGetter[search];
  const [x, y] = findEmptyBlock(puzzle);
  const firstNode = createNode(puzzle, x, y, [], -1);

  let createdNodes = 1;
  const value = getKey(firstNode);
  const pool = { [value]: [firstNode] };
  const visited: { [id in string]: number } = { [firstNode.id]: value };

  let allCurrentNodes = 1;
  let numNodes = 0;
  let maxNumNodes = 1;

  while (Object.keys(pool).length) {
    const minValue = getMinFromPool(pool);
    const currentNode = pool[minValue].pop() as sNode;

    if (!pool[minValue].length) delete pool[minValue];
    allCurrentNodes -= 1;
    maxNumNodes = Math.max(allCurrentNodes, maxNumNodes);
    numNodes++;

    if (currentNode.heuristic === 0) {
      return {
        node: currentNode,
        createdNodes,
        numNodes,
        maxNumNodes
      };
    }

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
        prevLevel,
        move
      );
      createdNodes++;

      const value = getKey(newNode);
      if (visited[newNode.id] && visited[newNode.id] < value) return;

      if (!pool[value]) pool[value] = [newNode];
      else pool[value].push(newNode);

      allCurrentNodes += 1;
      visited[newNode.id] = value;
    });
  }

  throw new Error('this puzzle cannot be solved');
};

const getGetter = {
  normal: (node: sNode) => node.total,
  greedy: (node: sNode) => node.heuristic,
  uniform: (node: sNode) => node.level
};

export const idastar = ({ puzzle, heuristic }: Props): Return => {
  const createNode = getCreateNode(heuristic);

  const [x, y] = findEmptyBlock(puzzle);
  let parentNode = createNode(puzzle, x, y, [], -1);
  let maxDepth = parentNode.heuristic + 1;
  let createdNodes = 1;
  let numNodes = 0;
  let allCurrentNodes = 1;
  let maxNumNodes = 1;
  while (true) {
    let nextMaxDepth: number = Infinity;
    const nodes: sNode[] = [parentNode];
    const visited: { [id in string]: number } = {
      [parentNode.id]: parentNode.total
    };
    while (nodes.length) {
      const currentNode = nodes.pop() as sNode;
      allCurrentNodes -= 1;
      numNodes += 1;
      maxNumNodes = Math.max(allCurrentNodes, maxNumNodes);

      if (currentNode.heuristic === 0) {
        return {
          node: currentNode,
          createdNodes,
          numNodes,
          maxNumNodes
        };
      }

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
          prevLevel,
          move
        );
        createdNodes += 1;
        if (visited[newNode.id] && visited[newNode.id] < newNode.total) return;
        if (newNode.total < maxDepth) {
          nodes.push(newNode);
          visited[newNode.id] = newNode.total;
          allCurrentNodes += 1;
        } else nextMaxDepth = Math.min(nextMaxDepth, newNode.total);
      });
    }
    maxDepth = nextMaxDepth + 1;
  }
};
