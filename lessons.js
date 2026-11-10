/* ===== بيانات المنصة =====
   لإضافة درس: انسخ عنصر lesson واكتب كود فيديو يوتيوب في youtube
   أو اسم ملف الشرح المتحرك في explainer.
   الأسئلة بتتولد تلقائياً من MIX حسب المستوى.
*/

const LEVELS = {
  easy:   { label: "سهل",   timer: 20 },
  medium: { label: "متوسط", timer: 15 },
  hard:   { label: "صعب",   timer: 10 }
};

// mcq اختيار من متعدد | tf صح وغلط | tfr صح وغلط مع السبب | essay مقالي
const MIX = {
  easy:   [["mcq", 2], ["tf", 2]],
  medium: [["mcq", 3], ["tf", 2], ["essay", 2]],
  hard:   [["mcq", 3], ["essay", 3], ["tfr", 4]],
  unit:   [["mcq", 4], ["tf", 2], ["essay", 2], ["tfr", 2]],
  test:   [["mcq", 4], ["tf", 3], ["essay", 3]]
};

/* ---------- مولّد أسئلة المعادلتين الآنيتين ---------- */
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function sysValues() {
  const x = rnd(1, 9), y = rnd(1, 9);
  return { x: x, y: y, S: x + y, D: x - y };
}

function mcqEq(v) {
  const which = Math.random() < 0.5 ? "x" : "y";
  const ans = v[which];
  const opts = new Set([ans]);
  while (opts.size < 4) opts.add(Math.abs(ans + rnd(-3, 3)));
  const choices = shuffle([...opts]);
  return {
    type: "mcq",
    q: "إذا كان س + ص = " + v.S + " و س − ص = " + v.D + "، فما قيمة " + (which === "x" ? "س" : "ص") + "؟",
    choices: choices.map(String),
    answer: choices.indexOf(ans),
    explain: "بالجمع: ٢س = " + (v.S + v.D) + "، ومنها س = " + v.x + "، ثم ص = " + v.y + "."
  };
}

function tfEq(v) {
  const truth = Math.random() < 0.5;
  const which = Math.random() < 0.5 ? "x" : "y";
  const val = truth ? v[which] : v[which] + (Math.random() < 0.5 ? 1 : -1);
  return {
    type: "tf",
    q: "إذا كان س + ص = " + v.S + " و س − ص = " + v.D + "، فإن " + (which === "x" ? "س" : "ص") + " = " + val + ".",
    answer: truth,
    explain: "الحل الصحيح: س = " + v.x + "، ص = " + v.y + "."
  };
}

function essayEq(v) {
  return {
    type: "essay",
    q: "حل نظام المعادلتين: س + ص = " + v.S + " ، س − ص = " + v.D + "، واكتب خطوات الحل.",
    model: "بالجمع: ٢س = " + (v.S + v.D) + "، إذن س = " + v.x + ". بالتعويض في المعادلة الأولى: " + v.x + " + ص = " + v.S + "، إذن ص = " + v.y + ". الحل: (" + v.x + "، " + v.y + ")."
  };
}

function tfrEq(v) {
  const truth = Math.random() < 0.5;
  const pt = truth ? [v.x, v.y] : [v.x + 1, v.y - 1];
  const reason = truth
    ? "نعوّض: " + pt[0] + " + " + pt[1] + " = " + v.S + " ✓ و " + pt[0] + " − " + pt[1] + " = " + v.D + " ✓، فالنقطة تحقق المعادلتين."
    : "نعوّض في المعادلة الثانية: " + pt[0] + " − " + pt[1] + " = " + (pt[0] - pt[1]) + " وليس " + v.D + "، فالنقطة لا تحقق النظام.";
  return {
    type: "tfr",
    q: "النقطة (" + pt[0] + "، " + pt[1] + ") هي حل للنظام: س + ص = " + v.S + " ، س − ص = " + v.D + ".",
    answer: truth,
    reason: reason
  };
}

const BUILD = { mcq: mcqEq, tf: tfEq, essay: essayEq, tfr: tfrEq };

const GENERATORS = {
  equations: function (key) {
    const out = [];
    MIX[key].forEach(function (pair) {
      for (let i = 0; i < pair[1]; i++) out.push(BUILD[pair[0]](sysValues()));
    });
    return shuffle(out);
  }
};

function getQuestions(item, key) {
  if (item.generator && GENERATORS[item.generator]) return GENERATORS[item.generator](key);
  return (item.questions && item.questions[key]) || [];
}

/* ---------- المنهج ---------- */
const CURRICULUM = {
  grades: [
    {
      id: "9",
      name: "الصف التاسع",
      subjects: [
        {
          id: "math", name: "الرياضيات", icon: "📐",
          terms: [
            {
              id: "1", name: "الفصل الدراسي الأول",
              lessons: [
                {
                  id: "simul-eq",
                  title: "حل المعادلتين الآنيتين",
                  explainer: "lesson-simultaneous-equations.html",
                  generator: "equations"
                }
              ],
              unitActivity: { id: "math-t1-unit", title: "أنشطة تمايز نهاية الوحدة", timer: 20, generator: "equations" },
              tests: [
                { id: "math-t1-test", title: "اختبار نهاية الوحدة الأولى", timer: 30, generator: "equations" }
              ]
            },
            { id: "2", name: "الفصل الدراسي الثاني", lessons: [], tests: [] }
          ]
        },
        {
          id: "science", name: "العلوم", icon: "🧪",
          terms: [
            { id: "1", name: "الفصل الدراسي الأول", lessons: [], tests: [] },
            { id: "2", name: "الفصل الدراسي الثاني", lessons: [], tests: [] }
          ]
        }
      ]
    }
  ]
};
      
