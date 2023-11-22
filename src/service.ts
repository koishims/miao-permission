import { Context, Observed, Service, Session, observe, remove } from "koishi";
import { logger } from "./utils";
import type { PermGroup } from "@koishijs/plugin-admin";

declare module 'koishi' {
  interface Context {
    permission: Permission
  }
}

Context.service('permission')

export class Permission extends Service {
  constructor(ctx: Context) {
    super(ctx, 'permission')
    ctx.before("command/execute", async (argv) => {
      const { session, options, command } = argv
      if (!command.config.permission) return
      function sendHint(message: string, ...param: any[]) {
        return command.config.showWarning ? session.text(message, param) : ''
      }
      logger.debug(command.name, command.parent?.name || '主命令', session.permissions, await this.ctx.permissions.test(session.permissions, session as any))
      if (!await this.hasPermission(command.config.permission, session as any)) {
        return sendHint('internal.low-authority')
      }
    })
  }

  async getUser(pid: string, uid: string, observed = false) {
    let user = await this.ctx.database.getUser(pid, uid, ['id', 'permissions'])
    if (!user) {
      user = await this.ctx.database.createUser(pid, uid, {})
    }
    return observed ? observe(user, diff => this.ctx.database.setUser(pid, uid, diff)) : user
  }

  async createGroup(name: string) {
    const item = await this.ctx.database.create('group', { name })
    return item.id;
  }
  async getGroups() {
    return await this.ctx.database.get('group', {});
  }
  async getGroup(name: string, observed = false): Promise<PermGroup> {
    let groups = await this.ctx.database.get('group', { name }, ['id', 'name', 'permissions'])
    if (!groups.length) {
      throw new Error(`权限组 ${name} 未找到.`)
    }
    let group = groups[0]
    return observed ? observe(group, diff => this.ctx.database.set('group', { name }, diff as any)) : group
  }
  async deleteGroup(name: string) {
    let group = await this.getGroup(name)
    let groupPermission = `group.${group.id}`
    for (const user of await this.ctx.database.get('user', { permissions: { $el: groupPermission } }, ['id', 'permissions'])) {
      remove(user.permissions, groupPermission)
      await this.ctx.database.set('user', user.id, { permissions: user.permissions })
    }
    return await this.ctx.database.remove('group', group.id)
  }

  async setPermission(model: Observed<any, any>, permission: string) {
    let permissionsSet = new Set(model.permissions);
    permissionsSet.add(permission)
    model.permissions = [...permissionsSet]
    model.$update()
  }
  async unsetPermission(model: Observed<any, any>, permission: string) {
    model.permissions.splice(model.permissions.indexOf(permission), 1)
    model.$update()
  }
  async hasPermission(permission: Iterable<string>, session: Session) {
    if (typeof permission == 'string') permission = [permission]
    return this.ctx.permissions.test(permission, session)
  }

  async setMeta(model: Observed<any, any>, meta: string) {
    this.setPermission(model, `meta.${meta}`)
  }
  async unsetMeta(model: Observed<any, any>, meta: string) {
    this.unsetPermission(model, `meta.${meta}`)
  }
  async hasMeta(meta: string, session: Session) {
    return this.hasPermission(`meta.${meta}`, session)
  }
}
