# coding: utf-8

import json
import xmltodict
from PIL import Image
import os
import pkg_resources
from bottle import (HTTPResponse, route, run, static_file, request,
    response, Bottle, hook, get, parse_date)
import base64
import glob2
import bs4
import os
import re
import sys
import mimetypes
import time
from io import BytesIO as IO
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import posixpath
import PIL

app = Bottle()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = 'dataset'
XML_DIR = 'label'

for path in [IMG_DIR, XML_DIR]:
    if not os.path.exists(path):
        os.makedirs(path)

@hook('after_request')
def enable_cors():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = (
        'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token')


def set_json_body(body):
    r = HTTPResponse(status=200, body=body)
    r.set_header('Content-Type', 'application/json')
    r.headers['Access-Control-Allow-Origin'] = '*'
    r.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
    r.headers['Access-Control-Allow-Headers'] = (
        'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token')
    return r


def get_img_files():
    global IMG_FILE_CACHE
    if IMG_FILE_CACHE:
        return

    exts = ["jpg", "jpeg", "png"]
    res = []
    for e in exts:
        path = os.path.join(IMG_DIR, "**", '*.' + e)
        for name in glob2.glob(path):
            if re.match(r"[a-zA-Z0-9.\%s]" % os.path.sep, name):
                res.append(name)
    IMG_FILE_CACHE = sorted(res)


def get_xml_files():
    global XML_FILE_CACHE
    if XML_FILE_CACHE:
        return

    xml_files_pat = os.path.join(XML_DIR, "**.xml")
    xml_paths = glob2.glob(xml_files_pat)
    XML_FILE_CACHE = list(xml_paths)


def _get_file_name(x):
    return os.path.splitext(os.path.split(x)[1])[0]

IMG_FILE_CACHE = []
XML_FILE_CACHE = []

def get_difference_set():
    get_img_files()
    get_xml_files()

    img_paths = IMG_FILE_CACHE
    xml_paths = XML_FILE_CACHE
    xml_names = list(map(_get_file_name, xml_paths))

    def difference_set_paths_filter(img_path):
        img_name = _get_file_name(img_path)
        return img_name not in xml_names

    ret = list(filter(difference_set_paths_filter, img_paths))
    ret.sort()
    return ret


def json2xml(json_obj, line_padding=""):
    result_list = list()

    json_obj_type = type(json_obj)

    if json_obj_type is list:
        for sub_elem in json_obj:
            result_list.append(json2xml(sub_elem, line_padding))

        return "\n".join(result_list)

    if json_obj_type is dict:
        for tag_name in json_obj:
            if not re.match('^[0-9a-zA-Z]+$', tag_name):
                raise ValueError('Invalid tag name')

            sub_obj = json_obj[tag_name]
            result_list.append("%s<%s>" % (line_padding, tag_name))
            result_list.append(json2xml(sub_obj, "\t" + line_padding))
            result_list.append("%s</%s>" % (line_padding, tag_name))

        return "\n".join(result_list)

    if not isinstance(json_obj, (int, float, str)):
        raise ValueError('Invalid tag value')

    if isinstance(json_obj, str):
        if not re.match('^[0-9a-zA-Z._%s]+$' % os.path.sep, json_obj):
            raise ValueError('Invalid string')

    return "%s%s" % (line_padding, json_obj)


def xml2json(xml_file, xml_attribs=True):
    with open(xml_file, "rb") as f:  # notice the "rb" mode
        d = xmltodict.parse(f, xml_attribs=xml_attribs)
        return json.dumps(d, indent=4)



def strip_path(filename):
    if os.path.isabs(filename):
        raise ValueError('Invalid path')
    if '..' in filename:
        raise ValueError('Invalid path')
    if ':' in filename:
        raise ValueError('Invalid path')

    filename = filename.strip().strip('./\\')
    return filename


def _get_resource(path, filename):
    filename = strip_path(filename)
    body = pkg_resources.resource_string(__name__, posixpath.join('.build', path, filename))
    
    headers = {}
    mimetype, encoding = mimetypes.guess_type(filename)
    if mimetype:
        headers['Content-Type'] = mimetype
    if encoding:
        headers['encoding'] = encoding
    return HTTPResponse(body, **headers)

@route("/")
def index():
    return _get_resource('', 'index.html')


@route("/static/<file_name:re:.+>")
def static(file_name):
    return _get_resource('static', file_name)


def check_path(path, filename):
    head = os.path.abspath(path)
    filename = os.path.abspath(filename)

    if not filename.startswith(head):
        raise ValueError('invalid path')

    if not head.endswith(('/', '\\')):
        if filename[len(head)] not in ('/', '\\'):
            raise ValueError('invalid path')


def get_boxes(img_filename):
    img_filename = strip_path(img_filename)
    filename = os.path.splitext(os.path.split(img_filename)[1])[0] + '.xml'
    xmlfilename = os.path.join(XML_DIR, filename)
    check_path(XML_DIR, xmlfilename)

    if not os.path.exists(xmlfilename):
        json_dict = {}
    else:
        json_data = xml2json(xmlfilename)
        json_dict = json.loads(json_data)

        try:
            # object dataが1つだけの場合、dictになってしまうのでlistに変換する
            if isinstance(json_dict['annotation']['object'], dict):
                temp = [json_dict['annotation']['object']]
                json_dict['annotation']['object'] = temp

        except KeyError:
            json_dict['annotation']['object'] = ''

    return json_dict


