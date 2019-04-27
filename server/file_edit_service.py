import asyncio
import json
import logging
import websockets
from datetime import datetime

def pack_message(method, data):
    return json.dumps({'m': method, 'd': data})

class FileEditService:

    def __init__(self,id, pathname):
        self.pathname = pathname
        self.filename = pathname[pathname.rfind("/")+1:]
        self.id = id
        self.users = {}
        self.content = open(pathname,'r').read()

        self.methods = {
            'edit': self.on_edit
        }


    async def add_user(self, name, ws):
        self.users[name] = ws
        msg = pack_message('f_req', {'initc': self.content, 'id': self.id})
        print(msg)
        await ws.send(msg)

    def remove_user(self, name):
        self.users.pop(name, None)

    async def on_edit(self, name, d):
        for k in self.users.keys():
            if k == name: continue

            await self.users[k].send(pack_message('f_obj',
                {
                'id':self.id,
                'fm':'edit',
                'v':d['v']
                }
            ))

    async def on_message(self,d, name):
        await self.methods[d['fm']](name, d)
