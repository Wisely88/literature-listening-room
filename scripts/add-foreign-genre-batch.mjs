import { access, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const worksDir = path.join(root, "content", "works");
const authorsDir = path.join(root, "content", "authors");

const authors = [
  ["h-g-wells", "赫伯特·乔治·威尔斯", "H. G. Wells", 1866, 1946, "英国", "英国小说家，以科学想象审视现代文明、社会结构与人类未来。"],
  ["jules-verne", "儒勒·凡尔纳", "Jules Verne", 1828, 1905, "法国", "法国小说家，将地理发现、工程想象与冒险叙事融为一体。"],
  ["arthur-conan-doyle", "阿瑟·柯南·道尔", "Arthur Conan Doyle", 1859, 1930, "英国", "英国作家，塑造了夏洛克·福尔摩斯，并奠定现代侦探小说的重要范式。"],
  ["edgar-allan-poe", "埃德加·爱伦·坡", "Edgar Allan Poe", 1809, 1849, "美国", "美国诗人、小说家，以心理恐怖、严密推理与幽暗美学著称。"],
  ["wilkie-collins", "威尔基·柯林斯", "Wilkie Collins", 1824, 1889, "英国", "英国小说家，是悬疑小说和早期侦探小说的重要开拓者。"],
  ["victor-hugo", "维克多·雨果", "Victor Hugo", 1802, 1885, "法国", "法国作家，以宏阔历史视野书写苦难、正义、自由与人的尊严。"],
  ["james-fenimore-cooper", "詹姆斯·费尼莫尔·库珀", "James Fenimore Cooper", 1789, 1851, "美国", "美国小说家，以边疆、历史冲突与自然景观构成早期美国叙事。"],
  ["walter-scott", "沃尔特·司各特", "Walter Scott", 1771, 1832, "英国", "苏格兰小说家和诗人，是英语历史小说传统的重要奠基者。"],
  ["benjamin-franklin", "本杰明·富兰克林", "Benjamin Franklin", 1706, 1790, "美国", "美国政治家、科学家与作家，其自传记录个人修养、公共生活和启蒙精神。"],
  ["frederick-douglass", "弗雷德里克·道格拉斯", "Frederick Douglass", 1818, 1895, "美国", "美国废奴主义者与作家，以亲历文字见证奴隶制度并争取人的自由。"],
  ["bram-stoker", "布拉姆·斯托克", "Bram Stoker", 1847, 1912, "爱尔兰", "爱尔兰作家，以《德古拉》重塑吸血鬼叙事及现代哥特文学。"],
  ["robert-louis-stevenson", "罗伯特·路易斯·史蒂文森", "Robert Louis Stevenson", 1850, 1894, "英国", "苏格兰作家，擅长以冒险和寓言讨论人格、欲望与道德冲突。"],
  ["j-m-barrie", "詹姆斯·马修·巴里", "J. M. Barrie", 1860, 1937, "英国", "苏格兰作家、剧作家，以彼得·潘的永无岛书写童年、想象与成长。"],
  ["kahlil-gibran", "纪伯伦", "Kahlil Gibran", 1883, 1931, "黎巴嫩", "黎巴嫩裔诗人、作家，以寓言式散文探问爱、自由、劳动与生命。"],
];

const works = [
  ["the-time-machine", "时间机器·未来之门", "h-g-wells", "英国", "科幻文学", "The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us.", "时间旅行者——我们不妨这样称呼他——正在向我们阐述一个深奥的问题。", "Project Gutenberg eBook 35", "时间旅行者以一场看似冷静的晚宴讨论，推开通往遥远未来的大门。"],
  ["the-war-of-the-worlds", "世界大战·火星来客", "h-g-wells", "英国", "科幻文学", "No one would have believed in the last years of the nineteenth century that this world was being watched keenly and closely by intelligences greater than man's.", "在十九世纪最后的岁月里，没有人会相信，这个世界正被远胜于人类的智慧生命严密注视。", "Project Gutenberg eBook 36", "威尔斯从日常世界遭遇外星入侵写起，反观人类文明的脆弱与自负。"],
  ["twenty-thousand-leagues", "海底两万里·海中异象", "jules-verne", "法国", "科幻文学", "The year 1866 was signalised by a remarkable incident, a mysterious and puzzling phenomenon, which doubtless no one has yet forgotten.", "一八六六年发生了一件非同寻常的大事，那神秘难解的现象，想必至今无人忘记。", "Project Gutenberg eBook 164", "凡尔纳以海洋谜团开启科学、冒险与未知世界交织的航程。"],
  ["the-invisible-man", "隐身人·风雪中的陌生客", "h-g-wells", "英国", "科幻文学", "The stranger came early in February, one wintry day, through a biting wind and a driving snow.", "陌生人在二月初的一个严冬日子到来，顶着刺骨的风和迎面扑来的雪。", "Project Gutenberg eBook 5230", "一个裹得密不透风的陌生人走进小镇，科学奇迹也逐渐显出孤独与危险。"],
  ["a-scandal-in-bohemia", "波希米亚丑闻", "arthur-conan-doyle", "英国", "推理探案", "To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name.", "对夏洛克·福尔摩斯而言，她永远是那个女人。我很少听见他用别的称呼提起她。", "Project Gutenberg eBook 1661", "福尔摩斯遇见一位足以挑战其判断与偏见的对手。"],
  ["murders-in-rue-morgue", "莫格街凶杀案", "edgar-allan-poe", "美国", "推理探案", "The mental features discoursed of as the analytical, are, in themselves, but little susceptible of analysis.", "人们所谓的分析能力，本身其实很难被进一步分析。", "Project Gutenberg eBook 2147", "密室般的残酷案件，引出杜宾以观察和推演重建真相的过程。"],
  ["the-moonstone", "月亮宝石·失窃之谜", "wilkie-collins", "英国", "推理探案", "In the first part of Robinson Crusoe, at page one hundred and twenty-nine, you will find it thus written.", "在《鲁滨逊漂流记》第一部第一百二十九页，你会读到这样一段话。", "Project Gutenberg eBook 155", "一颗来历复杂的钻石在英国家庭中失踪，多位叙述者共同拼出案件全貌。"],
  ["the-woman-in-white", "白衣女人·月下相遇", "wilkie-collins", "英国", "推理探案", "This is the story of what a Woman's patience can endure, and what a Man's resolution can achieve.", "这个故事讲述一个女人的耐心能够忍受什么，也讲述一个男人的决心能够完成什么。", "Project Gutenberg eBook 583", "深夜路上的白衣女子，把主人公带入身份、财产与阴谋交织的迷局。"],
  ["war-and-peace", "战争与和平·宴会之前", "leo-tolstoy", "俄罗斯", "历史文学", "Well, Prince, so Genoa and Lucca are now just family estates of the Buonapartes.", "好吧，公爵，热那亚和卢卡如今都快成了波拿巴家族的私产。", "Project Gutenberg eBook 2600，Louise and Aylmer Maude 公版英译", "托尔斯泰从彼得堡的一场谈话展开拿破仑战争时代的众生长卷。"],
  ["les-miserables", "悲惨世界·一八一五年的主教", "victor-hugo", "法国", "历史文学", "In 1815, M. Charles-Francois-Bienvenu Myriel was Bishop of Digne.", "一八一五年，夏尔—弗朗索瓦—比安弗尼·米里哀先生担任迪涅主教。", "Project Gutenberg eBook 135，Isabel F. Hapgood 公版英译", "雨果从一位主教写起，让慈悲进入法律、革命与社会苦难构成的历史。"],
  ["last-of-the-mohicans", "最后的莫希干人·边疆战争", "james-fenimore-cooper", "美国", "历史文学", "It was a feature peculiar to the colonial wars of North America, that the toils and dangers of the wilderness were to be encountered before the adverse hosts could meet.", "北美殖民战争有一个独特之处：敌对双方尚未交锋，便须先经受荒野的艰险与劳苦。", "Project Gutenberg eBook 940", "殖民战争中的荒野旅程，交织族群冲突、友谊、追踪与失落。"],
  ["ivanhoe", "艾凡赫·古堡与归途", "walter-scott", "英国", "历史文学", "In that pleasant district of merry England which is watered by the river Don, there extended in ancient times a large forest.", "在英格兰那片由顿河滋养的宜人土地上，古时曾绵延着一座广阔森林。", "Project Gutenberg eBook 82", "司各特把骑士归来、王权纷争与族群矛盾编织成中世纪历史传奇。"],
  ["autobiography-benjamin-franklin", "富兰克林自传·写给儿子", "benjamin-franklin", "美国", "传记 / 自传", "Dear son: I have ever had pleasure in obtaining any little anecdotes of my ancestors.", "亲爱的儿子：我一向很乐于搜集祖先留下的种种小故事。", "Project Gutenberg eBook 20203", "富兰克林回顾出身、求学与公共生活，也检视个人习惯如何塑造一生。"],
  ["narrative-frederick-douglass", "弗雷德里克·道格拉斯自述", "frederick-douglass", "美国", "传记 / 自传", "I was born in Tuckahoe, near Hillsborough, and about twelve miles from Easton, in Talbot county, Maryland.", "我出生在塔克霍，靠近希尔斯伯勒，距马里兰州塔尔博特县的伊斯顿约十二英里。", "Project Gutenberg eBook 23", "道格拉斯以克制而有力的亲历叙述，揭露奴隶制度并记录走向自由的道路。"],
  ["dracula", "德古拉·来自特兰西瓦尼亚", "bram-stoker", "爱尔兰", "恐怖惊悚", "3 May. Bistritz.—Left Munich at 8:35 P. M., on 1st May, arriving at Vienna early next morning.", "五月三日，比斯特里察——五月一日晚八点三十五分离开慕尼黑，次日清晨抵达维也纳。", "Project Gutenberg eBook 345", "一名英国律师循着日记踏入陌生古堡，理性世界的边界随旅程逐渐崩塌。"],
  ["jekyll-and-hyde", "化身博士·一道怪门", "robert-louis-stevenson", "英国", "恐怖惊悚", "Mr. Utterson the lawyer was a man of a rugged countenance that was never lighted by a smile.", "律师厄特森先生面容严峻，从来不见笑容照亮他的脸。", "Project Gutenberg eBook 43", "伦敦街巷的一道门和一个暴戾陌生人，牵出人格分裂与道德自欺。"],
  ["fall-of-house-of-usher", "厄舍府的倒塌", "edgar-allan-poe", "美国", "恐怖惊悚", "During the whole of a dull, dark, and soundless day in the autumn of the year, the clouds hung oppressively low in the heavens.", "那一年秋天，一个阴沉、黑暗而寂静的日子里，云层沉重地低压在天空。", "Project Gutenberg eBook 932", "一座衰败宅邸、病中的兄妹与无法驱散的恐惧，共同构成封闭的精神景观。"],
  ["peter-pan", "彼得·潘·永无岛来客", "j-m-barrie", "英国", "奇幻文学", "All children, except one, grow up. They soon know that they will grow up.", "所有孩子都会长大，只有一个例外。他们很快就会知道自己终将长大。", "Project Gutenberg eBook 16", "不会长大的彼得·潘闯入达林家的夜晚，把童年愿望带往永无岛。"],
  ["civil-disobedience", "论公民的不服从", "henry-david-thoreau", "美国", "思想随笔", "I heartily accept the motto,—That government is best which governs least.", "我由衷赞同这句格言：管得最少的政府，才是最好的政府。", "Project Gutenberg eBook 71", "梭罗从个人良知出发，追问公民在不义制度面前应承担何种责任。"],
  ["the-prophet", "先知·船归故乡", "kahlil-gibran", "黎巴嫩", "思想随笔", "Almustafa, the chosen and the beloved, who was a dawn unto his own day, had waited twelve years in the city of Orphalese.", "被选中的、受人爱戴的穆斯塔法，如同属于他那个时代的黎明，已在奥法利斯城等待了十二年。", "Project Gutenberg eBook 58585", "先知在离城前回答人们关于爱、劳动、自由与死亡的提问。"],
];

const authorJson = ([id, name, originalName, birthYear, deathYear, country, bio]) => ({
  id,
  slug: id,
  name,
  aliases: [originalName],
  courtesyNames: [],
  birthYear,
  deathYear,
  dynasty: "近代",
  country,
  bio,
  styleSummary: "本馆采用公版原文，并提供项目原创中文译文与简明导读。",
  timeline: [],
  representativeWorks: [],
  relatedPeople: [],
});

const renderWork = ([id, title, authorId, country, genre, original, translation, source, summary]) => `---
id: ${id}
slug: ${id}
title: ${title}
aliases: []
authorId: ${authorId}
category: 外国文学
foreignGenre: ${genre}
dynasty: 近代
language: en
estimatedMinutes: 8
rightsStatus: public-domain
summary: ${summary}
tags: [外国文学, ${country}, ${genre}]
moods: [夜读, 沉思]
ambience: [rain]
defaultAmbience: rain
sourceNote: 原文依据 ${source}；中文译文与导读为本项目原创整理。
editorialNotes: []
pronunciationOverrides: []
---
## 原文
${original}

## 白话
${translation}

## 创作背景
本条目选取原作开篇或代表段落。原作及所依据的英文版本已进入公版领域，本馆保留原文并提供原创中文译文。

## 赏析
作品从一个清晰的场景、问题或人物关系进入主题。节选兼顾独立听读的完整感，也保留继续阅读原作的入口。
`;

let authorCount = 0;
for (const author of authors) {
  const target = path.join(authorsDir, `${author[0]}.json`);
  try {
    await access(target);
  } catch {
    await writeFile(target, `${JSON.stringify(authorJson(author), null, 2)}\n`, "utf8");
    authorCount += 1;
  }
}

let workCount = 0;
for (const work of works) {
  const target = path.join(worksDir, `${work[0]}.md`);
  try {
    await access(target);
  } catch {
    await writeFile(target, renderWork(work), "utf8");
    workCount += 1;
  }
}

console.log(`外国文学题材扩充：新增 ${workCount} 篇作品，${authorCount} 位作者。`);
