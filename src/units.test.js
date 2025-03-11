const Units = require('./units.js');

describe("Units class test cases", () => {

  let unitsSystem;

  beforeEach(() => {
    unitsSystem = new Units();
  });

  describe("General functionality", () => {
    test("addUnit - add a new unit", () => {
      unitsSystem.addUnit({ name: 'seria3', symbol: 'e46', toBaseCoeff: 2, group: 'bmw' });
      expect(unitsSystem._units['seria3']).toBeDefined();
    });

    test("initializeUnits - default units", () => {
      expect(Object.keys(unitsSystem._units).length).toBeGreaterThan(0);
    });
  });

  describe("Conversion", () => { // Grupa testów - konwersja jednostek
    test("convert - m to cm", () => {
      expect(unitsSystem.convert(1, "meter", "centimeter")).toBe(100);
    });

    test("convert - cm to m", () => {
      expect(unitsSystem.convert(100, "centimeter", "meter")).toBe(1);
    });

    test("convert - mm to m", () => {
      expect(unitsSystem.convert(1000, "millimeter", "meter")).toBeCloseTo(1, 5);
    });

    test("convert - square cm to square m", () => {
      expect(unitsSystem.convert(100, "centimeter", "meter", 2)).toBeCloseTo(0.01, 5);
    });

    test("convert - cubic m to cubic cm", () => {
      expect(unitsSystem.convert(4, "meter", "centimeter", 3)).toBeCloseTo(4000000, 5);
    });

    test("convert - different groups - throws error", () => {
      expect(() => unitsSystem.convert(1, "meter", "kilogram")).toThrowError("not the same group");
    });

    test("convert - invalid input unit - throws error", () => {
      expect(() => unitsSystem.convert(1, "invalidUnit", "meter")).toThrow(TypeError);
    });

    test("convert - invalid output unit - throws error", () => {
      expect(() => unitsSystem.convert(1, "meter", "invalidUnit")).toThrow(TypeError);
    });

    test("convert - inches to meters", () => {
      expect(unitsSystem.convert(1, "inch", "meter")).toBeCloseTo(0.0254, 5);
    });

    test("convert - cm to feet", () => {
      expect(unitsSystem.convert(100, "centimeter", "foot")).toBeCloseTo(3.28084, 3);
    });

    test("convert - mass units with power other than 1 - throws error", () => {
      expect(() => unitsSystem.convert(1, "kilogram", "gram", 2)).toThrowError("mass units only have 1 power");
    });

    test("convert - zero value - edge case", () => {
      expect(unitsSystem.convert(0, "meter", "centimeter")).toBe(0);
    });
  });

  describe("Formatting", () => {
    test("format - m to cm", () => {
      expect(unitsSystem.format(1, "meter", "centimeter")).toBe("100 cm");
    });

    test("format - cm to m", () => {
      expect(unitsSystem.format(100, "centimeter", "meter")).toBe("1 m");
    });

    test("format - cm3 to m3", () => {
      const result = unitsSystem.format(1000, "centimeter", "meter", 3);

      expect(result).toEqual(expect.stringContaining("m^3"));
      expect(Number(result.replace("m^3", "").trim())).toBeCloseTo(0.001, 5);
    });

    test("format - mass units with power other than 1 - throws error", () => {
      const groups = unitsSystem.getGroups();
      expect(() => unitsSystem.format(1, "kilogram", "gram", 2)).toThrowError("mass units only have 1 power");
    });
  });

  describe("Getting units", () => {
    test("getUnits - decelerated units for length group", () => {
      const lengthUnits = unitsSystem.getUnits("length");
      expect(lengthUnits).toEqual(expect.arrayContaining(["meter", "centimeter", "millimeter", "inch", "foot"]));
    });

    test("getUnits - empty array for unknown group", () => {
      const unknownUnits = unitsSystem.getUnits("audiol");
      expect(unknownUnits).toEqual([]);
    });
  });

  describe("Getting groups", () => {
    test("getGroups - initialized in a constructor groups", () => {
      const groups = unitsSystem.getGroups();
      expect(groups).toEqual(expect.arrayContaining(["length", "mass"]));
    });
  });

  describe("Calculations", () => {
    test("calculate - 1m + 2mm - value in millimeters", () => {
      expect(unitsSystem.calculate("1m + 2mm", "mm")).toBeCloseTo(1002, 5);
    });

    test("calculate subtracting - 1m - 2mm - value in meters", () => {
      expect(unitsSystem.calculate("1m - 2mm", "m")).toBeCloseTo(0.998, 5);
    });

    test("calculate multiple - 1m + 2mm + 3cm - value in meters", () => {
      expect(unitsSystem.calculate("1m - 2mm - 3cm", "m")).toBeCloseTo(0.968, 5);
    });

    test("calculate multiple subtractions - subtracts values correctly", () => {
      expect(unitsSystem.calculate("5m - 2m - 1m", "meter")).toBe(2);
    });

    test("calculate - unknown output unit - throws error", () => {
      expect(() => unitsSystem.calculate("1m + 2mm", "invalidUnit")).toThrowError("unknown output unit: invalidUnit");
    });

    test("calculate unknown value - handled - 1m + ab 2mm", () => {
      expect(unitsSystem.calculate("1m + ab 2mm", "m")).toBeCloseTo(1.002, 5);
    });

    test("calculate - empty part in expression - skips - handled - 1m ++ 2mm", () => {
      expect(unitsSystem.calculate("1m ++ 2mm", "m")).toBeCloseTo(1.002, 5);
    });

    test("calculate - invalid expression format - throws error", () => {
      expect(() => unitsSystem.calculate("ford ranger raptor", "meter")).toThrowError("invalid expression");
    });

    test("calculate - unknown unit symbol - throws error", () => {
      expect(() => unitsSystem.calculate("1m + 2jaguar", "meter")).toThrowError("unknown unit: jaguar");
    });

    test("calculate - different groups - throws error", () => {
      expect(() => unitsSystem.calculate("1m + 2kg", "meter")).toThrowError("units no in the same group");
    });

    test("calculate - output unit in different group - throws error", () => {
      expect(() => unitsSystem.calculate("1m + 2mm", "kilogram")).toThrowError("output unit no in the same group as input");
    });
  })
});