import os
import sys
import re
import shutil
import pathlib
from setuptools import setup, find_packages
import distutils.command.build

if sys.version_info < (3, 4):
    raise RuntimeError('renomtag requires Python3')

DIR = str(pathlib.Path(__file__).resolve().parent)

requires = [
    "bs4", "bottle", "glob2", "lxml", "Pillow",
    "PyYAML", "watchdog", "xmltodict"
]


entry_points = {
    'console_scripts': [
        'renomtag = renomtag.server:main',
    ]
}

versionpy = os.path.join(DIR, 'renomtag/__version__.py')
version = re.search(r'"([\d.]+)"', open(versionpy).read()).group(1)


class BuildNPM(distutils.command.build.build):
    """Custom build command."""

    def run(self):
        shutil.rmtree(os.path.join(DIR, 'renomtag/.build'), ignore_errors=True)
        curdir = os.getcwd()
        try:
            jsdir = os.path.join(DIR, 'js')

            # skip if js directory not exists.
            if os.path.isdir(jsdir):
                os.chdir(jsdir)
                ret = os.system('npm install')
                if ret:
                    raise RuntimeError('Failed to install npm modules')

                ret = os.system('npm run build')
                if ret:
                    raise RuntimeError('Failed to build npm modules')

        finally:
            os.chdir(curdir)

        super().run()


setup(
    name="renomtag",
    version=version,
    entry_points=entry_points,
    packages=['renomtag'],
    install_requires=requires,
    include_package_data=True,
    zip_safe=True,
    cmdclass={
        'build': BuildNPM,
    },
)
