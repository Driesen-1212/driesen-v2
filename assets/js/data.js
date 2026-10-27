/* ============================================================
   data.js — 站点全部内容
   文案：全部重写，语感对齐参考站（英文等宽标签 + 中文短句，
   先机制后结果，不用形容词自夸，不沿用资料文档原话）
   ============================================================ */

/* ---------- 首屏打字行 ---------- */
window.TypedLines = [
  'Photographer & product developer.',
  'I shoot, I build, and I let models generate.',
  'Work speaks louder than words.'
];

/* ---------- 摄影：31 张（编号 / 中文 / 英文 / 类别） ---------- */
window.PHOTOS = [
  { n:'01', cn:'飞檐',        en:'Eaves',                 cat:'寺观', f:'01-eaves.webp' },
  { n:'02', cn:'垂纶',        en:'Angling',               cat:'城市', f:'02-angling.webp' },
  { n:'03', cn:'寒湖疏影',    en:'Sparse Shadows',        cat:'高原', f:'03-sparse-shadows.webp' },
  { n:'04', cn:'繁花',        en:'Bloom',                 cat:'静物', f:'21-bloom.webp' },
  { n:'05', cn:'林间精灵',    en:'Forest Creature',       cat:'高原', f:'19-forest-creature.webp' },
  { n:'06', cn:'圣塔经幡',    en:'Stupa and Banners',     cat:'寺观', f:'06-stupa-and-banners.webp' },
  { n:'07', cn:'守望',        en:'Watch',                 cat:'高原', f:'07-watch.webp' },
  { n:'08', cn:'湖畔疏木',    en:'Trees by the Lake',     cat:'高原', f:'24-trees-by-the-lake.webp' },
  { n:'09', cn:'云锁雪峰',    en:'Cloud on the Peak',     cat:'高原', f:'09-cloud-on-the-peak.webp' },
  { n:'10', cn:'天路经幡',    en:'Banners on the Road',   cat:'高原', f:'10-banners-on-the-road.webp' },
  { n:'11', cn:'时光列车',    en:'Steam and Time',        cat:'城市', f:'17-steam-and-time.webp' },
  { n:'12', cn:'雪岭',        en:'Snow Ridge',            cat:'高原', f:'12-snow-ridge.webp' },
  { n:'13', cn:'红砖巷',      en:'Red Brick',             cat:'城市', f:'27-red-brick.webp' },
  { n:'14', cn:'远眺',        en:'Distant Bridge',        cat:'城市', f:'14-distant-bridge.webp' },
  { n:'15', cn:'都市之珠',    en:'Urban Pearl',           cat:'城市', f:'26-urban-pearl.webp' },
  { n:'16', cn:'正义门',      en:'Gate',                  cat:'寺观', f:'16-gate.webp' },
  { n:'17', cn:'雪峰暮霭',    en:'Evening Haze',          cat:'高原', f:'11-evening-haze.webp' },
  { n:'18', cn:'水禽图',      en:'Water Birds',           cat:'高原', f:'18-water-birds.webp' },
  { n:'19', cn:'多肉物语',    en:'Succulent',             cat:'静物', f:'05-succulent.webp' },
  { n:'20', cn:'塔影',        en:'Clock Tower',           cat:'寺观', f:'20-clock-tower.webp' },
  { n:'21', cn:'镜湖孤影',    en:'Lone Shadow',           cat:'高原', f:'04-lone-shadow.webp' },
  { n:'22', cn:'轮转',        en:'Prayer Wheels',         cat:'寺观', f:'29-prayer-wheels.webp' },
  { n:'23', cn:'桥韵',        en:'Bridge in Grey',        cat:'城市', f:'23-bridge-in-grey.webp' },
  { n:'24', cn:'归牧',        en:'Herding Home',          cat:'高原', f:'08-herding-home.webp' },
  { n:'25', cn:'一叶知秋',    en:'One Leaf',              cat:'静物', f:'25-one-leaf.webp' },
  { n:'26', cn:'流光',        en:'Flowing Gold',          cat:'城市', f:'15-flowing-gold.webp' },
  { n:'27', cn:'流水岩痕',    en:'Water on Rock',         cat:'高原', f:'13-water-on-rock.webp' },
  { n:'28', cn:'古巷行旅',    en:'Old Alley',             cat:'城市', f:'28-old-alley.webp' },
  { n:'29', cn:'大地脉络',    en:'Veins of Earth',        cat:'高原', f:'22-veins-of-earth.webp' },
  { n:'30', cn:'经幡步道',    en:'Banner Walk',           cat:'寺观', f:'30-banner-walk.webp' },
  { n:'31', cn:'圣湖',        en:'Sacred Lake',           cat:'高原', f:'31-sacred-lake.webp' }
];

