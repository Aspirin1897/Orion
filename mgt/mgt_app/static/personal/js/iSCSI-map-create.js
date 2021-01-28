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
							write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
									'/hg/show/data', JSON
											.stringify(host_group_result));
							for (i in host_group_result) {
								tr = '<td >' + i + '</td>';
								$("#HG_T").append(
										'<tr onClick="change_hostgroup(this)" >'
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

function change_hostgroup(obj) {
	// 获取点击表格的td值
	var obj = [];
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML;
		$("#HG_T_Show").append(
				'<tr onClick="change_hostgroup_second(this)">' + tr + '</tr>');
		curRow.remove();// 删除
		var td = curRow.cells
		// for (var i = 0; i < td.length; i++) {
		var td_host = td[0].innerHTML
		// 获取hostgroup的值
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
				// write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
				// '/hg/show/data', JSON
				// .stringify(host_group_result));
				
				// 获取host的数据
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
						var obj_list = [];
						var obj_host_list = [];
						for (i=1; i < window.HGTable_Show.rows.length; i++) {
							obj_list.push(window.HGTable_Show.rows[i].cells[0].innerHTML);
						};
						for( i in obj_list){
							var aa = host_group_result[obj_list[i]];
							for (var j = 0; j <aa.length; j++) {
								obj_host_list.push(aa[j]);
							}
						}
						 var obj_host_list_new = obj_host_list.filter((e,i)=>obj_host_list.indexOf(e)==i)
						 $("#HostTable tr:not(:first)").html("");
						 for (var i = 0; i < obj_host_list_new.length; i++) {
						tr = '<td >' + obj_host_list_new[i] + '</td>' + '<td >'
						+ host_result[obj_host_list_new[i]]
						+ '</td>';
						$("#Host_T").append('<tr >' + tr + '</tr>')
						}
					},
				});
			},
			error : function() {
				write_to_log(tid, 'DATA', 'ROUTE', vplxIp, '/hg/show/data',
						'error');
			}

		});
	}
}

function change_hostgroup_second() {
	var obj = [];
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML
		$("#HG_T").append(
				'<tr onClick="change_hostgroup(this)" >' + tr + '</tr>')
		curRow.remove();
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
				// write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
				// '/hg/show/data', JSON
				// .stringify(host_group_result));
				
				// 获取host的数据
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
						var obj_list = [];
						var obj_host_list = [];
						for (i=1; i < window.HGTable_Show.rows.length; i++) {
							obj_list.push(window.HGTable_Show.rows[i].cells[0].innerHTML);
						};
						for( i in obj_list){
							var aa = host_group_result[obj_list[i]];
							for (var j = 0; j <aa.length; j++) {
								obj_host_list.push(aa[j]);
							}
						}
						 var obj_host_list_new = obj_host_list.filter((e,i)=>obj_host_list.indexOf(e)==i)
						 $("#HostTable tr:not(:first)").html("");
						 for (var i = 0; i < obj_host_list_new.length; i++) {
						tr = '<td >' + obj_host_list_new[i] + '</td>' + '<td >'
						+ host_result[obj_host_list_new[i]]
						+ '</td>';
						$("#Host_T").append('<tr >' + tr + '</tr>')
						}
					},
				});
			},
			error : function() {
				write_to_log(tid, 'DATA', 'ROUTE', vplxIp, '/hg/show/data',
						'error');
			}

		});
	}
}

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
				async : false,
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
						async : false,
						success : function(all_dg_result) {
							write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
									'/dg/show/data', JSON
											.stringify(all_dg_result));
							for (i in all_dg_result) {
								tr = '<td >' + i + '</td>';
								$("#DG_T").append(
										'<tr onClick="change_diskgroup(this)">'
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

function change_diskgroup(obj) {
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML;
		$("#DG_T_Show").append(
				'<tr onClick="change_diskgroup_second(this)">' + tr + '</tr>');
		curRow.remove();// 删除
			$.ajax({
				url : vplxIp + "/dg/show/data",
				type : "get",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				async : false,
				success : function(disk_group_result) {
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
							var resource_data = resource_result.data
							var obj_list = [];
							var obj_disk_list = [];
							for (i=1; i < window.DGTable_Show.rows.length; i++) {
								obj_list.push(window.DGTable_Show.rows[i].cells[0].innerHTML);
							};
							for( i in obj_list){
								var aa = disk_group_result[obj_list[i]];
								for (var j = 0; j <aa.length; j++) {
									obj_disk_list.push(aa[j]);
								}
							}
							 var obj_disk_list_new = obj_disk_list.filter((e,i)=>obj_disk_list.indexOf(e)==i)
							 $("#DiskTable tr:not(:first)").html("");
							 for (var i = 0; i < obj_disk_list_new.length; i++) {
								 for (var  j= 0;  j< resource_data.length; j++) {
									 if (obj_disk_list_new[i] == resource_data[j].resource) {
										 tr = '<td>' + resource_data[j].resource + '</td>' +'<td >'
										 + resource_data[j].device_name
										 + '</td>';
										 $("#Disk_T").append('<tr >' + tr + '</tr>')
									}
								}
							}
						}
					});
				},
				error : function() {
					write_to_log(tid, 'DATA', 'ROUTE', vplxIp, '/dg/show/data',
							'error');
				}

			});
	}
}

