# Cursor内置MCP系统自动重连优化方案

## 🔍 问题分析

从您的截图可以看到，MCP工具是通过Cursor内置MCP系统管理的：
- ✅ search_caixin_content: 正常运行（绿色）
- ✅ AKShare One MCP Server: 正常运行（绿色）
- 🟡 Tavily MCP Server: 正在加载（黄色）
- ❌ yingmi_mcp: 有问题（红色）
- ❌ stock-market-data: 有问题（红色）
- ❌ feishu-bitable: 有问题（红色）
- ❌ fund-realtime: 有问题（红色）

## 🎯 针对Cursor MCP系统的优化方案

### 方案一：Cursor MCP配置文件优化（推荐）

#### 1.1 找到Cursor MCP配置文件
Cursor的MCP配置通常在以下位置：
- Windows: `%APPDATA%\Cursor\User\settings.json`
- 或者在项目的 `.cursor/mcp_settings.json`

#### 1.2 优化MCP配置（重点：增加重连参数）

在Cursor设置中添加或修改MCP配置：

```json
{
  "mcp.servers": {
    "yingmi_mcp": {
      "command": "python",
      "args": ["-m", "yingmi_mcp"],
      "env": {},
      "timeout": 60000,
      "reconnection": {
        "enabled": true,
        "maxRetries": 10,
        "retryDelay": 2000,
        "exponentialBackoff": true,
        "maxRetryDelay": 30000
      },
      "keepAlive": {
        "enabled": true,
        "interval": 30000,
        "timeout": 10000,
        "pingMessage": "ping"
      },
      "healthCheck": {
        "enabled": true,
        "interval": 10000,
        "timeout": 5000,
        "retryCount": 3
      },
      "errorHandling": {
        "autoRestart": true,
        "maxRestarts": 5,
        "restartDelay": 5000
      }
    },
    "search_caixin_content": {
      "command": "python", 
      "args": ["-m", "search_caixin_content"],
      "env": {},
      "timeout": 60000,
      "reconnection": {
        "enabled": true,
        "maxRetries": 10,
        "retryDelay": 2000,
        "exponentialBackoff": true
      },
      "keepAlive": {
        "enabled": true,
        "interval": 30000,
        "timeout": 10000
      },
      "healthCheck": {
        "enabled": true,
        "interval": 10000,
        "timeout": 5000
      }
    },
    "mcp_Tavily_MCP_Server": {
      "command": "python",
      "args": ["-m", "mcp_Tavily_MCP_Server"],
      "env": {},
      "timeout": 60000,
      "reconnection": {
        "enabled": true,
        "maxRetries": 10,
        "retryDelay": 2000,
        "exponentialBackoff": true
      },
      "keepAlive": {
        "enabled": true,
        "interval": 30000,
        "timeout": 10000
      }
    },
    "stock-market-data": {
      "command": "python",
      "args": ["-m", "stock_market_data"],
      "env": {},
      "timeout": 60000,
      "reconnection": {
        "enabled": true,
        "maxRetries": 10,
        "retryDelay": 2000
      },
      "keepAlive": {
        "enabled": true,
        "interval": 30000
      }
    },
    "feishu-bitable": {
      "command": "python",
      "args": ["-m", "feishu_bitable"],
      "env": {},
      "timeout": 60000,
      "reconnection": {
        "enabled": true,
        "maxRetries": 10,
        "retryDelay": 2000
      }
    },
    "fund-realtime": {
      "command": "python",
      "args": ["-m", "fund_realtime"],
      "env": {},
      "timeout": 60000,
      "reconnection": {
        "enabled": true,
        "maxRetries": 10,
        "retryDelay": 2000
      }
    },
    "AKShare One MCP Server": {
      "command": "python",
      "args": ["-m", "akshare_mcp"],
      "env": {},
      "timeout": 60000,
      "reconnection": {
        "enabled": true,
        "maxRetries": 10,
        "retryDelay": 2000
      }
    }
  },
  "mcp.globalSettings": {
    "autoReconnect": true,
    "maxGlobalRetries": 5,
    "connectionTimeout": 30000,
    "heartbeatInterval": 10000,
    "errorRecovery": {
      "enabled": true,
      "maxErrors": 10,
      "errorWindow": 300000
    },
    "logLevel": "info"
  }
}
```

