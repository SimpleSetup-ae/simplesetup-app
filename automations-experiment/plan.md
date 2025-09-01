# Computer Use Demo - UAE Tax Portal Automation Plan

## Project Overview
Build a TypeScript/Node.js application using the AI SDK with Anthropic's Computer Use capability to automate interaction with the UAE tax portal (https://eservices.tax.gov.ae).

## Objectives
The demo will:
1. Navigate to the UAE tax portal
2. Click on "Sign in with UAE Pass"
3. Enter the mobile number (971561621929)
4. Click the login/continue button
5. Read and extract a two-digit code from the screen
6. Return the extracted code in the format: "The number is {number}"

## Technical Architecture

### Core Technologies
- **Language**: TypeScript
- **Runtime**: Node.js
- **AI SDK**: Vercel AI SDK (`ai` package)
- **AI Provider**: Anthropic (`@ai-sdk/anthropic`)
- **Model**: Claude 3.5 Sonnet with Computer Use capability

### Project Structure
```
/Users/james/Simple-Setup-Corporate-Tax-Reg-Agent/
├── package.json
├── tsconfig.json
├── .env
├── src/
│   ├── index.ts                 # Main entry point
│   ├── tools/
│   │   ├── computer-tool.ts     # Computer tool implementation
│   │   └── computer-use.ts      # Low-level computer interaction utilities
│   └── config/
│       └── constants.ts         # Configuration constants
└── README.md
```

## Implementation Components

### 1. Environment Setup
- **Virtual Environment**: Implement safety measures (sandboxed execution)
- **Display Configuration**: Set up 1920x1080 display resolution
- **Security**: Implement screenshot and action logging

### 2. Computer Tool Implementation
The computer tool will need to handle:
- **Screenshot capture**: Capture current screen state
- **Mouse actions**: Click at specific coordinates
- **Keyboard input**: Type text into form fields
- **OCR/Text recognition**: Extract the two-digit code from screen

### 3. Core Utilities (`computer-use.ts`)
Implement the following functions:
- `getScreenshot()`: Capture screen using system utilities
- `executeComputerAction()`: Handle mouse/keyboard actions
- `extractTextFromImage()`: OCR functionality for reading the code

### 4. Main Application Flow (`index.ts`)
```typescript
1. Initialize Anthropic client with Computer Use tool
2. Configure multi-step generation with stopWhen
3. Execute the automation sequence:
   - Navigate to URL
   - Wait for page load
   - Click UAE Pass button
   - Enter mobile number
   - Click login
   - Capture and read the code
   - Return result
```

## Technical Challenges & Solutions

### Challenge 1: Screenshot Implementation
**Solution Options**:
- Use `puppeteer` for browser automation and screenshots
- Use system-level screenshot tools (platform-specific)
- Implement headless browser with screenshot capability

**Recommended**: Puppeteer for cross-platform compatibility

### Challenge 2: Mouse/Keyboard Control
**Solution Options**:
- Use `robotjs` for native system control
- Use Puppeteer's built-in page interaction methods
- Implement platform-specific automation tools

**Recommended**: Puppeteer for web-specific interactions

### Challenge 3: OCR for Code Extraction
**Solution Options**:
- Use Tesseract.js for OCR
- Use cloud OCR services (Google Vision, AWS Textract)
- Let Claude's vision capabilities handle it via screenshot

**Recommended**: Claude's vision capabilities (simpler, no extra dependencies)

### Challenge 4: Timing and Synchronization
**Solution**:
- Implement wait strategies for page loads
- Add retry logic for element detection
- Use explicit waits for dynamic content

## Security Considerations

1. **Sandboxing**: Run in isolated environment (Docker container recommended)
2. **Credentials**: Store sensitive data in environment variables
3. **Logging**: Log all actions for audit trail
4. **Timeouts**: Implement maximum execution time limits
5. **Error Handling**: Graceful failure with detailed error messages

## Development Phases

### Phase 1: Project Setup (30 mins)
- Initialize TypeScript project
- Install dependencies
- Configure environment variables
- Set up basic project structure

### Phase 2: Tool Implementation (1-2 hours)
- Implement computer tool with Puppeteer backend
- Create screenshot capture functionality
- Implement mouse/keyboard actions
- Test basic interactions

### Phase 3: Main Flow Development (1-2 hours)
- Implement navigation to UAE tax portal
- Add element detection and interaction logic
- Implement code extraction
- Add error handling and retries

### Phase 4: Testing & Refinement (1 hour)
- Test complete flow end-to-end
- Add logging and debugging
- Optimize timing and waits
- Document usage

## Dependencies

### Required Packages
```json
{
  "dependencies": {
    "ai": "latest",
    "@ai-sdk/anthropic": "latest",
    "puppeteer": "latest",
    "dotenv": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest",
    "tsx": "latest"
  }
}
```

## Alternative Approaches

### Option A: Pure AI SDK with System Tools
- Use native system screenshot/control tools
- Platform-specific implementation
- More complex but potentially more powerful

### Option B: Puppeteer-Based Implementation
- Use Puppeteer for all browser interactions
- Simpler, more reliable for web automation
- Better cross-platform support
- **Recommended approach**

### Option C: Playwright Alternative
- Similar to Puppeteer but with better modern web support
- Built-in wait strategies
- Better error messages

## Success Criteria

1. ✅ Successfully navigates to the UAE tax portal
2. ✅ Correctly identifies and clicks the UAE Pass button
3. ✅ Accurately enters the mobile number
4. ✅ Successfully clicks the login button
5. ✅ Correctly reads the two-digit code from screen
6. ✅ Returns the code in the exact format specified
7. ✅ Handles common error scenarios gracefully
8. ✅ Completes within reasonable time (< 30 seconds)

## Potential Issues & Mitigations

1. **Dynamic Content Loading**
   - Mitigation: Implement robust wait strategies

2. **CAPTCHA or Anti-Automation**
   - Mitigation: Use realistic delays and human-like interactions

3. **Element Selection Changes**
   - Mitigation: Use multiple selector strategies (ID, class, text)

4. **Network Issues**
   - Mitigation: Implement retry logic with exponential backoff

5. **OCR Accuracy**
   - Mitigation: Use Claude's vision capabilities with clear screenshots

## Next Steps

1. Review and approve this plan
2. Set up the project structure
3. Implement the Puppeteer-based computer tool
4. Develop the main automation flow
5. Test and refine the implementation
6. Document usage and deployment instructions

## Notes

- The implementation will use Puppeteer as the backend for Computer Use actions rather than actual system-level control for better reliability and cross-platform support
- The AI SDK's Computer Use tools will wrap Puppeteer functionality
- Claude will orchestrate the high-level flow while Puppeteer handles the low-level browser interactions

