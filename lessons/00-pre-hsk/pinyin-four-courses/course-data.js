const A='assets/audio/';
const line=(zh,py,en)=>({zh,py,en});
const card=(symbol,audio,word,wordPy,meaning,approx,cueZh,cuePy,cueEn)=>({symbol,audio:A+audio,word,wordPy,meaning,approx,cue:line(cueZh,cuePy,cueEn)});
const q=(zh,py,en,options,answer,fzh,fpy,fen,audio='')=>({prompt:line(zh,py,en),options,answer,feedback:line(fzh,fpy,fen),audio:audio?A+audio:''});
const hq=(hanzi,meaning,audio,options,answer)=>({
 hanzi,meaning,audio:A+audio,options,answer,
 prompt:line('听一听，选择正确的拼音。','Tīng yì tīng, xuǎnzé zhèngquè de pīnyīn.','Listen and choose the correct pinyin.'),
 feedback:line(`${hanzi}读 ${answer}。`,`${hanzi} dú ${answer}.`,`${hanzi} is pronounced ${answer}.`)
});
const groups=(title,py,en,items)=>({title:line(title,py,en),items});
const rules=(items)=>items.map(x=>line(...x));

const initials={
 b:['bo1.mp3','爸爸','bàba','dad','p in “spy” — very little air','双唇打开，气流轻。','Shuāngchún dǎkāi, qìliú qīng.','Open both lips with a small puff.'],
 p:['po1.mp3','跑','pǎo','run','p in “pie” — strong puff','双唇打开，送出强气流。','Shuāngchún dǎkāi, sòngchū qiáng qìliú.','Open both lips with a strong puff.'],
 m:['mo1.mp3','妈妈','māma','mom','m in “mom”','双唇闭合，声音走鼻腔。','Shuāngchún bìhé, shēngyīn zǒu bíqiāng.','Close the lips and let sound pass through the nose.'],
 f:['fo1.mp3','饭','fàn','meal','f in “fish”','下唇轻碰上齿。','Xiàchún qīng pèng shàngchǐ.','Touch the upper teeth with the lower lip.'],
 d:['de1.mp3','弟弟','dìdi','younger brother','t in “stay” — little air','舌尖碰上齿龈，气流轻。','Shéjiān pèng shàng chǐyín, qìliú qīng.','Touch the ridge behind the teeth with little air.'],
 t:['te1.mp3','他','tā','he','t in “tea” — strong puff','舌尖弹开，送出强气流。','Shéjiān tánkāi, sòngchū qiáng qìliú.','Release the tongue with a strong puff.'],
 n:['ne1.mp3','你','nǐ','you','n in “no”','舌尖抬起，声音走鼻腔。','Shéjiān táiqǐ, shēngyīn zǒu bíqiāng.','Lift the tongue tip; sound passes through the nose.'],
 l:['le1.mp3','来','lái','come','l in “light”','舌尖抬起，气流从两边走。','Shéjiān táiqǐ, qìliú cóng liǎngbiān zǒu.','Lift the tongue tip; air flows around the sides.'],
 g:['ge1.mp3','哥哥','gēge','older brother','k in “skate” — little air','舌根抬起，气流轻。','Shégēn táiqǐ, qìliú qīng.','Raise the back of the tongue with little air.'],
 k:['ke1.mp3','看','kàn','look','k in “kite” — strong puff','舌根弹开，送出强气流。','Shégēn tánkāi, sòngchū qiáng qìliú.','Release the back of the tongue with a strong puff.'],
 h:['he1.mp3','喝','hē','drink','h in “hot”, farther back','舌根靠后，让气流摩擦。','Shégēn kàohòu, ràng qìliú mócā.','Keep the tongue back and let the air rub through.'],
 j:['ji1.mp3','鸡','jī','chicken','j in “jeep”, softer and flatter','舌尖靠下，舌面抬高，不卷舌。','Shéjiān kàoxià, shémiàn táigāo, bù juǎnshé.','Tongue tip down, blade raised; do not curl.'],
 q:['qi1.mp3','七','qī','seven','ch in “cheap” — strong puff','保持舌面音位置，明显送气。','Bǎochí shémiànyīn wèizhi, míngxiǎn sòngqì.','Keep the j-position and add a strong puff.'],
 x:['xi1.mp3','西','xī','west','soft “sh” with a smile','舌尖靠下，舌面接近硬腭。','Shéjiān kàoxià, shémiàn jiējìn yìng’è.','Tongue tip down; tongue blade near the hard palate.'],
 zh:['zhi1.mp3','知道','zhīdào','know','j in “judge” + curled tongue','舌尖稍向后抬，不送强气。','Shéjiān shāo xiànghòu tái, bù sòng qiáng qì.','Curl the tongue tip slightly back with little air.'],
 ch:['chi1.mp3','吃','chī','eat','ch in “church” + curled tongue','舌尖向后抬，明显送气。','Shéjiān xiànghòu tái, míngxiǎn sòngqì.','Curl the tongue tip back and add a strong puff.'],
 sh:['shi1.mp3','是','shì','be','sh in “shirt” + curled tongue','舌尖向后抬，让气流摩擦。','Shéjiān xiànghòu tái, ràng qìliú mócā.','Curl the tongue tip back and let air rub through.'],
 r:['ri1.mp3','人','rén','person','r in “red”, with a soft buzz','舌尖稍后抬，声音不断。','Shéjiān shāo hòu tái, shēngyīn bùduàn.','Raise the tongue tip slightly back and keep voicing.'],
 z:['zi1.mp3','字','zì','character','ds in “kids”','舌尖平放，不送强气。','Shéjiān píngfàng, bù sòng qiáng qì.','Keep the tongue flat with little air.'],
 c:['ci1.mp3','菜','cài','dish','ts in “cats” — strong puff','舌尖平放，明显送气。','Shéjiān píngfàng, míngxiǎn sòngqì.','Keep the tongue flat and add a strong puff.'],
 s:['si1.mp3','四','sì','four','s in “sun”','舌尖平放，让气流摩擦。','Shéjiān píngfàng, ràng qìliú mócā.','Keep the tongue flat and let the air hiss.'],
 y:['yi1.mp3','一','yī','one','y in “yes”','这是拼写助手，常连接 i 或 ü。','Zhè shì pīnxiě zhùshǒu, cháng liánjiē i huò ü.','A spelling helper often linked to i or ü.'],
 w:['wu1.mp3','五','wǔ','five','w in “we”','这是拼写助手，常连接 u。','Zhè shì pīnxiě zhùshǒu, cháng liánjiē u.','A spelling helper often linked to u.']
};
const I=s=>card(s,...initials[s]);

