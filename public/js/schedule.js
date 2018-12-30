class Cell {
  constructor(container, txt) {
    var div = document.createElement("div");
    $(div).attr("id", '<day>' + txt);
    $(div).css("float", "left");
    $(div).css("width", "97").css('height', "97px");
    $(div).css("border", "1px solid #000").css("background-color", "azure");
    $(div).css("font-size", "40px").css("color", "black").css("text-align", "center").css("line-height", "100px");
    $(div).text(txt);
    $(container).append($(div));

    var selectedDiv = null;

    var $modalDiv = $('<div></div>');
    var $modalCreateSchedule = $('<p>일정 추가</p>');
    var $modalTextarea2 = $('<textarea id="modalTextarea2" name="needFocus" rows="6" cols="50" style="border-color:rgb(0, 204, 153); border-style:solid; border-width:2px;"></textarea>');
    var $modalEnter = $('<p><p>');
    var $modalButtonConfirm = $('<button type="button">확인</button>');
    var $modalButtonCancel = $('<button type="button">취소</button>');

    $modalDiv.css({
      "position": "relative",
      "top": "37%",
      "width": "380px",
      "left": "40%",
    });

    $modalCreateSchedule.css({
      "font-size": "30px",
    });

    $modal2.on('click', function () {
      $modal2.css("display", "none");
      $modalTextarea2.val('');
      $modalDiv.html('');
    });

    $modalButtonConfirm.on('click', function () {
      var day = selectedDiv.text();
      var month = sessionMonthSave + 1;

      if ((parseInt(selectedDiv.text())) / 10 < 1) {
        day = ("0" + selectedDiv.text());
      }
      if (month / 10 < 1) {
        month = "0" + month;
      }

      var data = {};
      data.date = sessionYearSave + "-" + month + "-" + day;
      data.schedule = $("#modalTextarea2").val();
      data.order = scheduleCounter;

      sendScheduleAjax('/addSchedule', data);

      //selectedDiv.css("background-color", "red");
    });

    $modalButtonCancel.on('click', function () {
      $modal2.css("display", "none");
      $modalTextarea2.val('');
      $modalDiv.html('');
    });

    $modalTextarea2.click(function () {
      event.stopPropagation();
    });

    if (0 < $(div).text() || $(div).text() < 32 && $(div).text() !== '') {
      $(div).on('click', function () {
        selectedDiv = $(this);
        console.log($(div).text());
        $modalCreateSchedule.appendTo($modalDiv);
        $modalTextarea2.appendTo($modalDiv);
        $modalEnter.appendTo($modalDiv);
        $modalButtonConfirm.appendTo($modalDiv);
        $modalButtonCancel.appendTo($modalDiv);
        $modalDiv.appendTo($modal2);

        $modal2.css("display", "block");
        $(this).parent().parent().parent().parent().parent().find('textarea[name="needFocus"]').focus();
      });

      $(div).css({
        "cursor": "pointer",
      });
    }
  }
}

var sessionYearSave = null;
var sessionMonthSave = null;

function body_scheduleInit() {

  // Ajax 요청으로 카운터값 획득
  var data = {};
  data.nodata = "nodata";
  sendScheduleAjax('/getScheduleCounter', data);

  var $parent = $body_schedule;

  var $calendar = $('<div></div>');
  var $scheduleListDiv = $('<div id = "scheduleListDiv"></div>');

  $calendar.css({
    "display": "inline-block",
    "position": "absolute",
    "width": "70%",
    "height": "100%",
    "top": "0",
    "left": "0",
  });

  $scheduleListDiv.css({
    "display": "inline-block",
    "position": "absolute",
    "width": "30%",
    "height": "100%",
    "top": "0",
    "left": "70%",
    "background-color": "azure",
    "border": "3px solid rgb(0, 204, 153)",
    "border-radius": "1.4em",
  });

  createCalendar($calendar);

  $calendar.appendTo($parent);
  $scheduleListDiv.appendTo($parent);
}

