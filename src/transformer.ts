import { astring, ESTree, meriyah, walker } from "../deps.ts";

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

  pushBinding(val: string, global?: boolean) {
    if (this.scopes.length === 0) {
      this.scopes.push({ globalScope: this.globalScope, stack: [] });
    }

    if (global) {
      this.scopes[this.globalScope].stack.push(val);
    } else {
      this.scopes[this.scopes.length - 1].stack.push(val);
    }
  }

  pushPatternBinding(pattern: ESTree.Pattern, global?: boolean) {
    switch (pattern.type) {
      case "Identifier":
        this.pushBinding(pattern.name, global);
        break;

      case "RestElement":
        this.pushPatternBinding(pattern.argument, global);
        break;

      case "ArrayPattern":
        for (const element of pattern.elements) {
          if (element) {
            this.pushPatternBinding(element, global);
          }
        }
        break;

      case "ObjectPattern":
        for (const prop of pattern.properties) {
          if (prop.type === "RestElement") {
            this.pushPatternBinding(prop.argument, global);
          } else {
            this.pushPatternBinding(prop.value, global);
          }
        }
        break;

      case "AssignmentPattern":
        this.pushPatternBinding(pattern.left, global);
        break;
    }
  }

  pushPatternBindings(patterns: ESTree.Pattern[], global?: boolean) {
    for (const pattern of patterns) {
      this.pushPatternBinding(pattern, global);
    }
  }
}

export function transformTemplateCode(
  code: string,
  templateState: string,
): string {
  if (!code.trim()) {
    return code;
  }

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

  // Transforms an identifier to a MemberExpression
  // if it's not in the exclude list
  //
  // Example:
  // Transforms {{ name }} to {{ id.name }}
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
        // Track variable declarations
        case "VariableDeclaration":
          // "var" declarations are scoped to the function/global scope.
          tracker.pushPatternBindings(
            node.declarations.map((d) => d.id),
            node.kind === "var",
          );
          break;

        // Track function declarations, and
        // function parameters.
        // Also track the scope.
        case "FunctionDeclaration":
        case "FunctionExpression":
          if (node.id) {
            tracker.pushBinding(node.id.name);
          }
          tracker.pushScope(true);
          tracker.pushPatternBindings(node.params);
          break;

        case "ArrowFunctionExpression":
          tracker.pushScope();
          tracker.pushPatternBindings(node.params);
          break;

        case "Property":
          if (node.shorthand && node.key.type === "Identifier") {
            this.replace({
              type: "Property",
              key: node.key,
              value: transformIdentifier(node.key),
              kind: "init",
              computed: false,
              method: false,
              shorthand: false,
            });
          }
          break;
      }
    },
    leave(node, parent) {
      switch (node.type) {
        // Pop the scope when leaving a function
        case "FunctionDeclaration":
        case "FunctionExpression":
        case "ArrowFunctionExpression":
          tracker.popScope();
          break;

        case "Identifier":
          // Don't transform identifiers that aren't at the start of a MemberExpression
          // ie. don't transform `bar` or `baz` in `foo.bar.baz`
          // MemberExpression nodes can also take on a computed property
          // which means it is an array-like access, so we do transform those.
          if (
            parent?.type === "MemberExpression" && parent.property === node &&
            parent.computed === false
          ) {
            return;
          }

          // Don't transform identifiers that are keys in an object
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
