#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Developed by Grid.

"""

import renom as rm
from renom.algorithm.image.detection.yolo import build_truth, Yolo, apply_nms, box_iou
import numpy as np
from network import create_darknet


class Yolo(rm.Model):

    def __init__(self, cells, bboxes):
        self._network = None
        self._loss_func = Yolo(cells, bboxes)
        self._batch_size = 64

    def forward(self, img):
        return self._network(img)

    def transform_to_yolo_format(self, label):
        yolo_format = []
        for l in label:
            yolo_format.append(build_truth(l.reshape(1, -1),
                                           img_size[0],
                                           img_size[1],
                                           cells,
                                           label_length).flatten())
        return np.array(yolo_format)

    def loss(self, img, label, train=False):
        """
        This function returns loss.
        """
        if train:
            with self.train():
                z = self(img)
                loss = self._loss_func(z,
                                       self.transform_to_yolo_format(label))
        else:
            z = self(img)
            loss = self._loss_func(z,
                                   self.transform_to_yolo_format(label))
            loss = loss.as_ndarray()
        return loss

    def predict(self, img):
        """
        This function returns bbox.
        """
        return self(img).as_ndarray()


class YoloDarknet(Yolo):

    def __init__(self, class_num, model_path=None):
        self._network = create_darknet(class_num)