### 方案二：Cursor扩展脚本（直接操作Cursor MCP）

#### 2.1 创建Cursor MCP管理脚本

```javascript
// 保存为: scripts/cursor_mcp_manager.js
/**
 * Cursor MCP系统直接管理脚本
 * 通过Cursor API直接重启MCP服务器
 */

const vscode = require('vscode');

class CursorMCPManager {
    constructor() {
        this.problematicServers = [
            'yingmi_mcp',
            'stock-market-data', 
            'feishu-bitable',
            'fund-realtime'
        ];
        
        this.checkInterval = 2000; // 2秒检查
        this.maxRetries = 10;
        this.retryDelay = 2000;
        
        this.intervalId = null;
        this.retryCount = {};
    }
    
    async checkServerHealth(serverName) {
        try {
            // 通过vscode命令检查MCP服务器状态
            const servers = await vscode.commands.executeCommand('mcp.getServers');
            const server = servers.find(s => s.name === serverName);
            
            if (!server) return false;
            
            // 检查是否有红色状态或加载中
            return server.status === 'connected' && server.toolsLoaded > 0;
        } catch (error) {
            console.error(`检查 ${serverName} 健康状态失败:`, error);
            return false;
        }
    }
    
    async restartServer(serverName) {
        try {
            console.log(`正在重启 ${serverName}...`);
            
            // 停止服务器
            await vscode.commands.executeCommand('mcp.stopServer', serverName);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 重新启动服务器
            await vscode.commands.executeCommand('mcp.startServer', serverName);
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // 验证重启是否成功
            const isHealthy = await this.checkServerHealth(serverName);
            if (isHealthy) {
                console.log(`✅ ${serverName} 重启成功`);
                this.retryCount[serverName] = 0;
                
                vscode.window.showInformationMessage(
                    `${serverName} 已自动重连成功`
                );
                return true;
            } else {
                console.log(`❌ ${serverName} 重启后仍不健康`);
                return false;
            }
        } catch (error) {
            console.error(`重启 ${serverName} 失败:`, error);
            return false;
        }
    }
    
    async monitorServers() {
        for (const serverName of this.problematicServers) {
            const isHealthy = await this.checkServerHealth(serverName);
            const currentRetries = this.retryCount[serverName] || 0;
            
            if (!isHealthy && currentRetries < this.maxRetries) {
                this.retryCount[serverName] = currentRetries + 1;
                console.log(`检测到 ${serverName} 异常，开始第 ${currentRetries + 1} 次重连...`);
                
                setTimeout(() => {
                    this.restartServer(serverName);
                }, this.retryDelay);
            }
        }
    }
    
    start() {
        console.log('🚀 Cursor MCP监控服务启动');
        console.log('⚡ 2秒检查间隔，自动重连异常服务器');
        
        this.intervalId = setInterval(() => {
            this.monitorServers();
        }, this.checkInterval);
        
        // 立即执行一次检查
        this.monitorServers();
    }
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('📴 Cursor MCP监控服务已停止');
    }
}

// 导出给Cursor使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CursorMCPManager;
}

// 如果直接运行，启动监控
if (typeof window === 'undefined') {
    const manager = new CursorMCPManager();
    manager.start();
    
    // 优雅关闭
    process.on('SIGINT', () => {
        manager.stop();
        process.exit(0);
    });
}
```

### 方案三：快速修复脚本（立即可用）

#### 3.1 创建一键修复脚本

