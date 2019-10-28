var budgetController = (function(){

	var Expense = function(id, desc, value)
	{
		this.id = id;
		this.desc = desc;
		this.value = value;
		this.perc = -1;
	};

	Expense.prototype.calcPerc = function(totalInc)
	{
		if(totalInc>0)
		{
			this.perc = Math.round((this.value/totalInc) * 100);
		} else {
			this.perc = -1;
		}
	}

	Expense.prototype.getPerc = function()
	{
		return this.perc;
	}

	var Income = function(id, desc, value)
	{
		this.id = id;
		this.desc = desc;
		this.value = value;
	};

	var data = {
		allItems: {
			inc: [],
			exp: []
		},
		totals: {
			inc: 0,
			exp: 0
		},
		budget: 0,
		percentage: -1
	};

	var calculateTotal = function(type)
	{
		var sum = 0;
		data.allItems[type].forEach(function(element){
			sum+=element.value;
		});
		data.totals[type] = sum;
	}

	return {
		addNewItem: function(type, desc, value){
			var newItem, ID;

			if(data.allItems[type].length > 0)
			{
				ID = (data.allItems[type][data.allItems[type].length - 1].id + 1);
			} else {
				ID = 0;
			}

			if(type === 'inc')
			{
				newItem = new Income(ID, desc, value);
			} else if (type == 'exp')
			{
				newItem = new Expense(ID, desc, value);
			}

			data.allItems[type].push(newItem);

			return newItem;
		},

		deleteNewItem: function(type, id)
		{
			var ids, index;

			ids = data.allItems[type].map(function(element){
				return element.id;
			});

			index = ids.indexOf(id);

			if(index !== -1)
			{
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function(){

			calculateTotal('exp');
			calculateTotal('inc');

			data.budget = data.totals.inc - data.totals.exp;

			if(data.totals.inc > 0)
			{
				data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
			} else {
				data.percentage = -1;
			}

			return {
				budget: data.budget,
				percentage: data.percentage,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp
			};
		},

		calculatePerc: function(){

			data.allItems.exp.forEach(function(element){
				element.calcPerc(data.totals.inc);
			});
		},

		getAllPercs: function(){

			var percs = data.allItems.exp.map(function(element){
				return element.getPerc();
			});

			return percs;
		},

		testing: function()
		{
			console.log(data);
		}
	};

})();

var UIcontroller = (function(){

	var DOMstrings = {
		inputType: '.add__type',
		inputDesc: '.add__description',
		inputVal: '.add__value',
		inputBtn: '.add__btn',
		incomeList: '.income__list',
		expenseList: '.expenses__list',
		budgetVal: '.budget__value',
		incVal: '.budget__income--value',
		expVal: '.budget__expenses--value',
		percentageVal: '.budget__expenses--percentage',
		container: '.container',
		expPerc: '.item__percentage',
		date: '.budget__title--month'
	};
	
	var formatNum = function(num, type)
	{
		var numSplit,int,dec;

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		int = numSplit[0];
		dec = numSplit[1];

		if(int.length > 3)
		{
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3, int.length);
		}

		return (type === 'exp'? '-' : '+') + ' ' + int + '.' + dec;
	};

	var listForEach = function(list, callback)
	{
		for(var i=0;i < list.length;i++)
		{
			callback(list[i], i);
		}
	};

	return {
		getInput: function(){
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				desc: document.querySelector(DOMstrings.inputDesc).value,
				value: parseFloat(document.querySelector(DOMstrings.inputVal).value)
			};
		},
		getDomStrings: function(){
			return DOMstrings;
		},
		addNewInput: function(obj, type){

			var html, newHtml, element;

			if(type === 'inc')
			{
				element = DOMstrings.incomeList;
				html = '<div class="item clearfix" id="%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if(type == 'exp') {
				element = DOMstrings.expenseList;
				html = '<div class="item clearfix" id="%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			newHtml = html.replace('%id%', type + '-' + obj.id);
			newHtml = newHtml.replace('%desc%', obj.desc);
			newHtml = newHtml.replace('%value%', formatNum(obj.value, type));

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},
		deleteNewInput: function(id)
		{
			var element = document.querySelector('#' + id);
			element.parentNode.removeChild(element);
		},
		clearFields: function() {

			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputVal);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(element){
				element.value = "";
			});

			fieldsArr[0].focus();
		},
		displayBudget: function(obj)
		{
			var type;

			if(obj.budget >= 0)
			{
				type = 'inc';
			} else if (obj.budget < 0){
				type = 'exp';
			}

			document.querySelector(DOMstrings.budgetVal).textContent = formatNum(obj.budget, type);
			document.querySelector(DOMstrings.incVal).textContent =  formatNum(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expVal).textContent =  formatNum(obj.totalExp, 'exp');

			if(obj.percentage > 0)
			{
				document.querySelector(DOMstrings.percentageVal).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageVal).textContent = '--';
			}		
		},
		displayPerc: function(percs)
		{
			var fields = document.querySelectorAll(DOMstrings.expPerc);

			listForEach(fields, function(element, index){

				if(percs[index]>0)
				{
					element.textContent = percs[index] + '%';
				} else {
					element.textContent = '--';
				}
			});
		},
		displayDate: function()
		{
			var date,year,months,index;

			date = new Date();
			index = date.getMonth();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			year = date.getFullYear();

			document.querySelector(DOMstrings.date).textContent = months[index] + ' ' + year;
		},
		changedEvent: function()
		{
			var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputVal + ',' + DOMstrings.inputDesc);

			listForEach(fields, function(element){
				element.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

		}
	};

})();

var controller = (function(budgetCtrl, UIctrl){

	var setupEventListeners = function()
	{
		var DOM = UIctrl.getDomStrings();
		document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedEvent);
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		document.addEventListener('keypress', function(event){
			if(event.keyCode === 13 || event.which === 13)
			{
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
	}

	var updateBudget = function ()
	{
		var budget = budgetCtrl.calculateBudget();
		UIctrl.displayBudget(budget);
	}

	var updatePercentage = function()
	{
		budgetCtrl.calculatePerc();
		var Allpercs = budgetCtrl.getAllPercs();
		UIctrl.displayPerc(Allpercs);
	}

	var ctrlAddItem = function()
	{
		var input = UIctrl.getInput();
		
		if(input.desc !== "" && !isNaN(input.value) && input.value > 0)
		{
			var newItem = budgetCtrl.addNewItem(input.type, input.desc, input.value);
			UIctrl.addNewInput(newItem, input.type);
			UIctrl.clearFields();
			updateBudget();
			updatePercentage();
		}

	}

	var ctrlDeleteItem = function(event)
	{
		var itemID,splitID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID)
		{
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			budgetCtrl.deleteNewItem(type, ID);
		}

		UIctrl.deleteNewInput(itemID);

		updateBudget();
		updatePercentage();
	}

	return {
		init: function()
		{
			UIctrl.displayDate();
			setupEventListeners();
			UIctrl.displayBudget({
				budget: 0,
				percentage: -1,
				totalInc: 0,
				totalExp: 0
			});
		}
	};

})(budgetController, UIcontroller);

controller.init();