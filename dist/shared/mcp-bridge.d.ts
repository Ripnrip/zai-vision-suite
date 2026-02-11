/**
 * MCP Bridge
 * Communicates with Z.ai Vision MCP server for cross-platform tool access
 */
import { ZaiAnalysisResult } from './vision-client';
export interface MCPBridgeOptions {
    serverPath: string;
    timeout?: number;
}
export declare class MCPBridge {
    private client;
    private serverPath;
    private timeout;
    constructor(options: MCPBridgeOptions);
    /**
     * Connect to MCP server
     */
    connect(): Promise<void>;
    /**
     * Call analyze_image tool
     */
    analyzeImage(imagePath: string, options?: ZaiVisionOptions): Promise<ZaiAnalysisResult>;
    /**
     * Call extract_text tool
     */
    extractText(imagePath: string, options?: ZaiVisionOptions): Promise<string>;
    /**
     * Call vision_search tool
     */
    visionSearch(imagePath: string, options?: ZaiVisionOptions): Promise<string>;
    /**
     * Call vision_web_search tool
     */
    visionWebSearch(imagePath: string, options?: ZaiVisionOptions): Promise<string>;
    /**
     * Disconnect from MCP server
     */
    disconnect(): Promise<void>;
}
//# sourceMappingURL=mcp-bridge.d.ts.map