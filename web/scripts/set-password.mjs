/**
 * Sets the admin password.
 *
 *   npm run set-password
 *
 * Asks for the password, hashes it with bcrypt, and writes the hash into
 * .env.local. The password itself is never stored or printed — only the hash
 * goes to disk, which is the whole point: anyone who reads the env file still
 * cannot sign in.
 *
 * Input is hidden as you type, so the password does not end up in your
 * terminal scrollback or shell history.
 */
import bcrypt from "bcryptjs";
import { readFileSync, writeFileSync } from "node:fs";
import readline from "node:readline";

const ENV = new URL("../.env.local", import.meta.url);

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    // Swallow the echoed characters so nothing is displayed while typing.
    const onData = () => {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(question);
    };
    process.stdin.on("data", onData);
    rl.question(question, (answer) => {
      process.stdin.off("data", onData);
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const first = await askHidden("New admin password: ");
if (first.length < 10) {
  console.error(
    "\nToo short. Use at least 10 characters — this is the only credential\n" +
      "protecting the ability to publish on the site.",
  );
  process.exit(1);
}

const second = await askHidden("Repeat it: ");
if (first !== second) {
  console.error("\nThe two entries do not match. Nothing was changed.");
  process.exit(1);
}

const hash = bcrypt.hashSync(first, 12);

let env = "";
try {
  env = readFileSync(ENV, "utf8");
} catch {
  console.error(".env.local not found. Copy .env.example to .env.local first.");
  process.exit(1);
}

env = /^ADMIN_PASSWORD_HASH=.*$/m.test(env)
  ? env.replace(/^ADMIN_PASSWORD_HASH=.*$/m, `ADMIN_PASSWORD_HASH=${hash}`)
  : env.trimEnd() + `\nADMIN_PASSWORD_HASH=${hash}\n`;

writeFileSync(ENV, env, "utf8");

console.log("\nDone. .env.local updated.");
console.log("Restart the dev server, then sign in at /ar/admin");
console.log(
  "\nFor Vercel, add the SAME hash as the ADMIN_PASSWORD_HASH environment\n" +
    "variable there — not the password:\n\n  " +
    hash +
    "\n",
);
