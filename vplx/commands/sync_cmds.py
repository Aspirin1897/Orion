import consts
import sundry as sd
from execute import CRMData
import iscsi_json



class SyncCommands():
    def __init__(self):
        self.logger = consts.glo_log()

    def setup_commands(self, parser):
        """
        Add commands for the disk management:create,delete,show
        """
        sync_parser = parser.add_parser(
            'sync', help='sync data')
        sync_parser.set_defaults(func=self.sycn_data)


    @sd.deco_record_exception
    def sycn_data(self, args):
        # 添加前置检查
        obj_crm = CRMData()
        js = iscsi_json.JsonOperation()

        # 获取数据
        vip = obj_crm.get_vip()
        portblock = obj_crm.get_portblock()
        target = obj_crm.get_target()

        # 检查
        obj_crm.check_portal_component(vip, portblock)

        portal = obj_crm.get_portal_data(vip,portblock,target)
        js.json_data.update({'Portal': portal})
        js.json_data.update({'Target': target})
        js.commit_json()
        sd.prt_log('JSON数据更新完成', 1)




