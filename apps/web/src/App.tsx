import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, Info, XCircle, FileJson, Download, Play, FileText, Copy, Check } from 'lucide-react'
import { MCPShieldScanner } from '@mcp-shield/scanner'
import type { ScanResult, Finding } from '@mcp-shield/scanner'
import { ReportGenerator } from '@mcp-shield/report'
import './App.css'

// Demo data - MCP Configs
const UNSAFE_MCP_CONFIG = `{
  "mcpServers": {
    "filesystem-root": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/"],
      "permissions": {
        "autoApprove": true,
        "alwaysAllow": true
      }
    },
    "shell-executor": {
      "command": "node",
      "args": ["./shell-server.js"],
      "allowedCommands": ["*"],
      "permissions": {
        "autoApprove": true
      }
    },
    "secrets-reader": {
      "command": "node",
      "args": ["./secrets-server.js"],
      "allowedPaths": [
        "/home/user/.env",
        "/home/user/.ssh",
        "/home/user/.aws",
        "~/.config/secrets"
      ]
    },
    "database-destroyer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION": "postgresql://admin:fake-password-123@localhost:5432/production"
      },
      "allowedCommands": ["DROP TABLE", "TRUNCATE", "DELETE"],
      "permissions": {
        "autoApprove": true
      }
    },
    "remote-api-unencrypted": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"],
      "url": "http://internal-api.fake-company.com",
      "authentication": {
        "enabled": false
      },
      "allowInsecureConnections": true
    },
    "data-exfiltrator": {
      "command": "node",
      "args": ["./http-sender.js"],
      "allowedDomains": ["*"],
      "canSendToAnyURL": true
    }
  },
  "security": {
    "sandboxing": false,
    "allowNetworkAccess": true,
    "allowFileSystemAccess": true,
    "maxMemoryMB": -1,
    "timeout": 0
  },
  "logging": {
    "enabled": false,
    "auditTrail": false,
    "includeSecrets": true
  }
}`

const SAFE_MCP_CONFIG = `{
  "mcpServers": {
    "calculator-safe-only": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-calculator"],
      "logging": {
        "enabled": true,
        "auditTrail": true,
        "userAttribution": true
      }
    }
  },
  "security": {
    "sandboxing": true,
    "allowNetworkAccess": false,
    "allowFileSystemAccess": false,
    "maxMemoryMB": 256,
    "timeout": 10000,
    "requireApproval": true
  },
  "logging": {
    "enabled": true,
    "auditTrail": true,
    "userAttribution": true,
    "includeSecrets": false
  },
  "rateLimit": {
    "enabled": true,
    "maxRequestsPerMinute": 20
  }
}`

// Demo data - Agent Tools
const UNSAFE_AGENT_TOOLS = `{
  "tools": [
    {
      "name": "read_any_file",
      "description": "Read any file from the filesystem including secrets"
    },
    {
      "name": "delete_database",
      "description": "Drop entire database tables permanently"
    },
    {
      "name": "send_http_post",
      "description": "Send HTTP POST request to any URL on the internet"
    },
    {
      "name": "execute_shell",
      "description": "Execute any shell command on the system"
    }
  ]
}`

const SAFE_AGENT_TOOLS = `{
  "tools": [
    {
      "name": "read_document",
      "description": "Read files from the documents folder only"
    },
    {
      "name": "query_database",
      "description": "Execute read-only SELECT queries on the database"
    },
    {
      "name": "calculate",
      "description": "Perform mathematical calculations"
    }
  ]
}`