/* editorial break：这些序号的作品插入全宽大图位 */
window.PHOTO_BREAKS = [3, 11, 19, 27];

window.PHOTO_CATS = [
  { key:'all', cn:'全部' },
  { key:'城市', cn:'城市' },
  { key:'高原', cn:'高原' },
  { key:'寺观', cn:'寺观' },
  { key:'静物', cn:'静物' }
];

/* ---------- 产品开发：6 个（PRD 结构：背景 / 做法 / 结果 / 状态条） ---------- */
window.WORKS = [
  {
    idx:'01',
    tag:'AI Interviewer · Coze Agent',
    title:'AI 智面体',
    background:'应届生缺的不是建议，是一场像样的模拟面试。真人陪练贵，普通问答机器人又接不住岗位细节。',
    approach:'三个 Coze Agent 分工：出题、追问、复盘。自研 Skill-RAG 插件把简历和岗位 JD 接进上下文，语音进出，三秒内接话。',
    metrics:[{k:'提问匹配',v:'96%'},{k:'简历解析',v:'90%'},{k:'语音响应',v:'3s'}],
    meta:{ role:'独立开发', stack:'Coze · DeepSeek-V3.2', status:'已交付' },
    tags:['Coze','Skill-RAG','ASR · TTS'],
    note:'广东省大学生计算机设计大赛省三等奖',
    link:null
  },
  {
    idx:'02',
    tag:'Assertion-level Fact Check',
    title:'Verity · 有据',
    background:'模型引用会编。一段话里混进一句没出处的，读者看不出来，作者也不一定知道。',
    approach:'把 PDF 拆到断言级再逐句回查。结论只有三态：有出处、查不到、与原文冲突，每一条都能跳回页码。',
    metrics:[{k:'P · R · F1',v:'1.000'},{k:'规则覆盖',v:'0.955'},{k:'测试',v:'pytest 87'}],
    meta:{ role:'独立开发', stack:'Python · SQLite · 倒排索引', status:'Online' },
    tags:['倒排索引','两阶段精排','字符级 diff'],
    link:{ label:'Open', url:'https://verity-check.app.workbuddy.host' }
  },
  {
    idx:'03',
    tag:'A/B Experiment Desk',
    title:'Verdict · 实验决策台',
    background:'实验最常见的死法：跑了两周，才发现样本量从一开始就不够。',
    approach:'开跑前先算样本量与天数；SRM 失衡、新奇效应、序贯边界在同一屏校验，频率派与贝叶斯并排给结论，结论可归档。',
    metrics:[{k:'样本量',v:'开跑前估算'},{k:'完整性',v:'SRM 校验'},{k:'检验',v:'序贯边界'}],
    meta:{ role:'独立开发', stack:'统计检验 · 双学派', status:'Online' },
    tags:['频率派 × 贝叶斯','序贯检验'],
    link:{ label:'Open', url:'https://verdict-lab.app.workbuddy.host' }
  },
  {
    idx:'04',
    tag:'WeChat Mini Program',
    title:'不器不气',
    background:'老师下课只有三十秒。课堂记录靠手写，撑不了一学期。',
    approach:'结构化记录压进三十秒，家长反馈由模型起草、老师确认后发出。上线前跑全量评审，问题清零再提审。',
    metrics:[{k:'评审问题',v:'45 项全修'},{k:'单元测试',v:'24 / 24'},{k:'云函数',v:'5'}],
    meta:{ role:'独立开发', stack:'微信小程序 · 云开发', status:'调试中' },
    tags:['微信小程序','AI Feedback'],
    link:null
  },
  {
    idx:'05',
    tag:'Goal Breakdown × Virtual Pet',
    title:'龙巢计划',
    background:'目标管理工具不缺，缺一个坚持下来的理由。',
    approach:'目标拆成任务，任务喂一条会长的龙。uni-app 一套代码，网页、小程序、App 三端同源，回归断言压住每次改动。',
    metrics:[{k:'页面',v:'14'},{k:'回归断言',v:'304'},{k:'架构',v:'三端同源'}],
    meta:{ role:'独立开发', stack:'uni-app · Capacitor', status:'迭代中' },
    tags:['uni-app','回归测试'],
    link:null
  },
  {
    idx:'06',
    tag:'Bid Integrity AI',
    title:'核标雷达',
    background:'中标信息散在几十个平台。核验一家企业的投标底细，要开十几个标签页。',
    approach:'输入企业名或统一社会信用代码，多源标讯聚合成一份画像。结论只给两种：已验证，未找到。',
    metrics:[{k:'覆盖市场',v:'34.74 万亿'},{k:'年项目量',v:'184 万'},{k:'响应',v:'分钟级'}],
    meta:{ role:'产品与开发', stack:'多源聚合 · 证据链', status:'运营中' },
    tags:['多源聚合','证据链'],
    note:'顺德黑客松命题作品',
    link:null
  }
];

