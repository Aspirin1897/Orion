# coding=utf-8
import copy
import iscsi_json
import sundry as s
from execute.linstor import Linstor
from execute.crm import CRMData, CRMConfig
import consts



class IscsiConfig():
    def __init__(self, data_current, data_changed):
        self.logger = consts.glo_log()
        dict_current = self.get_map_relation(data_current)
        dict_changed = self.get_map_relation(data_changed)

        self.diff, self.recover = self.get_dict_diff(dict_current, dict_changed)
        self.delete = self.diff['delete']
        self.create = self.diff['create']
        self.modify = self.diff['modify']

        if any([self.modify, self.delete]):
            self.obj_crm = CRMConfig()

        if self.create:
            self.obj_map = Map()

        # 记载需要进行恢复的disk
        self.recovery_list = {'delete': set(), 'create': {}, 'modify': {}}


    def get_map_relation(self,data):
        dict_map_relation = {}
        for disk in data['Disk']:
            dict_map_relation.update({disk: set()})

        for map in data['Map'].values():
            for dg in map['DiskGroup']:
                for disk in data['DiskGroup'][dg]:
                    set_iqn = set()
                    for hg in map['HostGroup']:
                        for host in data['HostGroup'][hg]:
                            set_iqn.add(data['Host'][host])
                    dict_map_relation[disk] = dict_map_relation[disk] | set_iqn

        return dict_map_relation


    def get_dict_diff(self, dict1, dict2):
        # 判断dict2有没有dict1没有的key，如有dict1进行补充
        ex_key = dict2.keys() - dict1.keys()
        if ex_key:
            for i in ex_key:
                dict1.update({i: set()})

        diff = {'delete': set(), 'create': {}, 'modify': {}}
        recover = {'delete': set(), 'create': {}, 'modify': {}}
        for key in dict1:
            if set(dict1[key]) != set(dict2[key]):
                if not dict2[key]:
                    diff['delete'].add(key)
                    recover['create'].update({key: dict1[key]})
                elif not dict1[key]:
                    diff['create'].update({key: dict2[key]})
                    recover['delete'].add(key)
                else:
                    diff['modify'].update({key: dict2[key]})
                    recover['modify'].update({key: dict1[key]})

        self.logger.write_to_log('DATA','iSCSILogicalUnit','Data to be modified','',diff)
        return diff, recover

    def show_info(self):
        if self.create:
            print('新增：')
            for disk, iqn in self.create.items():
                print(f'{disk}，其allowed_initiators将被设置为：{",".join(iqn)}')
        if self.delete:
            print('删除：')
            print(f'{",".join(self.delete)}')
        if self.modify:
            print('修改：')
            for disk, iqn in self.modify.items():
                print(f'{disk}，其allowed_initiators将被设置为：{",".join(iqn)}')
        if not any([self.create,self.delete,self.modify]):
            print('不会对映射关系产生任何影响')

    def create_iscsilogicalunit(self):
        for disk, iqn in self.create.items():
            self.recovery_list['delete'].add(disk)
            self.obj_map.create_res(disk, iqn)
            print(f'执行创建{disk}')

    def delete_iscsilogicalunit(self):
        for disk in self.delete:
            self.recovery_list['create'].update({disk: self.recover['create'][disk]})
            self.obj_crm.delete_res(disk)
            print(f'执行删除{disk}')

    def modify_iscsilogicalunit(self):
        for disk, iqn in self.modify.items():
            self.recovery_list['modify'].update({disk: self.recover['modify'][disk]})
            self.obj_crm.change_initiator(disk, iqn)
            print(f'修改{disk}')

    def restore(self):
        for disk, iqn in self.recovery_list['create'].items():
            self.obj_map.create_res(disk, iqn)
            print(f'执行创建{disk},iqn为{iqn}')

        for disk in self.recovery_list['delete']:
            self.obj_crm.delete_res(disk)
            print(f'执行删除{disk}')

        for disk, iqn in self.recovery_list['modify'].items():
            self.obj_crm.change_initiator(disk, iqn)
            print(f'执行修改{disk},iqn为{iqn}')


    def comfirm_modify(self):
        self.show_info()
        print('是否确认修改?y/n')
        answer = s.get_answer()
        if not answer in ['y', 'yes', 'Y', 'YES']:
            s.prt_log('Modify canceled', 2)



    def crm_conf_change(self):
        try:
            self.create_iscsilogicalunit()
            self.delete_iscsilogicalunit()
            self.modify_iscsilogicalunit()
            print(self.recovery_list)
        except consts.CmdError:
            print('执行命令失败')
            self.restore()
        except Exception:
            print('未知异常')
            self.restore()




