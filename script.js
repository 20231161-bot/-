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
    { id: 1, axis: AXES.OI, direction: 1, text: "チームでは自分からどんどん発言して、話し合いを引っ張る方だ。" },
    { id: 2, axis: AXES.VD, direction: -1, text: "アイデアを考えるより、まずは具体的なルールや手順を決めておきたい。" },
    { id: 3, axis: AXES.LE, direction: -1, text: "活動のスピードより、みんなが楽しく参加できているかを大切にする。" },
    { id: 4, axis: AXES.PF, direction: 1, text: "ギリギリになるのが嫌なので、早めに計画を立ててその通りに進めたい。" },
    { id: 5, axis: AXES.OI, direction: -1, text: "大人数でにぎやかに進めるより、少人数や一人で集中して作業する方が向いている。" },
    { id: 6, axis: AXES.VD, direction: 1, text: "できるかどうかよりも、「これ、めっちゃ面白そう！」という直感で進めたい。" },
    { id: 7, axis: AXES.LE, direction: 1, text: "意見がぶつかった時は、お互いの気持ちよりも「どちらが正しいか」を考えて決めるべきだ。" },
    { id: 8, axis: AXES.PF, direction: -1, text: "最初からガチガチに計画を立てるより、やりながらその場その場で変えていきたい。" },
    { id: 9, axis: AXES.OI, direction: 1, text: "できた作品は、たくさんの人に見てもらって感想を聞きたい。" },
    { id: 10, axis: AXES.VD, direction: -1, text: "地道な確認作業や細かい調整など、みんながやりたがらない作業も苦にならない。" },
    { id: 11, axis: AXES.LE, direction: -1, text: "改善点を指摘するよりも、まずは良かったところをほめる方が大事だと思う。" },
    { id: 12, axis: AXES.PF, direction: 1, text: "誰が何をするかや、やることリストは、しっかり決めておかないと気が済まない。" },

    // --- ここから追加の10問 ---
    { id: 13, axis: AXES.OI, direction: -1, text: "話し合いでは自分から提案するより、みんなの意見をまとめる役の方が向いている。" },
    { id: 14, axis: AXES.VD, direction: 1, text: "他のやり方を参考にするより、誰もやったことのない新しい企画を一から考えたい。" },
    { id: 15, axis: AXES.LE, direction: 1, text: "誰がどの役割を担うかは、それぞれの得意なことや経験を見て、はっきり決めるべきだ。" },
    { id: 16, axis: AXES.PF, direction: -1, text: "進めている途中で「やっぱりこっちの方が面白い！」と思ったら、最初の予定を変えてもいい。" },
    { id: 17, axis: AXES.OI, direction: 1, text: "進捗をこまめにSNSで伝えたり、周りの人を巻き込んで盛り上げることが好きだ。" },
    { id: 18, axis: AXES.VD, direction: -1, text: "大きなビジョンより、まず目に見える形で小さなことから一つひとつ完成させたい。" },
    { id: 19, axis: AXES.LE, direction: -1, text: "一人でも納得していないメンバーがいれば、時間がかかっても話し合いを続けたい。" },
    { id: 20, axis: AXES.PF, direction: 1, text: "完成していない部分があっても、まずは全体の流れが分かる「仮の形」を期限内に見せることを優先する。" },
    { id: 21, axis: AXES.OI, direction: -1, text: "グループチャットや資料の整理など、裏側で支える役割の方が気が楽だ。" },
    { id: 22, axis: AXES.VD, direction: 1, text: "細かい修正より、ロゴやポスターなど、見た目のカッコよさや雰囲気にこだわりたい。" },
    { id: 23, axis: AXES.LE, direction: -1, text: "完成度より、みんなが「楽しかった！」と感じられる過程を大切にしたい。" },
    { id: 24, axis: AXES.PF, direction: 1, text: "締め切り直前に頑張るより、最初から逆算して毎日少しずつ進める方が好きだ。" },
    { id: 25, axis: AXES.VD, direction: -1, text: "大きな設定やストーリーを一から作るより、今あるものをもっと良くする方が得意だ。" },
    { id: 26, axis: AXES.LE, direction: 1, text: "「なぜこうするのか」を、なんとなくではなくデータや理由できちんと教えてほしい。" },
    { id: 27, axis: AXES.OI, direction: -1, text: "みんなの中心に立つより、自分の担当を静かにやりきっている時間の方が好きだ。" },
    { id: 28, axis: AXES.PF, direction: -1, text: "細かくスケジュールを決めすぎると窮屈で、アイデアが浮かびにくくなる。" },
    { id: 29, axis: AXES.LE, direction: -1, text: "意見がぶつかった時は、どちらかを押し通すより、お互いが納得できる落とし所を探したい。" },
    { id: 30, axis: AXES.OI, direction: 1, text: "自分が面白いと思ったことは、すぐに誰かに話して反応を見たくなってしまう。" }
];

