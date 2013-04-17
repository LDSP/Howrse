var horseId, sess1, sess2, cheatIco, horses;
var time = 0;
var delay = 550;

function compare(x, y) {
		if (x === y) {//For reference types:returns true if x and y points to same object
			return true;
        }
		if (x.length != y.length) {
			return false;
        }
		for (key in x) {
            if (x[key] !== y[key]) {//!== So that the the values are not converted while comparison
			return false;
		}
    }
	return true;
}

$(document).ready(function(){
	if (projectRequest == "elevage%2Fchevaux%2Fcheval"){
		horseId = chevalId;
		sess1 = $('input[name^="age"]').attr('id').replace('age','').toLowerCase();
	
		if ($('a[onclick*="box"]').attr('onclick'))
			sess2 = $('a[onclick*="box"]').attr('onclick').match('&(.*)=box')[1];
	
		cheatIco = $('<img id="cheatIT" src="http://aeterna.qip.ru/images/upic597/upic597465-1min.jpg" style="width: 50px;height: 50px;position: relative;margin-left: 15%; cursor: pointer; border-radius: 8px;"><div class="options" style="margin: 0px 5px;"><input type="checkbox" name="autoFeed" onclick="options(this);"><label for="autoFeed">Auto Feed</label><br><input type="checkbox" name="autoTrain" onclick="options(this);"><label for="autoTrain">AutoTrain<label><br><input type="checkbox" name="autoSurvey" onclick="options(this);"><label for="autoSurvey">Auto Survey</label></div>').hide();
		$($('#care').find('table')[0]).append($(cheatIco).fadeIn(2500));
		$('#cheatIT').click(care);
		
		if ($.cookie('autoFeed')=="true") $('input[name="autoFeed"]').attr('checked', 'checked');
		if ($.cookie('autoTrain')=="true") $('input[name="autoTrain"]').attr('checked', 'checked');
		if ($.cookie('autoSurvey')=="true") $('input[name="autoSurvey"]').attr('checked', 'checked');
		
		if ($.cookie(document.location.href)=="1"){
			care();
		}
		
	}else if(projectRequest == "elevage%2Fchevaux%2F"){
		horses = $('div>a[href^="/elevage/chevaux/cheval?id="]');
		$.each(horses, function(){
			$(this).closest('div.content').prepend('<input class="cheatIT" type="checkbox" value="'+this.href+'">');
		});
		var searchBlock = $('#page-contents');
		cheatIco = '<div class="options" style="width: 500px;"><input type="checkbox" name="autoFeed" onclick="options(this);" style="float: left;"><label for="autoFeed" style="float: left;margin: 0px 5px;">Auto Feed</label><input type="checkbox" name="autoTrain" onclick="options(this);" style="float: left;"><label for="autoTrain" style="float: left;margin: 0px 5px;">Auto Train</label><input type="checkbox" name="autoSurvey" onclick="options(this);" style="float: left;"><label for="autoSurvey" style="float: left;margin: 0px 5px;">Auto Survey</label><input type="checkbox" name="selectAll" style="float: left;"><label for="selectAll" style="float: left;  margin: 0px 5px;">Select All</label><a href="javascript:;" class="go" style="background-color: gold;">Go </a></div><br/><br/>';
		searchBlock.prepend($(cheatIco).fadeIn(2500));
		if ($.cookie('autoFeed')=="true") $('input[name="autoFeed"]').attr('checked', 'checked');
		if ($.cookie('autoTrain')=="true") $('input[name="autoTrain"]').attr('checked', 'checked');
		if ($.cookie('autoSurvey')=="true") $('input[name="autoSurvey"]').attr('checked', 'checked');
		$('input[name="selectAll"]').change(function(){
			if (!compare(horses, $('div>a[href^="/elevage/chevaux/cheval?id="]'))){
				horses = $('div>a[href^="/elevage/chevaux/cheval?id="]');
				$.each(horses, function(){
					$(this).closest('div.content').prepend('<input class="cheatIT" type="checkbox" value="'+this.href+'">');
				});
			}
		$('.cheatIT').attr('checked',this.checked)});
		$('a.go').click(function(){time = 0;careAll($("input.cheatIT:checked"));});
	}
})

function options(obj){	
	$.cookie(obj.name, obj.checked);	
}

