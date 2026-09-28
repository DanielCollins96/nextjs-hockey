const MAX_FORMULA_LENGTH = 2000;

export const FANTASY_STATS = [
  { key: "GP", label: "GP", name: "Games played", group: "Skater" },
  { key: "G", label: "G", name: "Goals", group: "Skater" },
  { key: "A", label: "A", name: "Assists", group: "Skater" },
  { key: "P", label: "P", name: "Points", group: "Skater" },
  { key: "PPG", label: "PPG", name: "Power-play goals", group: "Skater" },
  { key: "PPP", label: "PPP", name: "Power-play points", group: "Skater" },
  { key: "SHG", label: "SHG", name: "Shorthanded goals", group: "Skater" },
  { key: "SHP", label: "SHP", name: "Shorthanded points", group: "Skater" },
  { key: "GWG", label: "GWG", name: "Game-winning goals", group: "Skater" },
  { key: "OTG", label: "OTG", name: "Overtime goals", group: "Skater" },
  { key: "SOG", label: "SOG", name: "Shots on goal", group: "Skater" },
  { key: "HIT", label: "HIT", name: "Hits", group: "Skater" },
  { key: "BLK", label: "BLK", name: "Blocked shots", group: "Skater" },
  { key: "PIM", label: "PIM", name: "Penalty minutes", group: "Skater" },
  { key: "PM", label: "+/-", name: "Plus/minus", group: "Skater" },
  { key: "W", label: "W", name: "Wins", group: "Goalie" },
  { key: "L", label: "L", name: "Losses", group: "Goalie" },
  { key: "OTL", label: "OTL", name: "Overtime losses", group: "Goalie" },
  { key: "SO", label: "SO", name: "Shutouts", group: "Goalie" },
  { key: "GA", label: "GA", name: "Goals against", group: "Goalie" },
  { key: "SA", label: "SA", name: "Shots against", group: "Goalie" },
  { key: "SV", label: "SV", name: "Saves", group: "Goalie" },
  { key: "GS", label: "GS", name: "Games started", group: "Goalie" },
  { key: "TOI", label: "TOI", name: "Goalie minutes", group: "Goalie" },
  { key: "SVPCT", label: "SV%", name: "Save percentage (0.910 = 91.0%)", group: "Rates" },
  { key: "GAA", label: "GAA", name: "Goals-against average", group: "Rates" },
  { key: "SHPCT", label: "SH%", name: "Shooting percentage (0.15 = 15%)", group: "Rates" },
  { key: "FOPCT", label: "FO%", name: "Faceoff win percentage (0.52 = 52%)", group: "Rates" },
  { key: "AGE", label: "AGE", name: "Age on Feb 1 of the season", group: "Player" },
];

const STAT_BY_KEY = new Map(FANTASY_STATS.map((stat) => [stat.key, stat]));

const ALIASES = {
  GAMES: "GP",
  GOALS: "G",
  ASSISTS: "A",
  POINTS: "P",
  SHOTS: "SOG",
  SHUTOUT: "SO",
  SHUTOUTS: "SO",
  WINS: "W",
  LOSSES: "L",
  SAVES: "SV",
  PLUS: "PM",
  PLUSMINUS: "PM",
  HITS: "HIT",
  BLOCK: "BLK",
  BLOCKS: "BLK",
  BLOCKEDSHOTS: "BLK",
};

const FUNCTIONS = {
  IF: { min: 3, max: 3 },
  MIN: { min: 1, max: 20 },
  MAX: { min: 1, max: 20 },
  ABS: { min: 1, max: 1 },
  ROUND: { min: 1, max: 2 },
  FLOOR: { min: 1, max: 1 },
  CEIL: { min: 1, max: 1 },
  AND: { min: 1, max: 20 },
  OR: { min: 1, max: 20 },
};

export const LEAGUE_FANTASY_FORMULA =
  "2*G + A + 0.5*PPP + 0.5*SHP + 0.1*SOG + 0.1*HIT + 0.5*BLK + 4*W - 2*GA + 0.2*SV + 3*SO + OTL";

