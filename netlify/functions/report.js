const fs = require('fs');
const path = require('path');

// Netlify Function处理器
exports.handler = async (event, context) => {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'text/plain; charset=utf-8'
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
    // 从路径中提取参数
    const pathParts = event.path.split('/');
    const date = pathParts[pathParts.length - 2];
    const filename = decodeURIComponent(pathParts[pathParts.length - 1]);
    
    if (!date || !filename) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: '缺少必要参数' })
      };
    }
    
    const filePath = path.join(process.cwd(), '报告', date, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return {
        statusCode: 404,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: '报告文件不存在' })
      };
    }
    
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    
    return {
      statusCode: 200,
      headers,
      body: content
    };
  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: '获取报告内容失败' })
    };
  }
};
