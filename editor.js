"use strict"
const helper = require('jsdoc/util/templateHelper');
const doop = require('jsdoc/util/doop');
let data;

function find(spec) {
    return helper.find(data, spec);
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to
 * check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
module.exports.attachModuleSymbols = function(doclets, modules) {

	var symbols = {};

	// build a lookup table
	doclets.forEach(function(symbol) {
		symbols[symbol.longname] = symbols[symbol.longname] || [];
		symbols[symbol.longname].push(symbol);
	});

	modules.forEach(function(module) {
		if (symbols[module.longname]) {
			module.modules = symbols[module.longname]
				// Only show symbols that have a description. Make an exception for classes, because
				// we want to show the constructor-signature heading no matter what.
				.filter(function(symbol) {
					return symbol.description || symbol.kind === 'class';
				})
				.map(function(symbol) {
					symbol = doop(symbol);

					if (symbol.kind === 'class' || symbol.kind === 'function') {
						symbol.name = symbol.name.replace('module:', '(require("') + '"))';
					}

					return symbol;
				});
		}
	});
}

module.exports.makeMenu = function(list,taffy){
	data = taffy;
	const menu = {
		home:{
			link:'/'
		}
	}
	Object.keys(list).forEach((type)=>{
		menu[type] = {};
		list[type].forEach((item)=>{
			menu[type][item.name]={
				id:item.___id,
				longname:item.longname||item.name
			}
			const children = find({kind: 'function', memberof:item.longname});
			if(children.length){
				menu[type][item.name].children = getChildren(children);
			}
		})
	})
	function getChildren(list){
		const item = {};
		list.forEach((i)=>{
			item[i.name] = {
				id:i.___id,
				longname:i.longname
			}
		})
		return item;
	}
	return menu;
}