function change_diskgroup_second() {
	var obj = [];
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML
		$("#DG_T").append(
				'<tr onClick="change_diskgroup(this)" >' + tr + '</tr>')
		curRow.remove();
		$.ajax({
			url : vplxIp + "/dg/show/data",
			type : "get",
			dataType : "json",
			data : {
				tid : tid,
				ip : mgtIp
			},
			async : false,
			success : function(disk_group_result) {
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
						var resource_data = resource_result.data
						var obj_list = [];
						var obj_disk_list = [];
						for (i=1; i < window.DGTable_Show.rows.length; i++) {
							obj_list.push(window.DGTable_Show.rows[i].cells[0].innerHTML);
						};
						for( i in obj_list){
							var aa = disk_group_result[obj_list[i]];
							for (var j = 0; j <aa.length; j++) {
								obj_disk_list.push(aa[j]);
							}
						}
						 var obj_disk_list_new = obj_disk_list.filter((e,i)=>obj_disk_list.indexOf(e)==i)
						 $("#DiskTable tr:not(:first)").html("");
						 for (var i = 0; i < obj_disk_list_new.length; i++) {
							 for (var  j= 0;  j< resource_data.length; j++) {
								 if (obj_disk_list_new[i] == resource_data[j].resource) {
									 tr = '<td >' + resource_data[j].resource + '</td>' +'<td >'
									 + resource_data[j].device_name
									 + '</td>';
									 $("#Disk_T").append('<tr >' + tr + '</tr>')
								}
							}
						}
					}
				});
			},
			error : function() {
				write_to_log(tid, 'DATA', 'ROUTE', vplxIp, '/dg/show/data',
						'error');
			}

		});
		
		
		
	}
}

