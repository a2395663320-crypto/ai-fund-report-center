const fs = require('fs');
const path = require('path');

// 扫描报告文件的函数
async function scanReports() {
  try {
    const reportsDir = path.join(process.cwd(), '报告');
    
    if (!fs.existsSync(reportsDir)) {
      return {};
    }

    const reports = {};
    const dates = fs.readdirSync(reportsDir);
    
    for (const date of dates) {
      const datePath = path.join(reportsDir, date);
      const stat = fs.statSync(datePath);
      
      if (stat.isDirectory()) {
        const files = fs.readdirSync(datePath);
        const mdFiles = files.filter(file => file.endsWith('.md'));
        
        reports[date] = [];
        
        for (const file of mdFiles) {
          const filePath = path.join(datePath, file);
          const fileStat = fs.statSync(filePath);
          
          // 读取文件前几行作为预览
          const content = fs.readFileSync(filePath, 'utf8');
          const title = extractTitle(content, file);
          const preview = extractPreview(content);
          
          reports[date].push({
            filename: file,
            title: title,
            type: extractType(file),
            date: date,
            size: formatFileSize(fileStat.size),
            preview: preview,
            lastModified: fileStat.mtime
          });
        }
        
        // 按文件名排序
        reports[date].sort((a, b) => b.filename.localeCompare(a.filename));
      }
    }
    
    return reports;
  } catch (error) {
    console.error('扫描报告时出错:', error);
    return {};
  }
}

// 提取文件标题
function extractTitle(content, filename) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1].replace(/📊|📈|📉|🎯|⚠️|🔍/g, '').trim();
  }
  
  const match = filename.match(/^\d{8}-(.+)\.md$/);
  if (match) {
    return match[1].replace(/专报-/, '');
  }
  
  return filename.replace('.md', '');
}

// 提取文件类型
function extractType(filename) {
  if (filename.includes('专报')) return '专报';
  if (filename.includes('周报')) return '周报';
  if (filename.includes('月报')) return '月报';
  if (filename.includes('分析')) return '分析';
  return '报告';
}

// 提取预览内容
function extractPreview(content) {
  const plainText = content
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n\s*\n/g, '\n')
    .replace(/^\s+|\s+$/g, '')
    .split('\n')
    .filter(line => line.trim().length > 0)
    .slice(0, 3)
    .join(' ');
  
  return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
    const reports = await scanReports();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(reports)
    };
  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '获取报告列表失败' })
    };
  }
};
