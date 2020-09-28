$('#R-S').selectpicker({
	width : 200
});
$(function() {
	$.ajax({
		url : "/resource_data",
		type : "get",
		dataType : "json",
		success : function(R_D) {
			var _R_D = R_D.data; // 由于后台传过来的json有个data，在此重命名
			$('#R-S').html("");
			var html_Fir = "";
			var html_Sec = "";
			html_Fir += '<optgroup label="Resource">'
			for (i in _R_D) {
				html_Fir += '<option  value=' + _R_D[i].resource + '>'
						+ _R_D[i].resource + '</option>'
			}
			html_Fir += '</optgroup>'
			html_Sec += '<optgroup >'
			html_Sec += '<option  value="resource">' + "All Resource" + '</option>'
			html_Sec += '</optgroup>'
			$('#R_S').append(html_Fir);
			$('#R_S').append(html_Sec);
			// 缺一不可
			$('#R_S').selectpicker('refresh');
			$('#R_S').selectpicker('render');
		}
	});
});

function all_resource_show(res_name) {
	$.ajax({
		url : "/resource_data",
		type : "get",
		dataType : "json",
		success : function(R_D) {
			var _R_D = R_D.data;
			var html = "";
			var html_sec = "";
			html_sec += "<tr>";
			html_sec += "<td>" + "device_name" + "</td>"
			html_sec += "<td>" + "mirror_way" + "</td>"
			html_sec += "<td>" + "resource" + "</td>"
			html_sec += "<td>" + "resource" + "</td>"
			html_sec += "<td>" + "used" + "</td>"
			html_sec += "</tr>";
			for (var i = 0; i < _R_D.length; i++) {
				html += "<tr>";
				html += "<td>" + _R_D[i].device_name + "</td>"
				html += "<td>" + _R_D[i].mirror_way + "</td>"
				html += "<td>" + _R_D[i].resource + "</td>"
				html += "<td>" + _R_D[i].size + "</td>"
				html += "<td>" + _R_D[i].used + "</td>"
				html += "</tr>";
			}
			$("#J_THData").html(html_sec);
			$("#J_TbData").html(html);
		}
	});
}
all_resource_show();

function one_resource_show() {
	$.ajax({
		url : "/resource_data",
		type : "get",
		dataType : "json",
		success : function(R_D) {
			var a = "res_a"
			var _R_D = R_D.data;
			for (i in _R_D) {
				if (_R_D[i].resource == a) {
					var mirror_way_son = _R_D[i].mirror_way_son;
					var html = "";
					var html_sec = "";
					html_sec += "<tr>";
					html_sec += "<td>" + "drbd_role" + "</td>"
					html_sec += "<td>" + "node_name" + "</td>"
					html_sec += "<td>" + "status" + "</td>"
					html_sec += "<td>" + "stp_name" + "</td>"
					html_sec += "</tr>";
					for (var i = 0; i < mirror_way_son.length; i++) {
						html += "<tr>";
						html += "<td>" + mirror_way_son[i].drbd_role + "</td>"
						html += "<td>" + mirror_way_son[i].node_name + "</td>"
						html += "<td>" + mirror_way_son[i].status + "</td>"
						html += "<td>" + mirror_way_son[i].stp_name + "</td>"
						html += "</tr>";
					}
					$("#J_THData").html(html_sec);
					$("#J_TbData").html(html);

				}
			}
		}
	});
}
one_resource_show();
