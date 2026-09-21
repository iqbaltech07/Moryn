"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommand = validateCommand;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function validateCommand(options) {
    try {
        const workspaceRoot = process.cwd();
        let configPath = path.join(workspaceRoot, ".moryn", "config.json");
        if (!fs.existsSync(configPath)) {
            configPath = path.join(workspaceRoot, ".piardify", "config.json");
        }
        let target = options.target || "web";
        if (fs.existsSync(configPath)) {
            try {
                const cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
                if (cfg.target)
                    target = cfg.target;
            }
            catch { }
        }
        const issues = [];
        const targetExtensions = target === "mobile"
            ? [".dart", ".tsx", ".jsx", ".ts"]
            : target === "iot"
                ? [".cpp", ".h", ".c", ".ino"]
                : target === "backend"
                    ? [".ts", ".js", ".go", ".py"]
                    : [".tsx", ".jsx", ".vue", ".ts"];
        const searchDirs = ["src", "app", "components", "lib", "pages", "ui", "mobile", "hardware"];
        const filesToScan = [];
        function scanDirectory(dir) {
            if (!fs.existsSync(dir))
                return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git" && entry.name !== "dist") {
                        scanDirectory(fullPath);
                    }
                }
                else if (entry.isFile()) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (targetExtensions.includes(ext)) {
                        filesToScan.push(fullPath);
                    }
                }
            }
        }
        for (const dirName of searchDirs) {
            scanDirectory(path.join(workspaceRoot, dirName));
        }
        // Also scan root level if TSX/JSX
        const rootFiles = fs.readdirSync(workspaceRoot, { withFileTypes: true });
        for (const file of rootFiles) {
            if (file.isFile() && targetExtensions.includes(path.extname(file.name).toLowerCase())) {
                filesToScan.push(path.join(workspaceRoot, file.name));
            }
        }
        for (const filePath of filesToScan) {
            const relPath = path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
            const content = fs.readFileSync(filePath, "utf-8");
            const lines = content.split("\n");
            let cardDepth = 0;
            for (let i = 0; i < lines.length; i++) {
                const lineContent = lines[i];
                const lineNum = i + 1;
                if (lineContent.includes("// moryn-allow") || lineContent.includes("// piardify-allow") || relPath.includes("tasteSkill") || relPath.includes("contextSerializer"))
                    continue;
                // 1. Check Gradient Text on Headline
                if (/<h[1-6]/i.test(lineContent) || /className=.*text-(2xl|3xl|4xl|5xl|6xl)/i.test(lineContent)) {
                    if (lineContent.includes("bg-gradient-") || (lineContent.includes("text-transparent") && lineContent.includes("bg-clip-text"))) {
                        issues.push({
                            type: "error",
                            code: "GRADIENT_HEADLINE",
                            message: "Detected Gradient Text on Headline Keyword",
                            file: relPath,
                            line: lineNum,
                            advice: "Use solid high-contrast typography with explicit letter-spacing (tracking-tight) for high-end aesthetics.",
                        });
                    }
                }
                // 2. Over-nested Cards Check (>2 levels)
                if (/<Card\b/i.test(lineContent) || (lineContent.includes("className=") && lineContent.includes("border") && lineContent.includes("rounded"))) {
                    cardDepth++;
                    if (cardDepth > 2) {
                        issues.push({
                            type: "error",
                            code: "OVER_NESTED_CARDS",
                            message: "Over-nested Card structure detected (>2 levels deep)",
                            file: relPath,
                            line: lineNum,
                            advice: "Replace nested border containers with clean whitespace (space-y-8) or surface background separation (#090A0C vs #121318).",
                        });
                    }
                }
                if (/<\/Card>/i.test(lineContent) || (lineContent.includes("</div>") && cardDepth > 0)) {
                    if (cardDepth > 0)
                        cardDepth--;
                }
                // 3. Forbidden Slop Classes
                const forbiddenSlopClasses = [
                    "bg-slate-900", "text-blue-500", "bg-purple-900", "bg-purple-950",
                    "shadow-purple-500", "shadow-blue-500", "bg-[#000000]", "bg-black"
                ];
                for (const cls of forbiddenSlopClasses) {
                    if (lineContent.includes(cls) && !relPath.includes("tailwind.config")) {
                        issues.push({
                            type: "error",
                            code: "FORBIDDEN_SLOP_CLASS",
                            message: `Forbidden Slop Class '${cls}' detected`,
                            file: relPath,
                            line: lineNum,
                            advice: "Use Moryn Obsidian Surface (#090A0C, #121318) or semantic token classes (bg-moryn-dark) instead of generic slop colors.",
                        });
                    }
                }
                // 4. Headline Biscuit Pills with Pulsing Dots
                if (lineContent.includes("rounded-full") && lineContent.includes("animate-pulse")) {
                    issues.push({
                        type: "error",
                        code: "HEADLINE_BISCUIT_PILL",
                        message: "Headline Biscuit/Pill Badge with Pulsing Dot detected",
                        file: relPath,
                        line: lineNum,
                        advice: "Remove decorative pulsing dots and badges from non-Hero sections.",
                    });
                }
                // 4b. Excessive Pill Badges on Non-Status Elements
                if (lineContent.includes("rounded-full") && (/<h[1-6]/i.test(lineContent) || /className=.*text-(lg|xl|2xl|3xl)/i.test(lineContent) || lineContent.includes("Category") || lineContent.includes("Feature"))) {
                    if (!lineContent.includes("status") && !lineContent.includes("badge-status") && !lineContent.includes("avatar") && !lineContent.includes("isStreaming")) {
                        issues.push({
                            type: "error",
                            code: "EXCESSIVE_PILL_BADGES",
                            message: "Misplaced / Excessive Pill Badge ('rounded-full') detected on non-status label",
                            file: relPath,
                            line: lineNum,
                            advice: "Reserve 'rounded-full' exclusively for real dynamic status tags (e.g. Active, Beta). Use crisp typography with tracking-widest font-mono for section labels.",
                        });
                    }
                }
                // 4c. Forbidden Sparkles & Shimmer Slop
                if ((lineContent.includes("Sparkles") || lineContent.includes("Wand2") || lineContent.includes("animate-shimmer")) && !relPath.includes("generate") && !relPath.includes("prompt") && !relPath.includes("ai/")) {
                    issues.push({
                        type: "error",
                        code: "FORBIDDEN_SPARKLES_SHIMMER_SLOP",
                        message: "Cliché AI Sparkles icon or shimmer animation detected on generic UI container",
                        file: relPath,
                        line: lineNum,
                        advice: "Remove decorative Sparkles/Wand icons and shimmer effects. Rely on clean material surface layers, crisp typography, and tactile spring hover states.",
                    });
                }
                // 4d. Side-Tab Accent Border Slop
                if (/border-[lrtb]-4\s+border-(purple|blue|indigo)-/i.test(lineContent)) {
                    issues.push({
                        type: "error",
                        code: "SIDE_TAB_ACCENT_BORDER",
                        message: "1-Sided Thick Accent Border detected on card container",
                        file: relPath,
                        line: lineNum,
                        advice: "Avoid 1-sided thick accent borders. Use uniform subtle borders (border border-border) with surface background contrast instead.",
                    });
                }
                // 4e. Cliché Purple-Blue-Cyan Gradient Slop
                if (/from-purple-.*(to-blue-|to-cyan-|via-blue-)/i.test(lineContent) || /from-violet-.*to-cyan-/i.test(lineContent)) {
                    issues.push({
                        type: "error",
                        code: "PURPLE_BLUE_GRADIENT_SLOP",
                        message: "Cliché Purple-Blue-Cyan Neon Gradient detected",
                        file: relPath,
                        line: lineNum,
                        advice: "Avoid cliché purple-blue-cyan neon gradients. Use rich obsidian dark surfaces with single-color accents.",
                    });
                }
                // 5. Fixed 'h-screen' Viewport Bug
                if (/\bh-screen\b/.test(lineContent) && !lineContent.includes("min-h-screen") && !lineContent.includes("100dvh")) {
                    issues.push({
                        type: "error",
                        code: "H_SCREEN_VIEWPORT_BUG",
                        message: "Fixed 'h-screen' viewport class detected",
                        file: relPath,
                        line: lineNum,
                        advice: "Use 'min-h-[100dvh]' or 'min-h-screen' to prevent mobile Safari/Chrome navbar cropping.",
                    });
                }
                // 6. Hardcoded Unformatted Large Currency Numbers (IDR >= 1.000.000)
                if (/Rp\s*\d{7,}/i.test(lineContent) || /Rp\.\s*\d{7,}/i.test(lineContent)) {
                    issues.push({
                        type: "warning",
                        code: "UNFORMATTED_CURRENCY",
                        message: "Unformatted large monetary number detected",
                        file: relPath,
                        line: lineNum,
                        advice: "Use compact IDR formatting (e.g. Rp 15 Jt / Rp 1,5 M) to prevent UI card overflow.",
                    });
                }
                // 7. Icon Container Syndrome Check
                if (/p-[23]\s+rounded-(xl|2xl)\s+bg-/i.test(lineContent) && (lineContent.includes("border-purple") || lineContent.includes("bg-purple") || lineContent.includes("bg-blue"))) {
                    issues.push({
                        type: "warning",
                        code: "ICON_CONTAINER_SYNDROME",
                        message: "Icon Container Syndrome detected (wrapping icon in colored box above card title)",
                        file: relPath,
                        line: lineNum,
                        advice: "Let icons stand naturally inline alongside typography, or integrate directly into button actions.",
                    });
                }
                // 8. Indiscriminate Rounded-2xl Overuse on Small Controls
                if (/<(button|input|select)\b/i.test(lineContent) && lineContent.includes("rounded-2xl")) {
                    issues.push({
                        type: "warning",
                        code: "INDISCRIMINATE_ROUNDED_2XL",
                        message: "Indiscriminate 'rounded-2xl' detected on small form control/button",
                        file: relPath,
                        line: lineNum,
                        advice: "Use intentional radius hierarchy: sharp (0-4px) for data/tables, subtle (4-8px) for forms/buttons, pill (9999px) ONLY for status tags.",
                    });
                }
                // 9. Slow Motion & Latency Animation (>= 800ms)
                if (/duration-(800|1000|700)/.test(lineContent) || lineContent.includes("duration-[800ms]")) {
                    issues.push({
                        type: "warning",
                        code: "SLOW_MOTION_LATENCY",
                        message: "Slow motion transition (>=800ms) detected",
                        file: relPath,
                        line: lineNum,
                        advice: "Keep micro-interaction transitions tactile and fast (150ms - 250ms with spring physics).",
                    });
                }
                // 10. IoT Specific Rules
                if (target === "iot" && lineContent.includes("delay(") && !lineContent.includes("// moryn-allow") && !lineContent.includes("// piardify-allow")) {
                    issues.push({
                        type: "error",
                        code: "IOT_BLOCKING_DELAY",
                        message: "Blocking delay() call detected in IoT firmware",
                        file: relPath,
                        line: lineNum,
                        advice: "Use non-blocking millis() timer loops to avoid starving watchdog/WiFi tasks.",
                    });
                }
                // 11. Backend Specific Rules
                if (target === "backend" && (lineContent.includes("async ") || lineContent.includes("export async function")) && !lineContent.includes("try {")) {
                    issues.push({
                        type: "warning",
                        code: "BACKEND_UNHANDLED_ASYNC",
                        message: "Async route handler without try/catch wrapper detected",
                        file: relPath,
                        line: lineNum,
                        advice: "Wrap async handlers in try/catch and return standardized JSON error schemas.",
                    });
                }
            }
        }
        // 17. Orphaned / Unused Component Check
        const importOccurrences = new Set();
        for (const filePath of filesToScan) {
            const fc = fs.readFileSync(filePath, "utf-8");
            const importRegex = /(?:import\s+(?:[\s\S]*?from\s+)?|require\s*\(\s*)["']([^"']+)["']/g;
            let m;
            while ((m = importRegex.exec(fc)) !== null) {
                importOccurrences.add(path.basename(m[1], path.extname(m[1])));
            }
        }
        for (const filePath of filesToScan) {
            const relPath = path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
            const baseName = path.basename(filePath, path.extname(filePath));
            const isComponent = (relPath.includes("components/") || relPath.includes("ui/")) && !relPath.includes("components/ui/");
            const isPageOrLayout = relPath.includes("page.") || relPath.includes("layout.") || relPath.includes("route.") || relPath.includes("globals.");
            if (isComponent && !isPageOrLayout && !importOccurrences.has(baseName)) {
                issues.push({
                    type: "warning",
                    code: "ORPHANED_UNUSED_COMPONENT",
                    message: `Component '${baseName}' is declared but never imported anywhere in the project`,
                    file: relPath,
                    line: 1,
                    advice: "Run 'npx moryn clean' or delete this unused component to keep the codebase lean and clean.",
                });
            }
        }
        const errorCount = issues.filter((i) => i.type === "error").length;
        const warningCount = issues.filter((i) => i.type === "warning").length;
        if (options.json) {
            console.log(JSON.stringify({
                success: errorCount === 0,
                target,
                scannedFiles: filesToScan.length,
                errorCount,
                warningCount,
                issues,
            }));
        }
        else {
            console.log("\n==========================================");
            console.log(`  Moryn UI/UX Anti-Slop Linter v2.13.0`);
            console.log(`  Target Domain: ${target.toUpperCase()}`);
            console.log(`  Scanned Files: ${filesToScan.length}`);
            console.log("==========================================\n");
            if (issues.length === 0) {
                console.log("  ✅ SUCCESS: Zero Anti-Slop violations detected. UI is 100% Moryn compliant!\n");
            }
            else {
                for (const issue of issues) {
                    const prefix = issue.type === "error" ? "❌ ERROR:" : "⚠️ WARNING:";
                    console.log(`${prefix} [${issue.code}] ${issue.message}`);
                    console.log(`   File  : ${issue.file}:${issue.line}`);
                    console.log(`   Advice: ${issue.advice}\n`);
                }
                console.log("------------------------------------------");
                console.log(`Summary: ${errorCount} Error(s), ${warningCount} Warning(s) found.\n`);
            }
        }
        if (errorCount > 0) {
            process.exit(1);
        }
    }
    catch (err) {
        if (options.json) {
            console.log(JSON.stringify({ success: false, error: err.message }));
        }
        else {
            console.error(`\n[ERROR] Validation failed: ${err.message}\n`);
        }
        process.exit(1);
    }
}