function constructFood(){
	var fieldHay = $('#feedingHay').parent().html();
	var fieldOats = $('#feedingOats').parent().html();
	var Hay, Oats;
	var multiply;
	multiply = (projectDomain == "www.lowadi.com") ? 1000 : 454.54545454545454545454545454545;
	if ($('#feedingHay').parent().html() != null && $('#feedingHay').parent().html().match('</select>(.*)/ <b')!=null){
		if (chevalAge<=18){
			var curHay = parseFloat($('#feedingHay').parent().html().match('</select>(.*)/ <b')[1]);
			var maxHay = parseFloat($('#feedingHay').parent().html().match('/ <b class="nowrap">(.*)</b')[1]);
				Hay = Math.round(Math.round(maxHay-curHay)*multiply);
			if ($('#feedingOats').parent().html()!=null){
				var curOats = parseFloat($('#feedingOats').parent().html().match('</select>(.*)/ <b')[1]);
				var maxOats =  parseFloat($('#feedingOats').parent().html().match('/ <b class="nowrap">(.*)</b')[1]);
					Oats = Math.round(Math.round(maxOats-curOats)*multiply);
			}
		}else{
			var curHay = parseFloat($('#feedingHay').parent().html().match('</select>(.*)/ <b')[1]);
				Hay = $($('#feedingHay').find('option')[22-curHay]).val();
				Oats = 0;
		}
	}else if ($('#haySlider').parent().html()!=null && $('#haySlider').parent().html().match('float-right">(.*)/ <')!=null){
		if (chevalAge<=18){
			var HayCur = parseFloat($('#haySlider').parent().html().match('float-right">(.*)/ <')[1]);
			var HayMax = parseFloat($('#haySlider').parent().html().match('/ <b class="nowrap">(.*)</b')[1]);
				Hay = (HayMax - HayCur)*multiply;
			if ($('#oatsSlider').parent().html()!=null){
				var OatsCur = parseFloat($('#oatsSlider').parent().html().match('float-right">(.*)/ <')[1]);
				var OatsMax = parseFloat($('#oatsSlider').parent().html().match('/ <b class="nowrap">(.*)</b')[1]);
					Oats = (OatsMax - OatsCur) * multiply;
			}
		}else{
			var HayCur = parseFloat($('#haySlider').parent().html().match('float-right">(.*)/ <')[1]);
				Hay = (10 - HayCur)*1000;
				Oats = 0;
		}
	}	
	Hay = (Hay>=0) ? Hay : 0;
	Oats = (Oats>=0) ? Oats : 0;
	
	return (Hay == 0 && Oats ==0) ? false : {hay:Hay, oats:Oats};
}

function constructPlay() {
	var availableEnergie = chevalEnergie - 20;
	var f=parseInt($("#playAge").attr("value"));
	var n=$("#playForm").attr("value");
	var a=parseInt($("#playDoucheGain").attr("value"));
	var m=parseFloat($("#playMaxCompetence").attr("value"));
	var e=parseFloat($("#playCompetenceGain").attr("value"));
	
	var d=0/2;	
	var c=Math.round((-1*0.9*(10+(16-f)/2)*d*(2-chevalMoral/100))*10)/10;
	var i = 0;
	while ( -c < availableEnergie ){
		i++;
		d=i/2;	
		c=Math.round((-1*0.9*(10+(16-f)/2)*d*(2-chevalMoral/100))*10)/10;		
		if(chevalDouche){
			c=c*((100-a)/100)
		}
		c=Math.round(c*100)/100;
	}
	i = (i>0) ? i : 1;
	return --i;
}

function constructGalop(){
	var availableEnergie = chevalEnergie - 20;
	var	r = getWalkGains('galop', parseFloat(0)/2,1);
	var i = 0;
	while (-(r.energie)< availableEnergie) { 
		i++; r = getWalkGains('galop', parseFloat(i)/2,1); 
	}
	i = (i>0) ? i : 1;	
	return --i;
}
function careAll(e){
	delay = 6000;
	var rTime = function(){
		return time;
	}
	$.each(e, function(key, val){
		setTimeout(function(){
			$.cookie(val.value, 1);
			var wi = window.open(val.value);
			if (wi!=null) wi.blur();
		}, rTime());time = time+delay;
	})	
}

