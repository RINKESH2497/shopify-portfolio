const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const repoRoot = path.resolve(__dirname, '../../..');
const testsDir = path.join(repoRoot, 'tests');

function getAllFiles(dir, exts = ['.js', '.ts']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else if (exts.some(ext => file.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

const allTestFiles = getAllFiles(testsDir);
console.log(`Auditing ${allTestFiles.length} files via expanded TypeScript AST...`);

const reports = [];

for (const filePath of allTestFiles) {
  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS
  );

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      let isTest = false;
      let testName = '';
      if (ts.isIdentifier(expr) && (expr.text === 'it' || expr.text === 'test')) {
        isTest = true;
      }

      if (isTest) {
        if (node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
          testName = node.arguments[0].text;
        }

        const fnArg = node.arguments[1];
        if (!fnArg) return;

        // Check local variable declarations in test function
        const declaredConstants = new Map();
        function findVarDecls(n) {
          if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
            declaredConstants.set(n.name.text, n.initializer.getText(sourceFile));
          }
          ts.forEachChild(n, findVarDecls);
        }
        findVarDecls(fnArg);

        let expectCalls = [];
        function findExpects(inner) {
          if (ts.isCallExpression(inner)) {
            if (ts.isIdentifier(inner.expression) && inner.expression.text === 'expect') {
              expectCalls.push(inner);
            }
          }
          ts.forEachChild(inner, findExpects);
        }
        findExpects(fnArg);

        for (const exp of expectCalls) {
          const parent = exp.parent;
          let matcherName = 'unknown';
          let matcherArg = null;
          let fullCallText = exp.getText(sourceFile);

          if (parent && ts.isPropertyAccessExpression(parent)) {
            matcherName = parent.name.text;
            if (parent.parent && ts.isCallExpression(parent.parent)) {
              fullCallText = parent.parent.getText(sourceFile);
              if (parent.parent.arguments.length > 0) {
                matcherArg = parent.parent.arguments[0].getText(sourceFile);
              }
            }
          }

          const arg0 = exp.arguments[0];
          const arg0Text = arg0 ? arg0.getText(sourceFile) : '';

          // 1. Literal argument
          if (arg0 && (
            arg0.kind === ts.SyntaxKind.TrueKeyword ||
            arg0.kind === ts.SyntaxKind.FalseKeyword ||
            arg0.kind === ts.SyntaxKind.NumericLiteral ||
            arg0.kind === ts.SyntaxKind.StringLiteral
          )) {
            reports.push({
              type: 'LITERAL_ASSERTION',
              file: relPath,
              testName,
              line: sourceFile.getLineAndCharacterOfPosition(exp.getStart()).line + 1,
              call: fullCallText
            });
          }

          // 2. Constant assigned true/false/number directly tested against itself
          if (declaredConstants.has(arg0Text)) {
            const initVal = declaredConstants.get(arg0Text);
            if ((initVal === 'true' || initVal === 'false' || /^\d+$/.test(initVal)) &&
                (matcherName === 'toBe' || matcherName === 'toEqual' || matcherName === 'toBeTruthy')) {
              reports.push({
                type: 'LOCAL_CONSTANT_TRIVIAL_ASSERTION',
                file: relPath,
                testName,
                line: sourceFile.getLineAndCharacterOfPosition(exp.getStart()).line + 1,
                call: fullCallText,
                varName: arg0Text,
                initVal
              });
            }
          }

          // 3. Trivial comparison expression inside expect: expect(a === a), expect(1 < 2)
          if (arg0 && ts.isBinaryExpression(arg0)) {
            const left = arg0.left.getText(sourceFile);
            const right = arg0.right.getText(sourceFile);
            if (left === right) {
              reports.push({
                type: 'TAUTOLOGICAL_BINARY_EXPR',
                file: relPath,
                testName,
                line: sourceFile.getLineAndCharacterOfPosition(exp.getStart()).line + 1,
                call: fullCallText
              });
            }
          }

          // 4. Checking toBeTruthy / toBeFalsy on boolean literals or trivial items
          if ((matcherName === 'toBeTruthy' || matcherName === 'toBeFalsy') &&
              (arg0Text === 'true' || arg0Text === 'false' || arg0Text === '1' || arg0Text === '0')) {
            reports.push({
              type: 'TRIVIAL_TRUTHY_FALSY',
              file: relPath,
              testName,
              line: sourceFile.getLineAndCharacterOfPosition(exp.getStart()).line + 1,
              call: fullCallText
            });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

console.log(`Found ${reports.length} reportable items:`);
console.log(JSON.stringify(reports, null, 2));