export const FANTASY_PRESETS = [
  {
    id: "league",
    name: "League scoring",
    formula: LEAGUE_FANTASY_FORMULA,
  },
  {
    id: "counting",
    name: "G / A / PPP / shots",
    formula: "3*G + 2*A + PPP + 0.4*SOG",
  },
  {
    id: "mixed",
    name: "Skaters and goalies",
    formula: "3*G + 2*A + PPP + 0.4*SOG + 3*W + 2*SO",
  },
  {
    id: "goalies",
    name: "Goalies",
    formula: "3*W + 2*SO + 0.2*SV - GA",
  },
  {
    id: "pace",
    name: "82-game pace",
    formula: "IF(GP>0, (3*G + 2*A + PPP + 0.4*SOG)/GP*82, 0)",
  },
];

export const DEFAULT_FANTASY_FORMULA = LEAGUE_FANTASY_FORMULA;

export function fantasyStatGroups() {
  const groups = [];
  for (const stat of FANTASY_STATS) {
    let group = groups.find((item) => item.name === stat.group);
    if (!group) {
      group = { name: stat.group, stats: [] };
      groups.push(group);
    }
    group.stats.push(stat);
  }
  return groups;
}

export function formatFantasyStat(key, value) {
  if (value == null || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  if (key === "SVPCT" || key === "SHPCT" || key === "FOPCT") {
    return `${(number * 100).toFixed(1)}%`;
  }
  if (key === "GAA") return number.toFixed(2);
  if (key === "TOI") return number.toFixed(0);
  if (Number.isInteger(number)) return String(number);
  return number.toFixed(1);
}

export function formatFantasyPoints(value) {
  if (value == null || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function projectScore(total, gamesPlayed, paceGames) {
  if (total == null || total === "") return null;
  const score = Number(total);
  if (!Number.isFinite(score)) return null;
  const games = Number(paceGames);
  if (!Number.isFinite(games) || games <= 0) return score;
  const played = Number(gamesPlayed);
  if (!Number.isFinite(played) || played <= 0) return null;
  return (score / played) * games;
}

class FormulaError extends Error {
  constructor(message) {
    super(message);
    this.name = "FormulaError";
  }
}

class FormulaRowError extends Error {
  constructor(message) {
    super(message);
    this.name = "FormulaRowError";
  }
}

function tokenize(source) {
  const tokens = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "(" || char === ")" || char === ",") {
      tokens.push({ type: char, pos: index });
      index += 1;
      continue;
    }

    if ("+-*/^%".includes(char)) {
      tokens.push({ type: "op", value: char, pos: index });
      index += 1;
      continue;
    }

    if (char === ">" || char === "<" || char === "=" || char === "!") {
      let value = char;
      const next = source[index + 1];
      if (next === "=" || (char === "<" && next === ">")) {
        value += next;
        index += 1;
      }
      tokens.push({ type: "op", value, pos: index });
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      const start = index;
      let sawDot = char === ".";
      index += 1;
      while (index < source.length && /[0-9]/.test(source[index])) index += 1;
      if (!sawDot && source[index] === ".") {
        sawDot = true;
        index += 1;
        while (index < source.length && /[0-9]/.test(source[index])) index += 1;
      }
      const raw = source.slice(start, index);
      if (raw === "." || !Number.isFinite(Number(raw))) {
        throw new FormulaError(`Invalid number "${raw}".`);
      }
      tokens.push({ type: "num", value: Number(raw), pos: start });
      continue;
    }

    const ident = /^[A-Za-z_][A-Za-z0-9_]*/.exec(source.slice(index));
    if (ident) {
      const word = ident[0];
      const upper = word.toUpperCase();
      tokens.push({ type: "ident", value: upper, pos: index });
      index += word.length;
      continue;
    }

    throw new FormulaError(`Unexpected character "${char}".`);
  }

  tokens.push({ type: "eof", pos: source.length });
  return tokens;
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }

  peek() {
    return this.tokens[this.index];
  }

  eat(type, value) {
    const token = this.peek();
    if (token.type !== type) return null;
    if (value != null && token.value !== value) return null;
    this.index += 1;
    return token;
  }

  eatKeyword(word) {
    const token = this.peek();
    if (token.type === "ident" && token.value === word) {
      this.index += 1;
      return token;
    }
    return null;
  }

  parse() {
    const expression = this.parseOr();
    if (this.peek().type !== "eof") {
      throw new FormulaError(`Unexpected "${this.describe(this.peek())}".`);
    }
    return expression;
  }

  describe(token) {
    if (token.type === "eof") return "end of formula";
    if (token.type === "num") return String(token.value);
    if (token.value) return token.value;
    return token.type;
  }

  parseOr() {
    let left = this.parseAnd();
    while (this.eatKeyword("OR")) {
      left = { type: "binary", op: "OR", left, right: this.parseAnd() };
    }
    return left;
  }

  parseAnd() {
    let left = this.parseComparison();
    while (this.eatKeyword("AND")) {
      left = { type: "binary", op: "AND", left, right: this.parseComparison() };
    }
    return left;
  }

  parseComparison() {
    const left = this.parseAdd();
    const operator = this.peek();
    if (operator.type === "op" && [">", "<", ">=", "<=", "=", "==", "<>", "!="].includes(operator.value)) {
      this.index += 1;
      return { type: "binary", op: operator.value, left, right: this.parseAdd() };
    }
    return left;
  }

  parseAdd() {
    let left = this.parseMul();
    while (this.peek().type === "op" && (this.peek().value === "+" || this.peek().value === "-")) {
      const operator = this.eat("op").value;
      left = { type: "binary", op: operator, left, right: this.parseMul() };
    }
    return left;
  }

  parseMul() {
    let left = this.parseUnary();
    while (this.peek().type === "op" && (this.peek().value === "*" || this.peek().value === "/")) {
      const operator = this.eat("op").value;
      left = { type: "binary", op: operator, left, right: this.parseUnary() };
    }
    return left;
  }

  parseUnary() {
    if (this.eat("op", "+")) return { type: "unary", op: "+", arg: this.parseUnary() };
    if (this.eat("op", "-")) return { type: "unary", op: "-", arg: this.parseUnary() };
    return this.parsePower();
  }

  parsePower() {
    const left = this.parsePostfix();
    if (this.eat("op", "^")) {
      return { type: "binary", op: "^", left, right: this.parseUnary() };
    }
    return left;
  }

  parsePostfix() {
    let expression = this.parsePrimary();
    while (this.eat("op", "%")) {
      expression = { type: "unary", op: "%", arg: expression };
    }
    return expression;
  }

  parsePrimary() {
    const number = this.eat("num");
    if (number) return { type: "num", value: number.value };

    if (this.eat("(")) {
      const expression = this.parseOr();
      if (!this.eat(")")) throw new FormulaError('Missing ")".');
      return expression;
    }

    const ident = this.eat("ident");
    if (!ident) throw new FormulaError(`Unexpected "${this.describe(this.peek())}".`);

    if (this.eat("(")) return this.parseCall(ident.value);
    if (ident.value === "AND" || ident.value === "OR" || FUNCTIONS[ident.value]) {
      throw new FormulaError(`${ident.value} is a function. Add parentheses, like ${ident.value}(...).`);
    }
    return { type: "stat", key: resolveStat(ident.value) };
  }

  parseCall(name) {
    const spec = FUNCTIONS[name];
    if (!spec) throw new FormulaError(`${name} is not a function.`);

    const args = [];
    if (!this.eat(")")) {
      args.push(this.parseOr());
      while (this.eat(",")) args.push(this.parseOr());
      if (!this.eat(")")) throw new FormulaError('Missing ")".');
    }

    if (args.length < spec.min || args.length > spec.max) {
      const expected = spec.min === spec.max ? String(spec.min) : `${spec.min}-${spec.max}`;
      throw new FormulaError(`${name} expects ${expected} argument${spec.max === 1 ? "" : "s"}.`);
    }

    return { type: "call", name, args };
  }
}

