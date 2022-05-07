function addCharacter(ch) {

	document.getElementById("myText").value += ch;
	
}

var edit_id = "myOutput";

const R = 20;
var max_h;
var max_w;
var last_x;

const variabile = 'xyz';
const functii = 'fgh+−-∗*/^√!';
const predicate = 'PQR=≥≤><';
const constante = 'abc';

const single = '√!';
const conects = '∧∨⇒⇔';
const disjunct_ch = '∨';
const conjunct_ch = '∧';
const implic_ch = '⇒';
const equiv_ch = '⇔';
const neg_ch = '¬';
const cuantificatori = '∀∃';

const expresie = '"E"';
const termen = '"T"';
const formula = '"F"';
const neg = '"¬"';
const con = '"□"';
const quantif = '"Q"';
const variabil = '"v"';

class Node {

    constructor(value, parent = null, active = false) {
	
        this.value = value;
        this.children = [];
		this.parent = parent;
		this.active = active;
		this.x = 0;
		this.y = 0;
		
    }
	
}

function isUpper(ch) {
	return ((ch.toUpperCase() != ch.toLowerCase()) && (ch == ch.toUpperCase()));
}

function getPositions(node, lvl = 0) {
	
	if(node.children.length == 0) {
	
		node.x = last_x;
		last_x += 2 * R + 10;
	
	}
	else {
	
		node.x = 0;
	
		for(var child of node.children)
			node.x += getPositions(child, lvl + 1);
			
		node.x /= node.children.length;
		
	}
	
	node.y = lvl * 50 + R + 11;
	
	max_w = Math.max(max_w, node.x);
	max_h = Math.max(max_h, node.y);
		
	return node.x;

}

function drawTree(root, to_shift = false) {

	max_h = 0;
	max_w = 0;
	last_x = R + 1 + (to_shift ? 100 : 50);
	getPositions(root);

	var canvas = document.createElement("canvas");
	canvas.setAttribute("width", max_w + R + 1 + (to_shift ? 100 : 50));
	canvas.setAttribute("height", max_h + R + 21);
	
	var ctx = canvas.getContext("2d");
	ctx.font = '20px Calibri';
	ctx.strokeStyle = "#000";
	
	var cur_lvl = [root];
	
	while(cur_lvl.length) {
	
		var next_lvl = [];
		
		for(var node of cur_lvl) {
		
			var [x, y] = [node.x, node.y];
			
			for(var k = 0; k < 2; k += 0.2) {
			
				ctx.beginPath();
				ctx.arc(x, y, R, k * Math.PI, (k + (node.active ? 0.1 : 0.2)) * Math.PI);
				ctx.stroke();
			
			}
			
			const val = node.value;
			const view_x = (val.length == 2 || node.value == equiv_ch) ? x - 10 : (val.length >= 3) ? x - 12 : x - 5;
			const view_y = y + 4;
			
			ctx.strokeText(val, view_x, view_y);
			
			for(var child of node.children) {
			
				var [x_child, y_child] = [child.x, child.y];
			
				ctx.beginPath();
				ctx.moveTo(x, y + R);
				ctx.lineTo(x_child, y_child - R);
				ctx.stroke();
				
				next_lvl.push(child);
			
			}
		
		}
		
		cur_lvl = [...next_lvl];
	
	}
	
	document.getElementById(edit_id).appendChild(canvas);

}

function writeLine (str) {

	if(str == undefined) {
	
		document.getElementById(edit_id).appendChild(document.createElement("br"));
		return;
		
	}

	var paragraph = document.createElement("p");
	paragraph.innerHTML = str;
	document.getElementById(edit_id).appendChild(paragraph);

}

function isNumeric(value) {

    return /^-?\d+$/.test(value);
	
}

