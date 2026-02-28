// ==========================================
// チームカラー診断 メインロジック
// ==========================================

// --- データ定義 ---

// 結果タイプの定義 (独自軸: チームカラー用)
const AXES = {
    OI: 'OI', // [O]utput (発信) vs [I]nput (傾聴)
    VD: 'VD', // [V]ision (直感・構想) vs [D]etail (現実・詳細)
    LE: 'LE', // [L]ogic (論理・効率) vs [E]motion (感情・協調)
    PF: 'PF'  // [P]lanning (計画・進行) vs [F]lexible (柔軟・臨機応変)
};

// 12問の質問（各軸につき3問ずつ）
// direction: 1 の場合、「Agree (1〜2)」を選ぶと左側の文字（O, V, L, P）に1〜2点が入り、「Disagree」で右側の文字（I, D, E, F）に入る
// direction: -1 の場合、逆転する
const questions = [
    { id: 1, axis: AXES.OI, direction: 1, text: "チームでは自分からどんどん発言し、議論をリードする方だ。" },
    { id: 2, axis: AXES.VD, direction: -1, text: "アイデアを考えるより、まずは具体的な仕様やルールを固めたい。" }, // Agree=Detail(+)
    { id: 3, axis: AXES.LE, direction: -1, text: "プロジェクトの効率やスピードより、メンバーが楽しく作業できているかを優先する。" }, // Agree=Emotion(+)
    { id: 4, axis: AXES.PF, direction: 1, text: "締め切りに追われるのが嫌なので、早めに計画を立ててスケジュール通りに進める。" }, // Agree=Planning(+)
    { id: 5, axis: AXES.OI, direction: -1, text: "大勢でワイワイ作るより、少人数や一人で黙々と作業する方が集中できる。" }, // Agree=Input(+)
    { id: 6, axis: AXES.VD, direction: 1, text: "現実的にできるかよりも、「これ、めっちゃ面白そう！」という直感で作りたい。" }, // Agree=Vision(+)
    { id: 7, axis: AXES.LE, direction: 1, text: "意見がぶつかった時は、お互いの気持ちよりも「論理的にどちらが正しいか」で決めるべきだ。" }, // Agree=Logic(+)
    { id: 8, axis: AXES.PF, direction: -1, text: "最初からカッチリ計画を作るより、作りながら臨機応変にやり方を変えていきたい。" }, // Agree=Flexible(+)
    { id: 9, axis: AXES.OI, direction: 1, text: "出来上がった作品は、とにかく色んな人に見てもらって感想を聞きたい。" }, // Agree=Output(+)
    { id: 10, axis: AXES.VD, direction: -1, text: "ゲームのデバッグや細かい調整など、地道な作業も苦にならない。" }, // Agree=Detail(+)
    { id: 11, axis: AXES.LE, direction: -1, text: "クオリティを高めるために厳しい指摘をするよりも、まずは良かったところを褒めたい。" }, // Agree=Emotion(+)
    { id: 12, axis: AXES.PF, direction: 1, text: "役割分担やToDoリストは、しっかり明確にしておかないと気が済まない。" }, // Agree=Planning(+)

    // --- ここから追加の10問 ---
    { id: 13, axis: AXES.OI, direction: -1, text: "会議では自分から提案するよりも、みんなの意見を聞いてまとめる方が得意だ。" }, // Agree=Input(+)
    { id: 14, axis: AXES.VD, direction: 1, text: "既存のゲームを真似るより、これまで誰も見たことがない新しいジャンルを作りたい。" }, // Agree=Vision(+)
    { id: 15, axis: AXES.LE, direction: 1, text: "タスクの割り振りは、各個人の能力と過去の経験に基づいてドライに決めるべきだ。" }, // Agree=Logic(+)
    { id: 16, axis: AXES.PF, direction: -1, text: "制作途中で「やっぱりこっちの方が面白い！」と思ったら、当初の予定を壊しても構わない。" }, // Agree=Flexible(+)
    { id: 17, axis: AXES.OI, direction: 1, text: "SNS等で進捗を細かくアピールしたり、周りを巻き込んで盛り上げるのが好きだ。" }, // Agree=Output(+)
    { id: 18, axis: AXES.VD, direction: -1, text: "壮大なコンセプトよりも、まずは「ジャンプ画面」など目に見える機能から1つずつ完成させたい。" }, // Agree=Detail(+)
    { id: 19, axis: AXES.LE, direction: -1, text: "誰か一人でも納得していないメンバーがいれば、時間がかかっても話し合いを続けたい。" }, // Agree=Emotion(+)
    { id: 20, axis: AXES.PF, direction: 1, text: "未完成の部分があっても、まずは全体が動く「モックアップ（試作品）」を期限内に提出することが最優先だ。" }, // Agree=Planning(+)
    { id: 21, axis: AXES.OI, direction: -1, text: "オンラインでのテキストチャットや、ドキュメントの整理など、後方支援的なコミュニケーションの方が気楽だ。" }, // Agree=Input(+)
    { id: 22, axis: AXES.VD, direction: 1, text: "細かいバグ修正よりも、タイトルロゴやメインビジュアルなど、作品の「顔」の美しさにこだわりたい。" }, // Agree=Vision(+)
    { id: 23, axis: AXES.LE, direction: -1, text: "完成度を高めることより、参加した全員が「楽しかった！」と思えるような過程を大切にしたい。" }, // Agree=Emotion(+)
    { id: 24, axis: AXES.PF, direction: 1, text: "期限直前に徹夜で頑張るよりも、最初から逆算して毎日少しずつ進める方が好きだ。" }, // Agree=Planning(+)
    { id: 25, axis: AXES.VD, direction: -1, text: "壮大な設定やストーリーを一から考えるより、既存のフォーマットを改善する方が得意だ。" }, // Agree=Detail(+)
    { id: 26, axis: AXES.LE, direction: 1, text: "「なぜこの仕様にするのか」について、感覚よりもデータや論理的な理由で説明してほしい。" }, // Agree=Logic(+)
    { id: 27, axis: AXES.OI, direction: -1, text: "チームの中心で目立つよりも、自分の担当作業に静かに没頭している時間が幸せだ。" }, // Agree=Input(+)
    { id: 28, axis: AXES.PF, direction: -1, text: "細かくスケジュールを決めすぎると窮屈に感じてしまい、アイデアが出にくくなる。" }, // Agree=Flexible(+)
    { id: 29, axis: AXES.LE, direction: -1, text: "チーム内で意見が対立した時は、正論で論破するよりも、お互いの妥協点を探るべきだ。" }, // Agree=Emotion(+)
    { id: 30, axis: AXES.OI, direction: 1, text: "自分が面白いと思ったことは、すぐに他の人に話してリアクションを見たくなってしまう。" }  // Agree=Output(+)
];

