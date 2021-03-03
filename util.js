const replaceStringAtIndex = (str, char, idx) => {
	return str.substring(0, idx) + char + str.substring(idx + 1);
}

const generateBitStrings = num_bits => {
	let arr = ['0', '1'];
	for (let i = 0; i < num_bits - 1; i++) {
		arr.forEach(str => {
			arr.push(str + '0');
			arr.push(str + '1');
		})
	}
	
	arr = arr.map(str => padBitStrings(str, num_bits));
	return [...new Set(arr)];
}

const padBitStrings = (str, str_len) => {
	while (str.length !== str_len) {
		str = '0' + str;
	}
	return str;
}

module.exports = {
	replaceStringAtIndex,
	generateBitStrings
}