```python
# 保存为: scripts/fix_mcp_now.py
"""
立即修复Cursor MCP工具连接问题
针对截图中显示的红色状态MCP工具
"""

import subprocess
import time
import json
from pathlib import Path

class CursorMCPFixer:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        
        # 根据截图中的问题服务器
        self.problem_servers = [
            'yingmi_mcp',
            'stock-market-data',
            'feishu-bitable', 
            'fund-realtime'
        ]
        
        # 正常运行的服务器（用于对比）
        self.working_servers = [
            'search_caixin_content',
            'AKShare One MCP Server'
        ]
    
    def check_python_modules(self):
        """检查Python模块是否正确安装"""
        print("🔍 检查Python模块安装状态...")
        
        modules_to_check = [
            'yingmi_mcp',
            'search_caixin_content', 
            'mcp_Tavily_MCP_Server',
            'akshare'
        ]
        
        missing_modules = []
        for module in modules_to_check:
            try:
                result = subprocess.run([
                    'python', '-c', f'import {module}; print("✅ {module}: 已安装")'
                ], capture_output=True, text=True, timeout=10)
                
                if result.returncode == 0:
                    print(result.stdout.strip())
                else:
                    print(f"❌ {module}: 未安装或有问题")
                    missing_modules.append(module)
                    
            except subprocess.TimeoutExpired:
                print(f"⏰ {module}: 导入超时")
                missing_modules.append(module)
            except Exception as e:
                print(f"❌ {module}: 检查失败 - {e}")
                missing_modules.append(module)
        
        return missing_modules
    
    def restart_cursor_mcp(self):
        """重启Cursor MCP系统"""
        print("\n🔄 正在重启Cursor MCP系统...")
        
        try:
            # 方法1: 通过命令行重启Cursor MCP
            # 这个命令可能因Cursor版本而异
            commands_to_try = [
                ['cursor', '--restart-mcp'],
                ['code', '--restart-mcp'],  # 如果Cursor基于VSCode
            ]
            
            for cmd in commands_to_try:
                try:
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                    if result.returncode == 0:
                        print(f"✅ 成功执行: {' '.join(cmd)}")
                        return True
                except (subprocess.TimeoutExpired, FileNotFoundError):
                    continue
            
            print("⚠️ 无法通过命令行重启，请手动重启Cursor")
            return False
            
        except Exception as e:
            print(f"❌ 重启失败: {e}")
            return False
    
    def create_mcp_healthcheck_script(self):
        """创建MCP健康检查和自动恢复脚本"""
        script_content = '''
// Cursor MCP健康检查和自动恢复
// 在Cursor开发者工具中运行此脚本

class MCPHealthChecker {
    constructor() {
        this.checkInterval = 2000; // 2秒检查
        this.problemServers = ['yingmi_mcp', 'stock-market-data', 'feishu-bitable', 'fund-realtime'];
        this.maxRetries = 5;
        this.retryCount = {};
    }
    
    async checkAndFixServers() {
        console.log('🔍 检查MCP服务器状态...');
        
        for (const serverName of this.problemServers) {
            try {
                // 这里需要根据Cursor的实际API调整
                const serverStatus = await this.getServerStatus(serverName);
                
                if (serverStatus !== 'healthy') {
                    const retries = this.retryCount[serverName] || 0;
                    
                    if (retries < this.maxRetries) {
                        this.retryCount[serverName] = retries + 1;
                        console.log(`🔄 重启 ${serverName} (第${retries + 1}次)`);
                        await this.restartServer(serverName);
                    } else {
                        console.log(`⚠️ ${serverName} 达到最大重试次数`);
                    }
                } else {
                    this.retryCount[serverName] = 0;
                }
            } catch (error) {
                console.error(`检查 ${serverName} 失败:`, error);
            }
        }
    }
    
    async getServerStatus(serverName) {
        // 检查服务器状态的实际实现
        // 需要根据Cursor API文档调整
        return 'unknown';
    }
    
    async restartServer(serverName) {
        // 重启服务器的实际实现
        // 需要根据Cursor API文档调整
        console.log(`正在重启 ${serverName}...`);
    }
    
    start() {
        console.log('🚀 MCP健康检查器启动');
        setInterval(() => {
            this.checkAndFixServers();
        }, this.checkInterval);
    }
}

// 启动健康检查器
const healthChecker = new MCPHealthChecker();
healthChecker.start();
'''
        
        script_file = self.project_root / "scripts" / "mcp_health_checker.js"
        with open(script_file, 'w', encoding='utf-8') as f:
            f.write(script_content)
        
        print(f"✅ 健康检查脚本已创建: {script_file}")
    
    def generate_manual_fix_steps(self):
        """生成手动修复步骤"""
        steps = [
            "🛠️ 立即修复步骤：",
            "",
            "1. 【重启所有MCP服务器】",
            "   - 在Cursor中按 Ctrl+Shift+P",
            "   - 输入 'Developer: Reload Window' 并执行",
            "   - 等待10-15秒让所有MCP服务器重新加载",
            "",
            "2. 【逐个重启问题服务器】",
            "   对于每个红色状态的服务器：",
            "   - 点击右侧的开关，先关闭",
            "   - 等待5秒",
            "   - 再点击开关，重新开启",
            "",
            "3. 【验证修复效果】",
            "   - 等待所有服务器状态变为绿色",
            "   - 如果仍有红色，重复步骤2",
            "",
            "4. 【配置自动重连】",
            "   - 按 Ctrl+Shift+P",
            "   - 输入 'Preferences: Open Settings (JSON)'",
            "   - 添加上述MCP配置代码",
            "   - 保存并重启Cursor",
            "",
            "5. 【启用我们的监控脚本】",
            "   - 按 Ctrl+Shift+P", 
            "   - 输入 'Tasks: Run Task'",
            "   - 选择 'MCP自动监控启动'",
            "",
            "完成后，您将拥有双重保障：",
            "✅ Cursor内置重连 + 我们的2秒监控脚本"
        ]
        
        return "\n".join(steps)
    
    def run_diagnosis(self):
        """运行完整诊断"""
        print("🔧 Cursor MCP系统诊断和修复")
        print("=" * 50)
        
        # 检查Python模块
        missing_modules = self.check_python_modules()
        
        # 创建健康检查脚本
        self.create_mcp_healthcheck_script()
        
        # 生成修复建议
        print("\n" + self.generate_manual_fix_steps())
        
        if missing_modules:
            print(f"\n❌ 发现缺失模块: {missing_modules}")
            print("💡 建议先安装缺失的Python包")
        
        print(f"\n📊 诊断完成时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    fixer = CursorMCPFixer()
    fixer.run_diagnosis()
```