function dfs(node, termeni_simpli, termeni_compusi, formule_atomice, formule_compuse, formule_cuantificate, variabile_libere, variabile_legate, cuantificat = new Set()) {

	if(variabile.includes(node.value)) {
	
		termeni_simpli.add(node.value);
		
		if(!cuantificat.has(node.value))
			variabile_libere.add(node.value);
	
	}
	
	if(constante.includes(node.value) || isNumeric(node.value))
		termeni_simpli.add(node.value);
		
	if(functii.includes(node.value))
		termeni_compusi.add(node.value);
		
	if(predicate.includes(node.value))
		formule_atomice.add(node.value);
		
	if(conects.includes(node.value) || node.value == neg_ch)
		formule_compuse.add(node.value);
		
	if(cuantificatori.includes(node.value)) {
	
		formule_cuantificate.add(node.value);
		
		if(node.children.length && variabile.includes(node.children[0].value)) {
		
			cuantificat.add(node.children[0].value);
			variabile_legate.add([node.children[0].value, node.children.length > 1 ? node.children[1].value : 'nimic']);
			
		}
		
		if(node.children.length > 1)
			dfs(node.children[1], termeni_simpli, termeni_compusi, formule_atomice, formule_compuse, formule_cuantificate, variabile_libere, variabile_legate, cuantificat);
			
		if(node.children.length && variabile.includes(node.children[0].value))
			cuantificat.delete(node.children[0].value);
			
		return;
	
	}
	
	for(var child of node.children)
		dfs(child, termeni_simpli, termeni_compusi, formule_atomice, formule_compuse, formule_cuantificate, variabile_libere, variabile_legate, cuantificat);

}

function findTypes (root) {

	var termeni_simpli = new Set();
	var termeni_compusi = new Set();
	var formule_atomice = new Set();
	var formule_compuse = new Set();
	var formule_cuantificate = new Set();
	var variabile_libere = new Set();
	var variabile_legate = new Set();
	
	dfs(root, termeni_simpli, termeni_compusi, formule_atomice, formule_compuse, formule_cuantificate, variabile_libere, variabile_legate);

	writeLine();

	if(termeni_simpli.size) {
	
		var ans = '';
		
		for(var term of termeni_simpli)
			ans += term + ', ';
			
		writeLine('Termenii simpli (variabilele și constantele): ' + ans.slice(0, -2));
	
	}
	
	if(termeni_compusi.size) {
	
		var ans = '';
		
		for(var term of termeni_compusi)
			ans += term + ', ';
			
		writeLine('Termenii compuși (funcțiile): ' + ans.slice(0, -2));
	
	}
	
	if(formule_atomice.size) {
	
		var ans = '';
		
		for(var term of formule_atomice)
			ans += term + ', ';
			
		writeLine('Formulele atomice (predicatele): ' + ans.slice(0, -2));
	
	}
	
	if(formule_compuse.size) {
	
		var ans = '';
		
		for(var term of formule_compuse)
			ans += term + ', ';
			
		writeLine('Conectori care formează formulele compuse: ' + ans.slice(0, -2));
	
	}
	
	if(formule_cuantificate.size) {
	
		var ans = '';
		
		for(var term of formule_cuantificate)
			ans += term + ', ';
			
		writeLine('Cuantificatorii care formează formulele cuantificate: ' + ans.slice(0, -2));
	
	}
	
	if(variabile_libere.size) {
	
		var ans = '';
		
		for(var term of variabile_libere)
			ans += term + ', ';
			
		writeLine('Variabilele libere: ' + ans.slice(0, -2));
	
	}
	
	if(variabile_legate.size) {
	
		var ans = '';
		
		for(var term of variabile_legate)
			ans += term[0] + ' în ' + term[1] + ', ';
			
		writeLine('Variabilele legate: ' + ans.slice(0, -2));
	
	}
	
	writeLine();
	writeLine();

}

function errorMessage (str) {

	if(str == termen)
		return 'un termen';
		
	if(str == formula)
		return 'o formulă';
		
	if(str == neg)
		return 'o negație';
		
	if(str == con)
		return 'un conector logic';
		
	if(str == quantif)
		return 'un quantificator';
		
	if(str == variabil)
		return 'o variabilă';
		
	if(functii.includes(str) || predicate.includes(str))
		return 'o paranteză deschisă';
		
	return str;

}

