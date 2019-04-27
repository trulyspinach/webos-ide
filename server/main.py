import asyncio
import json
import logging
import websockets
import os
from datetime import datetime

from file_edit_service import FileEditService
from filesystem_provider import FileSystemProvider

from os_provider.app import start_os_provider

USERS = {}
CIPHER = "123"

fs = FileSystemProvider()
fes = {}
fes_id = 0

def pack_message(method, data):
    return json.dumps({'m': method, 'd': data})


async def fs_dict_req(user, ws, d):
    dv = fs.get_files_dict()
    await ws.send(pack_message('fs_dict', dv))

async def f_id_req(user, ws, d):
    global fes_id
    requested_name = d['n']
    fp = None
    for p in fes:
        if requested_name == fes[p].pathname:
            fp = fes[p]

    #start the file service
    if fp == None:
       fp = FileEditService(fes_id, requested_name)
       fes[int(fes_id)] = fp
       fes_id += 1

    await ws.send(pack_message('f_idreq',{'id': fp.id,'name':fp.filename}))



async def file_request(user, ws, d):
    print(d)
    fs = fes.get(int(d['id']), None)

    #Should not happen
    if fs == None: return
    #     fs = FileEditService(d['id'])
    #     fes[d['id']] = fs

    await fs.add_user(user, ws)

async def file_obj(user, ws, d):
    await fes[int(d['id'])].on_message(d, user)


async def add_user(name, websocket):
    USERS[name] = websocket


async def remove_user(name):
    USERS.pop(name)



async def accept_clients(websocket, path):
    print("new client")
    # register(websocket) sends user_event() to websocket
    username = ""
    loginSucceed = False
    try:


        #Wait till login

        async for message in websocket:
            data = json.loads(message)
            if data.get('m', None) != 'login': continue
            logind = data.get('d', {})

            if logind.get("cipher", "") != CIPHER:
                print("Hacker detected!")
                await websocket.send(pack_message('login', {'succeed': False, 'reason':"Cipher mismatch"}))
                websockets.close()
                break

            await websocket.send(pack_message('login', {'succeed': True, 'reason':""}))
            username = logind['username']
            await add_user(username, websocket)
            print(f"{username} was logined")
            break

        #For every messages
        async for message in websocket:
            data = json.loads(message)
            print(data)
            method = ws_methods.get(data['m'], None)
            print(method)
            if method == None:
                logging.error("unsupported event: {}", data)
                continue

            await method( username, websocket, data['d'])

    except e:
        # print(e)
        print("client gone :(")
    finally:
        if loginSucceed:
            await remove_user(username)

ws_methods = {
    'f_idreq': f_id_req,
    'f_req': file_request,
    'f_obj': file_obj,
    'fs_dict': fs_dict_req
}


if not os.fork():
    os.chdir("./devroot")
    start_os_provider()


print("serving")
asyncio.get_event_loop().run_until_complete(
    websockets.serve(accept_clients, '0.0.0.0', 16666))
asyncio.get_event_loop().run_forever()
