const $ = (...input) => document.querySelector(input);
const $$ = (...inputs) => document.querySelectorAll(inputs);

const container = $('lottery-container');
const slots = $$('lottery-container .slot');
const images = $$('declaration .image');

$('.start').onclick = e => {
	play(80).then(res => {
		document.querySelector('lottery-container .result').classList.add(res);
		document.querySelector('lottery-container .result').classList.remove('hidden');
		setTimeout(() => {
			e.target.removeAttribute('disabled');
			document.querySelector('lottery-container .result').classList.add('hidden');
		}, 4000);
	});
	e.target.disabled = true;
};

slots.forEach(slot => {
	const imgs = [...images].map(i => {
		const img = document.createElement('img');
		img.classList.add('image');
		img.src = i.src;
		img.name = i.getAttribute('name') || 'Unknown';
		return img;
	});

	slot.append(...imgs.sort(() => Math.random() < Math.random() ? -1 : 1 ));
	//slot.querySelectorAll('.image:not(:first-child)').forEach(i => i.classList.add('hidden'));

	imgs.forEach((item, index) => {
		item.style.top = (imgs[0].getBoundingClientRect().height * index + (index * 5)) + 'px';
		item.setAttribute('original-position', item.style.top);
		item.setAttribute('height', imgs[0].getBoundingClientRect().height);
	});
});

const spin = (slot, fps = 1000, speed = 3) => new Promise(async resolve => {
	slot = slots[slot];
	const images = [...slot.querySelectorAll('.image')];

	let frame = 0;
	const maxFrame = Math.floor(Math.random() * 600 + 200);
	const positioned = images[Math.floor(Math.random() * images.length)];

	slot.parentElement.classList.add('blur');
	await new Promise(resolve => setTimeout(resolve, 210));

	images.forEach((item, index) => {
		item.style.top = (images[0].getBoundingClientRect().height * index + (index * 5)) + 'px';
		item.setAttribute('original-position', item.style.top);
		item.setAttribute('height', images[0].getBoundingClientRect().height);
	});

	const animation = setInterval(() => {
		frame += 1;

		if(frame > maxFrame / 2) speed = speed - .2 < 1 ? 1 : speed - .2;
		if(frame > maxFrame){
			if(parseCss(positioned.style.top).number === 0){
				resolve(positioned);
				clearInterval(animation);
			}
		}

		images.forEach((item, index) => {
			const top = parseCss(item.style.top).number;
			item.style.top = (top - speed) + 'px';
			const maxTop = (-item.getAttribute('height') - 30);

			if(top < maxTop){
				const lowest = parseCss(images.sort((a, b) => parseCss(b.style.top).number - parseCss(a.style.top).number)[0].style.top).number;
				item.style.top = (lowest + 1 * item.getAttribute('height') + 5) + 'px';
			}
		});
	}, 1000 / fps);

	await new Promise(resolve => setTimeout(resolve, 500));
	slot.parentElement.classList.remove('blur');
	slot.parentElement.classList.add('focus');

	await new Promise(resolve => setTimeout(resolve, 200));
	slot.parentElement.classList.remove('focus');
});

const play = async delay => new Promise(async setResult => {
	const promises = [];
	slots.forEach((slot, index) => promises.push(new Promise(resolve => setTimeout(async () => await resolve(spin(index)), index * delay))));
	console.log(promises);
	await Promise.all(promises).then(async () => {
		const values = [(await promises[0]).name, (await promises[1]).name, (await promises[2]).name];
		if(equal(values)) setResult('won');
		else setResult('lost');
	});
});

const parseCss = input => {
	const number = Number([...input.toString()].filter(char => Number.isFinite(Number(char)) || char === '-' || char === '.').join(''));
	const unit = [...input.toString()].filter(char => !Number.isFinite(Number(char)) && char !== '-' && char !== '.').join('');
	return { number, unit };
}

const equal = array => !!array.reduce(function(a, b){ return (a === b) ? a : NaN; });