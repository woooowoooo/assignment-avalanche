import {context, colors, images, sounds, stateMachines, objects, settings, Drawable} from "./index.js";
// Constants
// State variables
const heldKeys = new Set();
let changed = true;
// Time variables
let startTime = 0;
let time = 0;
let fps = 0;
// Game and level management
function drawDebugText() {
	changed = true;
	context.fillStyle = colors.text;
	context.font = "30px monospace";
	const texts = {
		Center: `${character.center.x.toFixed(4)}, ${character.center.y.toFixed(4)}`,
		Speed: `${character.speed.x.toFixed(2)}, ${character.speed.y.toFixed(2)}`,
		Contacts: `${collisionCheck().some(Boolean) ? "T" : "F"}: ${collisionCheck().map((value) => value ? "T" : "F")}`,
		FPS: `${fps.toFixed(2)}`,
		Time: `${(time / 1000).toFixed(3)} seconds`
	};
	let textY = DEBUG_Y - (Object.keys(texts).length - 1) * DEBUG_LINE_HEIGHT;
	for (const [key, value] of Object.entries(texts)) {
		context.textAlign = "right";
		context.fillText(`${key}: `, DEBUG_X, textY);
		context.textAlign = "left";
		context.fillText(value, DEBUG_X, textY);
		textY += DEBUG_LINE_HEIGHT;
	}
}
export function newGame() {
	heldKeys.clear();
	changed = true;
	// Time
	startTime = window.performance.now();
	time = 0;
	fps = 0;
	// Add objects
	// objects.set("background", new Drawable(() => context.drawImage(images[`level${levelNumber}`], 0, 0, 1920, 1280))); // Replaces placeholder background
	if (settings.debug) {
		objects.set("debug", new Drawable(drawDebugText));
	}
}
function endGame(win) {
	if (!win) {
		stateMachines.main.lose("Exited");
		return;
	}
	stateMachines.main.lose({Time: `${time / 1000} seconds`});
}
// Game loop
export function onKeyDown(e) {
	if (!heldKeys.has(e.key)) { // Prevent held key spam
		heldKeys.add(e.key);
		handle(e);
	}
}
export function onKeyUp(e) {
	heldKeys.delete(e.key);
}
export function handle({key}) {
	if (key === "Escape") {
		heldKeys.clear();
		endGame();
	} else if (key === "r" || key === "R") {
		newLevel(levelNumber);
	} else if (key === "ArrowUp") {
		if (collisionCheck().some(Boolean)) {
			character.speed.y -= JUMP_SPEED;
		}
	}
}
function handleHeld(deltaTime) {
	if (heldKeys.has("ArrowLeft") !== heldKeys.has("ArrowRight")) {
		const direction = heldKeys.has("ArrowLeft") ? -1 : 1;
		character.speed.x += direction * SPEED * deltaTime;
		if (Math.abs(character.speed.x) > MAX_SPEED) {
			character.speed.x = Math.sign(character.speed.x) * MAX_SPEED;
		}
	}
}
export function update(deltaTime) {
	time = window.performance.now() - startTime;
	fps = 1 / deltaTime;
	// Handle held keys
	handleHeld(deltaTime);
	return changed;
}
export function render() {
	changed = false;
}