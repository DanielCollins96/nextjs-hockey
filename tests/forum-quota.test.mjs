import assert from "node:assert/strict";
import test from "node:test";
import { isUsageConflict, usageDayKey, usageSlotId } from "../lib/forum-quota-slots.js";

test("quota slots are deterministic per user, day, kind, and slot", () => {
  const day = "2026-09-27";
  assert.equal(
    usageSlotId("fan@example.com", "upload", 0, day),
    "usage#fan%40example.com#2026-09-27#upload#0"
  );
  assert.notEqual(
    usageSlotId("fan@example.com", "upload", 0, day),
    usageSlotId("fan@example.com", "upload", 1, day)
  );
  assert.equal(usageDayKey(new Date("2026-09-27T18:00:00.000Z")), "2026-09-27");
});

test("duplicate AppSync writes are treated as a taken quota slot", () => {
  assert.equal(isUsageConflict(new Error("The conditional request failed")), true);
  assert.equal(isUsageConflict({ message: "ConditionalCheckFailed" }), true);
  assert.equal(isUsageConflict(new Error("already exists")), true);
  assert.equal(isUsageConflict(new Error("Forum quota request failed.")), false);
});
