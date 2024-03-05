import { ESTree, astring, meriyah, walker } from "../deps.ts";

// List of identifiers that are in globalThis
// but should be accessed as templateState.identifier
const INCLUDE_GLOBAL = [
  "name",
];

// List of identifiers that should be ignored
// when transforming the code
const DEFAULT_EXCLUDES = [
    "globalThis",
    "self",
    "global",
    "this",
    "undefined",
    "null",
];

type Scope = {
  globalScope: number;
  stack: string[];
};

// Tracks the scope of the code
// and the variables that should be ignored
class ScopeTracker {
  private scopes: Scope[] = [];

  // The index of the global/function scope
  private globalScope = 0;
  globalDeclaration = false;

  includes(val: string): boolean {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].stack.includes(val)) {
        return true;
      }
    }

    return false;
  }

  pushScope(global?: boolean) {
    if (global) {
      this.globalScope = this.scopes.length;
    }

    const newScope: Scope = {
      globalScope: this.globalScope,
      stack: [],
    };

    this.scopes.push(newScope);
  }

  popScope() {
    this.globalScope = this.scopes[this.scopes.length - 1].globalScope;
    this.scopes.pop();
  }

  pushBinding(val: string) {
    if (this.scopes.length === 0) {
      this.scopes.push({ globalScope: this.globalScope, stack: [] });
    }

    if (this.globalDeclaration) {
      this.scopes[this.globalScope].stack.push(val);
    } else {
      this.scopes[this.scopes.length - 1].stack.push(val);
    }
  }

  pushPatternBinding(pattern: ESTree.Pattern) {
    switch (pattern.type) {
      case "Identifier":
        this.pushBinding(pattern.name);
        break;

      case "RestElement":
        this.pushPatternBinding(pattern.argument);
        break;

      case "ArrayPattern":
        for (const element of pattern.elements) {
          if (element) {
            this.pushPatternBinding(element);
          }
        }
        break;

      case "ObjectPattern":
        for (const prop of pattern.properties) {
          if (prop.type === "RestElement") {
            this.pushPatternBinding(prop.argument);
          } else {
            this.pushPatternBinding(prop.value);
          }
        }
        break;

      case "AssignmentPattern":
        this.pushPatternBinding(pattern.left);
        break;
    }
  }

  pushPatterns(patterns: ESTree.Pattern[]) {
    for (const pattern of patterns) {
      this.pushPatternBinding(pattern);
    }
  }
}

export function transformTemplateCode(
  code: string,
  templateState: string,
): string {
  const parsed = meriyah.parseScript(code, { module: true }) as ESTree.Program;
  const tracker = new ScopeTracker();

  const exclude = [
    templateState,
    ...DEFAULT_EXCLUDES,
  ];

  if (parsed.type !== "Program") {
    throw new Error("Expected a program");
  }

  if (parsed.body.length === 0) {
    throw new Error("Empty program");
  }

  function transformIdentifier(
    id: ESTree.Identifier,
  ): ESTree.MemberExpression | ESTree.Identifier {
    if (
      (!INCLUDE_GLOBAL.includes(id.name) &&
        globalThis[id.name as keyof typeof globalThis] !== undefined) ||
      exclude.includes(id.name) ||
      tracker.includes(id.name) ||
      id.name.startsWith("__")
    ) {
      return id;
    }

    return {
      type: "MemberExpression",
      object: {
        type: "Identifier",
        name: templateState,
      },
      optional: false,
      computed: false,
      property: id,
    };
  }

  walker.walk(parsed, {
    enter(node) {
      switch (node.type) {
        case "VariableDeclaration":
          tracker.globalDeclaration = node.kind === "var";
          tracker.pushPatterns(node.declarations.map((d) => d.id));
          tracker.globalDeclaration = false;
          break;

        case "FunctionDeclaration":
        case "FunctionExpression":
          if (node.id) {
            tracker.pushBinding(node.id.name);
          }
          tracker.pushScope(true);
          tracker.pushPatterns(node.params);
          break;

        case "ArrowFunctionExpression":
          tracker.pushScope();
          tracker.pushPatterns(node.params);
          break;
      }
    },
    leave(node, parent) {
      switch (node.type) {
        case "FunctionDeclaration":
        case "FunctionExpression":
        case "ArrowFunctionExpression":
          tracker.popScope();
          break;

        case "Identifier":
          if (parent?.type === "MemberExpression" && parent.property === node) {
            return;
          }
          if (parent?.type === "Property" && parent.key === node) {
            return;
          }
          this.replace(transformIdentifier(node));
          break;
      }
    },
  });

  const generated = astring.generate(parsed);

  return generated;
}
