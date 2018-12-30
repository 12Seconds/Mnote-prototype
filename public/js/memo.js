function body_memoInit() {

    // Memo 관련 Ajax
    /* **************************************************************** */
    function sendMemoAjax(type, data) {
        var url = 'http://localhost:3000';
        var xhr = new XMLHttpRequest();

        switch (type) {

            case '/getCounter': // memoCnt 받아오기
                xhr.addEventListener('load', function () {
                    memoCounter = Number(JSON.parse(xhr.responseText));
                    //console.log("memoCounter : ", memoCounter);
                });
                break;

            case '/getMemos': // 메모 가져오기 처리
                xhr.addEventListener('load', function () {

                    var result = JSON.parse(xhr.responseText);

                    if (result.type) { // == 1
                        memoData = result.memos;
                    }
                    // 기존 메모 로드
                    if (memoData !== null) {
                        memoData.forEach(
                            function memoLoad(value) {
                                addMemo('old', value);
                            });
                    }
                });
                break;

            case '/addMemo': // 메모 추가 결과
                xhr.addEventListener('load', function () {
                    if (JSON.parse(xhr.responseText).type == 1) {
                        //console.log("메모 DB에 추가 성공");
                        memoCounter++;
                    }
                });
                break;

            case '/modifyMemo': // 메모 수정 결과
                xhr.addEventListener('load', function () {
                    if (JSON.parse(xhr.responseText).type == 1) {
                        //console.log("메모 수정 성공");
                    }
                });
                break;

            case '/deleteMemo': // 메모 삭제 결과
                xhr.addEventListener('load', function () {
                    if (JSON.parse(xhr.responseText).type == 1) {
                        //console.log("메모 삭제 성공");
                    }
                });
                break;

        }

        xhr.open('POST', url + type)
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(JSON.stringify(data));
    }
    /* **************************************************************** */

    //span들이 들어갈 곳
    $parent = $body_memo;

    //생성 관련 변수
    var $createMemoSpan = $('<span><img class="createMemo" src="http://ec2-127-0-0-1.ap-northeast-2.compute.amazonaws.com:3000/images/createMemo.png" width="273px" height="273px"></span>');

    //수정 관련 변수
    var $selectedSpan = null;

    //모달 관련 변수들
    var $modalDiv = $('<div></div>');
    var $modalCreateSubject = $('<p>메모 작성</p>');
    var $modalChangeSubject = $('<p>메모 수정</p>');
    var $modalTextarea = $('<textarea id="modalTextarea" name="needFocus" rows="6" cols="50" style="border-color:rgb(0, 204, 153); border-style:solid; border-width:2px;"></textarea>');
    var $modalEnter = $('<p><p>');
    var $modalButtonConfirm = $('<button type="button">확인</button>')
    var $modalButtonChange = $('<button type="button">수정</button>')
    var $modalButtonCancel = $('<button type="button">취소</button>')
    var $modalButtonDelete = $('<button type="button">삭제</button>')

    //모달 css설정
    $modal.css({
        "left": "0",
        "top": "0",
        "position": "fixed",
        "display": "none",
        "width": "100%",
        "height": "100%",
        "background": "rgba(1,1,1,0.8)",
        "text-align": "center",
        "color": "white",
    });

    //모달 위에 붙을 div의 css
    $modalDiv.css({
        "position": "relative",
        "top": "37%",
        "width": "380px",
        "left": "40%",
    });

    //모달 제목 2개 css
    $modalCreateSubject.css({
        "font-size": "30px",
    });
    $modalChangeSubject.css({
        "font-size": "30px",
    });

    //생성span css 잡아주기
    $createMemoSpan.css({
        "display": "inline-block",
        "height": "270px",
        "width": "270px",
        "background-color": "rgb(241, 238, 120)",
        "border-radius": "2em",
        "margin-right": "31px",
        "margin-left": "31px",
        "margin-top": "30px",
        "cursor": "pointer",
    });

    //모달 재료들 모달에 몽땅 붙여넣기
    $modalCreateSubject.appendTo($modalDiv);
    $modalChangeSubject.appendTo($modalDiv);
    $modalTextarea.appendTo($modalDiv);
    $modalEnter.appendTo($modalDiv);
    $modalButtonConfirm.appendTo($modalDiv);
    $modalButtonChange.appendTo($modalDiv);
    $modalButtonCancel.appendTo($modalDiv);
    $modalButtonDelete.appendTo($modalDiv);
    $modalDiv.appendTo($modal);

    //모달 배경이 클릭됐을 때 모달 사라지게 하기
    $modal.on('click', function () {
        $modal.css("display", "none");
        $modalTextarea.val('');
    });

    $('#modalTextarea').click(function () {
        event.stopPropagation();
    });

    //작성버튼 누르면 모달에 생성 관련된 것들만 띄우기
    $createMemoSpan.click(function () {
        $modal.css("display", "block");

        $modalButtonConfirm.css("display", "inline");
        $modalCreateSubject.css("display", "block");

        $modalButtonChange.css("display", "none");
        $modalChangeSubject.css("display", "none");
        $modalButtonDelete.css("display", "none");

        $(this).parent().parent().parent().find('textarea[name="needFocus"]').focus();
    });


    // 메모 추가 함수 *************************************************************
    function addMemo(type, memo) {

        var $newSpan = null;
        var $textInSpan = null;
        var number = 0;
        var data = {};

        if (type == 'new') {
            number = memoCounter;
            $textInSpan = $(`<p>${$modalTextarea.val()}</p>`);

            // Ajax 통신으로 DB에 메모 데이터 추가하기
            data.order = memoCounter;
            data.memo = $modalTextarea.val();
            sendMemoAjax('/addMemo', data);
        } else if (type == 'old') {
            number = memo.order;
            $textInSpan = $(`<p>${memo.memo}</p>`);
        }

        $newSpan = $('<span id=span' + number + '></span>'); //새로운 span생성 후 css 잡아주기

        //기존 메모 생성 후 css 잡아주기
        $newSpan.css({
            "display": "inline-block",
            "background-color": "rgb(241, 238, 120)",
            "border-radius": "2em",
            "margin-top": "30px",
            "position": "relative",
            "height": "270px",
            "width": "270px",
            "margin-left": "31px",
            "margin-right": "31px",
        });

        //span내부에 넣을 textarea 생성 후 css잡아주기
        $textInSpan.css({
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "display": "-webkit-box",
            "-webkit-line-clamp": "6",
            "-webkit-box-orient": "vertical",
            "line-height": "40px",
            "font-size": "30px",
            "margin": "15px",
            "height": "240px",
            "width": "240px",
            "position": "absolute",
            "word-break": "break-all",
            "word-wrap": "break-word"
        });

        //차후 수정이 되야하기 때문에 span이 클릭되었을 때 수정과 관련된 것들이 들은 모달이 뜰수있게 css 설정
        $newSpan.on('click', function () {
            //전역변수로 선언해놓은 $selectedSpan에 클릭된 span이 들어가줄수 있도록
            $selectedSpan = $(this);

            $modal.css("display", "block");

            $modalButtonConfirm.css("display", "none");
            $modalCreateSubject.css("display", "none");

            $modalButtonDelete.css("display", "inline");
            $modalButtonChange.css("display", "inline");
            $modalChangeSubject.css("display", "block");

            //기존의 텍스트가 textarea에 출력될 수 있도록 한다.
            var string = $(this).text();
            document.getElementById("modalTextarea").value = string;

            $(this).parent().parent().parent().find('textarea[name="needFocus"]').focus();
        });

        //memoCounter++;

        //위에 생성되는 새로운 span을 body_wrapper에 실제로 붙이기
        $textInSpan.appendTo($newSpan);
        $newSpan.appendTo($parent);

        //기존의 modal textarea에 써져있던것들을 지우고 모달을 안보이게
        $modalTextarea.val('');
        $modal.css("display", "none");

    }

    // **************************************************************************

    //모달에서 확인 눌렀을때 새로운 span을 추가해서 넣는 진행
    $modalButtonConfirm.on('click', function () {

        addMemo('new', null);

    });

    //수정모달에서 수정버튼을 눌렀을때 새로 입력된 값을 해당 span의 children(textarea)에 값으로
    $modalButtonChange.click(function () {
        $selectedSpan.children().text(document.getElementById("modalTextarea").value);
        $modal.css("display", "none");

        // DB 업데이트 Ajax 요청
        var data = {};
        data.memo = document.getElementById("modalTextarea").value;
        data.order = $selectedSpan.attr('id').split('n')[1];

        console.log("data는 :", data);
        sendMemoAjax('/modifyMemo', data);

        $modalTextarea.val('');
    });

    //수정모달에서 삭제버튼을 눌렀을때 해당 span삭제
    $modalButtonDelete.click(function () {

        var data = {};
        data.order = $selectedSpan.attr('id').split('n')[1];

        sendMemoAjax('/deleteMemo', data);

        $selectedSpan.remove();
        $modal.css("display", "none");

        $modalTextarea.val('');
    });

    //취소버튼 누를시 모달 사라짐
    $modalButtonCancel.on('click', function () {
        $modalTextarea.val('');
        $modal.css("display", "none");
    });

    $createMemoSpan.appendTo($parent);
    firstMemo = false;

    // Ajax 요청해서 memoCnt값과 전체 메모 받아오기
    var nodata = {};
    nodata.data = "nodata";
    sendMemoAjax('/getCounter', nodata);
    sendMemoAjax('/getMemos', nodata);
}