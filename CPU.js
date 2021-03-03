const { Supercell16, ProgramCounter } = require('./memory.js');
const { mux16, ALU, or, not, and } = require('./chips.js');

class CPU {
	constructor() {
		this.a_register = new Supercell16();
		this.d_register = new Supercell16();
		this.pc = new ProgramCounter();
	}
	next = (instruction, inM, reset) => {
		
		// decode
		const opcode = instruction.substring(0, 1);
		const a_bit = instruction.substring(3, 4);
		const c_bits = instruction.substring(4, 10);
		const d_bits = instruction.substring(10, 13);
		const j_bits = instruction.substring(13, 16);
	
		// execute
		const alu_input_one = this.d_register.cells;
		const alu_input_two = mux16(this.a_register.cells, inM, a_bit);
		const { out: alu_out, zr: alu_out_zr, ng: alu_out_ng } = ALU(alu_input_one, alu_input_two, c_bits);
		
		// write-back
		const a_register_next_value = mux16(instruction, alu_out, opcode);
		const is_write_a_register = or(not(opcode), d_bits.substring(0, 1));
		this.a_register.next(a_register_next_value, is_write_a_register);
		const is_write_d_register = and(opcode, d_bits.substring(1, 2));
		this.d_register.next(alu_out, is_write_d_register);

		// memory
		const outM = alu_out;
		const addressM = this.a_register.cells;
		const is_write_memory = and(opcode, d_bits.substring(2, 3));

		// PC
		const get_jump = () => {
			if (opcode === '0') return '0';
			let jump = '0';
			switch(j_bits) {
				case '000':
					jump = '0';
					break;
				case '111':
					jump = '1';
					break;
				case '001':
					jump = and(not(alu_out_zr), not(alu_out_ng));
					break;
				case '010':
					jump = alu_out_zr;
					break;
				case '011':
					jump = or(alu_out_zr, not(alu_out_ng));
					break;
				case '100':
					jump = alu_out_ng;
					break;
				case '101':
					jump = not(alu_out_zr);
					break;
				case '110':
					jump = or(alu_out_zr, alu_out_ng);
					break;
			}
			return jump;
		}

		const is_jump = get_jump();
		const is_inc = not(is_jump);
		return {
			outM,
			addressM,
			writeM: is_write_memory,
			PC: this.pc.next(this.a_register.cells, is_inc, is_jump, reset),
			is_halt: c_bits === '100000',
		}
	}
}

module.exports = { CPU };