// 输入框验证
function map_name_myfunction() {
	document.getElementById("map_name_examine").className = "hidden";
	document.getElementById("map_name_format").className = "hidden";
	var input_result = $('#map_name').val();
	var map_name_match_regular = /^[a-zA-Z]\w*$/;
	match_result = map_name_match_regular.test(input_result)
	if (!input_result) {
		$("#map_name_hid").val("0");
		document.getElementById("map_name_examine").className = "hidden";
		document.getElementById("map_name_format").className = "hidden";
	} else {
		if (!match_result) {
			$("#map_name_hid").val("0");
			document.getElementById("map_name_format").className = "";
		} else {

			document.getElementById("map_name_format").className = "hidden";
			$
					.ajax({
						url : vplxIp + "/map/show/oprt",
						type : "GET",
						dataType : "json",
						data : {
							tid : tid,
							ip : mgtIp
						},
						async : false,
						success : function(map_result) {
							write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
									'/map/show/oprt', map_result);
							$
									.ajax({
										url : vplxIp + "/map/show/data",
										type : "GET",
										dataType : "json",
										data : {
											tid : tid,
											ip : mgtIp
										},
										async : false,
										success : function(Map_result) {
											write_to_log(tid, 'DATA', 'ROUTE',
													vplxIp, '/map/show/data',
													JSON.stringify(Map_result));
											if (JSON.stringify(Map_result) === '{}') {
												$("#map_name_hid").val("1");
											} else {
												for ( var i in Map_result) {
													if (input_result == i) {
														$("#map_name_hid").val("0");
														document
																.getElementById("map_name_examine").className = "";
														break;
													} else {
														$("#map_name_hid").val("1");
													}
												}
											}
										},
										error : function() {
											write_to_log(tid, 'DATA', 'ROUTE',
													vplxIp, '/map/show/data',
													'error');
										}

									});
						},
						error : function() {
							write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
									'/map/show/oprt', 'error');
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


$("#map_create").mousedown(function(){
			map_name_myfunction();
			var obj_diskgroup = [];
			var tableId = document.getElementById("HGTable_Show");
			var str = "";
			for (var i = 1; i < DGTable_Show.rows.length; i++) {
				obj_diskgroup.push(DGTable_Show.rows[i].cells[0].innerHTML)
			}
			obj_diskgroup_str = obj_diskgroup.toString();
			var obj_hostgroup = [];
			var tableId = document.getElementById("DGTable_Show");
			var str = "";
			for (var i = 1; i < HGTable_Show.rows.length; i++) {
				obj_hostgroup.push(HGTable_Show.rows[i].cells[0].innerHTML)
			}
			obj_hostgroup_str = obj_hostgroup.toString();

			var map_name = $("#map_name").val()
			var dict_data = JSON.stringify({
				"map_name" : map_name,
				"disk_group" : obj_diskgroup_str,
				"host_group" : obj_hostgroup_str
			});
			var map_name_hid_value = $("#map_name_hid").val();
			if (map_name_hid_value == "1") {
				write_to_log(tid, 'DATA', 'CHECKBOX', 'host group', '',
						obj_hostgroup_str);
				write_to_log(tid, 'DATA', 'CHECKBOX', 'disk group', '',
						obj_diskgroup_str);
				write_to_log(tid, 'OPRT', 'CLICK', 'map_create', 'accept',
						dict_data);
				$.ajax({
					url : vplxIp + "/map/create",
					type : "GET",
					data : {
						tid : tid,
						ip : mgtIp,
						map_name : map_name,
						disk_group : obj_diskgroup_str,
						host_group : obj_hostgroup_str
					},
					async : false,
					success : function(operation_feedback_prompt) {
						console.log(typeof(operation_feedback_prompt));
						if (operation_feedback_prompt == '0') {
							var text = "创建成功!";
							$('#P_text_success').text(text);
							div_success();
						}else {
							var text = "创建失败!";
							$('#P_text_failed').text(text);
							 div_failed();
						}
						write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
								'/map/create', JSON
										.stringify(operation_feedback_prompt));
						$("#map_name").val("");
						$("#map_name_hid").val("0");
					},
					error : function() {
						write_to_log(tid, 'OPRT', 'ROUTE', vplxIp,
								'/map/create', 'error');
					}
				})
			} else {
				write_to_log(tid, 'OPRT', 'CLICK', 'map_create', 'refuse',
						dict_data);
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


map_table();
function map_table() {
	$.ajax({
		url : vplxIp + "/map/show/oprt",
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
				url : vplxIp + "/map/show/data",
				type : "GET",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				async : false,
				success : function(map_result) {
					write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
							'/host/show/data', JSON.stringify(map_result));
					for (i in map_result) {
						tr = '<td >' + i + '</td>' + '<td >' + map_result[i]['HostGroup']
								+ '</td>'+ '<td >' + map_result[i]['DiskGroup']
								+ '</td>'+'<td>'+
								'<button  onClick="map_compile(this);">编辑</button>'+'<button  onClick="btn_show_delete(this);">删除</button>'
								+ '</td>';
						$("#Map_Table_Show").append('<tr>' + tr + '</tr>')
					}
				},
				error : function() {
					write_to_log(tid, 'DATA', 'ROUTE', vplxIp,
							'/map/show/data', 'error');
				}

			});
		},
		error : function() {
			write_to_log(tid, 'DATA', 'ROUTE', vplxIp, '/map/show/oprt',
					'error');
		}
	});
};




function map_compile(obj) {
	// 弹出框
	$('tr').each(function() {
		$(this).on("click", function() {
			$("#map_model").modal("toggle");
		})
	});
	// 获取点击表格的td值
	var e = e || window.event;
	var target = e.target || e.srcElement;
	if (target.parentNode.tagName.toLowerCase() == "td") {
	tr = target.parentNode.parentNode;
	td = tr.cells;
	 for(var i = 0; i<td.length; i++ ){
	var td_map_name = td[0].innerHTML
	 var td_hg = td[1].innerHTML
	 var td_dg = td[2].innerHTML
	 }
	}
	td_hg = td_hg.split(",");
	td_dg = td_dg.split(",");
	$("#map_key_hid").val(td_map_name);
	$("#map_name_text").text(td_map_name);
	// 获取hostgroup的值
	$.ajax({
		url : vplxIp + "/hg/show/oprt",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp
		},
		async : false,
		success : function(host_group_result) {
			$.ajax({
				url : vplxIp + "/hg/show/data",
				type : "get",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				async : false,
				success : function(hg_result) {
					// 对象取键然后转列表
					var list_hg = []
					for ( var i in hg_result) {
						list_hg.push(i);
					}
					// 表格清空刷新
					$("#HGTable_second_all tr:not(:first)").html("");
					$("#HGTable_second tr:not(:first)").html("");
					for ( var j in td_hg) {
						// 已选择
						tr = '<td >'
						+ td_hg[j] + '</td>';
						$("#HGTable_second_T").append(
						'<tr onClick="hg_select(this)">'
								+ tr + '</tr>')
					}
					// 列表对比去重
					let new_list = list_hg.filter(items => {
						  if (!td_hg.includes(items)) return items;
						})
						// 放入表格
					for (var i = 0; i < new_list.length; i++) {
						tr =  '<td >'
							+ new_list[i] + '</td>';
					$("#HGTable_second_all_show").append(
							'<tr onClick="hg_select_second(this)">'
									+ tr + '</tr>')
					}
				},
			});
		},
	});
	
	$.ajax({
		url : vplxIp + "/dg/show/oprt",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp
		},
		async : false,
		success : function(disk_group_result) {
			$.ajax({
				url : vplxIp + "/dg/show/data",
				type : "get",
				dataType : "json",
				data : {
					tid : tid,
					ip : mgtIp
				},
				async : false,
				success : function(dg_result) {
					// 对象取键然后转列表
					var list_dg = []
					for ( var i in dg_result) {
						list_dg.push(i);
					}
					// 表格清空刷新
					$("#DGTable_second_all tr:not(:first)").html("");
					$("#DGTable_second tr:not(:first)").html("");
					for ( var j in td_dg) {
						// 已选择
						tr = '<td >'
						+ td_dg[j] + '</td>';
						$("#DGTable_second_T").append(
						'<tr onClick="dg_select(this)">'
								+ tr + '</tr>')
					}
					// 列表对比去重
					let new_list = list_dg.filter(items => {
						  if (!td_dg.includes(items)) return items;
						})
						// 放入表格
					for (var i = 0; i < new_list.length; i++) {
						tr =  '<td >'
							+ new_list[i] + '</td>';
					$("#DGTable_second_all_show").append(
							'<tr onClick="dg_select_second(this)">'
									+ tr + '</tr>')
					}
				},
			});
		},
	});
}


