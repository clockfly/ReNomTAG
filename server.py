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
import sys
import mimetypes
import time
from io import BytesIO as IO
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


app = Bottle()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = 'dataset'
XML_DIR = 'label'

for path in [IMG_DIR, XML_DIR]:
    if not os.path.exists(path):
        os.makedirs(path)

ERROR = {
  FileNotFoundError.__name__: 1
}


def get_error_msg(exception):
    ret = ERROR.get(exception.__class__.__name__, 999)
    print("DEBUG", ret)
    return ret


def set_json_body(body):
    r = HTTPResponse(status=200, body=body)
    r.set_header('Content-Type', 'application/json')
    return r


def get_img_paths(img_dir=IMG_DIR):
    exts = ["jpg", "jpeg", "png"]
    res = []
    for e in exts:
        path = os.path.join(img_dir, "**", '*.' + e)
        res.extend(glob2.glob(path))
    return sorted(res)


def get_xml_paths(xml_dir=XML_DIR):
    xml_files_pat = os.path.join(xml_dir, "**.xml")
    xml_paths = glob2.glob(xml_files_pat)
    return xml_paths


def get_file_name(x):
    return x.split("/")[-1].split(".")[0]


IMG_FILE_CACHE = []
XML_FILE_CACHE = []

def get_difference_set():
    global IMG_FILE_CACHE, XML_FILE_CACHE
    if not IMG_FILE_CACHE:
        IMG_FILE_CACHE = get_img_paths(IMG_DIR)
    img_paths = IMG_FILE_CACHE

    if not XML_FILE_CACHE:
        XML_FILE_CACHE = get_xml_paths(XML_DIR)
    xml_paths = XML_FILE_CACHE
    xml_names = list(map(get_file_name, xml_paths))
    def difference_set_paths_filter(img_paths):
        img_name = get_file_name(img_paths)
        return img_name not in xml_names

    ret = list(filter(difference_set_paths_filter, img_paths))
    if not ret:
        raise FileNotFoundError()
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
            sub_obj = json_obj[tag_name]
            result_list.append("%s<%s>" % (line_padding, tag_name))
            result_list.append(json2xml(sub_obj, "\t" + line_padding))
            result_list.append("%s</%s>" % (line_padding, tag_name))

        return "\n".join(result_list)

    return "%s%s" % (line_padding, json_obj)


def xml2json(xml_file, xml_attribs=True):
    with open(xml_file, "rb") as f:  # notice the "rb" mode
        d = xmltodict.parse(f, xml_attribs=xml_attribs)
        return json.dumps(d, indent=4)


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



@route("/t/<file_name:re:.+>")
def get_thumbnail(file_name):
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
    img.thumbnail((35, 140), Image.ANTIALIAS)
    buffered = IO()
    img.save(buffered, format='PNG')

    ret = buffered.getvalue()
    response.set_header('Content-Length', len(ret))

    return ret




@route("/api/get_raw_img", method="POST")
def get_raw_img():
    # root_dir = request.params.root_dir
    filename = request.params.filename

    # file_path = os.path.join(root_dir, filename)
    with open(filename, "rb") as image_reader:
        encoded_img = base64.b64encode(image_reader.read())
        encoded_img = encoded_img.decode('utf8')

    ret = json.dumps({
      "raw_img": encoded_img
    })
    ret = set_json_body(ret)
    return ret


@route("/api/get_raw_images", method="POST")
def get_raw_images():
    # root_dir = request.params.root_dir
    # filename_list = request.params.filename_list.split(',')
    filename_list = request.params.filename_list.split(',')

    result = []
    for filename in filename_list:
        # file_path = os.path.join(root_dir, filename)
        with open(filename, "rb") as image_reader:
            encoded_img = base64.b64encode(image_reader.read())
            encoded_img = encoded_img.decode('utf8')

        result.append(encoded_img)

    ret = json.dumps({
      "raw_images": result
    })

    ret = set_json_body(ret)
    return ret


@route("/api/get_small_sized_images", method="POST")
def get_small_sized_images():
    # root_dir = request.params.root_dir
    # filename_list = request.params.filename_list.split(',')
    filename_list = request.params.filename_list.split(',')

    result = []
    for filename in filename_list:
        # file_path = os.path.join(root_dir, filename)

        img = Image.open(filename, 'r')
        img.thumbnail((1000, 150), Image.ANTIALIAS)
        buffered = IO()
        img.save(buffered, format='PNG')
        encoded_img = base64.b64encode(buffered.getvalue())
        encoded_img = encoded_img.decode('utf8')
        result.append(encoded_img)

    ret = json.dumps({
      "small_sized_images": result
    })

    ret = set_json_body(ret)
    return ret

