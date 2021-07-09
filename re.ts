interface RegularExpression {};

class Re {
  ex: RegularExpression;
  constructor(ex: RegularExpression) {
    this.ex = ex;
  }
  get exp() {
    return this.ex
  }
  get nfa() {
    return exp2nfa(this.ex)
  }
  iterate() {
    this.ex = new IterationExpression(this.ex)
    return this
  }
  union(anotherEx: Re) {
    this.ex = new UnionExpression(this.ex, anotherEx.exp)
    return this
  }
  concat(anotherEx: Re) {
    this.ex = new ConcatenationExpression(this.ex, anotherEx.exp)
    return this
  }
}

export function exp2nfa (exp: RegularExpression): NFA {
  const end = {
    exp,
    transformTable: null
  }
  if (exp instanceof SymbolExpression) {
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
    const nfaA = exp2nfa(exp.exA)
    const nfaB = exp2nfa(exp.exB)
    const map = new Map()

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
  if (exp instanceof ConcatenationExpression) {
    const nfaA = exp2nfa(exp.exA)
    const nfaB = exp2nfa(exp.exB)
    const map = new Map()

    nfaA.end.transformTable = new Map().set(new EmptyExpression(), nfaB.end)
    nfaB.end.transformTable = new Map().set(new EmptyExpression(), end)

    map.set(new EmptyExpression(), nfaA.start)

    const start = {
      exp,
      transformTable: map
    }

    return {
      start,
      end
    }
  }
  if (exp instanceof IterationExpression) {
    const nfa = exp2nfa(exp.ex)
    const startMap = new Map()
    const start = {
      exp,
      transformTable: startMap
    }

    nfa.end.transformTable = new Map()
      .set(new EmptyExpression(), start)
      .set(new EmptyExpression(), end)

    startMap.set(new EmptyExpression(), nfa.start)
    startMap.set(new EmptyExpression(), end)

    return {
      start,
      end
    }
  }
  throw Error('invalid regular expression')
}

type TransformTable = Map<EmptyExpression | SymbolExpression, NFAState> | null;

interface NFAState {
  exp: RegularExpression;
  transformTable: TransformTable;
}

interface NFA {
  start: NFAState;
  end: NFAState
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

export const re = {
  Symbol: (a: string) => new Re(new SymbolExpression(a)),
}

const res = re.Symbol('a').concat(re.Symbol('b').iterate())

console.log(res.nfa)
