import { config } from './config';

export const blue = '\x1b[1;36m';
export const yellow = '\x1b[1;33m';
export const yellowSmooth = '\x1b[0;3;33m';
export const reset = '\x1b[0m';
export const white = '\x1b[1;37m';
export const greenBold = '\x1b[32;1m';
export const violet = '\x1b[35;1m';
export const red = '\x1b[31;1m';

export function logBench(state: State) {
  console.clear();

  config.heuristics.forEach(heuristic =>
    console.log(`
${greenBold}-------- ${heuristic} --------${reset}

${logs(state[heuristic])}
`)
  );
}

function logs(state: HeuristicState) {
  return `	${violet} TIMES ${reset}
${blue}average: ${reset}           ${formatMsValue(
    getAvg(state.allSolvedTimes)
  )}
${blue}standard deviation: ${reset}${formatMsValue(
    getStandardDeviation(state.allSolvedTimes)
  )}
${blue}min: ${reset}               ${formatMsValue(
    getMin(state.allSolvedTimes)
  )}
${blue}max: ${reset}               ${formatMsValue(
    getMax(state.allSolvedTimes)
  )}
   ${formatNodesNumber(state)}`;
}

function formatNodesNumber(state: HeuristicState) {
  return `${violet}MAX NODES IN MEMORY ${reset}
${blue}average:             ${reset}${formatNode(getAvg(state.allMaxNumNodes))}
${blue}standard deviation:  ${reset}${formatNode(
    getStandardDeviation(state.allMaxNumNodes)
  )}
${blue}min:                 ${reset}${formatNode(getMin(state.allMaxNumNodes))}
${blue}max:                 ${reset}${formatNode(getMax(state.allMaxNumNodes))}

   ${violet} ALL CREATED NODES ${reset}
${blue}average:             ${reset}${formatNode(getAvg(state.allCreatedNodes))}
${blue}standard deviation:  ${reset}${formatNode(
    getStandardDeviation(state.allCreatedNodes)
  )}
${blue}min:                 ${reset}${formatNode(getMin(state.allCreatedNodes))}
${blue}max:                 ${reset}${formatNode(getMax(state.allCreatedNodes))}

   ${violet} ALL EXPLORED NODES ${reset}
${blue}average:             ${reset}${formatNode(
    getAvg(state.allNbStudiedNodes)
  )}
${blue}standard deviation:  ${reset}${formatNode(
    getStandardDeviation(state.allNbStudiedNodes)
  )}
${blue}min:                 ${reset}${formatNode(
    getMin(state.allNbStudiedNodes)
  )}
${blue}max:                 ${reset}${formatNode(
    getMax(state.allNbStudiedNodes)
  )}`.trim();
}

function formatNode(numNodes: number | string) {
  return `${reset}${white}${numNodes}${reset}`;
}

function getAvg(allValues: number[]) {
  return (allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(2);
}

function getMax(allValues: number[]) {
  return allValues.reduce((a, b) => Math.max(a, b), -Infinity);
}

function getMin(allValues: number[]) {
  return allValues.reduce((a, b) => Math.min(a, b), Infinity);
}

function getStandardDeviation(allValues: number[]) {
  const average = getAvg(allValues);
  const sumOfSquared = allValues.reduce((a, b) => a + (b - +average) ** 2, 0);
  return Math.sqrt(sumOfSquared / allValues.length).toFixed(4);
}

function formatMsValue(str: string | number) {
  return `${yellow}${str}${yellowSmooth}ms${reset}`;
}

function parseTime(time: number) {
  if (time < 1000) return `${time}ms`;
  let seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function formatPath(path: Move[]) {
  return path.map(move => colorMove(move)).join(' ');
}

const colorMove = (move: Move) => {
  switch (move) {
    case 'left':
      return `${yellow}←${reset}`;
    case 'right':
      return `${violet}→${reset}`;
    case 'up':
      return `${blue}↑${reset}`;
    case 'down':
      return `${red}↓${reset}`;
  }
};

export function logOnce(
  algorithm: algorithms,
  heuristic: heuristics,
  search: searchStyle,
  state: State
) {
  const data = state[heuristic];
  console.log(`
${violet}Result for ${algorithm} with ${heuristic} in ${search} search:${reset}

${greenBold}solved in             ${white}${parseTime(data.solveTime)}${reset}
${greenBold}moves                 ${white}${data.path.length}${reset}
${greenBold}max nodes in memory   ${white}${data.maxNumNodes}${reset}
${greenBold}total explored nodes  ${white}${data.nbStudiedNodes}${reset}
${greenBold}total created nodes   ${white}${data.createdNodes}${reset}
${greenBold}path                  ${white}${formatPath(data.path)}${reset}
`);
}

export function logPuzzle(puzzle: Puzzle, size: number) {
  const max = String(Math.max(...puzzle.flat())).length;
  const stringLength = max * size + (size - 1) * 3 + 4;
  let str = `${violet}${'-'.repeat(stringLength)}\n| ${reset}`;
  let startSize = str.length;
  for (const row of puzzle) {
    if (str.length > startSize)
      str = `${str}\n${violet}${'-'.repeat(stringLength)}\n${violet}| ${reset}`;
    for (const col of row) {
      const colStr =
        col === 0
          ? `${red}${col.toString().padEnd(max, ' ')}`
          : `${blue}${col.toString().padEnd(max, ' ')}`;
      str = `${str}${colStr}${reset} ${violet}| ${reset}`;
    }
  }
  str = `${str}\n${violet}${'-'.repeat(stringLength)}${reset}\n`;
  console.log(str);
}
