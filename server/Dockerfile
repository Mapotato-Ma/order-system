# 使用官方 Node.js 基础镜像
FROM node:20

# 设置工作目录
WORKDIR /app

# 复制项目文件到工作目录
COPY . /app

# 安装项目依赖
RUN npm install

# 暴露端口
EXPOSE 3000

# 启动应用
CMD [ "npm", "start" ]