const finals={
 a:['a1.mp3','啊','ā','ah','a in “father”','嘴巴大开，舌头放松。','Zuǐba dàkāi, shétou fàngsōng.','Open wide and relax the tongue.'],
 o:['o1.mp3','哦','ō','oh','aw in “law”, but rounder','双唇收圆，舌位靠后。','Shuāngchún shōuyuán, shéwèi kàohòu.','Round the lips; keep the tongue back.'],
 e:['e1.mp3','饿','è','hungry','“uh” with the tongue farther back','嘴角放松，舌根抬起；不要卷舌。','Zuǐjiǎo fàngsōng, shégēn táiqǐ; búyào juǎnshé.','Relax the lips, raise the tongue back; do not curl.'],
 i:['yi1.mp3','一','yī','one','ee in “see”','嘴角向两边展开。','Zuǐjiǎo xiàng liǎngbiān zhǎnkāi.','Spread the corners of the mouth.'],
 u:['wu1.mp3','五','wǔ','five','oo in “moon”','双唇收圆并向前。','Shuāngchún shōuyuán bìng xiàngqián.','Round and push the lips forward.'],
 ü:['yu1.mp3','鱼','yú','fish','say “ee” with rounded lips','保持 i 的舌位，把嘴唇收圆。','Bǎochí i de shéwèi, bǎ zuǐchún shōuyuán.','Hold the “ee” tongue position and round the lips.'],
 ai:['ai1.mp3','爱','ài','love','i in “ice”','从 a 快速滑向 i。','Cóng a kuàisù huá xiàng i.','Glide quickly from a to i.'],
 ei:['ei1.mp3','诶','ēi','hey','ay in “day”','从 e 快速滑向 i。','Cóng e kuàisù huá xiàng i.','Glide quickly from e to i.'],
 ui:['wei1.mp3','水','shuǐ','water','way, said quickly','完整声音接近 u-e-i。','Wánzhěng shēngyīn jiējìn u-e-i.','The full sound moves through u-e-i.'],
 ao:['ao1.mp3','好','hǎo','good','ow in “cow”','从 a 滑向圆唇 o。','Cóng a huá xiàng yuánchún o.','Glide from a toward rounded o.'],
 ou:['ou1.mp3','口','kǒu','mouth','o in “go”','从 o 滑向 u。','Cóng o huá xiàng u.','Glide from o toward u.'],
 iu:['you1.mp3','六','liù','six','yo + oo, said quickly','完整声音接近 i-o-u。','Wánzhěng shēngyīn jiējìn i-o-u.','The full sound moves through i-o-u.'],
 ie:['ye1.mp3','谢谢','xièxie','thank you','ye in “yes”','先 i，再快速打开到 ê。','Xiān i, zài kuàisù dǎkāi dào ê.','Start at i, then open quickly toward ê.'],
 üe:['yue1.mp3','月','yuè','moon','rounded “ee” + eh','先发 ü，再打开到 ê。','Xiān fā ü, zài dǎkāi dào ê.','Start with ü, then open toward ê.'],
 er:['er2.mp3','二','èr','two','er in “her”, without English r','舌尖轻轻后抬，不加完整 r。','Shéjiān qīngqīng hòutái, bù jiā wánzhěng r.','Lift the tongue tip slightly; avoid a full English r.'],
 an:['an1.mp3','三','sān','three','an in “can”, more open','结尾时舌尖碰上齿龈。','Jiéwěi shí shéjiān pèng shàng chǐyín.','End with the tongue tip behind the teeth.'],
 en:['en1.mp3','很','hěn','very','un in “taken”','轻短地收向 n。','Qīngduǎn de shōu xiàng n.','Close lightly and quickly toward n.'],
 in:['yin1.mp3','新','xīn','new','een in “seen”, shorter','从 i 收到前鼻音 n。','Cóng i shōu dào qián bíyīn n.','Move from i into the front nasal n.'],
 un:['wen1.mp3','问','wèn','ask','wen, said quickly','完整声音接近 u-e-n。','Wánzhěng shēngyīn jiējìn u-e-n.','The full sound moves through u-e-n.'],
 ün:['yun1.mp3','云','yún','cloud','rounded “ee” + n','保持圆唇，再收到 n。','Bǎochí yuánchún, zài shōu dào n.','Keep rounded lips, then close toward n.'],
 ang:['ang1.mp3','忙','máng','busy','ung in “sung”, mouth open','结尾时舌根抬起。','Jiéwěi shí shégēn táiqǐ.','Raise the back of the tongue at the end.'],
 eng:['eng1.mp3','冷','lěng','cold','ung in “sung”, more central','声音在口腔后部结束。','Shēngyīn zài kǒuqiāng hòubù jiéshù.','Finish the sound at the back of the mouth.'],
 ing:['ying1.mp3','听','tīng','listen','ing in “sing”, shorter','从 i 滑到后鼻音 ng。','Cóng i huá dào hòu bíyīn ng.','Move from i into the back nasal ng.'],
 ong:['dong1.mp3','东','dōng','east','ong in “long”, with rounded lips','圆唇，声音在后鼻音结束。','Yuánchún, shēngyīn zài hòu bíyīn jiéshù.','Round the lips and finish with back nasal ng.']
};
const F=s=>card(s,...finals[s]);

