import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrationsRoot = path.join(root, "prisma", "migrations");
const schema = fs.readFileSync(path.join(root, "prisma", "schema.prisma"), "utf8");
const migrationNames = fs.readdirSync(migrationsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const tables = new Map();
const enums = new Map();
const errors = [];

function quotedNames(value) {
  return [...value.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function addError(migration, message) {
  errors.push(`${migration}: ${message}`);
}

for (const migration of migrationNames) {
  const sql = fs.readFileSync(path.join(migrationsRoot, migration, "migration.sql"), "utf8");
  const statements = sql
    .replace(/--[^\r\n]*/g, "")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    const createType = statement.match(/^CREATE\s+TYPE\s+"([^"]+)"\s+AS\s+ENUM\s*\((.*)\)$/is);
    if (createType) {
      const [, name, body] = createType;
      if (enums.has(name)) addError(migration, `enum ${name} is created more than once`);
      enums.set(name, new Set([...body.matchAll(/'([^']+)'/g)].map((match) => match[1])));
      continue;
    }

    const alterType = statement.match(/^ALTER\s+TYPE\s+"([^"]+)"\s+ADD\s+VALUE(?:\s+IF\s+NOT\s+EXISTS)?\s+'([^']+)'/is);
    if (alterType) {
      const [, name, value] = alterType;
      if (!enums.has(name)) addError(migration, `enum ${name} is altered before it is created`);
      else if (enums.get(name).has(value)) addError(migration, `enum ${name} value ${value} is added more than once`);
      else enums.get(name).add(value);
      continue;
    }

    const createTable = statement.match(/^CREATE\s+TABLE\s+"([^"]+)"\s*\((.*)\)$/is);
    if (createTable) {
      const [, name, body] = createTable;
      if (tables.has(name)) addError(migration, `table ${name} is created more than once`);
      const columns = new Set();
      for (const part of body.split(",")) {
        const column = part.match(/^\s*"([^"]+)"\s+/s);
        if (column) columns.add(column[1]);
      }
      tables.set(name, columns);
      continue;
    }

    const alterTable = statement.match(/^ALTER\s+TABLE\s+"([^"]+)"\s+(.*)$/is);
    if (alterTable) {
      const [, table, operations] = alterTable;
      if (!tables.has(table)) {
        addError(migration, `table ${table} is altered before it is created`);
        continue;
      }
      for (const match of operations.matchAll(/ADD\s+COLUMN\s+"([^"]+)"/gis)) {
        if (tables.get(table).has(match[1])) addError(migration, `column ${table}.${match[1]} is added more than once`);
        tables.get(table).add(match[1]);
      }
      for (const match of operations.matchAll(/FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+"([^"]+)"\s*\(([^)]+)\)/gis)) {
        const sourceColumns = quotedNames(match[1]);
        const targetTable = match[2];
        const targetColumns = quotedNames(match[3]);
        for (const column of sourceColumns) if (!tables.get(table).has(column)) addError(migration, `foreign key references missing source column ${table}.${column}`);
        if (!tables.has(targetTable)) addError(migration, `foreign key references table ${targetTable} before it is created`);
        else for (const column of targetColumns) if (!tables.get(targetTable).has(column)) addError(migration, `foreign key references missing target column ${targetTable}.${column}`);
      }
      const check = operations.match(/\bCHECK\s*\((.*)\)$/is);
      if (check) {
        for (const identifier of quotedNames(check[1])) {
          if (!tables.get(table).has(identifier)) addError(migration, `check constraint references missing column ${table}.${identifier}`);
        }
      }
      continue;
    }

    const createIndex = statement.match(/^CREATE\s+(?:UNIQUE\s+)?INDEX\s+"[^"]+"\s+ON\s+"([^"]+)"\s*\((.*)\)$/is);
    if (createIndex) {
      const [, table, expression] = createIndex;
      if (!tables.has(table)) addError(migration, `index references table ${table} before it is created`);
      else for (const column of quotedNames(expression)) if (!tables.get(table).has(column)) addError(migration, `index references missing column ${table}.${column}`);
    }
  }
}

const schemaModels = new Set([...schema.matchAll(/^model\s+(\w+)\s*\{/gm)].map((match) => match[1]));
const schemaEnums = new Set([...schema.matchAll(/^enum\s+(\w+)\s*\{/gm)].map((match) => match[1]));
for (const model of schemaModels) if (!tables.has(model)) addError("final", `schema model ${model} has no migration table`);
for (const table of tables.keys()) if (!schemaModels.has(table)) addError("final", `migration table ${table} has no schema model`);
for (const name of schemaEnums) if (!enums.has(name)) addError("final", `schema enum ${name} has no migration enum`);
for (const name of enums.keys()) if (!schemaEnums.has(name)) addError("final", `migration enum ${name} has no schema enum`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Migration chain valid: ${migrationNames.length} migrations, ${tables.size} tables, ${enums.size} enums.`);
}