/* ---------- AIGC 详情页：三款 × 九屏 ---------- */
window.SCREENS = [
  { key:'A', label:'A', files:['aigc/A-01.webp','aigc/A-02.webp','aigc/A-03.webp','aigc/A-04.webp','aigc/A-05.webp','aigc/A-06.webp','aigc/A-07.webp','aigc/A-08.webp','aigc/A-09.webp'] },
  { key:'B', label:'B', files:['aigc/B-01.webp','aigc/B-02.webp','aigc/B-03.webp','aigc/B-04.webp','aigc/B-05.webp','aigc/B-06.webp','aigc/B-07.webp','aigc/B-08.webp','aigc/B-09.webp'] },
  { key:'C', label:'C', files:['aigc/C-01.webp','aigc/C-02.webp','aigc/C-03.webp','aigc/C-04.webp','aigc/C-05.webp','aigc/C-06.webp','aigc/C-07.webp','aigc/C-08.webp','aigc/C-09.webp'] }
];

/* 电商详情页设计语言要点 */
window.DESIGN_NOTES = [
  { k:'Grid', v:'12 栏网格。首屏只放一句话，其余全部让给图。' },
  { k:'Type', v:'字号只留两级：大字陈述，小字举证。' },
  { k:'Space', v:'留白按呼吸排。屏与屏之间不解释，靠节奏接住。' },
  { k:'Light', v:'光统一 45° 侧逆。影调压在银灰，商品自己站出来。' }
];

/* ---------- 《归零》三十六帧（成片统一校色 + 序幕补齐，6×6 网格） ---------- */
window.FRAMES = [
  { f:'g01.webp', n:'S01', cn:'合上卡尺',   en:'Caliper closing' },
  { f:'g02.webp', n:'S02', cn:'读数',       en:'Caliper reading' },
  { f:'g03.webp', n:'S03', cn:'黎明走廊',   en:'Corridor dawn' },
  { f:'g04.webp', n:'S04', cn:'走进车间',   en:'Entering workshop' },
  { f:'g05.webp', n:'S04', cn:'工具柜',     en:'Tool cabinet' },
  { f:'g06.webp', n:'S05', cn:'取出卡尺',   en:'Taking the caliper' },
  { f:'g07.webp', n:'S06', cn:'归零',       en:'Zeroing' },
  { f:'g08.webp', n:'S06', cn:'读数归零',   en:'Caliper zeroed' },
  { f:'g09.webp', n:'S09', cn:'工作台双人', en:'Workbench two-shot' },
  { f:'g10.webp', n:'S11', cn:'布置任务',   en:'The briefing' },
  { f:'g11.webp', n:'S12', cn:'手上的旧疤', en:'Scar hands' },
  { f:'g12.webp', n:'S14', cn:'下班前',     en:'End of day' },
  { f:'g13.webp', n:'S15', cn:'推回零位',   en:'Lin zeroing' },
  { f:'g14.webp', n:'S17', cn:'食堂双人',   en:'Canteen two-shot' },
  { f:'g15.webp', n:'S18', cn:'递筷子',     en:'Chopsticks' },
  { f:'g16.webp', n:'S19', cn:'桌下的信封', en:'Envelope under the table' },
  { f:'g17.webp', n:'S20', cn:'推回菜单',   en:'Menu pushed back' },
  { f:'g18.webp', n:'S22', cn:'杯沿',       en:'Cup rim' },
  { f:'g19.webp', n:'S23', cn:'上锁铁盒',   en:'Locked tin box' },
  { f:'g20.webp', n:'S24', cn:'泛黄收据',   en:'Aged receipt' },
  { f:'g21.webp', n:'S25', cn:'雨里的自行车', en:'Bicycle in rain' },
  { f:'g22.webp', n:'S25', cn:'伏案',       en:'Head bowed' },
  { f:'g23.webp', n:'S25', cn:'一张一张点', en:'Counting it out' },
  { f:'g24.webp', n:'S26', cn:'读收据',     en:'Reading the receipt' },
  { f:'g25.webp', n:'S27', cn:'十二年',     en:'Twelve years' },
  { f:'g26.webp', n:'S30', cn:'抽检刀头',   en:'Inspecting the bit' },
  { f:'g27.webp', n:'S32', cn:'耳语',       en:'A whisper' },
  { f:'g28.webp', n:'S33', cn:'沉默',       en:'Silence' },
  { f:'g29.webp', n:'S34', cn:'落笔',       en:'The pen lands' },
  { f:'g30.webp', n:'S35', cn:'淡出',       en:'Fade out' },
  { f:'g31.webp', n:'S36', cn:'交接',       en:'Handover' },
  { f:'g32.webp', n:'S38', cn:'报废自己的活', en:'Scrapping his work' },
  { f:'g33.webp', n:'S39', cn:'点头',       en:'A nod' },
  { f:'g34.webp', n:'S40', cn:'铁盒',       en:'Tin box' },
  { f:'g35.webp', n:'S42', cn:'归零',       en:'Final zero' },
  { f:'g36.webp', n:'ALT', cn:'同一部戏的另一个凌晨', en:'Another dawn, same film' }
];