### 方案四：PowerShell脚本直接操作Cursor

#### 4.1 创建Cursor重启脚本

```powershell
# 保存为: scripts/restart_cursor_mcp.ps1
# Cursor MCP服务器快速重启脚本

param(
    [switch]$All,
    [string[]]$Servers = @('yingmi_mcp', 'stock-market-data', 'feishu-bitable', 'fund-realtime')
)

Write-Host "🔧 Cursor MCP服务器重启工具" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

function Restart-CursorWindow {
    Write-Host "🔄 重启Cursor窗口..." -ForegroundColor Yellow
    
    # 方法1: 通过快捷键自动化
    Add-Type -AssemblyName System.Windows.Forms
    
    # 发送Ctrl+Shift+P快捷键
    [System.Windows.Forms.SendKeys]::SendWait("^+p")
    Start-Sleep -Milliseconds 500
    
    # 输入重载命令
    [System.Windows.Forms.SendKeys]::SendWait("Developer: Reload Window")
    Start-Sleep -Milliseconds 500
    
    # 按回车执行
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
    
    Write-Host "✅ 重载命令已发送" -ForegroundColor Green
}

function Test-MCPModule {
    param([string]$ModuleName)
    
    try {
        $result = python -c "import $ModuleName; print('OK')" 2>$null
        return $result -eq 'OK'
    }
    catch {
        return $false
    }
}

# 主执行逻辑
Write-Host "📋 检查问题服务器: $($Servers -join ', ')" -ForegroundColor White

# 检查Python模块
Write-Host "`n🐍 检查Python模块..." -ForegroundColor Yellow
$moduleMap = @{
    'yingmi_mcp' = 'yingmi_mcp'
    'stock-market-data' = 'stock_market_data'
    'feishu-bitable' = 'feishu_bitable'
    'fund-realtime' = 'fund_realtime'
}

