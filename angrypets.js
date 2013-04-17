var dataObj = {};
var enemyObj = {
	cities: [],
	filter: function(fraction, levelFrom, levelTo){
		var cities = this.cities;
		return 	$(cities).filter(function(index){
			var a = (fraction!=undefined && fraction!='') ? (cities[index].player.fraction==fraction) : true;
			var b = (levelFrom!=undefined) ? (cities[index].player.level>=levelFrom) : true;
			var c = (levelTo!=undefined) ? (cities[index].player.level<=levelTo) : true;
			return a&&b&&c;
		})
	},
	attackProto: function(army){
		var parent = this;
		$.ajax({url:'/' + ACTIVE_CITY + '/land'}).complete(function(e){
			if ($.parseJSON(e.responseText).data.attackAvailableIn == 0){
				$.ajax({
					url: '/' + ACTIVE_CITY + '/attack/' + parent.id,
					type: 'POST',
					data: army
				}).complete(function(d){
					var ans = $.parseJSON(d.responseText).data;
						updateResources(false, ans);
						$('form').html($(ans.html).find('form'));
						console.log('['+dataObj.serverdt+'] Attacking '+parent.name+'['+parent.fraction+']('+parent.army_capacity+')');
				});
			}
		})
	},
	construct: function(){
		this.load(100);
	},
	reload: function(){
		this.cities = [];
		this.total = 0;
		this.load(100);
	},
	load: function(amountTo){
		parent = this;
		$.ajax({
			url: "/" + ACTIVE_CITY + "/world/search", 
			type: "POST"
		}).complete(function(e){
			var ans = $.parseJSON(e.responseText).cities;
			$.each(ans, function(key, city){
				if (city.npccity!=1){
					city.attack = parent.attackProto;
					parent.cities.push(city);
				}
			})
			parent.cities = $.unique(parent.cities);
			parent.total = parent.cities.length;
			if (parent.total < amountTo) parent.load(amountTo);
		})
	},
	total: 0
};
var armyObj = {
	units: {'fighter':101, 'cowboy':102, 'patrol' : 104, 'raider': 105},
	bunits: [],
	army: {'units[101]':0, 'units[102]':0, 'units[104]':0, 'units[105]':0},
	free: {},
	construct: function(){
		var parent = this;
		$.each(this.units, function(key, value){
			parent.bunits[value] = key;
		});	
		$.each($($('form')[0]).find('input'), function(key, elem){
			pElement = elem.parentNode.parentNode;
			elem = $(elem);			
			parent.army[elem.attr('name')] = parseInt(elem.attr('max'));
			parent.free[elem.attr('name')] = parseInt(elem.attr('max')) - parseInt(elem.attr('value'));
		})		
	},
	update: function(){
		var parent = this;
		$.ajax({
			url: '/' + ACTIVE_CITY + '/land/', 
			type: 'GET',
		}).complete(function(d){
			var ans = $.parseJSON(d.responseText).data;
				updateResources(false, ans);
				$('form').html($(ans.html).find('form'));
				parent.construct();	
		});
	},
	getArmySlice: function(percentage){
		var parent = this;
		var tmpArmy = {};
		percentage = (parseFloat(percentage) >1) ? parseFloat(percentage)/100 : parseFloat(percentage);
		$.each(this.army, function(key, value){
			tmpArmy[key] = Math.round(value*percentage);
		});
		return tmpArmy;
	},
	getFreeArmySlice: function(percentage){
		var parent = this;
		var tmpArmy = {};
		percentage = (parseFloat(percentage) >1) ? parseFloat(percentage)/100 : parseFloat(percentage);
		$.each(this.free, function(key, value){
			tmpArmy[key] = Math.round(value*percentage);
		});
		return tmpArmy;
	},
	train: function(unit, amount){		
		var parent = this;
		$.ajax({
			url: '/' + ACTIVE_CITY + '/train/'+ unit +'/' + amount,
			type: 'POST',
			data: {'__csrf':CSRF, 'static_version':STATIC_VERSION, '__referrer':AngryAjax.getCurrentUrl()}
		}).complete(function(d){
			var ans = $.parseJSON(d.responseText).data;
				updateResources(false, ans);		
				console.log('['+dataObj.serverdt+'] Train '+amount+' [' + parent.bunits[unit] +']');
		});
	},
	putArmyOnWall: function(army){
		$.ajax({
			url: '/' + ACTIVE_CITY + '/editdefence/', 
			type: 'POST',
			data: army
		}).complete(function(d){
			var ans = $.parseJSON(d.responseText).data;
				updateResources(false, ans);
				$('form').html($(ans.html).find('form'));
				console.log('['+dataObj.serverdt+'] Army on guard');
		});
	},
	putUnitOnWall: function(unit, amount){
		var tmpArmy = this.army;
		$.each($($('form')[0]).find('input'), function(key, elem){
			elem = $(elem);
			tmpArmy[elem.attr('name')] = parseInt(elem.attr('value'));
		})
		tmpArmy['units[' + unit + ']'] = amount;
		
		$.ajax({
			url: '/' + ACTIVE_CITY + '/editdefence/', 
			type: 'POST',
			data: tmpArmy
		}).complete(function(d){
			var ans = $.parseJSON(d.responseText).data;
				updateResources(false, ans);
				$('form').html($(ans.html).find('form'));
				console.log('['+dataObj.serverdt+'] Army on guard');
		});
	}
}

