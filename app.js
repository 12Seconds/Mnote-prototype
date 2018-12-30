/* Miracle Note (Prototype) by songsik Hwang 2018 */

var express = require('express');
var expressSession = require('express-session');

var bodyParser = require('body-parser');

var multer = require('multer');
var multerS3 = require('multer-s3');

/* AWS init ****************************************/
var aws = require('aws-sdk');
var s3 = new aws.S3();

aws.config.update({
    secretAccessKey: '***************************',
        accessKeyId: '***************************',
             region: '**********' // example : ap-northeast-2c
});

/* DB init *****************************************/
var mysql = require('mysql');
var connection = mysql.createConnection({
        host : 'DB-End-Point',
        user : 'userName',
    password : '********',
    database : 'dbName'
    //, port : '3306' (default : 3306)
});

connection.connect(); //connection.end();

/* ETC init *****************************************/
var app = express();

app.use(express.static('public'));

app.use(expressSession({
	secret: 'mySecretKeySting',
	resave: false,
	saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

/* 페이지 접속 */
app.get('/', function(req, res) { res.sendFile(__dirname + '/index.html'); });

/* 인증 관련 AJAX 요청 처리 ---------------------------------------------------------------------------- */
app.get('/sessionCheck', function(req, res){
    var data = {};
    if(req.session.user == undefined){
        data.type = 0;
        res.send(JSON.stringify(data));
    }
    else
    {
        data.type = 1;
        data.name = req.session.user.name;
        res.send(JSON.stringify(data));
    }
});

app.post('/signUp', function(req, res){
    console.log("< signUp REQ >"); 
    //console.log(req.body);
    
    var nm = req.body.nm; // name
    var id = req.body.id;
    var pw = req.body.pw;
    var data = {};
    
    connection.query('SELECT * FROM userInfo WHERE id=?',[id], function(error, results){
        if(error) { console.log("database error (select)"); data.type = -1; /*throw error*/};
        if(results.length >= 1)
        {
            data.type = 0; // 동일한 아이디가 이미 존재하므로 실패
            res.send(JSON.stringify(data));
        }
        else
        {
            connection.query("INSERT INTO userInfo (id, pw, name) VALUES (?,?,?)", [id,pw,nm], function(error, results){
                if(error) { console.log("database error (insert)"); data.type = -1; /*throw error*/};
                data.type = 1; // 신규 가입 성공
                res.send(JSON.stringify(data));
            });
        }
    });
});

app.post('/signIn', function(req, res){
    console.log("< signIn REQ >");
    //console.log(req.body);
    
    var id = req.body.id;
    var pw = req.body.pw;
    var data={};
    connection.query('SELECT * FROM userInfo WHERE id=?', [id], function(error, results){
        if(error) { console.log("database access error (select)"); data.type= -1; /*throw error*/};
        if(results.length == 0) // 계정 정보가 존재하지 않으므로 실패
        {
            data.type = 0; 
            res.send(JSON.stringify(data));
        }
        else
        {
            if(pw != results[0].pw) // 로그인 실패
            { data.type = 1; res.send(JSON.stringify(data)); } 
            else 
            {   //로그인 성공
                data.type = 2; 
                data.name = results[0].name;
                req.session.user = { "id" : id, "name" : data.name };
                res.send(JSON.stringify(data)); 
            }
        }
    });
});

/* 메모 기능 요청 처리 (sendMemoAjax) ---------------------------------------------------------------------------- */
app.post('/getCounter', function(req,res){ // getMemoCounter로 수정 고려
    console.log("< /getCounter REQ >");
    connection.query('SELECT memocnt FROM userInfo WHERE id=?', [req.session.user.id], function(error, results){
        if(error) { console.log("database access error (select)"); data.type= -1; /*throw error*/};
            console.log("memocnt : ", results[0].memocnt);
            res.send(JSON.stringify(results[0].memocnt));
    });
});

app.post('/getMemos', function(req,res){
    var data={};
    console.log("< /getMemos REQ >");

    connection.query('SELECT * FROM userMemo WHERE owner=?', [req.session.user.id], function(error, results){
        if(error) { console.log("database access error (select)"); data.type= -1; /*throw error*/};
        if(results.length == 0){
            data.type = 0; // 메모 데이터 없음
            res.send(JSON.stringify(data));
        }
        else{
            data.type = 1; // 메모 데이터 있음
            data.memos = results;
            res.send(JSON.stringify(data));
        }
    });
    
});

app.post('/addMemo', function(req, res){
    console.log("< /addMemo REQ >");
    var owner = req.session.user.id;
    var memo = req.body.memo;
    var order = req.body.order;
    var data = {};
    
    var set = {owner:owner, memo:memo, order:order};
  //connection.query("INSERT INTO userMemo (owner, memo, order) VALUES (?,?,?)", [owner,memo,order], function(error, results){
    connection.query("INSERT INTO userMemo SET ?", set, function(error, results){
        if(error) { console.log("database access error (memo insert)"); data.type = -1; throw error};
        
        connection.query("UPDATE userInfo SET memocnt=? WHERE id=?", [order+1,owner], function(err, rst){ // 메모 카운터값 증가
            if(err) { console.log("database access error (update)"); data.type = -1; throw err};
            data.type = 1;
            res.send(JSON.stringify(data));
        });
    });
    
});

app.post('/modifyMemo', function(req, res){
    var owner = req.session.user.id;
    var memo = req.body.memo;
    var order = req.body.order;
    var data = {};
    
    console.log("< /modifyMemo REQ >");
    console.log("owner : ", owner);
    console.log("memo : ", memo);
    console.log("order : ", order);
    
    /*
    connection.query("UPDATE userMemo SET memo=? WHERE owner=? AND order=?", [memo,owner,order], function(error, results){
        if(error) { console.log("database access error (update)", error); data.type = -1; throw error};
        data.type = 1; // 메모 수정 성공
        res.send(JSON.stringify(data));
    });
    */
    var i  = 0;
    // 메모 테이블에서 해당 메모의 id 찾아서 수정 (where and 조건문이 제대로 동작하지 않아서)
    connection.query('SELECT * FROM userMemo WHERE owner=?',[owner], function(error, results){
        if(error) { console.log("database error (select)"); console.log(error); };
        for(i=0; i<results.length; i++){
            if(results[i].order == order){
                connection.query("UPDATE userMemo SET memo=? WHERE id=?", [memo,results[i].id], function(error2, results2){
                    if(error2) { console.log("database error (delete)"); console.log(error2); };
                    data.type = 1; // 메모 수정 성공
                    res.send(JSON.stringify(data));
                });
            }
        }
    });
});

app.post('/deleteMemo', function(req, res){
    var owner = req.session.user.id;
    var order = req.body.order;
    var data = {};
    console.log("< /deleteMemo REQ >");
    console.log("owner : ", owner);
    console.log("order : ", order);    

    var i  = 0;
    // 메모 테이블에서 해당 메모의 id 찾아서 삭제 (where and 조건문이 제대로 동작하지 않아서)
    connection.query('SELECT * FROM userMemo WHERE owner=?',[owner], function(error, results){
        if(error) { console.log("database error (select)"); console.log(error); };
        for(i=0; i<results.length; i++){
            if(results[i].order == order){
                connection.query("DELETE FROM userMemo WHERE id=?", [results[i].id], function(error2, results2){
                    if(error2) { console.log("database error (delete)"); console.log(error2); };
                    data.type = 1; // 메모 삭제 성공
                    res.send(JSON.stringify(data));
                });
            }
        }
    });
});

/* 일정 기능 요청 처리 (sendScheduleAjax) ---------------------------------------------------------------------------- */
app.post('/getScheduleCounter', function(req,res){
    console.log("< /getScheduleCounter REQ >");
    connection.query('SELECT schedulecnt FROM userInfo WHERE id=?', [req.session.user.id], function(error, results){
        if(error) { console.log("database access error (select)"); data.type= -1; /*throw error*/};
            console.log("schedulecnt : ", results[0].schedulecnt);
            res.send(JSON.stringify(results[0].schedulecnt));
    });
});

app.post('/getSchedule', function(req,res){ // 이달과 내달의 일정 리턴
    console.log("< /getSchedule REQ from "+req.session.user.id+" >");
    //console.log("client ym : "+req.body.year+"-",req.body.month);
    
    var year = req.body.year;  
    var year2 = req.body.year;
    
    var month = req.body.month; // month = 1 ~ 12 , month2 = 2 ~ 13 
    var month2 = (month+1);
    
    if(month2 == 13){
        month2 = 1;
        year2 = Number(year2)+1;
    }
    
    if((month / 10) < 1 ){
        month = "0"+month;
    }
    if((month2 / 10) < 1){
        month2 = "0"+month2;
    }
    
    var ym = year+'-'+month;
    var ym2 = year2+'-'+month2;

    var data = {};
    
    connection.query
    ('SELECT * FROM userSchedule WHERE owner=? and date LIKE ? ORDER BY date', [req.session.user.id,ym+"%"], function(error, results){
        if(error) { console.log("database access error (select)"); data.type= -1; /*throw error*/}
        else{
            console.log(results);
            data.type = 1; 
            data.schedule = results; // 이번 달 일정 데이터 담기
        }
    });
    
    connection.query
    ('SELECT * FROM userSchedule WHERE owner=? and date LIKE ? ORDER BY date', [req.session.user.id,ym2+"%"], function(error, results){
        if(error) { console.log("database access error (select)"); data.type= -1; /*throw error*/}
        else{
            console.log(results);
            data.type = 1; 
            data.schedule2 = results; // 다음 달 일정 데이터 담기
            res.send(JSON.stringify(data)); 
        }
    });
});

app.post('/addSchedule', function(req,res){
    console.log("< /addSchedule REQ >");
    
    var owner = req.session.user.id;
    var schedule = req.body.schedule;
    var date = req.body.date;
    var order = req.body.order;
    
    var data = {};
    var set = {owner:owner, schedule:schedule, date:date, order:order};
    connection.query("INSERT INTO userSchedule SET ?", set, function(error, results){
        if(error) { console.log("database access error (schedule insert)"); console.log(error); data.type = -1; /* throw error */}
        else{
            connection.query("UPDATE userInfo SET schedulecnt=? WHERE id=?", [order+1,owner], function(err, rst){
                if(err) { console.log("database access error (update)"); data.type = -1; throw err}
                else{
                    data.type = 1; // 일정 추가 성공
                    res.send(JSON.stringify(data));
                }
            });
        }
    });
});

app.post('/modifySchedule', function(req,res){
    console.log("< /modifySchedule REQ >");
    
    var owner = req.session.user.id;
    var schedule = req.body.schedule;
    var order = req.body.order;
    
    var data = {};
    var i = 0;
    // 일정 테이블에서 해당 일정 id 찾아서 수정 
    connection.query('SELECT * FROM userSchedule WHERE owner=?', [owner], function(error, results){
        if(error) { console.log("database error (select)"); console.log(error); };
        for(i=0; i<results.length; i++){
            if(results[i].order == order){
                connection.query("UPDATE userSchedule SET schedule=? WHERE id=?", [schedule,results[i].id], function(error2, results2){
                    if(error2) { console.log("database error (delete)"); console.log(error2); };
                    data.type = 1; // 일정 수정 성공
                    res.send(JSON.stringify(data));
                });
            }
        }
    });
});

app.post('/deleteSchedule', function(req,res){
    console.log("< /deleteSchedule REQ >");
    
    var owner = req.session.user.id;
    var order = req.body.order;

    var data = {};
    var i  = 0;
    connection.query('SELECT * FROM userSchedule WHERE owner=?', [owner], function(error, results){
        if(error) { console.log("database error (select)"); console.log(error); };
        for(i=0; i<results.length; i++){
            if(results[i].order == order){
                connection.query("DELETE FROM userSchedule WHERE id=?", [results[i].id], function(error2, results2){
                    if(error2) { console.log("database error (delete)"); console.log(error2); };
                    data.type = 1; // 일정 삭제 성공
                    res.send(JSON.stringify(data));
                });
            }
        }
    });

});

/* 아카이브 기능 요청 처리 (S3) ---------------------------------------------------------------------------- */
var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "bucketName",
        key: function (req, file, cb) {
             //console.log(file.originalname);
             var filename = Date.now().toString()+"^"+req.session.user.id+"^"+file.originalname;
             cb(null, filename);
        },
        acl: 'public-read',
    })
});

