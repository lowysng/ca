const { Computer } = require('./Computer.js');
const c = new Computer('Bob', 32);
if (process.argv[2] === '-i') {
	c.inspect();
} else {
	c.run();
}
