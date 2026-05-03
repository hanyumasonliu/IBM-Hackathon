export function createFinding(title, severity, explanation, evidence, recommended_fix, affected_config_path) {
    return {
        id: generateId(),
        title,
        severity,
        explanation,
        evidence,
        recommended_fix,
        affected_config_path
    };
}
export function generateId() {
    return Math.random().toString(36).substring(2, 11);
}
export function getConfigPath(serverName, field) {
    if (serverName && field) {
        return `mcpServers.${serverName}.${field}`;
    }
    if (serverName) {
        return `mcpServers.${serverName}`;
    }
    return 'root';
}
//# sourceMappingURL=utils.js.map