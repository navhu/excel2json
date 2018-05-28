// 从excel中导出的数据
var excel = [];

// 最终的json
var jsonStr = '';

// 默认分隔符
var flag = /\t/;

// 按照拼音排序
var sortChinese = function (arr) {
    arr.sort(function (item1, item2) {
        return item1.localeCompare(item2, 'zh-CN');
    })
};

// 获取省份
var getProvinces = function () {
    var pList = [];
    for (var i = 0; i < excel.length; i++) {
        if (pList.indexOf(excel[i].province) === -1) {
            pList.push(excel[i].province);
        }
    }
    sortChinese(pList); // 会改变原数组
    return pList;
};

// 获取城市
var getCities = function (province) {
    var cList = [];
    for (var i = 0; i < excel.length; i++) {
        if (excel[i].province === province && cList.indexOf(excel[i].city) === -1) {
            cList.push(excel[i].city);
        }
    }
    sortChinese(cList); // 会改变原数组
    return cList;
};

// 获取经销商
var getDealers = function (city) {
    var dList = [];
    for (var i = 0; i < excel.length; i++) {
        if (excel[i].city === city && dList.indexOf(excel[i].dealerName) === -1) {
            // list.push(excel[i].dealer_name);
            var tmp = {};
            tmp.dealerCode = excel[i].dealerCode;
            tmp.dealerName = excel[i].dealerName;
            dList.push(tmp);
        }
    }
    return dList;
};

//常规转换
var convert = function (cb) {
    flag = $('#xxx').val() || flag; // TODO: 其它分隔符
    var cverType = $('#yyy').val() || '0'; //TODO: 0==> 按行转换成对象; 1==> 按行转换成数组
    var txt = $('#content').val();
    var data = txt.split('\n');
    var html = '[\n';
    var keys = [];

    for (var i = 0; i < data.length; i++) {
        var ds = data[i].split(flag);
        if (i === 0) {
            if (cverType === '0') {
                keys = ds;
            } else {
                html += '[';
                for (var j = 0; j < ds.length; j++) {
                    html += '"' + ds[j] + '"';
                    if (j < ds.length - 1) {
                        html += ',';
                    }
                }
                html += '],\n';
            }

        } else {
            if (ds.length === 0) continue;
            if (ds.length === 1) {
                ds[0] == '';
                continue;
            }
            html += cverType === '0' ? '{' : '[';
            for (var k = 0; k < ds.length; k++) {
                var d = ds[k];
                if (d === '') continue;
                if (cverType === '0') {
                    html += '"' + keys[k] + '":"' + d + '"';
                } else {
                    html += '"' + d + '"';
                }
                if (k < ds.length - 1) {
                    html += ',';
                }
            }
            html += cverType === '0' ? '}' : ']';
            if (i < data.length - 1)
                html += ',\n';
        }
    }
    html += '\n]';

    // $('#result').val(html);
    excel = JSON.parse(html);
    cb && cb(getProvinces());
};

// 自定义json嵌套格式
var excel2json = function (list) {
    var data = {};
    data.mylist = [];

    for (var i = 0; i < list.length; i++) {
        data.mylist.push({
            "p": list[i],
            "c": []
        });

        var cityList = getCities(list[i]);

        for (var j = 0; j < cityList.length; j++) {
            data.mylist[i].c.push({
                "n": cityList[j],
                "a": []
            });

            var dealerList = getDealers(cityList[j]);

            for (var k = 0; k < dealerList.length; k++) {
                data.mylist[i].c[j].a.push({
                    "s": dealerList[k].dealerName,
                    "id": dealerList[k].dealerCode
                })
            }

        }

    }

    $('#result').val(JSON.stringify(data));
    jsonStr = JSON.stringify(data);
    // console.log(jsonStr);
};

// excel2json(getProvinces());

// 下载文件方法
var funDownload = function (content, filename) {
    var aLink = document.createElement('a');
    aLink.download = filename;
    aLink.style.display = 'none';
    // 字符内容转变成blob地址
    var blob = new Blob([content]);
    aLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(aLink);
    aLink.click();
    // 然后移除
    document.body.removeChild(aLink);
};


// 转换
$('#go').click(function () {
    convert(excel2json);
});

// 来个demo
$("#demo").click(function () {
    $("#content").val("province\tcity\tdealerName\tdealerCode\n安徽\t安庆\t安庆冠豪\t14835\n安徽\t安庆\t安庆乐瑞\t18104\n重庆\t重庆\t重庆力瑞\t17917\n重庆\t重庆\t重庆智鑫\t15417\n福建\t福州\t福建美捷\t10039\n福建\t厦门\t厦门昆祺\t18143\n甘肃\t白银\t白银瑞通\t18180\n甘肃\t兰州\t兰州良志\t10086");
});

// 清空
$('#clearText').click(function () {
    $('textarea').val('');
});

// 导出为JSON文件
$('#download').on('click', function () {
    if ('download' in document.createElement('a')) {
        funDownload(jsonStr, 'result.json');
    } else {
        $('#fail').modal();
    }
});
