# coding: utf-8

import json, xmltodict
from PIL import Image
import os
import pkg_resources
from bottle import HTTPResponse, route, run, static_file, request, response, Bottle, hook, get
import base64
import glob2
import bs4

from io import BytesIO as IO

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
  return sorted(res)


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
  print(filename)

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
  file_paths = get_img_path(root_dir)

  # filename_list = [f.split("/")[-1] for f in file_paths]

  body = json.dumps({
    "filename_list": file_paths,
  })
  ret = set_json_body(body)
  return ret


@route("/api/get_sidebar_thumbnail_and_filename_list", method="POST")
def get_sidebar_thumbnail_and_filename_list():
  file_paths = request.params.filename_list.split(",")

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
    "sidebar_filename_list": [f.split("/")[-1] for f in file_paths],
    "sidebar_filename_list_index": indices
  })
  ret = set_json_body(body)
  return ret


@route("/api/save_xml_from_dict", method="POST")
def save_xml_from_dict():
  """save xml file from dictionary

  :return:
  """

  tag_dict_data = json.loads(request.params.dict_data)
  save_xml_file_path = request.params.save_xml_file_path

  tag_dict_data_split = tag_dict_data['anotation']['path'].split('/')
  if len(tag_dict_data_split) > 1:
    folder = tag_dict_data_split[-2]
  else:
    folder = '.'

  file_name = tag_dict_data_split[-1]

  tag_dict_data['anotation']['folder'] = folder
  tag_dict_data['anotation']['file_name'] = file_name

  # convert dict to xml
  xml_data = json2xml(tag_dict_data)
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


@route("/api/save_tag_dict", method="POST")
def save_tag_dict():
  json_data = request.params.tag_dict
  save_json_file_path = request.params.save_json_file_path

  with open(save_json_file_path, 'w') as ftpr:
    ftpr.write(json_data)


@route("/api/load_tag_candidates_dict", method="POST")
def save_tag_dict():
  load_json_file_path = request.params.load_json_file_path
  file_path = load_json_file_path

  with open(file_path, 'r') as ftpr:
    json_data = json.load(ftpr)

  body = json.dumps({
    'json_data': json_data
  })

  ret = set_json_body(body)
  return ret


if __name__ == '__main__':
  run(host="0.0.0.0", port=8090)