var timmer = 0;
var delay = 60000;	

var timmerFunc = function(){
	return timimg;
}

var parseActions = function(){
	if ($('#city-activities').length!=0){
		dataObj.actions = { 
			'amount' : parseInt($('#city-activities').attr('data-tooltip-title').match(': (.*)/')[1]),
			'active' : []
		};
		$.each($('.collect-place').find('[onclick]'), function(key,value){
			value = $(value);
			if (value.attr('onclick').match('Building.collect\\((.*), (.*)\\)')!=undefined)
				dataObj.actions.active.push({
					'id': parseInt(value.attr('onclick').match('Building.collect\\((.*), (.*)\\)')[2]), //Building.collect(10363678, 15);
					'resource': value.parent().attr('class').replace('collect-place ', ''),
					'cost' : parseInt(value.parent().find('.cost>.activities').html())
				});
		});
	}
}

var doCollectBonuses = function(){
	var i = 0;
	updateResources();parseActions();
	while(dataObj.actions.amount > 0 && i<dataObj.actions.active.length){
		if (dataObj.actions.amount >= dataObj.actions.active[i].cost) {
			$.ajax({
				url: '/' + ACTIVE_CITY + '/collect', 
				type: 'POST', 
				async: false,
				data: {'city': ACTIVE_CITY, slot: dataObj.actions.active[i].id} 
			}).complete(function(d){
				var answ = $.parseJSON(d.responseText);
					answ = answ.data;					
					updateResources(false, answ);
				
					console.log('['+dataObj.serverdt+'] Collecting Bonuses');
			});	
		}
		i++;
	}	
}

