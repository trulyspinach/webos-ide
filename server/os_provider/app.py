import tornado.web
from tornado.ioloop import IOLoop
from terminado import TermSocket, SingleTermManager

def start_os_provider():
    term_manager = SingleTermManager(shell_command=['bash'])
    handlers = [
                (r"/websocket", TermSocket, {'term_manager': term_manager}),
                (r"/()", tornado.web.StaticFileHandler, {'path':'../os_provider/index.html'}),
                (r"/(.*)", tornado.web.StaticFileHandler, {'path':'.'}),
               ]
    app = tornado.web.Application(handlers)
    app.listen(8020)
    IOLoop.current().start()
