# polymarket-mm-bot

自动化对冲做市脚本骨架（v0.1.0）。

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

## 下一步
- 接入真实市场数据与订单簿
- 完成双边挂单与撤单逻辑
- 加入对冲超时与强制平仓
