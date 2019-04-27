import asyncio
import json
import logging
import websockets
from datetime import datetime

from file_edit_service import FileEditService

USERS = {}
CIPHER = "123"

fes = {}

def pack_message(method, data):
    return json.dumps({'m': method, 'd': data})

async def file_request(user, ws, d):
    fs = fes.get(d['id'], None)
    if fs == None:
        fs = FileEditService(d['id'])
        fes[d['id']] = fs

    await fs.add_user(user, ws)

async def file_obj(user, ws, d):
    await fes[d['id']].on_message(d, user)


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
    'f_req': file_request,
    'f_obj': file_obj
}

print("serving")
asyncio.get_event_loop().run_until_complete(
    websockets.serve(accept_clients, '0.0.0.0', 16666))
asyncio.get_event_loop().run_forever()
