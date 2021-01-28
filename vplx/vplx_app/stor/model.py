# coding:utf-8
'''
Created on 2020/3/2
@author: Paul
@note: data
'''

from flask import Flask, jsonify, render_template, request, make_response, views
import process
from public import log


def cors_data(datadict):
    response = make_response(jsonify(datadict))
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'OPTIONS,HEAD,GET,POST'
    response.headers['Access-Control-Allow-Headers'] = 'x-requested-with'
    return response

 
def get_request_data():
    if request.method == 'GET':
        str_data = request.args.items()
        dict_data = dict(str_data)
        tid = dict_data['tid']
        # 记录除了tid之后接收到的数据
        logger = log.Log()
        logger.tid = tid
        return dict_data


RESOURCEDICT = None


def get_all_resource():
    global RESOURCEDICT
    pc = process.Process_data()
    RESOURCEDICT = pc.process_data_resource()
    return True


class OprtResource(views.MethodView):  

    def get(self):
        dict_data = get_request_data()
        logger = log.Log()
        logger.write_to_log('OPRT', 'ROUTE', '/resource/show/oprt', dict_data['ip'], '')
        if get_all_resource():
            logger.write_to_log('DATA', 'RETURN', 'OprtResource', 'result', '0')
            return cors_data("0")
        else:
            logger.write_to_log('DATA', 'RETURN', 'OprtResource', 'result', '1')
            return cors_data("1")


 # 'count': 10,输入值为list数量值
