from unittest import mock
import pprint
import json
import os
import tempfile
from contextlib import contextmanager
import xml.etree.ElementTree as ET

from PIL import Image
import xmltodict
from webtest import TestApp as testapp
from renom_tag import server
import pytest


def build_img_dir(tmpdir, folder):
    imgdir = tmpdir.join(server.DIR_ROOT, folder, server.IMG_DIR)
    os.makedirs(imgdir.strpath)
    return imgdir


def build_xml_dir(tmpdir, folder):
    xmldir = tmpdir.join(server.DIR_ROOT, folder, server.XML_DIR)
    os.makedirs(xmldir.strpath)
    return xmldir


def create_xml_data():
    annotation = ET.Element('annotation')
    path = ET.SubElement(annotation, 'path')
    source = ET.SubElement(annotation, 'source')
    size = ET.SubElement(annotation, 'size')
    segments = ET.SubElement(annotation, 'segments')
    object = ET.SubElement(annotation, 'object')
    folder = ET.SubElement(annotation, 'folder')
    filename = ET.SubElement(annotation, 'filename')

    database = ET.SubElement(source, 'database')
    reviewresult = ET.SubElement(source, 'reviewresult')
    reviewcomment = ET.SubElement(source, 'reviewcomment')

    width = ET.SubElement(size, 'width')
    height = ET.SubElement(size, 'height')
    depth = ET.SubElement(size, 'depth')

    name = ET.SubElement(object, 'name')
    pose = ET.SubElement(object, 'pose')
    truncated = ET.SubElement(object, 'truncated')
    difficult = ET.SubElement(object, 'difficult')
    bndbox = ET.SubElement(object, 'bndbox')

    xmin = ET.SubElement(bndbox, 'xmin')
    xmax = ET.SubElement(bndbox, 'xmax')
    ymin = ET.SubElement(bndbox, 'ymin')
    ymax = ET.SubElement(bndbox, 'ymax')

    path.text = 'a.jpeg'
    database.text = 'Unknown'
    width.text = '275'
    height.text = '183'
    depth.text = '3'
    segments.text = '0'
    name.text = 'car'
    pose.text = 'Unspecified'
    truncated.text = '0'
    difficult.text = '0'
    xmin.text = '26'
    xmax.text = '247'
    ymin.text = '27'
    ymax.text = '162'
    folder.text = 'dataset'
    filename.text = 'a.jpeg'

    ex_xml = ET.tostring(annotation)
    return ex_xml


# not sure
def test_get_raw_img(tmpdir):
    with tmpdir.as_cwd():
        imgdir = build_img_dir(tmpdir, 'folderx')

        im = Image.new("RGB", (512, 512))
        im.save(imgdir.join('a.png').strpath, 'PNG')

        app = testapp(server.app)
        ret = app.get('/api/get_raw_img/folderx/a.png')
        assert len(ret.body) == 1179


def test_get_thumbnail(tmpdir):
    with tmpdir.as_cwd():
        imgdir = build_img_dir(tmpdir, 'folderx')

        im = Image.new("RGB", (512, 512))
        im.save(imgdir.join('a.png').strpath, 'PNG')

        app = testapp(server.app)
        ret = app.get('/t/folderx/a.png')
        assert len(ret.body) == 94


def test_save_xml_from_label_dict(tmpdir):
    with tmpdir.as_cwd():
        xmldir = build_xml_dir(tmpdir, 'folderx')

        json = {'folder': 'folderx',
                'value': {'annotation':
                          {'path': 'a.jpg',
                           'source': {'database': 'Unknown'},
                           'size': {'width': 500, 'height': 375, 'depth': 3},
                           'segments': 0,
                           'objects': [
                               {'object':
                                {'name': 'asda', 'pose': 'Unspecified',
                                   'truncated': 0, 'difficult': 0,
                                   'bndbox':
                                   {'xmin': 10, 'xmax': 100, 'ymin': 20, 'ymax': 200
                                    }}}]}}}

        app = testapp(server.app)
        app.post_json('/api/save_xml_from_label_dict', json)

        xml = xmldir.join('a_jpg.xml').read_text('utf8')
        d = xmltodict.parse(xml, xml_attribs=True)

        ann = d['annotation']
        assert ann['path'] == 'a.jpg'
        assert ann['size']['width'] == '500'
        assert ann['size']['height'] == '375'
        assert ann['folder'] == 'dataset'
        assert ann['filename'] == 'a.jpg'


