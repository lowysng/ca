class Supercell16 {
	constructor() {
		this.cells = '';
		for (let i = 0; i < 16; i++) {
			this.cells += '0';
		}
	}
	next = (input, is_load) => {
		if (input.length !== 16 && is_load === '1') throw new Error("Bad load, input length not 16.");
		if (is_load === '1') this.cells = input;
		return this.cells;
	}
}

class RAMn {
	constructor(n) {
		this.supercells = [];
		for (let i = 0; i < n; i++) {
			this.supercells.push(new Supercell16());
		}
	}
	next = (input, is_load, address) => {
		let idx = 0;
		for (let i = address.length - 1; i >= 0; i--) {
			idx += address.substring(i, i+1) * (2 ** (address.length - i - 1));
		}
		return this.supercells[idx].next(input, is_load);
	}
}

class ProgramCounter {
	constructor() {
		this.supercell = new Supercell16();
	}
	next = (input, is_inc, is_load, is_reset) => {
		if (is_reset === '1') {
			input = '0000000000000000';
			is_load = '1';
		} else if (is_inc === '1') {
			const { inc16 } = require('./chips.js');
			input = inc16(this.supercell.cells);
			is_load = '1';
		}
		return this.supercell.next(input, is_load);
	}
}

module.exports = {
	Supercell16,
	RAMn,
	ProgramCounter
}