app.post('/imageUpload', upload.single("userfile"),function(req, res){
    //console.log(req.body);
    //console.log(req.file);
    var file = req.file;
    var result = {
        originalName : file.originalname,
        size : file.size,
    }
    //console.log(result);
    
    var data = {};
    data.url = req.file.location;
    res.send(JSON.stringify(data));
});

app.post('/getImages', function(req,res){
    var prefix = 'https://s3.region.amazonaws.com/bucketName/';
    var sessionID = req.session.user.id;
    var list = [];
    
    s3.listObjects({Bucket: 'bucketName'}).on('success', function handlePage(response) {
        for(var name in response.data.Contents)
        {
            var key =  response.data.Contents[name].Key;
            
            if(key.split('^')[1] == sessionID)
                list.push(prefix+response.data.Contents[name].Key);
            
        }
        if (response.hasNextPage()) {
            response.nextPage().on('success', handlePage).send();
        }else{
            var data = {};
            data.list = list;
            res.send(JSON.stringify(data));
        }
    }).send();
});

app.post('/deleteImage', function(req, res){
    var key = req.body.key.split('/')[4];
    if(key == undefined){ key = req.body.key.split('/')[3]; }
    
    var params = {
      Bucket: "bucketName", 
      Key: key
     };
    
    console.log(params);
    
    var data = {};
    s3.deleteObject(params, function(err, result){
        if (err){
            data.type = -1;
            console.log("s3 delete error", err, err.stack);
        }
        else{
            data.type = 1;
            res.send(JSON.stringify(data));
            console.log("deleteImage :", result);
        }
    });
});

app.listen(3000, function (){
	console.log('Mnote app listening on port 3000');
});