@route("/api/get_filename_list", method="POST")
def get_filename_list():
    success = 0
    try:
        difference_set_paths = get_difference_set()
    except Exception as e:
        difference_set_paths = []
        success = get_error_msg(e)

    body = json.dumps({
      "success": success,
      "filename_list": difference_set_paths,
    })
    ret = set_json_body(body)
    return ret


@route("/api/get_sidebar_thumbnail_and_filename_list", method="POST")
def get_sidebar_thumbnail_and_filename_list():
    import time
    f = time.time()
    success = 0
    file_paths = get_difference_set()
    # current page. start: 1
    current_page = int(request.params.current_page)

    # number of images to show. ex: 100
    page_step = int(request.params.page_step)

    start_page = (current_page - 1) * page_step
    end_page = current_page * page_step

    image_list = []
    # get page file paths
    file_paths = file_paths[start_page:end_page]
    body = json.dumps({
      "success":success,
      "sidebar_filename_list": file_paths,
    })
    ret = set_json_body(body)
    return ret


@route("/api/save_xml_from_label_dict", method="POST")
def save_xml_from_label_dict():
    """save xml file from dictionary

    :return:
    """
    label_dict = json.loads(request.params.label_dict)
    save_xml_file_name = request.params.save_xml_file_name

    if not os.path.exists(XML_DIR):
        os.makedirs(XML_DIR)

    save_xml_file_path = os.path.join(XML_DIR, save_xml_file_name + '.xml')

    label_dict_split = label_dict['annotation']['path'].split('/')
    if len(label_dict_split) > 1:
        folder = label_dict_split[-2]
    else:
        folder = '.'

    file_name = label_dict_split[-1]
    label_dict['annotation']['folder'] = folder
    label_dict['annotation']['file_name'] = file_name

    # convert dict to xml
    xml_data = json2xml(label_dict)
    # extract objects
    xml_soup = bs4.BeautifulSoup(xml_data, 'lxml')

    if (xml_soup.find('object')):
        xml_soup.find('object').parent.unwrap()

    with open(save_xml_file_path, 'w') as ftpr:
        ftpr.write(xml_soup.find('annotation').prettify())

    print('%s is saved' % (save_xml_file_path))


@route("/api/load_json_from_xml", method="POST")
def load_json_from_xml():
    json_data = xml2json(request.params.xml_file_name)
    body = json.dumps({
      'json_data': json_data
    })
    ret = set_json_body(body)
    return ret


@route("/api/save_label_candidates_dict", method="POST")
def save_label_candidates_dict():
    json_data = request.params.json_data
    save_json_file_path = request.params.save_json_file_path

    with open(save_json_file_path, 'w') as ftpr:
        ftpr.write(json_data)


@route("/api/load_label_candidates_dict", method="POST")
def load_label_candidates_dict():
    load_json_file_path = request.params.load_json_file_path

    with open(load_json_file_path, 'r') as ftpr:
        json_data = json.load(ftpr)

    body = json.dumps({
      'json_data': json_data
    })

    ret = set_json_body(body)
    return ret


@route("/api/get_bbox_list", method="POST")
def get_bbox_list():
    xml_file_path = request.params.xml_file_path

    if not os.path.exists(xml_file_path):
        json_data = ''

    else:
        json_data = xml2json(xml_file_path)

        json_dict = json.loads(json_data)

        try:
            # object dataが1つだけの場合、dictになってしまうのでlistに変換する
            if isinstance(json_dict['annotation']['object'], dict):
                temp = [json_dict['annotation']['object']]
                json_dict['annotation']['object'] = temp

        except KeyError:
            json_dict['annotation']['object'] = ''

        json_data = json.dumps(json_dict, indent=4)

    body = json.dumps({
      'json_data': json_data
    })

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

if __name__ == '__main__':
    observer = Observer()
    observer.schedule(ImageEventHandler(), IMG_DIR, recursive=True)
    observer.schedule(XMLEventHandler(), XML_DIR, recursive=True)
    observer.daemon = True

    observer.start()
    run(host="0.0.0.0", port=8090)
    observer.stop()
    observer.join()
