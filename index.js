// オープンするカメラの設定
const constraints = {
  audio: false,
  video: {
    //facingMode: "user"
    facingMode: "environment"
  }
};

// カメラと対応させるvideoタグ
const video = document.getElementById("video");
// カメラ画像に対応するキャンバス
const canvas_capture_image = document.getElementById('capture_image');

// カメラを起動して、Videoタグに繋げる
navigator.mediaDevices.getUserMedia(constraints)
  .then(function (stream) {
    video.srcObject = stream;
  })
  .catch(function (err) {
    alert(err);
  });


// 「静止画取得」ボタンが押されたら「<canvas id="capture_image">」に映像のコマ画像を表示。
function copyFrame() {
  // 静止画用のcanvas。そこに表示  
  var ctx = canvas_capture_image.getContext('2d');
  // canvasのサイズをあわせる
  var w = video.videoWidth;
  var h = video.videoHeight;
  canvas_capture_image.width = w;
  canvas_capture_image.height = h;

  ctx.drawImage(video, 0, 0);  // canvasに『「静止画取得」ボタン』押下時点の画像を描画。

  // フィルタ設定の取得
  var radio = document.getElementById('filter');
  var f = radio.filtertype.value;
  if (f === "original") {
    console.log("フィルタなし(original)");
  } else if (f === "gray") {
    // 参考：https://www.pazru.net/html5/Canvas/180.html
    console.log("フィルタ：グレー化");
    var imagedata = ctx.getImageData(0, 0, w, h);
    var idata = imagedata.data;
    var num = idata.length; // ピクセルデータ総数
    var pix = num / 4;  // ピクセル数
    for (var i = 0; i < pix; i++) {
      var r = idata[i * 4];
      var g = idata[i * 4 + 1];
      var b = idata[i * 4 + 2];
      var gray = parseInt((r * 30 + g * 59 + b * 11) / 100);
      idata[i * 4] = gray;
      idata[i * 4 + 1] = gray;
      idata[i * 4 + 2] = gray;
    }
    // グレーに入れ替える
    ctx.putImageData(imagedata, 0, 0);
  } else if (f === "edge") {
    // 未実装。
    alert("エッジは未実装");
    console.log("エッジに変換");
  } else {
    // filterを増やしたらこのあたりをなおす
    console.log("ここは通らないはず");
  }
}


// Azure Custom VisionのClassifyに投げる
function azure_cv_classify() {
  prediction_url = document.getElementById('prediction_url').value;
  prediction_key = document.getElementById('prediction_key').value;

  // canvasの画像をバイナリにして、Cognitive Serviceに投げる
  canvas_capture_image.toBlob(function (blob) {
    console.log(blob)
    const param = {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Prediction-Key": prediction_key
      },
      body: blob
    }

    // フェッチAPIでリクエストを投げる
    fetch(prediction_url, param)
      .then((res) => {
        if (!res.ok) {
          errmsg = "Cognitive Service(Classify)への通信のエラーです。status:" + res.status + ", statusText:" + res.statusText;
          alert(errmsg);
          throw new Error(errmsg);
        }
        return (res.json());
      }).then((json) => {
        console.log(json);
        // Cognitive Serviceからの結果表示部分を取得＆中身を削除
        var result = document.getElementById('result');
        result.innerHTML = "";
        // Azureからの結果(json)で確率を表示
        json.predictions.forEach(e => {
          var li = document.createElement("li");
          li.innerHTML = Math.round(e.probability * 100) + "% : " + e.tagName;
          result.appendChild(li);
          //console.log(e.tagName)
        });
      }).catch((reason) => {
        alert("失敗しました。Cognitive Service設定を確認してください。");
        console.log(reason);
      })
  })
}


// blobにアップできたら嬉しい気がするけど、未作成
function azure_blob_upload() {
  alert("未作成");
}


