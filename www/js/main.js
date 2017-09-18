/**
 * クラス定数宣言
 */
var API_KEY = "8a934a76cdfecc866611e133d1f588a82c84ddfe"; // 100種類タイプ
var CLASSIFIER_ID = "recipe_ident_357786155";
var MAIN_URL = "https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify";


ons.ready(function () {
    var cameraButton = document.getElementById('camera-button');
    var recipeButton = document.getElementById('recipe-send');

    var photoFileUri = null;

    cameraButton.onclick = function () {
        //Cordovaカメラプラグインの起動
        navigator.camera.getPicture(function (fileUri) {
            //画像が取得できた時
            var photoImg = document.getElementById('photo-img');
            photoFileUri = fileUri;
            photoImg.src = photoFileUri;
            recipeButton.removeAttribute('disabled');
        },
            function (message) {
                //画像が取得できないとき
                alert(message);

            }, {
                quality: 50,
                targetWidth: 240,
                targetHeight: 320,
                sourceType: Camera.PictureSourceType.CAMERA,
                destinationType: Camera.DestinationType.FILE_URI
            });
    };

//    var apikey = 'c51699d9a5734ca57d4025305620affeaf13e934'; // テストタイプ
	

    //recipe_send ボタンタップ
    recipeButton.onclick = function () {

        console.log("recipe_sendボタンクリックイベントスタート");

        //疑似的にページ遷移
        navigator1.pushPage('page2.html');
        //画像ファイルアップロード
//        var url = 'https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify?api_key=' + API_KEY + '&version=2016-05-20'; // テストタイプ
		var url = MAIN_URL + '?api_key=' + API_KEY + '&version=2016-05-20';

        var options = new FileUploadOptions();
        options.fileKey = "images_file";
        options.fileName = 'uploadfile.jpg';
        options.mimeType = "image/jpeg";

        // options.params = "[classifier:{detect_faces:\"recipe_ident_469658258\"},owners:{me:\"IBM\"}]";
        var params = new Object();
//        var classifier_ids = 'recipe_ident_469658258'; // テストタイプ

        params.headers = { 'headerParam': 'headerValue' };
        params.classifier_ids = CLASSIFIER_ID;

        options.params = params;

        upload(photoFileUri, url, options);

    }
});

// 画像をWatsonに渡し、レスポンスを取得する
function upload(photoFileUri, url, options) {
    console.log("upload start");

    var fileTransfer = new FileTransfer();

    fileTransfer.upload(photoFileUri, url, this.win, this.fail, options);


    console.log("upload end");
}

// 正常終了時
var win = function (r) {
    // ログを出力する
    console.log("レスポンスコード = " + r.responseCode);
    console.log("レスポンス内容" + r.response);
    console.log("レスポンスバイト数 = " + r.bytesSent);

    //レスポンスをjsonに変換する
    var response = JSON.parse(r.response);

    var image = response.images[0];

    var text = '';

    if ('classifiers' in image) {

        console.log("imageにclassifiersが存在する");
        //imageにclassifiersが存在
        var classify = image.classifiers[0];
        console.log("imageにclassifiersが存在する2");
        text = classify.classes;

    } else {
        console.log("imageにclassifiersが存在しない");

        //reconize...から取得が失敗した旨を画面に表示する
        var message = document.getElementById('message');
        message.innerHTML = "取得に失敗しました。";

        return;
    }

    //reconize...から結果へ
    var message = document.getElementById('message');
//    var resultJson = document.getElementById('resultJson');
    message.innerHTML = "";

    getJsonFile(image)
        .then(test)
        .then((val) => {
            // 処理がすべて正常に完了した場合の処理


        })
        .catch((err) => {
            //エラー時の処理
            console.log('通信エラーです');
        });

}

// ①Ajaxでjsonファイルをサーバーから取得する
const getJsonFile = (image) => {

    console.log("*** getJsonFile start ***");
    

    var dfd = $.Deferred();
    $.ajax({
        type: 'get',
        dataType: 'json',
        url: './data/food1.json'
    })
        .done(function (returnData) {
            // 返ってくるのに時間が掛かる処理
            setTimeout(function () {

				var result = "";

				// 表示個所を取得
				var resultJson = document.getElementById('resultJson');

				console.log("表示対象の件数は:" + image.classifiers[0].classes.length + "件");

				// 取得したレコードの件数分処理を行う
				for (var i = 0; i < image.classifiers[0].classes.length; i++) {

					var classId = image.classifiers[0].classes[i].class;

					console.log("classId:" + classId);

					// 取得したJSONファイルの件数分処理を行う
					for (var j = 0; j < returnData.length; j++) {

						var dataId = JSON.stringify(returnData[j].id).replace(/\"/g,"");

						console.log("dataId:" + dataId);

						// レコードとJSONのIDが等しい場合、JSONのmenuを表示する
						if (classId == dataId) {

							console.log("等しい");

							result = result + JSON.stringify(returnData[j].menu) + "<br>";
						}
					}

					console.log(i + "回目のループ");

				}

				resultJson.innerHTML = result;

                // 取得したjsonを次の処理へ
                dfd.resolve(result);
            }, 1000);
        });

    return dfd.promise();
}

// ②
const test = (result) => {
    console.log("すべて終了。");
	console.log("resultは : " + result);
}

// 異常終了時
var fail = function (error) {
    console.log("errorCode = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}