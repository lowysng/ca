const { CPU } = require('./CPU.js');
const { RAMn } = require('./memory.js');
const { inc16 } = require('./chips.js');

class Computer {
	constructor(name, memory_size) {
		this.name = name || 'Bob';
		this.memory_size = memory_size;
		this.CPU = new CPU();
		this.i_mem = new RAMn(memory_size);
		this.d_mem = new RAMn(memory_size);
		this.instruction;
		this.inM;
		this.halt;
		
		this.load_instructions();	
	}
	
	load_instructions = () => {
		// load binary code stored in out
		const fs = require('fs');
		let address = '0000000000000000';
		const tokens = fs.readFileSync('./out').toString().split('\n');
		tokens.forEach((instruction, idx) => {
			if (idx === this.memory_size) {
				throw new Error('Not enough memory for instructions!');
			} else if (instruction) {
				this.i_mem.next(instruction, '1', address);
				address = inc16(address);
			}
		})	
	}

	reset = () => {
		this.instruction = this.i_mem.next('', '', '0000000000000000');
		this.inM = this.d_mem.next('0000000000000000', '0', '0000000000000000');
		this.halt = 0;
	}
	
	step = () => {
		const { PC, outM, writeM, addressM, is_halt } = this.CPU.next(this.instruction, this.inM, '0');
		this.instruction = this.i_mem.next('', '', PC);
		this.inM = this.d_mem.next(outM, writeM, addressM);
		this.halt = is_halt;
	}

	run = () => {
		this.reset();
		while (!this.halt) {
			this.step();
		}
	}

	inspect = () => {
		this.reset();
		const hist_CPU_a_reg = [this.CPU.a_register.cells];
		const hist_CPU_d_reg = [this.CPU.d_register.cells];
		const hist_CPU_pc = [this.CPU.pc.supercell.cells];
		const hist_instructions = [this.instruction];
		const hist_mem = [
			this.i_mem.supercells.map((supercell, idx) => {
				return `[${ idx < 10 ? 0 : ''}${idx}] ${supercell.cells}\t\t[${ idx < 10 ? 0 : ''}${idx}] ${this.d_mem.supercells[idx].cells}`
			}).join('\n')
		]
		
		while(!this.halt) {
			this.step();
			hist_CPU_a_reg.push(this.CPU.a_register.cells);
			hist_CPU_d_reg.push(this.CPU.d_register.cells);
			hist_CPU_pc.push(this.CPU.pc.supercell.cells);
			hist_instructions.push(this.instruction);
			hist_mem.push(this.i_mem.supercells.map((supercell, idx) => {
				return `[${ idx < 10 ? 0 : ''}${idx}] ${supercell.cells}\t\t[${ idx < 10 ? 0 : ''}${idx}] ${this.d_mem.supercells[idx].cells}`
				}).join('\n'));
		}

		let state = 0;
		const max_state = hist_CPU_a_reg.length;
		
		const rerender_console = () => {
			console.clear();
			console.log('Running Bob in inspect mode.');
			console.log(`Use Left Arrow and Right Arrow to step through ${this.name}\'s state.`);
			console.log(`Use CTRL+C to quit.\n`);
			console.log(`State: ${state} ${(state === max_state - 1) ? '(HALT)' : ''}`);
			console.log(`CPU A register: ${hist_CPU_a_reg[state]}`);
			console.log(`CPU D register: ${hist_CPU_d_reg[state]}`);
			console.log(`CPU Program counter: ${hist_CPU_pc[state]}`);
			console.log(`Current instruction: ${hist_instructions[state]}\n`);
			console.log(`Instruction memory:\t\tData memory:`);
			console.log(`${hist_mem[state]}`);
		}
		rerender_console();

		const readline = require('readline');
		readline.emitKeypressEvents(process.stdin);
		process.stdin.setRawMode(true);
		process.stdin.on('keypress', (str, key) => {
  			if (key.ctrl && key.name === 'c') {
				console.clear();
    				process.exit();
  			} else if (key.name === 'left' && state !== 0) {
  				state = state - 1;
				rerender_console();
			} else if (key.name === 'right' && state !== (max_state - 1)) {
				state = state + 1;
				rerender_console();
			}
		});
		
	}
}

module.exports = { Computer };
