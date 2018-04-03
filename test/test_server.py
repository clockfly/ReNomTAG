from unittest import mock
import pprint
import json
import os
import tempfile
from contextlib import contextmanager

from PIL import Image
import xmltodict
from webtest import TestApp as testapp
from renomtag import server


def test_get_raw_img(tmpdir):
    with tmpdir.as_cwd():
        imgdir = tmpdir.join(server.IMG_DIR)
        imgdir.mkdir()

        im = Image.new("RGB", (512, 512))
        im.save(imgdir.join('a.png').strpath, 'PNG')

        app = testapp(server.app)
        ret = app.get('/api/get_raw_img/dataset/a.png')
        assert len(ret.body) == 1177


def test_get_thumbnail(tmpdir):
    with tmpdir.as_cwd():
        imgdir = tmpdir.join(server.IMG_DIR)
        imgdir.mkdir()

        im = Image.new("RGB", (512, 512))
        im.save(imgdir.join('a.png').strpath, 'PNG')

        app = testapp(server.app)
        ret = app.get('/t/dataset/a.png')
        assert len(ret.body) == 94


def test_save_xml_from_label_dict(tmpdir):
    with tmpdir.as_cwd():

        xmldir = tmpdir.join(server.XML_DIR)
        xmldir.mkdir()

        json = {'annotation':
                {'path': 'dataset/a.jpg',
                 'source': {'database': 'Unknown'},
                 'size': {'width': 500, 'height': 375, 'depth': 3},
                 'segments': 0,
                 'objects': [
                     {'object':
                      {'name': 'asda', 'pose': 'Unspecified',
                       'truncated': 0, 'difficult': 0,
                       'bndbox':
                       {'xmin': 10, 'xmax': 100, 'ymin': 20, 'ymax': 200
                        }}}]}}

        app = testapp(server.app)
        app.post_json('/api/save_xml_from_label_dict', json)

        xml = xmldir.join('a.xml').read_text('utf8')
        d = xmltodict.parse(xml, xml_attribs=True)

        ann = d['annotation']
        assert ann['path'] == 'dataset/a.jpg'
        assert ann['size']['width'] == '500'
        assert ann['size']['height'] == '375'
        assert ann['folder'] == 'dataset'
        assert ann['filename'] == 'a.jpg'


def test_get_filename_list(tmpdir):
    with tmpdir.as_cwd():

        imgdir = tmpdir.join(server.IMG_DIR)
        imgdir.mkdir()
        imgdir.join('a.jpeg').write_binary(b'')
        imgdir.join('b.jpeg').write_binary(b'')

        xmldir = tmpdir.join(server.XML_DIR)
        xmldir.mkdir()
        xmldir.join('a.xml').write_binary(b'')

        app = testapp(server.app)
        ret = app.post('/api/get_filename_list')
        assert ret.json_body == {
            "success": 0,
            "filename_list": ["dataset/b.jpeg"]
        }


def test_save_label_candidates_dict(tmpdir):
    with tmpdir.as_cwd():
        app = testapp(server.app)
        app.post_json('/api/save_label_candidates_dict', [
            {'label': 'label', 'shortcut': '1'}
        ])

        saved = json.load(open(server.SAVE_JSON_FILE_PATH))
        assert saved == {'1': {'label': 'label'}}


def test_load_label_candidates_dict(tmpdir):
    with tmpdir.as_cwd():
        d = {'1': {'label': 'label'}}

        with open(server.SAVE_JSON_FILE_PATH, 'w') as f:
            json.dump(d, f)

        app = testapp(server.app)
        ret = app.post('/api/load_label_candidates_dict')
        assert ret.json_body == [{"label": "label", "shortcut": "1"}]
