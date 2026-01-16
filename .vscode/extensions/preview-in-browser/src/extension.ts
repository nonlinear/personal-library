import * as vscode from 'vscode';
import { PreviewProvider, ProjectType } from './types';
import { HugoProvider } from './providers/hugo';
import { StorybookProvider } from './providers/storybook';
import { ProjectDetector } from './utils/detector';

let currentProvider: PreviewProvider | null = null;
let lastOpenedFile: string | undefined;
let outputChannel: vscode.OutputChannel;

async function openPreview(filePath: string) {
    const config = vscode.workspace.getConfiguration('previewInBrowser');
    const enabled = config.get<boolean>('enabled');

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

export async function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Preview in Browser');
    outputChannel.appendLine('Preview in Browser extension activated');

    // Detect project type
    const projectType = await ProjectDetector.detectProjectType();
    outputChannel.appendLine(`Detected project type: ${projectType}`);

    // Initialize appropriate provider
    switch (projectType) {
        case ProjectType.Hugo:
            currentProvider = new HugoProvider(outputChannel);
            break;
        case ProjectType.Storybook:
            currentProvider = new StorybookProvider(outputChannel);
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

export function deactivate() { }
