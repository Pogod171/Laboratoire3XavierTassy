import { log } from "../log.js";

export default class CollectionFilter {
  constructor(objects, params, model) {
    this.objects = objects;
    this.params = params;
    this.model = model;
    this.fields = this.model.fields;
  }

  get() {
    if (this.params != null) for (let param in this.params) this.filter(param);
    return this.objects;
  }
  filter(param) {
    switch (true) {
      case param === "sort":
        const [field, order] = this.params[param].split(",");
        if (order != undefined && order.includes("desc")) 
          this.objects.sort((x, y) => this.innerCompare(y[field], x[field]));
        else 
          this.objects.sort((x, y) => this.innerCompare(x[field], y[field]));
        break;
      case param === "fields" || param === "field":
        let fieldsToSelect = this.params[param].split(/,\s*|,/);
        this.objects = this.objects.map((item) => {
          const selectedFields = {};
          for (const field of fieldsToSelect) {
            selectedFields[field] = item[field];
          }
          return selectedFields;
        });
        this.objects = this.removeDuplicates(this.objects, fieldsToSelect[0]);
        break;
      case param === "limit":
        this.objects = this.objects.slice(0, parseInt(this.params[param], 10));
        break;
      case param === "offset":
        this.objects = this.objects.slice(parseInt(this.params[param], 10));
        break;
      case this.isMember(param):
        this.objects = this.objects.filter((item) =>
          this.valueMatch(item[param], this.params[param])
        );
        break;
      default:
        console.log(
          "The value is not in the array, and it's not 'otherValue'."
        );
    }
  }
  isMember(propertyName) {
    let exist = false;
    this.fields.forEach((field) => {
      if (field.name == propertyName) exist = true;
    });
    return exist;
  }
  valueMatch(value, searchValue) {
    try {
      let exp = "^" + searchValue.toLowerCase().replace(/\*/g, ".*") + "$";
      return new RegExp(exp).test(value.toString().toLowerCase());
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  compareNum(x, y) {
    if (x === y) return 0;
    else if (x < y) return -1;
    return 1;
  }
  innerCompare(x, y) {
    if (typeof x === "string") return x.localeCompare(y);
    else return this.compareNum(x, y);
  }
  removeDuplicates(arr, propertyName) {
    const uniqueValues = new Set();
    return arr.filter((item) => {
      const key = item[propertyName];
      if (!uniqueValues.has(key)) {
        uniqueValues.add(key);
        return true;
      }
      return false;
    });
  }
}
