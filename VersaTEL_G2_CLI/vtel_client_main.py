import argparse
import sys
import os
import pickle

import subprocess
import linstordb
import replay
import log
import sundry
import consts
import iscsi_json
from commands import (
    NodeCommands,
    ResourceCommands,
    StoragePoolCommands,
    DiskCommands,
    DiskGroupCommands,
    HostCommands,
    HostGroupCommands,
    MapCommands
)

class MyArgumentParser(argparse.ArgumentParser):
    def parse_args(self, args=None, namespace=None):
        logger = consts.glo_log()
        args, argv = self.parse_known_args(args, namespace)
        if argv:
            msg = ('unrecognized arguments: %s')
            logger.write_to_log('args_error','','',(msg % ' '.join(argv)))
            self.error(msg % ' '.join(argv))
        return args

    def print_usage(self, file=None):
        logger = consts.glo_log()
        logger.write_to_log('result_to_show', '', '', 'print usage')
        if file is None:
            file = sys.stdout
        self._print_message(self.format_usage(), file)

    def print_help(self, file=None):
        logger = consts.glo_log()
        logger.write_to_log('result_to_show', '', '', 'print help')
        if file is None:
            file = sys.stdout
        self._print_message(self.format_help(), file)

    def _print_message(self, message, file=None):
        if message:
            if file is None:
                file = sys.stderr
            file.write(message)




class VtelCLI(object):
    """
    Vtel command line client
    """
    def __init__(self):
        consts._init()
        self.username = sundry.get_username()
        self.transaction_id = sundry.get_transaction_id()
        self.logger = log.Log(self.username,self.transaction_id)
        consts.set_glo_log(self.logger)

        self._node_commands = NodeCommands()
        self._resource_commands = ResourceCommands()
        self._storagepool_commands = StoragePoolCommands()
        self._disk_commands = DiskCommands()
        self._diskgroup_commands = DiskGroupCommands()
        self._host_commands = HostCommands()
        self._hostgroup_commands = HostGroupCommands()
        self._map_commands = MapCommands()
        self._parser = self.setup_parser()


    def setup_parser(self):
        parser = MyArgumentParser(prog="vtel")
        """
        Set parser vtel sub-parser
        """
        #parser.add_argument('--version','-v',action='version',version='%(prog)s ' + VERSION + '; ')


        subp = parser.add_subparsers(metavar='',
                                     dest='subargs_vtel')

        parser_stor = subp.add_parser(
            'stor',
            help='Management operations for LINSTOR',
            add_help=False,
            formatter_class=argparse.RawTextHelpFormatter,
        )


        # add parameters to interact with the GUI
        parser_stor.add_argument(
            '-gui',
            dest='gui',
            action='store_true',
            help=argparse.SUPPRESS,
            default=False)

        parser_iscsi = subp.add_parser(
            'iscsi',
            help='Management operations for iSCSI',
            add_help=False)


        parser_iscsi.add_argument(
            '-gui',
            dest='gui',
            action='store_true',
            help=argparse.SUPPRESS,
            default=False)


        # replay function related parameter settings
        parser_replay = subp.add_parser(
            'replay',
            aliases=['re'],
            formatter_class=argparse.RawTextHelpFormatter
        )

        parser_replay.add_argument(
            '-t',
            '--transactionid',
            dest='transactionid',
            metavar='',
            help='transaction id')

        parser_replay.add_argument(
            '-d',
            '--date',
            dest='date',
            metavar='',
            nargs=2,
            help='date')

        self.parser_stor = parser_stor
        self.parser_iscsi = parser_iscsi
        self.parser_replay = parser_replay

        # Set the binding function of stor
        parser_stor.set_defaults(func=self.send_database)
        # Set the binding function of iscsi
        parser_iscsi.set_defaults(func=self.send_json)

        parser_replay.set_defaults(func=self.replay)

        subp_stor = parser_stor.add_subparsers(dest='subargs_stor',metavar='')
        subp_iscsi = parser_iscsi.add_subparsers(dest='subargs_iscsi',metavar='')

        # add all subcommands and argument
        self._node_commands.setup_commands(subp_stor)
        self._resource_commands.setup_commands(subp_stor)
        self._storagepool_commands.setup_commands(subp_stor)

        self._disk_commands.setup_commands(subp_iscsi)
        self._diskgroup_commands.setup_commands(subp_iscsi)
        self._host_commands.setup_commands(subp_iscsi)
        self._hostgroup_commands.setup_commands(subp_iscsi)
        self._map_commands.setup_commands(subp_iscsi)

        parser.set_defaults(func=parser.print_help)

        return parser

    # When using the parameter '-gui', send the database through the socket
    def send_database(self, args):
        if args.gui:
            db = linstordb.LinstorDB()
            data = pickle.dumps(db.data_base_dump())
            sundry.send_via_socket(data)
        else:
            self.parser_stor.print_help()

    # When using the parameter '-gui', send the json through the socket
    def send_json(self, args):
        js = iscsi_json.JSON_OPERATION()
        if args.gui:
            data = js.read_json()
            data_pickled = pickle.dumps(data)
            sundry.send_via_socket(data_pickled)
        else:
            self.parser_iscsi.print_help()

    def replay(self,args):
        logdb = replay.LogDB()
        logdb.produce_logdb()
        # 全局
        if args.transactionid and args.date:
            print('Please specify only one type of data for replay')
            return
        elif args.transactionid:
            cmd = logdb.get_userinput_from_tid(args.transactionid)
            self.replay_args = self._parser.parse_args(cmd.split())
            print(self.replay_args)


            #  传递这个命令
        elif args.date:
            # python3 vtel_client_main.py re -d '2020/06/16 16:08:00' '2020/06/16 16:08:10'
            cmds = logdb.get_userinput_from_time(args.date[0],args.date[1])
            result_all = logdb.get_result_from_time(args.date[0],args.date[1])
            # for cmd,res in zip(cmds,result_all):
            #     print('CMD:%s' % cmd)
            #     subprocess.run('python3 %s'%cmd,shell=True)
            #     print('--------------------Output comparison--------------------')
            #     print(res[0])
            #     print('========================= next ==========================')
        else:
            pass
            # 获取log的全部tid，从而后去命令，进行循环执行


    def run(self,args):
        rpl = consts.glo_rpl()
        if rpl == 'yes':
            args.func(self.replay_args)
        else:
            args.func(args)


    def parse(self):
        args = self._parser.parse_args()
        if args.subargs_vtel == 'replay':
            print('replay')
            consts.set_glo_log_switch('no')
            pass
            # 设置全局变量
            # 获取要执行的命令？
        if sys.argv:
            path = sundry.get_path()
            cmd = ' '.join(sys.argv)
            self.logger.write_to_log('user_input',path,'',cmd)

        if args.subargs_vtel:
            self.run(args)
        else:
            self._parser.print_help()


def main():
    try:
        cmd = VtelCLI()
        cmd.parse()
    except KeyboardInterrupt:
        sys.stderr.write("\nClient exiting (received SIGINT)\n")


if __name__ == '__main__':
    main()
