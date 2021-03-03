const nand = (a, b) => {
	if (a === '1' && b === '1') return '0';
	return '1';
}

const not = a => {
	return nand(a, a);
}

const and = (a, b) => {
	return not(nand(a, b));
}

const or = (a, b) => {
	return nand(nand(a, a), nand(b, b));
}

const xor = (a, b) => {
	const c = nand(a, b);
	return nand(nand(a, c), nand(b, c));
}

const mux = (a, b, sel) => {
	return or(and(a, not(sel)), and(b, sel));
}

const dmux = (input, sel) => {
	const { replaceStringAtIndex } = require('./util.js');
	return replaceStringAtIndex('00', input, Number(sel));
}

const not16 = a => {
	let out = '';
	for (let i = 0; i < 16; i++) {
		out += not(a.substring(i, i+1));
	}
	return out;
}

const and16 = (a, b) => {
	let out = '';
	for (let i = 0; i < 16; i++) {
		out += and(a.substring(i, i+1), b.substring(i, i+1));
	}
	return out;
}

const or16 = (a, b) => {
	let out = '';
	for (let i = 0; i < 16; i++) {
		out += or(a.substring(i, i+1), b.substring(i, i+1));
	}
	return out;
}

const mux16 = (a, b, sel) => {
	return (sel === '0' ? a : b);
}

const or8way = (...inputs) => {
	let out = '0';
	let i = 0;
	while (out !== '1') {
		out = or(out, inputs[i]);
		i++;
	}
	return out;
}

const mux4way16 = (a, b, c, d, sel) => {
	switch (sel) {
		case '00':
			return a;
		case '01':
			return b;
		case '10':
			return c;
		case '11':
			return d;
	}
}

const mux8way16 = (...args) => {
	const sel = args[args.length - 1];
	const idx = Number(sel.substring(0, 1)) * 4 + Number(sel.substring(1, 2)) * 2 + Number(sel.substring(2, 3)) * 1;
	return args[idx];
}

const dmux4way = (input, sel) => {
	const { replaceStringAtIndex } = require('./util.js');
	const idx = Number(sel.substring(0, 1)) * 2 + Number(sel.substring(1, 2)) * 1;
	return replaceStringAtIndex('0000', input, idx);
}

const dmux8way = (input, sel) => {
	const { replaceStringAtIndex } = require('./util.js');
	const idx = Number(sel.substring(0, 1)) * 4 + Number(sel.substring(1, 2)) * 2 + Number(sel.substring(2, 3)) * 1;
	return replaceStringAtIndex('00000000', input, idx);
}

const half_adder = (a, b) => {
	return {
		carry: and(a, b),
		sum: xor(a, b)
	}
}

const full_adder = (a, b, carry_in) => {
	const { carry: first_carry, sum: first_sum } = half_adder(a, b);
	const { carry: second_carry, sum: second_sum } = half_adder(carry_in, first_sum);
	return {
		carry: or(first_carry, second_carry),
		sum: second_sum
	}
}

const add16 = (a, b) => {
	let out = '';
	let sum = '';
	let carry = '0';
	for (let i = 15; i >= 0; i--) {
		const result = full_adder(a.substring(i, i+1), b.substring(i, i+1), carry);
		sum = result.sum;
		carry = result.carry;
		out = sum + out;
	}
	return out;
}

const inc16 = a => {
	return add16(a, '0000000000000001');
}

const ALU = (x, y, control_bits) => {
	const extract_control_bits = control_bits => {
		const arr = ['zx', 'nx', 'zy', 'ny', 'f', 'no'];
		const obj = {};
		for (let i = 0; i < control_bits.length; i++) {
			obj[arr[i]] = Number(control_bits.substring(i, i+1));
		}
		return obj;
	}

	const { zx, nx, zy, ny, f, no } = extract_control_bits(control_bits);
	if (zx) x = '0000000000000000';
	if (nx) x = not16(x);
	if (zy) y = '0000000000000000';
	if (ny) y = not16(y);

	let out = '';
	if (f) {
		out = add16(x, y);
	} else {
		out = and16(x, y);
	}

	if (no) out = not16(out);

	let zr = '0';
	let ng = '0';
	if (out.split('').every(a => a === '0')) zr = '1';
	if (out.substring(0, 1) === '1') ng = '1';

	return {
		out,
		zr,
		ng
	}
}

module.exports = {
	nand,
	not,
	and,
	or,
	xor,
	mux,
	dmux,
	not16,
	and16,
	or16,
	mux16,
	or8way,
	mux4way16,
	mux8way16,
	dmux4way,
	dmux8way,
	half_adder,
	full_adder,
	add16,
	inc16,
	ALU
}
