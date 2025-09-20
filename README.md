# AI基金投资报告中心

一个自动读取和展示MD格式投资报告的Web应用，具有现代化的用户界面和实时更新功能。

## ✨ 特性

- 🎨 **现代化UI** - 仿照参考网站的美观界面设计
- 📅 **按日期浏览** - 智能按日期组织报告，便于查找
- 📄 **报告预览** - 支持Markdown格式报告的在线预览
- 🔄 **实时更新** - 自动监控文件变化，实时刷新内容
- 📱 **响应式设计** - 完美支持手机、平板等移动设备
- 🌐 **远程访问** - 支持局域网和公网访问
- ⚡ **高性能** - 文件缓存机制，快速响应

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

### 3. 访问应用

- 本地访问: http://localhost:3000
- 局域网访问: http://你的IP地址:3000

## 📁 文件结构

```
项目根目录/
├── 报告/                    # 报告文件夹
│   ├── 20250918/           # 按日期组织的文件夹
│   │   └── *.md           # Markdown格式的报告文件
│   └── 20250919/
│       └── *.md
├── index.html              # 前端页面
├── script.js              # 前端脚本
├── server.js              # 后端服务
├── package.json           # 项目配置
└── README.md              # 说明文档
```

## 📝 报告文件命名规范

报告文件应按以下格式命名：
```
YYYYMMDD-类型-标题.md
```

示例：
- `20250919-专报-下周一基金投资行情分析与操作策略.md`
- `20250919-分析-半导体投资机会分析.md`

## 🌐 部署选项

### 选项1: 本地运行（局域网访问）

1. 确保防火墙允许3000端口
2. 运行 `npm start`
3. 手机连接同一WiFi，访问 `http://电脑IP:3000`

### 选项2: 使用ngrok（临时公网访问）

1. 安装ngrok: https://ngrok.com/
2. 启动应用: `npm start`
3. 新终端运行: `ngrok http 3000`
4. 使用提供的公网URL访问

### 选项3: 云服务器部署

#### 使用Railway部署

1. 注册 Railway 账号: https://railway.app/
2. 连接GitHub仓库
3. 自动部署，获得公网域名

#### 使用Vercel部署

1. 注册 Vercel 账号: https://vercel.com/
2. 导入项目
3. 配置环境变量（如需要）
4. 自动部署

#### 使用Heroku部署

1. 创建 `Procfile` 文件:
```
web: node server.js
```

2. 推送到Heroku:
```bash
heroku create your-app-name
git push heroku main
```

### 选项4: Docker部署

创建 `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

运行:
```bash
docker build -t ai-fund-report .
docker run -p 3000:3000 -v $(pwd)/报告:/app/报告 ai-fund-report
```

## 📱 移动端访问

应用已优化移动端体验：
- 响应式布局自动适配屏幕尺寸
- 触摸友好的交互设计
- 优化的字体和间距
- 流畅的滚动和动画效果

## 🔧 配置选项

### 环境变量

- `PORT`: 服务端口（默认: 3000）
- `NODE_ENV`: 运行环境（development/production）

### 自定义配置

在 `server.js` 中可以修改：
- `REPORTS_DIR`: 报告文件目录
- 文件监控设置
- API路由配置

## 🔄 自动更新机制

应用支持多种自动更新方式：

1. **文件监控**: 自动检测报告文件变化
2. **定时刷新**: 前端每5分钟自动刷新数据
3. **手动刷新**: 用户可随时点击刷新按钮

## 🛠️ 开发指南

### 添加新功能

1. **前端功能**: 修改 `index.html` 和 `script.js`
2. **后端API**: 在 `server.js` 中添加新路由
3. **样式调整**: 修改 `index.html` 中的CSS

### 调试技巧

```bash
# 查看服务器日志
npm start

# 开发模式（详细日志）
npm run dev
```

## ⚠️ 注意事项

1. **文件权限**: 确保应用对报告文件夹有读取权限
2. **端口冲突**: 如3000端口被占用，修改 `PORT` 环境变量
3. **防火墙**: 部署时确保相关端口已开放
4. **文件编码**: 确保MD文件使用UTF-8编码

## 🔒 安全建议

- 在生产环境中使用HTTPS
- 设置适当的CORS策略
- 定期更新依赖包
- 考虑添加访问认证（如需要）

## 📞 技术支持

如遇问题，请检查：
1. Node.js版本是否符合要求（推荐v16+）
2. 报告文件夹路径是否正确
3. 网络连接是否正常
4. 控制台是否有错误信息

## 📄 许可证

MIT License - 详见 LICENSE 文件