const toneCards=[
 card('mā','ma1.mp3','妈','mā','mom','high and level','声音高而平。','Shēngyīn gāo ér píng.','Keep the pitch high and level.'),
 card('má','ma2.mp3','麻','má','hemp','like a surprised “What?”','声音从中间向上升。','Shēngyīn cóng zhōngjiān xiàngshàng shēng.','Let the pitch rise from mid to high.'),
 card('mǎ','ma3.mp3','马','mǎ','horse','low, then rise when isolated','先低下去；单独读时再上升。','Xiān dī xiàqù; dāndú dú shí zài shàngshēng.','Go low; rise again when said alone.'),
 card('mà','ma4.mp3','骂','mà','scold','a firm “No!”','声音快速向下降。','Shēngyīn kuàisù xiàngxià jiàng.','Drop the pitch quickly and firmly.')
];

const baseQuestions=[
 q('哪个调号表示第一声？','Nǎge diàohào biǎoshì dì-yī shēng?','Which mark shows the first tone?',['ā','á','ǎ'],'ā','第一声高而平。','Dì-yī shēng gāo ér píng.','The first tone is high and level.'),
 q('请听：这是第几声？','Qǐng tīng: zhè shì dì-jǐ shēng?','Listen: which tone is this?',['1','2','4'],'2','声音向上升，是第二声。','Shēngyīn xiàngshàng shēng, shì dì-èr shēng.','The pitch rises, so it is tone two.','ma2.mp3'),
 q('“马”的拼音是哪一个？','“Mǎ” de pīnyīn shì nǎ yí ge?','Which pinyin means “horse”?',['mā','má','mǎ'],'mǎ','马读 mǎ，第三声。','Mǎ dú mǎ, dì-sān shēng.','马 is mǎ, with the third tone.'),
 q('哪个声音需要先发 ee，再把嘴唇收圆？','Nǎge shēngyīn xūyào xiān fā ee, zài bǎ zuǐchún shōuyuán?','Which sound starts with “ee” and then rounds the lips?',['i','u','ü'],'ü','这是 ü 的发音诀窍。','Zhè shì ü de fāyīn juéqiào.','That is the key movement for ü.'),
 q('“妈妈”的第一个音节是什么？','“Māma” de dì-yī ge yīnjié shì shénme?','What is the first syllable in 妈妈?',['mā','mǎ','mà'],'mā','妈妈读 māma。','Māma dú māma.','妈妈 is pronounced māma.'),
 q('哪个声母像英语 mom 的起始音？','Nǎge shēngmǔ xiàng Yīngyǔ mom de qǐshǐyīn?','Which initial is like the start of “mom”?',['b','m','g'],'m','m 与英语 mom 的起始音很接近。','m yǔ Yīngyǔ mom de qǐshǐyīn hěn jiējìn.','m is close to the beginning of “mom”.'),
 q('“哥哥”由哪个声母开始？','“Gēge” yóu nǎge shēngmǔ kāishǐ?','Which initial begins 哥哥?',['b','g','d'],'g','哥哥读 gēge。','Gēge dú gēge.','哥哥 is pronounced gēge.'),
 q('哪个英语词可以帮助你找到 a 的起点？','Nǎge Yīngyǔ cí kěyǐ bāngzhù nǐ zhǎodào a de qǐdiǎn?','Which English word helps you find the starting point for a?',['father','see','moon'],'father','a 接近 father 里的 a。','a jiējìn father lǐ de a.','a is close to the a in “father”.'),
 q('第四声的方向是什么？','Dì-sì shēng de fāngxiàng shì shénme?','What direction does tone four move?',['high → low','low → high','level'],'high → low','第四声快速下降。','Dì-sì shēng kuàisù xiàjiàng.','Tone four falls quickly.')
];