class Disk():
    def __init__(self):
        self.js = iscsi_json.JsonOperation()

    def get_all_disk(self):
        linstor = Linstor()
        linstor_res = linstor.get_linstor_data(
            'linstor --no-color --no-utf8 r lv')
        disks = {}
        for d in linstor_res:
            disks.update({d[1]: d[5]})
        self.js.cover_data('Disk', disks)
        return disks

    def get_spe_disk(self, disk):
        self.get_all_disk()
        if self.js.check_key('Disk', disk)['result']:
            return {disk: self.js.get_data('Disk').get(disk)}

    # 展示全部disk
    def show_all_disk(self):
        list_header = ["ResourceName", "Path"]
        dict_data = self.get_all_disk()
        table = s.show_iscsi_data(list_header, dict_data)
        s.prt_log(table, 0)

    # 展示指定的disk
    def show_spe_disk(self, disk):
        list_header = ["ResourceName", "Path"]
        dict_data = self.get_spe_disk(disk)
        table = s.show_iscsi_data(list_header, dict_data)
        s.prt_log(table, 0)

    """
    host 操作
    """


class Host():
    def __init__(self):
        self.js = iscsi_json.JsonOperation()

    def check_iqn(self, iqn):
        """
        判断iqn是否符合格式
        """
        if not s.re_findall(r'^iqn\.\d{4}-\d{2}\.[a-zA-Z0-9.:-]+', iqn):
            s.prt_log(f"The format of IQN is wrong. Please confirm and fill in again.", 2)

    def create_host(self, host, iqn):
        if self.js.check_key('Host', host)['result']:
            s.prt_log(f"Fail! The Host {host} already existed.", 1)
        else:
            self.check_iqn(iqn)
            self.js.update_data("Host", host, iqn)
            s.prt_log("Create success!", 0)
            return True

    def get_all_host(self):
        return self.js.get_data("Host")

    def get_spe_host(self, host):
        if self.js.check_key('Host', host)['result']:
            return ({host: self.js.get_data('Host').get(host)})

    def show_all_host(self):
        list_header = ["HostName", "IQN"]
        dict_data = self.get_all_host()
        table = s.show_iscsi_data(list_header, dict_data)
        s.prt_log(table, 0)

    def show_spe_host(self, host):
        list_header = ["HostName", "IQN"]
        dict_data = self.get_spe_host(host)
        table = s.show_iscsi_data(list_header, dict_data)
        s.prt_log(table, 0)

    def delete_host(self, host):
        if self.js.check_key('Host', host)['result']:
            if self.js.check_value('HostGroup', host)['result']:
                s.prt_log(
                    "Fail! The host in ... hostgroup.Please delete the hostgroup first", 1)
            else:
                self.js.delete_data('Host', host)
                s.prt_log("Delete success!", 0)
                return True
        else:
            s.prt_log(f"Fail! Can't find {host}", 1)


    def modify_host(self, host, iqn):
        if not self.js.check_key('Host', host)['result']:
            s.prt_log("不存在这个host可以去进行修改", 2)

        json_data_before = copy.deepcopy(self.js.json_data)
        self.js.update_data('Host', host, iqn)

        obj_iscsi = IscsiConfig(json_data_before, self.js.json_data)
        obj_iscsi.comfirm_modify()

        js_temp = iscsi_json.JsonOperation()
        json_data_before.pop('crm')
        if json_data_before == js_temp.iscsi_data:
            obj_iscsi.crm_conf_change()
        else:
            s.prt_log('JSON已被修改，请重新操作', 2)

        self.js.commit_json()

    """
    diskgroup 操作
    """


