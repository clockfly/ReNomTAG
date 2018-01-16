# coding: utf-8

import json, xmltodict
from PIL import Image
import os
import pkg_resources
from bottle import HTTPResponse, route, run, static_file, request, response, Bottle, hook, get
import base64
import glob2
import bs4
import os, sys

from io import BytesIO as IO

app = Bottle()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = '../ObjDetector/dataset/VOCdevkit/VOC2012/JPEGImages/'
XML_DIR = './xml'


def set_json_body(body):
  r = HTTPResponse(status=200, body=body)
  r.set_header('Content-Type', 'application/json')
  return r


def get_img_paths(img_dir=IMG_DIR):
  exts = ["jpg", "jpeg", "png"]
  res = []
  for e in exts:
    path = os.path.join(img_dir, "**", '*.' + e)
    if len(res) == 0:
      res = glob2.glob(path)
    else:
      res.extend(glob2.glob(path))
  return sorted(res)


def get_xml_paths(xml_dir=XML_DIR):
  xml_files_pat = os.path.join(xml_dir, "**.xml")
  xml_paths = glob2.glob(xml_files_pat)
  return xml_paths


def get_file_name(x):
  return x.split("/")[-1].split(".")[0]


def get_difference_set():
  img_paths = get_img_paths(IMG_DIR)
  xml_paths = get_xml_paths(XML_DIR)
  xml_names = list(map(get_file_name, xml_paths))

  def difference_set_paths_filter(img_paths):
    img_name = get_file_name(img_paths)
    return img_name not in xml_names

  return list(filter(difference_set_paths_filter, img_paths))


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


@route("/api/get_filename_list", method="POST")
def get_filename_list():
  root_dir = request.params.root_dir

  difference_set_paths = get_difference_set()

  body = json.dumps({
    "filename_list": difference_set_paths,
  })
  ret = set_json_body(body)
  return ret


@route("/api/get_sidebar_thumbnail_and_filename_list", method="POST")
def get_sidebar_thumbnail_and_filename_list():
  # file_paths = request.params.filename_list.split(",")
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
  indices = list(range(start_page + 1, start_page + end_page + 1))

  for f in file_paths:
    img = Image.open(f, 'r')
    img.thumbnail((40, 40), Image.ANTIALIAS)
    buffered = IO()
    img.save(buffered, format='PNG')
    encoded_img = base64.b64encode(buffered.getvalue())
    encoded_img = encoded_img.decode('utf8')
    image_list.append(encoded_img)

  body = json.dumps({
    "sidebar_thumbnail_list": image_list,
    "sidebar_filename_list": file_paths,
    "sidebar_filename_list_index": indices
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
  save_xml_dir = request.params.save_xml_dir

  if not os.path.exists(save_xml_dir):
    os.makedirs(save_xml_dir)

  save_xml_file_path = os.path.join(save_xml_dir, save_xml_file_name + '.xml')

  label_dict_split = label_dict['anotation']['path'].split('/')
  if len(label_dict_split) > 1:
    folder = label_dict_split[-2]
  else:
    folder = '.'

  file_name = label_dict_split[-1]
  label_dict['anotation']['folder'] = folder
  label_dict['anotation']['file_name'] = file_name

  # convert dict to xml
  xml_data = json2xml(label_dict)
  # extract objects
  xml_soup = bs4.BeautifulSoup(xml_data, 'lxml')

  if (xml_soup.find('object')):
    xml_soup.find('object').parent.unwrap()

  with open(save_xml_file_path, 'w') as ftpr:
    ftpr.write(xml_soup.find('anotation').prettify())

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
      if isinstance(json_dict['anotation']['object'], dict):
        temp = [json_dict['anotation']['object']]
        json_dict['anotation']['object'] = temp

    except KeyError:
      json_dict['anotation']['object'] = ''

    json_data = json.dumps(json_dict, indent=4)

  body = json.dumps({
    'json_data': json_data
  })

  ret = set_json_body(body)
  return ret


if __name__ == '__main__':
  run(host="0.0.0.0", port=8090)
