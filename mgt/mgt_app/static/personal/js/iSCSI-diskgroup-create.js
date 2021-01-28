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

// disk_table();
// function disk_table() {
// $.ajax({
// url : vplxIp + "/disk/show/oprt",
// type : "GET",
// dataType : "json",
// data : {
// tid : tid,
// ip : mgtIp
// },
// success : function(status) {
// write_to_log(tid, 'OPRT', 'ROUTE', vplxIp, '/disk/show/oprt',
// status);
// $.ajax({
// url : vplxIp + "/disk/show/data",
// type : "GET",
// dataType : "json",
// data : {
// tid : tid,
// ip : mgtIp
// },
// success : function(disk_result) {
// write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
// '/disk/show/data', JSON.stringify(disk_result));
// // var _data = data.data; //由于后台传过来的json有个data，在此重命名
// for (i in disk_result) {
// tr = '<td >' + i + '</td>' + '<td >' + i + '</td>'
// $("#D_T").append(
// '<tr onClick="change_disk(this)" >' + tr
// + '</tr>')
// }
// },
// error : function() {
// write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
// '/disk/show/data', 'error');
// }
// });
// },
// error : function() {
// write_to_log(tid, 'OPRT', 'ROUTE', vplxIp, '/disk/show/oprt',
// 'error');
// }
// });
// };

// function change_disk(obj) {
// if (event.srcElement.tagName == "TD") {
// curRow = event.srcElement.parentElement;
// tr = curRow.innerHTML;
//		
// $("#D_T_Show").append(
// '<tr onClick="change_disk_second(this)">' + tr + '</tr>');
// curRow.remove();// 删除
// }
// }
disk_table();
function disk_table() {
	$.ajax({
		url : vplxIp + "/resource/show/oprt",
		type : "GET",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp
		},
		async : false,
		success : function(status) {
			write_to_log(tid, 'OPRT', 'ROUTE', vplxIp, '/resource/show/oprt',
					status);
			$.ajax({
				url : vplxIp + "/resource/show/data",
				type : "GET",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				async : false,
				success : function(resource_result) {
					write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
							'/resource/show/data', JSON.stringify(resource_result));
					 var _data = resource_result.data; // 由于后台传过来的json有个data，在此重命名
					for (i in _data) {
						tr = '<td >' + _data[i].resource + '</td>' + '<td >' + _data[i].size + '</td>'
						$("#D_T").append(
								'<tr onClick="change_disk(this)" >' + tr
										+ '</tr>')
					}
				},
				error : function() {
					write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
							'/disk/show/data', 'error');
				}
			});
		},
		error : function() {
			write_to_log(tid, 'OPRT', 'ROUTE', vplxIp, '/disk/show/oprt',
					'error');
		}
	});
};

