"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const types_1 = require("./types");
const hugo_1 = require("./providers/hugo");
const storybook_1 = require("./providers/storybook");
const detector_1 = require("./utils/detector");
let currentProvider = null;
let lastOpenedFile;
let outputChannel;
async function openPreview(filePath) {
    const config = vscode.workspace.getConfiguration('previewInBrowser');
    const enabled = config.get('enabled');
    if (!enabled) {
        return;
    }
    if (!currentProvider) {
        outputChannel.appendLine('[Preview] No provider detected for this project');
        return;
    }
    // Check if this file should trigger preview
    if (!currentProvider.shouldPreview(filePath)) {
        return;
    }
    // Don't re-open if it's the same file
    if (lastOpenedFile === filePath) {
        return;
    }
    outputChannel.appendLine(`[${currentProvider.name}] Opening preview for: ${filePath}`);
    lastOpenedFile = filePath;
    // Ensure server is running
    const isRunning = await currentProvider.isServerRunning();
    if (!isRunning) {
        const started = await currentProvider.startServer();
        if (!started) {
            vscode.window.showInformationMessage(`Starting ${currentProvider.name} server...`);
            return;
        }
    }
    // Build URL
    const url = currentProvider.buildUrl(filePath);
    outputChannel.appendLine(`[${currentProvider.name}] Opening URL: ${url}`);
    // Open Simple Browser beside editor
    const activeEditor = vscode.window.activeTextEditor;
    await vscode.commands.executeCommand('simpleBrowser.show', url, {
        viewColumn: vscode.ViewColumn.Beside,
        preserveFocus: false
    });
    // Return focus to editor
    if (activeEditor) {
        await vscode.window.showTextDocument(activeEditor.document, {
            viewColumn: activeEditor.viewColumn,
            preserveFocus: false
        });
    }
    outputChannel.appendLine(`[${currentProvider.name}] Preview opened`);
}
async function activate(context) {
    outputChannel = vscode.window.createOutputChannel('Preview in Browser');
    outputChannel.appendLine('Preview in Browser extension activated');
    // Detect project type
    const projectType = await detector_1.ProjectDetector.detectProjectType();
    outputChannel.appendLine(`Detected project type: ${projectType}`);
    // Initialize appropriate provider
    switch (projectType) {
        case types_1.ProjectType.Hugo:
            currentProvider = new hugo_1.HugoProvider(outputChannel);
            break;
        case types_1.ProjectType.Storybook:
            currentProvider = new storybook_1.StorybookProvider(outputChannel);
            break;
        default:
            outputChannel.appendLine('No supported project detected. Extension will remain inactive.');
            return;
    }
    // Monitor editor changes
    const onChangeEditor = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (!editor) {
            return;
        }
        await openPreview(editor.document.uri.fsPath);
    });
    // Monitor document opens
    const onOpenDocument = vscode.workspace.onDidOpenTextDocument(async (document) => {
        await openPreview(document.uri.fsPath);
    });
    context.subscriptions.push(onChangeEditor, onOpenDocument);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map