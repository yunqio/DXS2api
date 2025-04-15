# DXS2API - DXS DeepSeek to API

DXS2API 是一个代理服务器，可以将 DXS DeepSeek Web 聊天请求转换为 API 格式。它支持多种模型和网络搜索功能，可通过 Docker 部署。

## 功能特点

- 支持四种模型类型：
  - `ds-v3`: DeepSeek V3 标准模型
  - `ds-r1`: DeepSeek R1 模型
  - `ds-v3-search`: 带网络搜索功能的 DeepSeek V3 模型
  - `ds-r1-search`: 带网络搜索功能的 DeepSeek R1 模型
- 兼容 OpenAI API 格式
- 支持流式响应
- 速率限制保护
- Token 有效性检查
- 支持 Docker 部署

## 系统要求

- Node.js 18+ (开发环境)
- Docker 和 Docker Compose (部署环境)
- DXS DeepSeek API token(s)

## API 接口

### 聊天补全接口

**POST /v1/chat/completions**

请求体：
```json
{
  "model": "ds-v3", // 或 "ds-r1", "ds-v3-search", "ds-r1-search"
  "messages": [
    {
      "role": "user",
      "content": "你好，请问有什么可以帮助你的吗？"
    }
  ],
  "stream": true, // 或 false
  "features": {
    "image_generation": false,
    "code_interpreter": false,
    "web_search": false // 对于带 -search 后缀的模型会自动设置为 true
  }
}
```

Authorization 请求头：
```
Authorization: Bearer YOUR_DXSDEEPSEEK_TOKEN
```

### Token 检查接口

**POST /token/check**

请求体：
```json
{
  "token": "YOUR_DXSDEEPSEEK_TOKEN"
}
```

响应：
```json
{
  "live": true // 如果 token 有效，否则为 false
}
```

## 部署方法

### Docker 部署

1. 克隆仓库：
```bash
git clone https://github.com/yunqio/dxs2api.git
cd dxs2api
```

2. 基于示例创建 .env 文件：
```bash
cp .env.example .env
```

3. 编辑 .env 文件，配置您的设置：
```
PORT=8000
DXS_AUTHORIZATION=your_token_here
DEEPSEEK_API_URL=https://chat.zju.edu.cn
RATE_LIMIT=60
```

4. 构建并启动 Docker 容器：
```bash
docker-compose up -d
```

API 服务将在 `http://localhost:8000` 可用。

### 环境变量

| 变量 | 描述 | 默认值 |
|----------|-------------|---------|
| PORT | 服务器运行端口 | 8000 |
| DXS_AUTHORIZATION | 默认认证令牌，多个令牌用逗号分隔 | "" |
| DEEPSEEK_API_URL | DeepSeek API URL | https://chat.zju.edu.cn |
| RATE_LIMIT | 每分钟最大请求次数 | 60 |

## 开发指南

1. 安装依赖：
```bash
npm install
```

2. 开发模式运行：
```bash
npm run dev
```

3. 构建生产版本：
```bash
npm run build
```

4. 启动生产服务器：
```bash
npm start
```

## 注意事项

- 可以在 `DXS_AUTHORIZATION` 环境变量中提供多个令牌，以逗号分隔列表形式。API 将为每个请求随机选择一个。
- 使用带有 `-search` 后缀的模型时，网络搜索功能将自动启用。
- 对于生产部署，建议设置 Nginx 作为反向代理并启用 SSL。
- 确保请求中的模型名称格式正确，DS-V3 使用 `ds-v3`，DS-R1 使用 `ds-r1`。
- 请求的 features 字段需要正确设置，特别是对 web_search 参数。

## 可能的问题和解决方案

如果在调用模型时遇到问题：

1. 确保您的 token 有效且格式正确
2. 检查请求模型名称是否使用了正确的格式 (ds-v3, ds-r1, ds-v3-search, ds-r1-search)
3. 确保 features 字段格式正确
4. 查看服务器日志以获取更详细的错误信息

## 致谢

本项目灵感来源于 [DeepSeek-Free-API](https://github.com/LLM-Red-Team/deepseek-free-api)。

# DS-V3 API 测试工具

这个简单的测试工具用于验证DS-V3 API的基本功能，包括常规响应和流式响应模式。

## 功能特点

- 测试DS-V3模型常规(非流式)响应
- 测试DS-V3模型流式响应
- 提供详细的测试报告和错误信息
- 自动检查响应格式和内容

## 环境要求

- Node.js (v14.0.0+)
- npm

## 快速开始

### 安装依赖

在Windows系统上，直接运行安装脚本：

```bash
install-test-deps.bat
```

或者手动安装所需依赖：

```bash
npm install axios
```

### 运行测试

```bash
node test-ds-v3.js <API_URL> <API_TOKEN>
```

- `<API_URL>`: DS-V3 API的基本URL地址
- `<API_TOKEN>`: 用于API认证的令牌

例如：

```bash
node test-ds-v3.js http://localhost:8000 sk-xxxxxxxxxxxxxxxxxxxxxxx
```

## 测试内容

1. **常规响应测试**：
   - 发送基本请求到`/v1/chat/completions`端点
   - 验证响应格式和内容
   - 检查模型输出

2. **流式响应测试**：
   - 使用`stream=true`参数测试流式输出
   - 验证数据块的格式和内容
   - 监测流式传输的稳定性

## 帮助和支持

如有问题，请参考DeepSeek API文档或开源社区资源。 
