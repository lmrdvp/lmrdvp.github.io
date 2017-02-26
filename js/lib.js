'use strict';

$(document).ready(function () {
	applyAutoScrollOnMnuClick('a[href*=#about], a[href*=#projects], a[href*=#contact], a[href*=#followme]')
	updateNavMenuOnScroll($(document));
	//applyDynFooterHeight($(document));
	initHistory();
});

$(document).scroll(function(){
	updateNavMenuOnScroll($(this));
});

function applyDynFooterHeight(obj) {
	var footP=$('#contact').position().top;
	var docH = obj.height(); 
	var winH = $(window).height();
	if(docH - footP < winH){
		var difTop = 0;
		if(winH == docH){
			difTop = docH - $('#footer').height() - $('#contact').height();
		}else{
			difTop = winH - (docH - footP);
		}
		$('#footer').height($('#footer').height() + difTop);
	}
};

function updateNavMenuOnScroll(obj) {
	if(obj.scrollTop() < $('#projects').position().top){
		$('a[href*=#about]').removeClass().addClass('selected');
		$('a[href*=#projects]').removeClass();
		$('a[href*=#contact]').removeClass();
		document.title = "Luís Ribeiro - About";
    } else if(obj.scrollTop() >= $('#projects').position().top && obj.scrollTop() < $('#contact').position().top && $(window).scrollTop() != (obj.height() - $(window).height())){
		$('a[href*=#about]').removeClass();
		$('a[href*=#projects]').removeClass().addClass('selected');
		$('a[href*=#contact]').removeClass();
		document.title = "Luís Ribeiro - Projects";
    } else if(obj.scrollTop() >= $('#contact').position().top || $(window).scrollTop() == (obj.height() - $(window).height())){
		$('a[href*=#about]').removeClass();
		$('a[href*=#projects]').removeClass();
		$('a[href*=#contact]').removeClass().addClass('selected');
		document.title = "Luís Ribeiro - Contact";
    }
};

function applyAutoScrollOnMnuClick(selectors, dontQueue) {
	$(selectors).click(function () {
		return animateScroll(this.hash, this, dontQueue, true);
	});
};

function animateScroll(hash, newLocation, dontQueue, handleHistory){
	// duration in ms
	var duration = 1000;
	//easing values: swing | linear
	var easing = 'swing';

	hash = hash || '';
	var target = 0;
	if(hash != undefined && hash !== ''){
		target = $(hash).offset().top;
	}
	
	var selector = "body, html";
	if (dontQueue) {
		selector = "body:not(:animated), html:not(:animated)";
	}
	
	$(selector).animate({ scrollTop: target }, duration, easing).promise().then(function(){
		if(handleHistory){
			updateHistory(newLocation, hash, hash);
		}
	});

	//cancel default click action
	return false;
};

function supports_history_api() {
  return !!(window.history && history.pushState);
};

var eventPopStateListenerAdded=false;
function initHistory() {
	if (!supports_history_api() || eventPopStateListenerAdded) { 
		return; 
	}else{
		window.addEventListener("popstate", function(e) {
			loadHistory(location); 
		});
		eventPopStateListenerAdded=true;
	}
};

function loadHistory(location) {
	animateScroll(location.hash, location.href, false, false);
	return true;
};

function updateHistory(url, title, page) {
	if(supports_history_api()){
		var state = { 'page': page, 'hash': page };
		window.history.pushState(state, title, page);
	}else{
		window.location.href = newLocation;
	}
};

function doValidateInput(event) {
	var input=$(this);
	var isvalid=input.val();
	if(isvalid){
		input.removeClass("invalid").addClass("valid");
	}else{
		input.removeClass("valid").addClass("invalid");
	}
};

function doValidateInputEmail(event) {
	var input=$(this);
	var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
	var isemail=re.test(input.val());
	if(isemail){input.removeClass("invalid").addClass("valid");}
	else{input.removeClass("valid").addClass("invalid");}
};

function doValidateSubmitForm(event) {
	var form_data=$("#" + event.data.formid).serializeArray();
	var error_free=true;
	for (var input in form_data){
		var element=$("#"+form_data[input]['name']);
		var elementerror=$("#error"+form_data[input]['name']);
		var valid=element.hasClass("valid");
		if (!valid){
			element.addClass("error"); 
			elementerror.show();
			error_free=false;
		}else{
			element.removeClass("error");
			elementerror.hide();
		}
	}
	if (!error_free){
		event.preventDefault(); 
	}
	else{
		doSubmitForm(event);
	}	
};

function doResetForm(event) {
	var form_data=$("#" + event.data.formid).serializeArray();
	for (var input in form_data){
		var element=$("#"+form_data[input]['name']);
		element.removeClass("error");
		element.removeClass("valid");
	}
};

function doSubmitForm(event) {
	event.data.dataType = 'html';
	var postData = $("#" + event.data.formid).serializeArray();
	postData.push({name : 'fragments', value : event.data.fragments});
	event.data.postData=postData;
	doJQAjax(event);
};

function doJQAjax(event) {
	$(event.target).attr('disabled','disabled');

	var target=0;
	var ajax = {};
	
	if(event.data.placeholder != null && event.data.placeholder != undefined){
		target = $("#" +event.data.placeholder);
		target.show();
	}
	
	if(event.data.formid!=undefined && event.data.formid!=null){
		var formURL = $("#" + event.data.formid).attr("action");
		var method = $("#" + event.data.formid).attr("method");
		ajax.url = formURL;
		ajax.type = method;
	}
	
	if(event.data.postData!=undefined && event.data.postData!=null){
		ajax.data = event.data.postData;
	}
	if(event.data.dataType!=undefined && event.data.dataType!=null){
		ajax.dataType= event.data.dataType;
	}
    
	ajax.complete = function() {
		if(event.data.placeholder != null && event.data.placeholder != undefined){
			target.hide();
			$(event.target).removeAttr('disabled');
		}
	};
	
	ajax.success = function(result) {
		// Reset form...
		$("#" + event.data.formid)[0].reset();
		// Clean validation
		doResetForm(event);
		var arr = event.data.fragments.split(',');
		var json = $.parseJSON(result);
		for ( var i = 0; i < arr.length; i++) {
			$("#" + arr[i]).html(json.data);
			$("#" + arr[i]).fadeIn('slow').delay(4000).fadeOut();
		}
		$(event.target).removeAttr('disabled');
	};
	
	ajax.error = function(xhr) { // if error occured
		if(event.data.placeholder != null && event.data.placeholder != undefined){
			target.hide();
		}
		$(event.target).removeAttr('disabled');
		alert("Error occured. Please try again later");
	};
	
	$.ajax(ajax);

	if (event.preventDefault) {
		event.preventDefault();
	} else {
		event.stop();
	}
	event.returnValue = false;
	event.stopPropagation();
};




