# ReNom TAG Master Branch

## Install

`git clone https://gitlab.com/suwa/ReNomTAG.git`

`pip install -r requirement.txt`

## How to start

1.Move to ReNomTAG directory using following command.

`cd ReNomTAG`

2.Run server.py script and the application server starts.

`python server.py`

If the server starts, you will see a message like below.

<img src='static/img/server_run.png' width='60%'/>

3.Then you access to http://0.0.0.0:8060/, the application
is ready to use.


## How to use


## Format of xml file.

The format of the xml file which created by ReNomTAG follows [PASCAL VOC] format.

An example is bellow.

```
<annotation>
 <folder>
  dataset
 </folder>
 <filename>
  2007_000027.jpg
 </filename>
 <object>
  <pose>
   Unspecified
  </pose>
  <name>
   cat
  </name>
  <truncated>
   0
  </truncated>
  <difficult>
   0
  </difficult>
  <bndbox>
   <ymax>
    203.02013422818794
   </ymax>
   <xmin>
    134.7902328154634
   </xmin>
   <xmax>
    238.81923552543284
   </xmax>
   <ymin>
    104.02684563758389
   </ymin>
  </bndbox>
 </object>
 <source>
  <database>
   Unknown
  </database>
 </source>
 <path>
  dataset/2007_000027.jpg
 </path>
 <segments>
  0
 </segments>
 <size>
  <width>
   486
  </width>
  <height>
   500
  </height>
  <depth>
   3
  </depth>
 </size>
</annotation>
```

[PASCAL VOC]:http://host.robots.ox.ac.uk/pascal/VOC/

