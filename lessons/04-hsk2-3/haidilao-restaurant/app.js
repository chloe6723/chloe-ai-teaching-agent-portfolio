const steps=[
 {icon:'🎟️',zh:'取号等位',py:'qǔhào děngwèi',en:'Take a number & wait',key:'我们两位。要等多久？',keyPy:'Wǒmen liǎng wèi. Yào děng duō jiǔ?',keyEn:'There are two of us. How long is the wait?'},
 {icon:'🪑',zh:'入座选锅',py:'rùzuò xuǎn guō',en:'Sit down & choose soup',key:'我们要番茄锅。',keyPy:'Wǒmen yào fānqié guō.',keyEn:'We’d like tomato soup base.'},
 {icon:'📱',zh:'扫码点菜',py:'sǎomǎ diǎncài',en:'Scan & order',key:'请来一份虾滑。',keyPy:'Qǐng lái yí fèn xiāhuá.',keyEn:'One shrimp paste, please.'},
 {icon:'🥘',zh:'煮菜用餐',py:'zhǔ cài yòngcān',en:'Cook & eat',key:'这个要煮多久？',keyPy:'Zhège yào zhǔ duō jiǔ?',keyEn:'How long should this cook?'},
 {icon:'💳',zh:'结账离店',py:'jiézhàng lídiàn',en:'Pay & leave',key:'麻烦结账，谢谢。',keyPy:'Máfan jiézhàng, xièxie.',keyEn:'The bill, please. Thank you.'}
];
const phrases=[
 ['进店','请问几位？','Qǐngwèn jǐ wèi?','How many people?'],['等位','还要等多久？','Hái yào děng duō jiǔ?','How much longer is the wait?'],['选锅','我们不太能吃辣。','Wǒmen bú tài néng chī là.','We cannot eat very spicy food.'],
 ['选锅','请给我们鸳鸯锅。','Qǐng gěi wǒmen yuānyāng guō.','Please give us a divided pot.'],['点菜','请来一份虾滑。','Qǐng lái yí fèn xiāhuá.','One shrimp paste, please.'],['询问','这个菜要煮多久？','Zhège cài yào zhǔ duō jiǔ?','How long should this cook?'],
 ['服务','麻烦帮我加一点汤。','Máfan bāng wǒ jiā yìdiǎn tāng.','Please add a little soup.'],['服务','可以给我一条围裙吗？','Kěyǐ gěi wǒ yì tiáo wéiqún ma?','May I have an apron?'],['口味','这个太辣了。','Zhège tài là le.','This is too spicy.'],
 ['加菜','我们再加一份毛肚。','Wǒmen zài jiā yí fèn máodǔ.','We’ll add another tripe.'],['打包','剩下的可以打包吗？','Shèngxià de kěyǐ dǎbāo ma?','Can we take the rest to go?'],['结账','请帮我们结账。','Qǐng bāng wǒmen jiézhàng.','Please bring us the bill.']
];
const dishes=[
 ['🍅','番茄锅','fānqié guō','tomato soup base','酸甜、不辣，初学者很容易点。',38],['🍜','捞派捞面','Lāopài lāomiàn','dancing noodles','服务员会在桌边表演拉面。',18],['🥩','脆脆毛肚','cuìcuì máodǔ','crunchy beef tripe','口感脆，是经典火锅菜。',42],['🦆','捞派鸭肠','Lāopài yācháng','duck intestine','口感爽脆，需要涮熟。',36],
 ['🌶️','麻辣滑牛肉','málà huá niúròu','spicy tender beef','嫩滑，但味道比较辣。',46],['🍤','大颗粒虾滑','dà kēlì xiāhuá','chunky shrimp paste','虾肉多，口感很Q。',39],['🐑','捞派嫩羊肉','Lāopài nèn yángròu','tender lamb','羊肉嫩，适合火锅。',48],['🌿','8秒海带苗','bā miǎo hǎidàimiáo','8-second kelp sprouts','涮八秒，口感脆。',22]
];
const quiz=[
 {q:['欢迎光临，请问几位？','Huānyíng guānglín, qǐngwèn jǐ wèi?','Welcome! How many people?'],a:[['两位，谢谢。','Liǎng wèi, xièxie.'],['我要买衣服。','Wǒ yào mǎi yīfu.'],['今天星期三。','Jīntiān xīngqīsān.']],ok:0},
 {q:['您想要什么锅底？','Nín xiǎng yào shénme guōdǐ?','Which soup base would you like?'],a:[['我们要番茄锅，不太辣。','Wǒmen yào fānqié guō, bú tài là.'],['我们坐地铁来。','Wǒmen zuò dìtiě lái.'],['我有一个哥哥。','Wǒ yǒu yí ge gēge.']],ok:0},
 {q:['还需要什么菜？','Hái xūyào shénme cài?','What other dishes would you like?'],a:[['请来一份虾滑和一份羊肉。','Qǐng lái yí fèn xiāhuá hé yí fèn yángròu.'],['这个人是我的老师。','Zhège rén shì wǒ de lǎoshī.'],['我下午三点工作。','Wǒ xiàwǔ sān diǎn gōngzuò.']],ok:0},
 {q:['还需要什么服务吗？','Hái xūyào shénme fúwù ma?','Do you need anything else?'],a:[['麻烦帮我们加一点汤。','Máfan bāng wǒmen jiā yìdiǎn tāng.'],['我会说一点汉语。','Wǒ huì shuō yìdiǎn Hànyǔ.'],['明天天气很好。','Míngtiān tiānqì hěn hǎo.']],ok:0},
 {q:['请问还需要加菜吗？','Qǐngwèn hái xūyào jiā cài ma?','Would you like to add anything?'],a:[['不用了，请帮我们结账。','Bú yòng le, qǐng bāng wǒmen jiézhàng.'],['我不认识这个字。','Wǒ bú rènshi zhège zì.'],['我家有四口人。','Wǒ jiā yǒu sì kǒu rén.']],ok:0}
];
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
function speak(text){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=.82;speechSynthesis.speak(u)}
$('#steps').innerHTML=steps.map((x,i)=>`<button class="step${i===0?' active':''}"><span class="num">${i+1}</span><span class="icon">${x.icon}</span><h3>${x.zh}</h3><p>${x.py}</p><small>${x.en}</small><div class="key">${x.key}<small>${x.keyPy}<br>${x.keyEn}</small></div></button>`).join('');
$$('.step').forEach((b,i)=>b.onclick=()=>{$$('.step').forEach(x=>x.classList.remove('active'));b.classList.add('active');speak(steps[i].key)});
$('#phraseGrid').innerHTML=phrases.map(x=>`<button class="phrase-card speak" data-speech="${x[1]}"><span class="when">${x[0]}</span><b>${x[1]}</b><span>${x[2]}</span><small>${x[3]}</small></button>`).join('');
$('#dishGrid').innerHTML=dishes.map((x,i)=>`<article class="dish-card"><div class="dish-visual">${x[0]}</div><div class="dish-info"><h3>${x[1]}</h3><p class="py">${x[2]}</p><p class="en">${x[3]}</p><p>${x[4]}</p><div class="dish-foot"><b>¥${x[5]}*</b><button class="add-dish" data-i="${i}">＋ 加入菜单</button></div></div></article>`).join('');
let cart=new Set();function updateCart(){$('#cartCount').textContent=cart.size;$('#cartTotal').textContent='¥'+[...cart].reduce((n,i)=>n+dishes[i][5],0)}$$('.add-dish').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;cart.has(i)?cart.delete(i):cart.add(i);b.classList.toggle('selected');b.textContent=cart.has(i)?'✓ 已选择':'＋ 加入菜单';updateCart()});
$$('.speak').forEach(b=>b.onclick=()=>speak(b.dataset.speech));
$$('.nav-button').forEach(b=>b.onclick=()=>{$$('.nav-button,.panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#'+b.dataset.target).classList.add('active');window.scrollTo({top:0,behavior:'smooth'})});
let round=0,score=0,locked=false;function drawQuiz(){const x=quiz[round];locked=false;$('#serverZh').textContent=x.q[0];$('#serverPy').textContent=x.q[1];$('#serverEn').textContent=x.q[2];const order=x.a.map((v,i)=>({v,i})).sort(()=>Math.random()-.5);$('#answerChoices').innerHTML=order.map(o=>`<button class="answer" data-i="${o.i}">${o.v[0]}<small>${o.v[1]}</small></button>`).join('');$('#progressText').textContent=`${round+1} / ${quiz.length}`;$('#progressBar').style.width=`${round/quiz.length*100}%`;$('#scoreText').textContent=score;$$('.answer').forEach(b=>b.onclick=()=>{if(locked)return;if(+b.dataset.i===x.ok){locked=true;score++;b.classList.add('correct');speak(x.a[x.ok][0]);setTimeout(()=>{round++;if(round<quiz.length)drawQuiz();else finishQuiz()},800)}else b.classList.add('wrong')})}
function finishQuiz(){$('#serverZh').textContent='点餐成功！祝您用餐愉快！';$('#serverPy').textContent='Diǎncān chénggōng! Zhù nín yòngcān yúkuài!';$('#serverEn').textContent='Order complete. Enjoy your meal!';$('#answerChoices').innerHTML=`<button class="answer correct" id="again">完成 ${score} / ${quiz.length} · 再练一次</button>`;$('#progressText').textContent='5 / 5';$('#progressBar').style.width='100%';$('#scoreText').textContent=score;$('#again').onclick=()=>{round=0;score=0;drawQuiz()}}
drawQuiz();
let size=100;function setSize(n){size=Math.max(80,Math.min(140,n));document.documentElement.style.setProperty('--fs',16*size/100+'px');$('#resetSize').textContent=size+'%'}$('#smaller').onclick=()=>setSize(size-5);$('#larger').onclick=()=>setSize(size+5);$('#resetSize').onclick=()=>setSize(100);