const initialQuestions=[
 q('哪一组主要用气流强弱来区分？','Nǎ yì zǔ zhǔyào yòng qìliú qiángruò lái qūfēn?','Which pair is mainly separated by airflow?',['b / p','m / n','f / h'],'b / p','b 气流轻，p 明显送气。','b qìliú qīng, p míngxiǎn sòngqì.','b has little air; p has a strong puff.'),
 q('像英语 cheap 起始音、但舌尖靠下的是？','Xiàng Yīngyǔ cheap qǐshǐyīn, dàn shéjiān kàoxià de shì?','Which sound is like the start of “cheap” with the tongue tip down?',['j','q','ch'],'q','q 是送气舌面音。','q shì sòngqì shémiànyīn.','q is an aspirated palatal sound.'),
 q('哪个声母像英语 fish 的起始音？','Nǎge shēngmǔ xiàng Yīngyǔ fish de qǐshǐyīn?','Which initial sounds like the start of “fish”?',['f','h','x'],'f','f 的发音与英语很接近。','f de fāyīn yǔ Yīngyǔ hěn jiējìn.','Mandarin f is very close to English f.'),
 q('哪一个需要翘舌并明显送气？','Nǎ yí ge xūyào qiàoshé bìng míngxiǎn sòngqì?','Which one curls the tongue and uses a strong puff?',['zh','ch','sh'],'ch','ch 是送气翘舌音。','ch shì sòngqì qiàoshéyīn.','ch is an aspirated retroflex sound.'),
 q('像英语 cats 结尾 ts、并送气的是？','Xiàng Yīngyǔ cats jiéwěi ts, bìng sòngqì de shì?','Which one resembles the final “ts” in “cats” with a puff?',['z','c','s'],'c','c 接近送气的 ts。','c jiējìn sòngqì de ts.','c is close to an aspirated “ts”.'),
 q('请听：这个音属于哪一家？','Qǐng tīng: zhège yīn shǔyú nǎ yì jiā?','Listen: which family is this sound from?',['舌面 / palatal','翘舌 / retroflex','唇音 / lip'],'翘舌 / retroflex','sh 是翘舌摩擦音。','sh shì qiàoshé mócāyīn.','sh is a retroflex fricative.','shi1.mp3'),
 q('哪个音需要鼻腔共鸣？','Nǎge yīn xūyào bíqiāng gòngmíng?','Which sound resonates through the nose?',['n','l','r'],'n','n 是鼻音。','n shì bíyīn.','n is nasal.'),
 q('y 和 w 在这里是什么？','y hé w zài zhèlǐ shì shénme?','What are y and w here?',['拼写助手 / spelling helpers','声调 / tones','韵母 / finals'],'拼写助手 / spelling helpers','它们帮助书写零声母音节。','Tāmen bāngzhù shūxiě líng shēngmǔ yīnjié.','They help spell syllables without a regular initial.'),
 q('哪一组都要求舌尖靠近下齿？','Nǎ yì zǔ dōu yāoqiú shéjiān kàojìn xiàchǐ?','Which group keeps the tongue tip near the lower teeth?',['j q x','zh ch sh','b p m'],'j q x','j q x 是舌面音，不卷舌。','j q x shì shémiànyīn, bù juǎnshé.','j q x are palatal sounds; do not curl the tongue.')
];