@route("/api/get_raw_img/<file_name:re:.+>")
def get_raw_img(file_name):

    filename = strip_path(file_name)
    check_path(IMG_DIR, file_name)

    img = open(filename, "rb").read()
    encoded_img = base64.b64encode(img)
    encoded_img = encoded_img.decode('utf8')

    im = PIL.Image.open(filename)
    width, height = im.size


    ret = json.dumps({
        'img': encoded_img,
        'width': width,
        'height': height,
        'boxes': get_boxes(file_name)
    })

    ret = set_json_body(ret)
    return ret


@route("/t/<file_name:re:.+>")
def get_thumbnail(file_name):
    file_name = strip_path(file_name)
    check_path(IMG_DIR, file_name)

    headers = {}
    stats = os.stat(file_name)

    lm = time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime(stats.st_mtime))
    response.set_header('Last-Modified', lm)

    ims = request.environ.get('HTTP_IF_MODIFIED_SINCE')
    if ims:
        ims = parse_date(ims.split(";")[0].strip())
    if ims is not None and ims >= int(stats.st_mtime):
        headers['Date'] = time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime())
        return HTTPResponse(status=304, **headers)

    response.content_type=mimetypes.guess_type(file_name)

    img = Image.open(file_name, 'r')
    img.thumbnail((70, 70), Image.ANTIALIAS)
    buffered = IO()
    img.save(buffered, format='PNG')

    ret = buffered.getvalue()
    response.set_header('Content-Length', len(ret))

    return ret


@route("/api/get_filename_list", method="POST")
def get_filename_list():
    success = 0
    difference_set_paths = get_difference_set()

    body = json.dumps({
      "success": success,
      "filename_list": difference_set_paths,
    })
    ret = set_json_body(body)
    return ret


@route("/api/save_xml_from_label_dict", method=["POST", "OPTIONS"])
def save_xml_from_label_dict():
    """save xml file from dictionary

    :return:
    """

    if request.method == 'OPTIONS':
        return set_json_body({})

    if not os.path.exists(XML_DIR):
        os.makedirs(XML_DIR)

    label_dict = request.json

    ann_path = strip_path(label_dict['annotation']['path'])
    check_path(IMG_DIR, ann_path)
    
    folder, file_name = posixpath.split(ann_path)
    if not folder:
        folder = '.'

    label_dict['annotation']['folder'] = folder
    label_dict['annotation']['filename'] = file_name

    save_xml_file_name = os.path.join(XML_DIR, _get_file_name(file_name)) + '.xml'
    check_path(XML_DIR, save_xml_file_name)

    # convert dict to xml
    xml_data = json2xml(label_dict)
    # extract objects
    xml_soup = bs4.BeautifulSoup(xml_data, 'lxml')

    if (xml_soup.find('object')):
        xml_soup.find('object').parent.unwrap()

    with open(save_xml_file_name, 'w') as ftpr:
        ftpr.write(xml_soup.find('annotation').prettify())

    print('%s is saved' % (save_xml_file_name))



@route("/api/save_label_candidates_dict", method=['OPTIONS', 'POST'])
def save_label_candidates_dict():
    if request.method == 'OPTIONS':
        return set_json_body({})

    save_json_file_path = "label_candidates.json"
    labels = {}
    for n, d in enumerate(request.json):
        label = d['label'].strip()
        shortcut = d['shortcut'].strip()
        if not re.match(r"^[0-9a-zA-Z]+$", label):
            raise ValueError("Invalid label")
        if not shortcut:
            shortcut = 'no_shortcut%s' % n

        labels[shortcut] = {'label': label}

    json_data = json.dumps(labels)
    with open(save_json_file_path, 'w') as ftpr:
        ftpr.write(json_data)


@route("/api/load_label_candidates_dict", method=["POST", "OPTIONS"])
def load_label_candidates_dict():
    if request.method == 'OPTIONS':
        return set_json_body({})

    load_json_file_path = "label_candidates.json"

    ret = []
    if os.path.exists(load_json_file_path):
        with open(load_json_file_path, 'r') as ftpr:
            json_data = json.load(ftpr)

        for k, v in json_data.items():
            if 'no_shortcut' in k:
                k = ''
            ret.append({'label':v['label'], 'shortcut':k})

    body = json.dumps(ret)
    ret = set_json_body(body)
    return ret


class ImageEventHandler(FileSystemEventHandler):
     def on_any_event(self, event):
        global IMG_FILE_CACHE
        IMG_FILE_CACHE = []


class XMLEventHandler(FileSystemEventHandler):
     def on_any_event(self, event):
        global XML_FILE_CACHE
        XML_FILE_CACHE = []

def main():
    get_img_files()
    get_xml_files()

    observer = Observer()
    observer.schedule(ImageEventHandler(), IMG_DIR, recursive=True)
    observer.schedule(XMLEventHandler(), XML_DIR, recursive=True)
    observer.daemon = True

    observer.start()
    run(host="0.0.0.0", port=8000)
    observer.stop()
    observer.join()


if __name__ == '__main__':
    main()
