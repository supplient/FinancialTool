# 理财资产配置工具使用说明

这是一个帮助您科学配置投资组合的工具，支持Web界面和命令行两种使用方式。

## 功能特性

- 🎯 **智能配置**: 根据总资产自动计算各类投资产品的配置金额
- 📱 **移动友好**: 完全响应式设计，支持手机、平板等移动设备
- 🎨 **美观界面**: 现代化UI设计，用户体验友好
- 🐍 **Python支持**: 完整的Python命令行工具
- 📊 **详细报告**: 提供文本格式的配置报告
- ✅ **数据验证**: 自动验证配置文件格式和数据有效性

## Web界面使用

### 1. 在线使用（GitHub Pages）
直接访问部署的GitHub Pages网站即可使用。

### 2. 本地使用
```bash
# 启动本地服务器
python main.py serve

# 指定端口
python main.py serve --port 3000

# 不自动打开浏览器
python main.py serve --no-browser
```

### 3. Web界面操作
1. 在输入框中填入您的总资产金额
2. 点击"计算配置"按钮
3. 查看详细的资产配置建议

## 命令行使用

### 1. 计算资产配置
```bash
# 基本计算
python main.py calc 100000

# 指定配置文件
python main.py calc 100000 --plan my_plan.json

# 保存报告到文件
python main.py calc 100000 --output report.txt
```

### 2. 验证配置文件
```bash
# 验证默认配置文件
python main.py validate

# 验证指定配置文件
python main.py validate --plan my_plan.json
```

### 3. 查看帮助
```bash
python main.py --help
python main.py calc --help
python main.py validate --help
python main.py serve --help
```

## 配置文件格式

`plan.json` 文件格式示例：
```json
[
  {
    "name": "产品名称",
    "percentage": 0.15,
    "id": "产品代码（可选）",
    "memo": "备注信息（可选）"
  }
]
```

### 字段说明
- `name`: 投资产品名称（必填）
- `percentage`: 占总资产的百分比，小数形式（必填）
- `id`: 产品代码，如基金代码、股票代码等（可选）
- `memo`: 备注信息（可选）

### 注意事项
- 所有 `percentage` 的总和应该等于 1.0（100%）
- `percentage` 必须在 0-1 之间
- 工具会自动验证配置文件的有效性

## 开发和部署

### 本地开发
```bash
# 克隆仓库
git clone <repository-url>
cd financial

# 使用uv管理依赖（推荐）
uv sync

# 或使用pip
pip install -e .

# 启动开发服务器
python main.py serve
```

### GitHub Pages部署
1. 将代码推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择源分支（通常是main分支）
4. 访问生成的GitHub Pages URL

### 文件结构
```
financial/
├── index.html          # 网站主页
├── styles.css          # 样式文件
├── script.js           # JavaScript逻辑
├── plan.json           # 资产配置数据
├── main.py            # Python主程序
├── pyproject.toml     # 项目配置
├── README.md          # 项目说明
└── USAGE.md           # 使用说明
```

## 示例场景

### 场景1：个人投资者
假设您有10万元资金需要配置：
```bash
python main.py calc 100000
```
输出：
```
============================================================
理财资产配置报告
============================================================
总资产: ¥100,000.00

资产配置详情:
------------------------------------------------------------
• 货币基金
  配置比例: 15.0%
  配置金额: ¥15,000.00

• 封闭式基金
  配置比例: 15.0%
  配置金额: ¥15,000.00
...
```

### 场景2：Web界面使用
1. 打开网站
2. 输入 "100000"
3. 点击计算
4. 查看美观的可视化配置结果

## 移动端适配

工具完全支持移动设备：
- 响应式布局自适应屏幕尺寸
- 触摸友好的操作界面
- 优化的字体大小和间距
- 快速加载和流畅动画

在手机上的使用体验与桌面端保持一致。

## 注意事项

⚠️ **风险提示**
- 此工具仅供参考，不构成投资建议
- 投资有风险，入市需谨慎
- 请根据自身风险承受能力调整配置

📱 **技术支持**
- 支持Chrome、Firefox、Safari、Edge等现代浏览器
- 移动端支持iOS Safari、Android Chrome等
- 需要启用JavaScript功能

🔒 **隐私保护**
- 所有计算在本地进行，不会上传您的资产信息
- 网站不收集任何个人数据
- 开源代码，透明可信