var updateResources = function(ajax, data){
	if (ajax == undefined || ajax == true){
		$.ajax({url: '/' + ACTIVE_CITY + '/land', type: 'GET'}).complete(function(d){
			var answ = $.parseJSON(d.responseText).data;
				dataObj.attackAvailableIn = answ.attackAvailableIn;
				dataObj = {
						'serverdt' : answ.serverdt,
						'servertime' : answ.servertime,
						'city' : answ.city_id,
						'actions' : { 
							'amount' : answ.city_resources.activity
						},
						'resources':{
							'balance':{
									'wood' : answ.city_resources.wood,
									'metal' : answ.city_resources.metal,
									'energy' : answ.city_resources.energy,
									'food' : answ.city_resources.food,
									'green' : answ.city_resources.leaves,
									'activity' : answ.city_resources.activity
							},
							sumMain: function(){
								var res = this.balance;
								return parseInt(res.wood)+parseInt(res.metal)+parseInt(res.energy)+parseInt(res.food);
							}
						}
				};
		});
		console.log('['+dataObj.serverdt+'] Updating Resources Dynamic');
	}else if(data != undefined){
		answ = data;
		dataObj.serverdt = answ.serverdt;
		dataObj.servertime = answ.servertime;
		dataObj.attackAvailableIn = answ.attackAvailableIn;
		dataObj.city = answ.city_id;
		if (answ.city_resources){
			dataObj.actions.amount = answ.city_resources.activity;
			dataObj.resources.balance.wood = answ.city_resources.wood;
			dataObj.resources.balance.metal = answ.city_resources.metal;
			dataObj.resources.balance.energy = answ.city_resources.energy;
			dataObj.resources.balance.food = answ.city_resources.food;
			dataObj.resources.balance.green = answ.city_resources.green;
			dataObj.resources.balance.activity = answ.city_resources.activity;
			dataObj.resources.sumMain = function(){
											var res = this.balance;
											return parseInt(res.wood)+parseInt(res.metal)+parseInt(res.energy)+parseInt(res.food);
										}
			console.log('['+dataObj.serverdt+'] Updating Resources Static');
		}
	}	
}

var doPrintBucks = function(){
	if (dataObj.resources.balance.green>5){
		$.ajax({
				url:'/' + ACTIVE_CITY + '/city/print-bills', 
				type:'POST'
		}).complete(function(d){
			var ans = $.parseJSON(d.responseText).data;
				updateResources(false, ans);
			
				console.log('['+dataObj.serverdt+'] Printing Bucks');
		});
	}	
}

var scienceRes = [];
var doStudy = function(){
	
	scienceRes = [];
	
	var getNum = function(string){
		return parseInt(string.replace('<i></i>', ''));
	}
	
	updateResources();
	
	$.ajax({
		url: '/'+ACTIVE_CITY+'/academy'		
	}).complete(function(e){
		var page = $.parseJSON(e.responseText).data.html;
		var res = $(page).find('.requrements .resources');
		$.each(res, function(key){
			var value = res[key];
			if ($(value).parent().parent().prev().find('a[href*="academy"]').attr('href') != undefined){
				scienceRes[key] = {
					'name': $(value).parent().parent().prev().find('a[href*="academy"]').attr('href').match('/academy/(.*)')[1],
					'wood': getNum($(value).find('.wood').html()),
					'metal': getNum($(value).find('.metal').html()),
					'energy': getNum($(value).find('.energy').html()),
					'food': getNum($(value).find('.'+CITY_FOOD).html())				
				};
				var sr = scienceRes[key];			
				scienceRes[key]['sum'] = sr.wood+sr.metal+sr.energy+sr.food;
			}
		});
		
		scienceRes.sort(function(a,b){ 
			return ((parseInt(a.sum) > parseInt(b.sum)) ? 1 : ((parseInt(a.sum) < parseInt(b.sum)) ? -1 : 0));
		});
		
		var tmpScienceRes = scienceRes;		
		scienceRes = [];		
		var res = dataObj.resources.balance;
		
		var getClosest = function(tmpScienceRes, res){
			for (i=0; i<tmpScienceRes.length; i++){
				var value = tmpScienceRes[i];
				
				var a = res.wood > value.wood;
				var b = res.metal > value.metal;
				var c = res.energy > value.energy;
				var d = res.food > value.food;
				if (a&&b&&c&&d) return value;
			}
			return false;
		}
		
		var science = getClosest(tmpScienceRes, res);		
		
		if (science!=false){
			$.ajax({
				url: '/' + ACTIVE_CITY + '/academy/'+ science.name,
				type: 'POST',
				data: {'__csrf':CSRF, 'static_version':STATIC_VERSION, '__referrer':AngryAjax.getCurrentUrl()}
			}).complete(function(d){
				var ans = $.parseJSON(d.responseText).data;
					updateResources(false, ans);
				console.log('['+dataObj.serverdt+'] Development of '+science.name);
				return true;
			});
		}else{
			console.log('['+dataObj.serverdt+'] Not Enough resouces for development');
			return false;
		}
	})
}

