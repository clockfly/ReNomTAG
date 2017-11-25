
import renom as rm
import numpy as np


def create_darknet(class_num):
    darknet_model = rm.Sequential([
        # 1st Block
        rm.Conv2d(channel=64, filter=7, stride=2, padding=3),
        rm.LeakyRelu(slope=0.1),
        rm.MaxPool2d(stride=2, filter=2),

        # 2nd Block
        rm.Conv2d(channel=192, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),
        rm.MaxPool2d(stride=2, filter=2),

        # 3rd Block
        rm.Conv2d(channel=128, filter=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=256, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=256, filter=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=512, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),
        rm.MaxPool2d(stride=2, filter=2),

        # 4th Block
        rm.Conv2d(channel=256, filter=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=512, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=256, filter=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=512, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=256, filter=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=512, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=256, filter=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=512, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=512, filter=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=1024, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),
        rm.MaxPool2d(stride=2, filter=2),

        # 5th Block
        rm.Conv2d(channel=512, filter=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=1024, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=512, filter=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=1024, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=1024, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=1024, filter=3, stride=2, padding=1),
        rm.LeakyRelu(slope=0.1),

        # 6th Block
        rm.Conv2d(channel=1024, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),
        rm.Conv2d(channel=1024, filter=3, padding=1),
        rm.LeakyRelu(slope=0.1),

        # 7th Block
        rm.Flatten(),
        rm.Dense(512),
        rm.LeakyRelu(slope=0.1),
        rm.Dense(4096),
        rm.LeakyRelu(slope=0.1),
        rm.Dropout(0.5),

        # 8th Block
        rm.Dense(class_num),
    ])

    return darknet_model
