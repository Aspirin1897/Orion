/*
 * 2020.9.29 Paul
 * note : 英文简写说明
 * 
 * */

// 操作提示
var vplxIp = get_vlpx_ip();
var tid = Date.parse(new Date()).toString();// 获取到毫秒的时间戳，精确到毫秒
var tid = tid.substr(0, 10);
var mgtIp = get_mgt_ip();

function get_mgt_ip() {
	var obj = new Object();
	$.ajax({
		url : "/mgtip",
		type : "GET",
		dataType : "json",
		async : false,
		success : function(data) {
			obj = "http://" + data["ip"];
		}
	});

	return obj;
}

function get_vlpx_ip() {
	var obj = new Object();
	$.ajax({
		url : "/vplxip",
		type : "GET",
		dataType : "json",
		async : false,
		success : function(data) {
			obj = "http://" + data["ip"];
		}
	});

	return obj;
}

function div_success() {
	document.getElementById('light_success').style.display = 'block';
	setTimeout("light_success.style.display='none'", 2000);
}

function div_failed() {
	document.getElementById('light_failed').style.display = 'block';
	document.getElementById('fade').style.display = 'block';
	setTimeout("light_failed.style.display='none'", 4000);
	setTimeout("fade.style.display='none'", 4000);
}

$("#host_create").mousedown(
		function() {
			host_name_myfunction();
			iqn_myfunction();
			var hostName = $("#host_name").val()
			var hostiqn = $("#host_iqn").val()

			var dict_data = JSON.stringify({
				"host_alias" : hostName,
				"host_iqn" : hostiqn
			});

			var host_name_hid_value = $("#host_name_hid").val();
			var host_iqn_hid_value = $("#host_iqn_hid").val();
			if (host_name_hid_value == "1" && host_iqn_hid_value == "1") {
				write_to_log(tid, 'OPRT', 'CLICK', 'host_create', 'accept',
						dict_data);
				$.ajax({
					url : vplxIp + "/host/create",
					type : "GET",
					data : {
						tid : tid,
						ip : mgtIp,
						host_name : hostName,
						host_iqn : hostiqn
					},
					async : false,
					success : function(operation_feedback_prompt) {
						console.log(operation_feedback_prompt);
						console.log(typeof (operation_feedback_prompt));
						if (operation_feedback_prompt == '0') {
							var text = "创建成功!";
							$('#P_text_success').text(text);
							div_success();
						} else {
							var text = "创建失败!";
							$('#P_text_failed').text(text);
							div_failed();
						}
						write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
								'/host/create', operation_feedback_prompt);
						$("#host_name").val("");
						$("#host_iqn").val("");
						$("#host_name_hid").val("0");
						$("#host_iqn_hid").val("0");
					},
					error : function() {
						write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
								'/host/create', 'error');
					}
				})

			} else {
				write_to_log(tid, 'OPRT', 'CLICK', 'host_create', 'refuse',
						dict_data);
			}

		});

function write_to_log(tid, t1, t2, d1, d2, data) {
	$.ajax({
		url : '/iscsi/write_log',
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			t1 : t1,
			t2 : t2,
			d1 : d1,
			d2 : d2,
			data : data
		},
		async : false,
		success : function(write_log_result) {
		}
	});
}
// 输入框验证

function host_name_myfunction() {
	document.getElementById("host_name_examine").className = "hidden";
	document.getElementById("host_name_format").className = "hidden";
	var input_result = $('#host_name').val();
	var host_name_match_regular = /^[a-zA-Z]\w*$/;
	match_result = host_name_match_regular.test(input_result)
	if (!input_result) {
		$("#host_name_hid").val("0");
		document.getElementById("host_name_examine").className = "hidden";
		document.getElementById("host_name_format").className = "hidden";
	} else {
		if (!match_result) {
			$("#host_name_hid").val("0");
			document.getElementById("host_name_format").className = "";
		} else {
			$
					.ajax({
						url : vplxIp + "/host/show/oprt",
						type : "GET",
						dataType : "json",
						data : {
							tid : tid,
							ip : mgtIp
						},
						async : false,
						success : function(host_result) {
							$
									.ajax({
										url : vplxIp + "/host/show/data",
										type : "GET",
										dataType : "json",
										data : {
											tid : tid,
											ip : mgtIp
										},
										async : false,
										success : function(host_result) {
											if (JSON.stringify(host_result) === '{}') {
												$("#host_name_hid")
												.val("1");
											} else {
												for ( var i in host_result) {
													if (input_result == i) {
														$("#host_name_hid")
																.val("0");
														document
																.getElementById("host_name_examine").className = "";
														break;
													} else {
														$("#host_name_hid")
																.val("1");
													}
												}

											}
										}
									});

						}
					});
		}
	}

}

function iqn_myfunction() {
	document.getElementById("iqn_format").className = "hidden";
	var input_result = $('#host_iqn').val();
	var iqn_match_regular = /^iqn.\d{4}-\d{2}.[a-zA-Z0-9.:-]+$/;
	match_result = iqn_match_regular.test(input_result)
	if (!input_result) {
		$("#host_iqn_hid").val("0");
		document.getElementById("iqn_format").className = "hidden";
	} else {
		if (!match_result) {
			$("#host_iqn_hid").val("0");
			document.getElementById("iqn_format").className = "";
		} else {
			$("#host_iqn_hid").val("1");
		}
	}
}