const finalQuestions=[
 q('哪个韵母像英语 day 里的 ay？','Nǎge yùnmǔ xiàng Yīngyǔ day lǐ de ay?','Which final resembles “ay” in “day”?',['ai','ei','ou'],'ei','ei 接近 day 里的 ay。','ei jiējìn day lǐ de ay.','ei is close to “ay” in “day”.'),
 q('i-o-u 和声母相拼时写成什么？','i-o-u hé shēngmǔ xiāngpīn shí xiě chéng shénme?','How is i-o-u written after an initial?',['iu','ui','ou'],'iu','例如六：liù。','Lìrú liù.','For example: 六 liù.'),
 q('u-e-i 和声母相拼时写成什么？','u-e-i hé shēngmǔ xiāngpīn shí xiě chéng shénme?','How is u-e-i written after an initial?',['ui','iu','ei'],'ui','例如水：shuǐ。','Lìrú shuǐ.','For example: 水 shuǐ.'),
 q('哪一个是后鼻韵母？','Nǎ yí ge shì hòu bí yùnmǔ?','Which is a back nasal final?',['an','ang','ai'],'ang','ang 以 ng 结束。','ang yǐ ng jiéshù.','ang ends in ng.'),
 q('哪个声音接近英语 ice 里的 i？','Nǎge shēngyīn jiējìn Yīngyǔ ice lǐ de i?','Which sound is close to the i in “ice”?',['ai','ei','ao'],'ai','ai 从 a 滑向 i。','ai cóng a huá xiàng i.','ai glides from a to i.'),
 q('请听：这是哪个韵母？','Qǐng tīng: zhè shì nǎge yùnmǔ?','Listen: which final is this?',['an','ang','eng'],'ang','声音在后鼻音 ng 结束。','Shēngyīn zài hòu bíyīn ng jiéshù.','The sound ends in back nasal ng.','ang1.mp3'),
 q('j、q、x 后面的 u 实际读什么？','j, q, x hòumiàn de u shíjì dú shénme?','What does u represent after j, q, or x?',['ü','u','ou'],'ü','两点省略，声音仍然是 ü。','Liǎng diǎn shěnglüè, shēngyīn réngrán shì ü.','The dots disappear, but the sound remains ü.'),
 q('哪个韵母像英语 sing 的结尾？','Nǎge yùnmǔ xiàng Yīngyǔ sing de jiéwěi?','Which final resembles the ending of “sing”?',['in','ing','eng'],'ing','ing 是后鼻韵母。','ing shì hòu bí yùnmǔ.','ing is a back nasal final.'),
 q('n 和 l 后面的 ü 为什么保留两点？','n hé l hòumiàn de ü wèishénme bǎoliú liǎng diǎn?','Why does ü keep its dots after n and l?',['区分 u / distinguish u','标声调 / mark tone','表示复数 / plural'],'区分 u / distinguish u','两点帮助区分 u 和 ü。','Liǎng diǎn bāngzhù qūfēn u hé ü.','The dots distinguish u from ü.')
];

