// C - instruction 
// todo add constants to separate file - only readable
const COMP_NOT_A_BINARY = {
    '0': '101010',
    '1': '111111',
    '-1': '111010',
    'D': '001100',
    'A': '110000',
    '!D': '001101',
    '!A': '110001',
    '-D': '001111',
    '-A': '110011',
    'D+1': '011111',
    'A+1': '110111',
    'D-1': '001110',
    'A-1': '110010',
    'D+A': '000010',
    'D-A': '010011',
    'A-D': '000111',
    'D&A': '000000',
    'D|A': '010101',
};
// A - instruction
const COMP_A_BINARY = {
    'M': '110000',
    '!M': '110001',
    '-M': '110011',
    'M+1': '110111',
    'M-1': '110010',
    'D+M': '000010',
    'D-M': '010011',
    'M-D': '000111',
    'D&M': '000000',
    'D|M': '010101',  
};

const JUMP_BINARY = {
    'null': '000',
    'JGT': '001',
    'JEQ': '010',
    'JGE': '011',
    'JLT': '100',
    'JNE': '101',
    'JLE': '110',
    'JMP': '111',
};

const DESTINATION_BINARY = {
    'null': '000',
    'M': '001',
    'D': '010',
    'MD': '011',
    'A': '100',
    'AM': '101',
    'AD': '110',
    'AMD': '111',
};

// { } Symbols: predefined, labels, variables
const PRE_DEFINED_SYMBOL_ADDRESSES = {
    'SP': 0,
    'LCL': 1,
    'ARG': 2,
    'THIS': 3,
    'THAT': 4,
    'R0': 0,
    'R1': 1,
    'R2': 2,
    'R3': 3,
    'R4': 4,
    'R5': 5,
    'R6': 6,
    'R7': 7,
    'R8': 8,
    'R9': 9,
    'R10': 10,
    'R11': 11,
    'R12': 12,
    'R13': 13,
    'R14': 14,
    'R15': 15,
    'SCREEN': 16384,
    'KBD': 24576,  
};

// Read file line by line --> translate to C and A
// Parsing: ignore whitespace and comments //
const readline = require('readline');
const fs = require('fs');
const file = process.argv[2];

const rl = readline.createInterface({
    input: fs.createReadStream(file),
    output: process.stdout,
    terminal: false
});

const outfile_name = file
    .split('/')
    .find((file) => file.includes('.asm'))
    .replace(/.asm/, '.hack');

out_file = fs.openSync(outfile_name, 'w');

const asm_parser = parse_asm();
rl.on('line', (asm_line) => {
    const ignore_line = should_ignore_line(asm_line);
    if (ignore_line) return;

    const parsed_asm = asm_parser(asm_line);

    if (!parsed_asm) return;

    fs.write(out_file, parsed_asm + '\n', () => {
        // console.log('object');
    });
});

function parse_asm() {
    const symbol_address_table = {
        ...PRE_DEFINED_SYMBOL_ADDRESSES,
    };

    const dest_binary_table = {
        ...DESTINATION_BINARY,
    };

    const jump_binary_table = {
        ...JUMP_BINARY,
    };

    const comp_binary_table_a = {
        ...COMP_A_BINARY,
    };

    const comp_binary_table_not_a = {
        ...COMP_NOT_A_BINARY,
    };

    return function parse(asm_line) {
        let asm_stripped = strip_inline_comment(asm_line);
        let hack;
    
        if (asm_stripped.startsWith('@')) hack = parse_a_instruction(asm_stripped);
        else hack = parse_c_instruction(asm_stripped);
    
        return hack;
    };
}

function parse_a_instruction(asm_line) {
    const op_code = '0';
    // can be to symbol @LOOP, @R1 or number @34
    let a_instruction = asm_line.split('@')[1];
    const a_num = Number(a_instruction);
    // if number: opcode + number in binary 15
    if (typeof a_num === 'number') {
        const num_binary = a_num.toString(2).padStart(15, '0');
        return `${op_code}${num_binary}`
    } else {
        // if symbol - variable: lookup variable in hash table else add,
        // if symbol - label: handle label
    }
    return asm_line;
}

function parse_c_instruction(asm_line) {
    let asm_stripped = strip_inline_comment(asm_line);
    // if no jumps
    const jump = '000';
    const op_code = '111';
    const a = '0';
    if (asm_stripped.includes('=')) {
        const c_asm_arr = asm_stripped.split('=');
        const c_binary_arr = c_asm_arr.map((asm, i) => {
            if (i === 0) return DESTINATION_BINARY[asm];
            return COMP_NOT_A_BINARY[asm];
        });
        return `${op_code}${a}${c_binary_arr.reverse().join('')}${jump}`;
    }
    // todo add check for jump
    return asm_line;
}

function strip_inline_comment(asm_line) {
    const has_inline_comment = asm_line.includes('//');
    if (has_inline_comment) {
        return asm_line.split('//')[0].trim();
    }
    return asm_line;
}

function should_ignore_line(asm_line) {
    return is_comment(asm_line) || asm_line === '';
}

function is_comment(asm_line) {
    const comment_re = /^\/\//;
    return comment_re.test(asm_line);
}