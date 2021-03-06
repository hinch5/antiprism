const assert = require('assert').strict.ok;

class DatabaseProvider {
	constructor(models) {
		assert(models instanceof Array);
		this._models = {};
		models.forEach(m => {
			this._models[m.name] = m;
		})
	}
	insertModel(model, fields) {
		assert(false, 'unimplemented insertModel');
	}
	getModels(model, fields, where, group, sort) {
		assert(false, 'unimplemented getModels');
	}
	updateModels(model, sets, where) {
		assert(false, 'unimplemented updateModels');
	}
	deleteModels(model, where) {
		assert(false, 'unimplemented deleteModels');
	}
	connect() {
		assert(false, 'unimplemented connect');
	}
	disconnect() {
		assert(false, 'unimplemented disconnect');
	}
	init() {
		assert(false, 'unimplemented init');
	}
	validateGets(model, gets) {
		return gets.map(f => this.validateGetParameter(model, f)).reduce((prev, cur) => prev && cur, true);
	}
	validateSets(model, sets) {
		return sets.map(f =>  this.validateSetParameter(model, f.name, f.value)).reduce((prev, cur) => prev && cur, true);
	}
	validateSorts(model, sorts) {
		return sorts.map(s => this.validateSortParameter(model, s.name)).reduce((prev, cur) => prev && cur, true);
	}
	validateGroupings(model, groups) {
		return groups.map(g => this.validateGroupingParameter(model, g)).reduce((prev, cur) => prev && cur, true);
	}
	validateGetParameter(model, param) {
		let value;
		if (param instanceof String || typeof param === 'string') {
			value = param;
		} else if (param instanceof GetParameter) {
			value = param.name;
		} else if (param instanceof Object && param.hasOwnProperty('name')) {
			value = param.name;
		} else {
			assert(false, 'get parameter unknown type');
		}
		for (let prop in this._models[model].fields) {
			if (Object.prototype.hasOwnProperty.call(this._models[model].fields, prop)) {
				if (prop === value) {
					return true;
				}
			}
		}
		return false;
	}
	validateSetParameter(model, name, value) {
		assert(typeof name === 'string', 'set parameter unknown type');
		for (let prop in this._models[model].fields) {
			if (Object.prototype.hasOwnProperty.call(this._models[model].fields, prop)) {
				if (prop === name) {
					const typeName = this._models[model].fields[name].typeName.toLowerCase();
					if (value instanceof Object && value.isDefault !== undefined) {
						assert(this._models[model].fields[name].default !== undefined, 'set default in non default field');
						return true;
					}
					if (typeName === 'int') {
						assert(value ===null || value instanceof Number || typeof value === 'number', '');
					} else if (typeName === 'float') {
						assert(value ===null || value instanceof Number || typeof value === 'number', '');
					} else if (typeName === 'string') {
						assert(value ===null || value instanceof String || typeof value === 'string', '');
					} else if (typeName === 'datetime') {
						assert(value ===null || value instanceof Date, '');
					} else if (typeName === 'boolean') {
						assert(value ===null || value instanceof Boolean || typeof value === 'boolean', '');
					} else {
						assert(false, 'unknown type');
					}
					return true;
				}
			}
		}
		return false;
	}
	validateWhereParameter(model, opType, op, args) {
		return args.map(a => {
			if (a instanceof WhereCondition) {
				return this.validateWhereParameter(model, a.opType, a.op, a.args);
			}
			if (a.type === 'Field') {
				return this._models[model].fields.hasOwnProperty(a.value);
			}
			return true;
			// type checks
		}).reduce((prev, curr) => prev && curr, true);
	}
	validateSortParameter(model, name) {
		for (let prop in this._models[model].fields) {
			if (Object.prototype.hasOwnProperty.call(this._models[model].fields, prop)) {
				if (prop === name) {
					return true;
				}
			}
		}
		return false;
	}
	validateGroupingParameter(model, param) {
		let value;
		if (param instanceof String || typeof param === 'string') {
			value = param;
		} else if (param instanceof SortParameter) {
			value = param.name;
		} else if (param instanceof Object && param.hasOwnProperty('name')) {
			value = param.name;
		} else {
			assert(false, 'grouping parameter unknown type');
		}
		for (let prop in this._models[model].fields) {
			if (Object.prototype.hasOwnProperty.call(this._models[model].fields, prop)) {
				if (prop === value) {
					return true;
				}
			}
		}
		return false;
	}
}

class DatabaseModel {
	constructor(provider, model) {
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		assert(model instanceof Object, 'expected model to be object');
		this._provider = provider;
		this._model = model;
	}
	static createModel() {
		assert(false, 'unimplemented create model');
	}
	static getModels() {
		assert(false, 'unimplemented get models');
	}
	update() {
		assert(false, 'unimplemented update');
	}
	delete() {
		assert(false, 'unimplemented delete');
	}
	applySets() {
		assert(false, 'unimplemented apply sets');
	}
	identWhereParams() {
		assert(false, 'unimplemented ident where params');
	}
}

