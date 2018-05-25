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
import posixpath
import PIL

app = Bottle()
DIR_ROOT = 'public'
IMG_DIR = 'dataset'
XML_DIR = 'label'

# for path in [IMG_DIR, XML_DIR]:
#    if not os.path.exists(path):
#        os.makedirs(path)
#


def set_json_body(body):
    response.status = 200
    response.set_header('Content-Type', 'application/json')
    return body


def ensure_folder(folder):
    if not os.path.exists(os.path.join(DIR_ROOT, folder, IMG_DIR)):
        raise ValueError('Invalid folder')

    xmlfolder = os.path.join(DIR_ROOT, folder, XML_DIR)
    if not os.path.exists(xmlfolder):
        os.makedirs(xmlfolder)


def filter_datafilenames(dir, ext):
    dir = os.path.join(DIR_ROOT, os.path.normpath(dir))
    if not dir.endswith(os.path.sep):
        dir = dir + os.path.sep

    isvalid = re.compile(r"^[a-zA-Z0-9./_\%s]+$" % os.path.sep).match

    path = os.path.join(dir, "**", '*.' + ext)
    names = [name[len(dir):] for name in glob2.glob(path) if isvalid(name)]

    return names


def get_img_files(folder):
    ensure_folder(folder)
    exts = ["jpg", "jpeg", "png"]
    ret = []
    dir = os.path.join(folder, IMG_DIR)
    for e in exts:
        ret.extend(filter_datafilenames(dir, e))
    return ret


def get_xml_files(folder):
    ensure_folder(folder)
    dir = os.path.join(folder, XML_DIR)
    return filter_datafilenames(dir, "xml")


def _get_file_name(x):
    return os.path.splitext(os.path.split(x)[1])[0]


MAX_FOLDER_NAME = 256


def strip_foldername(folder):
    if (os.path.isabs(folder) or
        re.search(r'[^a-zA-Z0-9_.-]', folder) or
            (len(folder) >= MAX_FOLDER_NAME)):

        raise ValueError('Invalid path')

    return folder


def get_difference_set(folder):
    folder = strip_foldername(folder)

    img_paths = get_img_files(folder)
    xml_paths = get_xml_files(folder)
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


@app.route("/")
def index():
    return _get_resource('', 'index.html')


@app.route("/static/<file_name:re:.+>")
def static(file_name):
    return _get_resource('static', file_name)


def check_path(path, filename):
    head = os.path.abspath(path)
    if not head.endswith(('/', '\\')):
        head += os.path.sep

    filename = os.path.abspath(os.path.join(head, filename))

    if not filename.startswith(head):
        raise ValueError('invalid path')

    return filename


def get_folderpath(folder):
    return check_path(DIR_ROOT, folder)


def get_boxes(folder, img_filename):
    filename = os.path.splitext(os.path.split(img_filename)[1])[0] + '.xml'

    xmlfolder = os.path.join(get_folderpath(folder), XML_DIR)
    xmlfilename = check_path(xmlfolder, filename)

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


@app.route("/api/get_raw_img/<folder>/<file_name:re:.+>")
def get_raw_img(folder, file_name):
    filename = check_path(os.path.join(get_folderpath(folder), IMG_DIR), file_name)

    img = open(filename, "rb").read()
    encoded_img = base64.b64encode(img)
    encoded_img = encoded_img.decode('utf8')

    im = PIL.Image.open(filename)
    width, height = im.size
    ret = json.dumps({
        'img': encoded_img,
        'width': width,
        'height': height,
        'boxes': get_boxes(folder, filename)
    })

    ret = set_json_body(ret)
    return ret