class DiskGroup():
    def __init__(self):
        # 更新json文档中的disk信息
        disk = Disk()
        disk.get_all_disk()
        self.js = iscsi_json.JsonOperation()

    def create_diskgroup(self, diskgroup, disk):
        if self.js.check_key('DiskGroup', diskgroup)['result']:
            s.prt_log(f'Fail! The Disk Group {diskgroup} already existed.', 1)
        else:
            for i in disk:
                if self.js.check_key('Disk', i)['result'] == False:
                    s.prt_log(f"Fail! Can't find {i}.Please give the true name.", 1)
                    return

            self.js.update_data('DiskGroup', diskgroup, disk)
            s.prt_log("Create success!", 0)
            return True

    def get_all_diskgroup(self):
        return self.js.get_data("DiskGroup")

    def get_spe_diskgroup(self, dg):
        if self.js.check_key('DiskGroup', dg)['result']:
            return {dg: self.js.get_data('DiskGroup').get(dg)}

    def show_all_diskgroup(self):
        list_header = ["DiskgroupName", "DiskName"]
        dict_data = self.get_all_diskgroup()
        table = s.show_iscsi_data(list_header, dict_data)
        s.prt_log(table, 0)

    def show_spe_diskgroup(self, dg):
        list_header = ["DiskgroupName", "DiskName"]
        dict_data = self.get_spe_diskgroup(dg)
        table = s.show_iscsi_data(list_header, dict_data)
        s.prt_log(table, 0)

    def delete_diskgroup(self, dg):
        if self.js.check_key('DiskGroup', dg)['result']:
            if self.js.check_value('Map', dg)['result']:
                s.prt_log("Fail! The diskgroup already map,Please delete the map", 1)
            else:
                self.js.delete_data('DiskGroup', dg)
                s.prt_log("Delete success!", 0)
        else:
            s.prt_log(f"Fail! Can't find {dg}", 1)


    def add_disk(self, dg, list_disk):
        for disk in list_disk:
            if self.js.check_value_in_key("DiskGroup", dg, disk)['result']:
                s.prt_log(f'{disk}已存在{dg}中', 2)
            if not self.js.check_key("Disk", disk)['result']:
                s.prt_log(f'json文件中不存在{disk}，无法进行添加', 2)

        json_data_before = copy.deepcopy(self.js.json_data)
        self.js.append_member('DiskGroup', dg, list_disk)
        obj_iscsi = IscsiConfig(json_data_before, self.js.json_data)
        obj_iscsi.comfirm_modify()

        js_temp = iscsi_json.JsonOperation()
        json_data_before.pop('crm')
        if json_data_before == js_temp.iscsi_data:
            obj_iscsi.crm_conf_change()
        else:
            s.prt_log('JSON已被修改，请重新操作', 2)

        self.js.commit_json()


    def remove_disk(self, dg, list_disk):
        for disk in list_disk:
            if not self.js.check_value_in_key("DiskGroup", dg, disk)['result']:
                s.prt_log(f'{dg}中不存在成员{disk}，无法进行移除', 2)


        json_data_before = copy.deepcopy(self.js.json_data)
        self.js.remove_member('DiskGroup', dg, list_disk)
        obj_iscsi = IscsiConfig(json_data_before, self.js.json_data)
        obj_iscsi.comfirm_modify()
        js_temp = iscsi_json.JsonOperation()
        json_data_before.pop('crm')
        if json_data_before == js_temp.iscsi_data:
            obj_iscsi.crm_conf_change()
        else:
            s.prt_log('JSON已被修改，请重新操作', 2)

        # 配置文件移除成员
        if not self.js.json_data['DiskGroup'][dg]:
            self.js.delete_data('DiskGroup', dg)
            list_map = self.js.get_map_by_group('DiskGroup',dg)
            for map in list_map:
                if len(self.js.json_data['Map'][map]['DiskGroup']) > 1:
                    self.js.remove_member('DiskGroup', map, [dg], type='Map')
                else:
                    self.js.delete_data('Map', map)
            print(f'该{dg}已删除')
            print(f'相关的map已经修改/删除')

        self.js.commit_json()

    """
    hostgroup 操作
    """


