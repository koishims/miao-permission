import { Command, Context, Schema, observe } from 'koishi'
import { Permission } from './service'
import { logger } from './utils'

declare module 'koishi' {
  interface Context {
    injectCommandConfig: boolean
  }
  namespace Command {
    interface Config {
      permission: string
    }
  }
}

class MiaoPermission {
  private ctx: Context
  constructor(ctx: Context, config: MiaoPermission.Config) {
    this.ctx = ctx
    this.addCommandConfig(ctx)
    ctx.permissions.define(config.admin, [])
    ctx.permissions.inherit('command.*', config.admin)
    this.registerCommand(ctx, { permission: config.admin, showWarning: false })
    ctx.plugin(Permission)
  }

  addCommandConfig(ctx: Context) {
    if (ctx.root.injectCommandConfig) { return }
    ctx.root.injectCommandConfig = true
    ctx.schema.extend('command', Schema.object({
      showWarning: Schema.boolean().description('警告信息是否提示用户。'),
    }), 900)
    ctx.schema.extend('command', Schema.object({
      permission: Schema.string().description('命令权限。'),
    }), 900)
  }

  registerCommand(ctx: Context, options: Command.Config) {
    ctx.command('lp.channel.info', options)
      .channelFields(['permissions'])
      .action((argv) => {
        return `===== 喵式权限 =====
当前频道: ${argv.session.channelId}
权限列表:
${argv.session.channel.permissions.map(p => `- ${p}`).join('\n')}`
      })
    ctx.command('lp.listgroup <name>', options)
      .action(async (argv, name) => {
        return `===== 喵式权限 =====
权限组列表:
${(await ctx.permission.getGroups()).map(p => `- ${p.name}(group.${p.id})`).join('\n')}`
      })
    ctx.command('lp.creategroup <name>', options)
      .action((argv, name) => {
        let num = ctx.permission.createGroup(name)
        return `权限组 ${name} 已添加 组ID: ${num}.`
      })
    ctx.command('lp.deletegroup <name>', options)
      .action((argv, name) => {
        ctx.permission.deleteGroup(name)
        return '权限组已删除.'
      })
    ctx.command('lp.channel.set <permission:string>', options)
      .action((argv, permission) => {
        ctx.permission.setPermission(argv.session.channel, permission)
        return '频道权限已添加.'
      })
    ctx.command('lp.channel.unset <permission:string>', options)
      .action((argv, permission) => {
        ctx.permission.unsetPermission(argv.session.channel, permission)
        return '频道权限已移除.'
      })
    ctx.command('lp.user <user:user> <action> <permission>', options)
      .userFields(['permissions'])
      .action(async (argv, user, action, permission) => {
        if (!permission) {
          user = `${argv.session.platform}:${argv.session.userId}`
          action = user
          permission = action
        }
        let pid = user.split(':')[0];
        let uid = user.split(':')[1];
        let userModel = await this.ctx.permission.getUser(pid, uid, true)
        switch (action) {
          case "info":
            return `===== 喵式权限 =====
当前用户: ${uid}(${userModel.id})
权限列表:
${userModel.permissions.map(p => `- ${p}`).join('\n')}`
          case "set":
            ctx.permission.setPermission(userModel, permission)
            return '用户权限已添加.'
          case "unset":
            ctx.permission.unsetPermission(userModel, permission)
            return '用户权限已移除.'
        }
      })
    ctx.command('lp.group <group:string> <action> <permission>', options)
      .userFields(['permissions'])
      .action(async (argv, group, action, permission) => {
        let groupModel = await this.ctx.permission.getGroup(group)
        switch (action) {
          case "info":
            logger.debug(JSON.stringify(groupModel))
            return `===== 喵式权限 =====
当前权限组: ${groupModel.name}(${groupModel.id})
权限列表:
${groupModel.permissions.map(p => `- ${p}`).join('\n')}`
          case "set":
            ctx.permission.setPermission(groupModel, permission)
            return '权限组权限已添加.'
          case "unset":
            ctx.permission.unsetPermission(groupModel, permission)
            return '权限组权限已移除.'
        }
      })
  }
}

namespace MiaoPermission {
  export const using = ['database'] as const
  export interface Config {
    admin: string
  }
  export const Config: Schema<Config> = Schema.object({
    admin: Schema.string().description('管理员权限').default('luckperms.admin'),
  })
}

export default MiaoPermission
