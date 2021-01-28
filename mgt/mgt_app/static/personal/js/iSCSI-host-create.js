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
							$("#Host_Table tr:not(:first)").html("");
							host_table();
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
												$("#host_name_hid").val("1");
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
	var iqn_match_regular = /^iqn\.\d{4}-\d{2}\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:[a-zA-Z0-9.:-]+)?$/;
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

host_table();
function host_table() {
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
				success : function(status) {
					write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
							'/host/show/oprt', status);
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
									write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
											'/host/show/data', JSON
													.stringify(host_result));
									for (i in host_result) {
										tr = '<td style="width: 100px;">'
												+ i
												+ '</td>'
												+ '<td>'
												+ host_result[i]
												+ '</td>'
												+ '<td style="width: 200px;">'
												+ '<button  onClick="btn_show(this);">编辑</button>'+'<button  onClick="btn_show_delete(this);">删除</button>'
												+ '</td>';
										$("#Host_Table_Show").append(
												'<tr>' + tr + '</tr>')
									}
								},
								error : function() {
									write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
											'/host/show/data', 'error');
								}

							});
				},
				error : function() {
					write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
							'/host/show/oprt', 'error');
				}
			});
};

function btn_show(obj) {
//	$("#btn_hid").show()//table显示du
	$("#btn_show").hide()//table隐藏zhi
	// 弹出框
	
	$('tr').each(function() {
		$(this).on("click", function() {
			$("#host_model").modal("toggle");
		})
	});
	// 获取点击表格的td值
	var e = e || window.event;
	var target = e.target || e.srcElement;
	if (target.parentNode.tagName.toLowerCase() == "td") {
	tr = target.parentNode.parentNode;
	td = tr.cells;
	 for(var i = 0; i<td.length; i++ ){
	var td_host = td[0].innerHTML
	 var td_iqn = td[1].innerHTML
	 }
	}
	console.log(td_host);
	console.log(td_iqn);
	$("#host_name_hidden").val(td_host);
	$("#host_iqn_hidden").val(td_iqn);
}

function affirm_modifiy(obj){
	//打开二次确认弹窗
	$('#host_info_model').modal("show");
	$.ajax({
		url : vplxIp + "/host/modify/check",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			host_name: host_name,
			host_iqn: host_iqn
		},
		async : false,
		success : function(hg_result) {
			$("#host_info_result").text(hg_result['info']);
		},
	});
// window.location.reload();
}

function myrefresh(obj) {
	window.location.reload();
}
function myrefresh_second(obj) {
	window.location.reload();
}
function myrefresh_delete(obj) {
	window.location.reload();
}


function affirm_modifiy_second(obj){
	host_name = $("#host_name_hidden").val();
	 host_iqn = $("#host_iqn_hidden").val();
	 
	$.ajax({
		url : vplxIp + "/host/modify",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp,
			host_name: host_name,
			host_iqn: host_iqn
		},
		async : false,
		success : function(host_result) {
			alert(host_result);
			window.location.reload();
		},
	});
}

function btn_show_delete(obj) {
	
	$('tr').each(function() {
		$(this).on("click", function() {
			$("#host_delete_model").modal("toggle");
		})
	});
	// 获取点击表格的td值
	var e = e || window.event;
	var target = e.target || e.srcElement;
	if (target.parentNode.tagName.toLowerCase() == "td") {
	tr = target.parentNode.parentNode;
	td = tr.cells;
	 for(var i = 0; i<td.length; i++ ){
	var td_host_name = td[0].innerHTML
	 }
	};
	$("#host_delete_data").val(td_host_name);
	$.ajax({
		url : vplxIp + "/all/delete/check",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp,
			iscsi_type:'Host',
			iscsi_name: td_host_name
		},
		async : false,
		success : function(host_result) {
			$("#host_delete_info").text(host_result['info']);
		},
	});
}

function affirm_delete(obj) {
	host_delete_name = $("#host_delete_data").val();
	$.ajax({
		url : vplxIp + "/all/delete",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp,
			iscsi_type:'Host',
			iscsi_name: host_delete_name
		},
		async : false,
		success : function(host_result) {
			alert(host_result);
			window.location.reload();
		},
	});
}