const wholeItems=['zhi','chi','shi','ri','zi','ci','si','yi','wu','yu','ye','yue','yuan','yin','yun','ying'];
const wholeMeta={
 zhi:['zhi1.mp3','知','zhī','know','j in judge + curled tongue'],chi:['chi1.mp3','吃','chī','eat','ch in church + curled tongue'],shi:['shi1.mp3','诗','shī','poem','sh in shirt + curled tongue'],ri:['ri1.mp3','日','rì','day','r in red + soft buzz'],zi:['zi1.mp3','字','zì','character','ds in kids + buzzing ending'],ci:['ci1.mp3','词','cí','word','ts in cats + strong puff'],si:['si1.mp3','四','sì','four','s in sun + buzzing ending'],yi:['yi1.mp3','一','yī','one','ee in see'],wu:['wu1.mp3','五','wǔ','five','oo in moon'],yu:['yu1.mp3','鱼','yú','fish','ee with rounded lips'],ye:['ye1.mp3','夜','yè','night','ye in yes'],yue:['yue1.mp3','月','yuè','moon','rounded ee + eh'],yuan:['yuan1.mp3','元','yuán','yuan','rounded ee + en'],yin:['yin1.mp3','音','yīn','sound','een in seen, shorter'],yun:['yun1.mp3','云','yún','cloud','rounded ee + n'],ying:['ying1.mp3','英','yīng','English','ing in sing, shorter']};
const W=s=>{const [a,w,p,e,ap]=wholeMeta[s];return card(s,a,w,p,e,ap,'把整个音节作为一个声音单位读。','Bǎ zhěnggè yīnjié zuòwéi yí ge shēngyīn dānwèi dú.','Read the whole syllable as one sound unit.');};
const wholeQuestions=[
 q('哪个音节是翘舌音？','Nǎge yīnjié shì qiàoshéyīn?','Which syllable is retroflex?',['zhi','zi','yi'],'zhi','zhi 要稍微翘舌。','zhi yào shāowēi qiàoshé.','Curl the tongue slightly for zhi.'),
 q('哪个音节像英语 cats 的 ts 并送气？','Nǎge yīnjié xiàng Yīngyǔ cats de ts bìng sòngqì?','Which syllable uses an aspirated “ts” like in “cats”?',['zi','ci','si'],'ci','ci 是送气平舌音。','ci shì sòngqì píngshéyīn.','ci is an aspirated dental sound.'),
 q('“月”的拼音是什么？','“Yuè” de pīnyīn shì shénme?','What is the pinyin for 月?',['ye','yue','yuan'],'yue','月读 yuè。','Yuè dú yuè.','月 is pronounced yuè.'),
 q('“云”的拼音是什么？','“Yún” de pīnyīn shì shénme?','What is the pinyin for 云?',['yin','yun','ying'],'yun','云读 yún。','Yún dú yún.','云 is pronounced yún.'),
 q('请听：你听到哪一个音节？','Qǐng tīng: nǐ tīngdào nǎ yí ge yīnjié?','Listen: which syllable do you hear?',['zhi','chi','shi'],'chi','chi 翘舌并送气。','chi qiàoshé bìng sòngqì.','chi is retroflex and aspirated.','chi1.mp3'),
 q('哪个音节的 i 不是普通的 ee？','Nǎge yīnjié de i bú shì pǔtōng de ee?','In which syllable is i not the regular “ee” sound?',['yi','zhi','yin'],'zhi','zhi 中的 i 延续翘舌位置。','zhi zhōng de i yánxù qiàoshé wèizhi.','The i in zhi continues the retroflex position.'),
 q('“一”的拼音是什么？','“Yī” de pīnyīn shì shénme?','What is the pinyin for 一?',['yi','wu','yu'],'yi','一读 yī。','Yī dú yī.','一 is pronounced yī.'),
 q('哪个音节是后鼻音？','Nǎge yīnjié shì hòu bíyīn?','Which syllable has a back nasal ending?',['yin','yun','ying'],'ying','ying 以 ng 结束。','ying yǐ ng jiéshù.','ying ends in ng.'),
 q('哪个音节需要保持 ee 舌位并圆唇？','Nǎge yīnjié xūyào bǎochí ee shéwèi bìng yuánchún?','Which syllable keeps the “ee” tongue position while rounding the lips?',['wu','yu','yi'],'yu','yu 的声音来自 ü。','yu de shēngyīn láizì ü.','The sound in yu comes from ü.')
];

