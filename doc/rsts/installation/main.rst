Installation
=============

Requirements
------------


**Python modules**

- b2==0.6
- bottle==0.12.13
- xmltodict==0.11.0
- setuptools==39.2.0
- Pillow==5.4.1
- beautifulsoup4==4.7.1


**For build web app**

- Node.js >= 10.6.0


Install by pip
--------------

- Linux(Ubuntu) OS: You can install ReNomTAG via the pip command.

.. code-block:: shell

    pip3 install https://grid-devs.gitlab.io/ReNomTAG/bin/renom_tag-1.0.2-py3-none-any.whl


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

