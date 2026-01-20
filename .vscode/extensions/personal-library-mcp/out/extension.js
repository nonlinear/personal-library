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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
async function callPythonQuery(params) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        return JSON.stringify({ error: 'No workspace folder open' });
    }
    const pythonPath = '/opt/homebrew/bin/python3.11';
    const scriptPath = path.join(workspaceFolder.uri.fsPath, 'scripts', 'research.py');
    return new Promise((resolve) => {
        const args = [scriptPath, params.query];
        if (params.topic)
            args.push('--topic', params.topic);
        if (params.book)
            args.push('--book', params.book);
        if (params.k)
            args.push('--top-k', params.k.toString());
        const proc = (0, child_process_1.spawn)(pythonPath, args, {
            cwd: workspaceFolder.uri.fsPath
        });
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', (data) => stdout += data.toString());
        proc.stderr.on('data', (data) => stderr += data.toString());
        proc.on('close', (code) => {
            if (code === 0) {
                resolve(stdout);
            }
            else {
                resolve(JSON.stringify({ error: stderr || `Exit code ${code}` }));
            }
        });
        proc.on('error', (err) => {
            resolve(JSON.stringify({ error: err.message }));
        });
    });
}
function activate(context) {
    console.log('Personal Library extension activating...');
    // Register query_library tool
    const queryTool = vscode.lm.registerTool('query_library', {
        async prepareInvocation(options, _token) {
            const params = options.input;
            return {
                invocationMessage: `Searching library: "${params.query}"${params.topic ? ` in topic ${params.topic}` : ''}`
            };
        },
        async invoke(options, _token) {
            const params = options.input;
            const result = await callPythonQuery(params);
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(result)
            ]);
        }
    });
    // Register list_topics tool
    const topicsTool = vscode.lm.registerTool('list_topics', {
        async prepareInvocation(_options, _token) {
            return { invocationMessage: 'Listing available topics' };
        },
        async invoke(_options, _token) {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(JSON.stringify({ error: 'No workspace' }))
                ]);
            }
            const metadataPath = path.join(workspaceFolder.uri.fsPath, 'storage', 'metadata.json');
            try {
                const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                const topics = metadata.topics.map((t) => ({
                    id: t.id,
                    label: t.label,
                    description: t.description
                }));
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(JSON.stringify({ topics }))
                ]);
            }
            catch (err) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(JSON.stringify({ error: err.message }))
                ]);
            }
        }
    });
    // Register list_books tool
    const booksTool = vscode.lm.registerTool('list_books', {
        async prepareInvocation(options, _token) {
            const params = options.input;
            return {
                invocationMessage: params.topic ? `Listing books in ${params.topic}` : 'Listing all books'
            };
        },
        async invoke(options, _token) {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(JSON.stringify({ error: 'No workspace' }))
                ]);
            }
            const metadataPath = path.join(workspaceFolder.uri.fsPath, 'storage', 'metadata.json');
            const params = options.input;
            try {
                const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                let books = [];
                if (params.topic) {
                    const topic = metadata.topics.find((t) => t.id === params.topic || t.label.toLowerCase().includes(params.topic.toLowerCase()));
                    books = topic ? topic.books : [];
                }
                else {
                    books = metadata.topics.flatMap((t) => t.books);
                }
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(JSON.stringify({ books }))
                ]);
            }
            catch (err) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(JSON.stringify({ error: err.message }))
                ]);
            }
        }
    });
    context.subscriptions.push(queryTool, topicsTool, booksTool);
    console.log('✅ Personal Library tools registered');
}
function deactivate() {
    console.log('Personal Library extension deactivated');
}
//# sourceMappingURL=extension.js.map