function App() {
  const [inputType, setInputType] = useState<'mcp' | 'tools'>('mcp')
  const [inputText, setInputText] = useState('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [beforeResult, setBeforeResult] = useState<ScanResult | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [policyCopied, setPolicyCopied] = useState(false)

  const handleScan = async () => {
    if (!inputText.trim()) return
    
    setIsScanning(true)
    try {
      const scanner = new MCPShieldScanner()
      const result = await scanner.scan(inputText)
      
      // If we have a previous result and it's different, enable comparison
      if (scanResult && scanResult.overall_risk_score !== result.overall_risk_score) {
        setBeforeResult(scanResult)
        setShowComparison(true)
      }
      
      setScanResult(result)
      setSelectedFinding(null)
    } catch (error) {
      console.error('Scan error:', error)
      alert('Failed to scan. Please check your JSON format.')
    } finally {
      setIsScanning(false)
    }
  }

  const loadDemo = (type: 'unsafe' | 'safe') => {
    // Load appropriate demo based on current tab
    if (inputType === 'mcp') {
      setInputText(type === 'unsafe' ? UNSAFE_MCP_CONFIG : SAFE_MCP_CONFIG)
    } else {
      setInputText(type === 'unsafe' ? UNSAFE_AGENT_TOOLS : SAFE_AGENT_TOOLS)
    }
    setScanResult(null)
    setSelectedFinding(null)
    setShowComparison(false)
    setBeforeResult(null)
  }

  const getBusinessImpact = (beforeScore: number, afterScore: number) => {
    const improvement = beforeScore - afterScore
    const percentImprovement = Math.round((improvement / beforeScore) * 100)
    
    if (improvement > 60) {
      return `Excellent progress. You eliminated ${percentImprovement}% of security risk and moved this setup to a much safer production profile.`
    } else if (improvement > 30) {
      return `Good progress. Risk is down by ${percentImprovement}%. Continue resolving the remaining findings to improve resilience.`
    } else if (improvement > 0) {
      return `Partial improvement. Risk is down by ${percentImprovement}%, but there is still meaningful exposure to address.`
    } else if (improvement < 0) {
      return `Risk increased by ${Math.abs(percentImprovement)}%. Review the new findings and roll back changes that expanded permissions.`
    } else {
      return `No change in risk score. Try implementing the recommended fixes to improve security.`
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'var(--color-critical)'
    if (score >= 60) return 'var(--color-danger)'
    if (score >= 40) return 'var(--color-warning)'
    if (score >= 20) return 'var(--color-info)'
    return 'var(--color-success)'
  }

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'CRITICAL'
    if (score >= 60) return 'HIGH'
    if (score >= 40) return 'MEDIUM'
    if (score >= 20) return 'LOW'
    return 'MINIMAL'
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle size={16} />
      case 'high': return <AlertTriangle size={16} />
      case 'medium': return <Info size={16} />
      case 'low': return <Info size={16} />
      default: return <CheckCircle size={16} />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'var(--color-critical)'
      case 'high': return 'var(--color-danger)'
      case 'medium': return 'var(--color-warning)'
      case 'low': return 'var(--color-info)'
      default: return 'var(--color-text-muted)'
    }
  }

  const exportReport = () => {
    if (!scanResult) return
    
    const report = {
      timestamp: new Date().toISOString(),
      risk_score: scanResult.overall_risk_score,
      risk_level: getRiskLabel(scanResult.overall_risk_score),
      severity_counts: scanResult.severity_counts,
      findings: scanResult.findings,
      scanned_at: scanResult.scanned_at
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mcp-shield-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportMarkdownReport = () => {
    if (!scanResult) return
    
    const generator = new ReportGenerator()
    const markdown = generator.generate(scanResult, {
      organization: 'Your Organization',
      project: 'MCP Security Scan',
      comparison: showComparison && beforeResult ? {
        before: beforeResult,
        after: scanResult
      } : undefined
    })
    
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mcp-shield-report-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyPolicyToClipboard = () => {
    if (!scanResult?.suggested_policy) return
    
    const policy = scanResult.suggested_policy
    let policyText = '# MCP Shield - Generated Guardrail Policy\n\n'
    
    if (policy.allowlist.length > 0) {
      policyText += '## Allowed Paths\n'
      policy.allowlist.forEach(path => policyText += `- ${path}\n`)
      policyText += '\n'
    }
    
    if (policy.blocked_paths.length > 0) {
      policyText += '## Blocked Paths\n'
      policy.blocked_paths.forEach(path => policyText += `- ${path}\n`)
      policyText += '\n'
    }
    
    if (policy.blocked_commands.length > 0) {
      policyText += '## Blocked Commands\n'
      policy.blocked_commands.forEach(cmd => policyText += `- ${cmd}\n`)
      policyText += '\n'
    }
    
    if (policy.environment_variables.recommended.length > 0) {
      policyText += '## Environment Variables\n'
      policyText += `${policy.environment_variables.explanation}\n\n`
      policy.environment_variables.recommended.forEach(env => policyText += `- ${env}\n`)
      policyText += '\n'
    }
    
    policyText += '## Security Settings\n'
    policyText += `- Approval Required: ${policy.approval_required ? 'Yes' : 'No'}\n`
    policyText += `- Audit Logging: ${policy.audit_required ? 'Enabled' : 'Disabled'}\n\n`
    
    policyText += '## Maximum Safe Scope\n'
    policyText += `${policy.max_scope_explanation}\n\n`
    
    if (policy.recommendations.length > 0) {
      policyText += '## Additional Recommendations\n'
      policy.recommendations.forEach(rec => policyText += `- ${rec}\n`)
    }
    
    navigator.clipboard.writeText(policyText).then(() => {
      setPolicyCopied(true)
      setTimeout(() => setPolicyCopied(false), 2000)
    })
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Shield size={32} />
            <div>
              <h1>MCP Shield</h1>
              <p>Security flight recorder for AI agents and MCP workflows</p>
            </div>
          </div>
          <div className="header-badges" aria-label="Demo highlights">
            <span className="header-badge">Live scanner</span>
            <span className="header-badge">Plain-English fixes</span>
            <span className="header-badge">Exportable report</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Left Panel - Input */}
        <div className="panel input-panel">
          <div className="panel-header">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Step 1</p>
                <h2>Scan an AI configuration</h2>
                <p className="panel-subtitle">
                  Paste JSON or load a demo to instantly surface risky MCP and agent permissions.
                </p>
              </div>
              <span className="step-pill">JSON only</span>
            </div>
            <div className="tabs">
              <button
                className={`tab ${inputType === 'mcp' ? 'active' : ''}`}
                onClick={() => setInputType('mcp')}
              >
                <FileJson size={16} />
                MCP Config
              </button>
              <button
                className={`tab ${inputType === 'tools' ? 'active' : ''}`}
                onClick={() => setInputType('tools')}
              >
                <FileJson size={16} />
                Agent Tools
              </button>
            </div>
          </div>

          <div className="panel-body">
            <div className="input-shell">
              <div className="input-toolbar">
                <span>{inputType === 'mcp' ? 'MCP server configuration' : 'Agent tool definitions'}</span>
                <span className="input-format">.json</span>
              </div>
              <textarea
                className="json-input"
                placeholder={`Paste your ${inputType === 'mcp' ? 'MCP server configuration' : 'agent tool definitions'} JSON here...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <div className="button-group">
              <button 
                className="btn btn-primary" 
                onClick={handleScan}
                disabled={!inputText.trim() || isScanning}
              >
                <Play size={16} />
                {isScanning ? 'Scanning...' : 'Run Scan'}
              </button>
              <button className="btn btn-secondary" onClick={() => loadDemo('unsafe')}>
                Load Unsafe Demo
              </button>
              <button className="btn btn-secondary" onClick={() => loadDemo('safe')}>
                Load Safe Demo
              </button>
            </div>
            <p className="input-helper">
              Demo tip: scan the unsafe sample, then the safe sample to show the before/after reduction.
            </p>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="panel results-panel">
          {!scanResult ? (
            <div className="empty-state">
              <div className="empty-state-card">
                <div className="empty-state-icon">
                  <Shield size={38} />
                </div>
                <h3>Ready for a security readout</h3>
                <p>Load a demo configuration or paste your own JSON, then run a scan to see risk score, findings, fixes, and a report.</p>
                <div className="empty-state-steps" aria-label="Recommended demo flow">
                  <div className="empty-state-step"><span>1</span>Load unsafe demo</div>
                  <div className="empty-state-step"><span>2</span>Run scan and review risks</div>
                  <div className="empty-state-step"><span>3</span>Load safe demo to show improvement</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Risk Score */}
              <div className="risk-score-card">
                <div className="risk-score-header">
                  <div>
                    <p className="eyebrow">Step 2</p>
                    <h2>Overall Risk Score</h2>
                    <p className="risk-score-caption">A simple 0-100 view of how dangerous this configuration is.</p>
                  </div>
                  <span className="risk-label" style={{ color: getRiskColor(scanResult.overall_risk_score) }}>
                    {getRiskLabel(scanResult.overall_risk_score)}
                  </span>
                </div>
                <div className="risk-score-main">
                  <div className="risk-score-value" style={{ color: getRiskColor(scanResult.overall_risk_score) }}>
                    {scanResult.overall_risk_score}
                    <span className="risk-score-max">/100</span>
                  </div>
                  <div className="risk-meter">
                    <div className="risk-score-bar">
                      <div 
                        className="risk-score-fill" 
                        style={{ 
                          width: `${scanResult.overall_risk_score}%`,
                          background: getRiskColor(scanResult.overall_risk_score)
                        }}
                      />
                    </div>
                    <div className="risk-scale">
                      <span>Safe</span>
                      <span>Review</span>
                      <span>Critical</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Before/After Comparison */}
              {showComparison && beforeResult && (
                <div className="comparison-card">
                  <div className="comparison-header">
                    <h2>Before/After Comparison</h2>
                    <button className="btn-close" onClick={() => setShowComparison(false)}>×</button>
                  </div>
                  
                  <div className="comparison-metrics">
                    <div className="comparison-metric">
                      <div className="metric-label">Risk Score Reduction</div>
                      <div className="metric-value">
                        <span className="before-value">{beforeResult.overall_risk_score}</span>
                        <span className="arrow">→</span>
                        <span className="after-value" style={{ color: getRiskColor(scanResult.overall_risk_score) }}>
                          {scanResult.overall_risk_score}
                        </span>
                      </div>
                      <div className="metric-change">
                        {beforeResult.overall_risk_score > scanResult.overall_risk_score ? (
                          <span className="improvement">
                            ↓ {beforeResult.overall_risk_score - scanResult.overall_risk_score} points improved
                          </span>
                        ) : beforeResult.overall_risk_score < scanResult.overall_risk_score ? (
                          <span className="regression">
                            ↑ {scanResult.overall_risk_score - beforeResult.overall_risk_score} points worse
                          </span>
                        ) : (
                          <span className="no-change">No change</span>
                        )}
                      </div>
                    </div>

                    <div className="comparison-metric">
                      <div className="metric-label">Critical Findings</div>
                      <div className="metric-value">
                        <span className="before-value">{beforeResult.severity_counts.critical}</span>
                        <span className="arrow">→</span>
                        <span className="after-value" style={{ color: scanResult.severity_counts.critical === 0 ? 'var(--color-success)' : 'var(--color-critical)' }}>
                          {scanResult.severity_counts.critical}
                        </span>
                      </div>
                      <div className="metric-change">
                        {beforeResult.severity_counts.critical > scanResult.severity_counts.critical ? (
                          <span className="improvement">
                            ✓ {beforeResult.severity_counts.critical - scanResult.severity_counts.critical} critical issues fixed
                          </span>
                        ) : beforeResult.severity_counts.critical < scanResult.severity_counts.critical ? (
                          <span className="regression">
                            ✗ {scanResult.severity_counts.critical - beforeResult.severity_counts.critical} new critical issues
                          </span>
                        ) : (
                          <span className="no-change">No change</span>
                        )}
                      </div>
                    </div>

                    <div className="comparison-metric">
                      <div className="metric-label">Total Findings</div>
                      <div className="metric-value">
                        <span className="before-value">{beforeResult.findings.length}</span>
                        <span className="arrow">→</span>
                        <span className="after-value">
                          {scanResult.findings.length}
                        </span>
                      </div>
                      <div className="metric-change">
                        {beforeResult.findings.length > scanResult.findings.length ? (
                          <span className="improvement">
                            ↓ {beforeResult.findings.length - scanResult.findings.length} fewer issues
                          </span>
                        ) : beforeResult.findings.length < scanResult.findings.length ? (
                          <span className="regression">
                            ↑ {scanResult.findings.length - beforeResult.findings.length} more issues
                          </span>
                        ) : (
                          <span className="no-change">No change</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="business-impact">
                    <h3>Business Impact</h3>
                    <p>{getBusinessImpact(beforeResult.overall_risk_score, scanResult.overall_risk_score)}</p>
                  </div>
                </div>
              )}

              {/* Severity Cards */}
              <div className="severity-cards">
                <div className="severity-card critical">
                  <div className="severity-icon"><XCircle size={20} /></div>
                  <div className="severity-info">
                    <div className="severity-count">{scanResult.severity_counts.critical}</div>
                    <div className="severity-label">Critical</div>
                  </div>
                </div>
                <div className="severity-card high">
                  <div className="severity-icon"><AlertTriangle size={20} /></div>
                  <div className="severity-info">
                    <div className="severity-count">{scanResult.severity_counts.high}</div>
                    <div className="severity-label">High</div>
                  </div>
                </div>
                <div className="severity-card medium">
                  <div className="severity-icon"><Info size={20} /></div>
                  <div className="severity-info">
                    <div className="severity-count">{scanResult.severity_counts.medium}</div>
                    <div className="severity-label">Medium</div>
                  </div>
                </div>
                <div className="severity-card low">
                  <div className="severity-icon"><Info size={20} /></div>
                  <div className="severity-info">
                    <div className="severity-count">{scanResult.severity_counts.low}</div>
                    <div className="severity-label">Low</div>
                  </div>
                </div>
              </div>
              {/* Generated Guardrail Policy */}
              {scanResult.suggested_policy && (
                <div className="policy-section">
                  <div className="policy-header">
                    <div>
                      <h3>Generated Guardrail Policy</h3>
                      <p className="policy-subtitle">Automatically generated security recommendations based on findings</p>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={copyPolicyToClipboard}
                      title="Copy policy to clipboard"
                    >
                      {policyCopied ? <Check size={16} /> : <Copy size={16} />}
                      {policyCopied ? 'Copied!' : 'Copy Policy'}
                    </button>
                  </div>

                  <div className="policy-grid">
                    {/* Allowlist */}
                    {scanResult.suggested_policy.allowlist.length > 0 && (
                      <div className="policy-card">
                        <h4>Allowed Paths</h4>
                        <ul>
                          {scanResult.suggested_policy.allowlist.map((path, i) => (
                            <li key={i}><code>{path}</code></li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Blocked Paths */}
                    {scanResult.suggested_policy.blocked_paths.length > 0 && (
                      <div className="policy-card">
                        <h4>Blocked Paths</h4>
                        <ul>
                          {scanResult.suggested_policy.blocked_paths.slice(0, 5).map((path, i) => (
                            <li key={i}><code>{path}</code></li>
                          ))}
                          {scanResult.suggested_policy.blocked_paths.length > 5 && (
                            <li className="more">+{scanResult.suggested_policy.blocked_paths.length - 5} more</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Blocked Commands */}
                    {scanResult.suggested_policy.blocked_commands.length > 0 && (
                      <div className="policy-card">
                        <h4>Blocked Commands</h4>
                        <ul>
                          {scanResult.suggested_policy.blocked_commands.slice(0, 5).map((cmd, i) => (
                            <li key={i}><code>{cmd}</code></li>
                          ))}
                          {scanResult.suggested_policy.blocked_commands.length > 5 && (
                            <li className="more">+{scanResult.suggested_policy.blocked_commands.length - 5} more</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Environment Variables */}
                    {scanResult.suggested_policy.environment_variables.recommended.length > 0 && (
                      <div className="policy-card">
                        <h4>Environment Variables</h4>
                        <p className="policy-explanation">{scanResult.suggested_policy.environment_variables.explanation}</p>
                        <ul>
                          {scanResult.suggested_policy.environment_variables.recommended.map((envVar, i) => (
                            <li key={i}><code>${envVar}</code></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Policy Settings */}
                  <div className="policy-settings">
                    <div className="policy-setting">
                      <span className="setting-label">Approval Required:</span>
                      <span className={`setting-value ${scanResult.suggested_policy.approval_required ? 'enabled' : 'disabled'}`}>
                        {scanResult.suggested_policy.approval_required ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="policy-setting">
                      <span className="setting-label">Audit Logging:</span>
                      <span className={`setting-value ${scanResult.suggested_policy.audit_required ? 'enabled' : 'disabled'}`}>
                        {scanResult.suggested_policy.audit_required ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Max Scope */}
                  <div className="policy-scope">
                    <h4>Maximum Safe Scope</h4>
                    <p>{scanResult.suggested_policy.max_scope_explanation}</p>
                  </div>

                  {/* Recommendations */}
                  {scanResult.suggested_policy.recommendations.length > 0 && (
                    <div className="policy-recommendations">
                      <h4>Additional Recommendations</h4>
                      <ul>
                        {scanResult.suggested_policy.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}


              {/* Findings Table */}
              <div className="findings-section">
                <div className="findings-header">
                  <div>
                    <p className="eyebrow">Step 3</p>
                    <h3>Security Findings ({scanResult.findings.length})</h3>
                    <p className="findings-subtitle">Click any row to explain the risk and show exactly how to fix it.</p>
                  </div>
                  <div className="export-actions">
                    <button className="btn btn-secondary btn-sm" onClick={exportReport}>
                      <Download size={16} />
                      Export JSON
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={exportMarkdownReport}>
                      <FileText size={16} />
                      Download Markdown Report
                    </button>
                  </div>
                </div>

                <div className="findings-table">
                  {scanResult.findings.map((finding, index) => (
                    <div 
                      key={index} 
                      className={`finding-row ${selectedFinding === finding ? 'selected' : ''}`}
                      onClick={() => setSelectedFinding(finding)}
                    >
                      <div className="finding-severity" style={{ color: getSeverityColor(finding.severity) }}>
                        {getSeverityIcon(finding.severity)}
                        <span>{finding.severity.toUpperCase()}</span>
                      </div>
                      <div className="finding-title">{finding.title}</div>
                      <div className="finding-location">{finding.affected_config_path || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Finding Detail Drawer */}
              {selectedFinding && (
                <div className="finding-detail">
                  <div className="finding-detail-header">
                    <div>
                      <div className="finding-detail-severity" style={{ color: getSeverityColor(selectedFinding.severity) }}>
                        {getSeverityIcon(selectedFinding.severity)}
                        {selectedFinding.severity.toUpperCase()}
                      </div>
                      <h3>{selectedFinding.title}</h3>
                    </div>
                    <button className="btn-close" onClick={() => setSelectedFinding(null)}>×</button>
                  </div>

                  <div className="finding-detail-body">
                    <div className="detail-section">
                      <h4>What This Means</h4>
                      <p>{selectedFinding.explanation}</p>
                    </div>

                    <div className="detail-section">
                      <h4>Evidence</h4>
                      <p>{selectedFinding.evidence}</p>
                    </div>

                    <div className="detail-section recommendation">
                      <h4>How to Fix</h4>
                      <p>{selectedFinding.recommended_fix}</p>
                    </div>

                    {selectedFinding.affected_config_path && (
                      <div className="detail-section">
                        <h4>Affected Configuration</h4>
                        <code>{selectedFinding.affected_config_path}</code>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App

// Made with Bob