function buildTree (str) {
	
	
	const t = new Node(expresie, null, true);
	let node = t;
	
	writeLine('Start: Setăm marcheru pe rădăcina arborelui și așteptăm o expresie');
	drawTree(t);
	
	const right_expr = 'Este o expresie a logicii predicatelor';
	const wrong_expr = 'Nu este o expresie a logicii predicatelor';
	let ans = right_expr;
	
	let two_posibilities = false;
	let k = 0;
	let i = 0;
	let found_answer = 0;
	
	var last = null;
	
	var aritate = new Map();
	
	for(i = 0; i < str.length; ++i) {
	
		const ch = str[i];
		
		if(ch == ' ')
			continue;
			
		if(node == 'final') {
		
			const cur = 'Nu se mai pot adăuga valori';
			writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
			
			break;
			
		}
		
		if(ch == '(') {
			
			if(node.value != expresie && node.value != formula && !functii.includes(node.value) && !predicate.includes(node.value)) {
			
				if(two_posibilities)
					node.value = 'o formulă sau negație';
					
				const cur = 'S-a așteptat ' + errorMessage(node.value) + ', însă a fost dată o paranteză';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				ans = wrong_expr;
				found_answer = 1;
				
				break;
				
			}
			
			if(functii.includes(last) || predicate.includes(last)) {
			
				const cur = 'S-a întâlnit o paranteză deschisă după ' + last + ', deci marcherul se deplasează pe primul subarbore al nodului';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				node.active = false;
				node = node.children[0];
				node.active = true;
			
			}
			else {
			
				if(two_posibilities) {
			
					const cur = 'S-a întâlnit o paranteză deschisă, arborele stâng nu poate fi corect. În arborele drept, formula vrea să fie compusă. Pot fi 2 posibilități';
					writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				}
				else {
			
					const cur = 'S-a întâlnit o paranteză deschisă, formula vrea să fie compusă. Pot fi 2 posibilități';
					writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				}
			
				if(i < str.length && str[i + 1] == neg_ch) {
			
					node.value = con;
					node.children = [new Node(formula, node, true), new Node(formula, node)];
					node.active = false;
					drawTree(t);
				
					node.active = true;
					node.value = neg;
					node.children = [new Node(formula, node)];
				
				}
				else {
				
					node.value = neg;
					node.children = [new Node(formula, node)];
					drawTree(t);
				
					node.value = con;
					node.children = [new Node(formula, node, true), new Node(formula, node)];
					node.active = false;
					node = node.children[0];
					node.active = true;
				
				}
			
				two_posibilities = true;
		
			}
			
		}
		else if(ch == ')') {
		
			if(node.value.length > 1) {
			
			    if(two_posibilities)
					node.value = 'o formulă sau negație';
					
				const cur = 'S-a așteptat ' + errorMessage(node.value) + ', însă a fost dată o paranteză';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				ans = wrong_expr;
				found_answer = 1;
				
				break;
				
			}
			
			node.active = false;
			
			var kuanti = 0;
			
			if(predicate.includes(node.value) || functii.includes(node.value)) {
			
				if(!aritate.has(node.value))
					aritate.set(node.value, node.children.length);
				else if(aritate.get(node.value) != node.children.length) {
				
					const cur = 'S-a așteptat ca aritate lui ' + node.value + ' să fie ' + aritate.get(node.value) + ', dar ea este ' + node.children.length;
					writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
					ans = wrong_expr;
					found_answer = 1;
				
					break;
				
				}
			
			}
			
			node = node.parent;
			
			while(node != null && cuantificatori.includes(node.value)) {
			
				kuanti++;
				node = node.parent;
			
			}
			
			if(node == null) {
			
				const cur = 'S-a întâlnit o paranteză închisă,' + (kuanti == 0 ? '' : kuanti == 1 ? ' marcherul trece peste cuantificator, ' : ' marcherul trece peste cuantificatori, ') + ' marcherul iese din arbore';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				node = 'final';
				
			}
			else {
			
				const cur = 'S-a întâlnit o paranteză închisă,' + (kuanti == 0 ? '' : kuanti == 1 ? ' marcherul trece peste cuantificator, ' : ' marcherul trece peste cuantificatori, ') + ' marcherul se deplasează spre părintele nodului';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				node.active = true;
				
			}
			
		}
		else if(ch == ',') {
		
			if(!functii.includes(node.value) && !predicate.includes(node.value)) {
			
				if(two_posibilities)
					node.value = 'o formulă sau negație';
					
				const cur = 'S-a așteptat ' + errorMessage(node.value) + ', însă a fost dată o virgulă';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				ans = wrong_expr;
				found_answer = 1;
				
				break;
				
			}
			
			if(aritate.get(node.value) == node.children.length) {
			
				const cur = 'S-a așteptat ca aritate lui ' + node.value + ' să fie ' + aritate.get(node.value) + ', dar ea vrea să fie mai mare';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				ans = wrong_expr;
				found_answer = 1;
				
				break;
			
			}
			
			const cur = 'S-a întâlnit o virgulă, mai creăm un subarbore și deplasăm marcherul pe el';
			writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
			
			node.children.push(new Node(termen, node, true));
			node.active = false;
			node = node.children[node.children.length - 1];
		
		}
		else if(conects.includes(ch)) {
		
			if(node.value != con) {
			
				if(two_posibilities)
					node.value = 'o formulă sau negație';
					
				const cur = 'S-a așteptat ' + errorMessage(node.value) + ', însă a fost dat un conector logic';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				ans = wrong_expr;
				found_answer = 1;
				
				break;
				
			}
		
			const cur = 'S-a întâlnit conector logic, marcherul se deplasează spre descendentul drept';
			writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
			
			node.value = ch;
			node.active = false;
			node = node.children[1];
			node.active = true;
			
		}
		else if(ch == neg_ch) {
		
			if(node.value != neg) {
			
				if(two_posibilities)
					node.value += 'o formulă sau negație';
					
				const cur = 'S-a așteptat ' + errorMessage(node.value) + ', însă a fost dată o negație';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				ans = wrong_expr;
				found_answer = 1;
				
				break;
				
			}
		
			const cur = 'S-a întâlnit negația, arborele stâng nu poate fi corect. În arborele drept, marcherul se deplasează spre descendentul nodului';
			writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
			
			node.value = neg_ch;
			node.active = false;
			node = node.children[0];
			node.active = true;
			
			two_posibilities = false;
			
		}
		else if(variabile.includes(ch)) {
		
			if(node.value != expresie && node.value != termen && node.value != variabil) {
			
				if(two_posibilities)
					node.value = 'o formulă sau negație';
					
				const cur = 'S-a așteptat ' + errorMessage(node.value) + ', însă a fost dată o variabilă obiect';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				ans = wrong_expr;
				found_answer = 1;
				
				break;
				
			}
			
			if(node.value == variabil) {
			
				const cur = 'S-a întâlnit o variabilă obiect, se închide subarborele și se trece la următorul';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				node.value = ch;
				node.active = false;
				node = node.parent.children[1];
				node.active = true;
			
			}
			else {
			
				if(two_posibilities) {
			
					const cur = 'S-a întâlnit o variabilă obiect, arborele stâng nu poate fi corect. În arborele drept, marcherul se deplasează spre părintele nodului';
					writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
					two_posibilities = false;
				
				}
				else {
			
				const cur = node == t ? 'S-a întâlnit o variabilă obiect, marcherul iese din arbore' : 'S-a întâlnit o variabilă obiect, marcherul se deplasează spre părintele nodului';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				}
			
				node.value = ch;
				node.active = false;
			
				if(node == t) {
			
					node = 'final';
				
				}
				else {
			
					node = node.parent;
					node.active = true;
				
				}
			
			}
		
		}
		else if(functii.includes(ch)) {
		
			if(node.value != expresie && node.value != termen) {
			
				if(two_posibilities)
					node.value = 'o formulă sau negație';
					
				const cur = 'S-a așteptat ' + errorMessage(node.value) + ', însă a fost dat un simbol funcțional';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				ans = wrong_expr;
				found_answer = 1;
				
				break;
			
			}
			
			const cur = 'S-a întâlnit un simbol funcțional, avem un termen compus, deci creăm un subarbore';
			writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
			
			node.value = ch;
			node.children = [new Node(termen, node)];
		
		}
		else if(predicate.includes(ch)) {
		
			if(node.value != expresie && node.value != formula) {
			
				if(two_posibilities)
					node.value = 'o formulă sau negație';
					
				const cur = 'S-a așteptat ' + errorMessage(node.value) + ', însă a fost dat un simbol predicativ';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				ans = wrong_expr;
				found_answer = 1;
				
				break;
			
			}
			
			const cur = 'S-a întâlnit un simbol predicativ' + (two_posibilities ? ', arborele stâng nu poate fi corect.' : '.') + ' Avem o formulă atomică, deci creăm un subarbore';
			writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
			
			node.value = ch;
			node.children = [new Node(termen, node)];
			
			two_posibilities = false;
		
		}
		else if(constante.includes(ch) || ('0' <= ch && ch <= '9')) {
		
			if(node.value != expresie && node.value != termen) {
			
				if(two_posibilities)
					node.value = 'o formulă sau negație';
					
				const cur = 'S-a așteptat ' + errorMessage(node.value) + ', însă a fost dată o constantă';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				ans = wrong_expr;
				found_answer = 1;
				
				break;
				
			}
			
			if(two_posibilities) {
			
				const cur = 'S-a întâlnit o constantă, arborele stâng nu poate fi corect. În arborele drept, marcherul se deplasează spre părintele nodului';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				two_posibilities = false;
				
			}
			else {
			
				const cur = node == t ? 'S-a întâlnit o constantă, marcherul iese din arbore' : 'S-a întâlnit o constantă, marcherul se deplasează spre părintele nodului';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
			}
			
			var operand = ch;
			if(('0' <= operand) && (operand <= '9'))
				while((i + 1 < str.length) && ('0' <= str[i + 1]) && (str[i + 1] <= '9'))
					operand += str[++i];
			
			node.value = operand;
			node.active = false;
			
			if(node == t) {
			
				node = 'final';
				
			}
			else {
			
				node = node.parent;
				node.active = true;
				
			}
		
		}
		else if(cuantificatori.includes(ch)) {
		
			if(node.value != expresie && node.value != formula) {
			
				if(two_posibilities)
					node.value = 'o formulă sau negație';
					
				const cur = 'S-a așteptat ' + errorMessage(node.value) + ', însă a fost dat un cuantificator';
				writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
				
				ans = wrong_expr;
				found_answer = 1;
				
				break;
			
			}
			
			const cur = 'S-a întâlnit un cuantificator, avem nevoie de o variabilă și de o formulă, poziția se mută pe primul subarbore';
			writeLine('Pasul ' + k.toString() + ' "' + ch + '": ' + cur);
			
			node.active = false;
			node.value = ch;
			node.children = [new Node(variabil, node, true), new Node(formula, node)];
			node = node.children[0];
		
		}
		else {
		
			writeLine('Pasul ' + k.toString() + ' "' + ch + '": S-a întâlnit caracter invalid');
			
			ans = wrong_expr + '. S-a întâlnit caracter invalid la indexul ' + k.toString();
			found_answer = 1;
			
			break;
			
		}
		
		last = ch;
		drawTree(t, two_posibilities);
		
		k++;
		
	}
	
	if(found_answer == 0) {
	
		if(node != 'final')
			ans = wrong_expr + '. Marcherul mai este prezent în arbore';
			
		else if(i != str.length)
			ans = wrong_expr + '. Marcherul a ieșit din arbore înainte să se termine stringul';
			
	}
	
	edit_id = "myResult";
	writeLine('<b>Rezultat:</b> ' + ans);
	
	findTypes(t);
	
}

