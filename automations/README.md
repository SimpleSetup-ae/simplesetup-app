# Automations - Playwright Workers

Playwright automation workers for interacting with government portals and third-party services.

## Tech Stack
- Node.js
- TypeScript
- Playwright
- AI SDK with Claude 3.5 Sonnet
- Bull Queue for job management

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Start workers:
   ```bash
   npm run dev
   ```

## Automations

- IFZA portal interactions
- Tax registration processes
- Document submissions
- Status checking
- Screenshot capture

## Development

- Run single automation: `npm run automation:ifza`
- Debug mode: `npm run debug`
- Test automation: `npm run test`

## Safety

- Runs in sandboxed environment
- Screenshot logging
- Retry mechanisms
- Error handling