/* ---------- 《醒狮·觉醒》二十一帧 ---------- */
window.AWAKEN = [
  { f:'aw01.webp', n:'01', cn:'雨夜空巷', en:'Rain Alley' },
  { f:'aw02.webp', n:'02', cn:'蒙尘待机', en:'Dormant' },
  { f:'aw03.webp', n:'03', cn:'点睛', en:'First Light' },
  { f:'aw04.webp', n:'04', cn:'楼群之下', en:'Under the Towers' },
  { f:'aw05.webp', n:'05', cn:'霓虹通体', en:'Neon Skin' },
  { f:'aw06.webp', n:'06', cn:'火星四溅', en:'Sparks' },
  { f:'aw07.webp', n:'07', cn:'泛黄档案', en:'Faded Archive' },
  { f:'aw08.webp', n:'08', cn:'新旧同框', en:'Old Soul, New Shell' },
  { f:'aw09.webp', n:'09', cn:'腾跃', en:'The Leap' },
  { f:'aw10.webp', n:'10', cn:'品红电弧', en:'Magenta Arc' },
  { f:'aw11.webp', n:'11', cn:'雨雾侧脸', en:'Profile in Rain' },
  { f:'aw12.webp', n:'12', cn:'楼顶燃鬃', en:'Mane Afire' },
  { f:'aw13.webp', n:'13', cn:'天际线', en:'Skyline' },
  { f:'aw14.webp', n:'14', cn:'天光初亮', en:'Daybreak' },
  { f:'aw15.webp', n:'15', cn:'远楼回望', en:'Looking Back' },
  { f:'aw16.webp', n:'16', cn:'水痕', en:'Water Marks' },
  { f:'aw17.webp', n:'17', cn:'机械之眼', en:'The Lens' },
  { f:'aw18.webp', n:'18', cn:'正面点亮', en:'Face Lit' },
  { f:'aw19.webp', n:'19', cn:'数据神龛', en:'The Shrine' },
  { f:'aw20.webp', n:'20', cn:'穿街', en:'Through the Street' },
  { f:'aw21.webp', n:'21', cn:'金丝鬃', en:'Golden Fibres' }
];

/* ---------- 《归零》角色设定（三视图与定妆） ---------- */
window.CHARACTERS = [
  { f:'character-sheet-01.webp', label:'CHARACTER SHEET · 01' },
  { f:'character-sheet-02.webp', label:'CHARACTER SHEET · 02' },
  { f:'character-sheet-03.webp', label:'CHARACTER SHEET · 03' },
  { f:'character-sheet-04.webp', label:'CHARACTER SHEET · 04' },
  { f:'character-sheet-05.webp', label:'CHARACTER SHEET · 05' },
  { f:'zhou-zhenshan.webp',      label:'周振山 · 主参考' },
  { f:'zhou-zhenshan-30.webp',   label:'周振山 · 青年版' },
  { f:'zhou-zhenshan-hands.webp',label:'手部参考' },
  { f:'lin-yuan.webp',           label:'学生 · 主参考' },
  { f:'zhao-zhenjiang.webp',     label:'供应商 · 主参考' },
  { f:'chen-zhuren.webp',        label:'实训主任 · 主参考' },
  { f:'hands-reference.webp',    label:'HANDS · 统一参考' },
  { f:'film-still-01.webp',      label:'FILM STILL · 01' },
  { f:'film-still-02.webp',      label:'FILM STILL · 02' },
  { f:'film-still-03.webp',      label:'FILM STILL · 03' }
];

/* ---------- 《雪域之上》画册（Imprint 引擎产出，16 页） ---------- */
window.ALBUM = {
  title:'雪域之上',
  en:'Above the Snow Line',
  spec:'248 × 175 mm · photo-essay',
  pages: Array.from({ length: 16 }, (_, i) => 'album/p' + String(i + 1).padStart(2, '0') + '.webp')
};