function prefix (str) {

	writeLine("Transformăm simbolurile plasate din infix sau postfix în prefix, respectând precedența:");
	writeLine();
	
	const priorityArray = [
	
		[equiv_ch, 1], [implic_ch, 2], [disjunct_ch, 3], [conjunct_ch, 3], [neg_ch, 4], 
		['=', 5], ['≥', 5], ['≤', 5], ['>', 5], ['<', 5], ['∀', 6], ['∃', 6],
		['+', 7], ['−', 7], ['-', 7], ['+', 7], ['∗', 8], ['*', 8], ['/', 8], ['^', 9], ['√', 9], ['!', 10]
		
	];
	
	const priority = new Map(priorityArray);
	
	var operators = [];
	var operands = [];
	
	var op1, op2, op;
	
	var count_of_quantif = 0;
 
    for (var i = 0; i < str.length; ++i) {
	
		if(str[i] == ' ')
			continue;
			
        if(str[i] == '(')
            operators.push(str[i]);
			
        else if(str[i] == ')') {
		
            while(operators.length && (operators[operators.length - 1] != '(')) {
 
                op1 = operands.pop();
				op = operators.pop();
				
				if(!single.includes(op) && op != neg_ch)
					op2 = operands.pop();
				
                operands.push(cuantificatori.includes(op) ? op + op2 + op1 : conects.includes(op) ? '(' + op2 + ' ' + op + ' ' + op1 + ')' : single.includes(op) ? op + '(' + op1 + ')' : op == neg_ch ? '(' + op + op1 + ')' : op + '(' + op2 + ', ' + op1 + ')');
				
            }
 
			if(operators.length == 0 || operators[operators.length - 1] != '(')
				operands[operands.length - 1] += ')';
				
            operators.pop();
			
        }
        else if (!priority.has(str[i])) {
		
			var operand = str[i];
			
			if(('0' <= operand) && (operand <= '9')) {
			
				while((i + 1 < str.length) && ('0' <= str[i + 1]) && (str[i + 1] <= '9'))
					operand += str[++i];
					
				while(i + 1 < str.length && str[i + 1] == ' ')
					i++;
					
				if(i + 1 < str.length && 'a' <= str[i + 1] && str[i + 1] <= 'z')
					str = str.slice(0, i + 1) + '∗' + str.slice(i + 1);
			
			}
			else if('fgh'.includes(operand) || 'PQR'.includes(operand) && i + 1 < str.length && str[i + 1] == '(') {
			
				var opened = 0;
				var first_time = true;
				
				while(i + 1 < str.length && !priority.has(str[i + 1]) && (opened > 0 || first_time)) {
				
					operand += str[++i];
					
					if(str[i] == '(')
						opened++;
						
					if(str[i] == ')')
						opened--;
						
					first_time = false;
					
				}
				
			}
            operands.push(operand);
		
		}
			
        else {
		
			if(!cuantificatori.includes(str[i]))
            while(operators.length && (priority.get(str[i]) < priority.get(operators[operators.length - 1]))) {
 
                op1 = operands.pop();
				op = operators.pop();
				
				if(!single.includes(op) && op != neg_ch)
					op2 = operands.pop();
				
                operands.push(cuantificatori.includes(op) ? op + op2 + op1 : conects.includes(op) ? '(' + op2 + ' ' + op + ' ' + op1 + ')' : single.includes(op) ? op + '(' + op1 + ')' : op == neg_ch ? '(' + op + op1 + ')' : op + '(' + op2 + ', ' + op1 + ')');
				
            }
 
            operators.push(str[i]);
			
        }
		
		console.log(str[i], operands, operators);
		
    }
 
    while(operators.length) {
	
        op1 = operands.pop();
		op = operators.pop();
		
		if(!single.includes(op) && op != neg_ch) {
		
			op2 = operands.pop();
			
			if(op2 === undefined)
				return 'Eroare de paranteze';
			
		}
				
        operands.push(cuantificatori.includes(op) ? op + op2 + op1 : conects.includes(op) ? '(' + op2 + ' ' + op + ' ' + op1 + ')' : single.includes(op) ? op + '(' + op1 + ')' : op == neg_ch ? '(' + op + op1 + ')' : op + '(' + op2 + ', ' + op1 + ')');
		
		console.log(operands, operators);
		
    }
 
    return operands[operands.length - 1];

}

