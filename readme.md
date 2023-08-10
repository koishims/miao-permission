# @koishims/koishi-plugin-miao-permission

[![npm](https://img.shields.io/npm/v/koishi-plugin-miao-permission?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-miao-permission)

Koishi 权限管理系统

## 配置

- 管理员权限: 用于自定义最高权限
  - 你可以先设置为 `user.<id>` 赋予用户最高权限
  - 然后用命令给用户添加 `lp user @XXXX set luckperms.admin`
  - 然后再设置最高权限为 `luckperms.admin`

### 配置扩展

> 由于目前配置注入存在BUG 需要官方修复 所以用了一个不太完美的方案防止重复注入

- 给所有命令扩展了两个配置
  - `permission` 执行命令所需要的权限 (默认权限自动赋值为 `command.命令名称`)
  - `showWarning` 是否显示警告

## 指令

### 用户命令

- `lp user @User info` 查看用户权限
- `lp user @User set <permission>` 设置用户权限
- `lp user @User unset <permission>` 移除用户权限

### 频道命令

- `lp channel info` 查看权限
- `lp channel set <permission>` 设置频道权限
- `lp channel unset <permission>` 移除频道权限

### 权限组命令

- `lp listgroup` 查看权限组
- `lp creategroup <group>` 新建权限组
- `lp deletegroup <group>` 删除权限组
- `lp group <group> info` 查看组权限
- `lp group <group> set <permission>` 设置组权限
- `lp group <group> unset <permission>` 移除组权限

## 服务

提供了 Permission 服务

> 此服务默认检测用户命令权限

- `getUser(pid: string, uid: string, observed = false)` 获取用户
- `getGroups` 获取权限组列表
- `getGroup(name: string, observed = false)` 获取权限组
- `createGroup(name: string)` 创建权限组
- `deleteGroup(name: string)` 删除权限组
- `setPermission(model: Observed<any, any>, permission: string)` 设置权限
- `unsetPermission(model: Observed<any, any>, permission: string)` 删除权限 
  - 上面两个方法 需要传入 `Observed` 对象才能正常更新
  - User 和 Group 的 Observed 对象可以用服务的 `getUser`/`getGroup` 获取
    - 调用方法时 最后一个参数 传 `true` 即可
  - Channel 的 Observed 对象 可以用 `session.channel` 获取
- `hasPermission(permission: Iterable<string>, session: Session)` 判断是否有权限
