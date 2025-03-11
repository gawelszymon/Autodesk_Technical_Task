module.exports = class Units {
  constructor() {
    this._units = {};
    this.initializeUnits();
  }

  addUnit(unit) {
    this._units[unit.name] = unit;
  }

  initializeUnits() {
    // length
    this.addUnit(new Unit('meter', 'm', 1, 'length'));
    this.addUnit(new Unit('centimeter', 'cm', 0.01, 'length'));
    this.addUnit(new Unit('millimeter', 'mm', 0.001, 'length'));
    this.addUnit(new Unit('inch', 'in', 0.0254, 'length'));
    this.addUnit(new Unit('foot', 'ft', 0.3048, 'length'));

    // mass
    this.addUnit(new Unit('gram', 'g', 0.001, 'mass'));
    this.addUnit(new Unit('kilogram', 'kg', 1, 'mass'));
    this.addUnit(new Unit('ton', 't', 1000, 'mass'));
  }

  convert(value, inputUnit, outputUnit, power=1) {
    if (this._units[inputUnit].group !== this._units[outputUnit].group) {
      throw new Error('not the same group');
    }

    if (this._units[inputUnit].group === 'mass' && power !== 1) {
      throw new Error('mass units only have 1 power');
    }

    const inputCoeff = this._units[inputUnit].toBaseCoeff;
    const outputCoeff = this._units[outputUnit].toBaseCoeff;

    return (value * Math.pow(inputCoeff, power)) / Math.pow(outputCoeff, power);
  }

  format(value, inputUnit, outputUnit, power=1) {
    return `${this.convert(value, inputUnit, outputUnit, power)} ${
        this._units[outputUnit].symbol
      }${power > 1 ? '^' + power : ''}`;
  }

  getUnits(group) {
    return Object.values(this._units)
        .filter((unit) => unit.group === group)
        .map((unit) => unit.name);
  }

  getGroups() {
    const groups = Object.values(this._units)
        .map((unit) => unit.group);
    return [...new Set(groups)];
  }

  calculate(expression, outputUnit) {
    let outputUnitObj = this._units[outputUnit];

    if (!outputUnitObj) {
      outputUnitObj = Object.values(this._units).find(unit => unit.symbol === outputUnit);

      if (!outputUnitObj) {
        throw new Error(`unknown output unit: ${outputUnit}`);
      }

      outputUnit = outputUnitObj.name;
    }

    const regex = /(-?\d+\.?\d*)\s*([a-zA-Z]+)/;
    let match;
    let result = 0;
    let operator = '+';
    let expectedGroup = null;

    const parts = expression.split(/([+\-])/);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();

      if (!part) continue;

      if (part === '+' || part === '-') {
        operator = part;
        continue;
      }

      regex.lastIndex = 0;
      match = regex.exec(part);

      if (!match) {
        throw new Error(`invalid expression`);
      }

      const value = parseFloat(match[1]);
      const unitSymbol = match[2];

      const unitObj = Object.values(this._units).find(unit => unit.symbol === unitSymbol);

      if (!unitObj) {
        throw new Error(`unknown unit: ${unitSymbol}`);
      }

      const unit = unitObj.name;

      if (expectedGroup === null) {
        expectedGroup = this._units[unit].group;
      } else if (this._units[unit].group !== expectedGroup) {
        throw new Error('units no in the same group');
      }

      if (this._units[outputUnit].group !== expectedGroup) {
        throw new Error('output unit no in the same group as input');
      }

      const convertedValue = this.convert(value, unit, outputUnit);

      if (operator === '+') {
        result += convertedValue;
      } else if (operator === '-') {
        result -= convertedValue;
      }
    }

    return result;
  }
}

class Unit {
  constructor(name, symbol, toBaseCoeff, group) {
    this._name = name;
    this._symbol = symbol;
    this._toBaseCoeff = toBaseCoeff;
    this._group = group;
  }

  get name() {
    return this._name;
  }

  get symbol() {
    return this._symbol;
  }

  get toBaseCoeff() {
    return this._toBaseCoeff;
  }

  get group() {
    return this._group;
  }
}

// const Units = require('./units');
// const unitsSystem = new Units();

// try {
//   const result = unitsSystem.calculate("1m - 2mm", "meter");
//   console.log("Result:", result);
// } catch (error) {
//   console.error("Error:", error.message);
// }