class HostGroup():
    def __init__(self):
        self.js = iscsi_json.JsonOperation()

    def create_hostgroup(self, hostgroup, host):
        if self.js.check_key('HostGroup', hostgroup)['result']:
            s.prt_log(f'Fail! The HostGroup {hostgroup} already existed.', 1)
        else:
            for i in host:
                if self.js.check_key('Host', i)['result'] == False:
                    s.prt_log(f"Fail! Can't find {i}.Please give the true name.", 1)
                    return

            self.js.update_data('HostGroup', hostgroup, host)
            s.prt_log("Create success!", 0)
            return True

    def get_all_hostgroup(self):
        return self.js.get_data("HostGroup")

    def get_spe_hostgroup(self, hg):
        if self.js.check_key('HostGroup', hg)['result']:
            return {hg: self.js.get_data('HostGroup').get(hg)}

    def show_all_hostgroup(self):
        list_header = ["HostGroupName", "HostName"]
        dict_data = self.get_all_hostgroup()
        table = s.show_iscsi_data(list_header, dict_data)
        s.prt_log(table, 0)

    def show_spe_hostgroup(self, hg):
        list_header = ["HostGroupName", "HostName"]
        dict_data = self.get_spe_hostgroup(hg)
        table = s.show_iscsi_data(list_header, dict_data)
        s.prt_log(table, 0)

    def delete_hostgroup(self, hg):
        if self.js.check_key('HostGroup', hg)['result']:
            if self.js.check_value('Map', hg)['result']:
                s.prt_log("Fail! The hostgroup already map,Please delete the map", 1)
            else:
                self.js.delete_data('HostGroup', hg)
                s.prt_log("Delete success!", 0)
        else:
            s.prt_log(f"Fail! Can't find {hg}", 1)


    def add_host(self, hg, list_host):
        for host in list_host:
            if self.js.check_value_in_key("HostGroup", hg, host)['result']:
                s.prt_log(f'{host}已存在{hg}中', 2)
            if not self.js.check_key("Host", host)['result']:
                s.prt_log(f'json文件中不存在{host}，无法进行添加', 2)


        json_data_before = copy.deepcopy(self.js.json_data)
        self.js.append_member('HostGroup', hg, list_host)
        obj_iscsi = IscsiConfig(json_data_before, self.js.json_data)
        obj_iscsi.comfirm_modify()
        js_temp = iscsi_json.JsonOperation()
        json_data_before.pop('crm')
        if json_data_before == js_temp.iscsi_data:
            obj_iscsi.crm_conf_change()
        else:
            s.prt_log('JSON已被修改，请重新操作', 2)
        # 配置文件更新修改的资源
        self.js.commit_json()


    def remove_host(self, hg, list_host):
        for host in list_host:
            if not self.js.check_value_in_key("HostGroup", hg, host)['result']:
                s.prt_log(f'{hg}中不存在成员{host}，无法进行移除', 2)

        # 临时json对象进行数据的更新
        json_data_before = copy.deepcopy(self.js.json_data)
        self.js.remove_member('HostGroup', hg, list_host)
        obj_iscsi = IscsiConfig(json_data_before, self.js.json_data)
        obj_iscsi.comfirm_modify()
        js_temp = iscsi_json.JsonOperation()
        json_data_before.pop('crm')
        if self.js.iscsi_data == js_temp.iscsi_data:
            obj_iscsi.crm_conf_change()
        else:
            s.prt_log('JSON已被修改，请重新操作', 2)

        # 配置文件的改变
        if not self.js.json_data['HostGroup'][hg]:
            self.js.delete_data('HostGroup', hg)
            list_map = self.js.get_map_by_group('HostGroup',hg)
            for map in list_map:
                if len(self.js.json_data['Map'][map]['HostGroup']) > 1:
                    self.js.remove_member('HostGroup', map, [hg], type='Map')
                else:
                    self.js.delete_data('Map', map)
            print(f'该{hg}已删除')
            print(f'相关的map已经修改/删除')
        self.js.commit_json()

    """
    map操作
    """


