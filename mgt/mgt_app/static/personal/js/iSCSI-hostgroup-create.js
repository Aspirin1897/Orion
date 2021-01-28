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

host_table();
function host_table() {
	$.ajax({
		url : vplxIp + "/host/show/oprt",
		type : "GET",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp
		},
		async : false,
		success : function(status) {
			write_to_log(tid, 'OPRT', 'ROUTE', vplxIp, '/host/show/oprt',
					status);
			$.ajax({
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
							'/host/show/data', JSON.stringify(host_result));
					for (i in host_result) {
						tr = '<td >' + i + '</td>'
						$("#H_T").append(
								'<tr onClick="change_host(this)" >' + tr + '</tr>')
					}
				},
				error : function() {
					write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
							'/host/show/data', 'error');
				}

			});
		},
		error : function() {
			write_to_log(tid, 'DATA', 'ROUTE', vplxIp, '/host/show/oprt',
					'error');
		}
	});
};

function change_host(obj) {
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML;
		$("#H_T_Show").append(
				'<tr onClick="change_host_second(this)">' + tr + '</tr>');
		curRow.remove();// 删除
		var td = curRow.cells;
		var td_host = td[0].innerHTML;
			$.ajax({
				url : vplxIp + "/host/show/data",
				type : "get",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				async : false,
				success : function(host_result) {
					// write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
					// '/hg/show/data', JSON
					// .stringify(host_group_result));
					for (j in host_result) {
						if (td_host == j) {
							var iqn = host_result[j]
			// $("#H_IQN_Table_Show tr:not(:first)").html("");
								tr = '<td >' + iqn + '</td>';
								$("#H_IQN_T_Show").append('<tr >' + tr + '</tr>')
						}
					}
				},
				error : function() {
					write_to_log(tid, 'DATA', 'ROUTE', vplxIp, '/dg/show/data',
							'error');
				}

			});
	}
}
// var td = curRow.cells
// for(var i = 0; i<td.length; i++ ){
// var bb = td[i].innerHTML
// obj.push(bb);
// $("#H_T_Show").append(obj);
// alert(obj);
// }
// if (curRow.style.background) {//变颜色
// curRow.style.background="";
// }else {
// curRow.style.background="blue";
// }
//
function change_host_second() {
	var obj_list = [];
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML
		$("#H_T").append('<tr onClick="change_host(this)" >' + tr + '</tr>')
		curRow.remove();
		// var count=0;
		for (i=1; i < window.HTable_Show.rows.length; i++) {
		for (j=0; j < window.HTable_Show.rows[i].cells.length; j++) { 
			obj_list.push(window.HTable_Show.rows[i].cells[j].innerHTML) 
			}
		}
		$("#H_IQN_Table_Show tr:not(:first)").html("");
		
			$.ajax({
				url : vplxIp + "/host/show/data",
				type : "get",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				async : false,
				success : function(host_result) {
					for ( i in obj_list) {
						var iqn = host_result[obj_list[i]];
							tr = '<td >' + iqn + '</td>';
							$("#H_IQN_T_Show").append('<tr >' + tr + '</tr>')
					}
					 write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
					 '/hg/show/data', JSON
					 .stringify(host_result));
				},
				error : function() {
					write_to_log(tid, 'DATA', 'ROUTE', vplxIp, '/dg/show/data',
							'error');
				}

			});

		
	}
}


// 获取表格td值
// function numberCells() {
// var obj_list = [];
// var count=0;
// for (i=1; i < window.HTable_Show.rows.length; i++) {
// for (j=0; j < window.HTable_Show.rows[i].cells.length; j++) {
// obj_list.push(window.HTable_Show.rows[i].cells[j].innerHTML)
// }
// }
// alert(obj_list);
// }
function div_success() {
	document.getElementById('light_success').style.display='block';
	setTimeout("light_success.style.display='none'",2000);
}

function div_failed() {
	document.getElementById('light_failed').style.display='block';
	document.getElementById('fade').style.display='block';
	setTimeout("light_failed.style.display='none'",4000);
	setTimeout("fade.style.display='none'",4000);
}