const aggregateFunctions = {
	'sum': 'sum',
	'avg': 'avg'
};

class GetParameter {
	constructor(provider, name, operation, as) {
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		this.provider = provider;
		if (name instanceof Object && name.name) {
			this.fromObject(name);
		} else {
			this.name = name;
			if (operation) {
				assert(aggregateFunctions[operation], 'unexpected function on values');
				this.operation = operation;
			}
			if (as) {
				assert(typeof as === 'string', 'expected as to be string');
				this.as = as;
			}
		}
	}
	fromObject(obj) {
		this.name = obj.name;
		this.operation = obj.operation;
		this.as = obj.as;
	}
	toObject() {
		return {
			name: this.name,
			operation: this.operation,
			as: this.as
		}
	}
}

class SetParameter {
	constructor(provider, name, value) {
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		this.provider = provider;
		if (name instanceof Object && name.hasOwnProperty('name')) {
			this.fromObject(name);
		} else {
			this.name = name;
			this.value = value;
		}
	}
	fromObject(obj) {
		this.name = obj.name;
		if (obj.value && obj.value.isDate) {
			this.value = new Date(obj.value.value);
		} else {
			this.value = obj.value;
		}
	}
	toObject() {
		if (this.value instanceof Date) {
			return {
				name: this.name,
				value: {
					isDate: true,
					value: this.value.toUTCString()
				}
			}
		} else {
			return {
				name: this.name,
				value: this.value
			}
		}
	}
}

const whereUnaryOps = {
	'NOT': '!'
};

const whereBinaryOps = {
	'AND': '&&',
	'OR': '||',
	'EQUAL': '==',
	'LESS': '<',
	'ELESS': '<=',
	'GREATER': '>',
	'EGREATER': '>='
};

class WhereCondition {
	constructor(provider, opType, op, args) {
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		this.provider = provider;
		if (opType instanceof Object && opType.opType) {
			this.fromObject(opType);
		} else {
			assert(opType === 'unary' || opType === 'binary', 'expected opType to be unary or binary');
			if (opType === 'unary') {
				assert(op === '!', 'unexpected unary op');
			} else {
				assert(op === '&&' || op === '||' || op === '==' || op === '<' || op === '<=' || op === '>' || op === '>=', 'unexpected binary op');
			}
			args.forEach(a => {
				assert(a instanceof WhereCondition || a.type === 'Literal' || a.type === 'Field');
				if (a.type === 'Literal' || a.type === 'Field') {
					assert(a.hasOwnProperty('value'), 'expected value for literal or field');
				}
			});
			this.opType = opType;
			this.op = op;
			this.args = args;
		}
	}
	fromObject(obj) {
		this.opType = obj.opType;
		this.op = obj.op;
		this.args = obj.args.map(a => {
			if (a.hasOwnProperty('type')) {
				if (a.type === 'Literal' && a.value && a.value.isDate) {
					return {
						type: a.type,
						value: new Date(a.value.value)
					};
				} else {
					return {
						type: a.type,
						value: a.value
					};
				}
			} else {
				return new WhereCondition(this.provider, a);
			}
		});
	}
	toObject() {
		return {
			opType: this.opType,
			op: this.op,
			args: this.args.map(a => {
				if (a.value instanceof Date) {
					return {
						type: 'Literal',
						value: {
							isDate: true,
							value: a.value.toUTCString()
						}
					}
				} else {
					return a instanceof WhereCondition ? a.toObject() : a;
				}
			})
		};
	}
}

class SortParameter {
	constructor(provider, name, sortType) {
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		this.provider = provider;
		if (name instanceof Object && name.name) {
			this.fromObject(name);
		} else {
			this.name = name;
			if (sortType) {
				assert(sortType === 'desc' || sortType === 'asc');
				this.sortType = sortType;
			} else {
				this.sortType = 'asc';
			}
		}
	}
	fromObject(obj) {
		this.name = obj.name;
		this.sortType = obj.sortType;
	}
	toObject() {
		return {
			name: this.name,
			sortType: this.sortType
		}
	}
}

class GroupingParameter {
	constructor(provider, name) {
		assert(provider instanceof DatabaseProvider, 'expected provider to be DatabaseProvider instance');
		this.provider = provider;
		if (name instanceof Object && name.name) {
			this.fromObject(name);
		} else {
			this.name = name;
		}
	}
	fromObject(obj) {
		this.name = obj.name;
	}
	toObject() {
		return {
			name: this.name,
		}
	}
}

exports.GetParameter = GetParameter;
exports.SetParameter = SetParameter;
exports.WhereCondition = WhereCondition;
exports.SortParameter = SortParameter;
exports.GroupingParameter = GroupingParameter;
exports.DatabaseProvider = DatabaseProvider;
exports.DatabaseModel = DatabaseModel;