var trainingRes = [];
var doTrain = function(){
	
	trainingRes = [];
	
	var getNum = function(string){
		return parseInt(string.replace('<i></i>', ''));
	}
	
	updateResources();
	
	$.ajax({
		url: '/'+ACTIVE_CITY+'/training'		
	}).complete(function(e){
		var page = $.parseJSON(e.responseText).data.html;
		var res = $(page).find('.resources');
		$.each(res, function(key){
			var value = res[key];
			if ($(value).parent().attr('data-stat') != undefined){
				trainingRes[key] = {
					'name': $(value).parent().attr('data-stat'),
					'wood': getNum($(value).find('.wood').html()),
					'metal': getNum($(value).find('.metal').html()),
					'energy': getNum($(value).find('.energy').html()),
					'food': getNum($(value).find('.'+CITY_FOOD).html())				
				};
				var sr = trainingRes[key];			
				trainingRes[key]['sum'] = sr.wood+sr.metal+sr.energy+sr.food;
			}
		});
		
		trainingRes.sort(function(a,b){ 
			return ((parseInt(a.sum) > parseInt(b.sum)) ? 1 : ((parseInt(a.sum) < parseInt(b.sum)) ? -1 : 0));
		});
		
		var tmpTrainingRes = trainingRes;		
		trainingRes = [];		
		var res = dataObj.resources.balance;
		
		var getClosest = function(tmpTrainingRes, res){
			for (i=0; i<tmpTrainingRes.length; i++){
				var value = tmpTrainingRes[i];
				
				var a = res.wood > value.wood;
				var b = res.metal > value.metal;
				var c = res.energy > value.energy;
				var d = res.food > value.food;
				if (a&&b&&c&&d) return value;
			}
			return false;
		}
		
		var stat = getClosest(tmpTrainingRes, res);
		
		if (stat!=false){
			$.ajax({
				url: '/' + ACTIVE_CITY + '/training/train',
				type: 'POST',
				data: {'stat':stat.name,'__csrf':CSRF, 'static_version':STATIC_VERSION, '__referrer':AngryAjax.getCurrentUrl()}
			}).complete(function(d){
				var ans = $.parseJSON(d.responseText).data;
					updateResources(false, ans);
					console.log('['+dataObj.serverdt+'] Training of '+stat.name);
				return true;
			});
		}else{
			console.log('['+dataObj.serverdt+'] Not Enough resouces for training');
			return false;
		}
	})
}

var upgradeRes = [];
var doUpgrade = function(){	
	
	var getNum = function(string){
		return parseInt(string.replace('<i></i>', ''));
	}
	
	updateResources();
	
		$('[href*="'+ACTIVE_CITY+'/land/"]').each(function(key,value){
			var elemId = value.href.match('/land/(.*)');
				elemId = parseInt(elemId[1]);
				
				if (!isNaN(elemId))
					getPage('/'+ACTIVE_CITY+'/land/'+elemId, function(e){
						var data = $(e).find('[onclick*="Building.build"]').attr('onclick');
							if (data!=undefined)  data = data.match(ACTIVE_CITY+', (.*), \'(.*)\'\\)');
								upgradeRes[key] = {
									'id': data[2],
									'slot': data[1],
									'wood': getNum($(value).find('.wood').html()),
									'metal': getNum($(value).find('.metal').html()),
									'energy': getNum($(value).find('.energy').html()),
									'food': getNum($(value).find('.'+CITY_FOOD).html())				
								};
								var sr = upgradeRes[key];			
								upgradeRes[key]['sum'] = sr.wood+sr.metal+sr.energy+sr.food;
			
								console.log(upgradeRes);
								upgradeRes.sort(function(a,b){ 
									return ((parseInt(a.sum) > parseInt(b.sum)) ? 1 : ((parseInt(a.sum) < parseInt(b.sum)) ? -1 : 0));
								});
		
						return false;
					});
					
				var tmpUpgradeRes = upgradeRes;		
					upgradeRes = [];		
				var res = dataObj.resources.balance;
		
				var getClosest = function(tmpUpgradeRes, res){
					for (i=0; i<tmpUpgradeRes.length; i++){
						var value = tmpUpgradeRes[i];
					
						var a = res.wood > value.wood;
						var b = res.metal > value.metal;
						var c = res.energy > value.energy;
						var d = res.food > value.food;
						if (a&&b&&c&&d) return value;
					}
					return false;
				}
		
				var stat = getClosest(tmpUpgradeRes, res);		
				if (stat!=false){
					$.ajax({
						url: '/' + ACTIVE_CITY + '/training/train',
						type: 'POST',
						data: {'stat':stat.name,'__csrf':CSRF, 'static_version':STATIC_VERSION, '__referrer':AngryAjax.getCurrentUrl()}
					}).complete(function(d){
						var ans = $.parseJSON(d.responseText).data;
							updateResources(false, ans);
						console.log('['+dataObj.serverdt+'] Training of '+stat.name);
						return true;
					});
				}else{
					console.log('['+dataObj.serverdt+'] Not Enough resouces for training');
					return false;
				}	
		});
}

