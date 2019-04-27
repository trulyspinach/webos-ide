import tornado.web
from tornado.ioloop import IOLoop
from terminado import TermSocket, SingleTermManager

def start_os_provider():
    term_manager = SingleTermManager(shell_command=['bash','init.sh'])
    handlers = [
                (r"/websocket", TermSocket, {'term_manager': term_manager}),
                (r"/()", tornado.web.StaticFileHandler, {'path':'index.html'}),
                (r"/(.*)", tornado.web.StaticFileHandler, {'path':'.'}),
               ]
    app = tornado.web.Application(handlers)
    app.listen(8020)
    IOLoop.current().start()


# start_os_provider()
