How to use
==========

Before starting
----------------

Before starting ReNomTGA, let me introduce the 
directory structure.

.. code-block:: python

    working_directory # Current Working directory
        │   
        └── public
            │   
            ├── user1 # Dataset for user1
            │   ├── dataset # Directory in which image data put.
            │   │   ├── image1.jpg
            │   │   ├── image2.jpg
            │   │   ├── ...
            │   │   └── imageN.jpg
            │   └── label # Directory to which tag data will output.
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
                │   ├── Abyssinian_1.jpg
                │   ├── Abyssinian_10.jpg
                │   ├── Abyssinian_12.jpg
                │   └── Abyssinian_13.jpg
                └── label
                    ├── Abyssinian_1.xml
                    ├── Abyssinian_10.xml
                    ├── Abyssinian_12.xml
                    └── Abyssinian_13.xml



Put image data to the directory for tagging
-------------------------------------------

Run server
---------

Put tags to images
-------------------

Admin mode
-----------

Use ReNomTAG with multiple user
-------------------------------