@app.route("/t/<folder:re:.+>/<file_name:re:.+>")
def get_thumbnail(folder, file_name):

    filename = check_path(os.path.join(get_folderpath(folder), IMG_DIR), file_name)

    headers = {}
    stats = os.stat(filename)

    lm = time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime(stats.st_mtime))
    response.set_header('Last-Modified', lm)

    ims = request.environ.get('HTTP_IF_MODIFIED_SINCE')
    if ims:
        ims = parse_date(ims.split(";")[0].strip())
    if ims is not None and ims >= int(stats.st_mtime):
        headers['Date'] = time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime())
        return HTTPResponse(status=304, **headers)

    response.content_type = 'image/png'

    img = Image.open(filename, 'r')
    img.thumbnail((70, 70), Image.ANTIALIAS)
    buffered = IO()
    img.save(buffered, format='PNG')

    ret = buffered.getvalue()
    response.set_header('Content-Length', len(ret))

    return ret


@app.route("/api/get_filename_list", method="POST")
def get_filename_list():
    folder = request.json['folder']
    success = 0

    if request.json['all']:
        files = get_img_files(folder)
    else:
        files = get_difference_set(folder)

    body = json.dumps({
        "success": success,
        "filename_list": files,
    })
    ret = set_json_body(body)
    return ret


@app.route("/api/save_xml_from_label_dict", method=["POST"])
def save_xml_from_label_dict():
    """save xml file from dictionary

    :return:
    """

    label_dict = request.json['value']
    ann_path = strip_path(label_dict['annotation']['path'])
    check_path(IMG_DIR, ann_path)

    folder, file_name = posixpath.split(ann_path)
    folder = os.path.join('dataset', folder).rstrip('/') # add 'dataset' for compatibility
    
    label_dict['annotation']['folder'] = folder
    label_dict['annotation']['filename'] = file_name

    folderpath = os.path.join(get_folderpath(request.json['folder']), XML_DIR)
    save_xml_file_name = check_path(folderpath, _get_file_name(file_name)) + '.xml'

    # convert dict to xml
    xml_data = json2xml(label_dict)
    # extract objects
    xml_soup = bs4.BeautifulSoup(xml_data, 'lxml')

    if (xml_soup.find('object')):
        xml_soup.find('object').parent.unwrap()

    with open(save_xml_file_name, 'w') as ftpr:
        ftpr.write(xml_soup.find('annotation').prettify())

    print('%s is saved' % (save_xml_file_name))


SAVE_JSON_FILE_PATH = "label_candidates.json"


@app.route("/api/save_label_candidates_dict", method=['POST'])
def save_label_candidates_dict():
    label_dict = request.json
    labels = {}

    for n, d in enumerate(label_dict['labels']):
        label = d['label'].strip()
        shortcut = d['shortcut'].strip()
        if not re.match(r"^[0-9a-zA-Z]+$", label):
            raise ValueError("Invalid label")
        if not shortcut:
            shortcut = 'no_shortcut%s' % n

        labels[shortcut] = {'label': label}

    json_data = json.dumps(labels)
    folderpath = get_folderpath(label_dict['folder'])
    jsonfile = os.path.join(folderpath, SAVE_JSON_FILE_PATH)

    with open(jsonfile, 'w') as ftpr:
        ftpr.write(json_data)


@app.route("/api/load_label_candidates_dict", method=["POST"])
def load_label_candidates_dict():
    label_dict = request.json
    ret = []

    folderpath = get_folderpath(label_dict['folder'])
    jsonfile = os.path.join(folderpath, SAVE_JSON_FILE_PATH)

    if os.path.exists(jsonfile):
        with open(jsonfile, 'r') as ftpr:
            json_data = json.load(ftpr)

        for k, v in json_data.items():
            if 'no_shortcut' in k:
                k = ''
            ret.append({'label': v['label'], 'shortcut': k})

    body = json.dumps(ret)
    return set_json_body(body)


@app.route("/api/folderlist", method=["POST"])
def get_folderlist():
    folders = []
    for d in os.listdir(DIR_ROOT):
        if not re.match(r"^[a-zA-Z0-9._]+$", d):
            continue

        if not os.path.isdir(os.path.join(DIR_ROOT, d)):
            continue

        if not os.path.exists(os.path.join(DIR_ROOT, d, IMG_DIR)):
            continue

        folders.append(d)

    ret = set_json_body(json.dumps({'folder_list': folders}))
    return ret


def main():
    run(app, host="0.0.0.0", port=8000)


if __name__ == '__main__':
    main()