// 代表的な16パターンの簡易結果データ
// （※本来は16タイプ全て記述しますが、今回はサンプルのため一部を主要に設定します）
const resultData = {
    "OVLP": {
        ja: "司令塔ディレクター",
        desc: "チームのベクトルを合わせ、計画通りにプロジェクトを進めることにやりがいを感じるリーダータイプ。",
        role: "全体のスケジュール管理、ルール構築",
        deepDive: "目標達成に向けてチーム全体を引っ張る役割を自然と担うことが多いようです。全体像と詳細なタスクの両方を把握し、無駄のないスケジュールを組み立てるのを得意とする傾向があります。少し予定が狂った時に、メンバーの気持ちにも寄り添う余裕を持つと、さらにチームの結束力が固まるかもしれません。",
        imgSrc: "images/lion_ovlp.png"
    },
    "OVLF": {
        ja: "カリスマビジョナリー",
        desc: "高い目標や面白いビジョンを掲げ、チームを論理的に導くことに情熱を注ぐプランナータイプ。",
        role: "プロジェクトの方向性決定、大胆な決断",
        deepDive: "常に「もっと面白くできるはず」と高いビジョンを追い求める野心家の側面があります。想定外のトラブルが起きても、臨機応変に計画を修正できるしなやかさを持っています。ただ、アイデアがあふれて発散しがちなので、定期的に「今回はここまで！」とお互いにストップをかけるルールを作ると進行がスムーズになります。",
        imgSrc: "images/eagle_ovlf.png"
    },
    "OVEP": {
        ja: "みんなのお世話役",
        desc: "チームの調和を重んじ、全員が気持ちよく作業できるようサポートすることに喜びを感じるタイプ。",
        role: "コミュニケーションの橋渡し、進捗のフォロー",
        deepDive: "メンバーの長所を引き出し、チーム全体の士気を保つ潤滑油のような役割を好む傾向があります。誰かが悩んでいるとすぐに気づき、優しくフォローできる配慮の持ち主です。ただ、全員の意見を尊重しようとして決断が遅れることがあるため、迷ったときは「一番の目的は何か」に立ち返ってみると良さそうです。",
        imgSrc: "images/dog_ovep.png"
    },
    "OVEF": {
        ja: "熱血クリエイター",
        desc: "情熱を周囲に伝染させ、メンバーのモチベーションを高めながら理想の作品へ導くタイプ。",
        role: "ビジョンの共有、チームの士気向上",
        deepDive: "あなたの熱量が、そのままチームを動かす最大のエネルギーになることが多いようです。「こんなゲームを作りたい！」というプレゼンで周りの心を動かす力を持っています。その反面、モチベーションの上下が激しい場面もあるため、地道な作業（デバッグなど）はコツコツ進めるのが得意な仲間に頼ってみると、さらに良いチームになるでしょう。",
        imgSrc: "images/monkey_ovef.png"
    },
    "ODLP": {
        ja: "ロジカルアナライザー",
        desc: "正確で緻密な作業を愛し、仕様やルールの穴を見つけ出してチームの「守り」を固めるタイプ。",
        role: "バグチェック、仕様詳細の設計",
        deepDive: "現実的な視点と論理性をもって、抽象的なアイデアを「どうすれば仕様に落とし込めるか」へと翻訳する能力に優れています。チームが夢見がちになった時に、リソースやスケジュールの現実を突きつける重要なストッパー役を担うことが多いです。時に「正論」が強すぎることがあるため、言葉選びを少し柔らかくするとより伝わりやすくなります。",
        imgSrc: "images/owl_odlp.png"
    },
    "ODLF": {
        ja: "スピーディービルダー",
        desc: "細かい計画よりも「まずは作ってみる」実践派。素早くプロトタイプを形にすることにやりがいを感じるタイプ。",
        role: "プロトタイプ制作、即興の修正",
        deepDive: "議論を長引かせるよりも「とりあえず動くものを作ってから考えよう」と、すぐに手を動かすことができる行動派のようです。技術的なトラブルにも現場でサッと対応できる柔軟性を持っています。ただ、思いつきでコア設計を後から変えてしまうことがあるため、事前に「ここだけは変えない部分」をチームと確認しておくと安心です。",
        imgSrc: "images/beaver_odlf.png"
    },
    "ODEP": {
        ja: "チームのムードメーカー",
        desc: "制作プロセスを全力で楽しみ、チームに明るい活気をもたらすことを大切にするタイプ。",
        role: "テストプレイ時の盛り上げ、アイデア出し",
        deepDive: "場の空気を明るくし、テストプレイやブレインストーミングの場を盛り上げる役割を自然と担っているようです。プレイヤー目線に立って「ここが楽しい！」を素直に共有できる感性を持っています。一方で、計画通りにコツコツ進めるのが少し苦手な一面があるため、進捗管理が得意な「P（計画）」タイプの相棒を見つけると大活躍できそうです。",
        imgSrc: "images/placeholder_odep.png"
    },
    "ODEF": {
        ja: "ワクワククリエイター",
        desc: "常識にとらわれないアイデアで、人を惹きつけるコンテンツを作ることに没頭するタイプ。",
        role: "コンセプトアート、キャラクター設定",
        deepDive: "細部にこだわりながらも、感情を揺さぶるエモい演出やユニークなアイデアを次々と生み出す発想力の持ち主です。感性の赴くままに作業するため、ノッている時の爆発力は桁違いですが、作業量に波が出やすい傾向があります。自分が一番集中できる環境作りや、期限を知らせてくれるツールを工夫すると、より才能を発揮しやすくなります。",
        imgSrc: "images/placeholder_odef.png"
    },
    "IVLP": {
        ja: "孤高のストラテジスト",
        desc: "独自のアイデアを持ち、効率的で美しいシステムを作り上げることに美学を感じるタイプ。",
        role: "コアシステムの実装、難解な課題の解決",
        deepDive: "チーム内で最も複雑な構造やルールづくりを、一人で黙々と組み立てる時間を好む傾向があります。長期的な視野で、後から崩れにくいきれいな設計を組むのが得意です。自分の頭の中で完結しやすい性質があるため、時々は考えていることをチームに「翻訳」して共有してみると、より頼りにされるはずです。",
        imgSrc: "images/placeholder_ivlp.png"
    },
    "IVLF": {
        ja: "ひらめき発明家",
        desc: "知的好奇心が旺盛で、新しいシステムや仕様に挑戦していく過程を楽しむタイプ。",
        role: "ブレストでの提案、革新的な機能の実装",
        deepDive: "誰も思いつかないような斬新なギミックやルールを頭の中で組み立てることにワクワクするタイプです。「面白そうならとりあえずやってみる」という知的な柔軟さを持っています。ただ、実現不可能なレベルまでお風呂敷を広げてしまうこともあるので、他のメンバーと協力して「今回はどこまで作るか」を見極めるとより形になりやすいです。",
        imgSrc: "images/placeholder_ivlf.png"
    },
    "IVEP": {
        ja: "理想主義デザイナー",
        desc: "深い洞察力を持ち、参加者の感情を揺さぶるような美しい作品や体験を目指すことにやりがいを感じるタイプ。",
        role: "世界観の構築、ストーリーテリング",
        deepDive: "静かに、しかし熱いこだわりを持って作品の世界観や体験の質を磨き上げるクリエイター気質です。他の人がどう感じるかを深く想像しながら作ることができます。完璧なものを目指すあまり、納期ギリギリまで悩んでしまうこともあるため、「今回はこれで完成とする」という妥協点をあらかじめ設定しておくのがおすすめです。",
        imgSrc: "images/placeholder_ivep.png"
    },
    "IVEF": {
        ja: "共感のストーリーテラー",
        desc: "独自の感性を持ち、参加者の感情にそっと寄り添うような温かい体験や作品作りを好むタイプ。",
        role: "シナリオ執筆、演出の調整",
        deepDive: "表立ってチームを引っ張るよりも、細やかな演出や言葉選びの工夫で、作品全体のクオリティを一段引き上げる感性の持ち主です。意見が対立した時は、争いを避けて自分の意見を飲み込んでしまうことが多いかもしれません。あなたの感性はチームの大切なピースなので、ぜひ勇気を出して自分のアイデアを伝えてみてください。",
        imgSrc: "images/placeholder_ivef.png"
    },
    "IDLP": {
        ja: "ロジック探求者",
        desc: "複雑な問題解決の筋道を立てたり、効率的な仕組みを整えることに楽しさを見出すタイプ。",
        role: "アルゴリズム設計、データ処理",
        deepDive: "現実のデータを元に緻密なバランス調整を行ったり、ツールや環境の整備など、裏方の管理で圧倒的な力を発揮する傾向があります。ルールや仕様がクリアになっている環境を好みます。マニュアル化や手順づくりが得意なので、チームの作業をスムーズにする「仕組みづくり」を担当すると大活躍できるでしょう。",
        imgSrc: "images/placeholder_idlp.png"
    },
    "IDLF": {
        ja: "マイペースな職人",
        desc: "自分が興味を持った特定の領域に対して、とてつもない集中力と探求心を発揮するタイプ。",
        role: "専門的な実装、ツールの最適化",
        deepDive: "特定の作業や技術など「自分の担当領域」に深く潜り込み、妥協のないクオリティで仕上げる職人肌の一面があります。緊急時のトラブルにも冷静に対処できる安心感を持っています。全体会議などには少し興味が薄いことがあるため、あなたから見て「ここはこうした方がいい」と思うことがあれば、積極的に言葉にしてみるとチームの助けになります。",
        imgSrc: "images/placeholder_idlf.png"
    },
    "IDEP": {
        ja: "縁の下のサポーター",
        desc: "困っている人を優しく助け、地道な作業を通じてチームを支えることに喜びを感じるタイプ。",
        role: "タスクのフォロー、アセットの整理",
        deepDive: "誰もやりたがらないような地道な作業や細かな調整を、正確かつ丁寧にこなしてくれる最高のサポーター気質です。メンバーの負担を減らすことに喜びを感じる献身的な一面があります。気遣い屋さんで自分からは要望を言いにくい性質があるため、抱え込みすぎる前に「ちょっと手伝って」と言葉にする練習をしてみると気が楽になるはずです。",
        imgSrc: "images/placeholder_idep.png"
    },
    "IDEF": {
        ja: "感性アーティスト",
        desc: "美しいビジュアルや心地よい手触りなど、感覚的な要素にこだわりを持って表現するタイプ。",
        role: "グラフィック制作、UIデザインの調整",
        deepDive: "色使いやデザイン、全体の手触りなど、ロジックでは言語化しきれない「感覚的な心地よさ」を追求するのが好きなようです。指示されて動くよりも、自分のセンスで自由に任された時に最も輝きます。作業に没頭しすぎて周りが見えなくなることもあるため、たまにはチャットで一言「今こんな感じです」と報告する癖をつけると、チームとの連携がさらに深まります。",
        imgSrc: "images/placeholder_idef.png"
    }
};

