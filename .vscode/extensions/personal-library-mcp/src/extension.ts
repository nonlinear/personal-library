import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

interface QueryParams {
    query: string;
    topic?: string;
    book?: string;
    k?: number;
}

interface TopicParams {
    topic?: string;
}

async function callPythonQuery(params: QueryParams): Promise<string> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        return JSON.stringify({ error: 'No workspace folder open' });
    }

    const config = vscode.workspace.getConfiguration('personalLibrary');
    const pythonPath = config.get<string>('pythonPath', 'python3');
    const scriptPath = path.join(workspaceFolder.uri.fsPath, 'scripts', 'research.py');

    return new Promise((resolve) => {
        const args = [scriptPath, params.query];
        if (params.topic) args.push('--topic', params.topic);
        if (params.book) args.push('--book', params.book);
        if (params.k) args.push('--top-k', params.k.toString());

        const proc = spawn(pythonPath, args, {
            cwd: workspaceFolder.uri.fsPath
        });

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => stdout += data.toString());
        proc.stderr.on('data', (data) => stderr += data.toString());

        proc.on('close', (code) => {
            if (code === 0) {
                resolve(stdout);
            } else {
                resolve(JSON.stringify({ error: stderr || `Exit code ${code}` }));
            }
        });

        proc.on('error', (err) => {
            resolve(JSON.stringify({ error: err.message }));
        });
    });
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Personal Library extension activating...');

    // Register query_library tool
    const queryTool = vscode.lm.registerTool('query_library', {
        async prepareInvocation(options, _token) {
            const params = options.input as QueryParams;
            return {
                invocationMessage: `Searching library: "${params.query}"${params.topic ? ` in topic ${params.topic}` : ''}`
            };
        },
        async invoke(options, _token) {
            const params = options.input as QueryParams;
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

            const config = vscode.workspace.getConfiguration('personalLibrary');
            const booksPath = config.get<string>('booksPath', 'books');
            const metadataPath = path.isAbsolute(booksPath)
                ? path.join(booksPath, 'metadata.json')
                : path.join(workspaceFolder.uri.fsPath, booksPath, 'metadata.json');
            try {
                const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                const topics = metadata.topics.map((t: any) => ({
                    id: t.id,
                    label: t.label,
                    description: t.description
                }));

                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(JSON.stringify({ topics }))
                ]);
            } catch (err: any) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(JSON.stringify({ error: err.message }))
                ]);
            }
        }
    });

    // Register list_books tool
    const booksTool = vscode.lm.registerTool('list_books', {
        async prepareInvocation(options, _token) {
            const params = options.input as TopicParams;
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

            const config = vscode.workspace.getConfiguration('personalLibrary');
            const booksPath = config.get<string>('booksPath', 'books');
            const metadataPath = path.isAbsolute(booksPath)
                ? path.join(booksPath, 'metadata.json')
                : path.join(workspaceFolder.uri.fsPath, booksPath, 'metadata.json');
            const params = options.input as TopicParams;

            try {
                const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

                let books: any[] = [];
                if (params.topic) {
                    const topic = metadata.topics.find((t: any) =>
                        t.id === params.topic || t.label.toLowerCase().includes(params.topic!.toLowerCase())
                    );
                    books = topic ? topic.books : [];
                } else {
                    books = metadata.topics.flatMap((t: any) => t.books);
                }

                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(JSON.stringify({ books }))
                ]);
            } catch (err: any) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(JSON.stringify({ error: err.message }))
                ]);
            }
        }
    });

    context.subscriptions.push(queryTool, topicsTool, booksTool);
    console.log('✅ Personal Library tools registered');
}

export function deactivate() {
    console.log('Personal Library extension deactivated');
}
