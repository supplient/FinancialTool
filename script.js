// 理财资产配置工具 JavaScript
class FinancialCalculator {
    constructor() {
        this.assetPlan = [];
        this.init();
    }

    async init() {
        await this.loadAssetPlan();
        this.bindEvents();
        this.setupInput();
    }

    // 加载资产配置计划
    async loadAssetPlan() {
        try {
            const response = await fetch('plan.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.assetPlan = await response.json();
            console.log('资产配置计划加载成功:', this.assetPlan);
        } catch (error) {
            console.error('加载资产配置计划失败:', error);
            this.showError('无法加载资产配置数据，请检查网络连接或刷新页面重试。');
        }
    }

    // 绑定事件
    bindEvents() {
        const calculateBtn = document.getElementById('calculateBtn');
        const totalAssetsInput = document.getElementById('totalAssets');

        calculateBtn.addEventListener('click', () => this.calculateAssets());
        
        // 回车键计算
        totalAssetsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.calculateAssets();
            }
        });

        // 实时验证输入
        totalAssetsInput.addEventListener('input', (e) => {
            this.validateInput(e.target);
        });
    }

    // 设置输入框
    setupInput() {
        const input = document.getElementById('totalAssets');
        input.placeholder = '例如：100000';
        
        // 添加千分位分隔符显示
        input.addEventListener('blur', (e) => {
            if (e.target.value) {
                const value = parseFloat(e.target.value.replace(/,/g, ''));
                if (!isNaN(value)) {
                    e.target.value = this.formatNumber(value, 2);
                }
            }
        });

        input.addEventListener('focus', (e) => {
            // 聚焦时移除格式化，方便编辑
            const value = e.target.value.replace(/,/g, '');
            e.target.value = value;
        });
    }

    // 验证输入
    validateInput(input) {
        const value = parseFloat(input.value.replace(/,/g, ''));
        const errorMessage = document.querySelector('.error-message') || this.createErrorMessage();
        
        if (input.value && (isNaN(value) || value < 0)) {
            input.style.borderColor = '#e74c3c';
            errorMessage.textContent = '请输入有效的正数金额';
            errorMessage.style.display = 'block';
            return false;
        } else {
            input.style.borderColor = '#e1e5e9';
            errorMessage.style.display = 'none';
            return true;
        }
    }

    // 创建错误消息元素
    createErrorMessage() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        const inputGroup = document.querySelector('.input-group');
        inputGroup.appendChild(errorDiv);
        return errorDiv;
    }

    // 显示错误
    showError(message) {
        const errorMessage = document.querySelector('.error-message') || this.createErrorMessage();
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    // 计算资产配置
    calculateAssets() {
        const totalAssetsInput = document.getElementById('totalAssets');
        const totalAssets = parseFloat(totalAssetsInput.value.replace(/,/g, ''));

        // 验证输入
        if (!this.validateInput(totalAssetsInput)) {
            return;
        }

        if (!totalAssets || totalAssets <= 0) {
            this.showError('请输入有效的总资产金额');
            return;
        }

        if (this.assetPlan.length === 0) {
            this.showError('资产配置数据未加载，请刷新页面重试');
            return;
        }

        // 显示加载状态
        this.setLoadingState(true);

        // 模拟计算延迟，提升用户体验
        setTimeout(() => {
            this.displayResults(totalAssets);
            this.setLoadingState(false);
        }, 300);
    }

    // 设置加载状态
    setLoadingState(loading) {
        const container = document.querySelector('.main-content');
        const button = document.getElementById('calculateBtn');
        
        if (loading) {
            container.classList.add('loading');
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 计算中...';
        } else {
            container.classList.remove('loading');
            button.innerHTML = '<i class="fas fa-calculator"></i> 计算配置';
        }
    }

    // 显示计算结果
    displayResults(totalAssets) {
        const resultsSection = document.getElementById('results');
        const totalAmountElement = document.getElementById('totalAmount');
        const assetsListElement = document.getElementById('assetsList');

        // 显示总金额
        totalAmountElement.textContent = `¥${this.formatNumber(totalAssets)}`;

        // 计算每个资产的金额
        const calculatedAssets = this.assetPlan.map(asset => ({
            ...asset,
            amount: totalAssets * asset.percentage
        }));

        // 验证百分比总和
        const totalPercentage = this.assetPlan.reduce((sum, asset) => sum + asset.percentage, 0);
        if (Math.abs(totalPercentage - 1) > 0.001) {
            console.warn(`百分比总和不等于100%: ${(totalPercentage * 100).toFixed(2)}%`);
        }

        // 渲染资产列表
        assetsListElement.innerHTML = calculatedAssets.map(asset => 
            this.createAssetCard(asset)
        ).join('');

        // 显示结果区域
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 添加动画效果
        this.animateCards();
    }

    // 创建资产卡片
    createAssetCard(asset) {
        const hasId = asset.id && asset.id.trim() !== '';
        const hasMemo = asset.memo && asset.memo.trim() !== '';

        return `
            <div class="asset-card">
                <div class="asset-header">
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-percentage">${(asset.percentage * 100).toFixed(1)}%</div>
                </div>
                <div class="asset-amount">¥${this.formatNumber(asset.amount)}</div>
                <div class="asset-details">
                    ${hasId ? `<div class="asset-id">代码: ${asset.id}</div>` : ''}
                    ${hasMemo ? `<div class="asset-memo">${asset.memo}</div>` : ''}
                </div>
            </div>
        `;
    }

    // 卡片动画
    animateCards() {
        const cards = document.querySelectorAll('.asset-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // 格式化数字（千分位分隔符）
    formatNumber(number, decimals = 2) {
        return new Intl.NumberFormat('zh-CN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    // 获取资产配置摘要
    getAssetSummary() {
        if (this.assetPlan.length === 0) return null;

        const categories = {};
        this.assetPlan.forEach(asset => {
            const category = this.categorizeAsset(asset.name);
            if (!categories[category]) {
                categories[category] = { count: 0, percentage: 0 };
            }
            categories[category].count++;
            categories[category].percentage += asset.percentage;
        });

        return categories;
    }

    // 资产分类
    categorizeAsset(name) {
        if (name.includes('ETF') || name.includes('指数')) return '指数基金';
        if (name.includes('基金')) return '基金';
        if (name.includes('REIT')) return 'REITs';
        if (name.includes('债') || name.includes('国债')) return '债券';
        if (name.includes('黄金')) return '贵金属';
        return '其他';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new FinancialCalculator();
});

// 添加一些实用功能
window.addEventListener('beforeunload', (e) => {
    const input = document.getElementById('totalAssets');
    if (input && input.value.trim() !== '') {
        // 保存用户输入到本地存储
        localStorage.setItem('financialTotalAssets', input.value);
    }
});

// 页面加载时恢复用户输入
window.addEventListener('load', () => {
    const savedValue = localStorage.getItem('financialTotalAssets');
    if (savedValue) {
        const input = document.getElementById('totalAssets');
        if (input) {
            input.value = savedValue;
        }
    }
});
