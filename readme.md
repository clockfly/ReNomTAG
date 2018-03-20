# RenomTag

## Install from source


```
$ pip3 install -e .
```


## Build Javascript

```
$ cd js
$ npm run start
```


## Run

```
$ python3 -m renomtag
```


You can also use webpack-dev-server for debugging.


```
$ cd js
$ npm run start
```


## RenomTag package

The Wheel package is provided at:

    https://suwa.gitlab.io/ReNomTAG2nd/bin/renomtag-VERSION-py3-none-any.whl

(`VERSION` is stands for actual version number e.g. 0.0.1)

You can install the wheel package with pip3 command::

```
$ pip3 install https://suwa.gitlab.io/ReNomTAG2nd/bin/renomtag-0.0.99-py3-none-any.whl
```

The Wheel package contains pre-build js files so you don't have to build manually.



Once installed, you can run RenomTag as follows.

```
$ python3 -m renomtag
```

You can also use `renomtag` command installed by the wheel.

```
$ renomtag
```
