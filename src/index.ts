import { Context, Schema } from 'koishi'

import { Permission } from './service'
import { registerCommand } from './command'

declare module 'koishi' {
  interface Context {
    injectCommandConfig: boolean
  }
  namespace Command {
    interface Config {
      permission?: string
    }
  }
}

class MiaoPermission {
  private ctx: Context
  constructor(ctx: Context, config: MiaoPermission.Config) {
    this.ctx = ctx
    this.addCommandConfig(ctx)
    ctx.permissions.define(config.admin_permission, [])
    ctx.permissions.provide('*', async (name, session: any) => {
      return session.user.id || session.user?.permissions?.includes(config.admin_permission)
    })
    registerCommand(ctx, { permission: config.admin_permission, showWarning: false })
    ctx.plugin(Permission)
  }

  addCommandConfig(ctx: Context) {
    ctx.schema.extend('command', Schema.object({
      showWarning: Schema.boolean().description('警告信息是否提示用户。'),
    }), 900)
    ctx.schema.extend('command', Schema.object({
      permission: Schema.string().experimental().description('命令权限。'),
    }), 900)
  }
}

namespace MiaoPermission {
  export const inject = ['database'] as const
  export interface Config {
    admin_id: number
    admin_permission: string
  }
  export const Config: Schema<Config> = Schema.object({
    admin_id: Schema.number().experimental().description('管理员ID 此ID用户 可以无视所有权限检测').default(-1),
    admin_permission: Schema.string().experimental().description('管理员权限 拥有此权限 可以无视所有权限检测').default('luckperms.admin'),
  })
}

export default MiaoPermission
