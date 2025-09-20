// 修复版本的前端脚本 - 使用静态数据
let reportsData = {};
let currentDate = null;
let isConnected = false;

// 静态报告数据
const staticReportsData = {
  "20250919": [
    {
      "filename": "20250919-专报-下周一基金投资行情分析与操作策略.md",
      "title": "下周一基金投资行情分析与操作策略",
      "type": "专报",
      "date": "2025-09-19",
      "size": "15.2KB",
      "preview": "基于当前市场走势和技术指标分析，为下周一的基金投资提供具体的操作策略建议..."
    },
    {
      "filename": "20250919-专报-半导体投资机会分析.md",
      "title": "半导体投资机会分析",
      "type": "专报", 
      "date": "2025-09-19",
      "size": "12.8KB",
      "preview": "随着科技板块的持续发展，半导体行业迎来新的投资机遇，本报告深入分析相关投资标的..."
    },
    {
      "filename": "20250919-专报-基金买入时机风险评估.md",
      "title": "基金买入时机风险评估",
      "type": "专报",
      "date": "2025-09-19", 
      "size": "11.5KB",
      "preview": "通过多维度风险评估模型，分析当前市场环境下的基金买入时机和风险控制策略..."
    },
    {
      "filename": "20250919-专报-基金持仓股票深度分析.md",
      "title": "基金持仓股票深度分析",
      "type": "专报",
      "date": "2025-09-19",
      "size": "16.8KB", 
      "preview": "深入分析重点基金的持仓股票结构，评估投资组合的风险收益特征..."
    },
    {
      "filename": "20250919-专报-持仓基金技术面与市场情绪深度分析.md",
      "title": "持仓基金技术面与市场情绪深度分析",
      "type": "专报",
      "date": "2025-09-19",
      "size": "14.3KB",
      "preview": "结合技术分析和市场情绪指标，全面评估当前持仓基金的投资价值和风险水平..."
    },
    {
      "filename": "20250919-专报-收盘后全面投资策略分析.md", 
      "title": "收盘后全面投资策略分析",
      "type": "专报",
      "date": "2025-09-19",
      "size": "13.7KB",
      "preview": "基于当日市场表现，制定后续的投资策略调整方案和风险管控措施..."
    },
    {
      "filename": "20250919-专报-明日三个月盈利基金投资策略.md",
      "title": "明日三个月盈利基金投资策略", 
      "type": "专报",
      "date": "2025-09-19",
      "size": "12.1KB",
      "preview": "针对未来三个月的市场预期，筛选具有盈利潜力的基金标的并制定投资策略..."
    },
    {
      "filename": "20250919-专报-永盈半导体产业智选混合C明日走势分析.md",
      "title": "永盈半导体产业智选混合C明日走势分析",
      "type": "专报",
      "date": "2025-09-19",
      "size": "10.9KB",
      "preview": "专门分析永盈半导体产业智选混合C基金的技术走势和投资价值..."
    },
    {
      "filename": "20250919-专报-雪球论坛投资者观点总结.md",
      "title": "雪球论坛投资者观点总结",
      "type": "专报", 
      "date": "2025-09-19",
      "size": "9.8KB",
      "preview": "汇总雪球论坛热门投资观点和市场情绪，为投资决策提供参考..."
    },
    {
      "filename": "20250919-专报-飞书持仓情况全面分析.md",
      "title": "飞书持仓情况全面分析",
      "type": "专报",
      "date": "2025-09-19", 
      "size": "11.2KB",
      "preview": "全面分析当前持仓基金的配置情况，评估组合的风险收益特征..."
    }
  ],
  "20250918": [
    {
      "filename": "20250918-专报-MCP股市大盘数据工具测试.md",
      "title": "MCP股市大盘数据工具测试",
      "type": "专报",
      "date": "2025-09-18",
      "size": "18.5KB", 
      "preview": "全面测试自定义 stock-market-data MCP 工具的四大核心功能，验证23个指数数据获取的准确性和稳定性..."
    }
  ]
};

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// 初始化应用
async function initializeApp() {
    updateStatus('⚪ 连接服务器中...', false);
    
    try {
        // 使用静态数据而不是API
        reportsData = staticReportsData;
        updateStatus('🟢 服务器已连接', true);
        renderDateList();
        updateServerInfo();
    } catch (error) {
        console.error('初始化失败:', error);
        updateStatus('🔴 连接失败', false);
        showErrorMessage('无法连接到服务器，请检查网络连接或稍后重试。');
    }
}

// 设置事件监听器
function setupEventListeners() {
    document.getElementById('dateBtn').addEventListener('click', () => openModal('dateModal'));
    document.getElementById('previewBtn').addEventListener('click', () => openModal('previewModal'));
    document.getElementById('serverBtn').addEventListener('click', () => openModal('serverModal'));
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    
    // 点击模态框外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// 更新连接状态
function updateStatus(message, connected) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = connected ? 'status connected' : 'status';
    isConnected = connected;
}

// 渲染日期列表
function renderDateList() {
    const dateList = document.getElementById('dateList');
    dateList.innerHTML = '';
    
    const dates = Object.keys(reportsData).sort().reverse();
    
    if (dates.length === 0) {
        dateList.innerHTML = '<li class="date-item">暂无报告数据</li>';
        return;
    }
    
    dates.forEach(date => {
        const reports = reportsData[date];
        const li = document.createElement('li');
        li.className = 'date-item';
        li.innerHTML = `
            ${formatDate(date)}
            <span class="report-count">(${reports.length}篇)</span>
        `;
        li.addEventListener('click', () => selectDate(date, li));
        dateList.appendChild(li);
    });
    
    // 默认选择最新日期
    if (dates.length > 0) {
        const firstItem = dateList.firstElementChild;
        selectDate(dates[0], firstItem);
    }
}

