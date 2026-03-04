# polymarket-mm-bot

自动化对冲做市脚本骨架（v0.3.0）。

## 模块
- `scanner`: 市场扫描与打分
- `quote`: 双边挂单
- `hedge`: 对冲引擎
- `risk`: 风控闸门
- `exchange`: 交易接口封装
- `store`: 持久化与日志
- `report`: 日报与告警

## 运行
```bash
pnpm install
pnpm dev
```

## 状态机
`IDLE -> SCAN -> QUOTE -> MONITOR -> HEDGE -> REBALANCE -> PAUSE -> STOP`

## v0.3.0 已完成
- 新增挂单计划生成器（双边 YES/NO 报价）
- 新增 TTL 过期拆分逻辑（到期单自动进入过期队列）
- `main` 已接入 scanner -> quote 过程与日志输出

## v0.2.0 已完成
- 市场扫描模块：mock 行情拉取
- 候选市场打分：价格平衡/价差/深度/波动/奖励池/竞争度
- 风控前置过滤：仅保留可执行候选池（按 max_markets_active 截断）

## 下一步
- 接入真实市场数据与订单簿
- 完成下单/撤单接口与库存同步
- 加入对冲超时与强制平仓
