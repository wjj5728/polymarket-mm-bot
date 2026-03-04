# polymarket-mm-bot

自动化对冲做市脚本骨架（v1.0.0）。

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
EXCHANGE_MODE=mock pnpm dev
```

## 状态机
`IDLE -> SCAN -> QUOTE -> MONITOR -> HEDGE -> REBALANCE -> PAUSE -> STOP`

## v1.0.0 已完成
- 新增交易适配器接口：`ExchangeAdapter`
- 新增 `mock/real` 双模式切换（`EXCHANGE_MODE`）
- 新增幂等下单键，重复请求命中已存在开放订单
- 预留真实交易实现骨架：`src/exchange/real.ts`

## v0.9.0 已完成
- 新增参数网格回测脚本：`pnpm grid-backtest`
- 支持组合扫描（fillProbability / maxFillSize / feeRate）
- 输出最优参数建议与完整网格报告（JSON/CSV）

## v0.8.0 已完成
- 新增 PnL 估算器（gross/fee/net）
- 回测脚本新增净收益统计（total/avg）
- 新增回测报告导出：`reports/*.json` + `reports/*.csv`

## v0.7.0 已完成
- 单边成交模拟升级为“概率填单 + 部分成交规模”
- 新增回测脚本：`pnpm backtest`
- 输出关键统计：填单次数、平均成交规模、对冲成功率

## v0.6.0 已完成
- 新增对冲超时判定（hedge timeout）
- 新增强制平衡器（rebalancer）：超时时批量撤单
- 新增风险快照与暂停判定（回撤/延迟触发 PAUSE）

## v0.5.0 已完成
- 新增单边成交模拟器（用于验证对冲流程）
- 新增对冲触发器：单边成交 -> 反向补单
- `main` 接入 hedge 状态流，输出对冲执行日志

## v0.4.0 已完成
- 新增 mock 交易接口：下单/撤单/开放订单查询
- 新增挂单执行器：一键执行 YES/NO 双边下单
- 新增库存状态：活跃挂单对、累计撤单统计
- TTL 到期自动撤单并更新库存

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