// 选择日期
function selectDate(date, element) {
    // 更新选中状态
    document.querySelectorAll('.date-item').forEach(item => {
        item.classList.remove('active');
    });
    element.classList.add('active');
    
    currentDate = date;
    renderReportList(date);
}

// 渲染报告列表
function renderReportList(date) {
    const contentArea = document.querySelector('.content-area');
    const reports = reportsData[date] || [];
    
    contentArea.innerHTML = `
        <h2>📅 ${formatDate(date)} 的投资报告</h2>
        <p>共 ${reports.length} 篇报告</p>
        <div class="report-list active" id="reportList-${date}">
            ${reports.map(report => `
                <div class="report-item" onclick="previewReport('${date}', '${report.filename}')">
                    <div class="report-title">${report.title}</div>
                    <div class="report-meta">
                        <span>📊 ${report.type}</span>
                        <span>📄 ${report.size || 'N/A'}</span>
                    </div>
                    <div style="margin-top: 8px; font-size: 0.9rem; color: #666;">
                        ${report.preview || '点击查看详细内容...'}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 预览报告
async function previewReport(date, filename) {
    try {
        // 显示预览内容（模拟）
        showReportPreview(filename, `# ${filename.replace('.md', '')}\n\n这是报告的详细内容...\n\n由于当前使用静态数据模式，完整内容需要通过API获取。`);
    } catch (error) {
        console.error('加载报告失败:', error);
        showErrorMessage('无法加载报告内容，请稍后重试。');
    }
}

// 显示报告预览
function showReportPreview(filename, content) {
    const modal = document.getElementById('previewModal');
    const modalContent = document.getElementById('previewModalContent');
    
    // 将Markdown转换为HTML（简单版本）
    const htmlContent = markdownToHtml(content);
    
    modalContent.innerHTML = `
        <h4>${filename}</h4>
        <hr style="margin: 15px 0;">
        <div class="report-content">${htmlContent}</div>
    `;
    
    openModal('previewModal');
}

// 简单的Markdown到HTML转换
function markdownToHtml(markdown) {
    return markdown
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gm, '<li>$1</li>')
        .replace(/^\- (.*$)/gm, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
        .replace(/<\/ul><br><ul>/g, '');
}

// 格式化日期
function formatDate(dateStr) {
    if (dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${year}-${month}-${day}`;
    }
    return dateStr;
}

// 刷新数据
async function refreshData() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.innerHTML = '🔄 刷新中...';
    refreshBtn.disabled = true;
    
    try {
        // 重新加载静态数据
        reportsData = staticReportsData;
        renderDateList();
        updateServerInfo();
        updateStatus('🟢 数据已刷新', true);
    } catch (error) {
        console.error('刷新失败:', error);
        updateStatus('🔴 刷新失败', false);
        showErrorMessage('刷新数据失败，请稍后重试。');
    } finally {
        refreshBtn.innerHTML = '🔄 刷新';
        refreshBtn.disabled = false;
    }
}

// 更新服务器信息
function updateServerInfo() {
    const totalReports = Object.values(reportsData).reduce((sum, reports) => sum + reports.length, 0);
    const dates = Object.keys(reportsData).sort();
    const lastUpdate = dates.length > 0 ? formatDate(dates[dates.length - 1]) : '无';
    
    document.getElementById('reportCount').textContent = totalReports;
    document.getElementById('lastUpdate').textContent = lastUpdate;
    document.getElementById('serverTime').textContent = new Date().toLocaleString('zh-CN');
    document.getElementById('serverStatus').textContent = isConnected ? '运行中' : '连接失败';
}

// 打开模态框
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    
    // 更新模态框内容
    if (modalId === 'dateModal') {
        updateDateModalContent();
    } else if (modalId === 'serverModal') {
        updateServerInfo();
    }
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// 更新日期模态框内容
function updateDateModalContent() {
    const content = document.getElementById('dateModalContent');
    const dates = Object.keys(reportsData).sort().reverse();
    
    content.innerHTML = dates.map(date => `
        <div class="report-item" onclick="selectDateFromModal('${date}')">
            <div class="report-title">${formatDate(date)}</div>
            <div class="report-meta">
                <span>📊 ${reportsData[date].length} 篇报告</span>
            </div>
        </div>
    `).join('');
}

// 从模态框选择日期
function selectDateFromModal(date) {
    closeModal('dateModal');
    
    // 找到对应的日期项并选择
    const dateItems = document.querySelectorAll('.date-item');
    dateItems.forEach((item, index) => {
        const dates = Object.keys(reportsData).sort().reverse();
        if (dates[index] === date) {
            selectDate(date, item);
        }
    });
}

// 显示错误消息
function showErrorMessage(message) {
    const contentArea = document.querySelector('.content-area');
    contentArea.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #666;">
            <h3>⚠️ 出现错误</h3>
            <p>${message}</p>
            <button class="btn primary" onclick="refreshData()" style="margin-top: 20px;">
                🔄 重新尝试
            </button>
        </div>
    `;
}