# aa  = len(RESOURCEDICT_test['data'])
RESOURCEDICT_test = {'code': 0,
'count':8,
 'data': [{'device_name': u'/dev/drbd1000',
           'mirror_way': 1,
           'mirror_way_son': [{'drbd_role': u'primary',
                               'node_name': u'klay1',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'}],
           'resource': u'apple',
           'size': u'12MiB',
           'used': u'InUse'},
          {'device_name': u'/dev/drbd1001',
           'mirror_way': 2,
           'mirror_way_son': [{'drbd_role': u'primary',
                               'node_name': u'klay1',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'},
                              {'drbd_role': u'secondary',
                               'node_name': u'klay2',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'}],
           'resource': u'banana',
           'size': u'12MiB',
           'used': u'InUse'},
          {'device_name': u'/dev/drbd1005',
           'mirror_way': 2,
           'mirror_way_son': [{'drbd_role': u'primary',
                               'node_name': u'klay1',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'},
                              {'drbd_role': u'secondary',
                               'node_name': u'klay2',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'}],
           'resource': u'ben',
           'size': u'12MiB',
           'used': u'InUse'},
          {'device_name': u'/dev/drbd1003',
           'mirror_way': 2,
           'mirror_way_son': [{'drbd_role': u'primary',
                               'node_name': u'klay1',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'},
                              {'drbd_role': u'secondary',
                               'node_name': u'klay2',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'}],
           'resource': u'fred',
           'size': u'12MiB',
           'used': u'InUse'},
          {'device_name': u'/dev/drbd1002',
           'mirror_way': 2,
           'mirror_way_son': [{'drbd_role': u'primary',
                               'node_name': u'klay1',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'},
                              {'drbd_role': u'secondary',
                               'node_name': u'klay2',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'}],
           'resource': u'linstordb',
           'size': u'252MiB',
           'used': u'InUse'},
          {'device_name': u'/dev/drbd1006',
           'mirror_way': 2,
           'mirror_way_son': [{'drbd_role': u'primary',
                               'node_name': u'klay1',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'},
                              {'drbd_role': u'secondary',
                               'node_name': u'klay2',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'}],
           'resource': u'seven',
           'size': u'12MiB',
           'used': u'InUse'},
          {'device_name': u'/dev/drbd1009',
           'mirror_way': 1,
           'mirror_way_son': [{'drbd_role': u'secondary',
                               'node_name': u'klay1',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'}],
           'resource': u'ssss',
           'size': u'12MiB',
           'used': u'Unused'},
          {'device_name': u'/dev/drbd1004',
           'mirror_way': 2,
           'mirror_way_son': [{'drbd_role': u'primary',
                               'node_name': u'klay1',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'},
                              {'drbd_role': u'secondary',
                               'node_name': u'klay2',
                               'status': u'UpToDate',
                               'stp_name': u'pool_hdd'}],
           'resource': u'test',
           'size': u'10.00GiB',
           'used': u'InUse'}],
 'msg': ''}


class ResourceResult(views.MethodView):  

    def get(self):
        # get_request_data()
        # logger = log.Log()
        # logger.write_to_log('DATA', 'ROUTE', '/resource/show/data', dict_data['ip'], '')
        if not RESOURCEDICT:
            get_all_resource()
        # logger.write_to_log('DATA', 'RETURN', 'ResourceResult', 'result', RESOURCEDICT)
#         return cors_data(RESOURCEDICT)
        return cors_data(RESOURCEDICT_test)


NODEDICT = None
NODEDICT_test = {'code': 0,
'count': 1000,
'data': [{'addr': u'10.203.2.89:3366(PLAIN)',
          'node': u'klay1',
          'node_type': u'COMBINED',
          'res_num': '8',
          'res_num_son': [{'device_name': u'/dev/drbd1000',
                           'res_name': u'apple',
                           'size': u'12MiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'InUse'},
                          {'device_name': u'/dev/drbd1001',
                           'res_name': u'banana',
                           'size': u'12MiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'InUse'},
                          {'device_name': u'/dev/drbd1005',
                           'res_name': u'ben',
                           'size': u'12MiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'InUse'},
                          {'device_name': u'/dev/drbd1003',
                           'res_name': u'fred',
                           'size': u'12MiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'InUse'},
                          {'device_name': u'/dev/drbd1002',
                           'res_name': u'linstordb',
                           'size': u'252MiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'InUse'},
                          {'device_name': u'/dev/drbd1006',
                           'res_name': u'seven',
                           'size': u'12MiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'InUse'},
                          {'device_name': u'/dev/drbd1009',
                           'res_name': u'ssss',
                           'size': u'12MiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'Unused'},
                          {'device_name': u'/dev/drbd1004',
                           'res_name': u'test',
                           'size': u'10.00GiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'InUse'}],
          'status': u'UpToDate',
          'stp_num': '3'},
         {'addr': u'10.203.2.90:3366(PLAIN)',
          'node': u'klay2',
          'node_type': u'COMBINED',
          'res_num': '7',
          'res_num_son': [{'device_name': u'/dev/drbd1001',
                           'res_name': u'banana',
                           'size': u'12MiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'Unused'},
                          {'device_name': u'/dev/drbd1005',
                           'res_name': u'ben',
                           'size': u'12MiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'Unused'},
                          {'device_name': u'/dev/drbd1008',
                           'res_name': u'ddfl',
                           'size': u'',
                           'status': u'Diskless',
                           'stp_name': u'DfltDisklessStorPool',
                           'used': u'Unused'},
                          {'device_name': u'/dev/drbd1003',
                           'res_name': u'fred',
                           'size': u'12MiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'Unused'},
                          {'device_name': u'/dev/drbd1002',
                           'res_name': u'linstordb',
                           'size': u'252MiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'Unused'},
                          {'device_name': u'/dev/drbd1006',
                           'res_name': u'seven',
                           'size': u'12MiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'Unused'},
                          {'device_name': u'/dev/drbd1004',
                           'res_name': u'test',
                           'size': u'10.00GiB',
                           'status': u'UpToDate',
                           'stp_name': u'pool_hdd',
                           'used': u'Unused'}],
          'status': u'UpToDate',
          'stp_num': '1'}],
'msg': ''}


def get_all_node():
    global NODEDICT
#     pc = process.Process_data()
#     NODEDICT = pc.process_data_node()
    return True


class OprtNode(views.MethodView):  

    def get(self):
        dict_data = get_request_data()
        logger = consts.glo_log()
        logger.write_to_log('OPRT', 'ROUTE', '/resource/show/oprt', dict_data['ip'], '')
        if get_all_node():
            logger.write_to_log('DATA', 'RETURN', 'OprtResource', 'result', '0')
            return cors_data("0")
        else:
            logger.write_to_log('DATA', 'RETURN', 'OprtResource', 'result', '1')
            return cors_data("1")


class NodeResult(views.MethodView):  

    def get(self):
        # get_request_data()
        # logger = consts.glo_log()
        # logger.write_to_log('DATA', 'ROUTE', '/resource/show/data', dict_data['ip'], '')
        if not NODEDICT:
            get_all_node()
        # logger.write_to_log('DATA', 'RETURN', 'ResourceResult', 'result', RESOURCEDICT)
#         return cors_data(RESOURCEDICT)
        return cors_data(NODEDICT_test)
    
 
STORAGEPOOL = None

STORAGEPOOL_test = {'code': 0,
 'count': 1000,
 'data': [{'driver': u'LVM',
           'free_size': u'19.68GiB',
           'node_name': u'klay1',
           'pool_name': u'linstor1',
           'res_name_son': [{'device_name': u'/dev/drbd1000',
                             'res_name': u'apple',
                             'size': u'12MiB',
                             'status': u'UpToDate',
                             'used': u'InUse'},
                            {'device_name': u'/dev/drbd1001',
                             'res_name': u'banana',
                             'size': u'12MiB',
                             'status': u'UpToDate',
                             'used': u'InUse'},
                            {'device_name': u'/dev/drbd1005',
                             'res_name': u'ben',
                             'size': u'12MiB',
                             'status': u'UpToDate',
                             'used': u'InUse'},
                            {'device_name': u'/dev/drbd1003',
                             'res_name': u'fred',
                             'size': u'12MiB',
                             'status': u'UpToDate',
                             'used': u'InUse'},
                            {'device_name': u'/dev/drbd1002',
                             'res_name': u'linstordb',
                             'size': u'252MiB',
                             'status': u'UpToDate',
                             'used': u'InUse'},
                            {'device_name': u'/dev/drbd1006',
                             'res_name': u'seven',
                             'size': u'12MiB',
                             'status': u'UpToDate',
                             'used': u'InUse'},
                            {'device_name': u'/dev/drbd1009',
                             'res_name': u'ssss',
                             'size': u'12MiB',
                             'status': u'UpToDate',
                             'used': u'Unused'},
                            {'device_name': u'/dev/drbd1004',
                             'res_name': u'test',
                             'size': u'10.00GiB',
                             'status': u'UpToDate',
                             'used': u'InUse'}],
           'res_num': '8',
           'snapshots': u'False',
           'status': u'UpToDate',
           'stp_name': u'pool_hdd',
           'total_size': u'29.99GiB'},
          {'driver': u'LVM',
           'free_size': u'9.70GiB',
           'node_name': u'klay2',
           'pool_name': u'linstor2',
           'res_name_son': [{'device_name': u'/dev/drbd1001',
                             'res_name': u'banana',
                             'size': u'12MiB',
                             'status': u'UpToDate',
                             'used': u'Unused'},
                            {'device_name': u'/dev/drbd1005',
                             'res_name': u'ben',
                             'size': u'12MiB',
                             'status': u'UpToDate',
                             'used': u'Unused'},
                            {'device_name': u'/dev/drbd1003',
                             'res_name': u'fred',
                             'size': u'12MiB',
                             'status': u'UpToDate',
                             'used': u'Unused'},
                            {'device_name': u'/dev/drbd1002',
                             'res_name': u'linstordb',
                             'size': u'252MiB',
                             'status': u'UpToDate',
                             'used': u'Unused'},
                            {'device_name': u'/dev/drbd1006',
                             'res_name': u'seven',
                             'size': u'12MiB',
                             'status': u'UpToDate',
                             'used': u'Unused'},
                            {'device_name': u'/dev/drbd1004',
                             'res_name': u'test',
                             'size': u'10.00GiB',
                             'status': u'UpToDate',
                             'used': u'Unused'}],
           'res_num': '6',
           'snapshots': u'False',
           'status': u'UpToDate',
           'stp_name': u'pool_hdd',
           'total_size': u'20.00GiB'},
          {'driver': u'LVM_THIN',
           'free_size': u'2.49GiB',
           'node_name': u'klay1',
           'pool_name': u'vg1/lvol1',
           'res_name_son': [],
           'res_num': '0',
           'snapshots': u'True',
           'status': u'Ok',
           'stp_name': u'poollvt',
           'total_size': u'2.49GiB'},
          {'driver': u'LVM',
           'free_size': u'2.25GiB',
           'node_name': u'klay1',
           'pool_name': u'vg1',
           'res_name_son': [],
           'res_num': '0',
           'snapshots': u'False',
           'status': u'Ok',
           'stp_name': u'poolvg1',
           'total_size': u'5.00GiB'}],
 'msg': ''}
   
    
def get_all_storagepool():
    global STORAGEPOOL
#     pc = process.Process_data()
#     STORAGEPOOL = pc.process_data_storagepool()
    return True


class OprtStoragepool(views.MethodView):  

    def get(self):
        dict_data = get_request_data()
        logger = log.Log()
        logger.write_to_log('OPRT', 'ROUTE', '/storagepool/show/oprt', dict_data['ip'], '')
        if get_all_storagepool():
            logger.write_to_log('DATA', 'RETURN', 'OprtStoragepool', 'result', '0')
            return cors_data("0")
        else:
            logger.write_to_log('DATA', 'RETURN', 'OprtStoragepool', 'result', '1')
            return cors_data("1")


class StoragepoolResult(views.MethodView):  

    def get(self):
        # get_request_data()
        # logger = consts.glo_log()
        # logger.write_to_log('DATA', 'ROUTE', '/resource/show/data', dict_data['ip'], '')
        if not STORAGEPOOL:
            get_all_storagepool()
        # logger.write_to_log('DATA', 'RETURN', 'ResourceResult', 'result', RESOURCEDICT)
#         return cors_data(RESOURCEDICT)
        return cors_data(STORAGEPOOL_test)

'''
@note: 删除model
'''


class ResourceD(views.MethodView):  

    def get(self):
        data = get_request_data()
        print(data)
        ResourceD_data = data["resource_data"]
        print(ResourceD_data)
        message = "删除成功"
        return cors_data(message)

     
class NodeD(views.MethodView):  

    def get(self):
        data = get_request_data()
        return

     
class StoragepoolD(views.MethodView):  

    def get(self):
        data = get_request_data()
     
        return 

'''
@note: 创建资源
'''


class LINSTORCreate(views.MethodView):

    def get(self):
        data = get_request_data()
        print(data)
        return

'''
@note: 交互
'''
        
lvm = None
sp = None
node_create = None
node_num = None


class LINSTORView(views.MethodView):
    global lvm
    global sp
    global node_create
    global node_num

    def get(self):
        pc = Process.Process_data()
        lvm = pc.get_option_lvm()
        sp = pc.get_option_sp()
        node_create = pc.get_option_node()
        node_num = pc.get_option_nodenum()
        return 'Test'


LVM = {'lvm':[{"node_key":"Node1"}, {"node_key":"Node2"}, {"node_key":"Node3"}, {"node_key":"Node4"}],
      'thin_lvm': [{"node_key":"Node1"}, {"node_key":"Node2"}, {"node_key":"Node3"}, {"node_key":"Node5"}]     
             }
class lvmView(views.MethodView):  

    def get(self):
        return cors_data(LVM)

 
class spView(views.MethodView):  

    def get(self):
        sp = [{'NodeName': 'Node1',
                    'Spool': [{'device_name': 'Paul'},
                             {'device_name': 'Mark'},
                             {'device_name': 'Ethan'},
                             {'device_name': 'Vince'}]
                  },
                  {'NodeName': 'Node2',
                  'Spool': [{'device_name': 'Paul_Test'},
                            { 'device_name': 'Mark_Test'},
                             {'device_name': 'Ethan_Test'},
                             {'device_name': 'Vince_Test'}]
                }]
        return cors_data(sp)

    
class nodecreateView(views.MethodView):  

    def get(self):
        return cors_data(node_create)


class nodenumView(views.MethodView):  

    def get(self):
        return cors_data(node_num)

'''
@note: 修改model
'''

 
class LINSTORModify(views.MethodView):  

    def get(self):
        data = get_request_data()
        print(data)
        ResourceM_data = data["resource_data"]
        print(ResourceM_data)
        message = "修改成功"
        return cors_data(message)