function constructTrainee(){
	var availableEnergie = chevalEnergie - 20;
	if (chevalAge<24) return false;
	var p,p2;
		p = [enduranceValeur/enduranceGenetique, vitesseValeur/vitesseGenetique, dressageValeur/dressageGenetique, galopValeur/galopGenetique, trotValeur/trotGenetique, sautValeur/sautGenetique];
	var dressage = [
						{trainee: "endurance", value: 16, form: "Endurance"},
						{trainee: "vitesse", value: 16, form: "Vitesse"},
						{trainee: "dressage", value: 10, form: "Dressage"},
						{trainee: "galop", value: 14, form: "Galop"},
						{trainee: "trot", value: 14, form: "Trot"},
						{trainee: "saut", value: 14, form: "Saut"}
					];	
		p2 = p.slice();
		p2 = p2.sort();
		
	var i = 0;	var key = $.inArray(p2[i], p);
	entrainementGain(dressage[key].trainee, dressage[key].value, 1);
		
	while (parseFloat($('#'+dressage[key].trainee+'Gain').html())==0 || (-parseFloat($('#'+dressage[key].trainee+'Energie').html()))>availableEnergie){
		i++; if (i == (dressage.length) ) return false;key = $.inArray(p2[i], p);		
		entrainementGain(dressage[key].trainee, dressage[key].value, 1);		
	}
	
	i = key;
	
	var j=0; entrainementGain(dressage[i].trainee, dressage[i].value, ++j);
	while ((-parseFloat($('#'+dressage[i].trainee+'Energie').html())) < availableEnergie){
		entrainementGain(dressage[i].trainee, dressage[i].value, ++j);		
	}
	return (j<=0) ? false : {option:dressage[i], value:--j};
}

var disabled = [];	
function refreshDisabled(){
	disabled = [];
	$.each($('[class*="action-disabled"]>span[class*="img"]'), function(){ disabled.push($(this).attr('style').match('action/(.*).png')[1])});
	return disabled;
}

function ping(mes){
	console.log(mes);
}

