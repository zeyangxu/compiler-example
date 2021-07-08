import assert from "assert";

interface RegularExpression {};

class Re {
  ex: RegularExpression;
  constructor(ex: RegularExpression) {
    this.ex = ex;
  }
  get exp() {
    return this.ex
  }
  iterate() {
    this.ex = new IterationExpression(this.ex)
    return this
  }
  union(anotherEx: RegularExpression) {
    this.ex = new UnionExpression(this.ex, anotherEx)
    return this
  }
  concat(anotherEx: RegularExpression) {
    this.ex = new ConcatenationExpression(this.ex, anotherEx)
    return this
  }
}

class UnionExpression implements RegularExpression {
  exA: RegularExpression;
  exB: RegularExpression;
  constructor(exA: RegularExpression, exB: RegularExpression) {
    this.exA = exA;
    this.exB = exB;
  }
};

class ConcatenationExpression implements RegularExpression {
  exA: RegularExpression;
  exB: RegularExpression;
  constructor(exA: RegularExpression, exB: RegularExpression) {
    this.exA = exA;
    this.exB = exB;
  }
};

class SymbolExpression implements RegularExpression {
  char: string;
  constructor(char: string) {
    this.char = char
  }
};

class EmptyExpression implements RegularExpression {};

class IterationExpression implements RegularExpression {
  ex: RegularExpression;
  constructor(ex: RegularExpression) {
    this.ex = ex;
  }
};

interface AcceptingState {};
interface ErrorState {};

interface NFAState {
  exp: RegularExpression;
  transformTable: Map<EmptyExpression | SymbolExpression, NFAState> | null;
}

interface NFA {
  start: NFAState;
  end: NFAState
}

function exp2NFA (exp: RegularExpression): NFA {
  if (exp instanceof SymbolExpression) {
    const end = {
      exp,
      transformTable: null
    }
    const start = {
      exp,
      transformTable: new Map().set(exp, end)
    }
    return {
      start,
      end
    }
  }
  if (exp instanceof UnionExpression) {
    const nfaA = exp2NFA(exp.exA)
    const nfaB = exp2NFA(exp.exB)
    const map = new Map()

    const end = {
      exp,
      transformTable: null
    }

    nfaA.end.transformTable = new Map().set(new EmptyExpression(), end)
    nfaB.end.transformTable = new Map().set(new EmptyExpression(), end)

    map.set(new EmptyExpression(), nfaA.start)
    map.set(new EmptyExpression(), nfaB.start)

    const start = {
      exp,
      transformTable: map
    }

    return {
      start,
      end
    }
  }
  throw Error('invalid regular expression')
}

const re = {
  Symbol: (a: string) => new Re(new SymbolExpression(a)),
}

const res = re.Symbol('a').concat(re.Symbol('b').iterate()).exp

if(res instanceof ConcatenationExpression) {
  console.log('concat!')
} else if (res instanceof SymbolExpression) {
  console.log('ooo')
} else {
  console.log('wat')
}

console.log('compiler')