class Map():
    def __init__(self):
        self.js = iscsi_json.JsonOperation()
        # 用于收集创建成功的resource
        self.list_res_created = []
        self.target_name, self.target_iqn = self.get_target()

    def pre_check_create_map(self, map, hg, dg):
        if self.js.check_key('Map', map)['result']:
            s.prt_log(f'The Map "{map}" already existed.', 2)
        elif self.checkout_exist('HostGroup', hg) == False:
            s.prt_log(f"Can't find {hg}", 2)
        elif self.checkout_exist('DiskGroup', dg) == False:
            s.prt_log(f"Can't find {dg}", 2)
        else:
            return True

    # 检查列表的每个成员hg/dg是否存在
    def checkout_exist(self, key, data_list):
        for i in data_list:
            if self.js.check_key(key, i)['result'] == False:
                return False

    def pre_check_create_map(self, map, hg, dg):
        if self.js.check_key('Map', map)['result']:
            s.prt_log(f'The Map "{map}" already existed.', 1)
        elif self.js.check_key('HostGroup', hg)['result'] == False:
            s.prt_log(f"Can't find {hg}", 1)
        elif self.js.check_key('DiskGroup', dg)['result'] == False:
            s.prt_log(f"Can't find {dg}", 1)
        else:
            if self.js.check_value('Map', dg)['result']:
                s.prt_log("The diskgroup already map", 1)
            else:
                return True

    def get_initiator(self, hg):
        # 根据hg去获取hostiqn，返回由hostiqn组成的initiator
        hostiqn = []
        for h in self.js.get_data('HostGroup').get(hg):
            iqn = self.js.get_data('Host').get(h)
            hostiqn.append(iqn)
        initiator = " ".join(hostiqn)
        return initiator

    def get_target(self):
        # 获取target
        crm_data = CRMData()
        if 'ERROR' in crm_data.crm_conf_data:
            s.prt_log("Could not perform requested operations, are you root?",1)
        else:
            res = crm_data.get_resource_data()
            vip = crm_data.get_vip_data()
            target = crm_data.get_target_data()
            self.js.update_crm_conf(res,vip,target)
            if target:
                # 目前的设计只有一个target，所以取列表的第一个
                target_all = target[0]
                # 返回target_name, target_iqn
                return target_all[0],target_all[1]
            else:
                s.prt_log('No target，please create target first', 2)


    def get_disk_data(self, dg):
        # 根据dg去收集drbdd的三项数据：resource name，device name
        disk = self.js.get_data('DiskGroup').get(dg)
        linstor = Linstor()
        linstor_res = linstor.get_linstor_data('linstor --no-color --no-utf8 r lv')
        disks = {}
        for disk_all in linstor_res:
            # 获取diskgroup中每个disk的相关数据
            for d in disk:
                if d in disk_all:
                    disks.update({disk_all[1]: disk_all[5]})  # 取Resource, DeviceName
        return disks

    def create_map(self, map, hg_list, dg_list):
        """
        创建map
        :param map:
        :param hg: list,
        :param dg: list,
        :return:T/F
        """
        # 创建前的检查
        if not self.pre_check_create_map(map, hg_list, dg_list):
            return

        json_data_before = copy.deepcopy(self.js.json_data)
        self.js.update_data('Map', map, {'HostGroup': hg_list, 'DiskGroup': dg_list})
        obj_iscsi = IscsiConfig(json_data_before, self.js.json_data)

        # 已经被使用过的disk(ilu)需不需要提示
        dict_disk_inuse = obj_iscsi.modify
        if dict_disk_inuse:
            print(f"{','.join(dict_disk_inuse.keys())}已被map,将会修改其allowed initiators")

        obj_iscsi.create_iscsilogicalunit()
        obj_iscsi.modify_iscsilogicalunit()

        self.js.commit_json()
        s.prt_log('Create map success!', 0)
        return True


    def create_res(self, res, list_iqn):
        obj_crm = CRMConfig()
        # 取DeviceName后四位数字，减一千作为lun id
        path = self.js.get_data('Disk')[res]
        lunid = int(path[-4:]) - 1000
        initiator = ' '.join(list_iqn)
        # 创建iSCSILogicalUnit
        if obj_crm.create_crm_res(res, self.target_iqn, lunid, path, initiator):
            self.list_res_created.append(res)
            # 创建order，colocation
            if obj_crm.create_set(res, self.target_name):
                # 尝试启动资源，成功失败都不影响创建
                s.prt_log(f"try to start {res}", 0)
                obj_crm.start_res(res)
                obj_crm.checkout_status_start(res)
            else:
                for i in self.list_res_created:
                    obj_crm.delete_res(i)
                return False
        else:
            s.prt_log('Fail to create iSCSILogicalUnit', 1)
            for i in self.list_res_created:
                obj_crm.delete_res(i)
            return False

    def get_all_map(self):
        return self.js.get_data("Map")

    def get_spe_map(self, map):
        list_hg = []
        list_dg = []
        if not self.js.check_key('Map', map)['result']:
            s.prt_log('No map data', 2)
        # {map1: {"HostGroup": [hg1, hg2], "DiskGroup": [dg1, dg2]}
        map_data = self.js.get_data('Map').get(map)
        hg_list = map_data["HostGroup"]
        dg_list = map_data["DiskGroup"]
        for hg in hg_list:
            host = self.js.get_data('HostGroup').get(hg)
            for i in host:
                iqn = self.js.get_data('Host').get(i)
                list_hg.append([hg, i, iqn])
        for dg in dg_list:
            disk = self.js.get_data('DiskGroup').get(dg)
            for i in disk:
                path = self.js.get_data('Disk').get(i)
                list_dg.append([dg, i, path])
        return [{map: map_data}, list_hg, list_dg]

    def show_all_map(self):
        list_header = ["MapName", "HostGroup", "DiskGroup"]
        dict_data = self.get_all_map()
        table = s.show_map_data(list_header, dict_data)
        s.prt_log(table, 0)

    def show_spe_map(self, map):
        list_data = self.get_spe_map(map)
        header_map = ["MapName", "HostGroup", "DiskGroup"]
        header_host = ["HostGroup", "HostName", "IQN"]
        header_disk = ["DiskGroup", "DiskName", "Disk"]
        table_map = s.show_map_data(header_map, list_data[0])
        table_hg = s.show_spe_map_data(header_host, list_data[1])
        table_dg = s.show_spe_map_data(header_disk, list_data[2])
        result = [str(table_map), str(table_hg), str(table_dg)]
        s.prt_log('\n'.join(result), 0)
        return list_data

    def pre_check_delete_map(self, map):
        if self.js.check_key('Map', map)['result']:
            return True
        else:
            s.prt(f"Fail! Can't find {map}", 1)

    # 调用crm删除map
    def delete_map(self, map):
        if not self.pre_check_delete_map(map):
            return

        json_data_before = copy.deepcopy(self.js.json_data)
        self.js.delete_data('Map', map)
        obj_iscsi = IscsiConfig(json_data_before, self.js.json_data)
        obj_iscsi.delete_iscsilogicalunit()
        obj_iscsi.modify_iscsilogicalunit()

        self.js.commit_json()
        s.prt_log("Delete map success!", 0)
        return True


        # obj_crm = CRMConfig()
        # crm_data = CRMData()
        # crm_config_statu = crm_data.crm_conf_data
        # map_data = self.js.get_data('Map').get(map)
        # dg_list = map_data['DiskGroup']
        # resname = []
        # for dg in dg_list:
        #     resname = resname + self.js.get_data('DiskGroup').get(dg)
        # if 'ERROR' in crm_config_statu:
        #     s.prt_log("Could not perform requested operations, are you root?", 1)
        # else:
        #     for disk in set(resname):
        #         map_list = self.js.get_map_by_disk(disk)
        #         if map_list == [map]:
        #             if obj_crm.delete_res(disk) != True:
        #                 return False
        #         else:
        #             map_list.remove(map)
        #             iqn_list = []
        #             for i in map_list:
        #                 iqn_list += self.js.get_iqn_by_map(i)
        #             obj_crm.change_initiator(disk, iqn_list)
        #     self.js.delete_data('Map', map)
        #     s.prt_log("Delete map success!", 0)
        #     return True

    # 获取已map的dg对应的hg
    def get_hg_by_dg(self, dg):
        map = self.js.get_data('Map')
        hg_list = []
        for i in map.values():
            if dg in i:
                hg_list.append(i[0])
        return hg_list

    def get_all_initiator(self, hg_list):
        initiator = ''
        for hg in hg_list:
            initiator = f'{initiator} {self.get_initiator(hg)}'
        return initiator[1:]

    def get_all_disk(self, dg_list):
        all_disk = {}
        for dg in dg_list:
            dgdata = self.get_disk_data(dg)
            all_disk.update(dgdata)
        return all_disk


    def add_hg(self, map, list_hg):
        for hg in list_hg:
            if self.js.check_map_member(map, hg, "HostGroup")['result']:
                s.prt_log(f'{hg}已存在{map}中', 2)
            if not self.js.check_key("HostGroup", hg)['result']:
                s.prt_log(f'json文件中不存在{hg}，无法进行添加', 2)

        json_data_before = copy.deepcopy(self.js.json_data)
        self.js.append_member('HostGroup', map, list_hg, type='Map')
        obj_iscsi = IscsiConfig(json_data_before, self.js.json_data)
        obj_iscsi.comfirm_modify()

        # 通过临时js对象进行配置文件的比对
        js_temp = iscsi_json.JsonOperation()
        json_data_before.pop('crm')
        if json_data_before == js_temp.iscsi_data:
            obj_iscsi.crm_conf_change()
        else:
            s.prt_log('JSON已被修改，请重新操作', 2)

        # 提交json的修改
        self.js.commit_json()



    def add_dg(self, map, list_dg):
        for dg in list_dg:
            if self.js.check_map_member(map, dg, "DiskGroup")['result']:
                s.prt_log(f'{dg}已存在{map}中', 2)
            if not self.js.check_key("DiskGroup", dg)['result']:
                s.prt_log(f'json文件中不存在{dg}，无法进行添加', 2)

        # 获取修改前的数据进行复制，之后进行对json数据的修改，从而去获取映射关系再使用crm命令修改
        json_data_before = copy.deepcopy(self.js.json_data)
        self.js.append_member('DiskGroup', map, list_dg, type='Map')
        obj_iscsi = IscsiConfig(json_data_before, self.js.json_data)
        obj_iscsi.comfirm_modify()

        # 通过临时js对象进行配置文件的比对
        js_temp = iscsi_json.JsonOperation()
        json_data_before.pop('crm')
        if json_data_before == js_temp.iscsi_data:
            obj_iscsi.crm_conf_change()
        else:
            s.prt_log('JSON已被修改，请重新操作', 2)

        # 提交json的修改
        self.js.commit_json()

    def remove_hg(self, map, list_hg):
        for hg in list_hg:
            if not self.js.check_map_member(map, hg, "HostGroup")['result']:
                s.prt_log(f'{map}中不存在成员{hg}，无法进行移除', 2)

        # 获取修改前的数据进行复制，之后进行对json数据的修改，从而去获取映射关系再使用crm命令修改
        json_data_before = copy.deepcopy(self.js.json_data)
        self.js.remove_member('HostGroup', map, list_hg, type='Map')
        obj_iscsi = IscsiConfig(json_data_before, self.js.json_data)
        obj_iscsi.comfirm_modify()

        # 通过临时js对象进行配置文件的比对
        js_temp = iscsi_json.JsonOperation()
        json_data_before.pop('crm')
        if json_data_before == js_temp.iscsi_data:
            obj_iscsi.crm_conf_change()
        else:
            s.prt_log('JSON已被修改，请重新操作', 2)

        # 配置文件删除/移除成员
        if not self.js.json_data['Map'][map]['HostGroup']:
            self.js.delete_data('Map', map)
            print(f'该{map}已删除')
        self.js.commit_json()

    def remove_dg(self, map, list_dg):
        # 验证
        for dg in list_dg:
            if not self.js.check_map_member(map, dg, "DiskGroup")['result']:
                s.prt_log(f'{map}中不存在成员{dg}，无法进行移除', 2)

        # 获取修改前的数据进行复制，之后进行对json数据的修改，从而去获取映射关系再使用crm命令修改
        json_data_before = copy.deepcopy(self.js.json_data)
        self.js.remove_member('DiskGroup', map, list_dg, type='Map')  # 对临时json对象的操作
        obj_iscsi = IscsiConfig(json_data_before, self.js.json_data)
        obj_iscsi.comfirm_modify()

        # 通过临时js对象进行配置文件的比对
        js_temp = iscsi_json.JsonOperation()
        json_data_before.pop('crm')
        if json_data_before == js_temp.iscsi_data:
            obj_iscsi.crm_conf_change()
        else:
            s.prt_log('JSON已被修改，请重新操作', 2)

        if not self.js.json_data['Map'][map]['DiskGroup']:
            self.js.delete_data('Map', map)
            print(f'该{map}已删除')
        self.js.commit_json()