function change_disk(obj) {
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML;
		$("#D_T_Show").append(
				'<tr onClick="change_disk_second(this)">' + tr + '</tr>');
		curRow.remove();// 删除
		var td = curRow.cells
		var td_host = td[0].innerHTML
			console.log(td_host);
			$.ajax({
				url : vplxIp + "/resource/show/data",
				type : "get",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				async : false,
				success : function(resource_result) {
					console.log(resource_result);
					 var _data = resource_result.data; // 由于后台传过来的json有个data，在此重命名
							for (i in _data) {
								if (td_host == _data[i].resource) {
									tr = '<td >' + _data[i].device_name + '</td>'
									$("#D_Dev_T_Show").append(
											'<tr>' + tr
											+ '</tr>')
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

function change_disk_second() {
	var obj_list = [];
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML
		$("#D_T").append('<tr onClick="change_disk(this)" >' + tr + '</tr>')
		curRow.remove();
		// var count=0;
		for (i=1; i < window.DTable_Show.rows.length; i++) {
			obj_list.push(window.DTable_Show.rows[i].cells[0].innerHTML) 
		}
		$("#D_Dev_Table_Show tr:not(:first)").html("");
			$.ajax({
				url : vplxIp + "/resource/show/data",
				type : "get",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				async : false,
				success : function(resource_result) {
					 var _data = resource_result.data; // 由于后台传过来的json有个data，在此重命名
					 for(i in obj_list){
							for (j in _data) {
								if (obj_list[i] == _data[j].resource) {
									tr = '<td >' + _data[j].device_name + '</td>'
									$("#D_Dev_T_Show").append(
											'<tr>' + tr
											+ '</tr>')
								}
							} 
						 
					 }
					 write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
					 '/dg/show/data', JSON
					 .stringify(host_group_result));
				},
				error : function() {
					write_to_log(tid, 'DATA', 'ROUTE', vplxIp, '/dg/show/data',
							'error');
				}

			});
		
		
		
	}
}
// 输入框验证
function dg_name_myfunction() {
	document.getElementById("dg_name_examine").className = "hidden";
	document.getElementById("dg_name_format").className = "hidden";
	var input_result = $('#disk_group_name').val();
	var dg_name_match_regular = /^[a-zA-Z]\w*$/;
	match_result = dg_name_match_regular.test(input_result)
	if (!input_result) {
		$("#dg_name_hid").val("0");
		document.getElementById("dg_name_examine").className = "hidden";
		document.getElementById("dg_name_format").className = "hidden";
	} else {
		if (!match_result) {
			$("#dg_name_hid").val("0");
			document.getElementById("dg_name_format").className = "";
		} else {
			document.getElementById("dg_name_format").className = "hidden";
			$
					.ajax({
						url : vplxIp + "/dg/show/oprt",
						type : "GET",
						dataType : "json",
						data : {
							tid : tid,
							ip : mgtIp
						},
						async : false,
						success : function(DG_result) {
							write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
									'/dg/show/oprt', DG_result);
							$
									.ajax({
										url : vplxIp + "/dg/show/data",
										type : "GET",
										dataType : "json",
										data : {
											tid : tid,
											ip : mgtIp
										},
										async : false,
										success : function(DG_result) {
											write_to_log(tid, 'DATA', 'ROUTE',
													vplxIp, '/dg/show/data',
													JSON.stringify(DG_result));
											
											if (JSON.stringify(DG_result) === '{}') {
												$("#dg_name_hid").val("1");
											} else {
												for ( var i in DG_result) {
													if (input_result == i) {
														$("#dg_name_hid").val("0");
														document
														.getElementById("dg_name_examine").className = "";
														break;
													} else {
														$("#dg_name_hid").val("1");
													}
												}
											}
										},
										error : function() {
											write_to_log(tid, 'DATA', 'ROUTE',
													vplxIp, '/dg/show/data',
													'error');
										}
									});
						},
						error : function() {
							write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
									'/dg/show/oprt', 'error');
						}
					});
		}
	}
}

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


$("#disk_group_create").mousedown(function(){
			dg_name_myfunction();
			var obj_disk = [];
			var tableId = document.getElementById("DTable_Show");
			var str = "";
			for (var i = 1; i < DTable_Show.rows.length; i++) {
				obj_disk.push(DTable_Show.rows[i].cells[0].innerHTML)
			}
			obj_disk_str = obj_disk.toString();
			var disk_group_name = $("#disk_group_name").val()
			var dict_data = JSON.stringify({
				"disk_group_name" : disk_group_name,
				"disk" : obj_disk_str
			});
			var dg_name_hid_value = $("#dg_name_hid").val();
			if (dg_name_hid_value == "1") {
				write_to_log(tid, 'DATA', 'RADIO', 'disk', '', obj_disk_str);
				write_to_log(tid, 'OPRT', 'CLICK', 'disk_group_create',
						'accept', dict_data);
				$.ajax({
					url : vplxIp + "/dg/create",
					type : "GET",
					data : {
						tid : tid,
						ip : mgtIp,
						disk_group_name : disk_group_name,
						disk : obj_disk_str
					},
					async : false,
					success : function(operation_feedback_prompt) {
						if (operation_feedback_prompt == '0') {
							var text = "创建成功!";
							$('#P_text_success').text(text);
							div_success();
							$("#Disk_Table tr:not(:first)").html("");
							Dg_Table();
						}else {
							var text = "创建失败!";
							$('#P_text_failed').text(text);
							 div_failed();
						}
						
						write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
								'/dg/create', operation_feedback_prompt);
						$("#disk_group_name").val("");
						$("#dg_name_hid").val("0");
					},
					error : function() {
						write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
								'/dg/create', 'error');
					}
				})
			} else {
				write_to_log(tid, 'OPRT', 'CLICK', 'disk_group_create',
						'refuse', dict_data);
			}
		});


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

Dg_Table();
function Dg_Table() {
	$
			.ajax({
				url : vplxIp + "/dg/show/oprt",
				type : "get",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				success : function(status) {
					write_to_log(tid, 'OPRT', 'ROUTE', vplxIp, '/dg/show/oprt',
							status);
					$.ajax({
						url : vplxIp + "/dg/show/data",
						type : "get",
						dataType : "json",
						data : {
							tid : tid,
							ip : mgtIp
						},
						success : function(all_dg_result) {
							write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
									'/dg/show/data', JSON
											.stringify(all_dg_result));
							for (i in all_dg_result) {
								tr = '<td >' + i + '</td>'+
								 '<td >' + all_dg_result[i] + '</td>'+'<td>'+
									'<button  onClick="disk_compile(this);">编辑</button>'+'<button  onClick="btn_show_delete(this);">删除</button>'
									+ '</td>';
								$("#Disk_Table_Show").append(
										'<tr >'
												+ tr + '</tr>')
							}
						},
						error : function() {
							write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
									'/dg/show/data', 'error');
						}
					});
				},
				error : function() {
					write_to_log(tid, 'OPRT', 'ROUTE', vplxIp, '/dg/show/oprt',
							'error');
				}

			});
};

