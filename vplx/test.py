import subprocess
import time
import re


def execute_crm_cmd(cmd, timeout=60):
    """
    Execute the command cmd to return the content of the command output.
    If it times out, a TimeoutError exception will be thrown.
    cmd - Command to be executed
    timeout - The longest waiting time(unit:second)
    """
    p = subprocess.Popen(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, stdin=subprocess.PIPE,shell=True)
    t_beginning = time.time()
    seconds_passed = 0
    output = None
    while True:
        if p.poll() is not None:
            break
        if p.stderr:
            break
        seconds_passed = time.time() - t_beginning
        if timeout and seconds_passed > timeout:
            p.terminate()
            raise TimeoutError(cmd, timeout)
        time.sleep(0.1)
    out, err = p.communicate()
    if len(out) > 0:
        out = out.decode()
        output = {'sts': 1, 'rst': out}
    elif len(err) > 0:
        err = err.decode()
        output = {'sts': 0, 'rst': err}
    elif out == b'':  # 需要再考虑一下 res stop 执行成功没有返回，stop失败也没有返回（无法判断stop成不成功）
        out = out.decode()
        output = {'sts': 1, 'rst': out}

    if output:
        return output




def _check_status(name):
    status = check_crm_res(name,type='ipaddr2')
    if status is True:
        print('创建成功')
        # 更新JSON配置文件
    elif status is False:
        print('创建失败,检查CRM')
        failed_actions = get_failed_actions()
    else:
        print(f'{name}创建失败，请检查')




def check_crm_res(crm_res,type):
    if type == 'ipaddr2':
        re_ = f'{crm_res}\s*\(ocf::heartbeat:IPaddr2\):\s*(\w*)'
    elif type == 'target':
        re_ = f'{crm_res}\s*\(ocf::heartbeat:iSCSITarget\):\s*(\w*)'
    else:
        # 抛出参数异常
        raise TypeError('type参数输入错误:ipaddr2/target')

    cmd_result = execute_crm_cmd(f'crm res list | grep {crm_res}')
    re_status = re.compile(re_)
    status = re_status.search(cmd_result['rst'])
    if status:
        if status.groups()[0] == 'Started':
            # 更新JSON配置文件
            return True
        else:
            return False
    else:
        return None
        # return None
        # 不存在，进行提示


def get_failed_actions(target):
    # 检查crm整体状态，但是目前好像只是用于提取vip的错误信息

    exitreason = None

    cmd_result = execute_crm_cmd('crm st | cat')
    re_error = re.compile(
        f"\*\s({target})\w*\son\s(\S*)\s'(.*)'\s.*exitreason='(.*)',")
    result = re_error.findall(cmd_result)
    if result:
        if result[0][3] == '[findif] failed':
            exitreason = 0
        else:
            exitreason = result
    return exitreason

    # [('viptest2', 'node40', 'unknown error', '[findif] failed'),
    #  ('viptest2', 'node85', 'unknown error', '[findif] failed'),
    #  ('viptest2', 'node43', 'unknown error', '[findif] failed')]

#
cmd1 = 'crm res stop vip_test1,vip_test1_prtblk_on,vip_test1_prtblk_off'
cmd1_1 = 'crm conf del vip_test1'

cmd2 = 'crm res stop vip_test1_prtblk_off'
cmd2_1 = 'crm conf del vip_test1_prtblk_off'

cmd3 = 'crm res stop vip_test1_prtblk_on'
cmd3_1 = 'crm conf del vip_test1_prtblk_on'

# import time
#
# subprocess.getoutput(cmd1)
# time.sleep(1)
# subprocess.getoutput(cmd1_1)
#
#
# subprocess.getoutput(cmd2)
# time.sleep(1)
# subprocess.getoutput(cmd2_1)
#
#
# subprocess.getoutput(cmd3)
# time.sleep(1)
# subprocess.getoutput(cmd3_1)

# cmd = 'crm res list vip_test1_prtblk_on1 | cat'
# result = execute_crm_cmd(cmd)
# print(result)



def create(name, ip, port, action):
    """

    :param name:
    :param ip:
    :param port:
    :param action: block/unblock
    :return:
    """
    if not action in ['block', 'unblock']:
        raise TypeError('action参数输入错误：block/unblock')

    cmd = f'crm cof primitive {name} portblock params ip={ip} portno={port} protocol=tcp action={action} op monitor timeout=20 interval=20'
    cmd_result = execute_crm_cmd(cmd)
    if not cmd_result['sts']:
        # 创建失败，输出原命令报错信息
        print(cmd_result['rst'])
    else:
        print(f'创建{name}成功')


create('plock_3','10.203.1.151',3260,action='unblock')