$("#host_group_create").mousedown(function(){
			hg_name_myfunction();
			var obj_host = [];
			var tableId = document.getElementById("HTable_Show");
			var str = "";
			for (var i = 1; i < HTable_Show.rows.length; i++) {
				obj_host.push(HTable_Show.rows[i].cells[0].innerHTML)
			}
			obj_host_str = obj_host.toString();
			var host_group_name = $("#host_group_name").val()
			var dict_data = JSON.stringify({
				"host_group_name" : host_group_name,
				"host" : obj_host_str
			});
			var hg_name_hid_value = $("#hg_name_hid").val();
			
			if (hg_name_hid_value == "1") {
				$.ajax({
					url : vplxIp + "/hg/create",
					type : "GET",
					data : {
						tid : tid,
						ip : mgtIp,
						host_group_name : host_group_name,
						host : obj_host_str
					},
					async : false,
					success : function(operation_feedback_prompt) {
						if (operation_feedback_prompt == '0') {
							var text = "创建成功!";
							$('#P_text_success').text(text);
							div_success();
							$("#HostGroup_Table tr:not(:first)").html("");
							host_table();
						}else {
							var text = "创建失败!";
							$('#P_text_failed').text(text);
							 div_failed();
						}
						write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
								'/hg/create', operation_feedback_prompt);
						$("#host_group_name").val("");
						$("#hg_name_hid").val("0");
					},
					error : function() {
						write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
								'/hg/create', 'error');

					}
				})
			} else {
				write_to_log(tid, 'OPRT', 'CLICK', 'host_group_create',
						'refuse', dict_data);
			}

		});






// 输入框验证
function hg_name_myfunction() {
	document.getElementById("hg_name_examine").className = "hidden";
	document.getElementById("hg_name_format").className = "hidden";
	var input_result = $('#host_group_name').val();
	var hg_name_match_regular = /^[a-zA-Z]\w*$/;
	match_result = hg_name_match_regular.test(input_result)
	if (!input_result) {
		$("#hg_name_hid").val("0");
		document.getElementById("hg_name_examine").className = "hidden";
		document.getElementById("hg_name_format").className = "hidden";

	} else {
		if (!match_result) {
			$("#hg_name_hid").val("0");
			document.getElementById("hg_name_format").className = "";
		} else {
			document.getElementById("hg_name_format").className = "hidden";
			$
					.ajax({
						url : vplxIp + "/hg/show/oprt",
						type : "GET",
						dataType : "json",
						data : {
							tid : tid,
							ip : mgtIp
						},
						async : false,
						success : function(HG_result) {
							write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
									'/hg/show/oprt', HG_result);
							$
									.ajax({
										url : vplxIp + "/hg/show/data",
										type : "GET",
										dataType : "json",
										data : {
											tid : tid,
											ip : mgtIp
										},
										async : false,
										success : function(HG_result_data) {
											write_to_log(
													tid,
													'DATA',
													'ROUTE',
													vplxIp,
													'/hg/show/data',
													JSON
													.stringify(HG_result_data));
											if (JSON.stringify(HG_result_data) === '{}') {
												$("#hg_name_hid").val("1");
											}else {
												for ( var i in HG_result_data) {
													if (input_result == i) {
														$("#hg_name_hid").val("0");
														document
																.getElementById("hg_name_examine").className = "";
														break;
													} else {
														$("#hg_name_hid").val("1");
													}
													
												}
												
											}
											
										},
										error : function() {
											write_to_log(tid, 'DATA', 'ROUTE',
													vplxIp, '/hg/show/data',
													'error');
										}
									});

						},
						error : function() {
							write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
									'/hg/show/oprt', 'error');
						}
					});
		}
	};
}

$(function () { $("[data-toggle='popover']").popover(); });

$("[rel=drevil]").popover({
    trigger:'manual',
    html: 'true', 
    animation: false
}).on("mouseenter", function () {
    var _this = this;
    $(this).popover("show");
    $(this).siblings(".popover").on("mouseleave", function () {
        $(_this).popover('hide');
    });
}).on("mouseleave", function () {
    var _this = this;
    setTimeout(function () {
        if (!$(".popover:hover").length) {
            $(_this).popover("hide")
        }
    }, );
});　

hg_table();
function hg_table() {
	$
			.ajax({
				url : vplxIp + "/hg/show/oprt",
				type : "get",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				async : false,
				success : function(status) {
					write_to_log(tid, 'OPRT', 'ROUTE', vplxIp, '/hg/show/oprt',
							status);
					$.ajax({
						url : vplxIp + "/hg/show/data",
						type : "get",
						dataType : "json",
						data : {
							tid : tid,
							ip : mgtIp
						},
						async : false,
						success : function(host_group_result) {
							console.log(host_group_result);
							$("#Host_Group_Table_Show tr:not(:first)").html("");
							
							write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
									'/hg/show/data', JSON
											.stringify(host_group_result));
							for (i in host_group_result) {
								tr = '<td >' + i + '</td>'+
								'<td>' + host_group_result[i] + '</td>'+'<td>'+
								'<button  onClick="host_compile(this);">编辑</button>'+'<button  onClick="btn_show_delete(this);">删除</button>'
								+ '</td>';
								$("#Host_Group_Table_Show").append(
										'<tr>'
												+ tr + '</tr>')
							}
						},
						error : function() {
							write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
									'/hg/show/data', 'error');
						}

					});

				},
				error : function() {
					write_to_log(tid, 'OPRT', 'ROUTE', vplxIp, '/hg/show/oprt',
							'error');
				}
			});
};