function createCalendar(container) {
  //달력 헤더와 바디 구분
  var $calendarHeader = $('<div></div>');
  var $calendarBody = $('<div></div>');

  $calendarHeader.css({
    "width": "100%",
    "height": "10%",
    "position": "relative",
    "background-color": "azure",
  });
  $calendarBody.css({
    "width": "100%",
    "height": "90%",
    "position": "relative",
  });

  ////////달력 제조 시작
  var days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
  var d = new Date();
  var yy = d.getFullYear();
  var dd = d.getMonth();
  sessionYearSave = yy;
  sessionMonthSave = dd;

  // ajax 테스트
  var data = {};
  data.year = yy;
  data.month = (dd + 1);
  sendScheduleAjax('/getSchedule', data);

  var totalDate = lastDate(d.getFullYear(), d.getMonth());
  var first = firstDay(d.getFullYear(), d.getMonth());

  var $leftArrow = $('<div id="left" class="arrow">◀</div>');
  var $headerText = $('<div id="headerText">akakakakk</div>');
  var $rightArrow = $('<div id="right" class="arrow">▶</div>');

  //헤더에 붙일 화살표와 연월표시
  function reInitHeader() {
    $leftArrow.css({
      "display": "inline-block",
      "width": "10%",
      "font-size": "40px",
      "color": "black",
      "text-align": "center",
      "cursor": "pointer",
      "position": "absolute",
    });
    $headerText.css({
      "vertical-align": "baseline",
      "display": "inline-block",
      "left": "10%",
      "width": "80%",
      "font-size": "40px",
      "text-align": "center",
      "line-height": "40px",
      "font-weight": "bold",
      "color": "black",
      "position": "absolute",
    });
    $rightArrow.css({
      "display": "inline-block",
      "left": "90%",
      "width": "10%",
      "font-size": "40px",
      "color": "black",
      "text-align": "center",
      "cursor": "pointer",
      "position": "absolute",
    });

    $leftArrow.on('click', function (e) {
      e.preventDefault();
      d = new Date(yy, dd - 1);
      change();
    });
    $rightArrow.on('click', function (e) {
      e.preventDefault();
      d = new Date(yy, dd + 1);
      change();
    });

    $leftArrow.appendTo($calendarHeader);
    $headerText.appendTo($calendarHeader);
    $rightArrow.appendTo($calendarHeader);
  }

  if (sessionYearSave == yy && sessionMonthSave == dd) {
    console.log('first time on schedule');
    reInitHeader();
    changeHeader(yy, dd);
    createCell();
    addReal(first, totalDate);
  } else {
    console.log('not first time on schedule');
    reInitHeader();
    yy = sessionYearSave;
    dd = sessionMonthSave;
    changeHeader(sessionYearSave, sessionMonthSave);
    $calendarBody.html('');
    createCell();
    addReal(first, totalDate);
  }

  function createCell() {
    for (var i = 0; i < days.length; i++) {
      new Cell($calendarBody, days[i]);
    }
  }

  function firstDay(year, month) {
    return (new Date(year, month, 1).getDay());
  }

  function lastDate(year, month) {
    return (new Date(year, month + 1, 0).getDate());
  }

  function addReal(first, totalDate) {
    var count = 1;
    for (var a = 0; a < 42; a++) {
      if (a < first || count > totalDate) {
        new Cell($calendarBody, "");
      } else {
        new Cell($calendarBody, count++);
      }
    }
  }

  function changeHeader(year, month) {
    $headerText.text(year + "년 " + (month + 1) + "월");
  }

  function change() {
    $('#scheduleListDiv').html('');
    $('#listThisMonth').html('');
    $('#listNextMonth').html('');
    $calendarHeader.html('');
    $calendarBody.html('');
    yy = d.getFullYear();
    dd = d.getMonth();

    var data = {};
    data.year = yy;
    data.month = (dd + 1);
    sendScheduleAjax('/getSchedule', data);

    sessionYearSave = yy;
    sessionMonthSave = dd;
    totalDate = lastDate(d.getFullYear(), d.getMonth());
    first = firstDay(d.getFullYear(), d.getMonth());
    reInitHeader();
    changeHeader(yy, dd);
    createCell();
    addReal(first, totalDate);
  }


  $calendarHeader.appendTo(container);
  $calendarBody.appendTo(container);
}

