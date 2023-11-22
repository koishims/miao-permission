# @koishims/koishi-plugin-miao-permission

[![npm](https://img.shields.io/npm/v/koishi-plugin-miao-permission?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-miao-permission)

Koishi 权限管理系统

## 配置

### 配置最高权限

- 管理员用户: 此 ID 的用户默认拥有最高权限
- 管理员权限: 用于自定义最高权限 拥有此权限的用户拥有最高权限
  - 你可以在权限页面新增一个权限组 比如 `admin`
  - 然后给权限组添加权限 `luckperms.admin`
  - 然后将用户添加到权限组 `admin`

### 配置扩展

> <del>由于目前配置注入存在BUG 需要官方修复 所以用了一个不太完美的方案防止重复注入</del>
> 官方已修复

- 给所有命令扩展了两个配置
  - `permission` 执行命令所需要的权限
    - 默认权限为 `command.命令名称` 若未设置 用户默认拥有此权限
    - 如果配置了权限 那么用户需要拥有此权限之后才能执行命令
  - `showWarning` 是否显示警告(默认存在配置项 加一个界面配置而已)

## 指令

### 用户命令

- `lp user @User permission info` 查看用户权限
- `lp user @User permission set <permission>` 设置用户权限
- `lp user @User permission unset <permission>` 移除用户权限

> `permission` 可以忽略

### 频道命令

- `lp channel permission info` 查看权限
- `lp channel permission et <permission>` 设置频道权限
- `lp channel permission unset <permission>` 移除频道权限

> `permission` 可以忽略

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
