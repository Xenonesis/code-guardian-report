//function runScript(scriptname, workspaceRoot):
//path to script
import * as vscode from 'vscode';
import {exec} from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
function runScript(scriptName: string, workspaceRoot: string){
    const scriptPath =path.join(workspaceRoot, 'scripts', scriptName);

    if(!fs.existsSync(scriptPath)) {
        vscode.window.showErrorMessage(`Script not found: ${scriptName}`);
        return;
    }
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Running ${scriptName}...`,
        cancellable: false
    }, (progress) => {
        return new Promise<void>((resolve)=>{
            exec(`node "${scriptPath}"`, {cwd: workspaceRoot }, (err, stdout, stderr) =>{
                if (err) {
                    vscode.window.showErrorMessage(`Error running ${scriptName}: ${stderr}`);
                } else{
                    vscode.window.showInformationMessage(`${scriptName} completed successfully!`);
                    console.log(stdout);
                }
                resolve();
            });
        });
    });
}
export function activate(context: vscode.ExtensionContext) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

    if(!workspaceRoot){
        vscode.window.showErrorMessage('Open a workspace folder first!');
        return;
    }
    const updateCmd = vscode.commands.registerCommand('extension.runUpdateContributors', ()=>{
        runScript('update-contributors.js', workspaceRoot);
    });
    const setupHooksCmd = vscode.commands.registerCommand('extension.setupGitHooks', ()=>{
        runScript('setup-git-hooks.js', workspaceRoot);
    });
    const testAutomationCmd = vscode.commands.registerCommand('extension.runTestAutomation', ()=>{
        runScript('test-automation.js', workspaceRoot);
    });
    context.subscriptions.push(updateCmd, setupHooksCmd, testAutomationCmd);
}
export function deactivate() {};