function createScheduleList(container, scheduleData) {

  $('#scheduleListDiv').html('');
  $('#listThisMonth').html('');
  $('#listNextMonth').html('');
  var scheduleColor = [];
    
  var $selectedP = null;

  var $modalDiv2 = $('<div></div>');
  var $modalChangeSchedule = $('<p>일정 수정</p>');
  var $modalTextarea3 = $('<textarea id="modalTextarea3" name="needFocus" rows="6" cols="50" style="border-color:rgb(0, 204, 153); border-style:solid; border-width:2px;"></textarea>');
  var $modalEnter = $('<p><p>');
  var $modalButtonChange = $('<button type="button">수정</button>');
  var $modalButtonCancel = $('<button type="button">취소</button>');
  var $modalButtonDelete = $('<button type="button">삭제</button>');

  $modalDiv2.css({
    "position": "relative",
    "top": "37%",
    "width": "380px",
    "left": "40%",
  });

  $modalChangeSchedule.css({
    "font-size": "30px",
  });

  $listThisMonth = $('<div id="listThisMonth"></div>');
  $listNextMonth = $('<div id="listNextMonth"></div>');

  $listThisMonth.css({
    "display": "block",
    "position": "absolute",
    "top": "0",
    "left": "0",
    "width": "100%",
    "height": "50%",
    "border-bottom": "3px solid rgb(0, 204, 153)",
    //"overflow": "scroll"
  });

  $listNextMonth.css({
    "display": "block",
    "position": "absolute",
    "top": "50%",
    "left": "0",
    "width": "100%",
    "height": "50%",
    //"overflow": "scroll"
  });

  scheduleData.thisM.forEach(function (data) {
    var $scheduleListP = $('<p>aaaa</p>');
    $scheduleListP.attr("id", '<p>' + data.order);
    $scheduleListP.css({
      "margin-left": "5px",
      "margin-top": "5px",
      "margin-bottom": "0px",
      "cursor": "pointer",
    });

    $scheduleListP.text(data.date + ' ' + data.schedule);
    $scheduleListP.appendTo($listThisMonth);

    $scheduleListP.on('click', function () {

      console.log($(this));
      $selectedP = $(this);
      var string = $(this).text();
      string = string.substring(11);

      $modal2.css("display", "block");

      $modalChangeSchedule.appendTo($modalDiv2);
      $modalTextarea3.appendTo($modalDiv2);
      $modalEnter.appendTo($modalDiv2);
      $modalButtonChange.appendTo($modalDiv2);
      $modalButtonCancel.appendTo($modalDiv2);
      $modalButtonDelete.appendTo($modalDiv2);
      $modalDiv2.appendTo($modal2);

      document.getElementById("modalTextarea3").value = string;
      $modalTextarea3.click(function () {
        event.stopPropagation();
      });
    });
      
    // 색칠을 위한 값 계산하기 (일정 카운트)
      var day = Number(data.date.split('-')[2]);
      if(scheduleColor[day] == undefined)
          scheduleColor[day] = 1;
      else{
          scheduleColor[day] = scheduleColor[day]+1;
      }
  });
    
    // 색 칠하기
    scheduleColor.forEach(function(cnt, day){  // function(value, index)

        var daycell = document.getElementById("<day>"+day);
        
        if(scheduleColor[day] == 1){ // yellow
            daycell.style.backgroundColor = "#F3F781";
        }
        else if(scheduleColor[day] == 2){ // orange
            daycell.style.backgroundColor = "#FAAC58";
        }
        else if(scheduleColor[day] > 2){ // red
            daycell.style.backgroundColor = "#FA5858";
        }
    });

  scheduleData.nextM.forEach(function (data) {
    var $scheduleListP = $('<p>aaaa</p>');
    $scheduleListP.attr("id", '<p>' + data.order);
    $scheduleListP.css({
      "margin-left": "5px",
      "margin-top": "5px",
      "margin-bottom": "0px",
      "cursor": "pointer",
    });
    $scheduleListP.text(data.date + ' ' + data.schedule);
    $scheduleListP.appendTo($listNextMonth);

    $scheduleListP.on('click', function () {

      console.log($(this));
      $selectedP = $(this);
      var string = $(this).text();
      string = string.substring(11);

      $modal2.css("display", "block");

      $modalChangeSchedule.appendTo($modalDiv2);
      $modalTextarea3.appendTo($modalDiv2);
      $modalEnter.appendTo($modalDiv2);
      $modalButtonChange.appendTo($modalDiv2);
      $modalButtonCancel.appendTo($modalDiv2);
      $modalButtonDelete.appendTo($modalDiv2);
      $modalDiv2.appendTo($modal2);

      document.getElementById("modalTextarea3").value = string;
      $modalTextarea3.click(function () {
        event.stopPropagation();
      });
    });
  });

  $modal2.on('click', function () {
    $modal2.css("display", "none");
    $modalDiv2.html('');
  });

  $modalTextarea3.click(function () {
    event.stopPropagation();
  });

  $modalButtonChange.on('click', function () {
    $modal2.css("display", "none");
    // DB 업데이트 Ajax 요청
    var pid = $selectedP.attr("id");
    pid = pid.substring(3);

    var data = {};
    data.schedule = document.getElementById("modalTextarea3").value;
    data.order = pid;

    sendScheduleAjax('/modifySchedule', data);

    $modalTextarea3.val('');
  });

  $modalButtonDelete.on('click', function () {
    var pid = $selectedP.attr("id");
    pid = pid.substring(3);

    var data = {};
    data.order = pid;
    
    sendScheduleAjax('/deleteSchedule', data);
      
    $selectedP.remove();
    $modal2.css("display", "none");

    $modalTextarea3.val('');
  });

  $listThisMonth.appendTo(container);
  $listNextMonth.appendTo(container);
}

