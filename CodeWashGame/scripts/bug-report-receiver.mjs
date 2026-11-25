#!/usr/bin/env node
/**
 * Local bug-report receiver.
 *
 * Usage:
 *   npm run bug:receive          # listens on http://localhost:8787/report
 *   PORT=9000 npm run bug:receive
 *
 * Configure the same URL in the game Settings, submit a report, and a JSON file
 * appears under `bug-reports/`.
 */
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const port = Number(process.env.PORT || 8787);
const outDir = 'bug-reports';

const server = createServer((req, res) => {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Use POST' }));
        return;
    }

    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        try {
            JSON.parse(body); // validate
            mkdirSync(outDir, { recursive: true });
            const file = join(outDir, `${Date.now()}.json`);
            writeFileSync(file, body, 'utf8');
            console.log(`[bug-report] saved ${file} (${body.length} bytes)`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, file }));
        } catch (error) {
            console.error('[bug-report] invalid payload:', error.message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
        }
    });
});

server.listen(port, () => {
    console.log(`[bug-report] listening on http://localhost:${port}/report`);
});
