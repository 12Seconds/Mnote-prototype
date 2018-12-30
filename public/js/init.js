var login = false;

var $head_schedule = null;
var $head_memo = null;
var $head_archive = null;

var firstMemo = true;
var firstArchive = true;

var $body_schedule = null;
var $body_memo = null;
var $body_archive = null;

var $modal = null;
var $modal2 = null;

var memoCounter = 0;
var scheduleCounter = 0;

var memoData = null;
var scheduleData = {};

var imageUrl = null;

$(document).ready(function () {

    sessionCheck();

});

function sessionCheck() {
    var url = 'http://localhost:3000/sessionCheck';
    var xhr = new XMLHttpRequest();

    xhr.addEventListener('load', function () {
        var result = JSON.parse(xhr.responseText);
        //console.log("결과 : ", result);
        
        if (result.type == 0) { // 로그인 필요
            $('#login_wrapper').css("display", "block");
            signUpInit();
            
        } else if (result.type == 1) { // 로그인 불필요
            login = true;

            init();
            initEvent();

            $('#username').html(result.name);
            $('#after').css("display", "block");
        }
    });

    xhr.open('GET', url)
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send();
}

function signUpInit() {

    // 회원가입 버튼 클릭시 폼 보여주기
    $('#signUp_showBtn').on("click", function () {
        $('#signUp_showBtn').css("display", "none");
        $('#signUp_form').css("display", "block");
    });

    // 생성 Ajax 요청 버튼 초기화
    $('#signUp_reqBtn').on("click", function () {
        var input = {};

        input.nm = $('#signUp_nm').val();
        input.id = $('#signUp_id').val();
        input.pw = $('#signUp_pw').val();

        console.log("input : ", input);

        if (input.nm.length == 0 || input.id.length == 0 || input.pw.length == 0) {
            alert('이름 아이디 비밀번호 모두 입력해주세요.');
            return;
        } else {
            sendAjax('/signUp', input);
        }

    });

    // 로그인 Ajax 요청 버튼 초기화
    $('#signIn_reqBtn').on("click", function () {
        var input = {};

        input.id = $('#signIn_id').val();
        input.pw = $('#signIn_pw').val();

        console.log("input : ", input);

        if (input.id.length == 0 || input.pw.length == 0) {
            alert('아이디 비밀번호 모두 입력해주세요.');
            return;
        } else {
            sendAjax('/signIn', input);
        }

    });

}

// Ajax 요청 & 응답 함수
function sendAjax(type, data) {
    var url = 'http://localhost:3000';
    var xhr = new XMLHttpRequest();

    switch (type) {
        case '/signUp': // 생성 요청에 대한 응답 처리

            xhr.addEventListener('load', function () {
                var result = JSON.parse(xhr.responseText);
                //console.log("결과 : ", result);
                if (result.type == 0)
                    alert("이미 존재하는 아이디입니다.");
                else if (result.type == 1) {
                    alert("성공적으로 가입하였습니다.");
                    
                    $('#signUp_nm').val("");
                    $('#signUp_id').val("");
                    $('#signUp_pw').val("");
                    
                    $('#signUp_form').css("display", "none");
                    $('#signUp_showBtn').css("display", "inline-block");
                }
            });
            break;

        case '/signIn': // 로그인 요청에 대한 응답 처리

            xhr.addEventListener('load', function () {
                var result = JSON.parse(xhr.responseText);
                if (result.type == 0)
                    alert("존재하지 않는 아이디입니다.");
                else if (result.type == 1) {
                    alert("비밀번호가 일치하지 않습니다.");
                } else if (result.type == 2) {
                    alert("로그인에 성공하였습니다.");

                    login = true;

                    // 로그인 폼 날리고 메뉴 띄우기
                    $('#username').html(result.name);
                    $('#login_wrapper').css("display", "none");
                    $('#after').css("display", "block");

                    init();
                    initEvent();
                }
            });
            break;
            
    }
    
    xhr.open('POST', url + type)
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(data));
}

function init() {
    $head_schedule = $('#head_schedule');
    $head_memo = $('#head_memo');
    $head_archive = $('#head_archive');

    $body_schedule = $('#body_schedule');
    $body_memo = $('#body_memo');
    $body_archive = $('#body_archive');

    $modal = $('#modal');
    $modal2 = $('#modal2');
}

function initEvent() {
    if (firstMemo === true)
        body_memoInit();

    $head_schedule.click(function () {
        headSelect('#head_schedule');
        bodySelect('#body_schedule');
    });

    $head_memo.on('click', function () {
        headSelect('#head_memo');
        bodySelect('#body_memo');
    });

    $head_archive.on('click', function () {
        headSelect('#head_archive');
        bodySelect('#body_archive');
    });
}

function headSelect(selector) {
    $('#menuBar ul li div.select').removeClass('select');
    $(selector).addClass('select');
}

function bodySelect(selector) {
    $('#body_wrapper>div.select').removeClass('select');
    $(selector).addClass('select');

    var id = $(selector).attr('id');
	if(id === 'body_schedule') {        
        $body_schedule.html('');
		console.log('body_schedule selected Init');
		body_scheduleInit();
	} else if(id === 'body_archive' && firstArchive == true) {
        console.log('body_archive selected Init');
		body_archiveInit();
	}
}
