How to use
==========

Before starting
----------------

Directory structure
~~~~~~~~~~~~~~~~~~~

Before starting ReNomTGA, let me introduce the 
directory structure.

If you run ReNomTAG in the ``working_directory``, image datasets need to be
aligned as following directory structure.

Do not change the directory name of ``public``, ``dataset`` and ``label``.

The role of each directory are below.

- public
    This is the root directory of datasets. The directory name ``public`` must not be changed.

- user1, user2...
    These directories contain image data and created label data for each user.
    These directories' names can be changed.

- dataset
    This directory contains image data for tagging.

- label
    Created label data will be put into this directory.

.. code-block:: shell

    working_directory # Current Working directory
        │   
        └── public # This name must be `public`.
            │   
            ├── user1 # Dataset for user1. You can put any name for this directory.
            │   ├── dataset # Directory in which image data put. This name must be `dataset`.
            │   │   ├── image1.jpg
            │   │   ├── image2.jpg
            │   │   ├── ...
            │   │   └── imageN.jpg
            │   └── label # Directory to which tag data will output. This name must be `label`.
            │       ├── image1.xml
            │       ├── image2.xml
            │       ├── ...
            │       └── imageN.xml
            │   
            ├── user2 # Dataset for user2
            │   │   
           ...   ...
            │   
            └── userN
                ├── dataset
                │   ├── image_car1.jpg
                │   └── image_car2.jpg
                └── label
                    ├── image_car1.xml
                    └── image_car2.xml

Put Image data
~~~~~~~~~~~~~~~
Please put image data to ``dataset`` directory.


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Run server
---------
For running ReNomTAG, please use following command in your ``working directory``.

.. code-block:: shell

    renom_tag

This command has following options.

.. code-block:: shell

    # Run with port 8081
    renom_tag --port 8081

And put the following URL to your web browser.

.. image:: /_static/image/how_to_use02.png

Then the ``public`` directory will be loaded and following screen.

.. image:: /_static/image/how_to_use01.png


Put tags to images
-------------------

Put a tag(Bounding Box)
~~~~~~~~~~~~~~~~~~~~~~~

You can put a tag(Bounding box) by dragging.

.. image:: /_static/image/how_to_use08.png

.. note::

    For saving the tag(a pair of bounding boxes and tag name), ``class tag name`` are required.


Save the tag
~~~~~~~~~~~~~~~~~~~~~

For saving the tag, please push the ```save`` button.
Or the ``Space`` key acts as a shortcut of save.


Set a shortcut key to class tag
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You can set a shortcut key to the class tag name.



Show filtered images
~~~~~~~~~~~~~~~~~~~~~~~~~~

You can filter the images to be shown. 

- **All** : All of images.
- **Need Review** : Images that are marked neither OK nor NG.
- **No Tags** : Images that has no tags.
- **OK** : Images that are marked as ``OK`` by admin user.
- **NG** : Images that are marked as ``NG`` by admin user.

.. image:: /_static/image/how_to_use07.png


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Admin mode
-----------

Admin mode has following functions.

- Create new class tags.
- Mark the tagged image ``OK`` or ``NG``.
- Put comments to the tagged image.

Enter admin mode
~~~~~~~~~~~~~~~~~

To enter the admin mode, please put ``admin`` to the URL like this.

.. image:: /_static/image/how_to_use03.png

Then you will see the title has changed to ``Admin``.

.. image:: /_static/image/how_to_use04.png


Add new class tag
~~~~~~~~~~~~~~~~~

When you are in the admin mode, you can add new class tag.
To do this, input new class tag name to the following form.

And push the ``Add New Tag`` button.

You can also add a shortcut key. The shortcut key can be changed
if you are in the normal mode.

.. image:: /_static/image/how_to_use05.png

Put a mark to the image
~~~~~~~~~~~~~~~~~~~~~~~~

Admin mode also provides marking function.
You can mark tagged images as ``OK`` or ``NG``.

For doing this, please push the following OK, NG button.

.. image:: /_static/image/how_to_use06.png

And then pushing the ``save`` button, the mark will be saved.


Put a comment to the image
~~~~~~~~~~~~~~~~~~~~~~~~

You can also put a comment to the image.
The user in normal mode can see the comment but they can't change this.


Back to normal mode
~~~~~~~~~~~~~~~~~~~

To go back to normal mode, please remove ``admin`` from the URL.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Use ReNomTAG with multiple user
-------------------------------

You can add user directory under the public folder and
you can choose the directory you work on.

.. image:: /_static/image/how_to_use09.png

Above image represents following directory structure.
There are 4 user directories(Alice, Bob, user and user2).

.. code-block:: shell

    working_directory # Current Working directory
        │   
        └── public
            │   
            ├── Alice
            │   ├── dataset
            │   │   ├── image1.jpg
            │   │   ├── ...
            │   │   └── imageN.jpg
            │   └── label
            │       ├── image1.xml
            │       ├── ...
            │       └── imageN.xml
            │   
            ├── Bob
            │   ├── dataset
            │   │   ├── image_car1.jpg
            │   │   ├── ...
            │   │   └── image_carN.jpg
            │   └── label
            │       ├── image_car1.xml
            │       ├── ...
            │       └── image_carN.xml
            │   
            ├── user1
            │   ├── dataset
            │   │   ├── image_person1.jpg
            │   │   ├── ...
            │   │   └── image_personN.jpg
            │   └── label
            │       ├── image_person1.xml
            │       ├── ...
            │       └── image_personN.xml
            │   
            └── user2
                ├── dataset
                │   ├── image_bird1.jpg
                │   └── image_bird2.jpg
                └── label
                    ├── image_bird1.xml
                    └── image_bird2.xml

You can work on the any user directory.
Each data of directory will not be shared.

.. note::
    The user separated directories are recognised by ReNomTAG if 
    they contains ``dataset`` and ``label`` directories.
