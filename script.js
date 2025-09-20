// 全局状态
let reportsData = {};
let currentDate = null;
let isConnected = false;

// API基础URL - 根据部署环境调整
const API_BASE_URL = window.location.origin + '/api';

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// 初始化应用
async function initializeApp() {
    updateStatus('⚪ 连接服务器中...', false);
    
    try {
        await loadReportsData();
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

// 加载报告数据
async function loadReportsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/reports`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        reportsData = await response.json();
        return reportsData;
    } catch (error) {
        console.error('加载报告数据失败:', error);
        // 如果API不可用，使用模拟数据
        reportsData = await loadMockData();
        return reportsData;
    }
}

// 模拟数据（当后端不可用时）
async function loadMockData() {
    return {
        "20250919": [
            {
                "filename": "20250919-专报-下周一基金投资行情分析与操作策略.md",
                "title": "下周一基金投资行情分析与操作策略",
                "type": "专报",
                "date": "2025-09-19",
                "size": "15.2KB",
                "preview": "本报告分析下周一基金投资市场的整体行情走势..."
            },
            {
                "filename": "20250919-专报-半导体投资机会分析.md",
                "title": "半导体投资机会分析",
                "type": "专报",
                "date": "2025-09-19",
                "size": "12.8KB",
                "preview": "随着科技板块的持续发展，半导体行业迎来新的投资机遇..."
            }
        ],
        "20250918": [
            {
                "filename": "20250918-专报-MCP股市大盘数据工具测试.md",
                "title": "MCP股市大盘数据工具测试",
                "type": "专报",
                "date": "2025-09-18",
                "size": "18.5KB",
                "preview": "全面测试自定义 stock-market-data MCP 工具的四大核心功能..."
            }
        ]
    };
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
        const response = await fetch(`${API_BASE_URL}/report/${date}/${encodeURIComponent(filename)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reportContent = await response.text();
        showReportPreview(filename, reportContent);
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
        await loadReportsData();
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

// 定期刷新数据（每5分钟）
setInterval(async () => {
    if (isConnected) {
        try {
            await loadReportsData();
            renderDateList();
        } catch (error) {
            console.log('自动刷新失败:', error);
        }
    }
}, 5 * 60 * 1000);