function care(){	
	refreshDisabled();
	
	var rTime = function(){
		return time;
	}
	
	if ((constructGalop()!=0 || constructTrainee()!=false) && chevalAge>=18  && $.cookie('autoTrain')=="true"){
		setTimeout(function(){			
			var opt = constructTrainee();
			if (constructTrainee()==false){
				$('select[name^="formbaladeGalop"]').val(constructGalop());
				 $('input[type="hidden"][name^="formbaladeGalop"][value="0"]').val(constructGalop());
				$('form#formbaladeGalop').submit();
			}else{
				$('select[name^="entrainement'+opt.option.form+'Duration"]').val(opt.value);
				$('input[type="hidden"][name^="entrainement'+opt.option.form+'Duration"][value="0"]').val(opt.value);
				$('form#entrainement'+opt.option.form).submit();
			}
		}, rTime());time = time+delay;
	}
	
	if (chevalAge>8 && chevalAge<24 && constructPlay()!=0 && $.cookie('autoTrain')=="true"){
		setTimeout(function(){
			$('select[name^="formCenterPlay"]').val(constructPlay());
			$('input[type="hidden"][name^="formCenterPlay"][value="0"]').val(constructPlay());
			$('form#formCenterPlay').submit();
		}, rTime());time = time+delay;
	}
	
	if ($.cookie('autoSurvey')=="true" && $.inArray('allaiter' ,disabled)<0 && constructFood()==false && chevalAge<12){
		setTimeout(function(){ new Action.Horse(null, '/doSuckle', {params : sess1+'='+horseId}).send(); ;}, rTime());time = time+delay;
	}
	if (constructFood()!=false && $.cookie('autoFeed')=="true"){
		setTimeout(function(){
			$('#feedingHay').val(constructFood().hay);//
			$('#feedingOats').val(constructFood().oats);//
			$('#selectfeedingHay').val(constructFood().hay);//
			$('#selectfeedingOats').val(constructFood().oats);//
			
			//$('#feedingMash').val('mash-energetique');
			$('form#feeding').submit();
		}, rTime());time = time+delay;
	}
	if ($.cookie('autoSurvey')=="true"){
		if ($.inArray('boire' ,disabled)<0){
			setTimeout(function(){ new Action.Horse(null, '/doDrink', {params : sess1+'='+horseId}).send(); ; },rTime());time = time+delay;
			if ($.inArray('boire', refreshDisabled())<0){
				setTimeout(function(){ new Action.Horse(null, '/doDrink', {params : sess1+'='+horseId}).send(); ; },rTime());time = time+delay;
			}	
		}
		if ($.inArray('caresser-cheval' ,disabled)<0){
			setTimeout(function(){ new Action.Horse(null, '/doStroke', {params : sess1+'='+horseId}).send(); ; },rTime());time = time+delay;
			if ($.inArray('caresser-cheval' ,refreshDisabled())<0){
				setTimeout(function(){ new Action.Horse(null, '/doStroke', {params : sess1+'='+horseId}).send(); ; },rTime());time = time+delay;
			}
		}
		
		if ($.inArray('etrille' ,disabled)<0){
			setTimeout(function(){ new Action.Horse(null, '/doGroom', {params : sess1+'='+horseId}).send(); ; },rTime());time = time+delay;
			if ($.inArray('etrille' ,refreshDisabled())<0){
				setTimeout(function(){ new Action.Horse(null, '/doGroom', {params : sess1+'='+horseId}).send(); ; },rTime());time = time+delay;
			}	
		}
		
		if ($.inArray('carotte' ,disabled)<0){
			setTimeout(function(){ new Action.Horse(null, '/doEatTreat', {params : 'id='+horseId+'&friandise=carotte'}).send(); ; },rTime());time = time+delay;
			if ($.inArray('carotte' ,refreshDisabled())<0){
				setTimeout(function(){ new Action.Horse(null, '/doEatTreat', {params : 'id='+horseId+'&friandise=carotte'}).send(); ; },rTime());time = time+delay;
			}
		}
		if ($.inArray('navet' ,disabled)<0){
			setTimeout(function(){ new Action.Horse(null, '/doEatTreat', {params : 'id='+horseId+'&friandise=navet'}).send(); ; }, rTime());time = time+delay;
			if ($.inArray('navet' ,refreshDisabled())<0){
				setTimeout(function(){ new Action.Horse(null, '/doEatTreat', {params : 'id='+horseId+'&friandise=navet'}).send(); ; }, rTime());time = time+delay;
			}
		}
	}
	
	if ((constructGalop()!=0 || constructTrainee()!=false) && chevalAge>=18  && $.cookie('autoTrain')=="true"){
		setTimeout(function(){			
			var opt = constructTrainee();
			if (constructTrainee()==false){
				$('select[name^="formbaladeGalop"]').val(constructGalop());
				 $('input[type="hidden"][name^="formbaladeGalop"][value="0"]').val(constructGalop());
				$('form#formbaladeGalop').submit();
			}else{
				$('select[name^="entrainement'+opt.option.form+'Duration"]').val(opt.value);
				$('input[type="hidden"][name^="entrainement'+opt.option.form+'Duration"][value="0"]').val(opt.value);
				$('form#entrainement'+opt.option.form).submit();
			}
		}, rTime());time = time+delay;
	}
	
	if (chevalAge>8 && chevalAge<24 && constructPlay()!=0 && $.cookie('autoTrain')=="true"){
		setTimeout(function(){
			$('select[name^="formCenterPlay"]').val(constructPlay());
			$('input[type="hidden"][name^="formCenterPlay"][value="0"]').val(constructPlay());
			$('form#formCenterPlay').submit();
		}, rTime());time = time+delay;
	}
	
	if ($.cookie('autoSurvey')=="true" && $.inArray('allaiter' ,disabled)<0 && constructFood()==false && chevalAge<12){
		setTimeout(function(){ new Action.Horse(null, '/doSuckle', {params : sess1+'='+horseId}).send(); ; },rTime());time = time+delay;
	}
	if (constructFood()!=false && $.cookie('autoFeed')=="true"){
		setTimeout(function(){
			$('#feedingHay').val(constructFood().hay);//
			$('#feedingOats').val(constructFood().oats);//
			$('#selectfeedingHay').val(constructFood().hay);//
			$('#selectfeedingOats').val(constructFood().oats);//
			
			//$('#feedingMash').val('mash-energetique');
			$('form#feeding').submit();
		}, rTime());time = time+delay;
	}
	
	if ($.cookie('autoSurvey')=="true" && $.inArray('coucher' ,disabled)<0 && $('span.img[style*="coucher-box"]').length==0){
		setTimeout(function(){ new Action.Horse(null, '/doNight', {params : sess1+'='+horseId+'&'+sess2+'=box'}).send(); ; }, rTime());time = time+delay;
	}
	
	if ($.cookie(document.location.href)=="1"){
		$.cookie(document.location.href, null);
		setTimeout(function(){
			window.close();
		}, rTime());time = time+delay;
	}
	
	setTimeout(hideErrors, rTime());time = time+delay;
	setTimeout(function(){ $($('#care').find('table')[0]).append($(cheatIco).fadeIn(2500));$('#cheatIT').click(care);}, rTime());time = time+delay;
}