function buildExpression (ex_number = -1, tpa_val = -1) {

	edit_id = "myOutput";
	document.getElementById(edit_id).innerHTML = "";
	document.getElementById("myResult").innerHTML = "";

	const tpa = [
		['c', 'h', '(P ∧ Q)', 'P(f(x, a), g(h(c, a, g(y, z)))', 'f(g(f(a, h(b, g(x, y)))), Q(a, x))', '∀x((P(x, y) ∨ (R(f(x, y), g(f(y, z)), a))) ⇒ (P(a, b) ⇔ ∃yP(x, y)))', '(R(x, y, c) ∧ ∀aR(a, a, a))', '(h(x, y, c) ∨ ∃xQ(x, x))', 'P(x, y) ⇔ ∃xR(x, y, z)'],
		['4', '(8x − 5) + 7 ≥ (3 − 5x ⇔ y > 8z)', '¬(x − y < x^2 + y∗√(z)) ∧ (∃z((5 + 1) ∗ y = 5 x / y^2))', '∀x((x + 1) / (x^2 + 5) > (x^3 + 5x + 11) / (1 + (x - 8) / (x^4 - 1)))))', '¬P(x, y) ⇔ (∀x∃y∀z((P(y, z)∨Q(x, y, z)) ⇒ (R(x, z, y)∨¬P(x, z))))']
	];
	var str;
	
	if(tpa_val == -1)
		str = document.getElementById("myText").value;
	else {
	
		str = tpa[ex_number][tpa_val];
		document.getElementById("myText").value = str;
		
	}
	
	if(ex_number == 0)
		document.getElementById("relaxed").checked = false;
		
	if(ex_number == 1)
		document.getElementById("relaxed").checked = true;
	
	if(document.getElementById("relaxed").checked) {
	
		str = prefix(str);
		writeLine('<b>' + str + '</b>');
		writeLine();
	
	}
	
	if(str != 'Eroare de paranteze') {
	
		writeLine("Încercăm să construim arborele formulei:");
		writeLine();
		buildTree(str);
	
	}
	
}