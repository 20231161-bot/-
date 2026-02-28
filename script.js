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
    { id: 20, axis: AXES.PF, direction: 1, text: "未完成の部分があっても、まずは全体が動く「モックアップ（試作品）」を期限内に提出することが最優先だ。" }, // Agree=Planning(+) (※解釈によってはFlexibleにもなるが、今回は「期限内提出・計画通り」を重視のPとする)
    { id: 21, axis: AXES.OI, direction: -1, text: "オンラインでのテキストチャットや、ドキュメントの整理など、後方支援的なコミュニケーションの方が気楽だ。" }, // Agree=Input(+)
    { id: 22, axis: AXES.VD, direction: 1, text: "細かいバグ修正よりも、タイトルロゴやメインビジュアルなど、作品の「顔」の美しさにこだわりたい。" }  // Agree=Vision(+)
];

// 代表的な16パターンの簡易結果データ
// （※本来は16タイプ全て記述しますが、今回はサンプルのため一部を主要に設定します）
const resultData = {
    "OVLP": {
        ja: "司令塔ディレクター",
        desc: "チームを統率し、計画通りにプロジェクトを進める頼れるリーダー。",
        strengths: "計画性・論理・責任感",
        role: "全体のスケジュール管理、ルール構築",
        deepDive: "あなたは目標達成に向けてチームを牽引する力に長けています。全体像と詳細なタスクの両方を把握し、無駄のないスケジューリングで確実なプロトタイプを作り上げます。時に厳格になりすぎることがあるため、メンバーの感情にも気を配るとさらに結束力が強まるでしょう。",
        imgSrc: "images/lion_ovlp.png"
    },
    "OVLF": {
        ja: "カリスマビジョナリー",
        desc: "高い目標を掲げ、チームを論理的に引っ張る野心的なプランナー。",
        strengths: "決断力・戦略的思考",
        role: "プロジェクトの方向性決定、大胆な決断",
        deepDive: "常に「もっと面白くできるはず」と高いビジョンを掲げる野心家です。想定外のトラブルが起きても、臨機応変に計画を修正し、論理的な解決策を見つけ出す突破力があります。アイデアが多すぎて発散しがちなので、定期的に仕様を固定するタイミングを作ることが重要です。",
        imgSrc: "images/eagle_ovlf.png"
    },
    "OVEP": {
        ja: "みんなのお世話役",
        desc: "チームの調和を重んじ、全員が気持ちよく作業できるようサポートする。",
        strengths: "共感・協調性・配慮",
        role: "コミュニケーションの橋渡し、進捗のフォロー",
        deepDive: "メンバーの長所を引き出し、チーム全体の士気を高めるのが得意です。誰かがタスクで躓いていればすぐに気付き、タスクの再分配やメンタルケアを行います。しかし、全員の意見を聞き入れようとして決断が遅れることがあるため、時には「NO」と言う勇気も必要です。",
        imgSrc: "images/dog_ovep.png"
    },
    "OVEF": {
        ja: "熱血クリエイター",
        desc: "メンバーのモチベーションを高めながら、理想の作品へ導く。",
        strengths: "リーダーシップ・熱意",
        role: "ビジョンの共有、チームの士気向上",
        deepDive: "あなたの熱量がチーム推進の最大のエネルギーです。「こんなゲームを作りたい！」という情熱的なプレゼンで周りの心を動かします。一方で、モチベーションに波があるため、地道な作業（デバッグなど）は得意なメンバーにうまく割り振るのがチーム成功の鍵となります。",
        imgSrc: "images/monkey_ovef.png"
    },
    "ODLP": {
        ja: "ロジカルアナライザー",
        desc: "誰よりも正確で緻密な作業を行い、仕様やルールの穴をなくす。",
        strengths: "正確性・責任感",
        role: "バグチェック、仕様詳細の設計",
        deepDive: "現実的な視点と論理性で、チームの「守り」を固める要の存在です。抽象的なアイデアを「どうすればゲームの仕様に落とし込めるか」へと翻訳する能力に長けています。チームが夢見がちになった時に、リソースやスケジュールの現実を突きつける重要なストッパー役です。",
        imgSrc: "images/owl_odlp.png"
    },
    "ODLF": {
        ja: "スピーディービルダー",
        desc: "細かい計画よりも「まずは作ってみる」精神で、素早くプロトタイプを形にする。",
        strengths: "行動力・適応力",
        role: "プロトタイプ制作、即興の修正",
        deepDive: "議論を長引かせるよりも「とりあえず動くものを作ってから考えよう」という実践派です。技術的なトラブルにも現場でサッと対応できる柔軟性があります。ただし、思いつきでコア設計を後から変えてしまうことがあるため、事前に「ここだけは変えない」という確認をしておきましょう。",
        imgSrc: "images/beaver_odlf.png"
    },
    "ODEP": {
        ja: "チームのムードメーカー",
        desc: "制作プロセスを全力で楽しみ、チームに明るい活気をもたらす。",
        strengths: "ポジティブ・柔軟性",
        role: "テストプレイ時の盛り上げ、アイデア出し",
        deepDive: "場の空気を明るくし、テストプレイやブレインストーミングの場で最も輝くタイプです。プレイヤー目線に立って「ここが楽しい！」を素直に共有できます。計画を守るのが少し苦手な一面があるため、進捗管理をしてくれる「P（計画）」タイプの相棒を見つけると大活躍します。",
        imgSrc: "images/placeholder_odep.png"
    },
    "ODEF": {
        ja: "ワクワククリエイター",
        desc: "常識にとらわれないアイデアで、人を惹きつけるコンテンツを作る。",
        strengths: "想像力・情熱",
        role: "コンセプトアート、キャラクター設定",
        deepDive: "細部にこだわりながらも、感情を揺さぶるエモい演出やユニークなアイデアを次々と生み出します。感性の赴くままに作業するため、ノッている時の爆発力は桁違いですが、作業量に偏りが出やすいです。期限管理ツールを併用することで、クリエイティビティを最大限発揮できます。",
        imgSrc: "images/placeholder_odef.png"
    },
    "IVLP": {
        ja: "孤高のストラテジスト",
        desc: "独創的で高度なアイデアを持ち、効率的にシステムを作り上げる。",
        strengths: "分析力・独立心",
        role: "コアシステムの実装、難解な課題の解決",
        deepDive: "チーム内で最も複雑なシステム構造やアルゴリズムの設計を一人で黙々と組み上げる職人です。長期的な視野でバグの出にくいきれいなコード・設計を好みます。自己完結しやすいため、たまには進捗や考えていることをチームに「翻訳」して共有すると、手戻りを防げます。",
        imgSrc: "images/placeholder_ivlp.png"
    },
    "IVLF": {
        ja: "ひらめき発明家",
        desc: "面白いアイデアを次々と思いつき、新しいシステムや仕様に挑戦する。",
        strengths: "知的好奇心・発想力",
        role: "ブレストでの提案、革新的な機能の実装",
        deepDive: "誰も思いつかないような斬新なゲームシステムやギミックを頭の中で組み立てるのを楽しむタイプです。「面白そうならとりあえず取り入れる」柔軟さがありますが、実現不可能なレベルまで風呂敷を広げがち。他メンバーと協力して、実装可能なサイズに切り詰める作業が必要です。",
        imgSrc: "images/placeholder_ivlf.png"
    },
    "IVEP": {
        ja: "理想主義デザイナー",
        desc: "深い洞察力を持ち、プレイヤーの感情を揺さぶる美しい作品を目指す。",
        strengths: "洞察力・独創性",
        role: "世界観の構築、ストーリーテリング",
        deepDive: "静かに、しかし熱いこだわりを持って作品の世界観やストーリーを磨き上げるクリエイター。プレイヤーがどう感じるかを深く想像しながら作ることができます。完璧主義に陥りやすく、納期ギリギリまで悩んでしまう傾向があるため、「妥協点」をあらかじめ決めておきましょう。",
        imgSrc: "images/placeholder_ivep.png"
    },
    "IVEF": {
        ja: "共感のストーリーテラー",
        desc: "独自の感性を持ち、プレイヤーの感情に寄り添う温かい作品作りに貢献する。",
        strengths: "共感・想像力",
        role: "シナリオ執筆、演出の調整",
        deepDive: "表立ってチームを引っ張ることは少ないですが、キャラクターのセリフや細やかな演出で作品のクオリティを一段引き上げる感性の持ち主です。意見が対立した時は、争いを避けて自分の意見を飲み込みがちです。あなたの感性はチームの宝なので、勇気を出してアイデアを伝えてください。",
        imgSrc: "images/placeholder_ivef.png"
    },
    "IDLP": {
        ja: "ロジック探求者",
        desc: "複雑な問題解決を好み、美しいコードや効率的な仕組みを愛する。",
        strengths: "論理・探求心",
        role: "アルゴリズム設計、データ処理",
        deepDive: "現実のデータを元に、ゲームバランスの緻密な調整を行ったり、ツールキットの整備など裏方のアセット管理で圧倒的な力を発揮します。ルールや仕様書がしっかりしている環境を好みます。マニュアル化が得意なので、チームの開発手法を標準化する役割としても適任です。",
        imgSrc: "images/placeholder_idlp.png"
    },
    "IDLF": {
        ja: "マイペースな職人",
        desc: "自分が興味を持った技術や作業に対して、とてつもない集中力を発揮する。",
        strengths: "技術力・冷静さ",
        role: "専門的な実装、ツールの最適化",
        deepDive: "特定のプログラミング言語、アニメーション制作、3Dモデリングなど「自分の担当領域」に深く潜り込み、妥協のないクオリティで仕上げる職人肌です。緊急時のトラブルシューティングも冷静に対処できます。全体会議には興味を示さないことが多いので、意図的に意見を求められる環境が必要です。",
        imgSrc: "images/placeholder_idlf.png"
    },
    "IDEP": {
        ja: "縁の下のサポーター",
        desc: "目立たないがチームに不可欠。困っている人を優しく助け、地道な作業をこなす。",
        strengths: "献身・丁寧・信頼感",
        role: "タスクのフォロー、アセットの整理",
        deepDive: "画像集め、当たり判定の細かな調整、データ入力など、誰もやりたがらない地味な作業を正確かつ丁寧にこなしてくれる最高のサポーターです。メンバーの負担を減らすことに喜びを感じます。気遣い屋さんで自分から不満を言わないため、周囲が定期的に負担を確認することが大切です。",
        imgSrc: "images/placeholder_idep.png"
    },
    "IDEF": {
        ja: "感性アーティスト",
        desc: "美しいビジュアルや心地よいサウンドなど、感覚的な要素にこだわる。",
        strengths: "美意識・柔軟性",
        role: "グラフィック制作、UIデザインの調整",
        deepDive: "画面の色使いやエフェクト、UIの手触りなど、ロジックでは表現しきれない「ゲームの手触り」を向上させる天才です。指示されて動くよりも、自分のセンスで自由に任された時に最も輝きます。クリエイティブな作業に没頭しすぎて進捗報告を忘れがちなので、チャットで一言報告する癖をつけましょう。",
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
        const mbtiOptions = [
            { label: 'Strongly Agree', value: 2, sizeClass: 'mbti-btn-size-2' },
            { label: 'Agree', value: 1, sizeClass: 'mbti-btn-size-1' },
            { label: 'Neutral', value: 0, sizeClass: 'mbti-btn-size-0' },
            { label: 'Disagree', value: -1, sizeClass: 'mbti-btn-size--1' },
            { label: 'Strongly Disagree', value: -2, sizeClass: 'mbti-btn-size--2' }
        ];

        mbtiOptions.forEach((opt) => {
            const btn = document.createElement('button');
            btn.className = `mbti-btn ${opt.sizeClass}`;
            btn.title = opt.label;
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

    // 結果画面の描画
    function renderResult(typeKey) {
        // 結果データがない場合のフォールバック
        const data = resultData[typeKey] || {
            ja: "未知なる開拓者",
            desc: "独自の才能を持つあなた。チームに新しい風を吹き込みます。",
            strengths: "個性・独自の視点",
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
        elmResultStrengths.textContent = data.strengths;
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
