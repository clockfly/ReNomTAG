# coding: utf-8

import json
from PIL import Image
import os
import cStringIO
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


@route("/api/get_raw_img", method="POST")
def get_raw_img():
    root_dir = request.params.root_dir
    filename = request.params.filename
    file_path = os.path.join(root_dir, filename)
    print(file_path)
    with open(file_path, "rb") as image_reader:
        encoded_img = base64.b64encode(image_reader.read())

    ret = json.dumps({
        "raw_img": encoded_img
    })
    ret = set_json_body(ret)
    return ret


@route("/api/get_thumbnail_img_and_filename_list", method="POST")
def get_thumbnail_img_and_filename_list():
    root_dir = request.params.root_dir
    file_paths = get_img_path(root_dir)
    image_list = []
    filename_list = []
    for f in file_paths:
        img = Image.open(f, 'r')
        img.thumbnail((40, 40), Image.ANTIALIAS)
        buffer = cStringIO.StringIO()
        img.save(buffer, format='PNG')
        encoded_img = base64.b64encode(buffer.getvalue())
       	encoded_img = encoded_img.decode('utf8')
        image_list.append(encoded_img)
        filename_list.append(f.split("/")[-1])
    body = json.dumps({
        "thumbnail_image_list": image_list,
				"filename_list": filename_list
    })
    ret = set_json_body(body)
    return ret


if __name__ == '__main__':
    run(host="0.0.0.0", port=8090)