// 스케쥴 관련 Ajax
/* **************************************************************** */
function sendScheduleAjax(type, data) {
  var url = 'http://localhost:3000';
  var xhr = new XMLHttpRequest();

  switch (type) {

    case '/getScheduleCounter': // 스케쥴 카운터 받아오기
      xhr.addEventListener('load', function () {
        scheduleCounter = Number(JSON.parse(xhr.responseText));
        //console.log("counter : ", scheduleCounter);
      }); break;


    case '/getSchedule': // 스케쥴 받아오기 처리
      xhr.addEventListener('load', function () {

        var result = JSON.parse(xhr.responseText);
        if (result.type) { // == 1
          scheduleData.thisM = result.schedule;
          scheduleData.nextM = result.schedule2;
        }
        console.log("ajax schedule : ", scheduleData);

        createScheduleList($('#scheduleListDiv'), scheduleData);
      });
      break;


    case '/addSchedule': // 스케쥴 추가요청 응답처리
      xhr.addEventListener('load', function () {

        var result = JSON.parse(xhr.responseText);
        if (result.type) {
          console.log("스케줄 추가 완료");
          scheduleCounter++;

          var data = {};
          data.year = sessionYearSave;
          data.month = (sessionMonthSave + 1);

          sendScheduleAjax('/getSchedule', data);
        }
      }); break;

    case '/modifySchedule': // 스케쥴 수정요청 응답처리
      xhr.addEventListener('load', function () {
        var result = JSON.parse(xhr.responseText);
        if (result.type) {
          console.log("스케줄 수정 완료");

          var data = {};
          data.year = sessionYearSave;
          data.month = (sessionMonthSave + 1);

          sendScheduleAjax('/getSchedule', data);
        }
      }); break;

    case '/deleteSchedule': // 스케쥴 삭제요청 응답처리
      xhr.addEventListener('load', function () {
        var result = JSON.parse(xhr.responseText);
        if (result.type) {
          console.log("스케줄 삭제 완료");

          var data = {};
          data.year = sessionYearSave;
          data.month = (sessionMonthSave + 1);

          sendScheduleAjax('/getSchedule', data);
        }
      }); break;

  }

  xhr.open('POST', url + type)
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(data));
}
