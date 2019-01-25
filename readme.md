# ReNomTAG v1.0

Tagging tool for object detection.

## Install ReNomTAG package

The Wheel package is provided at:

    https://grid-devs.gitlab.io/ReNomTAG2nd/bin/renom_tag-VERSION-py3-none-any.whl

(`VERSION` is stands for actual version number e.g. 0.0.1)

You can install the wheel package with pip3 command::

```
$ pip3 install https://grid-devs.gitlab.io/ReNomTAG/bin/renom_tag-1.0.1-py3-none-any.whl
```

The Wheel package contains pre-build js files so you don't have to build manually.


## Install from source
To install ReNomTAG from source, download this repository.
```
git clone https://gitlab.com/grid-devs/ReNomTAG.git
```


```
which python
```

Go to ReNomTAG/js and use following command to install node packages.
```
cd js/
npm install
```

Check which python env you are using and going to install renom_tag.
Go to the root of ReNomTAG, install ReNomTAG and requirements.
```
cd ../
pip install -r requirements.txt
python setup.py build
pip install -e .
```


## Build Javascript (for developers)

You can build js files with following command.

```
$ cd js
$ npm run start
```

## Make working directory for the ReNomTAG app
A working directory is needed when you want to run ReNomTAG app.
Note that the directory structure is fixed. Please confirm details in the following page.
http://renom.jp/packages/renomtag/ja/rsts/how_to_use.html#before-starting

For instance:
 ```
 working_directory # Current Working directory
     │  
     └── public # This name must be `public`.
         │  
         └── user1 # Dataset for user1. You can put any name for this directory.
             ├── dataset # Directory in which image data put. This name must be `dataset`.
             │   ├── image1.jpg
             │   ├── image2.jpg
             │   ├── ...
             │   └── imageN.jpg
             └── label # Directory to which tag data will output. This name must be `label`.
                 ├── image1.xml
                 ├── image2.xml
                 ├── ...
                 └── imageN.xml
 ```

The directories above are made by using following commands:
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
Note that you first need to activate the python env which you install the renom_tag.

```
$ python -m renom_tag
```

You can also use `renom_tag` command installed by the wheel.

```
$ renom_tag
```
Go to browser and listen to the page indicated by the console.


## Debugging (for developers)
You can also use webpack-dev-server for debugging.
Before start dev-server by following commands,
make sure that ReNomTAG app is running in the working_directory (do ## How to run the app).

For first time:
```
$ cd js
$ npm run start
```
From second time:
```
$ cd js
$ npm run dev
```

## Try the app

If you want to try the app but don't have a particular dataset to use, the following dataset is available. Please download and set the photos into "public/'user'/dataset" folder.

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
