/**
 * Safe Mathematical Expression Evaluator
 * 
 * Evaluates mathematical expressions using a recursive descent parser.
 * Zero use of eval or Function constructors or code generation.
 * Completely immune to arbitrary code execution, prototype pollution, and XSS.
 * Supports numbers, standard operators (+, -, *, /, ^), parentheses,
 * constants (pi, e), and scientific functions (sin, cos, tan, ln, log, sqrt).
 */

export interface MathEvalOptions {
  angleUnit?: 'deg' | 'rad';
}

type TokenType = 'NUMBER' | 'OP' | 'LPAREN' | 'RPAREN' | 'IDENT';

interface Token {
  type: TokenType;
  value: string;
  num?: number;
}

export function safeEvaluateMath(rawExpr: string, options: MathEvalOptions = {}): number {
  const angleUnit = options.angleUnit || 'deg';

  // Normalize operators and symbols
  let expr = rawExpr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi');

  // Tokenize
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        numStr += expr[i];
        i++;
      }
      const numVal = parseFloat(numStr);
      if (isNaN(numVal)) {
        throw new Error('Invalid number');
      }
      tokens.push({ type: 'NUMBER', value: numStr, num: numVal });
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      tokens.push({ type: 'OP', value: ch });
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    if (/[a-zA-Z]/.test(ch)) {
      let ident = '';
      while (i < expr.length && /[a-zA-Z0-9]/.test(expr[i])) {
        ident += expr[i];
        i++;
      }
      tokens.push({ type: 'IDENT', value: ident.toLowerCase() });
      continue;
    }

    throw new Error(`Unexpected character: ${ch}`);
  }

  let pos = 0;

  function peek(): Token | undefined {
    return tokens[pos];
  }

  function consume(): Token {
    const t = tokens[pos];
    pos++;
    return t;
  }

  // Grammar:
  // parseExpr: parseTerm (('+' | '-') parseTerm)*
  // parseTerm: parsePower (('*' | '/') parsePower)*
  // parsePower: parseFactor ('^' parsePower)?
  // parseFactor: ('+' | '-')* parsePrimary
  // parsePrimary: NUMBER | IDENT | IDENT '(' parseExpr ')' | '(' parseExpr ')'

  function parseExpr(): number {
    let result = parseTerm();
    while (pos < tokens.length) {
      const tok = peek();
      if (tok && tok.type === 'OP' && (tok.value === '+' || tok.value === '-')) {
        consume();
        const nextTerm = parseTerm();
        if (tok.value === '+') result += nextTerm;
        else result -= nextTerm;
      } else {
        break;
      }
    }
    return result;
  }

  function parseTerm(): number {
    let result = parsePower();
    while (pos < tokens.length) {
      const tok = peek();
      if (tok && tok.type === 'OP' && (tok.value === '*' || tok.value === '/')) {
        consume();
        const nextPower = parsePower();
        if (tok.value === '*') {
          result *= nextPower;
        } else {
          if (nextPower === 0) throw new Error('Division by zero');
          result /= nextPower;
        }
      } else {
        break;
      }
    }
    return result;
  }

  function parsePower(): number {
    const base = parseFactor();
    const tok = peek();
    if (tok && tok.type === 'OP' && tok.value === '^') {
      consume();
      const exp = parsePower(); // right-associative
      return Math.pow(base, exp);
    }
    return base;
  }

  function parseFactor(): number {
    let sign = 1;
    while (pos < tokens.length) {
      const tok = peek();
      if (tok && tok.type === 'OP' && tok.value === '+') {
        consume();
      } else if (tok && tok.type === 'OP' && tok.value === '-') {
        consume();
        sign = -sign;
      } else {
        break;
      }
    }
    return sign * parsePrimary();
  }

  function parsePrimary(): number {
    const tok = peek();
    if (!tok) throw new Error('Unexpected end of expression');

    if (tok.type === 'NUMBER') {
      consume();
      return tok.num!;
    }

    if (tok.type === 'LPAREN') {
      consume();
      const val = parseExpr();
      const closing = peek();
      if (!closing || closing.type !== 'RPAREN') {
        throw new Error('Missing closing parenthesis');
      }
      consume();
      return val;
    }

    if (tok.type === 'IDENT') {
      const ident = tok.value;
      consume();

      // Check if it's a function call like sin(...) or sqrt(...)
      const next = peek();
      if (next && next.type === 'LPAREN') {
        consume();
        const arg = parseExpr();
        const closing = peek();
        if (!closing || closing.type !== 'RPAREN') {
          throw new Error(`Missing closing parenthesis for function ${ident}`);
        }
        consume();

        switch (ident) {
          case 'sin': {
            const rad = angleUnit === 'deg' ? (arg * Math.PI) / 180 : arg;
            return Math.sin(rad);
          }
          case 'cos': {
            const rad = angleUnit === 'deg' ? (arg * Math.PI) / 180 : arg;
            return Math.cos(rad);
          }
          case 'tan': {
            const rad = angleUnit === 'deg' ? (arg * Math.PI) / 180 : arg;
            return Math.tan(rad);
          }
          case 'asin': {
            const res = Math.asin(arg);
            return angleUnit === 'deg' ? (res * 180) / Math.PI : res;
          }
          case 'acos': {
            const res = Math.acos(arg);
            return angleUnit === 'deg' ? (res * 180) / Math.PI : res;
          }
          case 'atan': {
            const res = Math.atan(arg);
            return angleUnit === 'deg' ? (res * 180) / Math.PI : res;
          }
          case 'ln': {
            if (arg <= 0) throw new Error('Invalid ln argument');
            return Math.log(arg);
          }
          case 'log': {
            if (arg <= 0) throw new Error('Invalid log argument');
            return Math.log10(arg);
          }
          case 'sqrt': {
            if (arg < 0) throw new Error('Invalid sqrt argument');
            return Math.sqrt(arg);
          }
          case 'abs':
            return Math.abs(arg);
          default:
            throw new Error(`Unknown function: ${ident}`);
        }
      }

      // Constants
      if (ident === 'pi') return Math.PI;
      if (ident === 'e') return Math.E;

      throw new Error(`Unknown identifier: ${ident}`);
    }

    throw new Error(`Unexpected token: ${tok.value}`);
  }

  const result = parseExpr();
  if (pos < tokens.length) {
    throw new Error(`Unexpected token at position ${pos}`);
  }

  if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
    throw new Error('Math error: Result is undefined or infinite');
  }

  return result;
}
