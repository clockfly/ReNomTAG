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
To install ReNomTAG from source, download this repository and 
run following command in the root of the repository.

```
$ pip3 install -e .
```

## Build Javascript
You can build js files with following command.

```
$ cd js
$ npm run start
```

## How to start

Once installed, you can run ReNomTAG as follows.

```
$ python3 -m renom_tag
```

You can also use `renom_tag` command installed by the wheel.

```
$ renom_tag
```

You can also use webpack-dev-server for debugging.

```
$ cd js
$ npm run start
```


## How to use

The following videos describes how to use ReNomTAG.
In this video, the Oxford-IIIT Pet Dataset is used.

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

