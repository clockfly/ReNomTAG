from unittest import mock
import pprint
import json
import os
import tempfile
from contextlib import contextmanager

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


def test_get_raw_img(tmpdir):
    with tmpdir.as_cwd():
        imgdir = build_img_dir(tmpdir, 'folderx')

        im = Image.new("RGB", (512, 512))
        im.save(imgdir.join('a.png').strpath, 'PNG')

        app = testapp(server.app)
        ret = app.get('/api/get_raw_img/folderx/a.png')
        assert len(ret.body) == 1177


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

        xml = xmldir.join('a.xml').read_text('utf8')
        d = xmltodict.parse(xml, xml_attribs=True)

        ann = d['annotation']
        assert ann['path'] == 'a.jpg'
        assert ann['size']['width'] == '500'
        assert ann['size']['height'] == '375'
        assert ann['folder'] == 'dataset'
        assert ann['filename'] == 'a.jpg'

## TODO
def test_get_filename_list(tmpdir):
    with tmpdir.as_cwd():

        imgdir = build_img_dir(tmpdir, 'folderx')

        imgdir.join('a.jpeg').write_binary(b'')
        imgdir.join('b.jpeg').write_binary(b'')

        xmldir = build_xml_dir(tmpdir, 'folderx')
        xmldir.join('a.xml').write_binary(b'')

        app = testapp(server.app)
        ret = app.post_json('/api/get_filename_list', {'folder': 'folderx', 'all': False})

        assert ret.json_body == {
            "success": 0,
            "filename_list": ["b.jpg"]
        }


def test_save_label_candidates_dict(tmpdir):
    with tmpdir.as_cwd():
        xmldir = build_xml_dir(tmpdir, 'folderx')

        app = testapp(server.app)
        app.post_json('/api/save_label_candidates_dict',
                      {'folder': 'folderx',
                       'labels': [{'label': 'label', 'shortcut': '1'}]})

        jsonfile = tmpdir.join(server.DIR_ROOT, 'folderx',
                               server.SAVE_JSON_FILE_PATH)

        saved = json.load(open(jsonfile.strpath))
        assert saved == {'1': {'label': 'label'}}


def test_load_label_candidates_dict(tmpdir):
    with tmpdir.as_cwd():
        xmldir = build_xml_dir(tmpdir, 'folderx')

        d = {'1': {'label': 'label'}}
        jsonfile = tmpdir.join(server.DIR_ROOT, 'folderx',
                               server.SAVE_JSON_FILE_PATH)

        with open(jsonfile.strpath, 'w') as f:
            json.dump(d, f)

        app = testapp(server.app)
        ret = app.post_json('/api/load_label_candidates_dict', {'folder': 'folderx'})
        assert ret.json_body == [{"label": "label", "shortcut": "1"}]




# made　mamually "pablic/user/~" inside the ReNomTAG/test
def test_get_img_file(tmpdir):
    tmpdir = "user"
    file_name_list, nonDef_list = server.get_img_files(tmpdir)
    print(file_name_list)
    print(nonDef_list)
    assert 0
