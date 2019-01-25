# coding: utf-8

import json
import xmltodict
from PIL import Image
import os
import argparse
import pkg_resources
from bottle import (HTTPResponse, route, run, static_file, request,
                    response, Bottle, hook, get, parse_date)
import base64
from xml.sax import saxutils
import glob2
import bs4
import os
import re
import sys
import pathlib
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

    # joining public/user/dataset/
    dir = os.path.join(DIR_ROOT, os.path.normpath(dir))

    # add / in the end of "dir" if not exists
    if not dir.endswith(os.path.sep):
        dir = dir + os.path.sep

    # only a-z A-Z 0-9 _ can use as filename
    # initialze matchObject
    isvalid = re.compile(r"^[a-zA-Z0-9_.\%s]+$" % os.path.sep).match

    # path for any named files of file-extention=ext
    path = os.path.join(dir, "**", '*.' + ext)

    # 1) for name in glob2.glob(path)
    # 2) if isvalid(name)
    # 3) name[len(dir):]
    # 4) add "name" to list "names"
    #names = [name[len(dir):] for name in glob2.glob(path) if isvalid(name)]
    names = []
    undef_names = []
    for name in glob2.glob(path):
        # all files which exist in the "path"
        if isvalid(name):
            # name[len(dir):] does extract only filename
            names.append(name[len(dir):])

        if not isvalid(name):
            undef_names.append(name[len(dir):])

    return names, undef_names


def get_img_files(folder):
    ensure_folder(folder)
    exts = ["jpg", "jpeg", "png", "bmp"]
    ret_names = []
    ret_undef_names = []

    # joining user/dataset/
    dir = os.path.join(folder, IMG_DIR)
    for e in exts:
        names, undef_names = filter_datafilenames(dir, e)
        ret_names.extend(names)
        ret_undef_names.extend(undef_names)
    return ret_names, ret_undef_names


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
        json_obj = saxutils.escape(json_obj)

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


@app.route("/admin")
def index():
    return _get_resource('', 'index.html')


@app.route("/static/<file_name:re:.+>")
def static(file_name):
    return _get_resource('static', file_name)

# TODO


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
        json_dict = None
    else:
        json_data = xml2json(xmlfilename)
        json_dict = json.loads(json_data)
        try:
            # object dataが1つだけの場合、dictになってしまうのでlistに変換する
            if isinstance(json_dict['annotation']['object'], dict):
                temp = [json_dict['annotation']['object']]
                json_dict['annotation']['object'] = temp
        except KeyError:
            json_dict['annotation']['object'] = []

        # revert `object` to original name(`objects`)
        json_dict['annotation']['objects'] = json_dict['annotation']['object']
        del json_dict['annotation']['object']

        # None を空文字列に変換
        if not json_dict['annotation']['source'].get('reviewresult', False):
            json_dict['annotation']['source']['reviewresult'] = ''
        if not json_dict['annotation']['source'].get('reviewcomment', False):
            json_dict['annotation']['source']['reviewcomment'] = ''
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


