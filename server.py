# coding: utf-8

import json
import os
import pkg_resources
from bottle import HTTPResponse, route, run, static_file, request, response, Bottle, hook, get
import base64
import glob2

app = Bottle()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = '../ObjDetector/dataset/VOCdevkit/VOC2012/JPEGImages/'


def set_json_body(body):
    r = HTTPResponse(status=200, body=body)
    r.set_header('Content-Type', 'application/json')
    return r


def get_img_path(img_dir=IMG_DIR):
    exts = ["jpg", "jpeg", "png"]
    res = []
    for e in exts:
        path = os.path.join(img_dir, "**", '*.' + e)
        if len(res) == 0:
            res = glob2.glob(path)
        else:
            res.extend(glob2.glob(path))
    return res


@route("/")
def index():
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
    files = os.listdir(root_dir)
    ret = json.dumps({
        "file_list": sorted(list(files))
    })
    ret = set_json_body(ret)
    return ret


@route("/api/get_img", method="POST")
def get_img_list():
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
        "images_list": images_list
    })
    ret = set_json_body(body)
    return ret


if __name__ == '__main__':
    run(host="0.0.0.0", port=8090)