var getPage = function(url, succFunc){
   $.ajax({url: url}).complete(function(e){
      var response = $.parseJSON(e.responseText);
      updateResources(false, response.data);
      if (typeof(succFunc) == "function")
            succFunc(response.data.html);
   });
}

var hideErrors = function(){
	CAlert.hide($('.alert'));
	console.log('Errors hiden !')
}

var smallArmy = function(){
	armyObj.train(armyObj.units.patrol, 2);
	armyObj.train(armyObj.units.raider, 2);
	//armyObj.train(armyObj.units.cowboy, 3);
	//armyObj.train(armyObj.units.fighter, 3);
}

var putSmallOnWall = function(){
	armyObj.putArmyOnWall(armyObj.getArmySlice(60));
}

var attackEnemy = function(){
	var i = 3;
	if (enemyObj.cities.length==0) enemyObj.reload();
	while (enemyObj.filter('', 1,i).length==0){
		i++;		
	}
	var tmp = Math.round(Math.random()*enemyObj.filter('', 1,i).length);
	if (enemyObj.filter('', 1,i)[tmp]!=undefined){
		enemyObj.filter('', 1,i)[tmp].attack(armyObj.getFreeArmySlice(30));
	}else{
		enemyObj.filter('', 1,i)[0].attack(armyObj.getFreeArmySlice(30));
	}
	enemyObj.reload();	
}

var update = function(){
	enemyObj.construct();
	armyObj.construct();
}

var colBonuses, prnBucks, trnArmy, ptnGuard, autoAttack, autoDevel;
var initialize = function(){
	dataObj.city = ACTIVE_CITY;
	updateResources();
	parseActions();
	
	enemyObj.construct();
	armyObj.construct();
	
	setInterval(update, 4*60*1000);
	
	console.log('['+dataObj.serverdt+'] Initialized !');
};


var evo = function(){
	doTrain();
	doStudy();
}

var autoActions = function(){
	colBonuses = setInterval(doCollectBonuses, 2*60*1000);
	prnBucks = setInterval(doPrintBucks, 10*60*1000);
	trnArmy = setInterval(smallArmy, 15*60*1000);
	ptnGuard = setInterval(putSmallOnWall, 10*60*1000);	
	//autoAttack = setInterval(attackEnemy, 1*60*1000);
	autoDevel = setInterval(evo, 60*60*1000);
	setTimeout(function(){
		doCollectBonuses();
		doPrintBucks();
	}, 2000);
}

var tryToInitialize = function(){
	if (typeof($)!='function'){	
		setTimeout(tryToInitialize,500);
	}else{
		$(document).ready(initialize);
	}
}
tryToInitialize();