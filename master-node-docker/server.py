# coding=utf-8
import json

import falcon
from falcon_cors import CORS

from sentinel.client import CreateNewAccount
from sentinel.client import GetBalance
from sentinel.client import GetVpnCredentials
from sentinel.client import GetVpnCurrentUsage
from sentinel.client import GetVpnUsage
from sentinel.client import GetVpnsList
from sentinel.client import PayVpnUsage
from sentinel.client import RawTransaction
from sentinel.client import ReportPayment
from sentinel.dev import GetFreeAmount
from sentinel.node import DeRegisterNode
from sentinel.node import GetActiveNodeCount
from sentinel.node import GetActiveSessionCount
from sentinel.node import GetAverageDuration
from sentinel.node import GetDailyDataCount
from sentinel.node import GetDailyDurationCount
from sentinel.node import GetDailyNodeCount
from sentinel.node import GetDailySessionCount
from sentinel.node import GetTotalDataCount
from sentinel.node import RegisterNode
from sentinel.node import UpdateConnections
from sentinel.node import UpdateNodeInfo
from sentinel.tokens import SwapsRawTransaction
from sentinel.utils import JSONTranslator


class Up(object):
    def on_post(self, req, resp):
        resp.status = falcon.HTTP_200
        resp.body = json.dumps({'status': 'UP'})

    def on_get(self, req, resp):
        resp.status = falcon.HTTP_200
        resp.body = json.dumps({'status': 'UP'})


cors = CORS(allow_all_origins=True)
server = falcon.API(middleware=[cors.middleware, JSONTranslator()])
server.add_route('/', Up())

# Clients
server.add_route('/client', Up())
server.add_route('/client/account', CreateNewAccount())
server.add_route('/client/account/balance', GetBalance())
server.add_route('/client/raw-transaction', RawTransaction())
server.add_route('/client/vpn', GetVpnCredentials())
server.add_route('/client/vpn/current', GetVpnCurrentUsage())
server.add_route('/client/vpn/list', GetVpnsList())
server.add_route('/client/vpn/usage', GetVpnUsage())
server.add_route('/client/vpn/pay', PayVpnUsage())
server.add_route('/client/vpn/report', ReportPayment())

# Nodes
server.add_route('/node', Up())
server.add_route('/node/account', CreateNewAccount())
server.add_route('/node/register', RegisterNode())
server.add_route('/node/update-nodeinfo', UpdateNodeInfo())
server.add_route('/node/deregister', DeRegisterNode())
server.add_route('/node/update-connections', UpdateConnections())

# Stats
server.add_route('/stats/sessions/daily-stats', GetDailySessionCount())
server.add_route('/stats/sessions/active-count', GetActiveSessionCount())
server.add_route('/stats/nodes/daily-stats', GetDailyNodeCount())
server.add_route('/stats/nodes/active-count', GetActiveNodeCount())
server.add_route('/stats/data/daily-stats', GetDailyDataCount())
server.add_route('/stats/data/total-data', GetTotalDataCount())
server.add_route('/stats/time/daily-stats', GetDailyDurationCount())
server.add_route('/stats/time/average-duration', GetAverageDuration())

# Swaps
server.add_route('/tokens', Up())
server.add_route('/tokens/swaps', Up())
server.add_route('/tokens/swaps/raw-transaction', SwapsRawTransaction())

# DEV
server.add_route('/dev/free', GetFreeAmount())
