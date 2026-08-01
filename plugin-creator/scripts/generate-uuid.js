#!/usr/bin/env node
/**
 * Plugin UUID Generator (Pure JS, zero dependencies)
 *
 * Generates a globally unique numeric ID using the generateUniqueId algorithm.
 * Used for plugin IDs: com.berrytrace.plugin.{namespace}-{uuid}
 *
 * Usage:
 *   node generate-uuid.js          → Output numeric ID
 *   node generate-uuid.js --json   → Output JSON format
 */

let counter = 1000;
const deviceId = Math.floor(Math.random() * (1 << 10)) & 0x3FF;

function generateUniqueId() {
  const timestamp = Date.now();
  // Retain low 20 bits of timestamp
  const timePart = timestamp & 0xFFFFF;

  // Static counter for duplicate timestamps
  counter = (counter + 1) & 0x3F;

  // Random part
  const randomPart = Math.floor(Math.random() * (1 << 10)) & 0x3FF;

  // Combine into 46-bit integer using multiplication to avoid 32-bit truncation
  const result =
    timePart * 67108864 + // 1 << 26
    deviceId * 65536 +    // 1 << 16
    counter * 1024 +      // 1 << 10
    randomPart;

  return result;
}

// Output plain numeric ID
const shortId = String(generateUniqueId());

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ uuid: shortId }));
} else {
  console.log(shortId);
}
