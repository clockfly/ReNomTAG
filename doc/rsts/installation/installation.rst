Installation
=============

Requirements
------------

**Python modules**

- argh==0.26.2
- attrs==17.4.0
- beautifulsoup4==4.6.0
- bottle==0.12.13
- bs4==0.0.1
- glob2==0.6
- lxml==4.2.0
- more-itertools==4.1.0
- pathtools==0.1.2
- Pillow==5.0.0
- pluggy==0.6.0
- py==1.5.3
- pytest==3.5.0
- PyYAML==3.12
- six==1.11.0
- waitress==1.1.0
- watchdog==0.8.3
- WebOb==1.7.4
- WebTest==2.0.29
- xmltodict==0.11.0


Install by pip
--------------

- Linux(Ubuntu) OS: You can install ReNomTAG by pip command.

.. code-block:: shell

    pip install https://grid-devs.gitlab.io/ReNomTAG/bin/renom_tag-VERSION-cp35-cp35m-linux_x86_64.whl


Install from source
-------------------

.. code-block:: shell

    git clone https://github.com/ReNom-dev-team/ReNomTAG.git
    cd ReNomTAG
    pip install -r requirements.txt
    python setup.py build
    pip install -e .

