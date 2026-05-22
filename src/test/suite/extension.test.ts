import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Connect AI Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('calm-carry.calm-carry'));
    });

    test('Commands should be registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        const expected = [
            'connect-ai-lab.newChat',
            'connect-ai-lab.openSettings',
            'connectAiLab.diagnoseConnection',
            'connectAiLab.dashboard.open'
        ];
        for (const cmd of expected) {
            assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`);
        }
    });
});
