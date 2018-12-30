function body_archiveInit() {
    $('#sendFileBtn').click(function () {
        uploadBtnClick();
    });

    $galleryDiv = $('<div id="garlleryDiv"></div>');

    $galleryDiv.css({
        "width": "100%",
        "position": "relative",
        "height": "500px",
    });

    $galleryDiv.appendTo($('#body_archive'));

    if (firstArchive == true) {
        getPreexistImgUrl();
        firstArchive = false;
    }

}

function uploadBtnClick() {
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    var url = 'http://localhost:3000';

    formData.append('testname', 'rasan');
    formData.append("userfile", $('#userFile')[0].files[0]);

    xhr.addEventListener('load', function () {
        var url = JSON.parse(xhr.responseText);
        console.log("returned url : ", url.url);

        createImgInto(url.url);
    });

    xhr.open('POST', url + '/imageUpload');
    xhr.send(formData);
}

// 기존에 업로드한 이미지 접근 URL 요청
function getPreexistImgUrl() {
    var xhr = new XMLHttpRequest();
    var url = 'http://localhost:3000';

    xhr.addEventListener('load', function () {
        var result = JSON.parse(xhr.responseText);
        console.log("image list : ", result);

        result.list.forEach(
            function abc(item) {
                //console.log(item);
                createImgInto(item + "");
            });

    });

    var nodata = {};
    nodata.data = 'nodata';

    xhr.open('POST', url + '/getImages');
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(nodata));
}

function createImgInto(url) {
    var $imgDiv = $(`<div id="${url}"></div>`);

    $imgDiv.css({
        "display": "inline-block",
        "height": "270px",
        "width": "270px",
        "border-radius": "2em",
        "margin-right": "31px",
        "margin-left": "31px",
        "margin-top": "30px",
        "position": "relative",
        "background-image": `url(${url})`,
        "background-size": "100% 100%",
    });

    $imgDiv.mouseenter(function () {
        var $X = $('<div>X</div>');
        var $selectedDiv = $imgDiv;

        $X.css({
            "position": "absolute",
            "display": "block",
            "top": "0%",
            "left": "90%",
            "height": "30px",
            "width": "30px",
            "cursor": "pointer",
            "font-size": "30px",
            "color": `rgb(0, 204, 153)`,
        });

        $X.appendTo($imgDiv);

        $X.on('click', function () { // 이미지 삭제 요청 처리
            var xhr = new XMLHttpRequest();
            var url = 'http://13.209.74.48:3000';

            xhr.addEventListener('load', function () {
                var result = JSON.parse(xhr.responseText);
                if (result.type == 1)
                    $selectedDiv.remove();
            });

            var data = {};
            data.key = $selectedDiv.attr("id");
            console.log("data.key :", data.key);

            xhr.open('POST', url + '/deleteImage');
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.send(JSON.stringify(data));
        });
    });

    $imgDiv.mouseleave(function () {
        $imgDiv.children().remove();
    });

    $('#userFile').val('');
    $imgDiv.prependTo($('#garlleryDiv'));
}