function resolveStat(name) {
  if (FUNCTIONS[name]) {
    throw new FormulaError(`${name} is a function. Add parentheses, like ${name}(...).`);
  }
  const key = ALIASES[name] || name;
  if (!STAT_BY_KEY.has(key)) {
    throw new FormulaError(`Unknown name ${name}. Use one of the stat buttons, or check the spelling.`);
  }
  return key;
}

function collectStats(node, found = new Set()) {
  if (!node || typeof node !== "object") return found;
  if (node.type === "stat") found.add(node.key);
  if (node.arg) collectStats(node.arg, found);
  if (node.left) collectStats(node.left, found);
  if (node.right) collectStats(node.right, found);
  if (node.args) node.args.forEach((arg) => collectStats(arg, found));
  return found;
}

function truthy(value) {
  return Number.isFinite(value) && value !== 0;
}

function roundTo(value, digits) {
  const places = Number.isFinite(digits) ? Math.trunc(digits) : 0;
  const factor = 10 ** places;
  return Math.round((value + Math.sign(value || 1) * Number.EPSILON) * factor) / factor;
}

function evalBinary(op, leftNode, rightNode, row) {
  if (op === "AND") {
    return truthy(evaluateNode(leftNode, row)) && truthy(evaluateNode(rightNode, row)) ? 1 : 0;
  }
  if (op === "OR") {
    return truthy(evaluateNode(leftNode, row)) || truthy(evaluateNode(rightNode, row)) ? 1 : 0;
  }

  const left = evaluateNode(leftNode, row);
  const right = evaluateNode(rightNode, row);
  switch (op) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      if (right === 0) throw new FormulaRowError("division by zero");
      return left / right;
    case "^":
      return left ** right;
    case ">":
      return left > right ? 1 : 0;
    case "<":
      return left < right ? 1 : 0;
    case ">=":
      return left >= right ? 1 : 0;
    case "<=":
      return left <= right ? 1 : 0;
    case "=":
    case "==":
      return left === right ? 1 : 0;
    case "<>":
    case "!=":
      return left !== right ? 1 : 0;
    default:
      throw new FormulaError(`Unknown operator ${op}.`);
  }
}