# roothing for get_filename_list
@app.route("/api/get_filename_list", method="POST")
def get_filename_list():
    #import pdb;pdb.set_trace()
    folder = request.json['folder']
    folder = strip_foldername(folder)
    img_paths, undef_img_path = get_img_files(folder)

    ret = {}
    for img in img_paths:
        xml = get_boxes(folder, img)
        d = {'filename': img, 'xml': xml}
        ret[img] = xml

    body = json.dumps({
        "filename_list": ret,
        "undef_filename_list": undef_img_path,
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
    folder = os.path.join('dataset', folder).rstrip('/')  # add 'dataset' for compatibility

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

    xml = get_boxes(request.json['folder'], file_name)
    ret = set_json_body({'result': xml})
    return ret


@app.route("/api/delete_xml",method=["POST"])
def delete_xml():
    filename, ext = os.path.splitext(request.json['target_filename'])
    filename = filename + ".xml"
    folder = request.json['folder']

    xmldir = os.path.join(get_folderpath(folder), XML_DIR)
    delete_xml_file_name = check_path(xmldir, filename)

    result = 100
    if os.path.exists(delete_xml_file_name):
        os.remove(delete_xml_file_name)
        result = 1
        message = "deleting boxes sucessed!"
        print('%s is deleted!' % (delete_xml_file_name))
    else:
        result = 0
        message = "deleting boxes faital!"
        print('[ERROR] Since filename:%s connot be found,' % (delete_xml_file_name))
        print('it was not deleted. Please check if the xml-file exists!')


    body = json.dumps({
        "result": result,
        "message": message
    })
    ret = set_json_body(body)
    return ret

@app.route("/api/load_xml_tagged_images", method=["POST"])
def load_xml_tagged_images():
    label_dict = request.json

    folder = pathlib.Path(label_dict['folder'])

    targetdir = (DIR_ROOT / folder / pathlib.Path(XML_DIR))
    searchdir = (DIR_ROOT / folder / pathlib.Path(IMG_DIR))

    # keep the path for xml files
    before_sort_info = []
    for p in targetdir.iterdir():
        if p.is_file() and str(p).endswith('.xml'):
            before_sort_info.append(p.relative_to(targetdir))

    # use for sort
    sort_info = []

    for tagged_img in before_sort_info:
        time = os.stat(str(targetdir / tagged_img)).st_mtime
        sort_info.append(dict(time=time, tagged_img=tagged_img))

    # sort by edited time
    _sort = sorted(sort_info, key=lambda x: x['time'], reverse=False)

    # remove dictionary key
    tagged_info = [item.pop('tagged_img') for item in sort_info]

    imgs = []
    # get tagged images from xml
    for tagged_img in reversed(tagged_info):

        # load xml file convert to json
        # extract bounding box
        xml = get_boxes(str(folder), str(tagged_img))
        filename = check_path(os.path.join(get_folderpath(str(folder)),
                                           IMG_DIR), xml['annotation']['filename'])

        img = open(filename, "rb").read()
        encoded_img = base64.b64encode(img)
        encoded_img = encoded_img.decode('utf8')

        boxes = []
        objects = xml['annotation']['objects']
        # get objects
        for i in range(len(objects)):
            left = objects[i]['bndbox']['xmin']
            right = objects[i]['bndbox']['xmax']
            top = objects[i]['bndbox']['ymin']
            bottom = objects[i]['bndbox']['ymax']

            label = objects[i]['name']

            boxes.append(dict(left=left, right=right, top=top, bottom=bottom, label=label))
        # add tagged info
        imgs.append(dict(
            filename=xml['annotation']['filename'],
            height=xml['annotation']['size']['height'],
            width=xml['annotation']['size']['width'],
            boxes=boxes,
            image="data:image;base64," + encoded_img
        ))

    ret = set_json_body({'result': imgs})
    return ret


SAVE_JSON_FILE_PATH = "label_candidates.json"


@app.route("/api/save_label_candidates_dict", method=['POST'])
def save_label_candidates_dict():
    label_dict = request.json
    labels = {}
    src_labels = label_dict['labels']

    max_id = 0
    for n, d in enumerate(label_dict['labels']):
        label = d['label'].strip()
        shortcut = d['shortcut'].strip()

        if not re.match(r"^[0-9a-zA-Z]+$", label):
            raise ValueError("Invalid label")
        if not shortcut:
            shortcut = 'no_shortcut%s' % n

        if 'id' in d:
            label_id = d['id']
            labels[label_id] = {'label': label, 'shortcut': shortcut}
            if max_id < int(label_id):
                max_id = int(label_id)
        else:
            if n < max_id:
                n = max_id

            labels[n] = {'label': label, 'shortcut': shortcut}

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
            if 'no_shortcut' in v['shortcut']:
                v['shortcut'] = ''
            ret.append({'id': int(k), 'label': v['label'], 'shortcut': v['shortcut']})

    # sort label
    sort = sorted(ret, key=lambda x: x['id'])
    body = json.dumps(sort)
    return set_json_body(body)


@app.route("/api/delete_label_candidates_dict", method=["POST"])
def delete_label_candidates_dict():
    label_dict = request.json

    folderpath = get_folderpath(label_dict['folder'])
    jsonfile = os.path.join(folderpath, SAVE_JSON_FILE_PATH)

    if os.path.exists(jsonfile):
        os.remove(jsonfile)



# DIR_ROOT = 'public'
# search inside the "bublic" ande get folderlist
@app.route("/api/folderlist", method=["POST"])
def get_folderlist():
    # folders = the list of user-folder
    current_dir = os.getcwd()
    public = os.path.join(current_dir, DIR_ROOT)

    if os.path.exists(public) and os.path.isdir(public):
        folders = []
        for d in sorted(os.listdir(DIR_ROOT)):
            if not re.match(r"^[a-zA-Z0-9._]+$", d):
                continue

            if not os.path.isdir(os.path.join(DIR_ROOT, d)):
                continue

            if not os.path.exists(os.path.join(DIR_ROOT, d, IMG_DIR)):
                continue

            folders.append(d)
        ret = set_json_body(json.dumps(
                            {'result':1,
                            'folder_list': folders
                            }))

    else:
        #message = 'No folder named "public" in the current directory. \n Wanna create directories?'
        #message = 'No folder named "public" in the current directory: \n'+ str(current_dir) + '\n'
        #message = message + 'Wanna create directories?'
        ret = set_json_body(json.dumps(
                            # {'message': message,
                            {'result':0,
                             'current_dir': current_dir
                            }))


    return ret


@app.route("/api/make_dir", method=["POST"])
def make_dir():
    working_dir = request.json['working_dir']
    username = request.json['username']
    result = 0

    if not os.path.exists(working_dir):
        result = 10
        message = '[ERROR] No such a directory. chose others. ' + working_dir
        print(message)

    elif not re.match(r"^[a-zA-Z0-9._]+$", username):
        result = 20
        message = '[ERROR] The username is unavailable. use only halfwidth-alphanumeric (0-9, a-z, A-Z) and under-bar (_).'
        print(message)

    else:
        # string -> join to pat
        public = os.path.join(working_dir,DIR_ROOT)
        user_folder = os.path.join(public,username)
        dataset = os.path.join(user_folder,IMG_DIR)
        label = os.path.join(user_folder,XML_DIR)

        os.makedirs(user_folder)
        os.mkdir(dataset)
        os.mkdir(label)
        result = 111
        message = 'Making a directory sucessed!'
        print(message)

    #message = message + "load again to start."
    ret = set_json_body(json.dumps({'result': result }))
    return ret


def main():
    parser = argparse.ArgumentParser(description='ReNomTAG')
    parser.add_argument('--port', type=int, help='Port Number', default=8080)
    args = parser.parse_args()
    run(app, host="0.0.0.0", port=args.port)


if __name__ == '__main__':
    main()
