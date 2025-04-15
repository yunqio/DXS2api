#!/bin/bash

# DXS2API 简化部署脚本
# 适用于Ubuntu服务器

# 设置颜色代码
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}      DXS2API 部署脚本 (简化版)      ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# 检查是否安装了Docker
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}正在安装Docker和Docker Compose...${NC}"
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose
    echo -e "${GREEN}Docker安装完成${NC}"
else
    echo -e "${GREEN}Docker已安装${NC}"
fi

# 创建.env文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}创建.env配置文件...${NC}"
    cp .env.example .env
    
    echo -e "${YELLOW}请输入您的DeepSeek API token:${NC}"
    read -p "Token: " api_token
    
    # 更新.env文件中的token
    sed -i "s/DXS_AUTHORIZATION=your_token_here/DXS_AUTHORIZATION=$api_token/" .env
    echo -e "${GREEN}.env文件已创建${NC}"
else
    echo -e "${GREEN}.env文件已存在${NC}"
fi

# 使用Docker Compose构建和启动服务
echo -e "${YELLOW}使用Docker构建和启动服务...${NC}"
sudo docker-compose up -d

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}      DXS2API 部署完成!              ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "API服务现在应该可以通过以下地址访问:"
echo -e "http://$(curl -s ifconfig.me):8000"
echo ""
echo -e "要查看日志，请运行: ${YELLOW}docker-compose logs -f${NC}"
echo -e "要停止服务，请运行: ${YELLOW}docker-compose down${NC}" 