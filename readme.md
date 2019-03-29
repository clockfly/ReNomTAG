# ReNomTAG v1.2.0 beta

A tagging tool for object detection.


## Changes 1.1b0 => 1.2b0
- Added matching colors for boxes and class names
- Added shortcut keys for copying and pasting boxes
- Added shortcut keys for undoing box changes
- Added explanatory text for "Hide boxes" toggle
- Bug fixes


## Install ReNomTAG package

The Wheel package is provided at:

    https://grid-devs.gitlab.io/ReNomTAG/bin/renom_tag-VERSION-py3-none-any.whl

(`VERSION` is stands for actual version number e.g. 0.0.1)

You can install the wheel package with pip3 command::

```
$ pip3 install https://grid-devs.gitlab.io/ReNomTAG/bin/renom_tag-1.2b0-py3-none-any.whl
```

The Wheel package contains pre-built js files so you don't have to build manually.


## Install from source
To install ReNomTAG from source, download this repository.
```
git clone https://github.com/ReNom-dev-team/ReNomTAG.git
```


```
which python
```

Go to ReNomTAG/js and use the following command to install the node packages.
```
cd js/
npm install
```

Check which python env you are using to install renom_tag.
Go to the ReNomTAG root directory and install ReNomTAG and its requirements.
```
cd ../
pip install -r requirements.txt
python setup.py build
pip install -e .
```


## Build Javascript (for developers)

Build the js files with following command.

```
$ cd js
$ npm run start
```

## Create working directory for the ReNomTAG app
A working directory is needed to run the ReNomTAG app.
Note that the directory structure is fixed. Please confirm the details at the following page.
http://renom.jp/packages/renomtag/ja/rsts/how_to_use.html#before-starting

For instance:
 ```
 working_directory # Current Working directory
     │  
     └── public # This folder must be named `public`.
         │  
         └── user1 # Dataset for user1. You can use any name for this directory.
             ├── dataset # Directory containing images for tagging. The folder name must be set to `dataset`.
             │   ├── image1.jpg
             │   ├── image2.jpg
             │   ├── ...
             │   └── imageN.jpg
             └── label # Directory to which tag data will output. The folder name must be set to `label`.
                 ├── image1.xml
                 ├── image2.xml
                 ├── ...
                 └── imageN.xml
 ```

The directories above can be made using the following commands:
 ```
mkdir ~/working_directory
cd ~/working_directory
mkdir public
mkdir public/user1
mkdir public/user1/label
mkdir public/user1/dataset
 ```


## How to run the app

Once installed, you can run ReNomTAG as follows.
Note that you first need to activate the python env in which you installed renom_tag.

```
$ python -m renom_tag
```

You can also use the `renom_tag` command installed by wheel.

```
$ renom_tag
```
Use your web browser to access the address and port listed in the console.


## Debugging (for developers)
You can also use webpack-dev-server for debugging.
Before starting the dev-server with the following commands,
make sure that the ReNomTAG app is running in the working_directory (see ## How to run the app).

For the first time:
```
$ cd js
$ npm run start
```
From the second time onward:
```
$ cd js
$ npm run dev
```

## Try the app

If you want to try the app but don't have a particular dataset to use, the following dataset is available. Please download it and place the photos in the "public/'user'/dataset" folder.

- Cats and Dogs Classification  
https://github.com/JDonini/Cats_Dogs_Classification

- O. M. Parkhi, A. Vedaldi, A. Zisserman, C. V. Jawahar
Cats and Dogs  
IEEE Conference on Computer Vision and Pattern Recognition, 2012
Bibtex  
http://www.robots.ox.ac.uk/~vgg/data/pets/

```

## License

“ReNomTAG” is provided by GRID inc., as subscribed software. By downloading ReNomTAG, you are agreeing to be bound by our ReNom Subscription agreement between you and GRID inc.
To use ReNomTAG for commercial purposes, you must first obtain a paid license. Please contact us or one of our resellers.  If you are an individual wishing to use ReNomTAG for academic, educational and/or product evaluation purposes, you may use ReNomTAG royalty-free.
The ReNom Subscription agreements are subject to change without notice. You agree to be bound by any such revisions. You are responsible for visiting www.renom.jp to determine the latest terms to which you are bound.