const lesson1HanziQuestions=[
 hq('妈','mom','ma1.mp3',['mā','má','mǎ'],'mā'),hq('马','horse','ma3.mp3',['mā','mǎ','mà'],'mǎ'),hq('骂','scold','ma4.mp3',['má','mǎ','mà'],'mà'),
 hq('爸','dad','ba4.mp3',['bā','bá','bà'],'bà'),hq('哥','older brother','ge1.mp3',['gē','gé','gě'],'gē'),hq('弟','younger brother','di4.mp3',['dī','dí','dì'],'dì'),
 hq('米','rice','mi3.mp3',['mī','mí','mǐ'],'mǐ'),hq('鱼','fish','yu2.mp3',['yū','yú','yǔ'],'yú'),hq('五','five','wu3.mp3',['wū','wú','wǔ'],'wǔ')
];
const lesson2HanziQuestions=[
 hq('鸡','chicken','ji1.mp3',['jī','qī','xī'],'jī'),hq('七','seven','qi1.mp3',['jī','qī','xī'],'qī'),hq('西','west','xi1.mp3',['jī','qī','xī'],'xī'),
 hq('吃','eat','chi1.mp3',['zhī','chī','shī'],'chī'),hq('是','to be','shi4.mp3',['chī','shì','sì'],'shì'),hq('人','person','ren2.mp3',['rén','lín','yín'],'rén'),
 hq('字','character','zi4.mp3',['zì','zhì','cì'],'zì'),hq('菜','dish / vegetable','cai4.mp3',['zài','cài','chài'],'cài'),hq('四','four','si4.mp3',['shì','sì','cì'],'sì')
];
const lesson3HanziQuestions=[
 hq('爱','love','ai4.mp3',['ài','èi','ào'],'ài'),hq('黑','black','hei1.mp3',['hēi','huī','hāi'],'hēi'),hq('水','water','shui3.mp3',['shuǐ','shǎo','shùn'],'shuǐ'),
 hq('好','good','hao3.mp3',['hǎo','hǒu','hǎi'],'hǎo'),hq('六','six','liu4.mp3',['liù','luì','liào'],'liù'),hq('谢','thank','xie4.mp3',['xiè','xuè','xiù'],'xiè'),
 hq('月','moon / month','yue4.mp3',['yuè','yè','yù'],'yuè'),hq('三','three','san1.mp3',['sān','sāng','sēn'],'sān'),hq('冷','cold','leng3.mp3',['lěng','lěn','lǐng'],'lěng')
];
const lesson4HanziQuestions=[
 hq('知','know','zhi1.mp3',['zhī','zī','jī'],'zhī'),hq('吃','eat','chi1.mp3',['chī','qī','cī'],'chī'),hq('是','to be','shi4.mp3',['shì','sì','xì'],'shì'),
 hq('日','day','ri4.mp3',['rì','lì','yì'],'rì'),hq('字','character','zi4.mp3',['zì','zhì','jì'],'zì'),hq('四','four','si4.mp3',['sì','shì','xì'],'sì'),
 hq('一','one','yi1.mp3',['yī','wū','yū'],'yī'),hq('五','five','wu3.mp3',['wǔ','yǔ','yǐ'],'wǔ'),hq('鱼','fish','yu2.mp3',['yú','wú','yí'],'yú')
];

