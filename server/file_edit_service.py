import asyncio
import json
import logging
import websockets
import spinach_rope as r

from datetime import datetime

def pack_message(method, data):
    return json.dumps({'m': method, 'd': data})


class Rope:
    def __init__(self, str):
        self.rope = r.rope(str)

    def replace(self, startIndex, length, text):
        self.rope.delete(startIndex, startIndex + length)
        self.rope.insert(startIndex, text)

    def __repr__(self):
        return self.rope.get_str()


class FileEditService:

    def __init__(self,id, pathname):
        self.pathname = pathname
        self.filename = pathname[pathname.rfind("/")+1:]
        self.id = id
        self.users = {}
        self.content = open(pathname,'r').read()
        self.rope = Rope(self.content)

        self.methods = {
            'edit': self.on_edit,
            'mov_cursor': self.on_move_cursor
        }


    async def add_user(self, name, ws):
        self.users[name] = ws
        msg = pack_message('f_req', {'initc': self.content, 'id': self.id})
        print(msg)
        await ws.send(msg)

    def remove_user(self, name):
        self.users.pop(name, None)

    async def on_edit(self, name, d):
        ddv = d['v']
        edit_i = ddv['i']
        edit_len = ddv['l']
        edit_text = ddv['t']

        self.rope.replace(edit_i, edit_len, edit_text)
        print(self.rope)
        for k in self.users.keys():
            if k == name: continue
            await self.users[k].send(pack_message('f_obj',
                {
                'id':self.id,
                'fm':'edit',
                'v':d['v']
                }
            ))

    async def on_move_cursor(self, name, d):
        ddv = d['v']
        col = ddv['l']
        line = ddv['c']

        for k in self.users.keys():
            if k == name: continue

            await self.users[k].send(pack_message('f_obj',
                {
                'id':self.id,
                'fm':'mov_cursor',
                'v':d['v']
                }
            ))

    async def on_message(self,d, name):
        # print(self.methods.get(d['fm'], None))
        await self.methods[d['fm']](name, d)
