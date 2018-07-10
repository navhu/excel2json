// 从excel中导出的数据
var excel = [];

// 省份函数变量
var getProvFn = null;

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

// 获取省份(带id)
var getProvincesAndId = function () {
    var pList = [];
    for (var i = 0; i < excel.length; i++) {
        if (pList.indexOf(excel[i].province + '-' + excel[i].provinceId) === -1) {
            pList.push(excel[i].province + '-' + excel[i].provinceId);
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

// 获取城市(带id)
var getCitiesAndId = function (province) {
    var cList = [];
    for (var i = 0; i < excel.length; i++) {
        if (excel[i].province === province && cList.indexOf(excel[i].city + '-' + excel[i].cityId) === -1) {
            cList.push(excel[i].city + '-' + excel[i].cityId);
        }
    }
    sortChinese(cList); // 会改变原数组
    return cList;
};

// 获取经销商
var getDealers = function (city) {
    var dList = [];
    for (var i = 0; i < excel.length; i++) {
        var flg = true;
        for (var h = 0; h < dList.length; h++) {
            if (excel[i].dealerName === dList[h].dealerName) {
                flg = false;
            }
        }
        if (excel[i].city === city && flg) {
            dList.push({
                dealerName: excel[i].dealerName,
                dealerCode: excel[i].dealerCode
                // proxyId: excel[i].proxyId,
                // area: excel[i].area
            });
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
    cb && cb(getProvFn());
};

// 自定义json嵌套格式
var excel2json = function (list) {
    var data = {};
    data.citylist = [];

    for (var i = 0; i < list.length; i++) {
        data.citylist.push({
            "p": list[i],
            "c": []
        });

        var cityList = getCities(list[i]);

        for (var j = 0; j < cityList.length; j++) {
            data.citylist[i].c.push({
                "n": cityList[j],
                "a": []
            });

            var dealerList = getDealers(cityList[j]);

            for (var k = 0; k < dealerList.length; k++) {
                data.citylist[i].c[j].a.push({
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

// 有id版
var excel2json_hasId = function (list) {
    var data = {};
    data.citylist = [];

    for (var i = 0; i < list.length; i++) {
        data.citylist.push({
            "p": list[i].split('-')[0],
            "id": list[i].split('-')[1],
            "c": []
        });

        var cityList = getCitiesAndId(list[i].split('-')[0]);

        for (var j = 0; j < cityList.length; j++) {
            data.citylist[i].c.push({
                "n": cityList[j].split('-')[0],
                "id": cityList[j].split('-')[1],
                "a": []
            });

            var dealerList = getDealers(cityList[j].split('-')[0]);

            for (var k = 0; k < dealerList.length; k++) {
                data.citylist[i].c[j].a.push({
                    "s": dealerList[k].dealerName,
                    "id": dealerList[k].dealerCode
                    // "pid": dealerList[k].proxyId,
                    // "dq": dealerList[k].area
                })
            }

        }

    }

    $('#result').val(JSON.stringify(data));
    jsonStr = JSON.stringify(data);
    // console.log(jsonStr);
};

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
    // 先获取radio值
    var chooseType = $('.inlineRadio:checked').val();

    // 然后相对应的进行转换
    switch (chooseType) {
        case 'noId':
            console.log('执行：无id版');
            getProvFn = null;
            getProvFn = getProvinces;
            convert(excel2json);
            break;
        case 'hasId':
            console.log('执行：有id版');
            getProvFn = null;
            getProvFn = getProvincesAndId;
            convert(excel2json_hasId);
            break;
        default:
            console.log('执行默认操作：无id版');
            getProvFn = null;
            getProvFn = getProvinces;
            convert(excel2json);
    }

});

// 来个demo
$("#demo").click(function () {
    $("#content").val("provinceId\tprovince\tcityId\tcity\tdealerName\tdealerCode\tproxyId\tarea\n500000\t重庆\t500100\t重庆市\t重庆商社公司\tS5002\t125\tRSD6\n500000\t重庆\t500100\t重庆市\t重庆众友公司\tS5012\t126\tRSD6\n500000\t重庆\t500100\t重庆市\t重庆长久公司\tS5014\t145\tRSD6\n510000\t四川\t510100\t成都市\t成都虹润公司\tS1007\t101\tRSD6\n510000\t四川\t510700\t绵阳市\t绵阳艾潇公司\tS1056\t185\tRSD6\n510000\t四川\t511100\t乐山市\t乐山天牛公司\tS1051\t475\tRSD6\n520000\t贵州\t520100\t贵阳市\t贵阳利和公司\tS2002\t120\tRSD6\n520000\t贵州\t520300\t遵义市\t遵义华众公司\tS2011\t136\tRSD6\n520000\t贵州\t520400\t安顺市\t安顺恒信公司\tS2005\t803\tRSD6\n530000\t云南\t530100\t昆明市\t昆明宇泰公司\tS3035\t157\tRSD6\n530000\t云南\t530300\t曲靖市\t曲靖云鑫公司\tS3015\t285\tRSD6\n530000\t云南\t530700\t丽江市\t丽江盛通公司\tS2001\t839\tRSD6\n610000\t陕西\t610100\t西安市\t西安东明公司\tS1013\t152\tRSD6\n610000\t陕西\t610600\t延安市\t延安亚泰公司\tS1027\t186\tRSD6\n610000\t陕西\t610300\t宝鸡市\t宝鸡威众公司\tS1028\t187\tRSD6\n620000\t甘肃\t620100\t兰州市\t兰州金岛公司\tS2002\t155\tRSD6\n620000\t甘肃\t620400\t白银市\t白银庞众公司\tS2009\t445\tRSD6\n620000\t甘肃\t620300\t金昌市\t金昌赛通公司\tS2001\t836\tRSD6");
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
        $('#toast').modal();
    }
});

// 模态框提示
function toast(txt) {
    $('#toast').find('.modal-body').text(txt).end().modal();
}

// 联动初始化
$('#btn-init').click(function () {
    if (!jsonStr) {
        toast('无json数据');
        return
    }

    var demoData = JSON.parse(jsonStr);
    $(".wrap-demo").citySelect({
        url: demoData,
        nodata: null,
        required: false
    });
});
