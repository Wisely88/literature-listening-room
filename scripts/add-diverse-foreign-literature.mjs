import { access, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const worksDir = path.join(root, "content", "works");
const authorsDir = path.join(root, "content", "authors");

const authors = [
  ["jane-austen", "简·奥斯汀", "Jane Austen", 1775, 1817, "英国", "英国小说家，以细致观察、反讽和对婚姻与社会阶层的描写著称。"],
  ["charlotte-bronte", "夏洛蒂·勃朗特", "Charlotte Brontë", 1816, 1855, "英国", "英国小说家，作品关注女性成长、尊严与精神独立。"],
  ["emily-bronte", "艾米莉·勃朗特", "Emily Brontë", 1818, 1848, "英国", "英国小说家、诗人，以强烈的情感和荒原意象著称。"],
  ["charles-dickens", "查尔斯·狄更斯", "Charles Dickens", 1812, 1870, "英国", "英国小说家，善于以鲜明人物和城市叙事呈现社会生活。"],
  ["mary-shelley", "玛丽·雪莱", "Mary Shelley", 1797, 1851, "英国", "英国小说家，《弗兰肯斯坦》把科学想象、伦理责任与哥特叙事结合起来。"],
  ["lewis-carroll", "刘易斯·卡罗尔", "Lewis Carroll", 1832, 1898, "英国", "英国作家与数学家，以语言游戏和奇幻逻辑闻名。"],
  ["oscar-wilde", "奥斯卡·王尔德", "Oscar Wilde", 1854, 1900, "爱尔兰", "爱尔兰作家、剧作家，文字华美机敏，童话常兼具温柔与讽喻。"],
  ["o-henry", "欧·亨利", "O. Henry", 1862, 1910, "美国", "美国短篇小说家，以城市小人物、温情和出人意料的结尾著称。"],
  ["washington-irving", "华盛顿·欧文", "Washington Irving", 1783, 1859, "美国", "美国早期重要作家，作品融合地方传说、幽默与幽微的神秘气氛。"],
  ["guy-de-maupassant", "居伊·德·莫泊桑", "Guy de Maupassant", 1850, 1893, "法国", "法国短篇小说家，擅长以精确细节揭示欲望、阶层与命运。"],
  ["fyodor-dostoevsky", "费奥多尔·陀思妥耶夫斯基", "Fyodor Dostoevsky", 1821, 1881, "俄罗斯", "俄罗斯小说家，深入书写罪责、良知、自由与救赎。"],
  ["leo-tolstoy", "列夫·托尔斯泰", "Leo Tolstoy", 1828, 1910, "俄罗斯", "俄罗斯作家，以广阔现实描写和对生命伦理的追问著称。"],
  ["hans-christian-andersen", "汉斯·克里斯蒂安·安徒生", "Hans Christian Andersen", 1805, 1875, "丹麦", "丹麦作家，以兼具诗意、哀感与希望的童话闻名。"],
];

const works = [
  ["pride-and-prejudice-opening", "傲慢与偏见·初来乍到", "jane-austen", "英国", "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", "有一条举世公认的道理：一个拥有丰厚财产的单身男子，总会被认为需要一位妻子。", "Project Gutenberg eBook 1342"],
  ["jane-eyre-red-room", "简·爱·红房间之前", "charlotte-bronte", "英国", "There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning.", "那天完全不可能出去散步。早晨我们还曾在落尽叶子的灌木丛中走了一个小时。", "Project Gutenberg eBook 1260"],
  ["wuthering-heights-arrival", "呼啸山庄·荒原来客", "emily-bronte", "英国", "1801—I have just returned from a visit to my landlord—the solitary neighbour that I shall be troubled with.", "一八〇一年——我刚拜访房东归来。他是我在这片地方唯一需要打交道的邻居。", "Project Gutenberg eBook 768"],
  ["great-expectations-marshes", "远大前程·沼泽地", "charles-dickens", "英国", "My father's family name being Pirrip, and my Christian name Philip, my infant tongue could make of both names nothing longer or more explicit than Pip.", "父亲的姓是皮里普，我的名字是菲利普；幼小时的舌头只能把它们说成一个简单的“匹普”。", "Project Gutenberg eBook 1400"],
  ["christmas-carol-marley", "圣诞颂歌·马利已死", "charles-dickens", "英国", "Marley was dead: to begin with. There is no doubt whatever about that.", "首先必须说明：马利已经死了。这件事没有丝毫疑问。", "Project Gutenberg eBook 46"],
  ["frankenstein-creation-night", "弗兰肯斯坦·创造之夜", "mary-shelley", "英国", "It was on a dreary night of November that I beheld the accomplishment of my toils.", "那是十一月一个阴沉凄冷的夜晚，我终于看见自己劳作的结果。", "Project Gutenberg eBook 84"],
  ["alice-down-rabbit-hole", "爱丽丝漫游奇境·兔子洞", "lewis-carroll", "英国", "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do.", "爱丽丝坐在河岸边陪着姐姐，渐渐厌倦起来，因为她实在无事可做。", "Project Gutenberg eBook 11"],
  ["happy-prince-statue", "快乐王子·城市上空", "oscar-wilde", "爱尔兰", "High above the city, on a tall column, stood the statue of the Happy Prince.", "在城市上空高高的石柱上，立着快乐王子的雕像。", "Project Gutenberg eBook 902"],
  ["gift-of-the-magi", "麦琪的礼物", "o-henry", "美国", "One dollar and eighty-seven cents. That was all. And sixty cents of it was in pennies.", "一美元八十七美分。全部就这些，其中六十美分还是一个个铜板。", "Project Gutenberg eBook 7256"],
  ["the-last-leaf", "最后一片叶子", "o-henry", "美国", "In a little district west of Washington Square the streets have run crazy and broken themselves into small strips called places.", "在华盛顿广场西边的一小片街区，道路像忽然迷失方向，分裂成许多被称作“巷”的窄条。", "Project Gutenberg 公版《The Trimmed Lamp》"],
  ["legend-of-sleepy-hollow", "睡谷传奇", "washington-irving", "美国", "In the bosom of one of those spacious coves which indent the eastern shore of the Hudson, there lies a small market town.", "哈得孙河东岸曲折的宽阔河湾深处，坐落着一座小小的集镇。", "Project Gutenberg 公版《The Sketch Book》"],
  ["the-necklace", "项链", "guy-de-maupassant", "法国", "She was one of those pretty and charming girls, born, as if by an error of fate, into a family of clerks.", "她是那种美丽迷人的姑娘，却像命运出了差错，出生在一个小职员家庭。", "Project Gutenberg 公版英译本"],
  ["crime-and-punishment-room", "罪与罚·炎热黄昏", "fyodor-dostoevsky", "俄罗斯", "On an exceptionally hot evening early in July a young man came out of the garret in which he lodged and walked slowly toward K bridge.", "七月初一个异常炎热的傍晚，一个年轻人离开租住的阁楼，慢慢朝桥的方向走去。", "Project Gutenberg eBook 2554，Constance Garnett 公版英译"],
  ["death-of-ivan-ilyich", "伊凡·伊里奇之死·讣告", "leo-tolstoy", "俄罗斯", "During an interval in the Melvinski trial in the large building of the Law Courts the members and public prosecutor met in Ivan Egorovich Shebek's private room.", "梅尔温斯基案件审理休息时，法院成员和检察官聚在一间办公室里，死亡的消息就在那里传开。", "Project Gutenberg 公版英译本"],
  ["little-match-girl", "卖火柴的小女孩", "hans-christian-andersen", "丹麦", "It was terribly cold and nearly dark on the last evening of the old year, and the snow was falling fast.", "旧年最后一个夜晚，天气冷得可怕，天色将暗，大雪正急急落下。", "Project Gutenberg 公版英译本"],
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

const renderWork = ([id, title, authorId, country, original, translation, source]) => `---
id: ${id}
slug: ${id}
title: ${title}
aliases: []
authorId: ${authorId}
category: 外国文学
dynasty: 近代
language: en
estimatedMinutes: 3
rightsStatus: public-domain
summary: 《${title}》公版原文精读片段，配项目原创中文译文与导读。
tags: [外国文学, ${country}, 名著精读]
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
本条目选取《${title}》中适合独立听读的代表片段。原作及所依据的英文版本已进入公版领域，本馆保留原文并提供原创中文译文。

## 赏析
短短的开篇或关键场景迅速建立人物、环境和叙事语气。它既可以独立聆听，也为继续阅读完整作品留下入口。
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

console.log(`外国文学新增完成：${workCount} 篇作品，${authorCount} 位作者。`);
