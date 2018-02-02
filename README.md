# ReNom TAG

ReNom TAGとは、オブジェクト検出モデルを構築するために用いるデータ・セットの作成ツールです。  

## インストール方法

はじめに、以下のコマンドでgitlabからリポジトリをクローンします。  

`git clone https://gitlab.com/suwa/ReNomTAG.git`

次に、依存するライブラリを以下のコマンドでインストールします。

`pip install -r requirement.txt`

依存するライブラリのインストールが完了したらReNom TAGを使い始めることができます。

## フィードバックの返し方

ReNom TAGを利用中に、バグや改善点などを見つけた際は、gitlabのissue機能を使って報告してください。  

issueは、issue画面のNew issueボタンから作成することができます。  

入力画面では、issueタイトル、issueの説明、labelを設定してください。  

issueタイトルは、【レビュー】〇〇に関するエラー　のようにはじめに【レビュー】と記載してください。  

issueの説明は、エラー内容や改善内容、動作環境、不具合発生時の操作手順、不具合発生時のスクリーンショット（あれば）を記載してください。  

labelは、bug(バグ), request(UIの改善や追加であれば嬉しい機能など), others(その他、質問など)という３つが予め作成されていますので、その中から選択してください。  

上記以外の項目は未設定で構いません。  

入力が完了したら、Submit issueボタンからissueを作成してください。  

## お試しデータセット例

### PASCAL VOCデータセット  

PASCAL VOCデータセットとは、PASCAL VOC ChallengeというPASCAL(attern Analysis, Statistical Modelling and Computational Learnin)が主催する画像認識のコンペで使用されたデータセットです。  

以下のリンクからデータセットをダウンロードできます。  

http://host.robots.ox.ac.uk/pascal/VOC/voc2012/index.html#devkit  

### The Oxford-IIIT Pet Dataset

The Oxford-IIIT Pet Datasetは、犬や猫などの37種類の画像が含まれているデータセットです。  

タグに使用するxmlファイルには、犬/猫のクラスが設定されているため、犬猫の検出データセットとして利用できます。  

以下のリンクからデータセットをダウンロードできます。  

http://www.robots.ox.ac.uk/~vgg/data/pets/

## 使い方

### データセットの作成

はじめに、学習、テストで用いるデータセットを指定のフォルダに移動してください。  

データセット置き場のフォルダ構成は、以下のようになっています。  

```
ReNomTAG
 │
 └ dataset
     │
     ├ img001.png //画像データセット(png, jpgに対応)
     ├ ...
     └ img100.png
```

PASCAL VOCデータセットを用いる場合は、ダウンロードしたzipを解凍すると、以下のフォルダ構成になっています。  

```
VOCdevkit
 │
 └ VOC2012
     │
     ├ Annotations // bouding boxのxmlファイルが入っているフォルダ
     ├ ImageSets
     ├ JPEGImages // Object Detectionに使える画像が入っているフォルダ
     ├ SegmentationClass
     └ SegmentationObject
```

そのため、JPEGImages以下の画像ファイルをdatasetフォルダ直下に移動してください。  

ここまででデータセットの作成は完了です。

### アプリケーションの起動

次に、アプリケーションを起動します。  

ReNomIMGフォルダに移動して、以下のコマンドを打ちwebサーバを起動してください。  

`python server.py`

webサーバが起動している状態で、ブラウザでhttp://<サーバのIPアドレス>:8060にアクセスするとReNomTAGのページを表示することができます。  

