Installation
=============

Requirements
------------


**Python modules**

- argh==0.26.2
- attrs==18.2.0
- beautifulsoup4==4.7.1
- bottle==0.12.13
- glob2==0.6
- lxml==4.3.1
- more-itertools==6.0.0
- pathtools==0.1.2
- Pillow==5.4.1
- pluggy==0.6.0
- py==1.7.0
- pytest==3.5.0
- PyYAML==3.12
- six==1.12.0
- soupsieve==1.7.3
- waitress==1.2.1
- watchdog==0.8.3
- WebOb==1.8.5
- WebTest==2.0.29
- xmltodict==0.11.0


**For building the web app**

- Node.js >= 10.6.0


Install by pip
--------------

- Linux(Ubuntu) OS: You can install ReNomTAG via the pip command.

.. code-block:: shell

    pip3 install https://grid-devs.gitlab.io/ReNomTAG/bin/renom_tag-1.2b0-py3-none-any.whl


Install from source
-------------------

.. code-block:: shell

    # Clone the ReNomTAG repository
    git clone https://github.com/ReNom-dev-team/ReNomTAG.git

    # In the ReNomTAG direcotry
    cd ReNomTAG
    pip install -r requirements.txt
    python setup.py build
    pip install -e .