// 代表的な16パターンの簡易結果データ
// （※本来は16タイプ全て記述しますが、今回はサンプルのため一部を主要に設定します）
const resultData = {
    "OVLP": {
        ja: "頼れるリーダータイプ",
        desc: "チームをひとつにまとめて、計画通りに物事を進めることが得意なタイプ。",
        role: "スケジュールの管理、ルール決め",
        deepDive: "目標に向かってチームを引っ張る役割を自然と任されることが多いようです。全体の流れと細かいやることを両方見て、無駄のない計画を作るのが得意です。予定がずれた時に、周りの人の気持ちに寄り添うようにすると、もっと信頼されるリーダーになれるでしょう。",
        imgSrc: "images/lion_ovlp.png"
    },
    "OVLF": {
        ja: "ひらめきリーダータイプ",
        desc: "面白いアイデアを出して、みんなを引っ張ることにワクワクするタイプ。",
        role: "活動の方向性を決める、大事な決断をする",
        deepDive: "常に「もっと面白くできるはず！」と高い目標を追いかける情熱があります。予想外のことが起きても、その場でやり方を変えられる柔軟さを持っています。アイデアが多すぎてまとまらなくなることがあるので、たまに「今回はここまで」とみんなで決めるようにすると、活動がスムーズに進みます。",
        imgSrc: "images/eagle_ovlf.png"
    },
    "OVEP": {
        ja: "みんなの支え役タイプ",
        desc: "チームのみんなが仲良く、楽しく活動できるようにサポートするのが大好きなタイプ。",
        role: "話し合いの仲立ち、進み具合の確認",
        deepDive: "みんなの良いところを見つけて、チームを盛り上げるのが得意です。誰かが困っているとすぐに気づいて、優しく助けてあげられます。みんなの意見を大切にしすぎて決めるのが遅くなることがあるので、迷ったときは「一番大事な目的は何か」を思い出してみると良さそうです。",
        imgSrc: "images/dog_ovep.png"
    },
    "OVEF": {
        ja: "熱いクリエイタータイプ",
        desc: "自分のやる気をみんなに伝えて、理想の形に向かって突き進むタイプ。",
        role: "目標をみんなに伝える、やる気を引き出す",
        deepDive: "あなたのやる気が、チームを動かす一番のエネルギーになります。「あんなことがしたい！」という話でみんなをワクワクさせる力があります。やる気にムラが出やすいこともあるので、地道な作業は得意な仲間に頼ってみると、さらに良い結果が出せるでしょう。",
        imgSrc: "images/monkey_ovef.png"
    },
    "ODLP": {
        ja: "きっちり分析タイプ",
        desc: "丁寧で正確な作業が得意で、ルールの間違いを見つけてチームを支えるタイプ。",
        role: "ルールや手順を整える、細かい確認作業",
        deepDive: "現実的な考え方で、アイデアを「どうすれば形にできるか」を考える力がすごいです。チームが夢を見すぎた時に、現実的な問題を教えてくれる大切な役割を担うことが多いです。正しいことをはっきり言いすぎることがあるので、言い方を少し優しくすると、もっとみんなに伝わるようになります。",
        imgSrc: "images/owl_odlp.png"
    },
    "ODLF": {
        ja: "スピード実行タイプ",
        desc: "細かい計画よりも「まずはやってみる！」ことが大好きなタイプ。",
        role: "さっと試作を作る、その場でのやり直し対応",
        deepDive: "話し合いを長くするより「とりあえず作ってから考えよう」と、すぐに動ける行動派です。その場で問題が起きても、サッと切り替えられる力を持っています。ただ、思いつきで大事なところを後から変えてしまうことがあるので、事前に「ここだけは変えない」という約束をしておくと安心です。",
        imgSrc: "images/beaver_odlf.png"
    },
    "ODEP": {
        ja: "場の盛り上げ役タイプ",
        desc: "活動を全力で楽しみ、チームを明るく元気にすることを大切にするタイプ。",
        role: "アイデア出し、みんなで楽しむ雰囲気作り",
        deepDive: "その場の空気を明るくして、みんなでアイデアを出す時間を盛り上げるのが得意です。参加する人の立場になって「ここが楽しい！」と素直に伝えられる考えを持っています。計画通りに進めるのが少し苦手なこともあるので、計画を立てるのが得意な友達と組むと、さらに良くなります。",
        imgSrc: "images/placeholder_odep.png"
    },
    "ODEF": {
        ja: "ワクワク発想タイプ",
        desc: "今までにないアイデアで、人を引きつけるものを作ることに夢中になるタイプ。",
        role: "テーマ決め、みんなが驚く演出を考える",
        deepDive: "細かいところにこだわりながら、人の心を動かすような面白いアイデアを次々と生み出します。自分の考えを大事にするので、やる気がある時のパワーはすごいです。作業量に波が出やすいので、集中できる環境を作ったり、締め切りを誰かに教えてもらうようにすると、もっと才能を発揮できます。",
        imgSrc: "images/placeholder_odef.png"
    },
    "IVLP": {
        ja: "ひとりで考える戦略家タイプ",
        desc: "自分だけのアイデアを持ち、効率のよい仕組みを作ることに喜びを感じるタイプ。",
        role: "ルールや仕組みを考える、難しい問題を解く",
        deepDive: "チームの中で一番複雑なルールや仕組みを、一人で黙々と考えるのが好きなようです。後から崩れにくい、しっかりした計画を作るのが得意です。自分の頭の中で考えが完結しやすいので、たまにはチームのみんなに「こんなことを考えているよ」と話してみると、もっと頼りにされるようになります。",
        imgSrc: "images/placeholder_ivlp.png"
    },
    "IVLF": {
        ja: "ひらめき発明家タイプ",
        desc: "知りたい気持ちが強く、新しいルールや仕組みに挑戦していくのが好きなタイプ。",
        role: "アイデア出し、面白い仕組みを実現する",
        deepDive: "誰も思いつかないようなユニークなルールや仕掛けを頭の中で組み立てることにワクワクするタイプです。「面白そうならとりあえずやってみる」という勢いを持っています。ただ、計画を広げすぎて実現が難しくなることもあるので、仲間と一緒に「今回はどこまで作るか」を相談すると、形になりやすくなります。",
        imgSrc: "images/placeholder_ivlf.png"
    },
    "IVEP": {
        ja: "理想を追うデザイナータイプ",
        desc: "深く考える力を持ち、参加する人の気持ちを動かすような作品や体験を目指すタイプ。",
        role: "世界観や雰囲気づくり、ストーリーを考える",
        deepDive: "静かに、でも熱いこだわりを持って、作品の雰囲気や質を高めていくクリエイターです。他の人がどう感じるかを深く想像しながら作ることができます。完璧を目指すあまり、締め切りギリギリまで悩んでしまうこともあるため、「今回はここで完成！」という線をあらかじめ決めておきましょう。",
        imgSrc: "images/placeholder_ivep.png"
    },
    "IVEF": {
        ja: "共感のストーリーテラータイプ",
        desc: "自分だけの感覚を持ち、参加する人の気持ちにそっと寄り添うような体験作りを好むタイプ。",
        role: "セリフや流れを考える、演出の細かい調整",
        deepDive: "前に出てチームを引っ張るより、細かい言葉選びや雰囲気の作り込みで全体の質を上げるのが得意です。意見がぶつかった時は、争いを避けて自分の考えを引っ込めてしまうことが多いかもしれません。あなたの感覚はチームにとって大切なので、ぜひ勇気を出して自分のアイデアを伝えてみてください。",
        imgSrc: "images/placeholder_ivef.png"
    },
    "IDLP": {
        ja: "きっちり計画タイプ",
        desc: "複雑な問題を整理するのが好きで、効率的な仕組みを作ることに楽しさを感じるタイプ。",
        role: "ルールの整理、仕組みを整える、資料管理",
        deepDive: "データをもとに細かい調整をしたり、道具や環境を整えるなど、裏方の管理で大きな力を発揮します。ルールや流れがはっきりしている環境を好みます。手順を整理したり、みんなが使う資料を作るのが得意なので、チームの作業をスムーズにする役割を任されると活躍できるでしょう。",
        imgSrc: "images/placeholder_idlp.png"
    },
    "IDLF": {
        ja: "マイペース職人タイプ",
        desc: "興味を持ったことに対して、すごい集中力を持ってとことん突き詰めるタイプ。",
        role: "自分の得意なことを深める、特定の役割を担当する",
        deepDive: "「自分の担当すること」に深くこだわり、妥協なく仕上げる職人的な一面があります。急なトラブルにも落ち着いて対応できる安心感を持っています。全体の話し合いにはあまり興味が向かないこともあるので、「ここはこうした方がいい！」と思ったことがあれば、自分から声に出してみるとチームの助けになります。",
        imgSrc: "images/placeholder_idlf.png"
    },
    "IDEP": {
        ja: "縁の下のサポータータイプ",
        desc: "困っている人をずっと気にかけ、地道な作業でチームを支えることに喜びを感じるタイプ。",
        role: "やることのフォロー、資料や道具の整理",
        deepDive: "みんながやりたがらないような地道な作業を、丁寧に正確にこなしてくれる頼れる存在です。仲間の負担を減らすことに喜びを感じる優しさがあります。気を使いすぎ て「手伝って」と言いにくい面があるため、自分ひとりで抱え込みすぎる前に相談する練習をしてみると気が楽になります。",
        imgSrc: "images/placeholder_idep.png"
    },
    "IDEF": {
        ja: "感覚アーティストタイプ",
        desc: "見た目や雰囲気など、感覚で感じるものにこだわりを持って表現するタイプ。",
        role: "デザイン、絵、見た目の雰囲気づくり",
        deepDive: "色使いやデザイン、全体の雰囲気など、言葉では説明しにくい「感覚的な心地よさ」を追いかけるのが好きなようです。自分のセンスで自由に任されたときに一番輝きます。作業に集中しすぎて周りが見えなくなることもあるため、たまには自分から「今こんな感じだよ」と報告する習慣をつけると、みんなとの連携がもっと良くなります。",
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
                            <h3 class="card-title list-title">${data.ja}</h3>
                        </div>
                    </div>
                    <p class="list-desc">${data.desc}</p>
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
