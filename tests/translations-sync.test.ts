import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

type JsonObject = {
  [key: string]: JsonValue;
};

type Mismatch = {
  message: string;
};

const messagesDirectory = path.resolve(process.cwd(), "messages");

function isPlainObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getValueType(value: JsonValue | undefined) {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

function collectMessageFiles() {
  return readdirSync(messagesDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();
}

function readMessages(fileName: string): JsonObject {
  return JSON.parse(
    readFileSync(path.join(messagesDirectory, fileName), "utf8"),
  ) as JsonObject;
}

function compareObjects(
  reference: JsonObject,
  candidate: JsonObject,
  referenceFile: string,
  candidateFile: string,
  currentPath = "",
): Mismatch[] {
  const mismatches: Mismatch[] = [];
  const keys = Array.from(
    new Set([...Object.keys(reference), ...Object.keys(candidate)]),
  ).sort();

  for (const key of keys) {
    const nextPath = currentPath ? `${currentPath}.${key}` : key;
    const referenceValue = reference[key];
    const candidateValue = candidate[key];

    if (!(key in candidate)) {
      mismatches.push({
        message: `${candidateFile} is missing ${nextPath} present in ${referenceFile}`,
      });
      continue;
    }

    if (!(key in reference)) {
      mismatches.push({
        message: `${candidateFile} has extra key ${nextPath} not present in ${referenceFile}`,
      });
      continue;
    }

    const referenceIsObject = isPlainObject(referenceValue);
    const candidateIsObject = isPlainObject(candidateValue);

    if (referenceIsObject && candidateIsObject) {
      mismatches.push(
        ...compareObjects(
          referenceValue,
          candidateValue,
          referenceFile,
          candidateFile,
          nextPath,
        ),
      );
      continue;
    }

    const referenceType = getValueType(referenceValue);
    const candidateType = getValueType(candidateValue);

    if (referenceType !== candidateType) {
      mismatches.push({
        message:
          `${candidateFile} has type ${candidateType} at ${nextPath}, ` +
          `expected ${referenceType} to match ${referenceFile}`,
      });
    }
  }

  return mismatches;
}

describe("translation catalogs", () => {
  it("stay in sync across locales", () => {
    const messageFiles = collectMessageFiles();

    expect(messageFiles.length).toBeGreaterThan(1);

    const [referenceFile, ...candidateFiles] = messageFiles;
    const referenceMessages = readMessages(referenceFile);
    const mismatches = candidateFiles.flatMap((candidateFile) =>
      compareObjects(
        referenceMessages,
        readMessages(candidateFile),
        referenceFile,
        candidateFile,
      ),
    );

    expect(
      mismatches,
      mismatches.length === 0
        ? undefined
        : `Translation catalogs are out of sync:\n${mismatches
            .map((mismatch) => `- ${mismatch.message}`)
            .join("\n")}`,
    ).toEqual([]);
  });
});