function evaluateNode(node, row) {
  switch (node.type) {
    case "num":
      return node.value;
    case "stat": {
      const value = Number(row?.[node.key]);
      return Number.isFinite(value) ? value : 0;
    }
    case "unary": {
      const value = evaluateNode(node.arg, row);
      if (node.op === "+") return value;
      if (node.op === "-") return -value;
      if (node.op === "%") return value / 100;
      break;
    }
    case "binary":
      return evalBinary(node.op, node.left, node.right, row);
    case "call":
      return evalCall(node, row);
    default:
      break;
  }
  throw new FormulaError("Could not evaluate the formula.");
}

function evalCall(node, row) {
  if (node.name === "IF") {
    return truthy(evaluateNode(node.args[0], row))
      ? evaluateNode(node.args[1], row)
      : evaluateNode(node.args[2], row);
  }
  if (node.name === "AND") {
    for (const arg of node.args) {
      if (!truthy(evaluateNode(arg, row))) return 0;
    }
    return 1;
  }
  if (node.name === "OR") {
    for (const arg of node.args) {
      if (truthy(evaluateNode(arg, row))) return 1;
    }
    return 0;
  }

  const args = node.args.map((arg) => evaluateNode(arg, row));
  switch (node.name) {
    case "MIN":
      return Math.min(...args);
    case "MAX":
      return Math.max(...args);
    case "ABS":
      return Math.abs(args[0]);
    case "ROUND":
      return roundTo(args[0], args[1] ?? 0);
    case "FLOOR":
      return Math.floor(args[0]);
    case "CEIL":
      return Math.ceil(args[0]);
    default:
      throw new FormulaError(`${node.name} is not a function.`);
  }
}

export function compileFormula(source) {
  const text = String(source ?? "");
  const fail = (error) => ({
    ok: false,
    error,
    stats: [],
    evaluate: () => null,
  });

  if (!text.trim()) return fail("Enter a formula.");
  if (text.length > MAX_FORMULA_LENGTH) return fail("Formula is too long.");

  try {
    const ast = new Parser(tokenize(text)).parse();
    const used = collectStats(ast);
    return {
      ok: true,
      error: null,
      stats: FANTASY_STATS.map((stat) => stat.key).filter((key) => used.has(key)),
      evaluate(row) {
        try {
          const value = evaluateNode(ast, row);
          return Number.isFinite(value) ? value : null;
        } catch (error) {
          if (error instanceof FormulaRowError) return null;
          throw error;
        }
      },
    };
  } catch (error) {
    if (error instanceof FormulaError) return fail(error.message);
    throw error;
  }
}