function disk_compile(obj) {
	// 弹出框
	$('tr').each(function() {
		$(this).on("click", function() {
			$("#disk_model").modal("toggle");
		})
	});
	// 获取点击表格的td值
	var e = e || window.event;
	var target = e.target || e.srcElement;
	if (target.parentNode.tagName.toLowerCase() == "td") {
	tr = target.parentNode.parentNode;
	td = tr.cells;
	 for(var i = 0; i<td.length; i++ ){
	var td_dg_name = td[0].innerHTML
	 var td_disk = td[1].innerHTML
	 }
	}
	td_disk = td_disk.split(",");
	$("#disk_key_hid").val(td_dg_name);
	$("#dg_name_text").text(td_dg_name);
	// 获取hostgroup的值
	$.ajax({
		url : vplxIp + "/disk/show/oprt",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp
		},
		async : false,
		success : function(disk_group_result) {
			$.ajax({
				url : vplxIp + "/disk/show/data",
				type : "get",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				async : false,
				success : function(disk_result) {
					// 对象取键然后转列表
					var list_disk = []
					for ( var i in disk_result) {
						list_disk.push(i);
//						for(var ii in disk_result[i]){
//							res.push(disk_result[i][ii]);
////							var list_disk = res.filter((e,i)=>res.indexOf(e)==i)
//						}
					}
					// 表格清空刷新
					$("#DTable_second_all tr:not(:first)").html("");
					$("#DTable_second tr:not(:first)").html("");
					for ( var j in td_disk) {
						// 已选择
						tr = '<td >'
						+ td_disk[j] + '</td>';
						$("#DTable_second_T").append(
						'<tr onClick="disk_select(this)">'
								+ tr + '</tr>')
					}
					// 列表对比去重
					let new_list = list_disk.filter(items => {
						  if (!td_disk.includes(items)) return items;
						})
						// 放入表格
					for (var i = 0; i < new_list.length; i++) {
						tr =  '<td >'
							+ new_list[i] + '</td>';
					$("#DTable_second_all_show").append(
							'<tr onClick="disk_select_second(this)">'
									+ tr + '</tr>')
					}
				},
			});
		},

	});
}


// 返回按钮进行刷新当前页面
function disk_select(obj) {
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML;
		$("#DTable_second_all_show").append(
				'<tr onClick="disk_select_second(this)">' + tr + '</tr>');
		curRow.remove();// 删除
	}
}


function disk_select_second(obj) {
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML;
		$("#DTable_second_T").append(
				'<tr onClick="disk_select(this)">' + tr + '</tr>');
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
	$('#disk_info_model').modal("show");
	
	var obj_disk = [];
	var str = "";
	for (var i = 1; i < DTable_second.rows.length; i++) {
		obj_disk.push(DTable_second.rows[i].cells[0].innerHTML)
	}
	obj_disk_str = obj_disk.toString();
	var dg_name = $("#disk_key_hid").val()
	
	$("#dg_name_hidden").val(dg_name);
	$("#disk_hidden").val(obj_disk_str);
	
// var dict_data = JSON.stringify({
// "hg_name" : hg_name,
// "host" : obj_host_str
// });
	$.ajax({
		url : vplxIp + "/dg/modify/check",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			dg_name: dg_name,
			disk: obj_disk_str
		},
		async : false,
		success : function(dg_result) {
			$("#dg_info_result").text(dg_result['info']);
		},
	});
// window.location.reload();
}

function affirm_modifiy_second(obj){
	dg_name = $("#dg_name_hidden").val();
	obj_disk_str = $("#disk_hidden").val();
	$.ajax({
		url : vplxIp + "/dg/modify",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp,
			dg_name: dg_name,
			disk: obj_disk_str
		},
		async : false,
		success : function(dg_result) {
			alert(dg_result);
			window.location.reload();
		},
	});
}


function btn_show_delete(obj) {
	
	$('tr').each(function() {
		$(this).on("click", function() {
			$("#dg_delete_model").modal("toggle");
		})
	});
	// 获取点击表格的td值
	var e = e || window.event;
	var target = e.target || e.srcElement;
	if (target.parentNode.tagName.toLowerCase() == "td") {
	tr = target.parentNode.parentNode;
	td = tr.cells;
	 for(var i = 0; i<td.length; i++ ){
	var td_dg_name = td[0].innerHTML
	 }
	};
	$("#dg_delete_data").val(td_dg_name);
	$.ajax({
		url : vplxIp + "/all/delete/check",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp,
			iscsi_type:'DiskGroup',
			iscsi_name: td_dg_name
		},
		async : false,
		success : function(dg_result) {
			$("#dg_delete_info").text(dg_result['info']);
		},
	});
}

function affirm_delete(obj) {
	dg_delete_name = $("#dg_delete_data").val();
	$.ajax({
		url : vplxIp + "/all/delete",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp,
			iscsi_type:'DiskGroup',
			iscsi_name: dg_delete_name
		},
		async : false,
		success : function(dg_result) {
			alert(dg_result);
			window.location.reload();
		},
	});
}









