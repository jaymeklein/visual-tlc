import * as vscode from 'vscode';
import type { Severity } from '../core/types.ts';

export function openFileCommand(projectId: string, file: string, line?: number): vscode.Command {
  return { command: 'tlcSpecs.openFile', title: 'Abrir arquivo', arguments: [projectId, file, line] };
}

export function previewFileCommand(projectId: string, file: string): vscode.Command {
  return { command: 'tlcSpecs.previewFile', title: 'Visualizar', arguments: [projectId, file] };
}

export function issueIcon(severity: Severity): vscode.ThemeIcon {
  if (severity === 'error') return new vscode.ThemeIcon('error', new vscode.ThemeColor('list.errorForeground'));
  if (severity === 'warning') return new vscode.ThemeIcon('warning', new vscode.ThemeColor('list.warningForeground'));
  return new vscode.ThemeIcon('info');
}

/** Opens a markdown file in VS Code's Markdown preview (falls back to the text editor). */
export async function previewUri(uri: vscode.Uri): Promise<void> {
  try {
    await vscode.commands.executeCommand('markdown.showPreview', uri);
  } catch {
    await openUri(uri);
  }
}

/** Opens a file at a 1-based line, or reveals a directory in the Explorer. */
export async function openUri(uri: vscode.Uri, line?: number): Promise<void> {
  try {
    const stat = await vscode.workspace.fs.stat(uri);
    if (stat.type & vscode.FileType.Directory) {
      await vscode.commands.executeCommand('revealInExplorer', uri);
      return;
    }
  } catch {
    void vscode.window.showWarningMessage(`Arquivo não encontrado: ${vscode.workspace.asRelativePath(uri)}`);
    return;
  }
  const pos = new vscode.Position(Math.max(0, (line ?? 1) - 1), 0);
  await vscode.window.showTextDocument(uri, { selection: new vscode.Range(pos, pos), preview: true });
}
