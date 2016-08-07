$(function() {
	// init date tables
	var jobTable = $("#job_list").dataTable({
		"deferRender": true,
		"processing" : true, 
	    "serverSide": true,
		"ajax": {
			url: base_url + "/memcached/pageList",
			type:"post",
	        data : function ( d ) {
	        	var obj = {};
	        	obj.key = $('#jobGroup').val();
	        	obj.start = d.start;
	        	obj.length = d.length;
                return obj;
            }
	    },
	    "searching": false,
	    "ordering": false,
	    //"scrollX": true,	// X轴滚动条，取消自适应
	    "columns": [
	                { "data": 'id', "bSortable": false, "visible" : false},
	                { "data": 'key', "visible" : true},
					{ "data": 'value', "visible" : true},
	                { "data": '操作' ,
	                	"render": function ( data, type, row ) {
	                		return function(){
								// html
								var html = '<p id="'+ row.id +'" '+
									' key="'+ row.key +'" '+
									' value="'+ row.value +'" '+
									'>'+
									'<button class="btn btn-primary btn-xs job_operate" type="job_trigger" type="button">详细</button>  '+
									'<button class="btn btn-warning btn-xs update" type="button">编辑</button>  '+
									'<button class="btn btn-danger btn-xs job_operate" type="job_del" type="button">删除</button>  '+
									'</p>';

	                			return html;
							};
	                	}
	                }
	            ],
		"language" : {
			"sProcessing" : "处理中...",
			"sLengthMenu" : "每页 _MENU_ 条记录",
			"sZeroRecords" : "没有匹配结果",
			"sInfo" : "第 _PAGE_ 页 ( 总共 _PAGES_ 页 )",
			"sInfoEmpty" : "无记录",
			"sInfoFiltered" : "(由 _MAX_ 项结果过滤)",
			"sInfoPostFix" : "",
			"sSearch" : "搜索:",
			"sUrl" : "",
			"sEmptyTable" : "表中数据为空",
			"sLoadingRecords" : "载入中...",
			"sInfoThousands" : ",",
			"oPaginate" : {
				"sFirst" : "首页",
				"sPrevious" : "上页",
				"sNext" : "下页",
				"sLast" : "末页"
			},
			"oAria" : {
				"sSortAscending" : ": 以升序排列此列",
				"sSortDescending" : ": 以降序排列此列"
			}
		}
	});
	
	// 搜索按钮
	$('#searchBtn').on('click', function(){
		jobTable.fnDraw();
	});
	
	// job operate
	$("#job_list").on('click', '.job_operate',function() {
		var typeName;
		var url;
		var needFresh = false;

		var type = $(this).attr("type");
		if ("job_pause" == type) {
			typeName = "暂停";
			url = base_url + "/jobinfo/pause";
			needFresh = true;
		} else if ("job_resume" == type) {
			typeName = "恢复";
			url = base_url + "/jobinfo/resume";
			needFresh = true;
		} else if ("job_del" == type) {
			typeName = "删除";
			url = base_url + "/jobinfo/remove";
			needFresh = true;
		} else if ("job_trigger" == type) {
			typeName = "执行";
			url = base_url + "/jobinfo/trigger";
		} else {
			return;
		}
		
		var jobGroup = $(this).parent('p').attr("jobGroup");
		var jobName = $(this).parent('p').attr("jobName");
		
		ComConfirm.show("确认" + typeName + "?", function(){
			$.ajax({
				type : 'POST',
				url : url,
				data : {
					"jobGroup" : jobGroup,
					"jobName"  : jobName
				},
				dataType : "json",
				success : function(data){
					if (data.code == 200) {
						ComAlert.show(1, typeName + "成功", function(){
							if (needFresh) {
								//window.location.reload();
								jobTable.fnDraw();
							}
						});
					} else {
						ComAlert.show(1, typeName + "失败");
					}
				},
			});
		});
	});
	
	// jquery.validate 自定义校验 “英文字母开头，只含有英文字母、数字和下划线”
	jQuery.validator.addMethod("myValid01", function(value, element) {
		var length = value.length;
		var valid = /^[a-zA-Z][a-zA-Z0-9_]*$/;
		return this.optional(element) || valid.test(value);
	}, "只支持英文字母开头，只含有英文字母、数字和下划线");
	
	// 新增
	$(".add").click(function(){
		$('#addModal').modal({backdrop: false, keyboard: false}).modal('show');
	});
	var addModalValidate = $("#addModal .form").validate({
		errorElement : 'span',  
        errorClass : 'help-block',
        focusInvalid : true,  
        rules : {
			jobDesc : {
				required : true,
				maxlength: 50
			},
            jobCron : {
            	required : true
            },
            executorAddress : {
            	required : true
            },
			executorHandler : {
				required : false
			},
            alarmEmail : {
            	required : true
            },
			author : {
				required : true
			}
        }, 
        messages : {  
            jobDesc : {
            	required :"请输入“描述”."
            },
            jobCron : {
            	required :"请输入“Cron”."
            },
            executorAddress : {
            	required :"请输入“执行器地址”."
            },
			executorHandler : {
				required : "请输入“jobHandler”."
			},
            alarmEmail : {
            	required : "请输入“报警邮件”."
            },
            author : {
            	required : "请输入“负责人”."
            }
        },
		highlight : function(element) {  
            $(element).closest('.form-group').addClass('has-error');  
        },
        success : function(label) {  
            label.closest('.form-group').removeClass('has-error');  
            label.remove();  
        },
        errorPlacement : function(error, element) {  
            element.parent('div').append(error);  
        },
        submitHandler : function(form) {
        	$.post(base_url + "/jobinfo/add",  $("#addModal .form").serialize(), function(data, status) {
    			if (data.code == "200") {
    				ComAlert.show(1, "新增任务成功", function(){
    					//window.location.reload();
						$('#addModal').modal('hide');
						jobTable.fnDraw();
    				});
    			} else {
    				if (data.msg) {
    					ComAlert.show(2, data.msg);
    				} else {
    					ComAlert.show(2, "新增失败");
    				}
    			}
    		});
		}
	});
	$("#addModal").on('hide.bs.modal', function () {
		$("#addModal .form")[0].reset();
		addModalValidate.resetForm();
		$("#addModal .form .form-group").removeClass("has-error");
		$(".remote_panel").show();	// remote

		$("#addModal .form input[name='executorHandler']").removeAttr("readonly");
	});

	// GLUE模式开启
	$(".ifGLUE").click(function(){
		var ifGLUE = $(this).is(':checked');
		var $executorHandler = $(this).parents("form").find("input[name='executorHandler']");
		var $glueSwitch = $(this).parents("form").find("input[name='glueSwitch']");
		if (ifGLUE) {
			$executorHandler.val("");
			$executorHandler.attr("readonly","readonly");
			$glueSwitch.val(1);
		} else {
			$executorHandler.removeAttr("readonly");
			$glueSwitch.val(0);
		}
	});
	
	// 更新
	$("#job_list").on('click', '.update',function() {

		// base data
		$("#updateModal .form input[name='jobGroup']").val($(this).parent('p').attr("jobGroup"));
		$("#updateModal .form input[name='jobName']").val($(this).parent('p').attr("jobName"));
		$("#updateModal .form input[name='jobDesc']").val($(this).parent('p').attr("jobDesc"));
		$("#updateModal .form input[name='jobCron']").val($(this).parent('p').attr("jobCron"));
		$("#updateModal .form input[name='author']").val($(this).parent('p').attr("author"));
		$("#updateModal .form input[name='alarmEmail']").val($(this).parent('p').attr("alarmEmail"));
		$("#updateModal .form input[name='executorAddress']").val($(this).parent('p').attr("executorAddress"));
		$("#updateModal .form input[name='executorHandler']").val($(this).parent('p').attr("executorHandler"));
		$("#updateModal .form input[name='executorParam']").val($(this).parent('p').attr("executorParam"));
        $("#updateModal .form input[name='childJobKey']").val($(this).parent('p').attr("childJobKey"));

		// jobGroupTitle
		var jobGroupTitle = $("#addModal .form select[name='jobGroup']").find("option[value='" + $(this).parent('p').attr("jobGroup") + "']").text();
		$("#updateModal .form .jobGroupTitle").val(jobGroupTitle);

        // glueSwitch
		var glueSwitch = $(this).parent('p').attr("glueSwitch");
		$("#updateModal .form input[name='glueSwitch']").val(glueSwitch);
		var $ifGLUE = $("#updateModal .form .ifGLUE");
		var $executorHandler = $("#updateModal .form input[name='executorHandler']");
		if (glueSwitch == 1) {
			$ifGLUE.attr("checked", true);
			$executorHandler.val("");
			$executorHandler.attr("readonly","readonly");
		} else {
			$ifGLUE.attr("checked", false);
			$executorHandler.removeAttr("readonly");
		}

		// show
		$('#updateModal').modal({backdrop: false, keyboard: false}).modal('show');
	});
	var updateModalValidate = $("#updateModal .form").validate({
		errorElement : 'span',  
        errorClass : 'help-block',
        focusInvalid : true,

		rules : {
			jobDesc : {
				required : true,
				maxlength: 50
			},
			jobCron : {
				required : true
			},
			executorAddress : {
				required : true
			},
			executorHandler : {
				required : false
			},
			alarmEmail : {
				required : true
			},
			author : {
				required : true
			}
		},
		messages : {
			jobDesc : {
				required :"请输入“描述”."
			},
			jobCron : {
				required :"请输入“Cron”."
			},
			executorAddress : {
				required :"请输入“执行器地址”."
			},
			executorHandler : {
				required : "请输入“jobHandler”."
			},
			alarmEmail : {
				required : "请输入“报警邮件”."
			},
			author : {
				required : "请输入“负责人”."
			}
		},
		highlight : function(element) {
            $(element).closest('.form-group').addClass('has-error');  
        },
        success : function(label) {  
            label.closest('.form-group').removeClass('has-error');  
            label.remove();  
        },
        errorPlacement : function(error, element) {  
            element.parent('div').append(error);  
        },
        submitHandler : function(form) {
			// post
    		$.post(base_url + "/jobinfo/reschedule", $("#updateModal .form").serialize(), function(data, status) {
    			if (data.code == "200") {
    				ComAlert.show(1, "更新成功", function(){
    					//window.location.reload();
						$('#updateModal').modal('hide');
						jobTable.fnDraw();
    				});
    			} else {
    				if (data.msg) {
    					ComAlert.show(2, data.msg);
					} else {
						ComAlert.show(2, "更新失败");
					}
    			}
    		});
		}
	});
	$("#updateModal").on('hide.bs.modal', function () {
		$("#updateModal .form")[0].reset()
	});


	/*
	// 新增-添加参数
	$("#addModal .addParam").on('click', function () {
		var html = '<div class="form-group newParam">'+
				'<label for="lastname" class="col-sm-2 control-label">参数&nbsp;<button class="btn btn-danger btn-xs removeParam" type="button">移除</button></label>'+
				'<div class="col-sm-4"><input type="text" class="form-control" name="key" placeholder="请输入参数key[将会强转为String]" maxlength="200" /></div>'+
				'<div class="col-sm-6"><input type="text" class="form-control" name="value" placeholder="请输入参数value[将会强转为String]" maxlength="200" /></div>'+
			'</div>';
		$(this).parents('.form-group').parent().append(html);
		
		$("#addModal .removeParam").on('click', function () {
			$(this).parents('.form-group').remove();
		});
	});
	*/

});