function host_compile(obj) {
	// 弹出框
	$('tr').each(function() {
		$(this).on("click", function() {
			$("#hg_model").modal("toggle");
		})
	});
	// 获取点击表格的td值
	var e = e || window.event;
	var target = e.target || e.srcElement;
	if (target.parentNode.tagName.toLowerCase() == "td") {
	tr = target.parentNode.parentNode;
	td = tr.cells;
	 for(var i = 0; i<td.length; i++ ){
	var td_hg_name = td[0].innerHTML
	 var td_host = td[1].innerHTML
	 }
	}
	td_host = td_host.split(",");
	$("#host_key_hid").val(td_hg_name);
	$("#hg_name_text").text(td_hg_name);
	// 获取hostgroup的值
	$.ajax({
		url : vplxIp + "/host/show/oprt",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp
		},
		async : false,
		success : function(host_group_result) {
			$.ajax({
				url : vplxIp + "/host/show/data",
				type : "get",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				async : false,
				success : function(host_result) {
					// 对象取键然后转列表
					var list_host = []
					for ( var i in host_result) {
						list_host.push(i);
					}
					// 表格清空刷新
					$("#HTable_second_all tr:not(:first)").html("");
					$("#HTable_second tr:not(:first)").html("");
					for ( var j in td_host) {
						// 已选择
						tr = '<td >'
						+ td_host[j] + '</td>';
						$("#HTable_second_T").append(
						'<tr onClick="host_select(this)">'
								+ tr + '</tr>')
					}
					// 列表对比去重
					let new_list = list_host.filter(items => {
						  if (!td_host.includes(items)) return items;
						})
						// 放入表格
					for (var i = 0; i < new_list.length; i++) {
						tr =  '<td >'
							+ new_list[i] + '</td>';
					$("#HTable_second_all_show").append(
							'<tr onClick="host_select_second(this)">'
									+ tr + '</tr>')
					}
				},
			});
		},

	});
}


// 返回按钮进行刷新当前页面
function host_select(obj) {
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML;
		$("#HTable_second_all_show").append(
				'<tr onClick="host_select_second(this)">' + tr + '</tr>');
		curRow.remove();// 删除
	}
}


function host_select_second(obj) {
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML;
		$("#HTable_second_T").append(
				'<tr onClick="host_select(this)">' + tr + '</tr>');
		curRow.remove();// 删除
	}
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

function affirm_modifiy(obj){
	// 打开二次确认弹窗
	$('#hg_info_model').modal("show");
	
	var obj_host = [];
	var str = "";
	for (var i = 1; i < HTable_second.rows.length; i++) {
		obj_host.push(HTable_second.rows[i].cells[0].innerHTML)
	}
	obj_host_str = obj_host.toString();
	var hg_name = $("#host_key_hid").val()
	
	$("#hg_name_hidden").val(hg_name);
	$("#host_hidden").val(obj_host_str);
	
// var dict_data = JSON.stringify({
// "hg_name" : hg_name,
// "host" : obj_host_str
// });
	$.ajax({
		url : vplxIp + "/hg/modify/check",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			hg_name: hg_name,
			host: obj_host_str
		},
		async : false,
		success : function(hg_result) {
			$("#hg_info_result").text(hg_result['info']);
		},
	});
// window.location.reload();
}

function affirm_modifiy_second(obj){
	hg_name = $("#hg_name_hidden").val();
	obj_host_str = $("#host_hidden").val();
	$.ajax({
		url : vplxIp + "/hg/modify",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp,
			hg_name: hg_name,
			host: obj_host_str
		},
		async : false,
		success : function(hg_result) {
			alert(hg_result);
			window.location.reload();
		},
	});
}


function btn_show_delete(obj) {
	
	$('tr').each(function() {
		$(this).on("click", function() {
			$("#hg_delete_model").modal("toggle");
		})
	});
	// 获取点击表格的td值
	var e = e || window.event;
	var target = e.target || e.srcElement;
	if (target.parentNode.tagName.toLowerCase() == "td") {
	tr = target.parentNode.parentNode;
	td = tr.cells;
	 for(var i = 0; i<td.length; i++ ){
	var td_hg_name = td[0].innerHTML
	 }
	};
	$("#hg_delete_data").val(td_hg_name);
	$.ajax({
		url : vplxIp + "/all/delete/check",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp,
			iscsi_type:'HostGroup',
			iscsi_name: td_hg_name
		},
		async : false,
		success : function(hg_result) {
			$("#hg_delete_info").text(hg_result['info']);
		},
	});
}

function affirm_delete(obj) {
	hg_delete_name = $("#hg_delete_data").val();
	$.ajax({
		url : vplxIp + "/all/delete",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp,
			iscsi_type:'HostGroup',
			iscsi_name: hg_delete_name
		},
		async : false,
		success : function(hg_result) {
			alert(hg_result);
			window.location.reload();
		},
	});
}
