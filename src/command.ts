import { Command, Context } from "koishi"
import { logger } from "./utils"

function registerChannelCommand(ctx: Context, options: Command.Config) {
    ctx.command('lp.channel.info', options)
        .channelFields(['permissions'])
        .action((argv) => {
            return `===== 喵式权限 =====
当前频道: ${argv.session.channelId}
权限列表:
${argv.session.channel.permissions.map(p => `- ${p}`).join('\n')}`
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
}
function registerUserCommand(ctx: Context, options: Command.Config) {
    const perm = async (argv, user, action, permission) => {
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
            case "test":
                let pass = await ctx.permission.hasPermission(permission, argv.session)
                return '用户权限测试: ' + (pass ? '通过' : '不通过')
            default:
                return `无效的操作 ${action} 目前支持: set, unset, test`
        }
    }
    const meta = async (argv, user, action, permission) => {
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
            case "test":
                let pass = await ctx.permission.hasPermission(permission, argv.session)
                return '用户权限测试: ' + (pass ? '通过' : '不通过')
            default:
                return `无效的操作 ${action} 目前支持: set, unset, test`
        }
    }
    ctx.command('lp.user <user:user> <type> <action> <permission>', options)
        .userFields(['permissions'])
        .action(async (argv, user, type, action, permission) => {
            if (!permission) {
                permission = action
                action = type
                type = "permission"
            }
            switch (type) {
                case "permission":
                    return await perm(argv, user, action, permission)
                case "meta":
                    return await meta(argv, user, action, permission)
                default:
                    return `无效的类型 ${type} 目前支持: permission, meta`
            }
        })
}
function registerGroupCommand(ctx: Context, options: Command.Config) {
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
}

export function registerCommand(ctx: Context, options: Command.Config) {
    registerChannelCommand(ctx, options)
    registerUserCommand(ctx, options)
    registerGroupCommand(ctx, options)
}