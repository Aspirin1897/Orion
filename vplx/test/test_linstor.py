from execute import linstor


class TestLinstor:

    def setup_class(self):
        self.ls = linstor.Linstor()

    def test_refine_linstor_node(self):
        node = '''+-------------------------------------------------------+
| Node   | NodeType | Addresses                | State  |
|=======================================================|
| ubuntu | COMBINED | 10.203.1.76:3366 (PLAIN) | Online |
+-------------------------------------------------------+'''
        node_result = self.ls.refine_linstor(node)
        assert node_result == [['ubuntu', 'COMBINED', '10.203.1.76:3366(PLAIN)', 'Online']]

    def test_refine_linstor_res(self):
        res = '''+---------------------------------------------------------------------------------------------------+
| Node   | Resource | StoragePool | VolNr | MinorNr | DeviceName    | Allocated | InUse  |    State |
|===================================================================================================|
| ubuntu | res_a    | pool_a      |     0 |    1000 | /dev/drbd1000 |    12 MiB | Unused | UpToDate |
+---------------------------------------------------------------------------------------------------+'''
        res_result = self.ls.refine_linstor(res)
        assert res_result == [
            ['ubuntu', 'res_a', 'pool_a', '0', '1000', '/dev/drbd1000', '12MiB', 'Unused', 'UpToDate']]

    def test_refine_linstor_sp(self):
        sp = '''+-----------------------------------------------------------------------------------------------------------+
| StoragePool          | Node   | Driver   | PoolName | FreeCapacity | TotalCapacity | CanSnapshots | State |
|===========================================================================================================|
| pool_a               | ubuntu | LVM      |          |    15.94 GiB |     16.00 GiB | False        | Ok    |
+-----------------------------------------------------------------------------------------------------------+'''
        sp_result = self.ls.refine_linstor(sp)
        assert sp_result == [['pool_a', 'ubuntu', 'LVM', '', '15.94GiB', '16.00GiB', 'False', 'Ok']]

    # 主要测这个函数能不能跑通？这个函数是根据cmd调用上面的函数，上面的函数已经从node/res/sp的方面都进行了读取测试
    def test_get_linstor_data(self):
        node = self.ls.get_linstor_data('linstor --no-color --no-utf8 n l')
        res = self.ls.get_linstor_data('linstor --no-color --no-utf8 r lv')
        sp = self.ls.get_linstor_data('linstor --no-color --no-utf8 sp l')
        # 这里的断言是看函数有没有返回值
        assert node is not None
        assert res is not None
        assert sp is not None
