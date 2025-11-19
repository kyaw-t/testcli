# Ruby Documentation

This directory contains comprehensive documentation for the Ruby AI CLI system.

## Architecture Documents

### [WebSocket Architecture](./websocket-architecture.md)
Complete guide to the distributed WebSocket-based architecture that enables real-time communication between Ruby CLI and Ruby Core server. Covers:
- Client-server communication protocols  
- WebSocket message types and flows
- Tool confirmation system
- Session management
- Error handling and security considerations

## Quick Start

### Starting the System
```bash
# Build everything
pnpm build

# Start server and CLI together  
pnpm start

# Or run components separately
pnpm server  # Start just the server
pnpm cli     # Start just the CLI
```

### Testing
```bash
# Test HTTP client without UI issues
pnpm test-http

# Test calculation tool
cd packages/cli && node dist/src/test-calc.js
```

## System Components

### Ruby Core Server (`packages/core`)
- **Purpose**: Distributed AI backend with HTTP REST API and WebSocket streaming
- **Key Files**:
  - `src/server.ts` - Main server implementation with REST endpoints
  - `src/client-http.ts` - HTTP client for connecting to server
  - `src/providers/ai-sdk.ts` - AI provider abstraction layer
  - `src/tools/dummy-tools.ts` - Example tools with confirmation flow
- **Responsibilities**:
  - Session lifecycle management  
  - AI provider integration (Bedrock, OpenAI, Anthropic)
  - Real-time WebSocket streaming
  - Tool execution with user confirmation
  - Conversation history management

### Ruby CLI (`packages/cli`)  
- **Purpose**: Terminal interface that connects to Ruby Core server
- **Key Files**:
  - `src/ruby.tsx` - Main CLI entry point
  - `src/ui/App.tsx` - React-based terminal UI
  - `src/ui/hooks/useRubyHttpStream.ts` - WebSocket streaming hook
- **Responsibilities**:
  - Terminal user interface with Ink
  - WebSocket client connection management
  - Tool confirmation prompts and handling
  - Message history display
  - Input handling and validation

## Key Features

### Distributed Architecture
- CLI and Core can run on different machines
- HTTP REST API for session management
- WebSocket streaming for real-time responses
- Automatic connection handling and error recovery

### Tool System
- Tools request user confirmation before execution
- Confirmation flows through WebSocket messages  
- Real-time tool call and result display
- Example weather and calculator tools included

### Multi-Provider AI Support
- Support for OpenAI, Anthropic, and AWS Bedrock
- Provider abstraction through ai-sdk
- Streaming responses with tool calls
- Configurable system prompts and parameters

### Session Management
- Persistent conversation history per session
- Session-based tool context
- Automatic cleanup and resource management
- Health monitoring and status endpoints

## Development Workflow

### Prerequisites
- Node.js >= 20
- pnpm >= 8
- AWS Bedrock API key (for testing)

### Environment Setup
```bash
# Set required environment variables
export BEDROCK_API_KEY="your-api-key"

# Install dependencies
pnpm install

# Build packages
pnpm build
```

### Architecture Decisions

#### Why WebSocket + HTTP?
- **HTTP REST API**: Simple, stateless session management
- **WebSocket**: Real-time streaming with low latency  
- **Tool Confirmations**: Interactive flow requires bidirectional communication
- **Scalability**: Separate protocols allow independent scaling

#### Why Distributed Design?
- **Flexibility**: CLI and backend can run on different machines
- **Scalability**: Multiple CLI instances can connect to one server
- **Development**: Easier to test and debug components separately
- **Production**: Backend can be deployed independently of CLI

#### Why ai-sdk?
- **Multi-provider**: Support for OpenAI, Anthropic, Bedrock, etc.
- **Streaming**: Built-in streaming support with tool calls
- **TypeScript**: Full type safety and IntelliSense
- **Active Development**: Regular updates and new features

## Troubleshooting

### Common Issues

#### Server Won't Start
- Check if port 3001 is already in use: `lsof -i :3001`
- Ensure BEDROCK_API_KEY is set in environment
- Verify packages are built: `pnpm build`

#### CLI Raw Mode Errors
- Use test scripts instead: `pnpm test-http`
- Check terminal compatibility with Ink framework
- Try running in different terminal (iTerm2, Terminal.app)

#### WebSocket Connection Fails
- Verify server is running: `curl http://localhost:3001/health`
- Check firewall settings for port 3001
- Ensure client is using correct server URL

#### Tool Confirmations Not Working
- Check WebSocket connection is established
- Verify confirmation handler is set on client
- Review server logs for confirmation timeouts

### Debug Mode
```bash
# Start CLI with debug output
pnpm cli --debug

# View server logs
cd packages/core && node dist/server-main.js
```

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow existing JSDoc documentation patterns
- Add comprehensive error handling
- Include tests for new functionality

### Testing
- Test HTTP API endpoints with curl or Postman
- Use `test-http.js` for WebSocket integration testing
- Add unit tests for core logic changes
- Verify tool confirmation flows work correctly

### Documentation
- Update architecture docs for significant changes
- Add JSDoc comments for public APIs
- Include examples for new features
- Keep README files current