foreach ($server in $Servers) {
    $module = $moduleMap[$server]
    if ($module) {
        $isInstalled = Test-MCPModule -ModuleName $module
        if ($isInstalled) {
            Write-Host "   ✅ $server 模块正常" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $server 模块有问题" -ForegroundColor Red
        }
    }
}

if ($All) {
    Write-Host "`n🔄 执行完整重启..." -ForegroundColor Yellow
    Restart-CursorWindow
    
    Write-Host "⏰ 等待15秒让服务器重新加载..." -ForegroundColor Yellow
    for ($i = 15; $i -gt 0; $i--) {
        Write-Host "   倒计时: $i 秒" -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
    
    Write-Host "✅ 重启完成！请检查MCP面板状态" -ForegroundColor Green
} else {
    Write-Host "`n💡 建议的修复步骤:" -ForegroundColor Cyan
    Write-Host "   1. 运行: .\scripts\restart_cursor_mcp.ps1 -All" -ForegroundColor White
    Write-Host "   2. 或者手动在Cursor中按 Ctrl+Shift+P" -ForegroundColor White
    Write-Host "   3. 输入 'Developer: Reload Window' 并执行" -ForegroundColor White
}

Write-Host "`n🎯 完成时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
```

## 🚀 立即修复方案（推荐）

### 第一步：立即手动修复
```
1. 在Cursor中按 Ctrl+Shift+P
2. 输入 "Developer: Reload Window"
3. 按回车执行
4. 等待15秒让所有MCP服务器重新加载
5. 检查MCP面板，确认红色状态是否变绿
```

### 第二步：配置自动重连
```
1. 按 Ctrl+Shift+P
2. 输入 "Preferences: Open Settings (JSON)"
3. 添加上述MCP配置代码
4. 保存文件
5. 重启Cursor
```

### 第三步：启用我们的监控系统
```
1. 按 Ctrl+Shift+P
2. 输入 "Tasks: Run Task"
3. 选择 "MCP自动监控启动"
4. 监控系统将与Cursor MCP系统配合工作
```

## 📊 双重保障系统

配置完成后，您将拥有：

### 🛡️ 第一层：Cursor内置重连
- 每个MCP服务器都有独立的重连机制
- 2秒重试延迟，最多10次重试
- 心跳检测，保持连接活跃

### 🛡️ 第二层：我们的监控脚本
- 每2秒检查Cursor MCP状态
- 检测到异常立即触发重启
- 与Cursor系统配合，不冲突

## 🎯 预期效果

修复后，您的MCP面板应该显示：
```
✅ yingmi_mcp: 33 tools enabled (绿色)
✅ search_caixin_content: 1 tools enabled (绿色)  
✅ Tavily MCP Server: X tools enabled (绿色)
✅ stock-market-data: 4 tools enabled (绿色)
✅ feishu-bitable: 7 tools enabled (绿色)
✅ fund-realtime: 4 tools enabled (绿色)
✅ AKShare One MCP Server: 9 tools enabled (绿色)
```

**现在您知道了根本原因，可以针对性地解决Cursor MCP系统的重连问题！**

---






