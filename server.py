# coding: utf-8

import json
import os
import pkg_resources
from bottle import HTTPResponse, route, run, static_file, request, response, Bottle, hook, get
import base64
import glob2

app = Bottle()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# IMG_DIR = '/Users/shotakikuchi/Screenshot'
IMG_DIR = 'img'


# images_pattern = ".*(jpg|jpeg|png)"


# IMAGE_DIR = os.path.join(BASE_DIR, "img")


def set_json_body(body):
  r = HTTPResponse(status=200, body=body)
  r.set_header('Content-Type', 'application/json')
  return r


def get_img_path(img_dir=IMG_DIR):
  exts = ["jpg", "jpeg", "png"]
  res = []
  for e in exts:
    path = os.path.join(img_dir, "**", '*.' + e)
    print(path)

    if len(res) == 0:
      res = glob2.glob(path)
    else:
      res.extend(glob2.glob(path))
  return res


@hook('after_request')
def enable_cors():
  # set CORS headers
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'


@route("/")
def index():
  # return "index!!!"
  return pkg_resources.resource_string(__name__, "index.html")


@route("/static/css/<file_name>")
def css(file_name):
  return pkg_resources.resource_string(__name__, "static/css/" + file_name)


@route("/static/<file_name>")
def static(file_name):
  return pkg_resources.resource_string(__name__, "static/" + file_name)


@route("/static/fonts/<file_name>")
def fonts(file_name):
  return pkg_resources.resource_string(__name__, "static/fonts/" + file_name)


@route("/api/get_file_list", method="POST")
def get_file_list():
  root_dir = request.params.root_dir
  # root_dir = os.path.join(BASE_DIR, root_dir)
  # root_dir = "/Users/shotakikuchi/Screenshot"
  # root_dir = "./img"
  # print(root_dir)
  files = os.listdir(root_dir)

  ret = json.dumps({
    "file_list": sorted(list(map(lambda x: os.path.join(root_dir, x), files)))
  })
  ret = set_json_body(ret)
  return ret


# @route("/img/<filepath:re:.*\.(jpg|png|gif|ico|svg)>")
# def img(filepath):
#     return static_file(filepath, root="/img")



@route("/img/<file_name>")
def img(file_name):
  return pkg_resources.resource_string(__name__, "img/" + file_name)


# スレッドを止めるapi
@route("/api/get_img", method="POST")
def get_img():
  file_paths = get_img_path()

  images_list = []
  for f in file_paths:
    with open(f, "rb") as image_file:
      result = base64.b64encode(image_file.read())
      result = result.decode('utf8')
      temp_dict = {
        "file_path": f,
        "encoded": result,
        "file_name": f.split("/")[-1]
      }
      images_list.append(temp_dict)

  body = json.dumps({
    # "server_file": encoded_string.decode('utf8')
    "images_list": images_list
  })

  # return (body)

  ret = set_json_body(body)
  return ret


if __name__ == '__main__':
  from optparse import OptionParser

  parser = OptionParser()

  # parser.add_option("--host", dest="host", default="localhost",
  #                   help="hostname or ip address", metavar="host")

  parser.add_option("--host", dest="host", default="0.0.0.0",
                    help="hostname or ip address", metavar="host")

  parser.add_option("--port", dest="port", default=8090,
                    help="port number", metavar="port")
  (options, args) = parser.parse_args()

  run(host=options.host, port=int(options.port))

# run(host="0.0.0.0", port=8090)
