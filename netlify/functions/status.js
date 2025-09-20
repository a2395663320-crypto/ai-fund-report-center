const fs = require('fs');
const path = require('path');

// 扫描报告统计
async function getReportsStats() {
  try {
    const reportsDir = path.join(process.cwd(), '报告');
    
    if (!fs.existsSync(reportsDir)) {
      return {
        totalReports: 0,
        totalDates: 0,
        latestDate: null
      };
    }

    let totalReports = 0;
    const dates = fs.readdirSync(reportsDir).filter(item => {
      const itemPath = path.join(reportsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
    
    for (const date of dates) {
      const datePath = path.join(reportsDir, date);
      const files = fs.readdirSync(datePath);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      totalReports += mdFiles.length;
    }
    
    const sortedDates = dates.sort();
    
    return {
      totalReports,
      totalDates: dates.length,
      latestDate: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null
    };
  } catch (error) {
    console.error('获取统计信息失败:', error);
    return {
      totalReports: 0,
      totalDates: 0,
      latestDate: null
    };
  }
}

// Netlify Function处理器
exports.handler = async (event, context) => {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const stats = await getReportsStats();
    
    const response = {
      status: 'running',
      totalReports: stats.totalReports,
      totalDates: stats.totalDates,
      lastUpdate: new Date(),
      serverTime: new Date(),
      latestDate: stats.latestDate
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '获取服务器状态失败' })
    };
  }
};