// 返回按钮进行刷新当前页面
function hg_select(obj) {
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML;
		$("#HGTable_second_all_show").append(
				'<tr onClick="hg_select_second(this)">' + tr + '</tr>');
		curRow.remove();// 删除
	}
}


function hg_select_second(obj) {
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML;
		$("#HGTable_second_T").append(
				'<tr onClick="hg_select(this)">' + tr + '</tr>');
		curRow.remove();// 删除
	}
}
//返回按钮进行刷新当前页面
function dg_select(obj) {
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML;
		$("#DGTable_second_all_show").append(
				'<tr onClick="dg_select_second(this)">' + tr + '</tr>');
		curRow.remove();// 删除
	}
}


function dg_select_second(obj) {
	if (event.srcElement.tagName == "TD") {
		curRow = event.srcElement.parentElement;
		tr = curRow.innerHTML;
		$("#DGTable_second_T").append(
				'<tr onClick="dg_select(this)">' + tr + '</tr>');
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
	$('#map_info_model').modal("show");
	
	var obj_hg = [];
	var str = "";
	for (var i = 1; i < HGTable_second.rows.length; i++) {
		obj_hg.push(HGTable_second.rows[i].cells[0].innerHTML)
	}
	var obj_dg = [];
	var str = "";
	for (var i = 1; i < DGTable_second.rows.length; i++) {
		obj_dg.push(DGTable_second.rows[i].cells[0].innerHTML)
	}
	
	obj_hg_str = obj_hg.toString();
	obj_dg_str = obj_dg.toString();
	var map_name = $("#map_key_hid").val()
	
	$("#map_name_hidden").val(map_name);
	$("#hg_hidden").val(obj_hg_str);
	$("#dg_hidden").val(obj_dg_str);
	
// var dict_data = JSON.stringify({
// "hg_name" : hg_name,
// "host" : obj_host_str
// });
	$.ajax({
		url : vplxIp + "/map/modify/check",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			map_name:map_name,
			hg: obj_hg_str,
			dg: obj_dg_str
		},
		async : false,
		success : function(map_result) {
			$("#map_info_result").text(map_result['info']);
		},
	});
// window.location.reload();
}

