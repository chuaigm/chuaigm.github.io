# 项目约定

## 换行符

改动代码前先确认目标文件当前的换行风格，编辑后必须保持一致，不要顺手转换。

`games/space_odyssey/index.html` 全部是 **LF**（CRLF 数量为 0，无 BOM）。

## 版本号

改动代码后同步更新 `games/space_odyssey/index.html` 顶部的 `const VERSION`，格式为 `YYYYMMDD-HHMM`（取修改当时的时间，如 `20261018-1726`）。游戏右下角会显示该版本号。

## 任务完成通知

任务做完必须弹窗通知用户，PowerShell 命令：

```powershell
$sid = (Get-Process -Id $PID).SessionId; msg $sid /TIME:25 "改动摘要"
```

- 只发给用户当前所在的会话。**不要**用 `msg *`，那会广播到所有已登录会话，影响面过大。
- **不要**用 .NET 的 `System.Windows.Forms.MessageBox` 或 WinForms `Form`：在这个执行环境里窗口不会渲染到用户桌面，而且模态窗口会让工具调用一直阻塞到超时。曾因此误判「弹窗已显示」。