const commonGameRules=rules([
 ['先看常用汉字和英文意思。','Xiān kàn chángyòng Hànzì hé Yīngwén yìsi.','Look at the common character and its English meaning.'],
 ['点击播放，听完整音节。','Diǎnjī bōfàng, tīng wánzhěng yīnjié.','Tap play and listen to the full syllable.'],
 ['从三个选项中选择正确拼音。','Cóng sān ge xuǎnxiàng zhōng xuǎnzé zhèngquè pīnyīn.','Choose the correct pinyin from three options.'],
 ['答对后读出汉字，老师纠音。','Dáduì hòu dúchū Hànzì, lǎoshī jiūyīn.','After answering, say the word and let the teacher correct it.']
]);

const lessons=[
 {no:'LESSON 01',title:line('单韵母、四声与家庭','dān yùnmǔ, sì shēng yǔ jiātíng','Simple finals, four tones & family'),groups:[groups('六个单韵母','liù ge dān yùnmǔ','Six simple finals',['a','o','e','i','u','ü'].map(F)),groups('四个声调','sì ge shēngdiào','Four tones',toneCards),groups('四个常用声母','sì ge chángyòng shēngmǔ','Four useful initials',['b','m','g','d'].map(I))],questions:lesson1HanziQuestions,scene:'listening',gameTitle:line('家庭与数字听音','jiātíng yǔ shùzì tīngyīn','Family & Numbers Listening'),gameRules:commonGameRules,speakType:'family',speakTitle:line('家庭侦探','jiātíng zhēntàn','Family Detective')},
 {no:'LESSON 02',title:line('全部声母','quánbù shēngmǔ','All initials'),groups:[groups('双唇与唇齿','shuāngchún yǔ chúnchǐ','Lips & lip–teeth',['b','p','m','f'].map(I)),groups('舌尖与舌根','shéjiān yǔ shégēn','Tongue tip & tongue back',['d','t','n','l','g','k','h'].map(I)),groups('舌面音','shémiànyīn','Palatal sounds',['j','q','x'].map(I)),groups('翘舌与平舌','qiàoshé yǔ píngshé','Retroflex & dental sounds',['zh','ch','sh','r','z','c','s'].map(I)),groups('拼写助手','pīnxiě zhùshǒu','Spelling helpers',['y','w'].map(I))],questions:lesson2HanziQuestions,scene:'earphones',gameTitle:line('相近声母听辨','xiāngjìn shēngmǔ tīngbiàn','Initial Sound Check'),gameRules:commonGameRules,speakType:'clinic',speakTitle:line('发音医生','fāyīn yīshēng','Pronunciation Doctor')},
 {no:'LESSON 03',title:line('全部韵母','quánbù yùnmǔ','All finals'),groups:[groups('单韵母','dān yùnmǔ','Simple finals',['a','o','e','i','u','ü'].map(F)),groups('复韵母与 er','fù yùnmǔ yǔ er','Compound finals & er',['ai','ei','ui','ao','ou','iu','ie','üe','er'].map(F)),groups('前鼻韵母','qián bí yùnmǔ','Front nasal finals',['an','en','in','un','ün'].map(F)),groups('后鼻韵母','hòu bí yùnmǔ','Back nasal finals',['ang','eng','ing','ong'].map(F))],questions:lesson3HanziQuestions,scene:'studying',gameTitle:line('常用字韵母听辨','chángyòng zì yùnmǔ tīngbiàn','Finals in Real Words'),gameRules:commonGameRules,speakType:'builder',speakTitle:line('拼音列车','pīnyīn lièchē','Syllable Train')},
 {no:'LESSON 04',title:line('整体认读音节','zhěngtǐ rèndú yīnjié','Whole syllables'),groups:[groups('翘舌与平舌家族','qiàoshé yǔ píngshé jiāzú','Retroflex & dental families',['zhi','chi','shi','ri','zi','ci','si'].map(W)),groups('y、w 与 ü 家族','y, w yǔ ü jiāzú','y, w & ü families',['yi','wu','yu','ye','yue','yuan'].map(W)),groups('鼻音家族','bíyīn jiāzú','Nasal family',['yin','yun','ying'].map(W))],questions:lesson4HanziQuestions,scene:'dialogue',gameTitle:line('整体音节听音','zhěngtǐ yīnjié tīngyīn','Whole-Syllable Listening'),gameRules:commonGameRules,speakType:'dialogue',speakTitle:line('第一次中文对话','dì-yī cì Zhōngwén duìhuà','Your first Chinese dialogue')}
];