// --- 状態管理 ---
let appState = {
    currentQuestionIndex: 0,
    scores: {
        O: 0, I: 0,
        V: 0, D: 0,
        L: 0, E: 0,
        P: 0, F: 0
    } // 合計を集計するオブジェクト
};

// --- DOM要素の取得 ---
document.addEventListener('DOMContentLoaded', () => {
    // 画面類
    const elmTopScreen = document.getElementById('top-screen');
    const elmQuizScreen = document.getElementById('quiz-screen');
    const elmResultScreen = document.getElementById('result-screen');

    // ボタン類
    const btnStart = document.getElementById('start-btn');
    const btnBack = document.getElementById('back-btn');
    const btnRestart = document.getElementById('restart-btn');
    const btnShare = document.getElementById('share-btn');
    const btnLoadSaved = document.getElementById('load-saved-btn');

    // 診断画面用
    const elmProgressFill = document.getElementById('progress-fill');
    const elmCurrentQNum = document.getElementById('current-q-num');
    const elmQLabelNum = document.getElementById('q-label-num');
    const elmQuestionText = document.getElementById('question-text');
    const elmChoicesContainer = document.getElementById('choices-container');

    // 結果画面用
    const elmResultTypeJa = document.getElementById('result-type-ja');
    const elmResultDesc = document.getElementById('result-desc');
    const elmResultStrengths = document.getElementById('result-strengths');
    const elmResultRole = document.getElementById('result-role');
    const elmResultDeepDive = document.getElementById('result-deep-dive');

    // ====== 変数定義・初期化 ======
    const STORAGE_KEY = 'teamColorDiagnosisResult';

    // URLパラメータのチェック (機能5: 結果の直リンク共有)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedType = urlParams.get('type');

    // 共有されたタイプが有効なら直で結果画面へ
    if (sharedType && resultData[sharedType]) {
        renderResult(sharedType);
    } else {
        // パラメータがない/不正な場合は通常通りトップ画面の準備
        // 保存された結果があるかチェック
        const savedType = localStorage.getItem(STORAGE_KEY);
        if (savedType && resultData[savedType]) {
            btnLoadSaved.classList.remove('hidden');
        }
    }

    // 過去の結果を見る
    btnLoadSaved.addEventListener('click', () => {
        renderResult(savedType);
    });

    // スタート
    btnStart.addEventListener('click', startQuiz);

    // 戻る
    btnBack.addEventListener('click', () => {
        if (appState.currentQuestionIndex > 0) {
            appState.currentQuestionIndex--;
            appState.history.pop();
            renderQuestion();
        }
    });

    // もう一度診断する
    btnRestart.addEventListener('click', () => {
        // パラメータ除去のためURLをきれいにする（再読み込みなしで）
        const baseUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, baseUrl);

        showScreen(elmTopScreen);
        window.scrollTo(0, 0);

        // トップに戻った時に保存結果があればボタンを表示する
        const currentSaved = localStorage.getItem(STORAGE_KEY);
        if (currentSaved && resultData[currentSaved]) {
            btnLoadSaved.classList.remove('hidden');
        }
    });

    // シェア機能
    btnShare.addEventListener('click', async () => {
        const typeJa = elmResultTypeJa.textContent;
        const typeKey = document.getElementById('result-type-mbti').textContent;
        const text = `私のチームポジションは「${typeJa} (${typeKey})」でした！\nあなたも診断してみよう！\n#チームカラー診断`;

        // パラメータを付与したURLを作成（シェア用）
        const baseUrl = window.location.href.split('?')[0].split('#')[0];
        const shareUrl = `${baseUrl}?type=${typeKey}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'チームカラー診断',
                    text: text,
                    url: shareUrl
                });
            } catch (err) {
                console.log('シェアキャンセルまたはエラー:', err);
            }
        } else {
            // Web Share API非対応の場合はクリップボードへコピー
            try {
                await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
                alert('結果をクリップボードにコピーしました！SNSでシェアしてね！');
            } catch (err) {
                alert('URLのコピーに失敗しました。');
            }
        }
    });

    // ====== 第6フェーズ：全タイプ一覧機能 ======
    const elmTypesListScreen = document.getElementById('types-list-screen');
    const btnViewTypeTop = document.getElementById('view-all-types-top-btn');
    const btnViewTypeResult = document.getElementById('view-all-types-result-btn');
    const btnBackToTop = document.getElementById('back-to-top-btn');
    const elmAllTypesContainer = document.getElementById('all-types-container');

    // 一覧画面を開く
    function openAllTypesScreen() {
        renderAllTypesList();
        showScreen(elmTypesListScreen);
        window.scrollTo(0, 0);
    }

    if (btnViewTypeTop) btnViewTypeTop.addEventListener('click', openAllTypesScreen);
    if (btnViewTypeResult) btnViewTypeResult.addEventListener('click', openAllTypesScreen);

    // トップへ戻る
    if (btnBackToTop) btnBackToTop.addEventListener('click', () => {
        // パラメータ除去のためURLをきれいにする（再読み込みなしで）
        const baseUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, baseUrl);

        showScreen(elmTopScreen);
        window.scrollTo(0, 0);
        const currentSaved = localStorage.getItem(STORAGE_KEY);
        if (currentSaved && resultData[currentSaved]) {
            btnLoadSaved.classList.remove('hidden');
        }
    });

    // 一覧のレンダリング
    function renderAllTypesList() {
        if (elmAllTypesContainer.children.length > 0) return; // 既に生成済ならスキップ

        let html = '';
        Object.keys(resultData).forEach(key => {
            const data = resultData[key];
            // 画像がない場合はダミーの色付きブロックを表示するフォールバック
            const imageHtml = data.imgSrc ? `<img src="${data.imgSrc}" alt="${data.ja}のイメージ" class="list-type-image" onerror="this.style.display='none'">` : '';

            html += `
                <div class="result-card glass type-card-mini">
                    <div class="list-card-header">
                        ${imageHtml}
                        <div class="list-card-title-area">
                            <div class="mbti-type-badge list-badge">${key}</div>
                            <h3 class="card-title list-title">${data.ja}</h3>
                        </div>
                    </div>
                    <p class="list-desc">${data.desc}</p>
                    <p class="list-strength"><strong>強み:</strong> ${data.strengths}</p>
                </div>
            `;
        });
        elmAllTypesContainer.innerHTML = html;
    }

    // ====== コア機能の実装 ======

    // 画面遷移関数
    function showScreen(screenElm) {
        elmTopScreen.classList.remove('active');
        elmQuizScreen.classList.remove('active');
        elmResultScreen.classList.remove('active');
        if (elmTypesListScreen) elmTypesListScreen.classList.remove('active');

        elmTopScreen.classList.add('hidden');
        elmQuizScreen.classList.add('hidden');
        elmResultScreen.classList.add('hidden');
        if (elmTypesListScreen) elmTypesListScreen.classList.add('hidden');

        screenElm.classList.remove('hidden');
        // 少し遅らせてactiveを付与し、Display:flex適用後のアニメーション発火を促す
        setTimeout(() => {
            screenElm.classList.add('active');
        }, 10);
    }

    // 診断スタート
    function startQuiz() {
        appState.currentQuestionIndex = 0;
        appState.history = [];
        renderQuestion();
        showScreen(elmQuizScreen);
    }

    // 質問の描画
    function renderQuestion() {
        const qIndex = appState.currentQuestionIndex;
        const q = questions[qIndex];

        // プログレスバー更新
        const progressPercentage = (qIndex / questions.length) * 100;
        elmProgressFill.style.width = `${progressPercentage}%`;

        // テキスト更新
        elmCurrentQNum.textContent = qIndex + 1;
        elmQLabelNum.textContent = qIndex + 1;

        // 質問のフェードアニメーション用
        elmQuestionText.style.opacity = 0;
        setTimeout(() => {
            elmQuestionText.textContent = q.text;
            elmQuestionText.style.opacity = 1;
            elmQuestionText.style.transition = "opacity 0.3s ease-in";
        }, 150);

        // 戻るボタンの表示制御
        if (qIndex === 0) {
            btnBack.classList.add('hidden');
        } else {
            btnBack.classList.remove('hidden');
        }

        // 選択肢の生成 (5段階: Strongly Agree, Agree, Neutral, Disagree, Strongly Disagree)
        elmChoicesContainer.innerHTML = '';

        // 5段階の定義: [ラベル, スコア倍率, クラス名]
        const choiceOptions = [
            { label: 'とても当てはまる', value: 2, colorClass: 'btn-color-agree-strong' },
            { label: 'やや当てはまる', value: 1, colorClass: 'btn-color-agree' },
            { label: 'どちらとも言えない', value: 0, colorClass: 'btn-color-neutral' },
            { label: 'あまり当てはまらない', value: -1, colorClass: 'btn-color-disagree' },
            { label: '全く当てはまらない', value: -2, colorClass: 'btn-color-disagree-strong' }
        ];

        choiceOptions.forEach((opt) => {
            const btn = document.createElement('button');
            btn.className = `choice-btn ${opt.colorClass}`;
            btn.textContent = opt.label; // Changed from title to textContent
            // 選択時のイベント
            btn.addEventListener('click', () => handleChoice(q.axis, q.direction, opt.value, btn));
            elmChoicesContainer.appendChild(btn);
        });
    }

    // 選択肢クリック時の処理
    function handleChoice(axis, direction, value, btnElement) {
        // ボタンに選択エフェクトを付与
        btnElement.classList.add('selected');

        // 履歴に保存（戻るボタン用）
        appState.history.push({
            axis: axis,
            direction: direction,
            value: value
        });

        // スコア加算
        // directionが1なら Agree(2) のときその軸の左側(O,V,L,P)に+2
        // directionが-1なら Agree(2) のときその軸の右側(I,D,E,F)に+2となるよう内部計算する
        // ※実際には軸のスコア（+なら左側、-なら右側）として合算し、最後に判定します。

        // 少し待機してアニメーションを見せてから次へ
        setTimeout(() => {
            appState.currentQuestionIndex++;
            if (appState.currentQuestionIndex < questions.length) {
                renderQuestion();
            } else {
                calculateResult();
            }
        }, 250);
    }

    // 結果の計算と独自4文字の判定ロジック
    function calculateResult() {
        // プログレス100%にする
        elmProgressFill.style.width = '100%';

        // 軸ごとのスコアをリセット
        let axisScores = {
            OI: 0,
            VD: 0,
            LE: 0,
            PF: 0
        };

        // 履歴から加算
        // valueは Strongly Agreeが2、Strongly Disagreeが-2
        appState.history.forEach(ans => {
            // direction * value がプラスなら左側(O,V,L,P)、マイナスなら右側(I,D,E,F)
            axisScores[ans.axis] += (ans.direction * ans.value);
        });

        // 4文字の生成
        let type1 = axisScores.OI >= 0 ? 'O' : 'I';
        let type2 = axisScores.VD >= 0 ? 'V' : 'D';
        let type3 = axisScores.LE >= 0 ? 'L' : 'E';
        let type4 = axisScores.PF >= 0 ? 'P' : 'F';

        let finalType = `${type1}${type2}${type3}${type4}`;

        console.log("軸スコア:", axisScores);
        console.log("最終判定:", finalType);

        // LocalStorageに結果を保存
        try {
            localStorage.setItem(STORAGE_KEY, finalType);
        } catch (e) {
            console.error('LocalStorageへの保存に失敗しました:', e);
        }

        // 結果描画へ
        renderResult(finalType);
    }

    function renderResult(typeKey) {
        // 結果データがない場合のフォールバック
        const data = resultData[typeKey] || {
            ja: "未知なる開拓者",
            desc: "独自の才能を持つあなた。チームに新しい風を吹き込みます。",
            role: "オールラウンダーとしての活躍",
            deepDive: "あなたは既存の枠組みに囚われない独自のアプローチができる人です。新しいアイデアで現場に刺激を与えましょう。",
            imgSrc: "images/placeholder_default.png"
        };

        // MBTIバッジに置き換えたので表示を連携する
        const mbtiBadge = document.getElementById('result-type-mbti');
        if (mbtiBadge) mbtiBadge.textContent = typeKey;

        // 画像の更新（DOM要素が存在する場合）
        const elmResultImage = document.getElementById('result-type-image');
        if (elmResultImage) {
            elmResultImage.src = data.imgSrc || "images/placeholder_default.png";
            elmResultImage.onerror = () => { elmResultImage.style.display = 'none'; }; // 画像がない場合は非表示
            elmResultImage.style.display = 'block';
        }

        elmResultTypeJa.textContent = data.ja;
        elmResultDesc.textContent = data.desc;
        elmResultRole.textContent = data.role;

        if (elmResultDeepDive) {
            elmResultDeepDive.textContent = data.deepDive;
        }

        // 結果画面を表示
        setTimeout(() => {
            showScreen(elmResultScreen);
            window.scrollTo(0, 0); // 画面一番上へ
        }, 300); // 最後の選択が終わったあとの余韻（プログレスバー到達を見せるため）
    }

});
