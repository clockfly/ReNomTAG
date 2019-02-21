How to use
==========

Before starting
----------------

Directory structure
~~~~~~~~~~~~~~~~~~~

Before starting ReNomTAG, we will introduce the
directory structure.

Assuming that you run ReNomTAG in ``working_directory``, image datasets need to be
aligned according to the following directory structure.

Do not change the directory name of ``public``, ``dataset`` or ``label``.

The role of each directory is described below.

- public
    This is the root directory for datasets. The directory name ``public`` must not be changed.

- user1, user2...
    These directories contain image data and user-created label data for each user.
    These directories' names can be changed.

- dataset
    This directory contains image data for tagging.

- label
    User-created label data will be automatically saved into this directory.

.. code-block:: shell

    working_directory # Current Working directory
        │  
        └── public # This name must be `public`.
            │  
            ├── user1 # Dataset for user1. You can use any name for this directory.
            │   ├── dataset # Directory in which image data is placed. This name must be `dataset`.
            │   │   ├── image1.jpg
            │   │   ├── image2.jpg
            │   │   ├── ...
            │   │   └── imageN.jpg
            │   └── label # Directory to which tag data will be output. This name must be `label`.
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

Provide image data
~~~~~~~~~~~~~~~
Please place the image data into the ``dataset`` directory.

In addition, please note that ReNomTAG is only able to load file names with halfwidth-alphanumeric

(0-9, a-z, A-Z) and under-bar (_) characters. Filenames with, for example, hyphen (-), asterisk(*), etc

cannot be loaded. For file extensions, you are allowed to use ".jpeg", ".jpg", ".png", and ".bmp".

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Run server
---------
For running ReNomTAG, please use following command in your ``working directory``.

.. code-block:: shell

    renom_tag

This command has the following options.

.. code-block:: shell

    # Run with port 8081
    renom_tag --port 8081

Then type the following URL into your web browser.

.. image:: /_static/image/how_to_use02.png

The ``public`` directory will be loaded and following screen will be displayed.

.. image:: /_static/image/how_to_use01.png


Add tags to images
-------------------

Create tags (bounding boxes)
~~~~~~~~~~~~~~~~~~~~~~~

You can create a tag (bounding box) by dragging the cursor inside the image.

.. image:: /_static/image/how_to_use08.png

.. note::

    For saving the tag (a pair of bounding boxes and tag name), a ``class tag name`` is required.


Save tags
~~~~~~~~~~~~~~~~~~~~~

To save the tag, please click the ``save`` button.
The ``Space`` key also acts as a shortcut for saving.


Show a tag, only the one you selected
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
You can choose to show only one box by selecting it then clicking the ``toggle button``.
``Ctrl+d`` can also be used as a shortcut for this.
New boxes can still be added in this mode.
Return to the normal view by clicking the toggle button again.


Set shortcut keys for class tags
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You can set a shortcut key for each class tag name.



Filter images
~~~~~~~~~~~~~~~~~~~~~~~~~~

You can filter the images to be shown.

- **All** : Show all images.
- **Need Review** : Show images marked neither OK nor NG.
- **No Tags** : Show images with no tags.
- **OK** : Show images marked as ``OK`` by admin user.
- **NG** : Show images marked as ``NG`` by admin user.

.. image:: /_static/image/how_to_use07.png


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Admin mode
-----------

Admin mode has the following functions.

- Create new class tags.
- Mark tagged images as ``OK`` or ``NG``.
- Add comments to tagged images.

Enter admin mode
~~~~~~~~~~~~~~~~~

To enter admin mode, please add ``admin`` to the URL as shown below.

.. image:: /_static/image/how_to_use03.png

The title of the page should change to ``Admin``.

.. image:: /_static/image/how_to_use04.png


Add new class tag
~~~~~~~~~~~~~~~~~

If you are in admin mode, you can add new class tags.
To do this, type the new class tag name into the form shown below.

Next, click the ``Add New Tag`` button.

You can also add a shortcut key. The shortcut key can be changed
in either admin or normal mode.

.. image:: /_static/image/how_to_use05.png

Apply marks to images
~~~~~~~~~~~~~~~~~~~~~~~~

Admin mode also provides a marking function.
You can mark tagged images as ``OK`` or ``NG``.

To apply a mark, please click the OK or NG button.

.. image:: /_static/image/how_to_use06.png

After clicking the ``save`` button, the mark will be saved.


Add comments to images
~~~~~~~~~~~~~~~~~~~~~~~~

You can also add comments to images.
Users in normal mode can view comments but they cannot edit or add them.


Return to normal mode
~~~~~~~~~~~~~~~~~~~

To return to normal mode, please remove ``admin`` from the URL.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Use ReNomTAG with multiple users
-------------------------------

You can add multiple user directories under the public folder and
then choose which directory you would like to work on.

.. image:: /_static/image/how_to_use09.png

The image above represents the following directory structure.
There are 4 user directories (Alice, Bob, user1 and user2).

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

You can access and work in any user directory.
The data in each directory is not shared with other directories.

.. note::
    The user-separated directories are recognised by ReNomTAG if
    they contain the ``dataset`` and ``label`` sub-directories.
