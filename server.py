# coding: utf-8

import json
import os
import pkg_resources
from bottle import HTTPResponse, route, run, static_file, request, response, Bottle, hook, get

app = Bottle()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def set_json_body(body):
  r = HTTPResponse(status=200, body=body)
  r.set_header('Content-Type', 'application/json')
  return r


@hook('after_request')
def enable_cors():
  # set CORS headers
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'


@route("/")
def index():
  return pkg_resources.resource_string(__name__, "index.html")


@route("/css/<file_name>")
def css(file_name):
  return static_file(file_name, root=BASE_DIR + '/css')


@route("/static/<file_name>")
def static(file_name):
  return pkg_resources.resource_string(__name__, "static/" + file_name)


@route("/fonts/<file_name>")
def fonts(file_name):
  return pkg_resources.resource_string(__name__, "static/fonts/" + file_name)


@route("/api/get_file_list", method="POST")
def get_file_list():
  root_dir = request.params.root_dir
  print(root_dir)
  files = os.listdir(root_dir)

  ret = json.dumps({
    "file_list": sorted(list(map(lambda x: os.path.join(root_dir, x), files)))
  })
  ret = set_json_body(ret)
  return ret


@route("/img/<file_name>")
def img(file_name):
  return pkg_resources.resource_string(__name__, "img/" + file_name)


if __name__ == '__main__':
  from optparse import OptionParser

  parser = OptionParser()

  parser.add_option("--host", dest="host", default="0.0.0.0",
                    help="hostname or ip address", metavar="host")

  parser.add_option("--port", dest="port", default=8090,
                    help="port number", metavar="port")
  (options, args) = parser.parse_args()

  run(host=options.host, port=int(options.port))