def test_get_filename_list(tmpdir):
    with tmpdir.as_cwd():
        imgdir = build_img_dir(tmpdir, 'folderx')
        imgdir.join('a.jpeg').write_binary(b'')
        imgdir.join('b.jpg').write_binary(b'')
        imgdir.join('a-b.png').write_binary(b'')
        imgdir.join('ccc.bmp').write_binary(b'')

        xmldir = build_xml_dir(tmpdir, 'folderx')
        ex_xml = create_xml_data()
        xmldir.join('a_jpeg.xml').write(ex_xml)

        app = testapp(server.app)
        ret = app.post_json('/api/get_filename_list', {'folder': 'folderx', 'all': False})
        #filename_list = [*ret.json['filename_list']]
        filename_list = []
        for key in ret.json['filename_list']:
            filename_list.append(key)

        undef_filename_list = ret.json['undef_filename_list']
        print(filename_list)
        print(undef_filename_list)
        #assert filename_list ==['ccc.bmp','a.jpeg','b.jpg']
        assert undef_filename_list==['a-b.png']


def test_save_label_candidates_dict(tmpdir):
    with tmpdir.as_cwd():
        xmldir = build_xml_dir(tmpdir, 'folderx')

        app = testapp(server.app)
        app.post_json('/api/save_label_candidates_dict',
                      {'folder': 'folderx',
                       'labels': [{'id': 0, 'label': 'car', 'shortcut': '4'}, {'id': 1, 'label': 'dhjs', 'shortcut': 'g'}]})

        jsonfile = tmpdir.join(server.DIR_ROOT, 'folderx',
                               server.SAVE_JSON_FILE_PATH)

        saved = json.load(open(jsonfile.strpath))
        assert saved == {'0': {'label': 'car', 'shortcut': '4'}, '1': {'label': 'dhjs', 'shortcut': 'g'}}



def test_load_label_candidates_dict(tmpdir):
    with tmpdir.as_cwd():
        xmldir = build_xml_dir(tmpdir, 'folderx')

        d = {'0': {'label': 'car', 'shortcut': '4'}}
        jsonfile = tmpdir.join(server.DIR_ROOT, 'folderx',
                               server.SAVE_JSON_FILE_PATH)

        with open(jsonfile.strpath, 'w') as f:
            f.write(json.dumps(d))

        app = testapp(server.app)
        ret = app.post_json('/api/load_label_candidates_dict', {'folder': 'folderx'})
        assert ret.json_body == [{'id':0 ,'label': 'car', 'shortcut': '4'}]

def test_delete_xml(tmpdir):
    with tmpdir.as_cwd():
        xmldir = build_xml_dir(tmpdir, 'folderx')
        ex_xml = create_xml_data()
        xmldir.join('target_png.xml').write(ex_xml)

        app = testapp(server.app)
        ret = app.post_json('/api/delete_xml',
                     { 'folder': 'folderx',
                       'target_filename': 'target.png'})

        assert ret.json_body == {"result":1,"message":"deleting boxes sucessed!"}


<<<<<<< HEAD
def test_make_dir(tmpdir):
    with tmpdir.as_cwd():

        app = testapp(server.app)
        ret = app.post_json('/api/make_dir', {'working_dir': str(tmpdir), 'username': 'folderx'})
        assert ret.json_body == {'result': 111}




=======
>>>>>>> master
def test_get_img_file(tmpdir):
    with tmpdir.as_cwd():
        imgdir = build_img_dir(tmpdir, 'folderx')
        imgdir.join('a.jpeg').write_binary(b'')
        imgdir.join('aierf_y832fa.jpg').write_binary(b'')
        imgdir.join('c-b.png').write_binary(b'')
        imgdir.join('37oiahfw*.jpeg').write_binary(b'')
        imgdir.join('aakhk.bmp').write_binary(b'')

        ret_names, ret_undef_names = server.get_img_files('folderx')
        print("acceptable filename: {}".format(ret_names))
        print("illegal filename: {}".format(ret_undef_names))
        assert ret_names == ['aierf_y832fa.jpg', 'a.jpeg','aakhk.bmp']
        assert ret_undef_names == ['37oiahfw*.jpeg', 'c-b.png']

def test_get_filename_for_xml(tmpdir):
    with tmpdir.as_cwd():
        xml_filename1 = server._get_file_name_for_xml('a.jpeg')
        xml_filename2 = server._get_file_name_for_xml('aierf_y832fa.jpg')
        xml_filename3 = server._get_file_name_for_xml('aakhk.bmp')

        print('xml_filename1 :',xml_filename1)
        print('xml_filename2 :',xml_filename2)
        print('xml_filename3 :',xml_filename3)

        assert xml_filename1 == 'a_jpeg'
        assert xml_filename2 == 'aierf_y832fa_jpg'
        assert xml_filename3 == 'aakhk_bmp'