function affirm_modifiy_second(obj){
	map_name = $("#map_name_hidden").val();
	obj_hg_str = $("#hg_hidden").val();
	obj_dg_str = $("#dg_hidden").val();
	$.ajax({
		url : vplxIp + "/map/modify",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp,
			map_name: map_name,
			hg: obj_hg_str,
			dg: obj_dg_str
		},
		async : false,
		success : function(map_result) {
			alert(map_result);
			window.location.reload();
		},
	});
}



function btn_show_delete(obj) {
	
	$('tr').each(function() {
		$(this).on("click", function() {
			$("#map_delete_model").modal("toggle");
		})
	});
	// 获取点击表格的td值
	var e = e || window.event;
	var target = e.target || e.srcElement;
	if (target.parentNode.tagName.toLowerCase() == "td") {
	tr = target.parentNode.parentNode;
	td = tr.cells;
	 for(var i = 0; i<td.length; i++ ){
	var td_map_name = td[0].innerHTML
	 }
	};
	$("#map_delete_data").val(td_map_name);
	$.ajax({
		url : vplxIp + "/all/delete/check",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp,
			iscsi_type:'Map',
			iscsi_name: td_map_name
		},
		async : false,
		success : function(map_result) {
			$("#map_delete_info").text(map_result['info']);
		},
	});
}

function affirm_delete(obj) {
	map_delete_name = $("#map_delete_data").val();
	$.ajax({
		url : vplxIp + "/all/delete",
		type : "get",
		dataType : "json",
		data : {
			tid : tid,
			ip : mgtIp,
			iscsi_type:'Map',
			iscsi_name: map_delete_name
		},
		async : false,
		success : function(map_result) {
			alert(map_result);
			window.location.reload();
		},
	});
}









