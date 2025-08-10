#!/usr/bin/env python3
"""
理财资产配置工具
提供本地开发服务器和数据处理功能
"""

import json
import http.server
import socketserver
import webbrowser
import argparse
import sys
from pathlib import Path
from typing import List, Dict, Any


class FinancialCalculator:
    """理财计算器核心类"""
    
    def __init__(self, plan_file: str = "plan.json"):
        self.plan_file = Path(plan_file)
        self.asset_plan = self.load_plan()
    
    def load_plan(self) -> List[Dict[str, Any]]:
        """加载资产配置计划"""
        try:
            with open(self.plan_file, 'r', encoding='utf-8') as f:
                plan = json.load(f)
            self.validate_plan(plan)
            return plan
        except FileNotFoundError:
            print(f"错误: 找不到配置文件 {self.plan_file}")
            return []
        except json.JSONDecodeError as e:
            print(f"错误: 配置文件格式错误 - {e}")
            return []
    
    def validate_plan(self, plan: List[Dict[str, Any]]) -> None:
        """验证资产配置计划"""
        if not isinstance(plan, list):
            raise ValueError("配置文件必须是数组格式")
        
        total_percentage = 0
        for i, asset in enumerate(plan):
            if not isinstance(asset, dict):
                raise ValueError(f"资产配置 {i} 必须是对象格式")
            
            required_fields = ['name', 'percentage']
            for field in required_fields:
                if field not in asset:
                    raise ValueError(f"资产配置 {i} 缺少必填字段: {field}")
            
            if not isinstance(asset['percentage'], (int, float)):
                raise ValueError(f"资产配置 {i} 的百分比必须是数字")
            
            if asset['percentage'] < 0 or asset['percentage'] > 1:
                raise ValueError(f"资产配置 {i} 的百分比必须在 0-1 之间")
            
            total_percentage += asset['percentage']
        
        if abs(total_percentage - 1.0) > 0.001:
            print(f"警告: 总百分比为 {total_percentage:.3f}，不等于 1.0")
    
    def calculate_allocation(self, total_assets: float) -> List[Dict[str, Any]]:
        """计算资产配置"""
        if total_assets <= 0:
            raise ValueError("总资产必须大于0")
        
        result = []
        for asset in self.asset_plan:
            allocation = {
                'name': asset['name'],
                'percentage': asset['percentage'],
                'amount': total_assets * asset['percentage'],
                'id': asset.get('id', ''),
                'memo': asset.get('memo', '')
            }
            result.append(allocation)
        
        return result
    
    def generate_report(self, total_assets: float) -> str:
        """生成文本格式的配置报告"""
        allocation = self.calculate_allocation(total_assets)
        
        report = [
            "=" * 60,
            "理财资产配置报告",
            "=" * 60,
            f"总资产: ¥{total_assets:,.2f}",
            "",
            "资产配置详情:",
            "-" * 60
        ]
        
        for asset in allocation:
            report.append(f"• {asset['name']}")
            report.append(f"  配置比例: {asset['percentage']:.1%}")
            report.append(f"  配置金额: ¥{asset['amount']:,.2f}")
            if asset['id']:
                report.append(f"  产品代码: {asset['id']}")
            if asset['memo']:
                report.append(f"  备注: {asset['memo']}")
            report.append("")
        
        # 添加分类汇总
        categories = self._categorize_assets(allocation)
        if len(categories) > 1:
            report.extend([
                "分类汇总:",
                "-" * 60
            ])
            for category, data in categories.items():
                report.append(f"• {category}: {data['percentage']:.1%} (¥{data['amount']:,.2f})")
            report.append("")
        
        report.extend([
            "=" * 60,
            "投资有风险，入市需谨慎"
        ])
        
        return "\n".join(report)
    
    def _categorize_assets(self, allocation: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
        """资产分类汇总"""
        categories = {}
        
        for asset in allocation:
            category = self._get_asset_category(asset['name'])
            if category not in categories:
                categories[category] = {'amount': 0, 'percentage': 0}
            
            categories[category]['amount'] += asset['amount']
            categories[category]['percentage'] += asset['percentage']
        
        return categories
    
    def _get_asset_category(self, name: str) -> str:
        """资产分类"""
        if 'ETF' in name or '指数' in name:
            return '指数基金'
        elif '基金' in name:
            return '基金'
        elif 'REIT' in name:
            return 'REITs'
        elif '债' in name or '国债' in name:
            return '债券'
        elif '黄金' in name:
            return '贵金属'
        else:
            return '其他'


class LocalServer:
    """本地开发服务器"""
    
    def __init__(self, port: int = 8000, directory: str = "."):
        self.port = port
        self.directory = Path(directory)
    
    def start(self, open_browser: bool = True):
        """启动本地服务器"""
        try:
            # 切换到指定目录
            import os
            os.chdir(self.directory)
            
            # 创建服务器
            handler = http.server.SimpleHTTPRequestHandler
            with socketserver.TCPServer(("", self.port), handler) as httpd:
                url = f"http://localhost:{self.port}"
                print(f"本地服务器已启动: {url}")
                print("按 Ctrl+C 停止服务器")
                
                if open_browser:
                    webbrowser.open(url)
                
                httpd.serve_forever()
        
        except KeyboardInterrupt:
            print("\n服务器已停止")
        except OSError as e:
            if e.errno == 48:  # Address already in use
                print(f"错误: 端口 {self.port} 已被占用，请尝试其他端口")
            else:
                print(f"错误: {e}")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="理财资产配置工具")
    subparsers = parser.add_subparsers(dest='command', help='可用命令')
    
    # 计算命令
    calc_parser = subparsers.add_parser('calc', help='计算资产配置')
    calc_parser.add_argument('total_assets', type=float, help='总资产金额')
    calc_parser.add_argument('--plan', default='plan.json', help='配置文件路径')
    calc_parser.add_argument('--output', help='输出报告到文件')
    
    # 验证命令
    validate_parser = subparsers.add_parser('validate', help='验证配置文件')
    validate_parser.add_argument('--plan', default='plan.json', help='配置文件路径')
    
    # 服务器命令
    serve_parser = subparsers.add_parser('serve', help='启动本地开发服务器')
    serve_parser.add_argument('--port', type=int, default=8000, help='服务器端口')
    serve_parser.add_argument('--no-browser', action='store_true', help='不自动打开浏览器')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    if args.command == 'calc':
        # 计算资产配置
        calc = FinancialCalculator(args.plan)
        if not calc.asset_plan:
            sys.exit(1)
        
        try:
            report = calc.generate_report(args.total_assets)
            
            if args.output:
                with open(args.output, 'w', encoding='utf-8') as f:
                    f.write(report)
                print(f"报告已保存到: {args.output}")
            else:
                print(report)
        
        except ValueError as e:
            print(f"错误: {e}")
            sys.exit(1)
    
    elif args.command == 'validate':
        # 验证配置文件
        calc = FinancialCalculator(args.plan)
        if calc.asset_plan:
            print("✓ 配置文件验证通过")
            print(f"共有 {len(calc.asset_plan)} 个资产配置")
            
            total_percentage = sum(asset['percentage'] for asset in calc.asset_plan)
            print(f"总百分比: {total_percentage:.3f}")
        else:
            print("✗ 配置文件验证失败")
            sys.exit(1)
    
    elif args.command == 'serve':
        # 启动开发服务器
        server = LocalServer(args.port)
        server.start(not args.no_browser)


if __name__ == "__main__":
    main()
